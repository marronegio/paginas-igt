# A Black do Coaching — Indique e ganhe

Página de uma dobra só. Segue o padrão do [README da raiz](../README.md) e a
identidade visual de [`a-black-do-coaching/`](../a-black-do-coaching/README.md).

Fluxo: formulário (nome, e-mail, WhatsApp) → webhook n8n (só ele, sem Clint) → o link de
indicação aparece na tela, com **Copiar link** e **Enviar no WhatsApp**. Não há redirect.

O link é a LP da Black com o e-mail do indicador na `utm_term`:

```
https://landing.igtcoaching.com.br/lp/a-black-do-coaching/oportunidade-v1a/?utm_term=fulano@email.com
```

O e-mail vai em minúsculas. A captação da Black já manda `utm_term` no payload
do webhook, então cada inscrito que vier pelo link chega no CRM com o e-mail de
quem indicou.

## Configuração da ação

| Item | Onde |
|---|---|
| Página de destino do link | `app.js` → `REFERRAL_BASE_URL` |
| Webhook n8n (`87d61133-…`) | `app.js` → `WEBHOOKS` |
| Mensagem do botão do WhatsApp | `app.js` → `SHARE_TEXT` |

## Ao editar

- CSS: `styles.css` é a versão legível; o `<style>` do `index.html` é a minificada. Altere nos dois.
- JS: editou `app.js`? Suba o `?v=` do `<script>`.
- O botão "Enviar no WhatsApp" é `<button>`, não `<a>`: o pixel de vendas da VK
  reescreve o `href` de todo link da página e colaria `xcod`/`utm_content` na mensagem.

## Design

A tarja ciano que na LP da Black censura o preço aqui entrega o link: ao gerar,
ela entra varrendo da esquerda para a direita com o link escrito em preto.
O resto segue a Black: Saira Condensed em caixa alta, cromado + ciano, foto do
Geronimo à direita (no alto, no mobile e no tablet em pé), formulário direto
na página, sem card.
