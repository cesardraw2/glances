# Jarvis Session — branch develop

- **Objetivo**: Construir a SPA HUD retro do Glances com Angular 22+ Zoneless/Signals e Python backend SSE mock, integrada de forma nativa ao servidor Web do Glances real e equipada com uma suíte de testes moderna sob o Vitest.
- **Data de Início**: 2026-06-18
- **Estado**: Finalizado
- **Fase Atual**: Concluído (Fase 1 à Fase 9)

---

## 🚀 Histórico de Evolução & Fases da Missão

### Fase 1: Setup do Ambiente e config/ports.json
*   Definição e mapeamento de portas locais para evitar conflitos no ecossistema do desenvolvedor.

### Fase 2: Backend Mock Python com FastAPI e SSE
*   Criação de um backend mock reativo em Python (`hud/backend/app.py`) fornecendo payloads de hardware realísticos simulando o Glances com conexões Server-Sent Events (SSE).

### Fase 3: Frontend Angular 22+ Zoneless com Tailwind v4 e 8 Plugins
*   Implementação inicial do frontend no diretório `hud/frontend` projetando a interface curses de terminal com fontes customizadas retro-CRT e visualização inteligente de 8 principais plugins (System Info, QuickLook, Load, CPU, Memory, Network, Disk I/O, File System, contêineres Docker, GPU, Sensores e Processos).

### Fase 4: Integração, Validação e Estilos CRT
*   Conexão da SPA reativa ao servidor real do Glances (`python3 run.py -w`).
*   Construção de estilos CSS em `styles.css` e `index.html` para emular o visual CRT fosfórico clássico (efeito de linhas de scanlines retro-CRT).

### Fase 5: Atualização gradativa do Angular para v22 e Node.js para v22.22.3
*   Upgrade do ecossistema do frontend para as versões experimentais mais recentes do Angular v22 e fixação do Node.js na versão `v22.22.3` com pnpm.

### Fase 6: Aplicação das novas funcionalidades do Angular 22
*   **Zoneless Estável**: Remoção completa de `zone.js` no `package.json` e bootstrap configurado com `provideExperimentalZonelessChangeDetection()`.
*   **Resource API**: Uso pioneiro de `httpResource` para chamadas HTTP assíncronas assinaladas reativamente.
*   **Componentes Sem Seletor**: Otimização de componentes dinâmicos puramente lógicos.
*   **Estratégia OnPush Estrita**: Aplicação sistemática de `ChangeDetectionStrategy.OnPush` em todos os componentes para evitar renderizações globais redundantes.

### Fase 7: Aprimoramentos da UI/UX Retro & Interações
*   **Painel Pinned Task (Extended Stats)**: Clicar sobre a linha de um processo na tabela de tarefas envia uma requisição `POST` para `/api/4/processes/extended/{pid}` e exibe um painel rico no topo da tabela contendo estatísticas de memória física/virtual e uso de CPU acumulado (médias, mínimos e máximos).
*   **Mapeamento Docker Reativo**: A listagem de contêineres Docker foi reposicionada no painel principal acima de processos em uma tabela curses de 12 colunas reais. Clicar nas linhas permite destacar contêineres com fundo verde-escuro retro (`bg-[#002f00]`).
*   **Indicador de Cores Dinâmico**: Mapeamento da contagem dinâmica de núcleos de CPU (`cpucore`) e visualização por núcleo ativada pela tecla `1`.
*   **Ordenação Clicável**: Cabeçalhos de tabela clicáveis para ordenação interativa de contêineres e processos (indicador `▼` ativo).
*   **Alinhamento e Layout de Sidebar**: Otimização horizontal com grid CSS (`grid-cols-12`) alinhado à direita para Network, Disk I/O e FS na barra lateral, ocultando dinamicamente interfaces virtuais de rede inativas (`veth*`, `br-*`, etc.) a menos que atinjam tráfego ativo (> 10 Kb/s).
*   **Controle Refresh Rate SSE**: Leitura dinâmica do parâmetro de URL `?refresh=X` repassado à conexão EventSource.
*   **Tela de Login Curses**: Exibição da tela de login CRT segura se o Glances exigir autenticação (`python3 run.py -w --password`).

### Fase 8: Resolução do Tailwind v4 via PostCSS
*   Correção da compilação e carregamento das dependências do Tailwind v4 no ambiente de compilação usando PostCSS para compilar o `styles.css` customizado sem incompatibilidades de caminhos na build de produção do Angular.

### Fase 9: Migração da Suíte de Testes para Vitest Híbrido (Karma ➡️ Vitest)
*   **Desinstalação do Karma/Jasmine**: Remoção das dependências clássicas do `package.json`.
*   **Testes no Node (Instantâneos)**: Configuração rápida e modular do Vitest Node para rodar testes lógicos sem browser de `MetricsService` e `AppComponent` mockando dependências via classes puras e mocks do `inject()`.
*   **Testes no Browser (Playwright Chromium)**: Execução de testes integrados reais em Chromium hermético com flags otimizadas, usando proxy do Vite para evitar violações CORS de Same-Origin Policy de iframe.

---

## 🛠️ Arquitetura e Estrutura Técnica de SSoT
*   **Frontend**: Angular v22.0.2 + Tailwind CSS v4.3.1. Servido de forma estática sob `/hud/`.
*   **Backend**: FastAPI (Mock) e Uvicorn/FastAPI (Glances Real) expondo Server-Sent Events (SSE) em `/api/4/metrics/sse`.
*   **Testes**: Vitest v4.1.9 + `@vitest/browser` + Playwright.
