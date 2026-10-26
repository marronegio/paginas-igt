# A Black do Coaching — Captação (live 9/11, 20h)

Teste A/B/C da LP de captação. Segue o padrão do [README da raiz](../README.md).
Cada variação é autossuficiente (`assets/`, `app.js`). A página de obrigado é **uma só** para as três: `obrigado/`, com os próprios assets.

| Pasta | Hero | Resto da página |
|---|---|---|
| `oportunidade-v1a/` | "A Black do Coaching: o MAIOR desconto…" | seções 2–5 |
| `oportunidade-v1b/` | "Investimento não vai ser o problema…" | igual à v1a |
| `oportunidade-v1c/` | "Passei dos 40. Ainda dá pra virar coach?" | igual à v1a |

Fluxo: CTA → popup (nome, e-mail, WhatsApp) → webhooks n8n + Clint → `../obrigado/` (90%) → Grupo VIP.

`member-get-member/` é a página de indique e ganhe: gera o link da `oportunidade-v1a/`
com `utm_term` = e-mail de quem indicou. Detalhes no [README dela](member-get-member/README.md).

## Configuração da ação

| Item | Onde |
|---|---|
| Webhooks n8n + Clint | `app.js` → `WEBHOOKS` |
| Link do Grupo VIP (`black-do-coaching-grupos-wpp-nov26`) | `a-black-do-coaching/obrigado/ty.js` → `GROUP_URL` **e** `href` do `#group-cta` em `obrigado/index.html` |

Antes de mandar tráfego: faça um envio real e confira a chegada do lead nos
painéis do n8n e da Clint.

## Ao editar

- A v1a é a base. B e C só diferem nos trechos marcados com `<!--V:...-->` no
  `index.html` (topbar, hero, texto do botão, microcopy) e no `<title>`/description.
  Mudou algo fora desses trechos? Replique nas três.
- CSS: `styles.css` é a versão legível; o `<style>` do `index.html` é a minificada. Altere nos dois.
- JS: editou `app.js`/`ty.js`? Suba o `?v=` do `<script>`.

## Design

A copy gira em torno de um segredo: o preço só sai ao vivo. A assinatura da
página é esse **preço censurado** na hero (`R$` + tarja ciano, que "censura" o
valor no carregamento). O resto é tipografia condensada grande, branca, sobre
preto, sem caixas, bordas coloridas ou brilhos:

- data tipográfica `09.11` em cromado (eco do logo), sem card;
- as 3 perguntas como questionário, com linha em branco para responder;
- "Ação cura e inação adoece" gigante, mais largo que a coluna da carta;
- 2027 como balanço em duas colunas; itens da live em linhas (verbo grande + resto);
- botão ciano chapado com texto preto (placa de liquidação), sem glow;
- faixas cruzadas ciano + cromado entre a hero e o corpo e antes da chamada final.

Fundo: as seções são transparentes; o fundo é um só, na `.bk-root` (preto com
luzes ciano bem sutis), então não existe divisão visível entre seções.

Animações: a hero entra escalonada no carregamento. O resto aparece ao entrar
na tela rolando para baixo e some ao sair por baixo rolando para cima
(`initReveal()` no `app.js` + bloco "Animações de entrada" no `styles.css`).
Sem JS ou com `prefers-reduced-motion`, tudo fica visível e estático.
