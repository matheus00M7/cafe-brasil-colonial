# Café Brasil Colonial

E-commerce completo em Next.js com catálogo, carrinho persistente, checkout integrado ao Mercado Pago, pedidos no servidor, Pix, cartão, boleto, página de status, webhook e área de café por assinatura.

## Área do cliente

O site possui cadastro, login, recuperação e alteração de senha, perfil,
endereço padrão, histórico de pedidos e gerenciamento das assinaturas.

As senhas são protegidas com `scrypt`, os dados pessoais são criptografados e
as sessões utilizam cookies `HttpOnly`. O site não armazena número, validade ou
CVV do cartão.

Leia [CONFIGURAR-AREA-CLIENTE.md](CONFIGURAR-AREA-CLIENTE.md) antes de publicar.

## Rodar sem WebStorm

Dê dois cliques em:

```text
INICIAR-SITE.bat
```

O arquivo instala o que estiver faltando, inicia o projeto e abre:

```text
http://localhost:3000
```

Para desligar, pressione `Ctrl+C` na janela que foi aberta.

## Painel administrativo

Para abrir diretamente o painel, dê dois cliques em:

```text
INICIAR-PAINEL.bat
```

Ou acesse:

```text
http://localhost:3000/admin
```

O painel possui:

- login protegido;
- visão geral financeira e operacional;
- lista, busca e filtros de pedidos;
- dados de cliente, endereço e pagamento;
- andamento: novo, separação, pronto, enviado e entregue;
- código de rastreio e observações internas;
- exportação de pedidos em CSV;
- gestão de nome, descrição, imagem, preço, estoque, destaque e disponibilidade de produtos;
- aba **Conteúdo da loja** para logotipos, carrossel, capa, textos, contatos, CNPJ e imagens institucionais;
- controle das seções exibidas na página inicial;
- configuração de frete, limite de frete grátis e dados de divulgação;
- checklist das integrações da loja.

Para trocar a senha sem editar arquivos, dê dois cliques em:

```text
TROCAR-SENHA-ADMIN.bat
```

As credenciais administrativas são configuradas apenas no `.env.local`:

```env
ADMIN_EMAIL=
ADMIN_PASSWORD_HASH=
ADMIN_SESSION_SECRET=
```

## Rodar pelo terminal

```powershell
cd "C:\Users\mathe\Documents\Codex\2026-06-19\files-mentioned-by-the-user-manual\outputs\cafe-brasil-colonial"
npm.cmd install
npm.cmd run dev
```

## Configurar pagamentos

Leia [CONFIGURAR-PAGAMENTO.md](CONFIGURAR-PAGAMENTO.md).

Resumo das variáveis:

```env
NEXT_PUBLIC_MERCADO_PAGO_PUBLIC_KEY=
MERCADO_PAGO_ACCESS_TOKEN=
MERCADO_PAGO_WEBHOOK_SECRET=
```

Sem essas credenciais, o projeto cria e calcula o pedido, mas exibe um aviso no lugar do formulário de pagamento. Use primeiro as credenciais de teste.

## Como funciona

```text
Carrinho
  → dados e entrega
  → pedido criado no servidor
  → preços recalculados
  → Payment Brick do Mercado Pago
  → Pix, cartão ou boleto
  → página de status do pedido
  → webhook atualiza a confirmação
```

Os dados do cartão são coletados pelos componentes seguros do Mercado Pago. O projeto não armazena número de cartão ou código de segurança.

## Café por assinatura

A rota `/assinatura` apresenta os planos Essencial Colonial, Gourmet da
Fazenda e Experiência Especial. O cliente escolhe:

- frequência mensal ou bimestral;
- café em grãos ou moído;
- quantidade disponível no plano.

O cliente escolhe o plano e conclui o cadastro, endereço e cartão em
`/assinatura/checkout`. A API de Assinaturas do Mercado Pago cria a cobrança
recorrente autorizada. O cartão é tokenizado pelo Mercado Pago e não é
armazenado pela loja.

O painel possui a rota `/admin/assinaturas`, com listagem, receita recorrente
estimada e ações para pausar, reativar ou cancelar uma assinatura. Os preços
dos planos podem ser alterados em **Conteúdo da loja > Frete e divulgação**.

Após contratar, o cliente recebe na tela de confirmação um acesso protegido à
página `/assinatura/gerenciar`, onde pode pausar, reativar ou cancelar sem
falar com o atendimento.

Os planos e textos comerciais ficam centralizados em:

```text
src/data/subscriptions.ts
```

## Banco de pedidos

- Desenvolvimento: SQLite em `data/orders.db`, criado automaticamente.
- Produção: Supabase/PostgreSQL quando `SUPABASE_URL` e `SUPABASE_SERVICE_ROLE_KEY` estiverem configurados.
- Estrutura para Supabase: `supabase/schema.sql`.

As configurações de conteúdo e produtos também são guardadas nesse banco.
Imagens enviadas pelo painel local são salvas em `public/uploads/`. Em uma
hospedagem com disco temporário, configure um armazenamento permanente de
arquivos antes de colocar a loja em produção.

## Páginas

- `/` — loja
- `/produtos` — catálogo
- `/produtos/[slug]` — produto
- `/assinatura` — clube de assinatura
- `/assinatura/checkout` — cadastro e cartão da assinatura
- `/assinatura/sucesso` — confirmação da assinatura
- `/carrinho` — carrinho
- `/checkout` — entrega e pagamento
- `/pedido/[id]` — confirmação, Pix, boleto e status
- `/nossa-historia`
- `/origem`
- `/atacado`
- `/contato`

## APIs

- `POST /api/checkout/session` — valida o carrinho e cria o pedido
- `POST /api/payments` — cria a cobrança no Mercado Pago
- `GET /api/orders/[id]` — consulta o status
- `POST /api/webhooks/mercado-pago` — recebe atualizações

## Alterações comuns

Use `/admin/conteudo` para identidade, contatos, carrossel, imagens, textos e
frete. Use `/admin/produtos` para catálogo, fotos, preço e estoque. Não é
necessário editar o código para essas tarefas.

## Variáveis completas

```env
NEXT_PUBLIC_WHATSAPP_NUMBER=5500000000000
NEXT_PUBLIC_SITE_NAME=Café Brasil Colonial
NEXT_PUBLIC_INSTAGRAM_URL=
NEXT_PUBLIC_CONTACT_EMAIL=
NEXT_PUBLIC_SITE_URL=http://localhost:3000

NEXT_PUBLIC_MERCADO_PAGO_PUBLIC_KEY=
MERCADO_PAGO_ACCESS_TOKEN=
MERCADO_PAGO_WEBHOOK_SECRET=

STANDARD_SHIPPING_PRICE=18.90
FREE_SHIPPING_THRESHOLD=199
ORDER_DATABASE_PATH=./data/orders.db

SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=

CUSTOMER_DATA_ENCRYPTION_KEY=
RESEND_API_KEY=
CUSTOMER_EMAIL_FROM="Café Brasil Colonial <contato@seudominio.com>"
```

## Antes de publicar

- Colocar preços e fotografias reais
- Configurar Mercado Pago em produção
- Criar banco Supabase e executar o schema
- Gerar e guardar a `CUSTOMER_DATA_ENCRYPTION_KEY`
- Configurar o envio de recuperação de senha
- Configurar webhook
- Usar domínio com HTTPS
- Inserir CNPJ, termos e política de privacidade
- Integrar cálculo de frete real, se necessário
- Fazer compra real de valor baixo para homologação
