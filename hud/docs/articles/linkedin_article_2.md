# 🚀 Angular 22 vs Vue 3: Reescrevendo a UI do Glances HUD do zero (Parte 2)

> *"Easy Come, Easy Go..."*

Na Parte 1 dessa série, mostramos como eliminamos a pesada configuração do Webpack e o `zone.js`, inicializando nosso projeto Angular 22 com extrema leveza. Hoje, vamos falar de um dos maiores problemas no desenvolvimento Front-end moderno: **O vício em dependências de terceiros**.

Quando abrimos o `package.json` da interface Vue 3 original do Glances, encontramos uma verdadeira coleção de bibliotecas externas para tarefas triviais. Havia `lodash` para manipular objetos, `bootstrap` empacotado para o layout e, o que mais me chamou a atenção, uma biblioteca inteira chamada `hotkeys-js` apenas para escutar atalhos do teclado do usuário.

A nossa filosofia para o **Glances HUD 2.0** foi o *"Zero-Dependency Mindset"*. Se o framework nativo consegue fazer de forma limpa, não instalamos pacotes externos.

---

## ⌨️ Eliminando bibliotecas de Teclado com \`@HostListener\`

No Glances clássico (Vue 3), se você quiser apertar a tecla "D" para mostrar/esconder o painel do Docker, a aplicação precisa inicializar e registrar atalhos usando a `hotkeys-js` dentro do ciclo de vida dos componentes. Isso adiciona peso ao bundle, possíveis vulnerabilidades de segurança com o tempo e dor de cabeça com manutenções de terceiros.

**Como fizemos no Angular 22:**
O Angular possui um decorador nativo brilhante e extremamente eficiente chamado `@HostListener`. Sem instalar *absolutamente nada*, escutamos os atalhos de teclado globais no nosso `app.component.ts` de forma tipada e elegante:

```typescript
@HostListener('window:keydown', ['$event'])
handleKeyDown(event: KeyboardEvent) {
  // Ignora se o usuário estiver digitando no input de busca do Ollama
  if (event.target instanceof HTMLInputElement) return;

  const key = event.key.toLowerCase();
  switch (key) {
    case 'd':
      this.showDocker.update(v => !v);
      break;
    case 'n':
      this.showNetwork.update(v => !v);
      break;
    // ... e assim por diante
  }
}
```

O código não apenas ficou incrivelmente conciso, mas usando o ecossistema de Signals (`showDocker.update()`), a UI reage de forma cirúrgica instantaneamente. Tudo *in-house*.

---

## 🎨 Adeus, Bootstrap. Olá, Tailwind Nativo!

A versão original herdou anos de evolução visual baseada no Bootstrap clássico. Embora o Bootstrap tenha construído a web moderna, trazer o framework completo gera centenas de kilobytes de CSS que o usuário jamais vai utilizar, mesmo usando ferramentas de *Purge*.

O Angular 22 abraçou o **Tailwind CSS** como parceiro de primeira classe no Angular CLI. Quando geramos o projeto, o Tailwind já veio empacotado no build pipeline (Esbuild). 
Não precisamos baixar frameworks de grid gigantescos. Adotamos classes utilitárias no próprio HTML para esculpir a interface (ex: `grid`, `col-span-12`, `md:col-span-3`). O compilador inteligente varre nosso código e injeta *apenas* os bytes de CSS que nós efetivamente digitamos.

---

## 🎯 O Veredito da Fase 2

Reduzir o `package.json` a praticamente zero bibliotecas "não-framework" significa:
1. **Segurança:** Menos dependências = menor superfície de ataque (lembra das dezenas de `npm audit` gritando?).
2. **Performance:** O Bundle JavaScript cai drasticamente, aliviando o motor V8 do navegador na inicialização.
3. **Manutenção:** Se o Angular atualizar para a v23 amanhã, não precisamos esperar o autor da biblioteca obscura de "hotkeys" soltar uma nova versão.

Na **Parte 3** da série, nós vamos abordar a revolução do fluxo de dados: como extirpamos o `reactive()` do Vue 3 e abraçamos o poderoso sistema declarativo de **Angular Signals** para derivar estados a cada milissegundo.

Como está o `package.json` do seu projeto atual? Ele parece uma lista telefônica de dependências ou está blindado no *Zero-Dependency*? Conta pra mim nos comentários! 👇

*(#Angular22 #VueJS #WebPerformance #TailwindCSS #Frontend #SoftwareEngineering #CleanCode)*


---



---

## 📖 Navegação da Série

- ⏪ **Anterior:** [Parte 1: O Setup Inicial: Webpack vs Esbuild](./linkedin_article_1.md)
- ⏩ **Próximo:** [Parte 3: Reatividade: reactive() do Vue vs Angular Signals](./linkedin_article_3.md)

## 🔗 Links do Repositório (Código Real)

Quer conferir como o código ficou na prática? Acesse os arquivos originais direto no nosso GitHub:

- [app.component.ts](https://github.com/cesardraw2/glances/blob/master/hud/frontend/src/app/app.component.ts)


> *"See You Space Cowboy..."* 🚀
