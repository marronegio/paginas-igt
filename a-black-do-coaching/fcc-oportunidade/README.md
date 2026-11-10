# A Black do Coaching — Página de vendas da FCC

Página de vendas da Formação em Coaching Criacional na condição da Black.
Segue o padrão do [README da raiz](../../README.md). Copy: "(Ajustado) Copy · Página de Vendas + Página de Obrigado".

| Pasta | Página |
|---|---|
| `fcc-oportunidade/` | Página de vendas |
| `fcc-oportunidade-obrigado/` | Página de obrigado (destino do checkout) |

Fluxo: CTA → popup (nome, e-mail, WhatsApp) → webhooks n8n + Clint → **WhatsApp do comercial**
(`links.igtcoaching.com.br/fale-com-o-comercial`, em `COMERCIAL_URL` no `app.js`, com os parâmetros
da URL repassados, menos `xcod`). Desde 09/11/2026 o popup não leva mais ao checkout da Hotmart.
Quem compra pelo checkout continua sendo levado pela Hotmart para `fcc-oportunidade-obrigado/`.

## Pendências antes de subir

| # | O que | Onde |
|---|---|---|
| 1 | Página de obrigado da Hotmart apontando para `fcc-oportunidade-obrigado/` | painel da Hotmart |

Editou o `app.js`? Suba o `?v=` do `<script>`. Depois, faça um envio real e confira o lead nos painéis do n8n e da Clint.

## Fases da Black (horário de Brasília)

As datas ficam no `<script>` do `<head>` do `index.html` (`window.FC_FASES`). Ele põe
`fc-p1`, `fc-p2` ou `fc-p3` no `<html>` antes do CSS, então a página já nasce certa:

| Fase | Quando | Faixa do contador | Banners de bônus |
|---|---|---|---|
| 1 | até 23h59 de 09/11 | texto da aula "Como eu atendo online" | os dois; o 2º diz "Só até amanhã" |
| 2 | 10/11 | texto da Imersão Viver de Coaching | só o 2º, dizendo "Só até hoje" |
| 3 | depois de 10/11 | sai | saem |

O contador vai sempre até 23h59 do dia, e a página troca de fase sozinha à meia-noite.
No HTML, `data-show="1"`, `"2"` e `"12"` marcam o que aparece em cada fase.

## Ao editar

- CSS: `styles.css` é a versão legível; o `<style>` do `index.html` é a minificada. Altere nos dois.
- JS: editou `app.js`/`ty.js`? Suba o `?v=` do `<script>`.
- Os vídeos dos cases são IDs do YouTube no `data-yt` de cada botão; o player só carrega ao clicar.

## Design

Segue o Manual de Identidade Visual da FCC: paleta `#0094BA` · `#E5B100` · `#00657B` (+ tons),
Raleway Black em caixa alta nos títulos, Montserrat nos textos, botão em pílula dourada
com texto em itálico (no hover fica azul com brilho, como no manual). O texto do botão é
petróleo e não branco: branco sobre o dourado não tem contraste para leitura.

- Fundo escuro `#002A38`, tirado da própria foto da hero, para a foto não ter emenda.
- **Fita dourada** (a aplicação "ENCERRA HOJE" do manual) só no que é da Black e tem hora
  para acabar: "maior desconto da história da Formação" na headline, contador, títulos dos
  banners de bônus e selo do bloco de preço. Na headline ela varre durante a entrada da hero;
  nos banners e no selo, ao entrar na tela.
- **Risco dourado** que se desenha sobre os preços antigos: R$ 4.995 na hero (fecha a
  entrada da hero), R$ 30.000 e R$ 4.995 no fim da carta, R$ 4.995 no bloco de preço,
  antes de o valor da Black aparecer.
- Grafismo do manual (`assets/grafismo.webp`, tile de 131×398 que repete sem emenda):
  azul sobre o branco; nas seções escuras, a mesma malha vira máscara tingida de dourado ou azul.
- O "90%" conta de 0 a 90 ao entrar na tela; os 6 losangos da mentoria acendem um a um.

Animações só com `html.fc-anim` (há IntersectionObserver e o visitante não pediu menos
movimento). Sem JS ou com "reduzir movimento", tudo aparece pronto e o FAQ fica aberto.

Hero: no desktop a foto é `cover` à direita. Abaixo de 980px vira faixa no topo e o texto
desce; abaixo de 680px entra o recorte `hero-geronimo-mobile.webp`, centrado no Geronimo, e as
duas logos sobem para o canto superior esquerdo da foto, empilhadas: o selo da Black em cima e a
logo FCC embaixo (assim a logo dourada não cai sobre a linha dourada da foto).

## Obrigado

Os dois botões ("Falar com meu time" e "Fale com a gente aqui") vão para
`links.igtcoaching.com.br/fale-com-o-time`. O `ty.js` repassa só os `utm_*`: a Hotmart pode
devolver dados da compra na URL, e eles não devem ir para o link do WhatsApp.
