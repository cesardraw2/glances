# 🚀 Angular 22 vs Vue 3: Reescrevendo a UI do Glances HUD do zero (Parte 1)

> *"Asteroid Blues"*

<div align="center">
  <img src="../imgs/crew_ship.gif" width="600" style="border-radius: 8px;"/>
</div>

Quem acompanha o mundo de monitoramento open-source com certeza conhece o **Glances**. Ele é, de longe, uma das ferramentas de telemetria mais populares construídas em Python. Mas você já abriu o código-fonte da interface web (HUD) que vem embutida nele?

O front-end original é construído em **Vue 3** com um ecossistema ancorado no Webpack. Funciona? Sim! Mas, como um verdadeiro entusiasta da alta performance, eu me fiz a clássica pergunta de engenheiro: *"E se eu reescrever tudo isso usando as tecnologias mais agressivas do **Angular 22**?"*

Esta é a Parte 1 da série onde documento a jornada de reconstruir o HUD do Glances, substituindo o maquinário legado por uma arquitetura que esmaga milissegundos. E a primeira grande vitória foi justamente na fundação do projeto.

---

## 🏗️ O Setup Inicial: Webpack vs Esbuild

No Glances original, a configuração do build é o clássico modelo que muitos de nós passamos anos mantendo: um arquivo `webpack.config.js` denso, configuração manual de Babel, plugins de minificação (Terser), loaders específicos para os arquivos `.vue` e de CSS, além de mapeamento de polyfills.

**Como fizemos no Angular 22:**
Zero configuração manual de bundler. O Angular CLI nativo agora é movido a **Vite e Esbuild**. A configuração do projeto é totalmente declarativa no `angular.json` e a velocidade de build a frio despencou de dezenas de segundos para míseros milissegundos.

O comando `ng build` cospe o JavaScript otimizado em um piscar de olhos, sem que eu precise me preocupar com *loaders* e *plugins* de minificação. O foco voltou a ser apenas escrever código limpo.

---

## 🪦 O Adeus ao NgModules e ao Zone.js

Para quem parou de usar o Angular na versão 8 ou 10, a estrutura atual vai parecer de outro planeta. 

No Glances HUD que construímos, **não existe sequer um arquivo de módulo (`.module.ts`)**. Adotamos a arquitetura 100% `standalone: true`. A aplicação inicializa de forma tão direta e funcional quanto qualquer framework moderno:

```typescript
import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';

bootstrapApplication(AppComponent, {
  providers: [
    // ...
  ]
});
```

Mas o verdadeiro "Pulo do Gato" da versão 22 foi a decisão arquitetônica de **remover o Zone.js**. 

Historicamente, o Angular dependia do `zone.js` para fazer o "monkey-patching" do navegador (interceptar cliques, setTimeouts, XHR) e disparar a renderização da tela. Ao injetar a diretriz `provideZonelessChangeDetection()`, cortamos dezenas de kilobytes do bundle final e acabamos com os ciclos de renderização desnecessários. 

O Angular agora só repinta a tela quando nós dizemos a ele que algo mudou. E como dizemos isso? Usando a detecção `OnPush` acoplada ao novo e brilhante ecossistema de **Signals**.

> 💡 *A combinação de Zoneless com Esbuild transformou uma UI pesada, cheia de atualizações por segundo, em algo completamente imperceptível para a Thread Principal do navegador.*

---

## 🎯 O Veredito da Fase 1

Ao comparar a fundação da UI original com nossa reconstrução, fica nítido que o Angular deixou de ser "aquele framework corporativo pesado e cheio de boilerplate". A versão 22 entrega uma experiência de desenvolvimento que combina a leveza dos micro-frameworks com a solidez e padronização que só o Angular possui.

Na próxima semana, vou mostrar na prática como eliminamos o inferno de bibliotecas terceiras (como lodash e shortkeys) do `package.json` original usando apenas recursos nativos do Angular! 

E você? Já experimentou rodar suas aplicações Angular sem o `zone.js`? Deixa aqui nos comentários como foi o ganho de performance na sua realidade! 👇

*(#Angular22 #WebPerformance #Frontend #JavaScript #Glances #Zoneless)*


---



---

## 📖 Navegação da Série

- ⏩ **Próximo:** [Parte 2: O 'Zero-Dependency Mindset': Eliminando bibliotecas terceiras](./linkedin_article_2.md)

## 🔗 Links do Repositório (Código Real)

Quer conferir como o código ficou na prática? Acesse os arquivos originais direto no nosso GitHub:

- [app.config.ts](https://github.com/cesardraw2/glances/blob/master/hud/frontend/src/app/app.config.ts)
- [app.component.ts](https://github.com/cesardraw2/glances/blob/master/hud/frontend/src/app/app.component.ts)


> *"See You Space Cowboy..."* 🚀
