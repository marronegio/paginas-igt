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

`fcc-oportunidade/` é a página de vendas da FCC na condição da Black, com a obrigado em
`fcc-oportunidade-obrigado/`. Segue o manual da FCC (não a identidade da captação).
Detalhes e pendências no [README dela](fcc-oportunidade/README.md).

`ao-vivo-v1/` e `ao-vivo-v2/` são a captação do dia da live: avisam que o Geronimo está
ao vivo no Zoom e levam o lead **direto para a sala**. Detalhes em [Captação ao vivo](#captação-ao-vivo).

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

## Captação ao vivo

Teste A/B da captação do dia 9/11. Copy: "Copy _ Página de captura _ Header Ao Vivo (09_11) _ Opções A e B".
Uma dobra só, na identidade da Black.

| Pasta | Copy | Headline |
|---|---|---|
| `ao-vivo-v1/` | Opção A (direta) | "Hoje, às 20h, vou revelar ao vivo o maior desconto…" |
| `ao-vivo-v2/` | Opção B (chá revelação) | "Chá revelação do Geronimo: Calma que é desconto!" |

Fluxo: CTA → popup (nome, e-mail, WhatsApp) → webhooks n8n + Clint (os mesmos da captação) →
**link do Zoom** (`links.igtcoaching.com.br/black-do-coaching-nov26-link-zoom`, com as UTMs
repassadas, como a obrigado faz com o grupo). Não há obrigado nem grupo.

O link fica em `ZOOM_URL`, no `app.js` **das duas pastas**. Trocou? Troque nas duas e suba o `?v=`.

Temporizador: a hora da live fica em `window.AV_LIVE_AT`, no `<head>` do `index.html` (nas duas
pastas). Antes dela: "A live começa em" (v1) / "A revelação começa em" (v2) + contagem. A partir
dela: lâmpada vermelha + ESTAMOS AO VIVO. A página já abre no estado certo e, se estiver aberta
às 20h, troca sozinha. O título do popup é o mesmo temporizador.

Ao editar: `styles.css` e `app.js` são **iguais** nas duas pastas (mudou num, copie no outro).
Só o `index.html` muda: headline, subheadline, texto do temporizador, ordem (v1: botão e depois o
temporizador; v2: o contrário), `<title>` e description.

Design: o único vermelho da página é a lâmpada do "ao vivo" (o 🔴 da copy), que acende piscando
como luz de estúdio no fim da entrada da hero e fica pulsando. Os dígitos da contagem são
cromados, cada um numa caixa fixa (a Saira não tem algarismos tabulares). Na v2, a tarja ciano
da Black cobre "Calma que é desconto!" e recolhe até virar o sublinhado que a copy pede.
Com "reduzir movimento", tudo aparece pronto e a lâmpada fica acesa sem pulsar.
