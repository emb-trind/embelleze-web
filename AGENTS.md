<!-- markdownlint-disable MD003 MD007 MD013 MD022 MD023 MD025 MD029 MD032 MD033 MD034 -->

# AGENTS

```text
========================================
   EMBELLEZE WEB · AGENTS
========================================
Escopo : embelleze-web/
Leitura: obrigatória antes de qualquer ação
========================================
```

## ⟠ Projeto

Site/webapp oficial de captação e conversão do
Instituto Embelleze Trindade.
LPs de campanha são pacotes separados (embelleze-lp-*).

```text
┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
┃ Framework   Astro
┃ Estilo      CSS modular/global simples
┃ Deploy      Railway
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

────────────────────────────────────────

## ⨷ Estrutura Obrigatória

```text
▓▓▓ ONDE CADA COISA FICA
────────────────────────────────────────
└─ src/pages/index.astro   apenas importa seções
└─ src/sections/           blocos da landing
└─ src/components/         UI reutilizável
└─ src/content/            dados editáveis
└─ src/lib/                WhatsApp, tracking, geo,
                           desconto, Bella (Azure),
                           Z-API, Probeltec, DB, Redis
```

────────────────────────────────────────

## ◬ Protocolo de Execução

**Leia antes de agir:** `../.skills/dev-agent.md` — NEØ DEV AGENT.
Define níveis de confiança, guardrails de mutação e formato de reporte.
Obrigatório para qualquer agente que opere neste pacote.

────────────────────────────────────────

## ⍟ Proibições

- Não colocar seções dentro de `index.astro`.
- Não duplicar links de WhatsApp.
- Não inventar dados comerciais.
- Não inserir preços sem validação do cliente.
- Não criar dependências pesadas sem necessidade.
