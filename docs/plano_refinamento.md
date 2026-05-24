# Plano de Refinamento Visual — Padrão Bella

Este plano visa aplicar a linguagem visual premium observada na seção `BellaIntro` em outras seções específicas do site, garantindo consistência, alto contraste e efeitos de luz elegantes, sem alterar a identidade visual da marca ou a lógica de negócio existente.

## 1. Princípios de Design a Aplicar

- **Glows Coerentes**: Sombras (`box-shadow`) que usam a mesma cor do elemento (ex: botão verde -> brilho verde).
- **Glassmorphism Controlado**: Uso de `backdrop-filter: blur()` e bordas finas semi-transparentes para elementos sobre fundo escuro.
- **Foco e Contraste**: Preservar fundos escuros limpos para destacar ações (CTAs).

## 2. Escopo de Atuação (Apenas o Observado)

### 2.1 Hero Section (`src/sections/Hero.astro`)

- **O que foi observado**: O botão de CTA atual pode não ter o brilho na mesma cor do botão.
- **Ação**: Adicionar um `box-shadow` suave com a cor laranja da marca ao botão "Ver cursos disponíveis" (e efeito hover proporcional).
- **Restrição**: Não alterar o texto, o link, as cores da marca ou o efeito de pontos/ruído recém-aprovado.

### 2.2 Simulador de Futuro / Quiz (`src/sections/FutureSimulator.astro`)

- **O que foi observado**: Os botões de opções e o botão final podem estar usando sombras genéricas.
- **Ação**: Ajustar o estado ativo das opções e o botão final para usarem sombras coloridas correspondentes (Ciano ou Laranja) com desfoque alto e opacidade baixa.
- **Restrição**: Não alterar a lógica do quiz, o armazenamento local (localStorage) ou as perguntas.

### 2.3 Cards de Cursos (`src/components/CourseCard.astro`)

- **O que foi observado**: O usuário já aprovou as mudanças anteriores nos cards. Vamos apenas garantir que o efeito "glass" do overlay esteja polido.
- **Ação**: Verificar se a borda do card e o fundo do botão "Saiba mais" seguem a transparência elegante com desfoque leve.
- **Restrição**: Não alterar os textos encurtados (/2, /sem.), o tamanho da fonte ou remover o hover focado apenas no botão que o usuário pediu.

## 3. Preocupações de Segurança (Não Quebrar Nada)

- **Identidade Visual**: As cores `#de583d` (Laranja) e `#5f3080` (Roxo) são sagradas. Nenhuma cor nova será introduzida além do verde do WhatsApp e o ciano de suporte já existentes.
- **Quebra de Layout**: O uso de `backdrop-filter` pode ser pesado em dispositivos antigos. Garantiremos que haja um fallback de colord de fundo sólida ou semi-transparente legível.
- **Validação**: Após cada pequena alteração, executaremos `pnpm check` (make verify) para garantir que nenhum erro de build foi introduzido.

## 4. Ordem de Execução Proposta

1. **Aprovação deste plano** pelo usuário.
2. Refinamento do botão da **Hero**.
3. Refinamento dos botões e estados do **Quiz**.
4. Ajuste fino (se necessário) nos **Cards de Cursos**.
