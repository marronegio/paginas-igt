# Padrão de Landing Pages — IGT International Coaching

Documento de referência para **todas as ações** (lançamentos, imersões, captações, webinários) da IGT.

Define o que é obrigatório em qualquer LP nova: responsividade, popup pré-checkout, encaminhamento de UTMs, webhooks, pixels da VK e GTM.

> **Implementação de referência:** este repositório (`igt-protocolo-6porcento-2026`). Todos os trechos de código abaixo estão em produção aqui e podem ser copiados como estão. Ao iniciar uma ação nova, clone esta estrutura e altere apenas o que a [§11](#11-o-que-muda-a-cada-ação) lista.

---

## Índice

1. [Como usar este documento](#1-como-usar-este-documento)
2. [Stack e estrutura padrão](#2-stack-e-estrutura-padrão)
3. [Fluxo padrão do lead](#3-fluxo-padrão-do-lead)
4. [Responsividade](#4-responsividade)
5. [Popup pré-checkout](#5-popup-pré-checkout)
6. [Encaminhamento de UTMs](#6-encaminhamento-de-utms)
7. [Webhooks](#7-webhooks)
8. [Scripts da VK](#8-scripts-da-vk)
9. [Script do GTM](#9-script-do-gtm)
10. [Deploy e cache](#10-deploy-e-cache)
11. [O que muda a cada ação](#11-o-que-muda-a-cada-ação)
12. [Checklist de lançamento](#12-checklist-de-lançamento)

---

## 1. Como usar este documento

**Ação nova, do zero:**

1. Duplique o repositório de referência (estrutura, `app.js`, `.htaccess`, workflow de deploy).
2. Troque só o que está na [§11](#11-o-que-muda-a-cada-ação): datas, lotes/preços, links de checkout, UUIDs de webhook, copy e assets.
3. Rode o [checklist](#12-checklist-de-lançamento) antes de subir.

**Ação existente que precisa de ajuste:** vá direto na seção do tema. Cada uma explica *o que é obrigatório*, *por quê* e *o snippet pronto*.

**Constantes da empresa** (não mudam entre ações):

| Item | Valor |
|---|---|
| Container GTM | `GTM-WSTL4F8` |
| Conta VK (leads e vendas) | `cK0i3FbAiLmfmeAOoJlK` |
| Host de webhook n8n | `webhook.igtcoaching.com.br` |
| Host de webhook CRM | `functions-api.clint.digital` |
| Encurtador de links | `links.igtcoaching.com.br` |

---

## 2. Stack e estrutura padrão

**HTML + CSS + JS vanilla. Sem build, sem framework, sem dependência externa em runtime.** Uma LP de tráfego pago precisa carregar rápido no 4G e sobreviver a bloqueadores — qualquer CDN de terceiros na frente do render é risco de conversão.

```
/
├── index.html          # LP principal — CSS crítico INLINE no <head>
├── app.js              # Lógica: lotes/preços, countdown, modal, máscara, UTM, webhooks
├── styles.css          # Fonte de verdade do CSS (versão legível/não minificada)
├── .htaccess           # Compressão + política de cache
├── assets/             # Imagens (.webp) e fontes .woff2 self-hosted
├── obrigado/           # Página de agradecimento
├── disclaimer/         # (opcional) Aviso com vídeo para tráfego desviado
└── .github/workflows/  # Deploy automático via FTP
```

**Convenções obrigatórias:**

| Regra | Motivo |
|---|---|
| CSS crítico **inline** no `<head>` do `index.html` | Zero render-blocking; LCP rápido |
| `styles.css` é a versão legível; o inline é a minificada | Editar **sempre nos dois** — o navegador só lê o inline |
| Fontes `.woff2` **self-hosted** em `assets/fonts/` | Sem dependência do Google Fonts (LGPD + latência) |
| Prefixo de classe único por página (`p6-`, `dc-`, `ty-`) | Evita colisão entre páginas e com scripts de terceiros |
| Imagens servidas em `.webp` | Peso |
| Toda lógica em um único `app.js`, em IIFE `'use strict'` | Um arquivo para versionar e cache-bustar |

> Este repositório contém também `support.js` e `_ds/` (design system). São artefatos de geração e **não** são carregados pela LP principal — não replique em ações novas a menos que use o design system.

---

## 3. Fluxo padrão do lead

```
Anúncio (Meta/Google) com UTMs
        │
        ├──► /disclaimer/  (opcional — quando o tráfego vem de outra campanha)
        │           │
        ▼           ▼
    index.html  ─────────────────────────────────────────┐
        │  CTA → scroll até a seção de oferta             │
        │  CTA de compra → abre o MODAL                   │
        ▼                                                 │
    MODAL: nome + e-mail + WhatsApp (DDI)                 │
        │  submit                                          │
        ├──► POST webhook n8n IGT                          │
        ├──► POST webhook CRM Clint                        │
        └──► redirect ► checkout (Hotmart)                 │
                 (com UTMs encaminhadas + xcod da VK) ◄────┘
                        │
                        ▼
                  /obrigado/ → grupo de WhatsApp
```

**A regra que sustenta o fluxo:** o lead é capturado **antes** do checkout. Quem preenche o modal e desiste de pagar já está no CRM e pode ser recuperado. Por isso o modal nunca pode ser pulado, e a falha de um webhook nunca pode impedir o redirect.

---

## 4. Responsividade

### Princípio: fluido por padrão, media query só na exceção

A LP de referência tem **uma única media query** (`max-width: 680px`). Todo o resto se adapta sozinho com `clamp()`, `auto-fit` e `flex-wrap`. Esse é o padrão — media query só entra quando o layout precisa **mudar de comportamento**, não para ajustar tamanho.

### 4.1 Viewport (obrigatório em toda página)

```html
<meta name="viewport" content="width=device-width, initial-scale=1">
```

### 4.2 Tipografia e espaçamento fluidos com `clamp()`

Nunca defina `font-size` fixo em título/lead nem `padding` fixo de seção:

```css
/* títulos */
.p6-hero__title  { font-size: clamp(2.6rem, 5vw, 4.4rem); }
.p6-offer__title { font-size: clamp(2.1rem, 4vw, 3.4rem); }
.p6-hero__lead   { font-size: clamp(1.05rem, 1.5vw, 1.3rem); }

/* padding vertical de seção */
.p6-offer { padding: clamp(64px, 9vw, 120px) 28px; }

/* padding interno de card */
.p6-offer__body { padding: 32px clamp(24px, 4vw, 48px); }
```

Regra prática: `min` = legível no mobile, `preferido` em `vw`, `max` = não estourar em tela grande.

### 4.3 Grids que se reorganizam sozinhos

Sem breakpoint, sem contagem de colunas hardcoded:

```css
.p6-diag__grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 14px; }
.p6-usos__grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 14px; }
```

`minmax(280px, 1fr)` = o card nunca fica menor que 280px; o grid quebra a linha sozinho.

### 4.4 Linhas de CTA que quebram naturalmente

```css
.p6-hero__cta-row   { display: flex; flex-wrap: wrap; align-items: center; gap: 18px; }
.p6-footer__inner   { display: flex; flex-wrap: wrap; justify-content: space-between; gap: 16px; }
.p6-hero__date-line { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
```

### 4.5 Containers e overflow

```css
.p6-root { overflow-x: hidden; }        /* trava scroll horizontal acidental */
* { box-sizing: border-box; }
.p6-hero__inner { max-width: 1200px; margin: 0 auto; }
.p6-offer       { max-width: 1080px; margin: 0 auto; scroll-margin-top: 80px; } /* nav sticky não cobre o alvo do scroll */
.p6-offer__card { max-width: 720px;  margin: 0 auto; }
```

`scroll-margin-top` é obrigatório em qualquer seção que seja alvo de scroll suave, sempre que houver nav `position: sticky`.

### 4.6 A media query de mobile (`≤ 680px`)

[styles.css:241-253](styles.css#L241-L253) — muda **comportamento**, não tamanho:

```css
@media (max-width: 680px) {
  /* aspect-ratio = razão intrínseca da imagem, pra o box acompanhar a altura do contain */
  .p6-hero-bg {
    inset: 0 0 auto 0 !important;
    aspect-ratio: 1672 / 941;
    background-size: contain !important;
    background-position: top center !important;
    -webkit-mask-image: linear-gradient(to top, transparent 0%, #000 55%);
    mask-image: linear-gradient(to top, transparent 0%, #000 55%);
  }
  .p6-hero__logo { margin-bottom: 100px !important; } /* abre espaço para a foto acima do texto */
  .p6-nav__logo  { display: none !important; }        /* nav sobra espaço no mobile */
}
```

**Padrão de hero com foto de pessoa** (vale para toda ação): no desktop a foto é `cover` alinhada à direita, com scrim em gradiente cobrindo o lado do texto. No mobile ela vira `contain` no topo, com máscara em gradiente dissolvendo no fundo, e o texto desce. O `aspect-ratio` precisa ser o da imagem real.

### 4.7 Padrão "cabe na tela" (`vh` + `clamp`)

Quando a página **não pode rolar** no desktop (VSL, vídeo de aviso, página de captura curta), dimensione tudo em `vh` — inclusive o vídeo. [disclaimer/index.html:135-158](disclaimer/index.html#L135-L158):

```css
@media (min-width: 900px) {
  html, body { height: 100%; }
  body { height: 100vh; overflow: hidden; }
  .dc-inner { flex: 1; justify-content: center; padding: clamp(16px,2.4vh,32px) 24px clamp(10px,1.6vh,20px); }
  .dc-title { font-size: clamp(2.1rem, 4vh, 3.5rem); margin: 0 0 clamp(8px,1.4vh,16px); }
  /* o vídeo é dimensionado pela ALTURA disponível, não pela largura */
  .dc-video { width: auto; max-width: 100%; height: clamp(240px, 42vh, 430px); aspect-ratio: 16/9; }
  .dc-cta-wrap { margin-top: clamp(16px,2.6vh,32px); }
}

/* telas baixas: garante que nada seja cortado */
@media (min-width: 900px) and (max-height: 640px) {
  body { overflow-y: auto; }
}
```

O segundo bloco é obrigatório sempre que usar `overflow: hidden` — sem ele, notebook de tela baixa corta o CTA.

**Mobile continua com scroll normal** (`min-height:100vh` + `flex-direction: column`): o `@media (min-width:900px)` não se aplica. Esse é o padrão geral — **mobile é o layout base, desktop é a exceção**.

### 4.8 Vídeo responsivo (iframe)

```css
.dc-video { position: relative; width: 100%; aspect-ratio: 16/9; }
.dc-video iframe { position: absolute; inset: 0; width: 100%; height: 100%; border: 0; }
```

### 4.9 Performance (afeta mobile diretamente)

```html
<link rel="preload" as="image" href="assets/hero-geronimo.webp" fetchpriority="high">
<link rel="preload" as="font" type="font/woff2" href="assets/fonts/SairaCondensed-900-latin.woff2" crossorigin>
<img src="..." class="p6-nav__logo" width="82" height="40">  <!-- width/height sempre: evita CLS -->
```

Preload só do **LCP** (imagem do hero) e das **fontes usadas above the fold**. Preload demais compete com o que importa.

Fontes com `font-display: swap` + **fallback com métricas ajustadas**, para o texto não "pular" quando a fonte real carrega:

```css
@font-face{font-family:"Saira Condensed Fallback";src:local('Arial'),local('ArialMT');
  font-display:swap;ascent-override:143.3382%;descent-override:55.4409%;line-gap-override:0%;size-adjust:79.1834%}
```

### 4.10 Larguras de teste obrigatórias

360px · 680px (o breakpoint) · 900px · 1024px · 1440px — e **nenhuma** pode ter scroll horizontal.

---

## 5. Popup pré-checkout

Modal que captura **nome + e-mail + WhatsApp (com DDI)** antes de mandar o lead ao checkout. É o que garante lead no CRM mesmo sem compra concluída. **Obrigatório em toda ação com venda direta.**

### 5.1 Markup

[index.html:279-322](index.html#L279-L322). Estrutura: overlay → modal → dois estados irmãos (`#modal-form` e `#modal-success`) alternados por `hidden`.

```html
<div class="p6-modal-overlay" id="checkout" data-action="overlayClose" hidden>
  <div class="p6-modal" role="dialog" aria-modal="true" aria-labelledby="modal-title">
    <button type="button" class="p6-modal__close" data-action="closeCheckout" aria-label="Fechar">
      <i class="ph-bold ph-x p6-modal__close-icon" aria-hidden="true"></i>
    </button>

    <div id="modal-form">
      <div class="p6-modal__eyebrow">Ingresso START · Lote <span data-lote="num">1</span></div>
      <h3 class="p6-modal__title" id="modal-title">Garanta sua vaga</h3>
      <p class="p6-modal__desc">Preencha para seguir ao pagamento — <strong class="p6-strong-white">R$<span data-lote="price">32</span>,00</strong>, à vista ou em até 5x.</p>

      <form class="p6-modal__fields" id="checkout-form" novalidate>
        <div class="p6-field">
          <label class="p6-field__label" for="in-nome">Nome completo</label>
          <input class="p6-field__input" id="in-nome" name="nome" type="text"
                 placeholder="Seu nome" autocomplete="name" required>
        </div>
        <div class="p6-field">
          <label class="p6-field__label" for="in-email">E-mail</label>
          <input class="p6-field__input" id="in-email" name="email" type="email"
                 placeholder="voce@email.com" autocomplete="email" required>
        </div>
        <div class="p6-modal__phone-group">
          <label class="p6-modal__phone-label" for="phone-input">WhatsApp</label>
          <div class="p6-modal__phone-row">
            <select class="p6-modal__country-select" id="country-select" aria-label="Código do país (DDI)"></select>
            <input class="p6-modal__phone-input" id="phone-input" type="tel"
                   placeholder="(00) 00000-0000" autocomplete="tel">
          </div>
        </div>
        <div class="p6-modal__cta-wrap">
          <button type="submit" class="p6-btn p6-btn--primary p6-btn--lg p6-btn--block p6-btn--arrow">
            Ir para o pagamento<span class="p6-btn__arrow" aria-hidden="true">→</span>
          </button>
        </div>
      </form>
      <p class="p6-modal__secure-note">
        <i class="ph-bold ph-lock-simple p6-modal__secure-icon" aria-hidden="true"></i> Ambiente seguro
      </p>
    </div>

    <div id="modal-success" hidden>…</div>
  </div>
</div>
```

**Três campos, nunca mais que isso.** Cada campo extra derruba conversão; o que faltar o CRM enriquece depois.

**Regras obrigatórias:**

| Item | Como |
|---|---|
| `role="dialog"` + `aria-modal="true"` + `aria-labelledby` | Leitores de tela anunciam o modal |
| `<label for>` em **todo** campo | Nunca só `placeholder` como rótulo |
| `autocomplete="name" / "email" / "tel"` | Autofill do navegador = menos atrito |
| `type="email"` e `type="tel"` | Teclado correto no mobile |
| `novalidate` no `<form>` | Desliga o balão nativo; validação fica com o `required` + regras próprias |
| `aria-label` no `<select>` de DDI | Não tem label visível |
| Fecha por: botão X, clique no overlay e tecla `Esc` | Três saídas |
| `[hidden] { display: none !important; }` no CSS | Faz o atributo `hidden` vencer o `display:flex` da classe |

### 5.2 Abrir / fechar

Delegação por atributo `data-action` — [app.js:104-116](app.js#L104-L116), [app.js:175-185](app.js#L175-L185):

```js
var overlay      = $('#checkout');
var modalForm    = $('#modal-form');
var modalSuccess = $('#modal-success');

function openCheckout() {
  modalForm.hidden = false;      // sempre reseta para o estado de formulário
  modalSuccess.hidden = true;
  overlay.hidden = false;
}
function closeCheckout() { overlay.hidden = true; }

$all('[data-action]').forEach(function (el) {
  el.addEventListener('click', function (ev) {
    var a = el.getAttribute('data-action');
    if (a === 'goOffer') goOffer();
    else if (a === 'openCheckout')  openCheckout();
    else if (a === 'closeCheckout') closeCheckout();
    else if (a === 'overlayClose')  { if (ev.target === overlay) closeCheckout(); } // só o clique no fundo
  });
});

document.addEventListener('keydown', function (ev) {
  if (ev.key === 'Escape' && !overlay.hidden) closeCheckout();
});
```

O padrão `data-action` evita `onclick` no HTML e permite N botões abrindo o mesmo modal sem duplicar código — some quantos CTAs a copy pedir, sem tocar no JS.

### 5.3 Seletor de DDI com bandeiras

**O problema:** Windows não renderiza emoji de bandeira. A solução é uma fonte self-hosted cobrindo só o range Unicode das bandeiras regionais:

```css
@font-face{
  font-family:'Twemoji Country Flags';
  unicode-range:U+1F1E6-1F1FF,U+1F3F4,U+E0062-E0063,U+E0065,U+E0067,U+E006C,U+E006E,U+E0073-E0074,U+E0077,U+E007F;
  src:url('assets/TwemojiCountryFlags.woff2') format('woff2');
  font-display:swap
}

.p6-modal__country-select{
  flex:none; width:104px; padding:13px 6px;
  font-family:'Twemoji Country Flags', var(--font-body);  /* fonte de bandeiras PRIMEIRO */
  font-size:14px; color:#fff;
  background:var(--ink-850); border:1px solid var(--ink-700); border-radius:6px; outline:0
}
.p6-modal__phone-row  { display:flex; gap:8px; }
.p6-modal__phone-input{ flex:1; min-width:0; }  /* min-width:0 impede o input de estourar o flex */
```

Copie `assets/TwemojiCountryFlags.woff2` para toda ação nova.

Lista de países — [app.js:22-35](app.js#L22-L35). 36 países, **Brasil sempre primeiro** (é o default):

```js
var COUNTRIES = [
  { code: 'BR', dial: '+55',  flag: '🇧🇷' }, { code: 'US', dial: '+1',   flag: '🇺🇸' },
  { code: 'PT', dial: '+351', flag: '🇵🇹' }, { code: 'AR', dial: '+54',  flag: '🇦🇷' },
  /* … demais países LATAM / Europa / resto do mundo … */
];
```

Populado no `init()` — [app.js:155-172](app.js#L155-L172):

```js
var sel = $('#country-select');
COUNTRIES.forEach(function (c) {
  var o = document.createElement('option');
  o.value = c.code;
  o.textContent = c.flag + ' ' + c.dial;   // "🇧🇷 +55"
  sel.appendChild(o);
});
sel.value = 'BR';
```

### 5.4 Máscara `(XX) XXXXX-XXXX`

Só para o Brasil. Trocar o DDI limpa o campo e troca o placeholder — [app.js:47-53](app.js#L47-L53), [app.js:164-172](app.js#L164-L172):

```js
function formatBrPhone(raw) {
  var d = raw.replace(/\D/g, '').slice(0, 11);   // só dígitos, máx. 11 (DDD + 9)
  if (d.length === 0) return '';
  if (d.length <= 2)  return '(' + d;                                       // (1 · (11
  if (d.length <= 7)  return '(' + d.slice(0,2) + ') ' + d.slice(2);        // (11) 98765
  return '(' + d.slice(0,2) + ') ' + d.slice(2,7) + '-' + d.slice(7);       // (11) 98765-4321
}

var phone = $('#phone-input');

sel.addEventListener('change', function () {
  state.country = sel.value;
  phone.value = '';                                                   // limpa: máscara antiga não vale mais
  phone.placeholder = sel.value === 'BR' ? '(00) 00000-0000' : 'Número de telefone';
});

phone.addEventListener('input', function () {
  if (state.country === 'BR') phone.value = formatBrPhone(phone.value); // fora do BR: entrada livre
});
```

**Por que assim:** máscara rígida só no BR, porque formato de telefone varia demais por país — forçar máscara em número estrangeiro quebra o cadastro. A formatação é reconstruída do zero a cada `input`, então backspace, colar e digitar no meio funcionam sem lógica de cursor.

### 5.5 Estado de sucesso

Após o submit, `#modal-success` aparece **e** o redirect dispara. O sucesso é feedback caso o redirect demore — nunca é uma tela final da qual o usuário precise sair sozinho.

---

## 6. Encaminhamento de UTMs

**Regra de ouro: nenhum parâmetro da URL pode se perder entre o anúncio e o checkout.** UTM que não chega no checkout = venda não atribuída = verba otimizada às cegas.

As UTMs seguem por **dois caminhos independentes**:

1. **Na URL do checkout** (atribuição de venda na Hotmart/VK) — `withForwardedParams()`
2. **No corpo do webhook** (atribuição de lead no CRM) — `submitForm()`

### 6.1 Repasse para a URL do checkout

[app.js:55-70](app.js#L55-L70) — copie esta função como está:

```js
function withForwardedParams(baseUrl) {
  try {
    var target   = new URL(baseUrl, window.location.href);
    var incoming = new URLSearchParams(window.location.search);

    // repassa TODOS os parâmetros da LP, sem lista branca
    incoming.forEach(function (value, key) {
      if (!target.searchParams.has(key)) target.searchParams.append(key, value); // não sobrescreve o que o link já define
    });

    // VK Metrics: identifica a venda com o anúncio Meta que originou o clique.
    var adId     = incoming.get('utm_content') || '';
    var vkSource = incoming.get('vk_source')   || 'paid_metaads';
    target.searchParams.set('xcod', JSON.stringify({ vid: adId, vsrc: vkSource, url: 'checkout', v: 1 }));

    return target.toString();
  } catch (e) {
    return baseUrl;   // qualquer erro: manda pro checkout mesmo assim, nunca trava a venda
  }
}
```

**Decisões que importam:**

| Decisão | Por quê |
|---|---|
| Repassa **tudo**, sem whitelist | Parâmetro novo (`fbclid`, `gclid`, `vk_source`, `sck` extra…) passa sem alterar código |
| `if (!target.searchParams.has(key))` | O link de checkout já traz `off`, `split`, `sck` — a URL da LP nunca sobrescreve |
| `try/catch` com `return baseUrl` | URL malformada não pode impedir a compra |
| `xcod` com `set()` (não `append`) | É gerado pela LP, sempre um só |

### 6.2 UTMs no payload do webhook

[app.js:118-134](app.js#L118-L134) — aqui **é** lista fixa, porque o CRM espera campos nomeados:

```js
var params = new URLSearchParams(window.location.search);
var payload = {
  /* … */
  utm_campaign: params.get('utm_campaign') || '',
  utm_medium:   params.get('utm_medium')   || '',
  utm_source:   params.get('utm_source')   || '',
  utm_content:  params.get('utm_content')  || '',
  utm_term:     params.get('utm_term')     || '',
  /* … */
};
```

`|| ''` em todos: o CRM recebe string vazia, nunca `null`/`undefined`.

### 6.3 Parâmetros reconhecidos

| Parâmetro | Origem | Uso |
|---|---|---|
| `utm_source`, `utm_medium`, `utm_campaign`, `utm_term` | Anúncio | Webhook + URL do checkout |
| `utm_content` | Anúncio — **deve conter o ID do anúncio Meta** | Vira `xcod.vid` (atribuição VK) + webhook |
| `vk_source` | Anúncio (opcional) | Vira `xcod.vsrc`; default `paid_metaads` |
| `sck` | Fixo na URL de cada lote/oferta | Identifica lote e origem na Hotmart |

### 6.4 Navegação interna

Toda navegação entre páginas da ação (`/disclaimer/` → `/`, `/` → `/obrigado/`, `/obrigado/` → grupo de WhatsApp) **deve** repassar `window.location.search`, via `withForwardedParams()` ou concatenação no `href`. Link estático `<a href="../index.html">` perde as UTMs.

> Pendência conhecida na LP de referência: o CTA do `/disclaimer/` e o redirect do `/obrigado/` ainda são estáticos e não repassam UTMs. Não replique isso em ações novas.

---

## 7. Webhooks

Disparados **no submit do modal**, antes do redirect. Fire-and-forget: falha de webhook nunca pode impedir a venda.

**Dois destinos, sempre os dois:**

| Destino | Papel | `mode` | `Content-Type` |
|---|---|---|---|
| `webhook.igtcoaching.com.br/webhook/{UUID}` (n8n) | Automação interna IGT | `cors` | `application/json` |
| `functions-api.clint.digital/endpoints/integration/webhook/{UUID}` | CRM Clint | `no-cors` | `text/plain;charset=UTF-8` |

Os `{UUID}` são **por ação** — peça os dois ao responsável por automação antes de subir.

### 7.1 Configuração

[app.js:7-12](app.js#L7-L12):

```js
var WEBHOOKS = [
  // IGT: devolve headers CORS, aceita application/json.
  { url: 'https://webhook.igtcoaching.com.br/webhook/{UUID-DA-ACAO}',
    mode: 'cors', ct: 'application/json' },

  // Clint: sem CORS no preflight -> enviar como "simple request" (text/plain + no-cors).
  { url: 'https://functions-api.clint.digital/endpoints/integration/webhook/{UUID-DA-ACAO}',
    mode: 'no-cors', ct: 'text/plain;charset=UTF-8' }
];
```

**A parte crítica — por que o Clint usa `no-cors` + `text/plain`:** o endpoint do Clint não responde ao preflight `OPTIONS`. Enviar `application/json` dispara preflight e a requisição **falha silenciosamente**. Com `text/plain;charset=UTF-8` + `mode:'no-cors'`, o navegador trata como *simple request* e envia direto, sem preflight. O corpo continua sendo JSON — o Clint faz o parse igual. Em `no-cors` a resposta é opaca: **não dá para verificar sucesso pelo JS**, só nos logs do destino.

### 7.2 Payload padrão

[app.js:118-135](app.js#L118-L135) — mesmo corpo para os dois destinos. **Mantenha estes nomes de campo em todas as ações**, senão cada automação precisa de mapeamento próprio:

```json
{
  "nome":         "Fulano de Tal",
  "email":        "fulano@email.com",
  "whatsapp":     "+55 (11) 98765-4321",
  "telefone":     "+5511987654321",
  "utm_campaign": "",
  "utm_medium":   "",
  "utm_source":   "",
  "utm_content":  "",
  "utm_term":     "",
  "data":         "28/07/2026"
}
```

| Campo | Formato | Por quê |
|---|---|---|
| `whatsapp` | `DDI + espaço + valor mascarado` | Legível para o time comercial |
| `telefone` | `DDI + só dígitos` | Discagem / API de WhatsApp |
| `data` | `DD/MM/AAAA` (data local) | Padrão dos relatórios internos |

Sempre as **duas variantes do telefone** — cada ferramenta consome um formato.

### 7.3 Disparo

[app.js:135-144](app.js#L135-L144):

```js
var body = JSON.stringify(payload);

WEBHOOKS.forEach(function (wh) {
  try {
    fetch(wh.url, {
      method: 'POST',
      mode: wh.mode,
      headers: { 'Content-Type': wh.ct },
      body: body,
      keepalive: true         // ESSENCIAL: a request sobrevive ao redirect logo abaixo
    }).catch(function () {});   // falha de rede não pode quebrar o fluxo
  } catch (e) {}
});

modalForm.hidden = true;
modalSuccess.hidden = false;
window.location.href = withForwardedParams(state.loteUrl);
```

**Três proteções obrigatórias:**

1. `keepalive: true` — sem isso o navegador **cancela** a request ao trocar de página no `window.location.href` da linha seguinte. É o bug mais comum desse padrão e o mais difícil de perceber: funciona no teste com DevTools aberto e perde leads em produção.
2. `.catch(function(){})` — promise rejeitada não vira erro não tratado.
3. `try/catch` externo — protege contra browser sem `fetch`/`keepalive`.

Os webhooks disparam em paralelo; **não** se espera resposta antes de redirecionar. O lead vale mais que a confirmação.

### 7.4 Ao configurar webhook de uma ação nova

1. Teste o endpoint com `application/json`. Erro de CORS no console → mude para `mode:'no-cors'` + `ct:'text/plain;charset=UTF-8'`.
2. Confirme a chegada **no painel do destino**, não no console (resposta `no-cors` é opaca).
3. Bump do cache-buster do `app.js` (ver [§10.2](#102-cache-busting--obrigatório-ao-editar-appjs)).

---

## 8. Scripts da VK

A VK (VK Digital / VK Metrics) faz a atribuição de vendas ao anúncio de origem. São **dois blocos**, ambos no **fim do `<body>`**, depois do `app.js`. [index.html:326-353](index.html#L326-L353).

Conta VK da IGT (a mesma em todas as ações): **`cK0i3FbAiLmfmeAOoJlK`**

### 8.1 Pixel de Leads

```html
<!--Script de Leads-->
<script async="true">
  (function(w, d, s, u) {
  w.vkPixel = w.vkPixel || { _q: [] };
  w.vkPixel._q.push(['init', 'cK0i3FbAiLmfmeAOoJlK']);
  var js = d.createElement(s);
  js.src = u;
  js.async = true;
  d.head.appendChild(js);
  })(window, document, 'script', 'https://cf.vkdigital.com.br/pixel.js?v=55');
</script>
```

### 8.2 Pixel de Vendas + PageView

```html
<!--Script de Vendas-->
<script>
  !function(w,d,c,u){
  (w.vkPixelSales=w.vkPixelSales||{_q:[]})._q.push(['init',c]);
  (w.vkPageViewPixel=w.vkPageViewPixel||{_q:[]})._q.push(['init',c,'page_view']);
  ['https://cf.vkdigital.com.br/sales_pixel.js?v=56','https://cf.vkdigital.com.br/event_pageview.js'].forEach(function(src,i){
  var s=d.createElement('script');
  s.src=src;
  s.async=1;
  if(i===0) {
  s.setAttribute('data-no-xcod-url','');
  }
  d.head.appendChild(s);
  });
  }(window,document,'cK0i3FbAiLmfmeAOoJlK');
</script>
```

### 8.3 Regras (não altere sem entender)

| Regra | Motivo |
|---|---|
| Os dois blocos **no fim do `<body>`**, após o `app.js` | São `async` e não bloqueiam render; a fila `_q` garante a ordem |
| `data-no-xcod-url` no `sales_pixel.js` | **Desliga a injeção automática de `xcod` da VK.** Sem isso o script sobrescreve o `xcod` montado pela LP e a atribuição por criativo se perde |
| Padrão de fila (`_q.push(['init', …])`) | O `init` é enfileirado antes do script existir — sem race condition |
| Versões pinadas (`pixel.js?v=55`, `sales_pixel.js?v=56`) | Atualize só quando a VK pedir, e em todas as ações de uma vez |

### 8.4 Integração VK ↔ LP: o parâmetro `xcod`

A LP é quem constrói o `xcod` e anexa na URL do checkout ([§6.1](#61-repasse-para-a-url-do-checkout)):

```js
target.searchParams.set('xcod', JSON.stringify({
  vid:  incoming.get('utm_content') || '',              // ID do anúncio Meta
  vsrc: incoming.get('vk_source')   || 'paid_metaads',  // origem
  url:  'checkout',
  v:    1
}));
```

Resultado (antes do encode):

```
https://pay.hotmart.com/{PRODUTO}?off={OFERTA}&…&xcod={"vid":"1234567890","vsrc":"paid_metaads","url":"checkout","v":1}
```

**Contrato com o time de tráfego, válido para toda ação:** o `utm_content` do anúncio **precisa** carregar o ID do anúncio Meta. É dele que sai o `vid`. Se vier vazio, a venda não é atribuída ao criativo.

> Histórico da LP de referência: esse valor já esteve em outro parâmetro e foi movido para dentro do `xcod` (commits `612810d`, `f1dbf1b`). Se a atribuição sumir em alguma ação, verifique primeiro se o `data-no-xcod-url` continua no lugar.

---

## 9. Script do GTM

Container único da empresa: **`GTM-WSTL4F8`** — o mesmo em todas as ações e em todas as páginas de cada ação. Funil inteiro em um só container.

### 9.1 Bloco do `<head>` — o mais alto possível

Logo após `<title>`/`<meta description>` e **antes** de qualquer `preload`, CSS ou fonte. [index.html:11-17](index.html#L11-L17):

```html
<!-- Google Tag Manager -->
<script>(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','GTM-WSTL4F8');</script>
<!-- End Google Tag Manager -->
```

### 9.2 Bloco `<noscript>` — primeira coisa do `<body>`

[index.html:25-28](index.html#L25-L28):

```html
<body>
  <!-- Google Tag Manager (noscript) -->
  <noscript><iframe src="https://www.googletagmanager.com/ns.html?id=GTM-WSTL4F8"
  height="0" width="0" style="display:none;visibility:hidden"></iframe></noscript>
  <!-- End Google Tag Manager (noscript) -->
```

### 9.3 Regras

| Regra | Motivo |
|---|---|
| Os **dois** blocos, sempre — `<head>` e `<noscript>` no `<body>` | Metade da instalação não mede nada |
| Mesmo `GTM-WSTL4F8` na LP, na `/obrigado/` e nas demais páginas da ação | Funil completo em um só container |
| GTM é o **primeiro** script do `<head>` | Não perde evento de quem sai rápido |
| Eventos e conversões são configurados **no painel do GTM**, não no código | A LP não dispara `dataLayer.push` customizado |

> Páginas de aviso `noindex` fora do funil (ex.: `/disclaimer/`) podem ficar sem GTM. Se precisar medir, replique os dois blocos.

---

## 10. Deploy e cache

### 10.1 Deploy automático

Push em `main` → GitHub Actions → FTP. [.github/workflows/deploy.yml](.github/workflows/deploy.yml):

- Secrets do repositório: `FTP_SERVER`, `FTP_USERNAME`, `FTP_PASSWORD`
- Variável: `FTP_SERVER_DIR` (default `./`)
- Excluídos do envio: `.git*`, `.github/`, `.claude/`, `uploads/`, `screenshots/`, `.thumbnail`

Ao criar o repositório de uma ação nova, cadastre os três secrets antes do primeiro push.

### 10.2 Cache-busting — obrigatório ao editar `app.js`

O `.htaccess` guarda JS/CSS por 30 dias e há CDN na frente. **Toda alteração no `app.js` exige incrementar a query string:**

```html
<script src="app.js?v=4" defer></script>   <!-- editou app.js? vira ?v=5 -->
```

Já causou incidente em produção (commit `a001963`, `v3 → v4`): a correção estava no repositório, o CDN continuava servindo a versão antiga e a atribuição ficou quebrada até alguém perceber.

### 10.3 Política de cache (`.htaccess`)

| Tipo | Cache |
|---|---|
| `.webp`, `.png`, `.jpg`, `.woff2` | 1 ano, `immutable` |
| `.css`, `.js` | 30 dias (por isso o `?v=`) |
| `.html` | `max-age=0, must-revalidate` |

Compressão via `mod_deflate` + `mod_brotli`. Copie o `.htaccess` como está para toda ação nova.

---

## 11. O que muda a cada ação

Tudo o mais é igual. Se algo fora desta lista precisou mudar, provavelmente vale atualizar este documento.

**Em `app.js`** — [app.js:4-20](app.js#L4-L20):

```js
var EVENT_DATE = '2026-08-29T09:00:00-03:00';   // data/hora do evento, SEMPRE com -03:00
var VAGAS_PCT  = 35;                             // % da barra de progresso

var WEBHOOKS = [ /* UUIDs da ação — n8n e Clint */ ];

var LOTES = [
  { num: 1, price: 32,
    start: '2026-07-02T00:00:00-03:00',
    end:   '2026-08-09T23:59:59-03:00',
    url:   'https://pay.hotmart.com/{PRODUTO}?off={OFERTA}&split=12&checkoutMode=10&hidewallet=1&sck={ORIGEM-LOTE}' },
  /* … um objeto por lote, sem buraco entre end de um e start do próximo … */
];
```

Regras dos lotes: datas ISO com `-03:00`; `sck` distinto por lote (é como o lote aparece no relatório da Hotmart); a virada é automática pelo relógio do visitante e reflete em todo `[data-lote="num"]` / `[data-lote="price"]` da página.

**No HTML:** copy, `<title>`, `<meta description>`, assets do hero e logos, textos do modal, links da `/obrigado/`.

**Fora do código:** UUIDs de webhook (n8n + Clint), produto/ofertas na Hotmart, secrets de FTP do repositório.

**Não muda:** GTM `GTM-WSTL4F8` · conta VK `cK0i3FbAiLmfmeAOoJlK` · `withForwardedParams()` · `formatBrPhone()` · lista `COUNTRIES` · estrutura do payload de webhook · `.htaccess`.

---

## 12. Checklist de lançamento

**Configuração**
- [ ] `EVENT_DATE` com timezone `-03:00`
- [ ] `LOTES[]` completo: `num`, `price`, `start`/`end`, `url` com `off`, `split`, `checkoutMode`, `hidewallet`, `sck` próprio
- [ ] Sem buraco entre o `end` de um lote e o `start` do seguinte
- [ ] `VAGAS_PCT` definido
- [ ] `WEBHOOKS[]` com os UUIDs da ação e `mode`/`ct` corretos por destino

**Responsividade**
- [ ] `<meta name="viewport">` em todas as páginas
- [ ] Títulos/leads/paddings com `clamp()`, não valores fixos
- [ ] Grids com `repeat(auto-fit, minmax(…, 1fr))`
- [ ] Testado em 360 / 680 / 900 / 1024 / 1440px
- [ ] Nenhuma largura com scroll horizontal
- [ ] `width`/`height` em toda `<img>`
- [ ] `scroll-margin-top` nas seções alvo de scroll suave

**Modal**
- [ ] Abre por **todos** os CTAs de compra
- [ ] Fecha por X, overlay e `Esc`
- [ ] Máscara `(XX) XXXXX-XXXX` ativa com BR; trocar DDI limpa o campo
- [ ] Bandeiras renderizam **no Windows** (fonte Twemoji copiada e carregada)

**Rastreamento**
- [ ] GTM `GTM-WSTL4F8`: bloco `<head>` **e** `<noscript>`, em todas as páginas do funil
- [ ] VK: pixel de leads + pixel de vendas no fim do `<body>`
- [ ] `data-no-xcod-url` presente no `sales_pixel.js`
- [ ] Abrir a LP com `?utm_source=x&utm_content=123&utm_campaign=y` e confirmar no checkout: UTMs presentes **e** `xcod` com `vid=123`
- [ ] Time de tráfego confirmou que o `utm_content` dos anúncios leva o ID do criativo

**Webhooks**
- [ ] Submit de teste chega no n8n IGT
- [ ] Submit de teste chega no CRM Clint (verificar **no painel**, não no console)
- [ ] Redirect para o checkout acontece mesmo com webhook fora do ar
- [ ] `keepalive: true` presente no `fetch`

**Deploy**
- [ ] Secrets de FTP cadastrados no repositório
- [ ] `?v=` do `app.js` incrementado
- [ ] `styles.css` e o CSS inline do `index.html` em sincronia
- [ ] Push em `main` → workflow verde → hard refresh em produção
