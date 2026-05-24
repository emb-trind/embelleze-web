<!-- markdownlint-disable MD003 MD007 MD013 MD022 MD023 MD025 MD029 MD032 MD033 MD034 -->
# SETUP

```text
========================================
   EMBELLEZE TRINDADE · SETUP
========================================
Framework : Astro
Runtime   : Node.js >=22.0.0
Deploy    : Railway
========================================
```

## ⟠ Pré-requisitos

```text
┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
┃ REQUISITO     VERSÃO
┣━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
┃ Node.js       >=22.12.0
┃ pnpm          >=10.0.0
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

Se usar `mise`:

```bash
mise install node@22
mise use node@22
```

────────────────────────────────────────

## ⨷ Instalação

```bash
cd embelleze-web
pnpm install
```

────────────────────────────────────────

## ⧉ Variáveis de Ambiente

Copie o arquivo de exemplo e preencha as chaves
após receber os acessos do cliente:

```bash
cp .env.example .env
```

```text
┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
┃ VARIÁVEL                  OBRIGATÓRIA   FONTE
┣━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
┃ DATABASE_URL              sim           Railway Postgres
┃ REDIS_URL                 sim           Railway Redis
┃ AZURE_OPENAI_ENDPOINT     sim           Azure OpenAI
┃ AZURE_OPENAI_API_KEY      sim           Azure OpenAI
┃ AZURE_OPENAI_DEPLOYMENT   sim           Azure OpenAI
┃ WHATSAPP_WEBHOOK_SECRET   sim           gerado — mesmo valor em neo-whatsapp-connect
┃ FLOWPAY_WEBHOOK_SECRET    sim           gerado — configurar no FlowPay como Bearer
┃ WHATSAPP_GATEWAY_URL      sim           URL do neo-whatsapp-connect em produção
┃ RESEND_API_KEY            sim           Resend dashboard
┃ RESEND_FROM               sim           ex: bella@embelleze-bella.online
┃ PROBELTEC_API_KEY         sim           Probeltec CRM
┃ PUBLIC_GTM_ID             não           Google Tag Manager (opcional)
┃ PUBLIC_META_PIXEL_ID      não           Meta Business Suite (opcional)
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

> `WHATSAPP_WEBHOOK_SECRET` e `FLOWPAY_WEBHOOK_SECRET` devem ser strings
> aleatórias fortes (ex: `openssl rand -base64 32`). O endpoint retorna 503
> se a variável não estiver configurada — fail closed por design.
>
> Enquanto `PUBLIC_GTM_ID` e `PUBLIC_META_PIXEL_ID` não estiverem preenchidos,
> GTM e Meta Pixel simplesmente não são injetados. O build não quebra.

────────────────────────────────────────

## ⧇ Comandos

```bash
# servidor local com hot reload
npm run dev

# build de produção (saída em /dist)
npm run build

# preview do build gerado
npm run preview
```

────────────────────────────────────────

## ⍟ Estrutura do Projeto

```text
embelleze-web/
├── public/
│   ├── bella/          fotos da Bella (a inserir)
│   ├── brand/          logos e brandbook
│   └── social/         provas sociais aprovadas
│
├── src/
│   ├── pages/          index, mapa, oferta, obrigado
│   ├── sections/       blocos da home (um por seção)
│   ├── components/     UI reutilizável
│   ├── layouts/        BaseLayout.astro
│   ├── content/        dados editáveis (JSON + MD)
│   ├── lib/            whatsapp, tracking, geo, discount
│   ├── styles/         tokens, global, animations
│   └── scripts/        scripts client-side
│
├── docs/               documentação estratégica
├── .env.example        modelo de variáveis
├── astro.config.mjs    configuração do Astro
└── SETUP.md            este arquivo
```

────────────────────────────────────────

## ◬ Conteúdo Editável

Estes arquivos não exigem toque no código:

```text
▓▓▓ CONTEÚDO
────────────────────────────────────────
└─ src/content/courses.json
   Cursos, horários e dados confirmados.
   confirmed: false = exibe fallback WA.

└─ src/content/offers.json
   Oferta ativa na home.
   Alterar courseId para trocar o curso em destaque.

└─ src/content/testimonials.json
   Depoimentos. approved: true para exibir.

└─ src/content/vitoria.web.md
   Prompt da Vitória — atendimento via chat do site.

└─ src/content/bella.knowledge.md
   Base de conhecimento estratégica da Bella (WhatsApp).
   Não exposta no site — uso interno do SDR.
```

────────────────────────────────────────

## ◭ Deploy — Railway

```bash
# build detectado automaticamente pelo Railway
npm run build
# saída em: /dist
```

```text
┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
┃ AMBIENTE      DOMÍNIO
┣━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
┃ Provisório    embelleze-trindade.flowoff.xyz
┃ Produção      embelleze-bella.online
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

> O adapter Node já está instalado e configurado (`@astrojs/node`).
> O projeto é SSR — não é necessário nenhum passo adicional para rotas dinâmicas.

────────────────────────────────────────

## ◬ Banco de Dados (PostgreSQL)

Para inicializar a tabela de leads no Railway, execute o seguinte SQL:

```sql
CREATE TABLE leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  phone TEXT NOT NULL UNIQUE,
  name TEXT,
  origin TEXT,
  course_interest TEXT,
  objective TEXT,
  status TEXT DEFAULT 'NOVO',
  last_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

────────────────────────────────────────

```text
▓▓▓ NΞØ MELLØ
────────────────────────────────────────
Core Architect · NΞØ Protocol
neo@neoprotocol.space

"Code is law. Expand until
chaos becomes protocol."

Security by design.
Exploits find no refuge here.
────────────────────────────────────────
```
