# 🚀 Angular 22 vs Vue 3: Reescrevendo a UI do Glances HUD do zero (Parte 5)

> *"Life is but a dream..."*

<div align="center">
  <img src="https://media.giphy.com/media/j7Jd7ytO4a9os/giphy.gif" width="600" style="border-radius: 8px;"/>
</div>

Até agora, discutimos como preparamos a fundação do Angular 22 (Zoneless, Signals e Control Flow) para receber uma avalanche de dados sem piscar. Mas a pergunta de ouro de qualquer painel de telemetria é: **Como esses dados chegam do servidor até o navegador?**

Hoje, vamos mergulhar na arquitetura de rede. Vamos comparar o clássico "Short Polling" do Vue 3 original com a nossa abordagem em tempo real baseada em Server-Sent Events (SSE).

---

## 🐢 O Legado: O Pesadelo do Short Polling (`setTimeout`)

Se você investigar o arquivo `services.js` na interface Web original do Glances, vai encontrar uma das abordagens mais antigas (e custosas) da web para simular tempo real: o **Short Polling**.

```javascript
// O modelo original em Vue 3 (Resumido)
function fetchMetrics() {
  fetch('/api/3/all')
    .then(response => response.json())
    .then(data => {
      store.stats = data;
    })
    .finally(() => {
      // O infame loop infinito
      setTimeout(fetchMetrics, 1000); 
    });
}
```

Essa abordagem faz com que, a cada 1 segundo, o navegador abra uma nova conexão TCP, negocie cabeçalhos HTTP, baixe um JSON massivo, feche a conexão e repita o ciclo.
Se o Glances estiver rodando em uma rede com latência, as requisições se atropelam. O overhead de cabeçalhos de rede se torna maior que o próprio dado trafegado. Em servidores com recursos estrangulados, criar e destruir sockets a cada segundo para múltiplos clientes web é uma receita para o desastre.

---

## ⚡ A Revolução: Fluxo Contínuo com Server-Sent Events (SSE)

Para o **Glances HUD 2.0**, nós banimos completamente o Polling. Como o Glances só envia dados (o cliente web apenas assiste), não precisávamos do peso bidirecional de WebSockets. A tecnologia perfeita era o **Server-Sent Events (SSE)**.

No nosso `metrics.service.ts` no Angular 22, nós abrimos *uma única conexão HTTP* com a API e deixamos o canal aberto. O servidor passa a "cuspir" eventos de métricas de forma unidirecional, sem renegociar cabeçalhos, sem abrir novos sockets.

```typescript
// A nova abordagem no Angular 22
private connectSSE() {
  const source = new EventSource('/api/4/stream');

  // Conexão aberta uma única vez!
  source.onmessage = (event) => {
    const rawData = JSON.parse(event.data);
    
    // Atualiza o Signal instantaneamente
    this.metrics.set(rawData);
  };

  source.onerror = () => {
    source.close();
    // Lógica inteligente de reconexão
  };
}
```

O impacto no **Network tab** do Chrome DevTools é brutal:
- **Vue 3:** Centenas de requisições GET acumuladas em cascata (status 200), poluindo o profiler e a placa de rede.
- **Angular 22:** Apenas **uma** requisição `pending` na aba de rede. O payload (EventStream) flui através dessa única "mangueira" de dados de forma quase instantânea.

> 💡 *Acoplado com o `provideZonelessChangeDetection()` que discutimos no Artigo 1, o Angular não pisca a tela inteira quando o SSE dispara. Ele usa o Signal `this.metrics.set()` para notificar apenas os fragmentos do DOM que realmente mudaram na interface.*

Na **Parte 6** da série, vamos dissecar o elefante na sala: Injeção de Dependências. Como o Angular brilha na modularização extrema e no desacoplamento de componentes (como o nosso novíssimo Plugin de IA Ollama).

Na sua empresa, vocês ainda usam "Short Polling" (setInterval/setTimeout) para painéis, ou já migraram para SSE / WebSockets? Deixe seu depoimento nos comentários! 👇

*(#Angular22 #WebPerformance #ServerSentEvents #SSE #VueJS #Frontend #Glances #Networking)*


---



---

## 📖 Navegação da Série

- ⏪ **Anterior:** [Parte 4: Template Control Flow: Vue v-for vs Angular @for](./linkedin_article_4.md)
- ⏩ **Próximo:** [Parte 6: Injeção de Dependências e Arquitetura Modular](./linkedin_article_6.md)

## 🔗 Links do Repositório (Código Real)

Quer conferir como o código ficou na prática? Acesse os arquivos originais direto no nosso GitHub:

- [metrics.service.ts](https://github.com/cesardraw2/glances/blob/master/hud/frontend/src/app/services/metrics.service.ts)


> *"See You Space Cowboy..."* 🚀
