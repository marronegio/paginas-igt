/* ==========================================================================
   Black MBA · Turma Fundadora — Página de obrigado (destino do checkout)

   Um trabalho só: os botões (pesquisa e time) levam as UTMs junto
   (README §6.4 — link estático perde a atribuição).

   Só os parâmetros utm_* seguem: a Hotmart pode devolver dados da compra na
   URL da obrigado, e eles não devem ir parar na pesquisa nem no WhatsApp.
   Link com href="#" (ainda não configurado) fica como está.

   Editou este arquivo? Incremente o ?v= no <script> do index.html. (§10.2)
   ========================================================================== */

(function () {
  'use strict';

  function withUtms(baseUrl) {
    try {
      var target   = new URL(baseUrl, window.location.href);
      var incoming = new URLSearchParams(window.location.search);

      incoming.forEach(function (value, key) {
        if (key.indexOf('utm_') !== 0) return;
        if (!target.searchParams.has(key)) target.searchParams.append(key, value);
      });

      return target.toString();
    } catch (e) {
      return baseUrl;   // qualquer erro: o link segue funcionando sem as UTMs
    }
  }

  function init() {
    Array.prototype.forEach.call(document.querySelectorAll('a[data-forward]'), function (a) {
      var href = a.getAttribute('href');
      if (!href || href.charAt(0) === '#') return;
      a.href = withUtms(href);
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
