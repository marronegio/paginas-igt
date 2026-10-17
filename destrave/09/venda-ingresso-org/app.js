/* ==========================================================================
   Destrave 09 — Venda de ingresso (Orgânico)
   LP de venda: CTA -> popup (nome + e-mail + WhatsApp) -> webhooks
   -> checkout Hotmart (UTMs + xcod repassados)

   Segue o padrão da README §5–7. Editou este arquivo? Incremente o ?v= no
   <script> do index.html. (§10.2)
   ========================================================================== */

(function () {
  'use strict';

  /* ----------------------------------------------------------------------
     CONFIGURAÇÃO DA AÇÃO  (README §11 — é só isto que muda entre ações)
     ---------------------------------------------------------------------- */

  // TODO: trocar {PRODUTO}/{OFERTA} pelo link real da Hotmart antes de subir.
  // Datas ISO com -03:00; sem buraco entre o end de um lote e o start do próximo.
  var LOTES = [
    { num: 0, price: '39,90',
      start: '2026-10-01T00:00:00-03:00',
      end:   '2027-02-21T23:59:59-03:00',
      url:   'https://pay.hotmart.com/{PRODUTO}?off={OFERTA}&split=12&checkoutMode=10&hidewallet=1&sck=destrave09-org-lote0' }
  ];

  // TODO: UUIDs desta ação (pedir ao responsável por automação).
  var WEBHOOKS = [
    // IGT / n8n: devolve headers CORS, aceita application/json.
    { url: 'https://webhook.igtcoaching.com.br/webhook/{UUID-N8N-DA-ACAO}',
      mode: 'cors', ct: 'application/json' },

    // Clint: sem CORS no preflight -> "simple request" (text/plain + no-cors).
    { url: 'https://functions-api.clint.digital/endpoints/integration/webhook/{UUID-CLINT-DA-ACAO}',
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

  var state = { country: 'BR', sending: false, lastFocus: null, loteUrl: LOTES[0].url };

  function $(sel)    { return document.querySelector(sel); }
  function $all(sel) { return Array.prototype.slice.call(document.querySelectorAll(sel)); }

  var overlay, modalForm, modalSuccess;

  /* ----------------------------------------------------------------------
     Lote ativo pelo relógio do visitante (README §11)
     ---------------------------------------------------------------------- */

  function applyLote() {
    var now  = Date.now();
    var lote = LOTES.filter(function (l) {
      return now >= Date.parse(l.start) && now <= Date.parse(l.end);
    })[0] || LOTES[LOTES.length - 1];

    state.loteUrl = lote.url;
    $all('[data-lote="num"]').forEach(function (el)   { el.textContent = lote.num; });
    $all('[data-lote="price"]').forEach(function (el) { el.textContent = lote.price; });
  }

  function goOffer() {
    var target = $('#oferta');
    if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  /* ----------------------------------------------------------------------
     Abrir / fechar o popup (README §5.2)
     ---------------------------------------------------------------------- */

  function openCheckout() {
    modalForm.hidden = false;      // sempre reseta para o estado de formulário
    modalSuccess.hidden = true;
    overlay.hidden = false;
    document.body.classList.add('dv-locked');

    state.lastFocus = document.activeElement;
    var first = $('#in-nome');
    if (first) first.focus();
  }

  function closeCheckout() {
    if (overlay.hidden) return;
    overlay.hidden = true;
    document.body.classList.remove('dv-locked');
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

      // VK Metrics: identifica a venda com o anúncio Meta que originou o clique.
      var adId     = incoming.get('utm_content') || '';
      var vkSource = incoming.get('vk_source')   || 'paid_metaads';
      target.searchParams.set('xcod', JSON.stringify({ vid: adId, vsrc: vkSource, url: 'checkout', v: 1 }));

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
    $all('.dv-error').forEach(function (el) { el.hidden = true; el.textContent = ''; });

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
     Submit: webhooks (fire-and-forget) + redirect ao checkout (README §7.3)
     ---------------------------------------------------------------------- */

  function submitForm(fields, button) {
    if (state.sending) return;
    if (!validate(fields)) return;

    state.sending = true;
    button.setAttribute('aria-busy', 'true');
    button.disabled = true;
    var label = $('#cta-label');
    if (label) label.textContent = 'Indo para o pagamento…';

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

    window.location.href = withForwardedParams(state.loteUrl);
  }

  /* ----------------------------------------------------------------------
     Init
     ---------------------------------------------------------------------- */

  function init() {
    var form = $('#checkout-form');
    if (!form) return;

    overlay      = $('#checkout');
    modalForm    = $('#modal-form');
    modalSuccess = $('#modal-success');

    var fields = {
      nome:  $('#in-nome'),
      email: $('#in-email'),
      phone: $('#phone-input')
    };
    var button = $('#checkout-cta');
    var sel    = $('#country-select');

    applyLote();

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

    form.addEventListener('submit', function (ev) {
      ev.preventDefault();
      submitForm(fields, button);
    });

    /* Delegação por atributo: N botões podem abrir o mesmo modal sem duplicar
       código — some quantos CTAs a copy pedir, sem tocar no JS. (README §5.2) */
    $all('[data-action]').forEach(function (el) {
      el.addEventListener('click', function (ev) {
        var a = el.getAttribute('data-action');
        if      (a === 'goOffer')       { ev.preventDefault(); goOffer(); }
        else if (a === 'openCheckout')  openCheckout();
        else if (a === 'closeCheckout') closeCheckout();
        else if (a === 'overlayClose')  { if (ev.target === overlay) closeCheckout(); } // só o clique no fundo
      });
    });

    document.addEventListener('keydown', function (ev) {
      if (overlay.hidden) return;
      if (ev.key === 'Escape') closeCheckout();
      else if (ev.key === 'Tab') trapTab(ev);
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
