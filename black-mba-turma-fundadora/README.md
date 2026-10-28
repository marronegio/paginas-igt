# Black MBA · Turma Fundadora: captação (revelação ao vivo 24/11, 20h)

LP de captação do MBA em Neurociência e Liderança de Alta Performance (EHaF, by IGT).
Segue o padrão do [README da raiz](../README.md). Copy: artefato "Página de captura · Turma Fundadora".

| Pasta | Página |
|---|---|
| `captacao/` | LP de captação |
| `obrigado/` | Página de obrigado (Grupo VIP) |

Fluxo: CTA → popup (nome, e-mail, WhatsApp) → webhooks n8n + Clint → `../obrigado/` → Grupo VIP.

## Configuração da ação

| Item | Onde | Status |
|---|---|---|
| Webhooks n8n + Clint | `captacao/app.js` → `WEBHOOKS` | configurados |
| Link do Grupo VIP | `obrigado/ty.js` → `GROUP_URL` **e** `href` do `#group-cta` em `obrigado/index.html` | **pendente** (`COLE-AQUI-…`) |

Enquanto o link do grupo tiver `COLE-AQUI`, a obrigado não redireciona sozinha.
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
  É a única animação da página: as molduras se juntam quando o diagrama entra na tela
  (sem JS ou com `prefers-reduced-motion`, aparecem já juntas);
- a ficha "O MBA", a data da revelação na hero e o painel da condição usam a mesma moldura;
- na chamada final e na obrigado, molduras soltas ficam só nas laterais, sem cruzar o texto.

Ritmo das seções: escuro (hero) → claro (pesquisa) → slate (para quem é) → claro (ficha)
→ escuro (condição) → claro (EHaF) → escuro (chamada final). As assinaturas dos
depoimentos usam o nome espaçado em caixa alta, recurso do manual.

Hero: a foto é dimensionada pela largura e fica sempre à direita; a coluna de texto
vai até 47vw. Abaixo de 1024px a foto vira faixa no topo e o texto desce; abaixo de
680px entra o recorte `hero-mba-mobile.webp`, centrado no Geronimo.
