# Configurar a área do cliente

A área do cliente já funciona localmente com SQLite. Em produção, utilize
Supabase/PostgreSQL.

## Recursos implementados

- cadastro e login;
- senha protegida com `scrypt`;
- sessão revogável em cookie `HttpOnly`;
- recuperação de senha com link de uso único;
- dados pessoais e endereço criptografados com AES-256-GCM;
- perfil e endereço padrão;
- histórico e detalhes dos pedidos;
- assinaturas vinculadas à conta;
- bloqueio de pedidos de uma conta para visitantes ou outros clientes;
- preenchimento automático do checkout;
- nenhum dado de cartão armazenado pela loja.

## Banco recomendado

Use o **Supabase**, que fornece PostgreSQL gerenciado, backups, painel de banco
e conexão segura. Crie um projeto e execute `supabase/schema.sql` no SQL Editor.

Configure somente no servidor:

```env
SUPABASE_URL=https://seu-projeto.supabase.co
SUPABASE_SERVICE_ROLE_KEY=sua-chave-service-role
```

A `SUPABASE_SERVICE_ROLE_KEY` nunca pode ser colocada no navegador, enviada ao
GitHub ou compartilhada publicamente.

## Chave de criptografia

Gere uma chave no PowerShell:

```powershell
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Maximum 256 }))
```

Configure:

```env
CUSTOMER_DATA_ENCRYPTION_KEY=resultado-gerado
```

Guarde uma cópia segura. Perder essa chave impede a leitura dos dados
criptografados. Não troque a chave depois de possuir clientes sem antes fazer
uma migração dos dados.

## Recuperação de senha

O projeto usa a API do Resend quando configurada:

```env
RESEND_API_KEY=re_...
CUSTOMER_EMAIL_FROM=Café Brasil Colonial <contato@seudominio.com>
```

O domínio do remetente precisa ser validado no Resend. Localmente, quando a
chave não existe, a tela mostra um link de teste. Em produção, o link nunca é
mostrado na resposta.

## Publicação segura

- use domínio HTTPS;
- mantenha `.env.local` fora do Git;
- configure backups no Supabase;
- não armazene dados de cartão;
- troque imediatamente qualquer credencial exposta;
- preencha CNPJ e e-mail de privacidade no painel;
- revise a página `/privacidade` com o responsável jurídico da empresa;
- aplique atualizações de segurança regularmente.
- em hospedagens com várias instâncias, complemente o limite de tentativas com
  o firewall/rate limiting da hospedagem ou um serviço distribuído.
