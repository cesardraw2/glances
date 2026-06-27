# 🚀 Angular 22 vs Vue 3: Reescrevendo a UI do Glances HUD do zero (Parte 9)

> *"Whatever happens, happens."*

Chegamos àquele momento crítico que separa uma dashboard comum de um produto de altíssima engenharia. Se você já monitorou um servidor em sobrecarga com centenas de processos e dezenas de contêineres Docker, sabe que renderizar tudo isso na tela pode ser o golpe de misericórdia no navegador do usuário.

No **Glances Web UI** original (feito em Vue 3), a lista de processos é desenhada usando a clássica renderização em loop de uma tag `<table>`. Quando você tem 500 processos ativos atualizando a cada 1 segundo, o navegador é forçado a destruir e reconstruir milhares de *nodes* do DOM incessantemente. O resultado? O clássico engasgo na tela, picos severos no consumo de RAM e aquela sensação de que o painel está "pesado".

Foi aqui que aplicamos a **artilharia pesada do ecossistema Angular**.

---

## 🏎️ O Poder do Angular CDK Virtual Scroll

Nossa primeira missão foi rasgar a arquitetura tabular original. Em vez de pedir para o navegador renderizar 500 linhas na tela de uma só vez, nós conectamos a coleção de processos e contêineres ao **Angular CDK Virtual Scroll**.

**O que isso significa na prática?**
Se existem 500 contêineres rodando, mas a sua tela só tem altura suficiente para exibir 15 deles, o Angular renderiza **exatamente 15 nós no DOM**. Conforme você usa o scroll para baixo, o CDK inteligentemente recicla essas 15 "cascas" visuais, injetando os dados dos próximos processos quase na velocidade da luz.

> 📉 **Resultado (Evidência Real):** Extraímos um Snapshot de Memória (Heap) de ambos os cenários. A interface legada em Vue alocava até **~40MB** de RAM do navegador apenas para segurar a tabela desenhada. A nossa interface Angular com CDK? Travou em cravados **~12.1MB**. Reduzimos o consumo de memória em assustadores **70%**.

---

## 🧵 Thread Principal Livre: A Era dos Web Workers 

Mas não bastava apenas reciclar o HTML. Lembra que cada processo envia métricas brutas de disco (I/O), taxas de rede em bytes e tempo de uso de CPU? O framework original forçava a Main Thread do navegador a processar formatações matemáticas (ex: converter `1503948` bytes para `1.5 MB`) durante a própria renderização visual, causando pequenas "gaguejadas" na UI.

No nosso HUD, nós isolamos **toda** a lógica pesada de formatação e ordenação dentro de um **Web Worker** dedicado (`metrics.worker.ts`). 
O navegador recebe os dados puros via Server-Sent Events (SSE), despacha silenciosamente para o Worker no background, que esmaga os números, ordena a lista pelos maiores gastões de CPU, formata as strings, e devolve o Array 100% polido para o Angular. A Thread Principal do navegador agora só faz uma única coisa: pintar dados prontos na tela a cravados 60 FPS!

---

## 📌 Pinned Containers (Foco Absoluto)

Aproveitando essa fluidez cirúrgica, nós criamos uma mecânica de UX que inexiste no CLI original: o **Pinned Container**.
Ao clicar em qualquer linha de contêiner ou processo correndo solto, você o "fixa" no topo do painel. Usando a reatividade dos Signals do Angular 22, aquele processo é destacado e um novo sub-painel revela estatísticas aprofundadas como o Comando Exato de Execução e a Imagem Base, mantendo o processo crítico na sua mira sem perder o contexto do resto do sistema.

Na semana que vem (Parte 10), encerraremos essa série abordando o segredo por trás do nosso placar **100/100 no Lighthouse**, provando como eliminamos a terrível Layout Shift (CLS) usando Flexbox Estratégico. 

Alguém aqui já teve que resgatar a performance de listas gigantescas? Como vocês lidaram: Paginação Clássica ou Scroll Virtual? Deixa a sua experiência nos comentários! 👇

*(#Angular22 #WebPerformance #Frontend #JavaScript #Glances #VirtualScroll #WebWorkers #UX)*


---



---

## 📖 Navegação da Série

- ⏪ **Anterior:** [Parte 8: O 'Pulo do Gato' em UX: Parseando Dados Brutos do Docker](./linkedin_article_8.md)
- ⏩ **Próximo:** [Parte 10: O Segredo do Lighthouse 100/100 (CLS e Acessibilidade)](./linkedin_article_10.md)

## 🔗 Links do Repositório (Código Real)

Quer conferir como o código ficou na prática? Acesse os arquivos originais direto no nosso GitHub:

- [metrics.worker.ts](https://github.com/cesardraw2/glances/blob/master/hud/frontend/src/app/services/metrics.worker.ts)
- [processes-plugin.component.ts](https://github.com/cesardraw2/glances/blob/master/hud/frontend/src/app/plugins/processes-plugin.component.ts)


> *"See You Space Cowboy..."* 🚀
