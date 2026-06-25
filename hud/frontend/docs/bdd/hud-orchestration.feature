# ═══════════════════════════════════════════════════════════════
# Legenda de Convenção de IDs (Jarvis Claw Gold Standard)
# ───────────────────────────────────────────────────────────────
# Epic:    OperacaoGlancesHUD
# Feature: FGH[NNN]          → Feature Glances HUD
# Rule:    FGH[NNN]_SP[NNN]  → Subprocesso BPMN
# Cenário: FGH[NNN]_A[NNN]   → Activity
# ═══════════════════════════════════════════════════════════════

# language: pt

@epic("OperacaoGlancesHUD")
@feature("#FGH001 - Orquestração do AppComponent HUD")
Funcionalidade: Orquestração do AppComponent HUD
  O AppComponent é o orquestrador central do HUD Glances.
  Ele gerencia a inicialização de serviços, detecção de hardware,
  atalhos de teclado, sistema de alertas e distribuição de plugins
  nos slots de layout.

  # ─────────────────────────────────────────────────────────────
  # SP001 — Inicialização e Bootstrapping (3 cenários)
  # ─────────────────────────────────────────────────────────────
  Regra: ["FGH001_SP001"] Inicialização e Bootstrapping

    Contexto:
      Dado que o AppComponent foi instanciado com o MetricsService injetado

    @id("FGH001_A001")
    @swimlane("HudFrontend")
    Cenário: Criar o componente e expor os sinais do serviço
      Quando o componente é criado
      Então o componente deve existir
      E deve expor o sinal "isConnected" do serviço
      E deve expor o sinal "isAuthenticated" do serviço
      E deve expor o sinal "loginError" do serviço
      E deve expor o sinal "activePlugins" com exatamente 12 plugins
      E deve expor o sinal "version" do serviço

    @id("FGH001_A002")
    @swimlane("HudFrontend")
    Cenário: Validar que o registry contém todos os 12 plugins obrigatórios
      Quando o componente é criado
      Então o registry de plugins deve conter exatamente os seguintes plugins:
        | plugin     |
        | system     |
        | quicklook  |
        | load       |
        | cpu        |
        | mem        |
        | network    |
        | diskio     |
        | fs         |
        | docker     |
        | gpu        |
        | sensors    |
        | processes  |

    @id("FGH001_A003")
    @swimlane("HudFrontend")
    Cenário: Garantir que todos os sinais de visibilidade iniciam como verdadeiros
      Quando o componente é criado
      Então todos os sinais de visibilidade devem ser verdadeiros:
        | sinal            |
        | showSidebar      |
        | showNetwork      |
        | showDiskIo       |
        | showFileSystem   |
        | showDocker       |
        | showGpu          |
        | showQuickLook    |
        | showTopMenu      |
        | showSensors      |

  # ─────────────────────────────────────────────────────────────
  # SP002 — Delegação de Autenticação (1 cenário)
  # ─────────────────────────────────────────────────────────────
  Regra: ["FGH001_SP002"] Delegação de Autenticação

    @id("FGH001_A004")
    @swimlane("HudFrontend")
    Cenário: Delegar chamada de login ao MetricsService
      Dado que o AppComponent está inicializado
      Quando o método "onLogin" é invocado com usuário "admin" e senha "secret123"
      Então o MetricsService.login deve ser chamado com senha "secret123" e usuário "admin"

  # ─────────────────────────────────────────────────────────────
  # SP003 — Detecção de GPU e Layout Adaptativo (6 cenários)
  # ─────────────────────────────────────────────────────────────
  Regra: ["FGH001_SP003"] Detecção de GPU e Layout Adaptativo

    Contexto:
      Dado que o AppComponent está inicializado

    @id("FGH001_A005")
    @swimlane("HudFrontend")
    Cenário: Retornar falso para hasGpu quando a lista de GPUs está vazia
      Dado que o sinal de GPU retorna uma lista vazia
      Quando a propriedade computada "hasGpu" é avaliada
      Então "hasGpu" deve ser falso

    @id("FGH001_A006")
    @swimlane("HudFrontend")
    Cenário: Retornar verdadeiro para hasGpu quando existem GPUs na lista
      Dado que o sinal de GPU retorna uma lista com a entrada:
        """json
        [{"name": "GTX"}]
        """
      Quando a propriedade computada "hasGpu" é avaliada
      Então "hasGpu" deve ser verdadeiro

    @id("FGH001_A007")
    @swimlane("HudFrontend")
    Cenário: Retornar falsy para hasGpu quando a lista de GPUs é nula
      Dado que o sinal de GPU retorna nulo
      Quando a propriedade computada "hasGpu" é avaliada
      Então "hasGpu" deve ser falsy

    @id("FGH001_A008")
    @swimlane("HudFrontend")
    Cenário: Retornar classe de 4 colunas quando GPU não está visível
      Dado que não há GPU disponível
      Quando as classes de coluna são calculadas
      Então "cpuColClass" deve ser "col-span-12 md:col-span-4"
      E "memColClass" deve ser "col-span-12 md:col-span-4"

    @id("FGH001_A009")
    @swimlane("HudFrontend")
    Cenário: Retornar classe de 3 colunas quando GPU está visível e existe
      Dado que o sinal de GPU retorna uma lista com a entrada:
        """json
        [{"name": "GTX"}]
        """
      E a visibilidade "showGpu" está ativa
      Quando as classes de coluna são calculadas
      Então "cpuColClass" deve ser "col-span-12 md:col-span-3"
      E "memColClass" deve ser "col-span-12 md:col-span-3"

    @id("FGH001_A010")
    @swimlane("HudFrontend")
    Cenário: Retornar classe de 4 colunas quando GPU existe mas visibilidade está desativada
      Dado que o sinal de GPU retorna uma lista com a entrada:
        """json
        [{"name": "GTX"}]
        """
      E a visibilidade "showGpu" está desativada
      Quando as classes de coluna são calculadas
      Então "cpuColClass" deve ser "col-span-12 md:col-span-4"
      E "memColClass" deve ser "col-span-12 md:col-span-4"

  # ─────────────────────────────────────────────────────────────
  # SP004 — Sistema de Alertas (2 cenários)
  # ─────────────────────────────────────────────────────────────
  Regra: ["FGH001_SP004"] Sistema de Alertas

    Contexto:
      Dado que o AppComponent está inicializado

    @id("FGH001_A011")
    @swimlane("HudFrontend")
    Cenário: Retornar nulo quando não existem alertas ativos
      Dado que a lista de alertas está vazia
      Quando a propriedade computada "activeAlert" é avaliada
      Então "activeAlert" deve ser nulo

    @id("FGH001_A012")
    @swimlane("HudFrontend")
    Cenário: Retornar o alerta mais recente quando existem múltiplos alertas
      Dado que a lista de alertas contém:
        """json
        [
          {"msg": "CPU"},
          {"msg": "DISK"}
        ]
        """
      Quando a propriedade computada "activeAlert" é avaliada
      Então "activeAlert" deve conter a mensagem "DISK"

  # ─────────────────────────────────────────────────────────────
  # SP005 — Atalhos de Teclado: Visibilidade (12 cenários)
  # ─────────────────────────────────────────────────────────────
  Regra: ["FGH001_SP005"] Atalhos de Teclado — Alternância de Visibilidade

    Contexto:
      Dado que o AppComponent está inicializado
      E todos os sinais de visibilidade estão no valor padrão verdadeiro

    @id("FGH001_A013")
    @swimlane("HudFrontend")
    Cenário: Ignorar atalhos de teclado quando o foco está em campos de entrada
      Quando a tecla "D" é pressionada em um elemento "INPUT"
      Então o sinal "showDocker" não deve ser alterado
      Quando a tecla "g" é pressionada em um elemento "TEXTAREA"
      Então o sinal "showGpu" não deve ser alterado

    @id("FGH001_A014")
    @id("FGH001_A015")
    @id("FGH001_A016")
    @id("FGH001_A017")
    @id("FGH001_A018")
    @id("FGH001_A019")
    @id("FGH001_A020")
    @id("FGH001_A021")
    @id("FGH001_A022")
    @swimlane("HudFrontend")
    Esquema do Cenário: Alternar visibilidade de painel via atalho de teclado
      Quando a tecla "<tecla>" é pressionada fora de um campo de entrada
      Então o sinal "<sinal>" deve ser alternado para falso
      Quando a tecla "<tecla>" é pressionada novamente
      Então o sinal "<sinal>" deve ser alternado para verdadeiro

      Exemplos:
        | tecla | sinal          | descricao                                    |
        | D     | showDocker     | A014: 'D' maiúsculo alterna Docker           |
        | g     | showGpu        | A015: 'g' minúsculo alterna GPU              |
        | 2     | showSidebar    | A016: '2' alterna Sidebar                    |
        | n     | showNetwork    | A017: 'n' alterna Network                    |
        | d     | showDiskIo     | A018: 'd' minúsculo alterna DiskIO           |
        | f     | showFileSystem | A019: 'f' alterna FileSystem                 |
        | s     | showSensors    | A020: 's' alterna Sensors                    |
        | 3     | showQuickLook  | A021: '3' alterna QuickLook                  |
        | 5     | showTopMenu    | A022: '5' alterna TopMenu                    |

    @id("FGH001_A023")
    @swimlane("HudFrontend")
    Cenário: Alternar exibição per-CPU delegando ao sinal do serviço
      Quando a tecla "1" é pressionada fora de um campo de entrada
      Então o sinal "showPerCpu" do MetricsService deve ser alternado

  # ─────────────────────────────────────────────────────────────
  # SP006 — Atalhos de Teclado: Ordenação de Processos (6 cenários)
  # ─────────────────────────────────────────────────────────────
  Regra: ["FGH001_SP006"] Atalhos de Teclado — Ordenação de Processos

    Contexto:
      Dado que o AppComponent está inicializado

    @id("FGH001_A024")
    @id("FGH001_A025")
    @id("FGH001_A026")
    @id("FGH001_A027")
    @id("FGH001_A028")
    @id("FGH001_A029")
    @swimlane("HudFrontend")
    Esquema do Cenário: Alterar a chave de ordenação de processos via atalho de teclado
      Quando a tecla "<tecla>" é pressionada fora de um campo de entrada
      Então "processSortKey" deve ser definido como "<sortKey>"

      Exemplos:
        | tecla | sortKey      | descricao                                  |
        | a     | cpu_percent  | A024: 'a' ordena por uso de CPU            |
        | c     | cpu_percent  | A024: 'c' também ordena por uso de CPU     |
        | m     | mem_percent  | A025: 'm' ordena por uso de memória        |
        | p     | name         | A026: 'p' ordena por nome do processo      |
        | u     | username     | A027: 'u' ordena por usuário               |
        | t     | time         | A028: 't' ordena por tempo de execução     |
        | i     | io           | A029: 'i' ordena por I/O                   |

  # ─────────────────────────────────────────────────────────────
  # SP007 — Distribuição de Plugins nos Slots de Layout (6 cenários)
  # ─────────────────────────────────────────────────────────────
  Regra: ["FGH001_SP007"] Distribuição de Plugins nos Slots de Layout

    Contexto:
      Dado que o AppComponent está inicializado
      E todos os sinais de visibilidade estão no valor padrão verdadeiro

    @id("FGH001_A030")
    @swimlane("HudFrontend")
    Cenário: Distribuir apenas o plugin system no slot superior
      Quando os slots de layout são calculados
      Então "topPlugins" deve conter apenas o plugin "system"

    @id("FGH001_A031")
    @swimlane("HudFrontend")
    Cenário: Distribuir quicklook, cpu, mem e load no slot sub-superior
      Quando os slots de layout são calculados
      Então "subTopPlugins" deve conter exatamente 4 plugins:
        | plugin    |
        | quicklook |
        | cpu       |
        | mem       |
        | load      |

    @id("FGH001_A032")
    @swimlane("HudFrontend")
    Cenário: Distribuir plugins de rede e disco na sidebar quando todos estão visíveis
      Dado que os sinais "showNetwork", "showDiskIo", "showFileSystem" e "showSensors" estão ativos
      Quando os slots de layout são calculados
      Então "sidebarPlugins" deve conter exatamente:
        | plugin   |
        | network  |
        | diskio   |
        | fs       |
        | sensors  |

    @id("FGH001_A033")
    @swimlane("HudFrontend")
    Cenário: Excluir plugins ocultos da sidebar
      Dado que o sinal "showNetwork" está desativado
      E que o sinal "showDiskIo" está desativado
      Quando os slots de layout são calculados
      Então "sidebarPlugins" deve conter apenas:
        | plugin  |
        | fs      |
        | sensors |

    @id("FGH001_A034")
    @swimlane("HudFrontend")
    Cenário: Distribuir docker e processes no slot principal quando docker está visível
      Dado que o sinal "showDocker" está ativo
      Quando os slots de layout são calculados
      Então "mainPlugins" deve conter exatamente:
        | plugin    |
        | docker    |
        | processes |

    @id("FGH001_A035")
    @swimlane("HudFrontend")
    Cenário: Excluir docker do slot principal quando sua visibilidade está desativada
      Dado que o sinal "showDocker" está desativado
      Quando os slots de layout são calculados
      Então "mainPlugins" deve conter apenas o plugin "processes"
