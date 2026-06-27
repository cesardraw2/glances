# 🚀 Angular 22 vs Vue 3: Reescrevendo a UI do Glances HUD do zero (Parte 8)

> *"Cowboy Bebop at his best"*

<div align="center">
  <img src="../imgs/spike_smiling.gif" width="600" style="border-radius: 8px;"/>
</div>

Muitas equipes de backend acreditam que o trabalho está pronto no momento em que a API cospe um JSON válido com status 200. Mas no ecossistema de observabilidade, um JSON gigantesco cheio de hashes e bytes não filtrados é absolutamente intragável para um operador cansado às 3 da manhã.

Nos artigos passados focamos pesado na infraestrutura do Angular 22 (Signals, Zoneless, Vitest). Na **Parte 8**, vamos falar sobre **Transformação Visual de Dados (UX)**: como pegamos dados brutos e hostis do Docker e os transformamos em algo que parece ter saído de um filme de ficção científica.

---

## 🗑️ A Síndrome da "Tabela de Excel"

Na interface original do Glances, os dados dos contêineres Docker chegam e são jogados na tela "as-is" (como vieram). 
O nome da imagem de um contêiner costuma vir assim: `ghcr.io/home-assistant/home-assistant:2024.1.2`. 
Tamanhos de memória vêm assim: `1048576000` (bytes).

O Vue 3 original apenas enfileirava essas longas tripas de texto dentro das tabelas HTML. O resultado visual? Uma enorme sopa de letrinhas onde os olhos não encontram ponto de ancoragem, exigindo que o cérebro humano faça o *parsing* visual de onde termina a URL do repositório e onde começa a Tag da versão.

## 🎨 O Pulo do Gato: Pipes Inteligentes e Parseamento OCI

No nosso HUD construído no Angular 22, nós aplicamos o conceito de *"Data Grooming"* (Polimento de Dados) direto no encanamento de exibição usando os **Pipes** do Angular e helpers embutidos.

Criamos algoritmos puramente funcionais para estripar e catalogar strings de imagens padrão OCI. Pegamos a string horrorosa `ghcr.io/home-assistant/home-assistant:2024.1.2` e, programaticamente, injetamos ela em crachás coloridos de TailwindCSS:

```html
<!-- Nossa abstração no Angular 22 -->
<div class="flex items-center gap-2">
  <span class="text-gray-400 font-mono">ghcr.io/.../</span>
  <span class="text-white font-bold">home-assistant</span>
  <span class="bg-blue-900 text-blue-200 px-2 py-0.5 rounded text-xs">
    v2024.1.2
  </span>
</div>
```

**O que fizemos por debaixo dos panos?**
1. **Destaque Visual:** O namespace corporativo fica apagado em cinza, reduzindo o ruído.
2. **Core em Foco:** O nome real da aplicação acende em branco brilhante.
3. **Versão Enclausurada:** A *tag* vira uma pill/badge isolada visualmente. Em uma fração de segundo de relance, você sabe a versão exata que está rodando.

Além disso, nosso Web Worker (explicado lá no Artigo 9) converte preventivamente todo aquele lixo numérico de bytes em escalas semânticas humanas (`1.0 GB`, `300 MB`) antes mesmo da informação encostar no DOM.

> 💡 *UX não é apenas desenhar botões bonitos. Em painéis de telemetria, UX é reduzir a carga cognitiva do operador.*

Na próxima semana entraremos no clímax final da nossa série de 10 artigos, onde juntamos todas essas peças para bater de frente com a lendária lista de processos usando **Virtual Scroll** (Parte 9) e zerar as métricas mais impiedosas da web no **Google Lighthouse 100/100** (Parte 10). 

Como a sua equipe lida com formatação pesada no frontend? Pipes nativos? Web Workers? Ou deixam o fardo da formatação nas costas do backend? Conta pra gente nos comentários! 👇

*(#Angular22 #WebDesign #UX #Docker #TailwindCSS #Frontend #WebPerformance #SoftwareEngineering)*


---



---

## 📖 Navegação da Série

- ⏪ **Anterior:** [Parte 7: A Revolução nos Testes: Vitest vs Jest/Karma](./linkedin_article_7.md)
- ⏩ **Próximo:** [Parte 9: Angular CDK Virtual Scroll e Web Workers](./linkedin_article_9.md)

## 🔗 Links do Repositório (Código Real)

Quer conferir como o código ficou na prática? Acesse os arquivos originais direto no nosso GitHub:

- [docker-plugin.component.ts](https://github.com/cesardraw2/glances/blob/master/hud/frontend/src/app/plugins/docker-plugin.component.ts)
- [format-bytes.pipe.ts](https://github.com/cesardraw2/glances/blob/master/hud/frontend/src/app/core/pipes/format-bytes.pipe.ts)


> *"See You Space Cowboy..."* 🚀
