# Glances HUD Frontend (Angular 22+ / 19+ Zoneless)

Esta é a aplicação frontend SPA (Single Page Application) construída para emular a interface clássica (TUI/HUD) do Glances com estética retro CRT de terminal.

---

## 🚀 Arquitetura Server-Sent Events (SSE)

Para a entrega de métricas de hardware em tempo real, optamos por uma estratégia de streaming contínuo via **SSE (Server-Sent Events)** a partir de um único endpoint consolidado no backend. 

### Vantagens do SSE em relação ao Polling Tradicional (Glances Oficial):

1. **Redução drástica de Overhead**: Em vez de fazer requisições HTTP individuais e recorrentes a cada 1s (que renegociam headers HTTP e geram overhead de rede TCP/TLS), o SSE mantém uma única conexão persistente (HTTP/1.1 ou multiplexada sobre HTTP/2) aberta.
2. **Push em tempo real**: O backend empurra os dados assim que são lidos do hardware, eliminando atrasos inerentes ao polling.
3. **Unificação de estado**: Um único payload contendo o snapshot completo do sistema evita inconsistências temporais entre diferentes componentes e reduz o número de conexões ativas no navegador de N para 1.
4. **Simplicidade**: SSE é muito mais leve que WebSockets para cenários de monitoramento unidirecional (apenas leitura de dados), pois opera sobre HTTP padrão sem a necessidade de um protocolo bidirecional complexo.

---

## 📊 Comparativo Técnico: Novo HUD (SSE + Angular v22) vs. WebUI Clássica (RESTful + Vue 3)

| Critério / Plugin | WebUI Clássica (Vue 3) | Novo HUD (Angular v22) |
| :--- | :--- | :--- |
| **Protocolo de Rede** | **RESTful HTTP Polling**: Dispara requisições GET recorrentes para `/api/4/all` e `/api/4/all/views` de forma paralela via `Promise.all` em loops de `setTimeout`. | **Server-Sent Events (SSE)**: Mantém uma única conexão aberta via `EventSource` em `/api/4/metrics/sse`, recebendo pushes contínuos. |
| **Change Detection (Browser)** | **Virtual DOM Global**: A store inteira é substituída com a resposta HTTP a cada ciclo de polling, forçando o framework a computar diffs em toda a árvore de componentes da página. | **Zoneless + Signals**: Exclusão completa do `zone.js` (sem interceptação global). Reatividade granular onde apenas os nós de texto vinculados aos Signals alterados sofrem atualização no DOM. |
| **Tratamento de Dados** | **Descentralizado (Cliente)**: Cada componente (ex: `plugin-processlist.vue`) calcula taxas matemáticas de I/O, formata tempos (`timeforhuman`) e formata bytes de forma síncrona a cada renderização. | **Centralizado (MetricsService)**: Normalização e limpeza das métricas feitas no serviço usando `computed()`. Os componentes são puramente visuais e consomem dados já tratados e memoizados. |
| **Ordenação & Fatiamento** | Computado dinamicamente usando Lodash `orderBy` a cada ciclo de renderização no getter do próprio componente. | Realizado de forma reativa no signal `computed` derivado, rodando ordenações apenas quando os dados mudarem ou uma nova chave de ordenação for ativada pelo usuário. |
| **Manutenibilidade** | Código JavaScript dinâmico usando Options API (`data`, `computed`, `methods`), com lógica de formatação e limites acoplada de forma ad-hoc. | Código TypeScript fortemente tipado com separação estrita de responsabilidades (Service cuida do estado/conexão, Componentes Standalone cuidam da apresentação). |

---

## 🛠️ Tecnologias Utilizadas

- **Angular 19+ (Zoneless e Signals)**: Utilizando a detecção de mudança Zoneless (`provideExperimentalZonelessChangeDetection`) para alta performance e reatividade cirúrgica.
- **Tailwind CSS v4**: Processado nativamente no compilador SCSS do Angular para aplicação rápida de estilos utilitários.
- **NgComponentOutlet + `@for`**: Renderização 100% dinâmica dos blocos de métricas com base no registro de componentes.

---

## ⚙️ Como executar localmente

1. Certifique-se de que o backend Python está rodando na porta `8000`.
2. Navegue até este diretório: `cd hud/frontend`
3. Instale as dependências: `pnpm install`
4. Execute o servidor de desenvolvimento: `pnpm run dev` (porta `4200`).
