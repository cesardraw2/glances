# 🚀 Angular 22 vs Vue 3: Reescrevendo a UI do Glances HUD do zero (Parte 4)

> *"Sleeping beast"*

<div align="center">
  <img src="./imgs/spike_broom.gif" width="600" style="border-radius: 8px;"/>
</div>

Na Parte 3 dessa jornada de reescrita do Glances HUD, nós dissecamos como os **Angular Signals** despacham a velha reatividade baseada em Proxies do Vue 3 para escanteio, aliviando o consumo absurdo de CPU causado por atualizações rápidas.

Mas ter os dados chegando voando no JavaScript não é o suficiente se o renderizador da interface (o HTML) não souber lidar com eles. É aqui que entra uma das maiores maravilhas do desenvolvimento moderno: o novo **Control Flow do Angular 22**.

---

## 🎨 O Paradigma Clássico: Diretivas Estruturais (v-for / *ngFor)

O ecossistema original do Glances em Vue 3 renderiza tabelas enormes de métricas usando a tradicional diretiva `v-for`. Funciona muito bem, mas repete uma mecânica que imperou durante os últimos dez anos no frontend: misturar lógica de controle de fluxo mascarada como atributos dentro da tag HTML. 

```html
<!-- Como era no Vue 3 original -->
<tbody v-if="docker.containers.length > 0">
  <tr v-for="container in docker.containers" :key="container.id">
    <td>{{ container.name }}</td>
  </tr>
</tbody>
```

Historicamente, o Angular tinha um problema similar com as diretivas baseadas em atributos (o famoso e temido `*ngFor` ou `*ngIf`). Elas exigiam importações de módulos comuns e sobrecarregavam a leitura visual de templates complexos.

## 🌪️ A Nova Era: Control Flow Nativo (\`@for\` e \`@if\`)

No Angular moderno, a sintaxe de controle de fluxo foi promovida de "diretiva atrelada a uma div" para **cidadã de primeira classe no compilador**, herdando a elegância sintática de motores avançados (como o Razor ou Svelte).

Veja como o mesmo bloco acima foi reconstruído em nosso novo `docker-plugin.component.ts`:

```html
<!-- Como fizemos no Angular 22 -->
@if (containers().length > 0) {
  <tbody>
    @for (container of containers(); track container.id) {
      <tr>
        <td>{{ container.name }}</td>
      </tr>
    }
  </tbody>
} @else {
  <app-skeleton-loader />
}
```

O impacto dessa mudança é estratosférico em três eixos:
1. **Semântica Impecável:** A lógica não está mais "agarrada" artificialmente na tag HTML. O visual e as estruturas lógicas ganham uma distinção claríssima. O uso natural do `@else` resolve de vez a complicação de criar *templates negados* soltos.
2. **Performance Extrema e Obrigatória (`track`):** Note a palavra-chave `track`. O novo algoritmo de compilação do Angular exige que você ensine como identificar o item na iteração (ID único). Isso obriga o desenvolvedor a não cometer a velha gafe de repintar a lista inteira quando apenas um elemento muda. O Angular 22 domina a reconciliação do DOM.
3. **Leveza (Zero Imports):** Não é preciso importar *nenhum* módulo (como o velho `CommonModule`) para poder usar loops e condicionais. É tudo nativo no compilador base.

> 💡 *Dica de ouro: Usar `@for` gerou uma performance percebida muito mais limpa ao rolar os 500+ processos do Glances. As quebras no DOM fluem sem aqueles travamentos incômodos que vemos em SPAs antigas.*

No **Artigo 5** dessa série, vamos dar um salto em direção ao protocolo de rede. Esmiuçaremos como saímos de uma maratona enlouquecida de requisições `fetch()` (Short Polling) para um fluxo sereno, síncrono e contínuo usando **Server-Sent Events (SSE)**.

Qual sintaxe de template você prefere? A abordagem clássica injetada no atributo (`v-for`/`*ngFor`) ou a nova arquitetura limpa de blocos lógicos (`@for`)? Conta pra gente nos comentários! 👇

*(#Angular22 #VueJS #Frontend #WebPerformance #CleanCode #Glances #SoftwareEngineering)*


---



---

## 📖 Navegação da Série

- ⏪ **Anterior:** [Parte 3: Reatividade: reactive() do Vue vs Angular Signals](./linkedin_article_3.md)
- ⏩ **Próximo:** [Parte 5: Tempo Real de Verdade: Polling REST vs Server-Sent Events](./linkedin_article_5.md)

## 🔗 Links do Repositório (Código Real)

Quer conferir como o código ficou na prática? Acesse os arquivos originais direto no nosso GitHub:

- [docker-plugin.component.ts](https://github.com/cesardraw2/glances/blob/develop/hud/frontend/src/app/plugins/docker-plugin.component.ts)


> *"See You Space Cowboy..."* 🚀
