/* ==========================================================================
   Black MBA · Turma Fundadora — Página de obrigado

   Um trabalho só: levar ao Grupo VIP sem perder as UTMs
   (README §6.4 — link estático perde a atribuição).

   Editou este arquivo? Incremente o ?v= no <script> do index.html. (§10.2)
   ========================================================================== */

(function () {
  'use strict';

  /* CONFIGURAÇÃO DA AÇÃO — link do Grupo VIP.
     Se trocar, troque aqui E no href do #group-cta no index.html (os dois iguais).
     Com COLE-AQUI no link, não há redirecionamento automático (proteção para ações novas). */
  var GROUP_URL = 'https://links.igtcoaching.com.br/black-mba-grupos-wpp-nov26';

  /* Quem não clica também precisa chegar no grupo: leva sozinho depois de N s. */
  var REDIRECT_SECONDS = 5;

  function withForwardedParams(baseUrl) {
    try {
      var target   = new URL(baseUrl, window.location.href);
      var incoming = new URLSearchParams(window.location.search);

      incoming.forEach(function (value, key) {
        if (key === 'xcod') return;                       // xcod (legado da VK) não vai pro WhatsApp
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
        ? 'Sem clique, levamos você ao grupo em ' + left + 's…'
        : 'Levando você ao grupo…';
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
    if (url.indexOf('COLE-AQUI') !== -1) return;   // link do grupo ainda não configurado
    startAutoRedirect(cta, url);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
