# Black MBA · Turma Fundadora

MBA em Neurociência e Liderança para Alta Performance (EHaF, by IGT).
Segue o padrão do [README da raiz](../README.md).

| Pasta | Página |
|---|---|
| `captacao/` | LP de captação (revelação ao vivo 24/11, 20h) |
| `obrigado/` | Obrigado da captação (Grupo VIP) |
| `oportunidade/` | Página de vendas: ver [Página de vendas](#página-de-vendas-carrinho-24-a-3011) |
| `oportunidade-obrigado/` | Obrigado da página de vendas (destino do checkout) |

# Captação

Copy: artefato "Página de captura · Turma Fundadora".

Fluxo: CTA → popup (nome, e-mail, WhatsApp) → webhooks n8n + Clint → `../obrigado/` → Grupo VIP.

## Configuração da ação

| Item | Onde | Status |
|---|---|---|
| Webhooks n8n + Clint | `captacao/app.js` → `WEBHOOKS` | configurados |
| Link do Grupo VIP (`black-mba-grupos-wpp-nov26`) | `obrigado/ty.js` → `GROUP_URL` **e** `href` do `#group-cta` em `obrigado/index.html` | configurado |

Antes de mandar tráfego, faça um envio real e confira a chegada do lead nos
painéis do n8n e da Clint.

## Ao editar

- CSS: `styles.css` é a versão legível; o `<style>` do `index.html` é a minificada. Altere nos dois.
- JS: editou `app.js`/`ty.js`? Suba o `?v=` do `<script>`.
- Data da revelação (contador do topo): `captacao/app.js` → `REVEAL_DATE`.

## Design

Segue o Manual de Identidade Visual do MBA: paleta `#3C4451` · `#727B8A` · `#967458` ·
`#CCCCCC` · `#FBFBFA` e Kumbh Sans (self-hosted em `assets/fonts/`).

A assinatura da página é o **grafismo da marca** (molduras de linha fina, cantos
arredondados, prata → bronze, as mesmas da foto da hero):

- na seção "Para quem lidera", duas molduras se cruzam e formam o diagrama dos dois
  eixos do MBA: Neurociência (prata) e Liderança (bronze), com o logo na interseção.
  As molduras se juntam quando o diagrama entra na tela (sem JS ou com
  `prefers-reduced-motion`, aparecem já juntas);
- no fundo da seção da condição, linhas finas prata e bronze saem das bordas e um
  ponto de luz corre por cada uma, em ritmos e sentidos diferentes (só CSS; posição
  e ritmo de cada linha nos `style` do `.mb-offer__lines`). O painel é levemente
  translúcido para a luz passar por trás. Com `prefers-reduced-motion`, as linhas
  ficam paradas e sem luz;
- a ficha "O MBA", a data da revelação na hero e o painel da condição usam a mesma moldura;
- na chamada final e na obrigado, molduras soltas ficam só nas laterais, sem cruzar o texto.

Ritmo das seções: escuro (hero) → claro (pesquisa) → slate (para quem é) → claro (ficha)
→ escuro (condição) → claro (EHaF) → escuro (chamada final). As assinaturas dos
depoimentos usam o nome espaçado em caixa alta, recurso do manual.

Hero: a foto é dimensionada pela largura e fica sempre à direita; a coluna de texto
vai até 47vw. Abaixo de 1024px a foto vira faixa no topo e o texto desce; abaixo de
680px entra o recorte `hero-mba-palco-mobile.webp`, centrado no Geronimo.

---

# Página de vendas (carrinho 24 a 30/11)

Copy: "Copy · Página de Vendas + Página de Obrigado (Black MBA)".

| Pasta | Página |
|---|---|
| `oportunidade/` | Página de vendas |
| `oportunidade-obrigado/` | Página de obrigado (destino do checkout) |

Fluxo: CTA → popup (nome, e-mail, WhatsApp) → webhooks n8n + Clint → checkout → Hotmart
redireciona para `oportunidade-obrigado/`.

Configuração (`oportunidade/app.js`):

| O que | Valor |
|---|---|
| Checkout (`CHECKOUT_URL`) | `https://pay.hotmart.com/N108554917X?off=ovemfiuz&split=12&checkoutMode=10&hidewallet=1&sck=oportunidade-mba-nov26` |
| Webhook n8n | `https://webhook.igtcoaching.com.br/webhook/03e851f3-364a-42d9-8b51-f312741e3014` |
| Webhook Clint | `https://functions-api.clint.digital/endpoints/integration/webhook/4623d7a7-d516-4a72-a909-bb1682856182` |

O checkout já abre com nome, e-mail e telefone do popup: vão como `name`, `email`, `phoneac` (DDD)
e `phonenumber` (número sem DDD; fora do Brasil vai só o número, sem DDI), os parâmetros de
preenchimento da Hotmart. A Hotmart só preenche o "Celular" se o número for um celular brasileiro
válido (DDD + 9 + 8 dígitos): telefone fixo ou número inventado (ex.: 11 12345-6789) chega vazio,
sem erro. Para testar, use um celular de verdade.

O checkout é o link direto da Hotmart, não o do encurtador (`links.igtcoaching.com.br/oportunidade-mba-nov26`
descartava os parâmetros e o checkout abria vazio). As UTMs da URL vão somadas a ele sem sobrescrever o que o
link já traz: o `sck=oportunidade-mba-nov26` fica fixo. As UTMs do lead também vão nos webhooks.

Link do time (WhatsApp): `https://links.igtcoaching.com.br/fale-com-o-time`, no `href` do botão
"Falar com o nosso time" (`oportunidade/index.html`) e "Fale com o nosso time" (`oportunidade-obrigado/index.html`).
Os `utm_*` da URL vão somados a ele.

Link da pesquisa (Typeform): `https://igtcoaching.typeform.com/to/JxlrdwJo`, no `href` do botão
"Responder a pesquisa agora" (`oportunidade-obrigado/index.html`). Os `utm_*` da URL vão somados a ele;
o Typeform só guarda os que existirem como hidden fields no formulário.

## Pendências antes de subir

| # | O que | Onde |
|---|---|---|
| 1 | Página de obrigado da Hotmart apontando para `oportunidade-obrigado/` | painel da Hotmart |
| 2 | Texto entre colchetes da copy: [MINI-BIO] (6 professores) | `oportunidade/index.html`: ficam com fundo bronze (`.mv-tbd`) para ninguém publicar sem trocar. Ao trocar, tire o `<span class="mv-tbd">` |
| 3 | Fotos dos 6 professores | trocar a silhueta de cada `.mv-prof__photo` por `<img>` (comentário no HTML) |
| 3b | Seção "Os professores deste MBA" está **escondida** (atributo `hidden` no `<section>`) | depois de fazer o 2 e o 3, tire o `hidden` para ela voltar à página |
| 4 | Logos de Next Shipping, Grupo Permaneo e Arcadis | `.mv-logos` (hoje são os nomes em texto) |

Editou `app.js`/`ty.js`? Suba o `?v=`. Depois, faça um envio real e confira o lead nos painéis do n8n e da Clint.

## Fases da Black (horário de Brasília)

As datas ficam no `<script>` do `<head>` de `oportunidade/index.html` (`window.MV_FASES`). Ele põe
`mv-p1`, `mv-p2` ou `mv-p3` no `<html>` antes do CSS, então a página já nasce certa:

| Fase | Quando | Barra do sorteio (contador, entre o topo e a hero) | Banners de bônus |
|---|---|---|---|
| 1 | até 23h59 de 24/11 | faixa do Kindle + pack de livros | os três; o 3º diz "Até amanhã, 23h59" |
| 2 | 25/11 | faixa do pack de livros | 1º e 3º; o 3º diz "Só até hoje, 23h59" |
| 3 | depois de 25/11 | sai | só o 1º (isenção da matrícula) |

O contador vai sempre até 23h59 do dia e a página troca de fase sozinha à meia-noite.
No HTML, `data-show="1"`, `"2"` e `"12"` marcam o que aparece em cada fase.
Na fase 3 a seção "O que só a Turma Fundadora tem" e o FAQ 12 continuam falando dos sorteios (a copy não traz outra versão).

A data dos sorteios ficou de fora por enquanto. A copy a coloca em dois lugares: numa frase abaixo dos banners
("Os sorteios vão acontecer no dia [DATA A DEFINIR], e o nosso time vai avisar os ganhadores.", com
`data-show="12"`) e no fim do FAQ 12 ("O nosso time vai fazer os sorteios em [DATA A DEFINIR] e avisar os ganhadores.").

## Ao editar

- CSS: `styles.css` é a versão legível; o `<style>` do `index.html` é a minificada. Altere nos dois.
- Os botões "Quero ser da Turma Fundadora" abrem o popup por `data-action="openCheckout"`: some quantos quiser sem mexer no JS.
- Os links com `data-forward` (time e pesquisa) recebem só os `utm_*` da URL; com `href="#"` ficam como estão.

## Design

A mesma identidade da captação (tokens, Kumbh Sans, botão bronze, molduras prata → bronze) e o
mesmo ritmo de fundos escuro / claro / slate. Da captação vêm: a hero com a foto do palco e o
destaque bronze em "MBA reconhecido pelo MEC" (que varre na entrada), o diagrama dos dois eixos
(agora com os 3 módulos de cada eixo e o logo na interseção), as linhas de luz atrás de bônus +
preço e as molduras vivas no aviso das matrículas.

A assinatura desta página é a **escada de preço**: cada degrau é um canto de moldura do grafismo
(o mesmo das molduras escalonadas da foto da hero), recuado em relação ao anterior, descendo até o
painel da Turma Fundadora. O risco bronze se desenha sobre o R$ 10.990 quando ele entra na tela.
No painel, o número grande é a parcela (12x de R$ 498,02); o à vista (R$ 4.990) fica pequeno embaixo.

- Hero compacta: logo e assinatura lado a lado (empilhados no tablet e no celular), coluna de texto
  de até 700px e a foto deslocada 8% para a direita para abrir espaço; a foto nunca passa da altura
  da hero. O contador do sorteio é uma barra bronze de largura total logo abaixo do topo.
- Comparação "instinto × método": a coluna do método fica dentro de uma moldura; no celular os
  títulos viram legenda e cada item mostra o par (traço apagado, check bronze).
- "Dois caminhos": o improviso tem borda tracejada; a Turma Fundadora, a moldura, com o botão dentro.
- Fotos: `geronimo-pb.webp` (citação) é a foto do bio em P&B com o fundo trocado por um cinza escuro;
  `geronimo-sereno.webp` ("Quem está por trás") é a foto de óculos da obrigado da Black do Coaching,
  recortada em retrato e com o azul do fundo levado para o cinza-aço da paleta.

Animações só com `html.mv-anim` (IntersectionObserver e sem "reduzir movimento"): entrada da hero,
números que contam, eixos que se juntam, risco do R$ 10.990, linhas e molduras (só rodam com a seção
na tela). Sem JS ou com "reduzir movimento", tudo aparece pronto e o FAQ fica aberto.

Obrigado: fundo escuro com as molduras nas laterais (como a obrigado da captação), barra de 90%
prata → bronze que enche na entrada e os três passos como linha do tempo.
