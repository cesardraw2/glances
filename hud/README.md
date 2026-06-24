# Glances HUD (Heads-Up Display)

Este diretório contém a nova implementação da SPA do **Glances HUD**, que emula e aprimora o visual clássico retro-CRT (terminal) do Glances em uma interface reativa moderna para navegadores.

A solução é construída com **Angular v22 (Zoneless + Signals)** no frontend e um pipeline assíncrono baseado em **Server-Sent Events (SSE)** no backend.

> [!IMPORTANT]
> Todos os comandos documentados neste manual devem ser executados a partir da **raiz do repositório Glances** (`/home/cesardraw/desenv/projects/fullstack/glances`), e não dentro deste subdiretório `hud/`.

---

## 🚀 Arquitetura & Vantagens Técnicas

Esta nova arquitetura foi desenvolvida para substituir o modelo clássico de requisições repetidas HTTP (RESTful Polling) da WebUI padrão do Glances, oferecendo melhorias substanciais:

*   **Conexão Unidirecional Persistente (SSE):** O frontend estabelece uma única conexão aberta com `/api/4/metrics/sse`. O backend faz o push contínuo do payload JSON estruturado assim que as métricas são atualizadas no hardware.
*   **Redução de Carga de Rede:** Elimina o overhead de handshakes TCP/TLS recorrentes e de headers HTTP pesados enviados a cada segundo.
*   **Alta Performance no Navegador (Zoneless + Signals):** A remoção total do `zone.js` do Angular combinada com a reatividade fina dos **Signals** garante que apenas os nós específicos do DOM vinculados às métricas alteradas sejam atualizados no navegador. A página não sofre ciclos globais de Change Detection.
*   **Normalização Centralizada e Lazy:** Toda a formatação e ordenação matemática de dados (como taxas de I/O por segundo de discos e rede) são processadas de forma memoizada e centralizada no `MetricsService`, deixando os componentes puramente focados na apresentação visual.

---

## 🛠️ Como Executar Localmente (Ambiente de Desenvolvimento)

Para desenvolver e testar mudanças de layout isoladamente, utilizamos um **Backend Mock** em Python que simula a API real do Glances.

### 1. Iniciar o Mock Backend (FastAPI + SSE)
O mock escuta na porta `8000` e fornece dados simulados de hardware que variam a cada segundo:
```bash
cd hud/backend
python3 app.py
```

### 2. Iniciar o Frontend Angular (Porta 4200)
Com o mock backend rodando, navegue até a pasta do frontend, instale as dependências e inicie o servidor do Angular com live reload:
```bash
cd hud/frontend
pnpm install
pnpm run start
```
Acesse no navegador: `http://localhost:4200`

---

## 🧪 Rodando Testes Unitários

Para garantir a qualidade e a regressão do código do frontend Angular (configurado com Karma + Jasmine):
```bash
cd hud/frontend
pnpm run test
```

---

## 📦 Compilar e Integrar no Glances (Build de Produção)

Para gerar a build otimizada de produção e embutir os arquivos estáticos diretamente no diretório do Glances oficial, utilize o script automatizado `build_hud.sh` na raiz da pasta `hud`:

```bash
# Executar a compilação
bash hud/build_hud.sh
```

Esse script executa:
1. A compilação da SPA Angular com o base-href ajustado para `/hud/`.
2. A limpeza e a cópia de todos os arquivos estáticos gerados para o diretório de assets estáticos do Glances em [glances/outputs/static/hud/](file:///home/cesardraw/desenv/projects/fullstack/glances/glances/outputs/static/hud).

---

## 🖥️ Executando de Forma Integrada (Glances Real)

Uma vez que a build foi compilada com o script acima, o novo HUD passa a ser servido de forma nativa pelo Web Server integrado do Glances.

### 1. Execução Padrão (Sem Autenticação)
Inicie o Glances em modo Web server:
```bash
python3 run.py -w
```
Acesse o HUD integrado em seu navegador:
👉 `http://localhost:61208/hud/`

### 2. Execução com Autenticação Habilitada
Para testar e rodar o HUD em ambientes seguros, inicie o Glances exigindo senha:
```bash
python3 run.py -w --password
```
*(Você será solicitado a criar uma senha para o usuário `admin` no terminal).*

Ao abrir o endereço `http://localhost:61208/hud/`, a SPA detectará o bloqueio HTTP 401 e apresentará uma **Tela de Login retro-CRT**. 
* Insira o usuário (`admin`) e a senha criada.
* O frontend efetuará o handshake via `/api/4/token`, armazenará com segurança o token JWT no `localStorage` e injetará automaticamente o token na query string da conexão persistente EventSource do SSE (`?token=JWT_TOKEN`).

### 3. Ajustando Dinamicamente a Frequência de Atualização (Refresh Rate)
É possível passar parâmetros de query string na URL para regular o ritmo com que o SSE e a UI atualizam:
* **Atualização em alta velocidade (1s):** `http://localhost:61208/hud/?refresh=1`
* **Tempo real extremo (0.5s):** `http://localhost:61208/hud/?refresh=0.5`
* **Modo econômico de CPU (5s):** `http://localhost:61208/hud/?refresh=5`

---

## 🐳 Executando com Docker

O Glances oficial pode ser empacotado em um contêiner Docker contendo o novo HUD compilado. O HUD será servido normalmente na porta padrão `61208`.

### 1. Construindo a Imagem Localmente
Certifique-se de executar o `build_hud.sh` antes, para garantir que os estáticos mais recentes estejam sob `glances/outputs/static/hud`. Depois, execute:
```bash
docker build -t glances-hud -f docker-files/alpine.Dockerfile .
```

### 2. Executando o Container
Suba o container mapeando o soquete do docker do host para monitorar contêineres:
```bash
docker run -d \
  --name glances-hud-container \
  -p 61208:61208 \
  -v /var/run/docker.sock:/var/run/docker.sock:ro \
  --pid host \
  glances-hud
```
Acesse `http://localhost:61208/hud/` no seu host.
