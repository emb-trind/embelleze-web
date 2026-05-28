<!-- markdownlint-disable MD003 MD007 MD013 MD022 MD023 MD025 MD029 MD032 MD033 MD034 -->

# SKILL

```text
========================================
   EMBELLEZE WEB · SKILL
========================================
Escopo : embelleze-web/
Função : Como operar dentro deste projeto
========================================
```

## Rotina de Operação

Prioridade decrescente — regra anterior prevalece sobre a seguinte.

```text
1. Leia CONTEXT.md antes de qualquer edição
2. Identifique o arquivo afetado (ver mapa abaixo)
3. Edite apenas esse arquivo — mudanças colaterais
   (estilos, testes) só se explicitamente solicitadas
4. Dado de negócio → obrigatório em src/content/
5. CTA WhatsApp → obrigatório via src/lib/whatsapp.ts
6. Tracking → obrigatório via src/lib/tracking.ts
7. Preserve src/pages/index.astro como só imports
   de seções — sem lógica, sem JSX inline, sem estilos
```

────────────────────────────────────────

## ⧉ Mapa de Arquivos

```text
▓▓▓ O QUE É UMA "SEÇÃO"
────────────────────────────────────────
Arquivo .astro em src/sections/
Cada seção = um bloco visual da página (Hero, CourseOffer, etc.)
Não confundir com: componente (src/components/), página (src/pages/)

▓▓▓ ONDE CADA COISA FICA
────────────────────────────────────────
Texto / preço / curso   → src/content/           (JSON/MD, sem lógica)
Links WhatsApp          → src/lib/whatsapp.ts     (getWhatsAppLink)
Eventos de tracking     → src/lib/tracking.ts     (track / trackMeta)
CAPI server-side        → src/lib/capi.ts         (sendCapiPageView / sendCapiLead)
UTMs / constantes       → src/lib/constants.ts    (UTM, CAMPAIGN_SLUG)
Estilos globais         → src/styles/global.css
Pixel / nonce           → src/components/TrackingPixel.astro
OpenAI Ads Pixel        → PUBLIC_OPENAI_PIXEL_ID (publico, client-side)
```

────────────────────────────────────────

## ⍟ Contrato de Seção

```text
▓▓▓ REQUISITOS OBRIGATÓRIOS
────────────────────────────────────────
└─ Função de conversão clara
   = existe pelo menos um CTA que leva ao WhatsApp
     ou a uma próxima seção com CTA
   Ex: Hero → botão "Quero me inscrever" → wa.me/...

└─ Legibilidade mobile (breakpoint padrão: 480px)
   = fonte mínima 16px no corpo
   = touch targets ≥ 44×44px
   = sem overflow horizontal
   = contraste mínimo WCAG AA (4.5:1 texto normal)

└─ Independência de execução
   = pode ser removida de index.astro sem quebrar outra seção
   = permitido: import de src/lib/* e src/components/*
   = não permitido: ler estado ou dados de outra seção diretamente
```

────────────────────────────────────────

## ⨷ Contratos de Libs

```text
▓▓▓ src/lib/whatsapp.ts
────────────────────────────────────────
getWhatsAppLink({ course?, origin?, utmSource? }): string
→ retorna URL wa.me com número, mensagem e UTMs

▓▓▓ src/lib/tracking.ts
────────────────────────────────────────
Events = {
  PAGE_VIEW, CLICK_WHATSAPP, CLICK_INSTAGRAM,
  CLICK_COURSE, OPEN_MAP,
  START_FUTURE_SIMULATOR, COMPLETE_FUTURE_SIMULATOR
}
track({ event: Events.X, ...params }): void   → fbq trackCustom
trackMeta(eventName: string, params?): void   → fbq track (padrão Meta)
trackOpenAI(eventName, props?, options?): void → oaiq measure

▓▓▓ src/content/
────────────────────────────────────────
Formato: JSON ou Markdown com frontmatter
Não importar lógica nesses arquivos — só dados
Nomeação: kebab-case, sem versão no nome do arquivo
```

────────────────────────────────────────

## ◬ Fluxo de Mudança

```text
1. Editar apenas os arquivos necessários
2. Verificar build local: pnpm build
3. Commit: conventional commits
   feat: / fix: / refactor: / docs: / chore:
4. Push → Railway builda e faz deploy automaticamente
5. Validar em produção: Events Manager Meta → Test events
   (para mudanças de tracking)
```

```text
▓▓▓ SE A MUDANÇA AFETA MÚLTIPLOS ARQUIVOS
────────────────────────────────────────
→ Listar todos os arquivos antes de editar
→ Editar na ordem: lib → componente → seção → página
→ Verificar que nenhuma seção ficou com import quebrado
```

────────────────────────────────────────

## ⧇ Validação Pós-Mudança

```text
▓▓▓ TRACKING
────────────────────────────────────────
→ Meta Events Manager → Test events
→ Confirmar: evento aparece com origem Pixel E CAPI
→ Confirmar: event_id igual nos dois (dedup ativo)
→ OpenAI Ads: confirmar `page_viewed`, `contents_viewed`,
  `lead_created` e `registration_completed` quando
  `PUBLIC_OPENAI_PIXEL_ID` estiver configurado

▓▓▓ MOBILE
────────────────────────────────────────
→ Chrome DevTools → 430×932 (iPhone 14 Pro)
→ Checar: sem scroll horizontal, fontes legíveis,
  botões clicáveis, contraste adequado

▓▓▓ DADOS EM src/content/
────────────────────────────────────────
→ Se o schema for inválido, o build falha com erro Zod
→ Corrigir o JSON/MD antes de tentar buildar novamente
```
