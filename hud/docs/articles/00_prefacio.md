# 🚀 Série Glances HUD 2.0: Angular 22 vs Vue 3
## Prefácio e Índice Oficial

Nesta jornada épica de reengenharia, documentamos em 10 artigos técnicos como transformamos o frontend legado do Glances (construído em Vue 3) em uma máquina de altíssima performance no Angular 22.

Fizemos questão de escolher os "End Cards" (cartões de encerramento dos episódios) e os títulos de sessões do lendário anime **Cowboy Bebop** de forma que a frase de efeito criasse uma **metáfora poética** com a "dor" técnica que estamos resolvendo em cada artigo específico.

Abaixo você encontra o índice completo da série e a correlação profunda entre a filosofia do anime e a Engenharia de Software abordada:

---

### [Parte 1 (Setup Inicial)](./linkedin_article_1.md): > *"Asteroid Blues"*
- **Por que?** É o título oficial do *Episódio 1* do anime. Marca o início da caçada, assim como marca o nosso `ng new` inicial e o abandono das ferramentas antigas (Webpack e Zone.js).

### [Parte 2 (Zero Dependências)](./linkedin_article_2.md): > *"Easy Come, Easy Go..."*
- **Por que?** No mundo Node.js as bibliotecas vêm e vão rapidamente e costumam quebrar ("Vem fácil, vai fácil"). No artigo, mostramos como abandonar pacotes inúteis de terceiros traz paz de espírito.

### [Parte 3 (Reatividade/Signals)](./linkedin_article_3.md): > *"Do you have a comrade?"*
- **Por que?** O ecossistema de Signals do Angular funciona com camaradagem. Um Signal avisa o outro (*computed*, *effect*) de forma atômica e coordenada, diferente do velho *Proxy* solitário e pesado do Vue.

### [Parte 4 (Control Flow @for)](./linkedin_article_4.md): > *"Sleeping beast"*
- **Por que?** O mecanismo antigo de repintar tabelas gigantescas usando atributos atua como uma "Besta Adormecida" que devora processamento. O novo `@for` do Angular domina essa fera controlando estritamente o fluxo e o DOM.

### [Parte 5 (Server-Sent Events)](./linkedin_article_5.md): > *"Life is but a dream..."*
- **Por que?** Sair do pesadelo do *Short Polling* (onde a rede trava e chovem requisições HTTP) e entrar na fluidez limpa e silenciosa dos *Server-Sent Events* é quase um sonho na aba Network do navegador.

### [Parte 6 (Plugin do Ollama IA)](./linkedin_article_6.md): > *"Are you living in the real world?"*
- **Por que?** Injetar um plugin de Inteligência Artificial Local (LLM) numa arquitetura modular levanta a clássica questão cyberpunk existencial: os dados em tela são telemetrias reais ou alucinações da máquina?

### [Parte 7 (Testes com Vitest)](./linkedin_article_7.md): > *"The work, which becomes a new genre itself..."*
- **Por que?** O modelo clássico de testes do Angular (Karma/Jasmine + TestBed) era pesado. Ao abandonarmos o paradigma inteiro em favor do Vitest, nós literalmente criamos "um novo gênero" de desenvolvimento rápido e TDD moderno.

### [Parte 8 (UX e Formatação Docker)](./linkedin_article_8.md): > *"Cowboy Bebop at his best"*
- **Por que?** Pegar hashes cruéis e IDs brutos do Docker e transformar tudo isso de forma limpa em crachás elegantes com Tailwind mostra o ápice ("his best") da nossa interface de usuário e *Data Grooming*.

### [Parte 9 (Virtual Scroll)](./linkedin_article_9.md): > *"Whatever happens, happens."*
- **Por que?** A frase icônica e desapegada do Spike. Não importa se o servidor reportar 10 processos ou 5.000 ativos; o motor de *Virtual Scroll* não sofre ansiedade. Ele lida apenas com o que cabe na tela. O que vier, veio.

### [Parte 10 (Lighthouse 100/100)](./linkedin_article_10.md): > *"You're Gonna Carry That Weight."*
- **Por que?** O maior peso e a responsabilidade de um engenheiro front-end é a Acessibilidade e a Performance Absoluta (Zero CLS). Alcançar a nota 100/100/100/100 significa que aceitamos carregar o peso estrutural para entregar a glória final. (Também é a frase de encerramento do *último episódio* do anime).

---

> *"See You Space Cowboy..."* 🚀
