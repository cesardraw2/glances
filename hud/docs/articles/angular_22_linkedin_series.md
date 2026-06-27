# Série de Artigos LinkedIn: Modernizando o Front-end com Angular 22 (Glances HUD)

Esta série documenta a construção do **Glances HUD**, onde reescrevemos a interface web original do famoso projeto *Glances* utilizando o que há de mais moderno no **Angular 22**.

**A Dinâmica da Série (O Desafio):** O Glances Web UI original é construído em **Vue 3** (via Webpack), utilizando componentes `.vue`, o sistema `reactive()` para estado global e *Short Polling* via REST. Em cada artigo, analisaremos criticamente como o Vue 3 resolve o problema no repositório oficial e compararemos lado a lado com a nossa reescrita usando as features de vanguarda do Angular 22.

---

## 📅 Roteiro Proposto (Editorial Calendar)

### Artigo 1: Vue 3 (Webpack) vs Angular 22 (Zoneless/Esbuild): A fundação da UI
* **O Comparativo:** O setup do projeto original (`webpack.config.js`, Babel e Vue loader) **VERSUS** a extrema leveza do Angular 22 Standalone sem `zone.js`.
* **Conteúdo:** 
  - A remoção do `zone.js`: como o Angular 22 consegue ser extremamente leve e rápido apenas com detecção de mudanças nativa (OnPush).
  - O adeus ao `NgModules` em favor do `bootstrapApplication` e `standalone: true`.
* **Na Prática:** Comparação lado a lado do setup inicial (Configuração Webpack complexa vs o simples `main.ts` do Angular 22).

### Artigo 2: O "Zero-Dependency Mindset": Eliminando bibliotecas terceiras
* **O Comparativo:** O `package.json` original (carregado de `bootstrap`, `hotkeys-js` e `lodash`) **VERSUS** os recursos nativos do Angular 22 + Tailwind.
* **Conteúdo:**
  - Como o Glances original precisava importar a biblioteca `hotkeys-js` para escutar atalhos do teclado.
  - A elegância do decorador `@HostListener('window:keydown')` do Angular para substituir bibliotecas inteiras.
  - O abandono do Bootstrap pesado em favor do Tailwind CSS integrado no build do Angular CLI.
* **Na Prática:** O código do `App.vue` mapeando teclas com `hotkeys-js` versus nosso `app.component.ts` com HostListeners puros.

### Artigo 3: Reatividade: \`reactive()\` do Vue vs Angular Signals
* **O Comparativo:** O arquivo global `store.js` usando `reactive()` do Vue 3 **VERSUS** o uso declarativo de Angular Signals.
* **Conteúdo:** 
  - O que são `signal`, `computed` e `effect` no Angular.
  - Como o Vue 3 original injeta dados reativos e os limites disso com centenas de métricas mutáveis a cada segundo.
  - Por que os Signals do Angular trazem previsibilidade e previnem vazamento de memória.
* **Na Prática:** Trechos do `store.js` original do Vue vs o nosso `metrics.service.ts` derivando estados com `computed()`.

### Artigo 4: Template Control Flow: Vue \`v-for\` vs Angular \`@for\`
* **O Comparativo:** A renderização iterativa clássica em templates Vue (`v-for`) **VERSUS** o Novo Control Flow do Angular (`@for`, `@if`).
* **Conteúdo:** 
  - Como a sintaxe nativa `@for` (sem depender de diretivas importadas) limpa os templates do Angular 22.
  - O algoritmo de conciliação por trás do `track` e o ganho real na renderização de listas complexas.
* **Na Prática:** O `<template>` do Docker no Vue original lado a lado com o HTML do nosso `docker-plugin.component.ts`.

### Artigo 5: Tempo Real de Verdade: Polling REST (setTimeout) vs Server-Sent Events (SSE)
* **O Comparativo:** O modelo original de "Short Polling" usando `setTimeout` **VERSUS** a nossa integração via Server-Sent Events (SSE) e Signals.
* **Conteúdo:**
  - O gargalo de performance em fazer `fetch()` na API repetitivamente a cada segundo.
  - Como implementamos o canal unidirecional SSE (`EventSource`) no frontend Angular para reduzir overhead HTTP.
* **Na Prática:** O loop recursivo de promises do `services.js` original contra o nosso listener responsivo de SSE.

### Artigo 6: Injeção de Dependências e Arquitetura Modular
* **O Comparativo:** A passagem de estado estático do Vue **VERSUS** a árvore de Injeção de Dependências do Angular com `inject()`.
* **Conteúdo:**
  - A modernização dos serviços sem construtores gigantes.
  - Como modularizamos áreas completas (ex: Ollama Plugin) em componentes altamente isolados.
* **Na Prática:** O código nativo do Ollama Plugin construído do zero, contrastando com o acoplamento do sistema legado.

### Artigo 7: A Cultura de Testes: Ausência Total vs Vitest no Angular 22
* **O Comparativo:** A falta absoluta de testes unitários no frontend original do Glances **VERSUS** a suíte de testes ultrarrápida que construímos com **Vitest**.
* **Conteúdo:**
  - O perigo de escalar uma UI complexa sem automação de testes.
  - Como substituímos o clássico Karma/Jasmine pelo Vitest (Vite) no ecossistema do Angular 22.
  - Testando Signals e componentes isolados com `vi.mock` e `fixture.detectChanges()`.
* **Na Prática:** O repositório original vazio de testes contra o nosso `metrics.service.spec.ts` com 100% de cobertura validando o SSE e Signals.

### Artigo 8: Arquitetura Limpa com AOP e DRY (Pipes Puros e Decorators)
* **O Comparativo:** Código repetido de formatação (bytes, taxas) espalhado nos componentes originais **VERSUS** Abstração DRY e Aspect-Oriented Programming (AOP) no Angular 22.
* **Conteúdo:**
  - Como a componentização (Pattern Composition) usando `<ng-content>` salvou dezenas de linhas e duplicidade de estilização de cards de métricas.
  - O poder dos Pipes Puros para transformar dados no template (ex: `FormatBytesPipe`), delegando ao framework o cacheamento (memoization) sem sujar as classes dos componentes.
  - Implementação de um Decorator AOP (Aspect-Oriented Programming) `@MeasureRender()` para isolar observabilidade (profiling) e manter as regras de negócio limpas.
* **Na Prática:** A migração de dezenas de métodos `formatBytes()` espalhados pelos plugins para pipes puros e injetando telemetria em eventos críticos.

### Artigo 9: UX Perfeita & Performance Extrema (Zoneless, CDK Virtual Scroll e Web Workers)
* **O Comparativo:** Renderização bloqueante e listas instáveis **VERSUS** Interface ultra-responsiva com delegação assíncrona.
* **Conteúdo:**
  - Desafogando a Main Thread transferindo as formatações pesadas de strings/números para Web Workers puros.
  - O poder do **Angular CDK Virtual Scroll** para lidar com 500+ processos e contêineres consumindo frações de memória.
  - Arquitetura UI/UX de alta classe com a mecânica de "Pin" (fixação dinâmica de linha ao topo absoluto) para dashboards em tempo real.
* **Na Prática:** Substituição bruta do elemento `<table>` pelo Flexbox acoplado ao Virtual Scroll, além do pulo dinâmico de Array no Signal quando ocorre um Pin de monitoramento de linha.

---

## 🚀 Próximos Passos
Temos um roteiro épico de 9 artigos! Se o escopo estiver 100% fechado, podemos dar a largada e escrever a copy final do **Artigo 1**.
