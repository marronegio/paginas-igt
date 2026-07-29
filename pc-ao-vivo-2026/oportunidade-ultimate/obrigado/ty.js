/* ==========================================================================
   PC Ao Vivo 2026 — Oportunidade Ultimate · Página de obrigado

   Um trabalho só: levar ao grupo do WhatsApp sem perder as UTMs
   (README §6.4 — link estático perde a atribuição).

   Editou este arquivo? Incremente o ?v= no <script> do index.html. (§10.2)
   ========================================================================== */

(function () {
  'use strict';

  /* CONFIGURAÇÃO DA AÇÃO — troque pelo convite do grupo desta ação. */
  var GROUP_URL = 'https://chat.whatsapp.com/COLE-AQUI-O-CODIGO-DO-GRUPO';

  function withForwardedParams(baseUrl) {
    try {
      var target   = new URL(baseUrl, window.location.href);
      var incoming = new URLSearchParams(window.location.search);

      incoming.forEach(function (value, key) {
        if (key === 'xcod') return;                       // xcod é da LP, não vai pro WhatsApp
        if (!target.searchParams.has(key)) target.searchParams.append(key, value);
      });

      return target.toString();
    } catch (e) {
      return baseUrl;   // qualquer erro: manda pro grupo mesmo assim
    }
  }

  function init() {
    var cta = document.getElementById('group-cta');
    if (cta) cta.href = withForwardedParams(GROUP_URL);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
