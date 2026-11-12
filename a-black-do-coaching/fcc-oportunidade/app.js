/* ==========================================================================
   FCC · A Black do Coaching — Página de vendas
   CTA -> popup (nome + e-mail + WhatsApp) -> webhooks -> checkout

   O popup segue o padrão da README §5: overlay + modal com os dois estados
   irmãos, abertura/fechamento por delegação `data-action`, três saídas
   (X, overlay e Esc), 3 campos, DDI com bandeiras e máscara BR.

   Datas das fases (faixa do contador e banners de bônus): <script> no <head>
   do index.html (window.FC_FASES), para a página já nascer na fase certa.

   Editou este arquivo? Incremente o ?v= no <script> do index.html. (§10.2)
   ========================================================================== */

(function () {
  'use strict';

  /* ----------------------------------------------------------------------
     CONFIGURAÇÃO DA AÇÃO  (README §11 — é só isto que muda entre ações)
     ---------------------------------------------------------------------- */

  // Checkout (Hotmart) da condição da Black. Os parâmetros da LP (UTMs etc.) são
  // somados a este link; os que já estão aqui (off, split, sck...) não são trocados.
  var CHECKOUT_URL = 'https://pay.hotmart.com/D108011000U?off=2sbtx5ep&split=12&checkoutMode=10&hidewallet=1&sck=is-atendimentoXX';

  // Enquanto CHECKOUT_URL estiver vazio, o popup leva ao time comercial
  // (mesmo destino da LP anterior da FCC), para nenhum lead ficar sem saída.
  var FALLBACK_URL = 'https://links.igtcoaching.com.br/fale-com-o-comercial';

  // Webhook com "{" na URL é ignorado (UUID não configurado).
  var WEBHOOKS = [
    // IGT / n8n: devolve headers CORS, aceita application/json.
    { url: 'https://webhook.igtcoaching.com.br/webhook/ef6e93db-413a-4f3d-b142-54bb95dfe037',
      mode: 'cors', ct: 'application/json' },

    // Clint: sem CORS no preflight -> "simple request" (text/plain + no-cors).
    { url: 'https://functions-api.clint.digital/endpoints/integration/webhook/edbf5997-a323-473d-8de5-5600314000b5',
      mode: 'no-cors', ct: 'text/plain;charset=UTF-8' }
  ];

  /* ----------------------------------------------------------------------
     Constantes (README §11 — não mudam entre ações)
     ---------------------------------------------------------------------- */

  var COUNTRIES = [
    { code: 'BR', dial: '+55',  flag: '🇧🇷' },
    { code: 'US', dial: '+1',   flag: '🇺🇸' },
    { code: 'PT', dial: '+351', flag: '🇵🇹' },
    { code: 'AR', dial: '+54',  flag: '🇦🇷' },
    { code: 'PY', dial: '+595', flag: '🇵🇾' },
    { code: 'UY', dial: '+598', flag: '🇺🇾' },
    { code: 'CL', dial: '+56',  flag: '🇨🇱' },
    { code: 'BO', dial: '+591', flag: '🇧🇴' },
    { code: 'PE', dial: '+51',  flag: '🇵🇪' },
    { code: 'CO', dial: '+57',  flag: '🇨🇴' },
    { code: 'VE', dial: '+58',  flag: '🇻🇪' },
    { code: 'EC', dial: '+593', flag: '🇪🇨' },
    { code: 'MX', dial: '+52',  flag: '🇲🇽' },
    { code: 'CR', dial: '+506', flag: '🇨🇷' },
    { code: 'PA', dial: '+507', flag: '🇵🇦' },
    { code: 'GT', dial: '+502', flag: '🇬🇹' },
    { code: 'DO', dial: '+1809',flag: '🇩🇴' },
    { code: 'CU', dial: '+53',  flag: '🇨🇺' },
    { code: 'ES', dial: '+34',  flag: '🇪🇸' },
    { code: 'IT', dial: '+39',  flag: '🇮🇹' },
    { code: 'FR', dial: '+33',  flag: '🇫🇷' },
    { code: 'DE', dial: '+49',  flag: '🇩🇪' },
    { code: 'GB', dial: '+44',  flag: '🇬🇧' },
    { code: 'IE', dial: '+353', flag: '🇮🇪' },
    { code: 'CH', dial: '+41',  flag: '🇨🇭' },
    { code: 'NL', dial: '+31',  flag: '🇳🇱' },
    { code: 'BE', dial: '+32',  flag: '🇧🇪' },
    { code: 'LU', dial: '+352', flag: '🇱🇺' },
    { code: 'CA', dial: '+1',   flag: '🇨🇦' },
    { code: 'AU', dial: '+61',  flag: '🇦🇺' },
    { code: 'NZ', dial: '+64',  flag: '🇳🇿' },
    { code: 'JP', dial: '+81',  flag: '🇯🇵' },
    { code: 'AE', dial: '+971', flag: '🇦🇪' },
    { code: 'IL', dial: '+972', flag: '🇮🇱' },
    { code: 'ZA', dial: '+27',  flag: '🇿🇦' },
    { code: 'AO', dial: '+244', flag: '🇦🇴' }
  ];

  var state = { country: 'BR', sending: false, lastFocus: null };
  var root  = document.documentElement;

  function $(sel, ctx)    { return (ctx || document).querySelector(sel); }
  function $all(sel, ctx) { return Array.prototype.slice.call((ctx || document).querySelectorAll(sel)); }
  function pad(n)         { return (n < 10 ? '0' : '') + n; }

  function lockScroll(on) { document.body.classList.toggle('fc-locked', on); }

  /* Tab não escapa do diálogo aberto. */
  function trapTab(ev, box) {
    var focusables = $all('button, input, select, a[href], iframe', box)
      .filter(function (el) { return !el.disabled && el.offsetParent !== null; });
    if (!focusables.length) return;
    var first = focusables[0];
    var last  = focusables[focusables.length - 1];
    if (ev.shiftKey && document.activeElement === first) { ev.preventDefault(); last.focus(); }
    else if (!ev.shiftKey && document.activeElement === last) { ev.preventDefault(); first.focus(); }
  }

  /* ----------------------------------------------------------------------
     Contador do bônus: até 23h59 de hoje (horário de Brasília).
     Troca de fase sozinho à meia-noite, com a página aberta.
     ---------------------------------------------------------------------- */

  var BRT_OFFSET = 3 * 3600 * 1000;

  function nextMidnightBRT(t) {
    var b = new Date(t - BRT_OFFSET);   // campos UTC = relógio de Brasília
    return Date.UTC(b.getUTCFullYear(), b.getUTCMonth(), b.getUTCDate() + 1) + BRT_OFFSET;
  }

  function currentPhase() {
    return typeof window.fcFase === 'function' ? window.fcFase() : 1;
  }

  function initClock() {
    var h = $('[data-clock="h"]'), m = $('[data-clock="m"]'), s = $('[data-clock="s"]');
    var phase = currentPhase();
    var timer = null;

    function setPhase(p) {
      if (p === phase) return;
      root.classList.remove('fc-p' + phase);
      root.classList.add('fc-p' + p);
      phase = p;
    }

    function tick() {
      var now = Date.now();
      setPhase(currentPhase());
      if (phase === 3) { if (timer) clearInterval(timer); return; }
      if (!h) return;
      var left = Math.max(0, Math.floor((nextMidnightBRT(now) - now) / 1000));
      h.textContent = pad(Math.floor(left / 3600));
      m.textContent = pad(Math.floor((left % 3600) / 60));
      s.textContent = pad(left % 60);
    }

    tick();
    if (phase !== 3) timer = setInterval(tick, 1000);
  }

  /* ----------------------------------------------------------------------
     Máscara (XX) XXXXX-XXXX — só Brasil (README §5.4)
     ---------------------------------------------------------------------- */

  /* Dígitos nacionais de um número BR: sem o 0 de interurbano e sem o 55 que
     vem junto quando o lead cola o número completo. */
  function digitsBr(raw) {
    var d = raw.replace(/\D/g, '');
    d = d.replace(/^0+/, '');
    if (d.length > 11 && d.indexOf('55') === 0) d = d.slice(2);
    return d.slice(0, 11);
  }

  function formatBrPhone(raw) {
    var d = digitsBr(raw);
    if (d.length === 0)  return '';
    if (d.length <= 2)   return '(' + d;
    if (d.length <= 6)   return '(' + d.slice(0, 2) + ') ' + d.slice(2);
    if (d.length <= 10)  return '(' + d.slice(0, 2) + ') ' + d.slice(2, 6) + '-' + d.slice(6);
    return '(' + d.slice(0, 2) + ') ' + d.slice(2, 7) + '-' + d.slice(7);
  }

  /* ----------------------------------------------------------------------
     Repasse de UTMs (README §6.1)
     ---------------------------------------------------------------------- */

  function withForwardedParams(baseUrl) {
    try {
      var target   = new URL(baseUrl, window.location.href);
      var incoming = new URLSearchParams(window.location.search);

      // repassa TODOS os parâmetros da LP, sem lista branca
      incoming.forEach(function (value, key) {
        if (!target.searchParams.has(key)) target.searchParams.append(key, value);
      });

      return target.toString();
    } catch (e) {
      return baseUrl;   // qualquer erro: manda pro checkout mesmo assim
    }
  }

  /* Checkout com UTMs + nome e e-mail pré-preenchidos (Hotmart lê `name` e `email`). */
  function checkoutTarget(fields) {
    if (!CHECKOUT_URL) return withForwardedParams(FALLBACK_URL);
    var url = withForwardedParams(CHECKOUT_URL);
    try {
      var u = new URL(url);
      if (!u.searchParams.has('name'))  u.searchParams.set('name', fields.nome.value.trim());
      if (!u.searchParams.has('email')) u.searchParams.set('email', fields.email.value.trim());
      return u.toString();
    } catch (e) {
      return url;
    }
  }

  /* ----------------------------------------------------------------------
     Validação
     ---------------------------------------------------------------------- */

  function isEmail(v) { return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim()); }
  function digitsOf(v) { return v.replace(/\D/g, ''); }

  /* Autofill do navegador não dispara `input`: normaliza no submit também. */
  function nationalDigits(v) {
    return state.country === 'BR' ? digitsBr(v) : digitsOf(v);
  }

  function setInvalid(el, invalid) {
    if (invalid) el.setAttribute('aria-invalid', 'true');
    else el.removeAttribute('aria-invalid');
  }

  function validate(fields) {
    var errors = [];

    if (fields.nome.value.trim().length < 2) errors.push([fields.nome, 'Digite seu nome completo.']);
    if (!isEmail(fields.email.value))        errors.push([fields.email, 'Digite um e-mail válido.']);

    var d = nationalDigits(fields.phone.value);
    var phoneOk = state.country === 'BR' ? (d.length === 10 || d.length === 11) : d.length >= 6;
    if (!phoneOk) {
      errors.push([fields.phone, state.country === 'BR'
        ? 'Digite o WhatsApp com DDD.'
        : 'Digite seu número de telefone.']);
    }

    [fields.nome, fields.email, fields.phone].forEach(function (el) { setInvalid(el, false); });
    $all('.fc-error').forEach(function (el) { el.hidden = true; el.textContent = ''; });

    errors.forEach(function (pair) {
      setInvalid(pair[0], true);
      var box = document.getElementById('err-' + pair[0].name);
      if (box) { box.textContent = pair[1]; box.hidden = false; }
    });

    if (errors.length) errors[0][0].focus();
    return errors.length === 0;
  }

  /* ----------------------------------------------------------------------
     Popup pré-checkout (README §5.2)
     ---------------------------------------------------------------------- */

  var overlay, modalForm, modalSuccess;

  function openCheckout() {
    modalForm.hidden = false;      // sempre reseta para o estado de formulário
    modalSuccess.hidden = true;
    overlay.hidden = false;
    lockScroll(true);
    state.lastFocus = document.activeElement;
    var first = $('#in-nome');
    if (first) first.focus();
  }

  function closeCheckout() {
    if (overlay.hidden) return;
    overlay.hidden = true;
    lockScroll(false);
    if (state.lastFocus && state.lastFocus.focus) state.lastFocus.focus();
  }

  /* Submit: webhooks (fire-and-forget) + redirect (README §7.3) */
  function submitForm(fields, button) {
    if (state.sending) return false;          // false = não enviou
    if (!validate(fields)) return false;

    state.sending = true;
    button.setAttribute('aria-busy', 'true');
    button.disabled = true;

    var country  = COUNTRIES.filter(function (c) { return c.code === state.country; })[0] || COUNTRIES[0];
    var raw      = fields.phone.value.trim();
    var masked   = state.country === 'BR' ? formatBrPhone(raw) : raw;
    var onlyNums = country.dial.replace(/\D/g, '') + nationalDigits(raw);
    var now      = new Date();
    var params   = new URLSearchParams(window.location.search);

    var payload = {
      nome:         fields.nome.value.trim(),
      email:        fields.email.value.trim(),
      whatsapp:     country.dial + ' ' + masked,
      telefone:     '+' + onlyNums,

      // Espelhos para o mapeamento da Clint, que espera `name` / `phone`.
      name:         fields.nome.value.trim(),
      phone:        '+' + onlyNums,

      utm_campaign: params.get('utm_campaign') || '',
      utm_medium:   params.get('utm_medium')   || '',
      utm_source:   params.get('utm_source')   || '',
      utm_content:  params.get('utm_content')  || '',
      utm_term:     params.get('utm_term')     || '',
      data:         pad(now.getDate()) + '/' + pad(now.getMonth() + 1) + '/' + now.getFullYear()
    };

    var body = JSON.stringify(payload);

    WEBHOOKS.forEach(function (wh) {
      if (wh.url.indexOf('{') !== -1) return;   // UUID ainda não configurado
      try {
        fetch(wh.url, {
          method: 'POST',
          mode: wh.mode,
          headers: { 'Content-Type': wh.ct },
          body: body,
          keepalive: true      // ESSENCIAL: a request sobrevive ao redirect abaixo
        }).catch(function () {});
      } catch (e) {}
    });

    // Feedback caso o redirect demore — nunca uma tela final (README §5.5).
    modalForm.hidden = true;
    modalSuccess.hidden = false;

    window.location.href = checkoutTarget(fields);
    return true;
  }

  function initCheckout() {
    var form = $('#checkout-form');
    if (!form) return;

    overlay      = $('#checkout');
    modalForm    = $('#modal-form');
    modalSuccess = $('#modal-success');

    var fields = { nome: $('#in-nome'), email: $('#in-email'), phone: $('#phone-input') };
    var button = $('#checkout-cta');
    var sel    = $('#country-select');

    COUNTRIES.forEach(function (c) {
      var o = document.createElement('option');
      o.value = c.code;
      o.textContent = c.flag + ' ' + c.dial;
      sel.appendChild(o);
    });
    sel.value = 'BR';

    sel.addEventListener('change', function () {
      state.country = sel.value;
      fields.phone.value = '';
      fields.phone.placeholder = sel.value === 'BR' ? '(00) 00000-0000' : 'Número de telefone';
    });

    fields.phone.addEventListener('input', function () {
      if (state.country === 'BR') fields.phone.value = formatBrPhone(fields.phone.value);
    });

    /* Central de Links (README §8.3): só o envio inválido é cancelado aqui;
       o válido é cancelado no document, depois que o rastreador já o viu. */
    form.addEventListener('submit', function (ev) {
      if (!submitForm(fields, button)) ev.preventDefault();
    });
    document.addEventListener('submit', function (ev) {
      if (ev.target === form) ev.preventDefault();   // o navegador nunca envia o form de verdade
    });

    /* Volta pela seta do navegador depois do redirect (bfcache): libera o botão. */
    window.addEventListener('pageshow', function (ev) {
      if (!ev.persisted) return;
      state.sending = false;
      button.disabled = false;
      button.removeAttribute('aria-busy');
      closeCheckout();
    });
  }

  /* ----------------------------------------------------------------------
     Vídeos dos cases (YouTube sem cookies, só carrega ao clicar)
     ---------------------------------------------------------------------- */

  var video, videoFrame, videoLastFocus = null;

  function openVideo(id, trigger) {
    if (!/^[\w-]{11}$/.test(id)) return;
    videoLastFocus = trigger || document.activeElement;
    videoFrame.innerHTML = '<iframe src="https://www.youtube-nocookie.com/embed/' + id +
      '?autoplay=1&rel=0&playsinline=1" title="Depoimento" allow="autoplay; encrypted-media; picture-in-picture; fullscreen" allowfullscreen></iframe>';
    video.hidden = false;
    lockScroll(true);
    var close = $('.fc-modal__close', video);
    if (close) close.focus();
  }

  function closeVideo() {
    if (!video || video.hidden) return;
    video.hidden = true;
    videoFrame.innerHTML = '';
    lockScroll(false);
    if (videoLastFocus && videoLastFocus.focus) videoLastFocus.focus();
  }

  /* ----------------------------------------------------------------------
     Perguntas frequentes (sanfona). Sem JS ficam todas abertas.
     ---------------------------------------------------------------------- */

  function initFaq() {
    var list = $('#faq');
    if (!list) return;
    list.classList.add('fc-faq--js');

    $all('.fc-faq__item', list).forEach(function (item, i) {
      var btn   = $('.fc-faq__q', item);
      var panel = $('.fc-faq__a', item);

      function set(open) {
        item.classList.toggle('is-open', open);
        btn.setAttribute('aria-expanded', open ? 'true' : 'false');
        panel.inert = !open;
      }

      set(i === 0);
      btn.addEventListener('click', function () { set(!item.classList.contains('is-open')); });
    });
  }

  /* ----------------------------------------------------------------------
     Animações de rolagem (só com html.fc-anim — ver <head>)
     Cada bloco aparece uma vez. O que já está acima da tela aparece direto.
     ---------------------------------------------------------------------- */

  function countUp(el) {
    var to  = parseInt(el.getAttribute('data-count'), 10);
    var dur = 1400;
    var t0  = null;
    el.textContent = '0';
    function step(ts) {
      if (t0 === null) t0 = ts;
      var p = Math.min(1, (ts - t0) / dur);
      el.textContent = Math.round(to * (1 - Math.pow(1 - p, 3)));
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  function initReveal() {
    window.fcReady = true;
    if (!root.classList.contains('fc-anim')) return;

    // grades: cada coluna entra um pouco depois da anterior
    $all('[data-stagger]').forEach(function (grid) {
      var cols = parseInt(grid.getAttribute('data-stagger'), 10) || 3;
      Array.prototype.forEach.call(grid.children, function (child, i) {
        child.style.setProperty('--d', ((i % cols) * 0.1) + 's');
      });
    });

    function show(el) {
      el.classList.add('is-in');
      var c = $('[data-count]', el);
      if (c) countUp(c);
    }

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting || e.boundingClientRect.top < 0) {
          show(e.target);
          io.unobserve(e.target);
        }
      });
    }, { rootMargin: '0px 0px -12% 0px', threshold: 0 });

    $all('[data-reveal]').forEach(function (el) { io.observe(el); });
  }

  /* ----------------------------------------------------------------------
     WhatsApp fixo: `fc-wa--wait` enquanto o CTA da hero está na tela ou
     ainda abaixo dela. Só o CSS do celular (≤ 680px) esconde o botão com
     essa classe, para ele não cobrir o CTA principal na primeira tela.
     ---------------------------------------------------------------------- */

  function initWhatsapp() {
    var wa  = $('.fc-wa');
    var cta = $('.fc-hero [data-action="openCheckout"]');
    if (!wa || !cta || !('IntersectionObserver' in window)) return;

    new IntersectionObserver(function (entries) {
      var e = entries[0];
      wa.classList.toggle('fc-wa--wait', e.isIntersecting || e.boundingClientRect.top > 0);
    }).observe(cta);
  }

  /* ----------------------------------------------------------------------
     Init
     ---------------------------------------------------------------------- */

  function init() {
    initReveal();
    initClock();
    initFaq();
    initCheckout();
    initWhatsapp();

    video      = $('#video');
    videoFrame = $('#video-frame');

    /* Delegação por atributo: N botões abrem o mesmo popup sem duplicar
       código — some quantos CTAs a copy pedir, sem tocar no JS. (README §5.2) */
    document.addEventListener('click', function (ev) {
      var el = ev.target.closest('[data-action], [data-yt]');
      if (!el) return;

      if (el.hasAttribute('data-yt')) { openVideo(el.getAttribute('data-yt'), el); return; }

      var a = el.getAttribute('data-action');
      if      (a === 'openCheckout')  { if (overlay) openCheckout(); }
      else if (a === 'closeCheckout') closeCheckout();
      else if (a === 'overlayClose')  { if (ev.target === overlay) closeCheckout(); }  // só o clique no fundo
      else if (a === 'closeVideo')    closeVideo();
      else if (a === 'videoOverlay')  { if (ev.target === video) closeVideo(); }
    });

    document.addEventListener('keydown', function (ev) {
      var open = overlay && !overlay.hidden ? overlay : (video && !video.hidden ? video : null);
      if (!open) return;
      if (ev.key === 'Escape') { if (open === overlay) closeCheckout(); else closeVideo(); }
      else if (ev.key === 'Tab') trapTab(ev, open);
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
