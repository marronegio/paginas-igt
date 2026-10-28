/* ==========================================================================
   A Black do Coaching — Indique e ganhe (member get member)
   Formulário (nome + e-mail + WhatsApp) -> webhook n8n -> link de indicação
   com utm_term = e-mail do indicador. Sem redirect: o link aparece na tela,
   com botões de copiar e de enviar no WhatsApp.

   O e-mail na utm_term é o que liga o indicado ao indicador: a LP da Black
   já manda utm_term no payload do webhook de captação.

   Editou este arquivo? Incremente o ?v= no <script> do index.html. (§10.2)
   ========================================================================== */

(function () {
  'use strict';

  /* ----------------------------------------------------------------------
     CONFIGURAÇÃO DA AÇÃO  (README §11 — é só isto que muda entre ações)
     ---------------------------------------------------------------------- */

  // Página para onde o link de indicação leva.
  var REFERRAL_BASE_URL = 'https://landing.igtcoaching.com.br/lp/a-black-do-coaching/oportunidade-v1a/';

  // Só o n8n nesta ação (sem Clint).
  var WEBHOOKS = [
    // IGT / n8n: devolve headers CORS, aceita application/json.
    { url: 'https://webhook.igtcoaching.com.br/webhook/87d61133-8914-49d9-a794-a944efbe603f',
      mode: 'cors', ct: 'application/json' }
  ];

  // Mensagem pronta do botão "Enviar no WhatsApp". {link} vira o link do indicador.
  var SHARE_TEXT = 'Dia 9 de novembro, às 20h, o Geronimo Theml abre ao vivo a Black do Coaching: ' +
    'o maior desconto da história da Formação em Coaching Criacional. Se inscreve pelo meu link: {link}';

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

  var state = { country: 'BR', sending: false, link: '' };

  function $(sel)    { return document.querySelector(sel); }
  function $all(sel) { return Array.prototype.slice.call(document.querySelectorAll(sel)); }

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
    $all('.mg-error').forEach(function (el) { el.hidden = true; el.textContent = ''; });

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
     Link de indicação
     ---------------------------------------------------------------------- */

  /* E-mail em minúsculas: o mesmo indicador gera sempre o mesmo link.
     O @ fica legível (é válido na query); o resto vai codificado, então um
     "+" no e-mail não vira espaço do outro lado. */
  function referralLink(email) {
    var value = encodeURIComponent(email.trim().toLowerCase()).replace(/%40/g, '@');
    return REFERRAL_BASE_URL + '?utm_term=' + value;
  }

  function whatsappUrl() {
    return 'https://wa.me/?text=' + encodeURIComponent(SHARE_TEXT.replace('{link}', state.link));
  }

  /* ----------------------------------------------------------------------
     Submit: webhooks (fire-and-forget) + link na tela (README §7.3)
     ---------------------------------------------------------------------- */

  function sendWebhooks(payload) {
    var body = JSON.stringify(payload);

    WEBHOOKS.forEach(function (wh) {
      try {
        fetch(wh.url, {
          method: 'POST',
          mode: wh.mode,
          headers: { 'Content-Type': wh.ct },
          body: body,
          keepalive: true
        }).catch(function () {});
      } catch (e) {}
    });
  }

  function submitForm(fields, button) {
    if (state.sending) return false;          // false = não enviou
    if (!validate(fields)) return false;

    state.sending = true;
    button.setAttribute('aria-busy', 'true');
    button.disabled = true;
    $('#mg-submit-label').textContent = 'Gerando seu link…';

    var country  = COUNTRIES.filter(function (c) { return c.code === state.country; })[0] || COUNTRIES[0];
    var raw      = fields.phone.value.trim();
    var masked   = state.country === 'BR' ? formatBrPhone(raw) : raw;
    var onlyNums = country.dial.replace(/\D/g, '') + nationalDigits(raw);
    var now      = new Date();
    var pad      = function (n) { return (n < 10 ? '0' : '') + n; };
    var params   = new URLSearchParams(window.location.search);

    state.link = referralLink(fields.email.value);

    sendWebhooks({
      nome:           fields.nome.value.trim(),
      email:          fields.email.value.trim().toLowerCase(),   // igual à utm_term do link
      whatsapp:       country.dial + ' ' + masked,
      telefone:       '+' + onlyNums,
      link_indicacao: state.link,

      utm_campaign:   params.get('utm_campaign') || '',
      utm_medium:     params.get('utm_medium')   || '',
      utm_source:     params.get('utm_source')   || '',
      utm_content:    params.get('utm_content')  || '',
      utm_term:       params.get('utm_term')     || '',
      data:           pad(now.getDate()) + '/' + pad(now.getMonth() + 1) + '/' + now.getFullYear()
    });

    showResult();
    return true;
  }

  /* ----------------------------------------------------------------------
     Estado 2: link na tela
     ---------------------------------------------------------------------- */

  function showResult() {
    $('#mg-link').textContent = state.link.replace(/^https?:\/\//, '');
    $('#mg-copy-label').textContent = 'Copiar link';

    $('#mg-form').hidden = true;
    var result = $('#mg-result');
    result.hidden = false;
    result.focus();
  }

  function showForm(fields, button) {
    state.sending = false;
    state.link = '';
    button.removeAttribute('aria-busy');
    button.disabled = false;
    $('#mg-submit-label').textContent = 'Gerar meu link';

    $('#mg-result').hidden = true;
    $('#mg-form').hidden = false;
    fields.email.value = '';
    fields.email.focus();
  }

  function copyText(text) {
    if (navigator.clipboard && window.isSecureContext) {
      return navigator.clipboard.writeText(text);
    }
    // fallback: navegador antigo ou página fora de https
    return new Promise(function (resolve, reject) {
      var ta = document.createElement('textarea');
      ta.value = text;
      ta.setAttribute('readonly', '');
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.select();
      var ok = false;
      try { ok = document.execCommand('copy'); } catch (e) {}
      document.body.removeChild(ta);
      if (ok) resolve(); else reject();
    });
  }

  var copyTimer = null;

  function onCopy() {
    var label = $('#mg-copy-label');
    copyText(state.link).then(function () {
      label.textContent = 'Link copiado';
    }, function () {
      label.textContent = 'Selecione o link e copie';
    });
    clearTimeout(copyTimer);
    copyTimer = setTimeout(function () { label.textContent = 'Copiar link'; }, 2600);
  }

  /* ----------------------------------------------------------------------
     Init
     ---------------------------------------------------------------------- */

  function init() {
    var form = $('#mg-form');
    if (!form) return;

    var fields = {
      nome:  $('#in-nome'),
      email: $('#in-email'),
      phone: $('#phone-input')
    };
    var button = $('#mg-submit');
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

    $('#mg-copy').addEventListener('click', onCopy);
    $('#mg-whatsapp').addEventListener('click', function () {
      window.open(whatsappUrl(), '_blank', 'noopener');
    });
    $('#mg-reset').addEventListener('click', function () { showForm(fields, button); });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
