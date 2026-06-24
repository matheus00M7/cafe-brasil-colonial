# Configurar pagamentos no Mercado Pago

O checkout já está implementado. Nenhuma credencial real foi colocada no projeto.

## 1. Criar a integração

1. Entre na sua conta de vendedor do Mercado Pago.
2. Acesse [Suas integrações](https://www.mercadopago.com.br/developers/panel/app).
3. Crie uma aplicação para o Café Brasil Colonial.
4. Abra **Credenciais de teste**.
5. Copie a **Public Key** e o **Access Token**.

## 2. Colocar as credenciais no projeto

Abra o arquivo `.env.local` e preencha:

```env
NEXT_PUBLIC_MERCADO_PAGO_PUBLIC_KEY=TEST-sua-public-key
MERCADO_PAGO_ACCESS_TOKEN=TEST-seu-access-token
```

As duas credenciais precisam ser copiadas da **mesma aplicação** no painel do
Mercado Pago. Misturar a Public Key de uma aplicação com o Access Token de
outra impede a geração do token do cartão.

Ao criar uma assinatura com credenciais `TEST`, o backend novo usa o modo
`auto`: tenta o ambiente `stage` e, se a própria política da aplicação recusar
esse ambiente, repete a solicitação no ambiente padrão. Para forçar um modo
durante um diagnóstico, use `stage` ou `default`:

```env
MERCADO_PAGO_SUBSCRIPTIONS_TEST_SCOPE=auto
```

O projeto utiliza assinatura **sem plano associado**. A requisição cria cada
assinatura diretamente em `/preapproval`, com:

- moeda `BRL`;
- preço e frequência selecionados no site;
- `card_token_id` gerado no navegador pelo `CardForm` oficial para assinaturas;
- `status: authorized`;
- Access Token mantido somente no servidor.

Não envie o Access Token para ninguém e não coloque essa chave no GitHub.

Depois feche e abra novamente o site pelo `INICIAR-SITE.bat`.

## 3. Testar

Use contas e cartões de teste fornecidos pelo Mercado Pago. Nunca teste cartão real com credenciais de teste.

Na assinatura com credenciais `TEST`, o servidor envia automaticamente o
pagador fictício `test_payer@testuser.com` exigido pelo exemplo oficial da API.
O e-mail que você digitar no site continua sendo salvo no pedido para
identificar o cliente, mas não é enviado como pagador real durante o teste.

O campo **Usuário** exibido nas Contas de teste como `TESTUSER...` é o username
usado para entrar na conta de teste do Mercado Pago. Ele não é um endereço de
e-mail e não deve ser digitado no checkout.

O fluxo será:

1. Cliente adiciona produtos.
2. Preenche entrega.
3. O servidor cria o pedido e recalcula os valores.
4. O Mercado Pago mostra Pix, cartão e boleto.
5. O cliente paga sem sair do site.
6. A página `/pedido/...` mostra o resultado.

## 4. Configurar webhooks

Depois que o site estiver publicado:

1. No painel da aplicação, abra **Webhooks > Configurar notificações**.
2. Cadastre:

   ```text
   https://seu-dominio.com.br/api/webhooks/mercado-pago
   ```

3. Ative o evento **Pagamentos** (`payment`).
4. Copie a assinatura secreta para:

   ```env
   MERCADO_PAGO_WEBHOOK_SECRET=sua-assinatura-secreta
   ```

O webhook atualiza automaticamente pagamentos Pix, boleto e cartão.

Para as assinaturas, a mesma URL também recebe:

- `subscription_preapproval` — criação e alteração da assinatura;
- `subscription_authorized_payment` — cobranças recorrentes.

O checkout recorrente utiliza cartão e cria a autorização diretamente pela API
`/preapproval` do Mercado Pago.

## 5. Banco online para produção

Localmente, os pedidos são gravados em `data/orders.db`.

Para publicar:

1. Crie um projeto no [Supabase](https://supabase.com).
2. Abra o SQL Editor.
3. Execute `supabase/schema.sql`.
4. Configure no servidor:

   ```env
   SUPABASE_URL=https://seu-projeto.supabase.co
   SUPABASE_SERVICE_ROLE_KEY=sua-chave-service-role
   ```

A chave `SUPABASE_SERVICE_ROLE_KEY` é secreta e nunca pode ser exposta no navegador.

## 6. Produção

Quando todos os testes passarem:

1. Troque as credenciais de teste pelas credenciais de produção.
2. Configure `NEXT_PUBLIC_SITE_URL` com o domínio HTTPS.
3. Cadastre a URL de produção do webhook.
4. Faça uma compra real de valor baixo.
5. Confira o pedido no banco e no painel do Mercado Pago.

Documentação oficial:

- [Checkout Bricks](https://www.mercadopago.com.br/developers/pt/docs/checkout-bricks/overview)
- [Payment Brick](https://www.mercadopago.com.br/developers/pt/docs/checkout-bricks/payment-brick/default-rendering)
- [Webhooks](https://www.mercadopago.com.br/developers/pt/docs/your-integrations/notifications/webhooks)
