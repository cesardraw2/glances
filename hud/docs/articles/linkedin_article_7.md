# 🚀 Angular 22 vs Vue 3: Reescrevendo a UI do Glances HUD do zero (Parte 7)

> *"The work, which becomes a new genre itself..."*

Qualquer pessoa que trabalhou com o ecossistema Angular na última década sabe que existe uma palavra que causa arrepios nas equipes de desenvolvimento: **Karma**. O ecossistema de testes clássico (baseado no Karma + Jasmine) sempre foi conhecido por ser denso, levantar instâncias pesadas de navegadores reais, e sofrer com tempos de execução amargos.

Quando decidimos que a reescrita do Glances HUD não apenas rodaria em Angular 22, mas que teria **cobertura massiva de testes**, nós já sabíamos qual motor usaríamos. Na Parte 7 da nossa série, vamos falar sobre a revolução do **Vitest**.

---

## 🏎️ Vitest e Angular: O Fim do Karma e do Jest

O Angular moderno adotou o **Vite** (por debaixo dos panos com o Esbuild) como seu motor primário de dev-server. O que a comunidade logo percebeu foi: se o código já está sendo destilado em milissegundos pelo Vite, por que faríamos um "transpile" inteiro pro Jest (que não entende Vite) rodar na pipeline de testes?

Com o **Vitest**, nós colhemos os frutos de rodar nossos testes na mesmíssima engrenagem de compilação da aplicação real. O boot a frio cai de 15 segundos no Jest/Karma para *fração de segundos*. Se você altera uma linha num componente Angular, o *Watch Mode* do Vitest roda o teste afetado quase instantaneamente.

## 🪓 Esmagando o TestBed: Mockagem sem dor

Uma das maiores críticas ao Angular sempre foi o tamanho do boilerplate nos testes. Historicamente, levantar o `TestBed` (o laboratório de criação de componentes do framework) exigia declarar dúzias de dependências e providers.

Com a nossa arquitetura moderna guiada pela função `inject()` e com o Vitest a tiracolo, testar o nosso intrincado **Motor de Métricas (que roda dentro de Web Workers, como vimos na Parte 9)** virou uma brincadeira de criança.

```typescript
// Testando serviços no Angular 22 com Vitest (sem TestBed pesado!)
import { MetricsService } from './metrics.service';
import { vi, describe, it, expect } from 'vitest';

// Interceptamos o injetor global usando o poder do Vitest
vi.mock('@angular/core', async (importOriginal) => {
  const original = await importOriginal();
  return {
    ...original,
    inject: vi.fn(() => mockDestroyRef),
    effect: vi.fn((fn) => fn()) // Simulamos Signals limpos
  };
});

describe('MetricsService', () => {
  it('deve inicializar o WebWorker silenciosamente', () => {
    // Instanciamos a classe pura, como JavaScript Vanilla!
    const service = new MetricsService();
    expect(Worker).toHaveBeenCalledWith(expect.stringContaining('metrics.worker.ts'));
  });
});
```

A beleza desse trecho está no que *não* está escrito. Não há `TestBed.configureTestingModule`. Nós instanciamos a classe pura, aplicamos a API limpa de *Mocks* do Vitest (`vi.mock`), enganamos a árvore de injeção global e validamos a lógica profunda do nosso Web Worker em 20 milissegundos.

> 💡 *Testes pararam de ser "aquilo que atrasa a sprint" para virarem o nosso aliado mais letal contra quebras de refatoração.*

No **Artigo 8**, vamos abordar o nosso **Tratamento Ouro de Imagens OCI**, revelando como extraímos dados complexos do Docker e renderizamos crachás elegantes na UI. E assim encerraremos o escopo para os artigos 9 e 10 focados no Lighthouse!

Na sua stack atual de Angular, você ainda está preso ao Karma? Ou já migrou para o Jest / Vitest? Quais dores você sentiu? 👇

*(#Angular22 #Vitest #Testing #TDD #Frontend #WebPerformance #SoftwareEngineering #Glances)*


---



---

## 📖 Navegação da Série

- ⏪ **Anterior:** [Parte 6: Injeção de Dependências e Arquitetura Modular](./linkedin_article_6.md)
- ⏩ **Próximo:** [Parte 8: O 'Pulo do Gato' em UX: Parseando Dados Brutos do Docker](./linkedin_article_8.md)

## 🔗 Links do Repositório (Código Real)

Quer conferir como o código ficou na prática? Acesse os arquivos originais direto no nosso GitHub:

- [metrics.service.spec.ts](https://github.com/cesardraw2/glances/blob/master/hud/frontend/src/app/services/metrics.service.spec.ts)
- [metrics.service.ts](https://github.com/cesardraw2/glances/blob/master/hud/frontend/src/app/services/metrics.service.ts)


> *"See You Space Cowboy..."* 🚀
