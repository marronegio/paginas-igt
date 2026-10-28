/* ==========================================================================
   Black MBA · Turma Fundadora — Captação (revelação ao vivo 24/11, 20h)
   Página de captura: CTA -> popup (nome + e-mail + WhatsApp) -> webhooks
   -> /obrigado/ (Grupo VIP no WhatsApp)

   O popup segue o padrão da README §5: mesma estrutura de overlay + modal com
   os dois estados irmãos, abertura/fechamento por delegação `data-action`,
   três saídas (X, overlay e Esc), 3 campos, DDI com bandeiras e máscara BR.
   A diferença é o destino: aqui não há checkout, o submit leva à /obrigado/.

   Editou este arquivo? Incremente o ?v= no <script> do index.html. (§10.2)
   ========================================================================== */

(function () {
  'use strict';

  /* ----------------------------------------------------------------------
     CONFIGURAÇÃO DA AÇÃO  (README §11 — é só isto que muda entre ações)
     ---------------------------------------------------------------------- */

  // Revelação da condição, ao vivo. SEMPRE com -03:00.
  var REVEAL_DATE = '2026-11-24T20:00:00-03:00';

  // Destino após a captura. Recebe as UTMs repassadas.
  var THANK_YOU_URL = '../obrigado/';

  // Uma URL com COLE-AQUI é pulada no envio (proteção para ações novas).
  var WEBHOOKS = [
    // IGT / n8n: devolve headers CORS, aceita application/json.
    { url: 'https://webhook.igtcoaching.com.br/webhook/d464fc81-f53a-497d-a3a4-01bdc63c112a',
      mode: 'cors', ct: 'application/json' },

    // Clint: sem CORS no preflight -> "simple request" (text/plain + no-cors).
    { url: 'https://functions-api.clint.digital/endpoints/integration/webhook/67e4cc95-6c7c-44dc-84a0-5b5837a3f968',
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

  function $(sel)    { return document.querySelector(sel); }
  function $all(sel) { return Array.prototype.slice.call(document.querySelectorAll(sel)); }

  var overlay, modalForm, modalSuccess;

  /* ----------------------------------------------------------------------
     Contador até a revelação (topo da página)
     ---------------------------------------------------------------------- */

  function initCountdown() {
    var parts = {
      d: $('[data-count="d"]'),
      h: $('[data-count="h"]'),
      m: $('[data-count="m"]'),
      s: $('[data-count="s"]')
    };
    if (!parts.d) return;

    var target = new Date(REVEAL_DATE).getTime();
    var pad = function (n) { return (n < 10 ? '0' : '') + n; };
    var timer = null;

    function tick() {
      var left = Math.max(0, Math.floor((target - Date.now()) / 1000));
      parts.d.textContent = pad(Math.floor(left / 86400));
      parts.h.textContent = pad(Math.floor(left % 86400 / 3600));
      parts.m.textContent = pad(Math.floor(left % 3600 / 60));
      parts.s.textContent = pad(left % 60);
      if (left === 0 && timer) { clearInterval(timer); timer = null; }
    }

    tick();
    timer = setInterval(tick, 1000);
  }

  /* ----------------------------------------------------------------------
     Diagrama dos dois eixos: as molduras se juntam ao entrar na tela.
     O CSS só separa as molduras com html.mb-anim (script inline no <head>).
     ---------------------------------------------------------------------- */

  function initAxes() {
    window.mbAnim = true;
    var axes = $('.mb-axes');
    if (!axes || !document.documentElement.classList.contains('mb-anim')) return;

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        e.target.classList.add('is-in');
        io.unobserve(e.target);
      });
    }, { rootMargin: '0px 0px -25% 0px', threshold: 0 });

    io.observe(axes);
  }

  /* ----------------------------------------------------------------------
     Molduras da chamada final: a borda animada repinta a cada quadro, então
     só roda com a seção na tela (CSS: .mb-final.is-live).
     ---------------------------------------------------------------------- */

  function initLiveFrames() {
    var section = $('.mb-final');
    if (!section) return;
    if (!('IntersectionObserver' in window)) { section.classList.add('is-live'); return; }

    new IntersectionObserver(function (entries) {
      section.classList.toggle('is-live', entries[0].isIntersecting);
    }).observe(section);
  }

  /* ----------------------------------------------------------------------
     Abrir / fechar o popup (README §5.2)
     ---------------------------------------------------------------------- */

  function openCheckout() {
    modalForm.hidden = false;      // sempre reseta para o estado de formulário
    modalSuccess.hidden = true;
    overlay.hidden = false;
    document.body.classList.add('mb-locked');

    state.lastFocus = document.activeElement;
    var first = $('#in-nome');
    if (first) first.focus();
  }

  function closeCheckout() {
    if (overlay.hidden) return;
    overlay.hidden = true;
    document.body.classList.remove('mb-locked');
    if (state.lastFocus && state.lastFocus.focus) state.lastFocus.focus();
  }

  /* Tab não escapa do modal enquanto ele está aberto. */
  function trapTab(ev) {
    var focusables = $all('#checkout button, #checkout input, #checkout select, #checkout a[href]')
      .filter(function (el) { return !el.disabled && el.offsetParent !== null; });
    if (!focusables.length) return;

    var first = focusables[0];
    var last  = focusables[focusables.length - 1];

    if (ev.shiftKey && document.activeElement === first) {
      ev.preventDefault();
      last.focus();
    } else if (!ev.shiftKey && document.activeElement === last) {
      ev.preventDefault();
      first.focus();
    }
  }

  /* ----------------------------------------------------------------------
     Máscara (XX) XXXXX-XXXX — só Brasil (README §5.4)
     ---------------------------------------------------------------------- */

  /* Dígitos nacionais de um número BR: sem o 0 de interurbano e sem o 55 que
     vem junto quando o lead cola o número completo. Sem isto o telefone sai
     com dígito a mais e o CRM, ao normalizar, entrega um número quebrado. */
  function digitsBr(raw) {
    var d = raw.replace(/\D/g, '');
    d = d.replace(/^0+/, '');                                  // 0 de longa distância
    if (d.length > 11 && d.indexOf('55') === 0) d = d.slice(2); // colado com DDI
    return d.slice(0, 11);
  }

  function formatBrPhone(raw) {
    var d = digitsBr(raw);
    if (d.length === 0)  return '';
    if (d.length <= 2)   return '(' + d;
    if (d.length <= 6)   return '(' + d.slice(0, 2) + ') ' + d.slice(2);
    // 10 dígitos = fixo (XXXX-XXXX); 11 = celular (XXXXX-XXXX)
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
      return baseUrl;   // qualquer erro: segue o fluxo mesmo assim
    }
  }

  /* ----------------------------------------------------------------------
     Validação
     ---------------------------------------------------------------------- */

  function isEmail(v) { return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim()); }

  function digitsOf(v) { return v.replace(/\D/g, ''); }

  /* Dígitos que seguem para o CRM. Autofill do navegador não dispara `input`,
     então a máscara pode não ter passado por aqui — normaliza no submit também. */
  function nationalDigits(v) {
    return state.country === 'BR' ? digitsBr(v) : digitsOf(v);
  }

  function setInvalid(el, invalid) {
    if (invalid) el.setAttribute('aria-invalid', 'true');
    else el.removeAttribute('aria-invalid');
  }

  function validate(fields) {
    var firstBad = null;
    var errors   = [];

    if (fields.nome.value.trim().length < 2) {
      errors.push([fields.nome, 'Digite seu nome completo.']);
    }
    if (!isEmail(fields.email.value)) {
      errors.push([fields.email, 'Digite um e-mail válido.']);
    }

    var d = nationalDigits(fields.phone.value);
    var phoneOk = state.country === 'BR' ? (d.length === 10 || d.length === 11) : d.length >= 6;
    if (!phoneOk) {
      errors.push([fields.phone, state.country === 'BR'
        ? 'Digite o WhatsApp com DDD.'
        : 'Digite seu número de telefone.']);
    }

    // limpa tudo e reaplica só o que falhou
    [fields.nome, fields.email, fields.phone].forEach(function (el) { setInvalid(el, false); });
    $all('.mb-error').forEach(function (el) { el.hidden = true; el.textContent = ''; });

    errors.forEach(function (pair) {
      var el  = pair[0];
      var msg = pair[1];
      setInvalid(el, true);
      var box = document.getElementById('err-' + el.name);
      if (box) { box.textContent = msg; box.hidden = false; }
      if (!firstBad) firstBad = el;
    });

    if (firstBad) firstBad.focus();
    return errors.length === 0;
  }

  /* ----------------------------------------------------------------------
     Submit: webhooks (fire-and-forget) + redirect (README §7.3)
     ---------------------------------------------------------------------- */

  function submitForm(fields, button) {
    if (state.sending) return false;          // false = não enviou
    if (!validate(fields)) return false;

    state.sending = true;
    button.setAttribute('aria-busy', 'true');
    button.disabled = true;
    var label = $('#cta-label');
    if (label) label.textContent = 'Enviando…';

    var country  = COUNTRIES.filter(function (c) { return c.code === state.country; })[0] || COUNTRIES[0];
    var raw      = fields.phone.value.trim();
    var masked   = state.country === 'BR' ? formatBrPhone(raw) : raw;
    var onlyNums = country.dial.replace(/\D/g, '') + nationalDigits(raw);
    var now      = new Date();
    var pad      = function (n) { return (n < 10 ? '0' : '') + n; };

    var payload = {
      nome:         fields.nome.value.trim(),
      email:        fields.email.value.trim(),
      whatsapp:     country.dial + ' ' + masked,
      telefone:     '+' + onlyNums,

      // Espelhos para o mapeamento da Clint, que espera `name` / `phone`.
      // Os campos acima continuam intactos para o n8n (README §7.2).
      name:         fields.nome.value.trim(),
      phone:        '+' + onlyNums,

      utm_campaign: '',
      utm_medium:   '',
      utm_source:   '',
      utm_content:  '',
      utm_term:     '',
      data:         pad(now.getDate()) + '/' + pad(now.getMonth() + 1) + '/' + now.getFullYear()
    };

    var params = new URLSearchParams(window.location.search);
    payload.utm_campaign = params.get('utm_campaign') || '';
    payload.utm_medium   = params.get('utm_medium')   || '';
    payload.utm_source   = params.get('utm_source')   || '';
    payload.utm_content  = params.get('utm_content')  || '';
    payload.utm_term     = params.get('utm_term')     || '';

    var body = JSON.stringify(payload);

    WEBHOOKS.forEach(function (wh) {
      if (wh.url.indexOf('COLE-AQUI') !== -1) return;   // UUID ainda não configurado
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

    // O sucesso é feedback caso o redirect demore — nunca uma tela final
    // da qual o usuário precise sair sozinho (README §5.5).
    modalForm.hidden = true;
    modalSuccess.hidden = false;

    window.location.href = withForwardedParams(THANK_YOU_URL);
    return true;
  }

  /* ----------------------------------------------------------------------
     Init
     ---------------------------------------------------------------------- */

  function init() {
    initCountdown();
    initAxes();
    initLiveFrames();

    var form = $('#capture-form');
    if (!form) return;

    overlay      = $('#checkout');
    modalForm    = $('#modal-form');
    modalSuccess = $('#modal-success');

    var fields = {
      nome:  $('#in-nome'),
      email: $('#in-email'),
      phone: $('#phone-input')
    };
    var button = $('#capture-cta');
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

    /* Central de Links (README §8): o rastreador só conta `lead` se o submit
       não foi cancelado. Por isso aqui só se cancela o envio inválido; o válido
       é cancelado no document, depois que o rastreador já o viu. */
    form.addEventListener('submit', function (ev) {
      if (!submitForm(fields, button)) ev.preventDefault();
    });
    document.addEventListener('submit', function (ev) {
      if (ev.target === form) ev.preventDefault();   // o navegador nunca envia o form de verdade
    });

    /* Delegação por atributo: N botões podem abrir o mesmo modal sem duplicar
       código — some quantos CTAs a copy pedir, sem tocar no JS. (README §5.2) */
    $all('[data-action]').forEach(function (el) {
      el.addEventListener('click', function (ev) {
        var a = el.getAttribute('data-action');
        if      (a === 'openCheckout')  openCheckout();
        else if (a === 'closeCheckout') closeCheckout();
        else if (a === 'overlayClose')  { if (ev.target === overlay) closeCheckout(); } // só o clique no fundo
      });
    });

    document.addEventListener('keydown', function (ev) {
      if (overlay.hidden) return;
      if (ev.key === 'Escape') closeCheckout();
      else if (ev.key === 'Tab') trapTab(ev);
    });

    /* Volta pelo botão "voltar" do navegador (bfcache): a página pode reaparecer
       com o modal no estado de sucesso e o botão travado. Reabre limpa. */
    window.addEventListener('pageshow', function (ev) {
      if (!ev.persisted) return;
      state.sending = false;
      button.disabled = false;
      button.removeAttribute('aria-busy');
      var label = $('#cta-label');
      if (label) label.textContent = 'Continuar para o Grupo VIP';
      closeCheckout();
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
