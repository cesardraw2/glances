# 🚀 Angular 22 vs Vue 3: Reescrevendo a UI do Glances HUD do zero (Parte 6)

> *"Are you living in the real world?"*

<div align="center">
  <img src="https://media.tenor.com/l-mAGjDCNpoAAAAC/spike-cowboybebop.gif" width="600" style="border-radius: 8px;"/>
</div>

Se você já deu manutenção em um projeto frontend legado, sabe qual é a principal causa de noites mal dormidas: **Código Espaguete**. Quando serviços, requisições de rede e lógica de apresentação se misturam num caldeirão sem dono, adicionar uma feature nova costuma quebrar três funcionalidades velhas.

Nos artigos anteriores, focamos pesadamente em performance pura. Mas na **Parte 6**, o assunto é Arquitetura, Modularidade e como o mecanismo nativo de Injeção de Dependências (DI) do Angular 22 brilhou quando fomos além da especificação original e adicionamos um monitor de Inteligência Artificial Local (Ollama) ao Glances.

---

## 🍝 A Teia Global: Como a UI Original Lida com o Domínio

No Glances HUD (Vue 3) original, a arquitetura de estado empilha a lógica em um imenso `store.js` global ou joga responsabilidades severas para dentro dos próprios arquivos `.vue`. Isso significa que um componente desenhado apenas para exibir dados de "Rede" acaba conhecendo detalhes de como buscar esses dados e como tratá-los no escopo global. 

O problema? Acoplamento altíssimo. Se você precisa modificar a lógica de parsing da Rede, corre o risco de afetar um componente isolado do outro lado do sistema. E para testes unitários isolados, você precisará "mokar" fatias do mundo inteiro.

## 🧱 Arquitetura Angular: Responsabilidade Única

No nosso novo HUD construído com Angular 22 (Standalone Components), abraçamos a Injeção de Dependências desde o primeiro segundo de código. Todo o esforço de rede e estado fica blindado em *Services*, e a UI é forçada a agir de forma "burra" e puramente reativa.

Quando decidimos que a nossa dashboard seria pioneira em monitorar o modelo nativo de IA local (**Ollama**), nós não tocamos em nenhuma linha do código existente dos outros componentes.

Criamos uma cápsula selada:
1. Um **`ollama.service.ts`**: Ele cuida exclusivamente de conversar via API com o Ollama host, tratando retries e formatando dados.
2. Um componente standalone **`ollama-plugin.component.ts`**: Ele só se preocupa em montar as barras de carregamento verde e vermelho, injetando o serviço.

```typescript
@Component({
  selector: 'app-ollama-plugin',
  standalone: true,
  template: `
    @if (service.metrics().status === 'running') {
      <div class="text-green-400">Ollama Ativo e Inferindo!</div>
    }
  `
})
export class OllamaPluginComponent {
  // Injeção limpa de dependência via a nova API 'inject'
  protected service = inject(OllamaService);
}
```

O Angular gerencia o *Singleton* do `OllamaService`. Se amanhã quisermos que um segundo gráfico puxe os dados do Ollama, basta usar `inject(OllamaService)` nele também. Não há conflito, não há recalculo em dobro e a memória permanece otimizada.

**O Resultado?** O desenvolvedor que entrar na equipe amanhã e receber a missão de dar manutenção no monitor de IA nem precisará saber como o resto do dashboard funciona. Ele vai alterar apenas a pasta isolada do domínio dele.

> 💡 *A verdadeira escalabilidade no frontend não é suportar milhões de linhas num grid. É suportar dezenas de desenvolvedores mexendo no mesmo projeto sem sentirem medo de apertar o botão de Commit.*

No **Artigo 7**, vamos entrar na briga dos testes! O ecossistema modernizou violentamente: abandonamos o velho protractor e o karma. Vamos falar sobre a velocidade estúpida do **Vitest** guiando a bateria de testes isolados.

Você prefere o modelo de Contextos Globais (como Vuex/Pinia e Redux) ou a Injeção de Dependências baseada em classes do Angular para escalar equipes? 👇

*(#Angular22 #VueJS #Architecture #DependencyInjection #Ollama #CleanCode #SoftwareEngineering #Frontend)*


---



---

## 📖 Navegação da Série

- ⏪ **Anterior:** [Parte 5: Tempo Real de Verdade: Polling REST vs Server-Sent Events](./linkedin_article_5.md)
- ⏩ **Próximo:** [Parte 7: A Revolução nos Testes: Vitest vs Jest/Karma](./linkedin_article_7.md)

## 🔗 Links do Repositório (Código Real)

Quer conferir como o código ficou na prática? Acesse os arquivos originais direto no nosso GitHub:

- [ollama-plugin.component.ts](https://github.com/cesardraw2/glances/blob/master/hud/frontend/src/app/plugins/ollama-plugin.component.ts)


> *"See You Space Cowboy..."* 🚀
