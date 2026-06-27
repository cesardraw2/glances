# Glances HUD (Heads-Up Display)

Este diretório contém a nova implementação da SPA do **Glances HUD**, que emula e aprimora o visual clássico retro-CRT (terminal) do Glances em uma interface reativa moderna para navegadores.

A solução é construída com **Angular v22 (Zoneless + Signals)** no frontend e um pipeline assíncrono baseado em **Server-Sent Events (SSE)** no backend.

> [!IMPORTANT]
> Todos os comandos documentados neste manual utilizam **Macros do Makefile** na raiz do projeto (`/home/cesardraw/desenv/projects/fullstack/glances`). Conforme as nossas diretrizes de Engenharia de Software, **nunca execute scripts diretamente nas subpastas**; utilize sempre o `make`.

---

## 🚀 Arquitetura & Vantagens Técnicas

Esta nova arquitetura foi desenvolvida para substituir o modelo clássico de requisições repetidas HTTP (RESTful Polling) da WebUI padrão do Glances, oferecendo melhorias substanciais:

*   **Conexão Unidirecional Persistente (SSE):** O frontend estabelece uma única conexão aberta com `/api/4/metrics/sse`. O backend faz o push contínuo do payload JSON estruturado assim que as métricas são atualizadas no hardware.
*   **Redução de Carga de Rede:** Elimina o overhead de handshakes TCP/TLS recorrentes e de headers HTTP pesados enviados a cada segundo.
*   **Alta Performance no Navegador (Zoneless + Signals):** A remoção total do `zone.js` do Angular combinada com a reatividade fina dos **Signals** garante que apenas os nós específicos do DOM vinculados às métricas alteradas sejam atualizados no navegador. A página não sofre ciclos globais de Change Detection.
*   **Normalização Centralizada e Lazy:** Toda a formatação e ordenação matemática de dados (como taxas de I/O por segundo de discos e rede) são processadas de forma memoizada e centralizada no `MetricsService`, deixando os componentes puramente focados na apresentação visual.

---

## 🛠️ Como Instalar e Desenvolver

Utilizamos o `Makefile` na raiz do repositório para abstrair toda a complexidade de configuração.

### 1. Instalação Completa
Instala as dependências tanto do Frontend (Angular/pnpm) quanto do Backend Mock Python (pip):
```bash
make hud-install
```

### 2. Iniciar o Ambiente de Desenvolvimento (Live Reload)
Sobe simultaneamente o Mock Backend FastAPI (porta 8000) e o Angular Dev Server (porta 4200):
```bash
make hud-dev
```
Acesse no navegador: `http://localhost:4200`

---

## 🧪 Rodando Testes Unitários & Integração (Vitest)

A suíte de testes do frontend utiliza o **Vitest**, rodando em milissegundos sem a dependência do Karma/Jasmine clássico.

### Executar Toda a Suíte de Testes
```bash
make hud-test
```
*Isso executará testes lógicos e de cobertura de código do Angular usando a Engine V8.*

---

## 📦 Compilar e Build Frontend (Produção Estática)

Para gerar a build de produção ultra otimizada e minificada do Angular utilizando o ESBuild:

```bash
make hud-build
```

---

## 🐳 Arquitetura Docker Isolada (Multi-stage)

O HUD agora possui sua **própria arquitetura de contêiner isolada**, através de um Dockerfile Multi-stage ultra eficiente.

Ele compila o Angular no Estágio 1 usando o `node:22-alpine`, extrai os arquivos binários estáticos, e os serve utilizando o **FastAPI** Python num contêiner limpo (`python:3.12-slim-bookworm`) na porta 8000, unificando o Backend Mock e a SPA num único serviço.

### 1. Construir a Imagem do HUD
Executa o processo em dois estágios, criando uma imagem segura e leve `glances-hud-mock:latest`:
```bash
make hud-docker-build
```

### 2. Executar o Container do HUD
Sobe a infraestrutura mockada pronta para visualização:
```bash
make hud-docker-run
```
Acesse no navegador a porta orquestrada pelo Uvicorn do contêiner: `http://localhost:8000`

---

## 🖥️ Executando de Forma Integrada (Glances Real)

Se você desejar apontar o HUD para o **Backend Original do Glances** em vez do Mock, basta lembrar que o Web Server do Glances (v4+) também expõe uma API na porta padrão `61208` com SSE.

Você pode conectar o `metrics.service.ts` à porta `61208` apontando a URL de desenvolvimento.

### 1. Modos de Autenticação Real:
* **Sem Autenticação:** `python3 run.py -w`
* **Com Autenticação Segura:** `python3 run.py -w --password`

Ao acessar com senha, o HUD ativa automaticamente a sua **Tela de Login retro-CRT** interativa. O Token JWT será armazenado de forma segura e a conexão SSE injetará esse JWT para streaming bidirecional blindado.
