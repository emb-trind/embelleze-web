<!-- markdownlint-disable MD003 MD007 MD013 MD022 MD023 MD025 MD029 MD032 MD033 MD034 -->

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
┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
┃ VARIÁVEL                  FONTE
┣━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
┃ PUBLIC_GTM_ID             Google Tag Manager
┃ PUBLIC_META_PIXEL_ID      Meta Business Suite
┃ DATABASE_URL              PostgreSQL Connection String
┃ REDIS_URL                 Redis Connection String
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

> Enquanto os IDs não estiverem preenchidos,
> GTM e Meta Pixel simplesmente não são injetados.
> O build não quebra.

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

└─ src/content/bella.knowledge.md
   Base de conhecimento da Bella.
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

> Para SSR ou rotas dinâmicas futuras,
> instalar o adapter Node antes do deploy:

```bash
npx astro add node
```

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
