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
| 2 | Fotos da Patricia Morais e do Léo Farah | o `<li>` de cada um em "Os professores deste MBA" está com `hidden`. Quando a foto chegar: recorte 4:5 em `assets/prof-<nome>.webp`, troque a silhueta pelo `<img>`, tire o `hidden` e renumere o `--i` dos `<li>` (comentário no HTML) |
| 3 | Mini-bios dos professores | a seção hoje mostra só foto e nome. A área de cada um (Neurociência, Liderança...) e o [MINI-BIO] estão na copy; quando as mini-bios chegarem, o card precisa de espaço para texto. O Robson Dias não está na lista de professores da copy: entrou com a foto, a área e a mini-bio dele também precisam vir |
| 4 | Logos de Next Shipping, Grupo Permaneo e Arcadis | `.mv-logos` (hoje são os nomes em texto) |

Editou `app.js`/`ty.js`? Suba o `?v=`. Depois, faça um envio real e confira o lead nos painéis do n8n e da Clint.

## Fases da Black (horário de Brasília)

As datas ficam no `<script>` do `<head>` de `oportunidade/index.html` (`window.MV_FASES`). Ele põe
`mv-p1`, `mv-p2` ou `mv-p3` no `<html>` antes do CSS, então a página já nasce certa:

Bônus (ajuste de última hora, 24/11):

- os 10 primeiros a se matricularem ganham o pack com os 3 livros (não é sorteio; os livros não vêm assinados);
- quem se matricular até 23h59 de 24/11 concorre a 1 dos 3 Kindles;
- quem se matricular na primeira hora ganha ticket duplo no sorteio dos Kindles.

| Fase | Quando | Barra do sorteio (contador, entre o topo e a hero) | Banners de bônus |
|---|---|---|---|
| 1 | até 23h59 de 24/11 | "concorra a um dos 3 Kindles" | os três: isenção, Kindles (com o ticket duplo da primeira hora) e pack dos 10 primeiros |
| 2 e 3 | a partir de 25/11 | sai | só o 1º (isenção da matrícula) |

O pack não tem sorteio no dia 25 e nada mais usa `data-show="2"`: a fase 2 ficou igual à 3, sem mexer no script.
O contador vai até 23h59 e a página troca de fase sozinha à meia-noite.
No HTML, `data-show="1"` marca o que só aparece em 24/11 (barra, banners 2 e 3 e os dois itens de bônus em
"O que só a Turma Fundadora tem"). O FAQ 12 usa datas fixas e fica nas três fases.

A página não sabe quantos já se matricularam nem quando abriu o carrinho: o banner do pack e o ticket duplo da
primeira hora só saem à meia-noite, junto com o resto da fase 1. Esgotou o pack ou passou a primeira hora? Tire
na mão.

A data do sorteio ficou de fora por enquanto. A copy a coloca em dois lugares: numa frase abaixo dos banners
("Os sorteios vão acontecer no dia [DATA A DEFINIR], e o nosso time vai avisar os ganhadores.") e no fim do FAQ 12
("O nosso time vai fazer os sorteios em [DATA A DEFINIR] e avisar os ganhadores."). Com o pack fora do sorteio,
os dois viram "o sorteio".

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
