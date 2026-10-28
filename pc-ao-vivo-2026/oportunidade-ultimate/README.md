# Oportunidade Ultimate — PC Ao Vivo 2026

Captação para o **Grupo Pré-Ultimate no WhatsApp**. Segue o padrão do
[README da raiz](../../README.md).

```
oportunidade-ultimate/
├── index.html          # Captura + popup — CSS crítico inline
├── app.js              # Popup, DDI, máscara, UTMs, webhooks
├── styles.css          # Fonte de verdade do CSS (o inline é a versão minificada)
├── .htaccess           # Compressão + cache
├── assets/
│   ├── hero-geronimo.webp        1672×941 · 91 KB
│   ├── TwemojiCountryFlags.woff2
│   └── fonts/  SairaCondensed-900 · Inter-400-800 (latin, self-hosted)
└── obrigado/
    ├── index.html · styles.css · ty.js
```

## Fluxo

```
Anúncio (UTMs) ──► index.html
                      │  CTA "Quero viver de coaching"
                      ▼
                  POPUP: nome + e-mail + WhatsApp (DDI)
                      │  submit
                      ├──► POST webhook n8n IGT
                      ├──► POST webhook CRM Clint
                      └──► /obrigado/ (UTMs) ──► grupo no WhatsApp
```

O popup segue a [§5](../../README.md#5-popup-pré-checkout): mesma estrutura de
overlay + modal com os dois estados irmãos (`#modal-form` / `#modal-success`),
delegação por `data-action`, três saídas (X, overlay e `Esc`), 3 campos, DDI com
bandeiras e máscara BR. A diferença é o destino — não há checkout, o submit leva
à `/obrigado/`.

Resto do padrão aplicado: os dois webhooks com `keepalive`, repasse integral de
UTMs, GTM nas duas páginas, Central de Links nas duas páginas e `data-ab-form` no
formulário ([§8](../../README.md#8-rastreamento-central-de-links)).

---

## Antes de subir — 2 pendências

| # | O que | Onde |
|---|---|---|
| 1 | **UUIDs de webhook** (n8n + Clint) — pedir para o responsável por automação | [app.js:25](app.js#L25) e [app.js:29](app.js#L29) |
| 2 | **Link do grupo de WhatsApp** — trocar nos **dois** lugares | [obrigado/ty.js:14](obrigado/ty.js#L14) e [obrigado/index.html](obrigado/index.html) |

Sobre (2): o `ty.js` reescreve o `href` para repassar as UTMs; o valor no HTML é
o fallback de quem estiver sem JS. Os dois precisam do mesmo link.

## Sobre a imagem do hero

`assets/hero-geronimo.webp` — **1672 × 941**. Veio em WebP lossless (1125 KB) e
foi reencodada em lossy q90 (**91 KB**, PSNR 43,6 dB — diferença imperceptível).
É o LCP da página e tem `preload`; 1 MB no 4G custava conversão.

Trocar a foto por outra de proporção diferente exige atualizar o `aspect-ratio`
da `.ou-hero-bg` na media query de mobile — em [styles.css](styles.css) **e** no
inline do [index.html](index.html).

---

## Ao editar

- **CSS:** `styles.css` é a versão legível, o `<style>` do `index.html` é a
  minificada. O navegador só lê o inline — **altere sempre nos dois**.
- **JS:** incrementou `app.js` ou `ty.js`? Suba o `?v=` no `<script>`
  correspondente ([§10.2](../../README.md#102-cache-busting--obrigatório-ao-editar-appjs)).

## Design

Direção tirada da própria foto: preto de palco, feixe ciano, e um acento por
função — vermelho só na tarja de urgência, ciano na estrutura, verde só no
botão (é para onde ele leva). O "eixo de luz" ciano atravessa as duas páginas:
hairline sob o título na captura, barra de progresso na obrigado, e a varredura
dentro do botão — os três na mesma cadência (`--beat: 3.2s`), de modo que a luz
pareça sair da foto e chegar na ação. Tudo desligado em
`prefers-reduced-motion`.

## Verificado

- 360 / 390 / 485 / 680 / 900 / 1024 / 1366 / 1440px — sem scroll horizontal
- CTA acima da dobra em todas essas larguras; no desktop a página inteira cabe
  na janela, sem rolagem
- Popup: abre pelo CTA · fecha no X, no overlay e no `Esc` · clique dentro não
  fecha · foco vai para o primeiro campo ao abrir e volta ao CTA ao fechar ·
  `Tab` não escapa do modal · scroll do fundo travado
- Validação bloqueia submit vazio (3 erros, 3 campos marcados, sem navegar)
- Máscara BR `(11) 98765-4321` · trocar DDI limpa o campo e libera formato livre
- Submit: `#modal-success` aparece **e** o redirect dispara
- Payload dos dois webhooks conforme [§7.2](../../README.md#72-payload-padrão),
  com `mode`/`Content-Type` certos por destino e `keepalive: true`
- UTMs (inclusive `fbclid`) chegam na `/obrigado/`; UTMs
  seguem para o link do grupo
- CSS inline parseado inteiro pelo navegador (86 regras, nenhuma at-rule vazia)
