# 🚀 Angular 22 vs Vue 3: Reescrevendo a UI do Glances HUD do zero (Parte 3)

> *"Do you have a comrade?"*

<div align="center">
  <img src="./imgs/ed_typing.gif" width="600" style="border-radius: 8px;"/>
</div>

Se você já construiu um painel de monitoramento que pisca e atualiza milhares de dados a cada segundo, sabe que o coração do projeto não é o CSS ou os componentes visuais, mas sim o motor de **Reatividade**. 

Na Parte 2 desta série, vimos como eliminamos bibliotecas inúteis focando no "Zero-Dependency Mindset". Hoje, vamos colocar o motor V8 para trabalhar e comparar como a UI original do Glances lida com estado global versus a nossa reconstrução no Angular 22.

---

## 🗃️ O Legado: O \`reactive()\` do Vue 3

Ao abrirmos o arquivo `store.js` no repositório original do Glances, nos deparamos com o uso extensivo do objeto `reactive()` do Vue. A arquitetura clássica pega o payload REST inteiro do servidor e o empurra goela abaixo em uma variável global reativa.

```javascript
// A abordagem Vue 3 original
import { reactive } from 'vue';

export const store = reactive({
  stats: {},
  plugins: [],
  // Mutações acontecem diretamente injetando centenas de nós no objeto
});
```

A mágica do `reactive()` é inegável, mas ela tem um custo oculto: o Proxy-based tracking do Vue 3 precisa interceptar e "rastrear" leitura e escrita em propriedades profundamente aninhadas. Imagine um servidor reportando 500 processos ativos, onde o uso da CPU de cada um muda a cada segundo. O Vue cria rastreadores reativos para *todos* esses dados profundos, o que se torna um verdadeiro "assassino silencioso" de CPU do cliente.

---

## ⚛️ A Vanguarda: Declaratividade com Angular Signals

O Angular 22 abandonou antigas abordagens orientadas a RxJS (Observables e BehaviorSubjects) para adotar um ecossistema nativo e absurdamente rápido: os **Signals**.

No nosso novo `metrics.service.ts`, não usamos Proxies pesados rastreando objetos inteiros. Usamos a trindade atômica do Angular: `signal()`, `computed()` e `effect()`.

```typescript
// A nossa abordagem Angular 22
import { signal, computed } from '@angular/core';

export class MetricsService {
  // A raiz do estado (atualizada pelo Web Worker / SSE)
  readonly metrics = signal<Partial<Metrics>>({});

  // Derivações ultra-baratas via computed()
  readonly cpu = computed(() => this.metrics().cpu || null);
  readonly mem = computed(() => this.metrics().mem || null);
  
  // Apenas a lista de processos (imutável e pronta)
  readonly processes = computed(() => this.rawProcesses());
}
```

**Por que os Signals são superiores para o Glances?**
1. **Granularidade Extrema:** Quando a métrica de CPU atualiza, apenas o `computed()` da CPU avisa a tela para repintar. O resto do sistema nem toma conhecimento.
2. **Sem Vazamento de Memória:** Como os Signals dependem do grafo reativo atômico, não precisamos ficar mapeando *unsubscribe* como na era do RxJS. A subscrição nasce e morre junto com o template que a consome.
3. **Otimização de Renderização (Zoneless):** Combinados com a nossa arquitetura Zoneless da Parte 1, os Signals formam o combo perfeito. O Angular 22 só altera o DOM quando o valor final num `computed()` muda de fato (memoization embutido).

> 💡 *A diferença de fluidez é absurda. Enquanto Proxies profundos queimam a Thread Principal rastreando objetos gigantescos a cada 1 segundo, os Signals reagem pontualmente como agulhas caindo num tabuleiro.*

Na **Parte 4**, mergulharemos em um dos recursos mais subestimados do Angular: o Novo Control Flow (`@for`, `@if`), e como ele esmaga o veterano `v-for` do Vue no gerenciamento de templates complexos.

Você já abraçou o conceito de Signals no Angular, Solid ou Preact? Ou ainda prefere a velha magia dos Proxies? Deixe nos comentários! 👇

*(#Angular22 #VueJS #Signals #WebPerformance #Reatividade #Frontend #SoftwareEngineering)*


---



---

## 📖 Navegação da Série

- ⏪ **Anterior:** [Parte 2: O 'Zero-Dependency Mindset': Eliminando bibliotecas terceiras](./linkedin_article_2.md)
- ⏩ **Próximo:** [Parte 4: Template Control Flow: Vue v-for vs Angular @for](./linkedin_article_4.md)

## 🔗 Links do Repositório (Código Real)

Quer conferir como o código ficou na prática? Acesse os arquivos originais direto no nosso GitHub:

- [metrics.service.ts](https://github.com/cesardraw2/glances/blob/master/hud/frontend/src/app/services/metrics.service.ts)


> *"See You Space Cowboy..."* 🚀
