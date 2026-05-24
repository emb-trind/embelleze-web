<!-- markdownlint-disable MD003 MD007 MD013 MD022 MD023 MD025 MD029 MD032 MD033 MD034 -->

# DEPLOYMENT

```text
========================================
   EMBELLEZE WEB · DEPLOYMENT
========================================
Pacote  : embelleze-web
Tipo    : Astro SSR + Node adapter
Deploy  : Railway (Docker)
========================================
```

## ⟠ Ambientes

```text
┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
┃ AMBIENTE     DOMÍNIO                STATUS
┣━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
┃ Provisório   embelleze-trindade     ativo
┃              .flowoff.xyz
┃ Produção     embelleze-bella.online ativo
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

────────────────────────────────────────

## ⨷ Variáveis de Ambiente

Ver `.env.example` na raiz de `embelleze-web/`.

```text
┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
┃ VARIÁVEL                STATUS
┣━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
┃ DATABASE_URL            Railway Postgres
┃ ZAPI_INSTANCE_ID        Z-API WhatsApp
┃ ZAPI_TOKEN              Z-API WhatsApp
┃ ZAPI_CLIENT_TOKEN       Webhook auth
┃ PROBELTEC_EMAIL         CRM
┃ PROBELTEC_PASSWORD      CRM
┃ AZURE_OPENAI_*          Bella (pendente)
┃ PUBLIC_GTM_ID           aguardando cliente
┃ PUBLIC_META_PIXEL_ID    aguardando cliente
┃ PUBLIC_GOOGLE_MAPS_KEY  aguardando cliente
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

────────────────────────────────────────

## ⧉ Build e Deploy

```bash
make check && make build   # validar local antes do push
git push origin main       # dispara GitHub Actions → GHCR
```

Railway não faz build — puxa a imagem pronta do GHCR.
CI/CD em `.github/workflows/docker-push.yml`.

```text
▓▓▓ CONNECT IMAGE (Railway)
────────────────────────────────────────
Source  : Connect Image
Imagem  : ghcr.io/neomello/embelleze-web:latest
Registry: ghcr.io (público, sem auth)
```

────────────────────────────────────────

## ⍟ Railway — Conectar Novo Módulo

Procedimento completo em `../../SETUP.md`
— seção `## ⨷ Deploy (Railway)`.

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
