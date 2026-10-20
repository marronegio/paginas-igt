/* ==========================================================================
   A Black do Coaching — Página de obrigado

   Um trabalho só: levar ao grupo do WhatsApp sem perder as UTMs
   (README §6.4 — link estático perde a atribuição).

   Editou este arquivo? Incremente o ?v= no <script> do index.html. (§10.2)
   ========================================================================== */

(function () {
  'use strict';

  /* CONFIGURAÇÃO DA AÇÃO — TODO antes de subir: link do Grupo VIP.
     Trocar aqui E no href do #group-cta no index.html (os dois iguais).
     Enquanto estiver com o placeholder, vale o href que já está no HTML. */
  var GROUP_URL = 'https://links.igtcoaching.com.br/COLE-AQUI-O-LINK-DO-GRUPO';

  /* Quem não clica também precisa chegar no grupo: leva sozinho depois de N s. */
  var REDIRECT_SECONDS = 5;

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

  function resolveBaseUrl(cta) {
    if (GROUP_URL.indexOf('COLE-AQUI') === -1) return GROUP_URL;
    return (cta && cta.getAttribute('href')) || GROUP_URL;
  }

  function startAutoRedirect(cta, url) {
    var note = document.getElementById('ty-redirect-note');
    var left = REDIRECT_SECONDS;
    var timer = null;

    function render() {
      if (!note) return;
      note.hidden = false;
      note.textContent = left > 0
        ? 'Sem ação, te levamos pro grupo em ' + left + 's…'
        : 'Levando você pro grupo…';
    }

    function stop() {
      if (timer) { clearInterval(timer); timer = null; }
      if (note) note.hidden = true;
    }

    render();

    timer = setInterval(function () {
      left -= 1;
      render();
      if (left <= 0) {
        clearInterval(timer);
        timer = null;
        window.location.href = url;
      }
    }, 1000);

    /* Clicou (ou saiu da página): o timer não tem mais o que fazer. */
    if (cta) cta.addEventListener('click', stop);
    window.addEventListener('pagehide', stop);
  }

  function init() {
    var cta = document.getElementById('group-cta');
    var url = withForwardedParams(resolveBaseUrl(cta));

    if (cta) cta.href = url;
    startAutoRedirect(cta, url);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
