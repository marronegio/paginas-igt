/* ==========================================================================
   A Black do Coaching — Captação "ao vivo" (live de 9/11, 20h, no Zoom)
   CTA -> popup (nome + e-mail + WhatsApp) -> webhooks -> link do Zoom.
   Sem página de obrigado e sem grupo: o lead cai direto na live.

   O popup é o da captação da Black (README §5): overlay + modal com dois
   estados irmãos, delegação `data-action`, três saídas (X, overlay e Esc),
   3 campos, DDI com bandeiras e máscara BR.

   Este arquivo é IGUAL em ao-vivo-v1/ e ao-vivo-v2/: mudou num, copie no outro.
   Editou este arquivo? Incremente o ?v= no <script> do index.html. (§10.2)
   ========================================================================== */

(function () {
  'use strict';

  /* ----------------------------------------------------------------------
     CONFIGURAÇÃO DA AÇÃO  (README §11 — é só isto que muda entre ações)
     ---------------------------------------------------------------------- */

  // Sala do Zoom, pelo encurtador da IGT. Vazio = o lead vê "Abrindo o Zoom…"
  // e não sai da página (o console avisa).
  var ZOOM_URL = 'https://links.igtcoaching.com.br/black-do-coaching-nov26-link-zoom';

  // Os mesmos da captação da Black (oportunidade-v1a/b/c).
  var WEBHOOKS = [
    // IGT / n8n: devolve headers CORS, aceita application/json.
    { url: 'https://webhook.igtcoaching.com.br/webhook/084478b2-e299-46ee-9c15-aad4ae257c5e',
      mode: 'cors', ct: 'application/json' },

    // Clint: sem CORS no preflight -> "simple request" (text/plain + no-cors).
    { url: 'https://functions-api.clint.digital/endpoints/integration/webhook/493787e9-05b4-4441-878f-1855feaed38b',
      mode: 'no-cors', ct: 'text/plain;charset=UTF-8' }
  ];

  // Início da live: vem do <script> do <head> (window.AV_LIVE_AT), que já
  // usa a mesma data para a página nascer no estado certo.
  var LIVE_AT = Date.parse(window.AV_LIVE_AT || '2026-11-09T20:00:00-03:00');

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
  function pad(n)    { return (n < 10 ? '0' : '') + n; }

  var overlay, modalForm, modalSuccess;

  /* ----------------------------------------------------------------------
     Temporizador
     Antes das 20h: "A live começa em HH:MM:SS". Na virada, html.av-live
     troca para a lâmpada + ESTAMOS AO VIVO (o CSS cuida da troca).
     ---------------------------------------------------------------------- */

  function clockHtml(text) {
    return text.split('').map(function (c) {
      return c === ':'
        ? '<span class="av-clock__sep">:</span>'
        : '<span class="av-d">' + c + '</span>';
    }).join('');
  }

  function goLive(now) {
    var root = document.documentElement;
    if (root.classList.contains('av-live')) return;
    root.classList.add('av-live');
    if (now) root.classList.add('av-going-live');   // virou com a página aberta
  }

  function initTimer() {
    var clocks = $all('[data-clock]');

    function tick() {
      var left = LIVE_AT - Date.now();
      if (isNaN(left) || left <= 0) { goLive(true); return; }

      var total = Math.ceil(left / 1000);            // mostra 00:00:01 e vira
      var text  = pad(Math.floor(total / 3600)) + ':' +
                  pad(Math.floor(total % 3600 / 60)) + ':' +
                  pad(total % 60);
      var html  = clockHtml(text);

      clocks.forEach(function (el) {
        if (el.getAttribute('aria-label') === text) return;
        el.innerHTML = html;
        el.setAttribute('aria-label', text);
      });

      // acorda na próxima virada de segundo
      setTimeout(tick, (left % 1000 || 1000) + 15);
    }

    if (document.documentElement.classList.contains('av-live')) return;
    tick();
  }

  /* ----------------------------------------------------------------------
     Abrir / fechar o popup (README §5.2)
     ---------------------------------------------------------------------- */

  function openCheckout() {
    modalForm.hidden = false;      // sempre reseta para o estado de formulário
    modalSuccess.hidden = true;
    overlay.hidden = false;
    document.body.classList.add('av-locked');

    state.lastFocus = document.activeElement;
    var first = $('#in-nome');
    if (first) first.focus();
  }

  function closeCheckout() {
    if (overlay.hidden) return;
    overlay.hidden = true;
    document.body.classList.remove('av-locked');
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
     Repasse de UTMs para o link do Zoom (README §6.1 / §6.4)
     O link é do encurtador da IGT: com as UTMs, ele registra de onde veio
     o clique. Mesma regra da obrigado: tudo passa, menos o xcod (legado da VK).
     ---------------------------------------------------------------------- */

  function withForwardedParams(baseUrl) {
    try {
      var target   = new URL(baseUrl, window.location.href);
      var incoming = new URLSearchParams(window.location.search);

      incoming.forEach(function (value, key) {
        if (key === 'xcod') return;
        if (!target.searchParams.has(key)) target.searchParams.append(key, value); // não sobrescreve o link
      });

      return target.toString();
    } catch (e) {
      return baseUrl;   // qualquer erro: manda pro Zoom mesmo assim
    }
  }

  /* ----------------------------------------------------------------------
     Máscara (XX) XXXXX-XXXX — só Brasil (README §5.4)
     ---------------------------------------------------------------------- */

  /* Dígitos nacionais de um número BR: sem o 0 de interurbano e sem o 55 que
     vem junto quando o lead cola o número completo. */
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
    $all('.av-error').forEach(function (el) { el.hidden = true; el.textContent = ''; });

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
     Submit: webhooks (fire-and-forget) + Zoom (README §7.3)
     ---------------------------------------------------------------------- */

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
      // Os campos acima continuam intactos para o n8n (README §7.2).
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

    // O sucesso é feedback caso o Zoom demore a abrir (README §5.5).
    modalForm.hidden = true;
    modalSuccess.hidden = false;

    if (ZOOM_URL) window.location.href = withForwardedParams(ZOOM_URL);
    else if (window.console) console.error('ZOOM_URL vazio no app.js: o lead não foi levado ao Zoom.');
    return true;
  }

  /* ----------------------------------------------------------------------
     Init
     ---------------------------------------------------------------------- */

  function init() {
    initTimer();

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
       código. (README §5.2) */
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

    /* Voltou do Zoom pelo "voltar" do navegador (bfcache): a página volta
       como ficou, com o botão travado. Destrava. */
    window.addEventListener('pageshow', function (ev) {
      if (!ev.persisted) return;
      state.sending = false;
      button.removeAttribute('aria-busy');
      button.disabled = false;
      closeCheckout();
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
