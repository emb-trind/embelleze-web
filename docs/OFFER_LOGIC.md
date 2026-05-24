<!-- markdownlint-disable MD003 MD007 MD013 MD022 MD023 MD025 MD029 MD032 MD033 MD034 -->

# OFFER LOGIC

```text
========================================
   EMBELLEZE WEB · OFFER LOGIC
========================================
```

## ⟠ Oferta Ativa

Controlada via `src/content/offers.json`.

```text
┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
┃ CAMPO             FUNÇÃO
┣━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
┃ courseId          Curso em destaque
┃ title             Título da oferta
┃ ticketPrefix      Prefixo do código gerado
┃ urgency           Texto de urgência
┃ nextClass         Próxima turma
┃                   null = não divulgar ainda
┃ highlightBenefit  Benefício em destaque
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

────────────────────────────────────────

## ⨷ Código de Desconto

Gerado em `src/lib/discount-code.ts`.

```text
Formato : BELLA-[timestamp-base36]-[random]
Validade: 15 min — visual (CountdownTimer)
```

────────────────────────────────────────

## ⧉ Página de Oferta por Campanha

```text
/oferta?curso=[id]
       &utm_source=meta
       &utm_campaign=...
```

- Usada para campanhas pagas (Google / Meta).
- Captura UTM e repassa para o link do WhatsApp.
- Fallback: exibe grade de cursos se `id` inválido.
