# ============================================================================
# LEGENDA DE NOMENCLATURA (Naming Convention)
# ============================================================================
# Epic:       OperacaoGlancesHUD
# Feature ID: FGH[NNN]  (Feature Glances HUD)
# Rule ID:    FGH[NNN]_SP[NNN]  (Subprocesso BPMN)
# Cenário ID: FGH[NNN]_A[NNN]   (Activity)
# ============================================================================
# Arquivo: hud-plugins.feature
# Feature: FGH003 - Componentes de Plugin do HUD
# Total de Regras: 12   |   Total de Cenários: 39
# ============================================================================

# language: pt

@epic("OperacaoGlancesHUD")
@feature("#FGH003 - Componentes de Plugin do HUD")
Funcionalidade: Componentes de Plugin do HUD
  Como um operador do Glances HUD
  Eu quero que cada plugin renderize dados do sistema com formatação e alertas corretos
  Para que eu possa monitorar a saúde da infraestrutura em tempo real

  # ══════════════════════════════════════════════════════════════════════
  # REGRA 01 — Plugin System Info
  # ══════════════════════════════════════════════════════════════════════
  Regra: ["FGH003_SP001"] Plugin System Info

    @id("FGH003_A001")
    @swimlane("HudFrontend")
    Cenário: Expor informações do sistema operacional e endereços de rede
      Dado que o plugin System Info foi inicializado com os dados do servidor
        | campo      | valor            |
        | os_name    | Ubuntu 22.04 LTS |
        | hostname   | glances-node-01  |
        | ipAddress  | 192.168.1.10/24  |
        | publicIp   | 203.0.113.42     |
      Quando o componente é criado
      Então o signal "system" deve expor o campo "os_name" com valor "Ubuntu 22.04 LTS"
      E o signal "system" deve expor o campo "hostname" com valor "glances-node-01"
      E o signal "ipAddress" deve conter "192.168.1.10/24"
      E o signal "publicIp" deve conter "203.0.113.42"

    @id("FGH003_A002")
    @swimlane("HudFrontend")
    Esquema do Cenário: Formatar uptime corretamente a partir de segundos
      Dado que o valor de uptime em segundos é <segundos>
      Quando a função formatUptime é invocada
      Então o resultado formatado deve ser "<esperado>"

      Exemplos:
        | segundos | esperado |
        | 0        | 0:00:00  |
        | 3665     | 1:01:05  |

    @id("FGH003_A003")
    @swimlane("HudFrontend")
    Esquema do Cenário: Tratar strings e números na formatação de uptime
      Dado que o valor bruto de uptime é <valor_bruto> do tipo "<tipo>"
      Quando a função formatUptime é invocada
      Então o resultado deve ser "<esperado>"

      Exemplos:
        | valor_bruto | tipo   | esperado |
        | 1:30:00     | string | 1:30:00  |
        | 5400        | number | 1:30:00  |

  # ══════════════════════════════════════════════════════════════════════
  # REGRA 02 — Plugin QuickLook
  # ══════════════════════════════════════════════════════════════════════
  Regra: ["FGH003_SP002"] Plugin QuickLook

    @id("FGH003_A004")
    @swimlane("HudFrontend")
    Cenário: Expor signals de CPU e memória do QuickLook
      Dado que o plugin QuickLook foi inicializado com dados de métricas
      Quando o componente é criado
      Então o signal "cpu" deve estar disponível
      E o signal "mem" deve estar disponível

    @id("FGH003_A005")
    @swimlane("HudFrontend")
    Esquema do Cenário: Gerar barra de progresso ASCII conforme percentual de uso
      Dado que o percentual de uso é <percentual>%
      Quando a função getAsciiBar é invocada
      Então a barra deve conter "<conteudo_esperado>"
      E a classe de cor aplicada deve ser "<classe_cor>"

      Exemplos:
        | percentual | conteudo_esperado    | classe_cor |
        | 0          | somente pontos       | ok         |
        | 100        | somente pipes verdes | ok         |
        | 50         | metade pontos/pipes  | careful    |

  # ══════════════════════════════════════════════════════════════════════
  # REGRA 03 — Plugin Load
  # ══════════════════════════════════════════════════════════════════════
  Regra: ["FGH003_SP003"] Plugin Load

    @id("FGH003_A006")
    @swimlane("HudFrontend")
    Cenário: Expor métricas de carga do sistema com número de cores
      Dado que o plugin Load foi inicializado com os dados:
        | campo   | valor |
        | min1    | 1.25  |
        | min5    | 0.98  |
        | min15   | 0.76  |
        | cpucore | 4     |
      Quando o componente é criado
      Então o signal "load" deve expor "min1", "min5", "min15" e "cpucore"
      E o campo "cpucore" deve ser igual a 4

    @id("FGH003_A007")
    @swimlane("HudFrontend")
    Esquema do Cenário: Formatar valores de carga com duas casas decimais e preenchimento
      Dado que o valor de carga é <valor>
      Quando a função de formatação de load é invocada
      Então o resultado deve ser "<formatado>" com preenchimento de espaços até 5 caracteres

      Exemplos:
        | valor    | formatado |
        | 0.5      |  0.50     |
        | 12.3456  | 12.35     |

    @id("FGH003_A008")
    @swimlane("HudFrontend")
    Esquema do Cenário: Retornar classe de alerta correta conforme razão de carga
      Dado que a razão de carga por core é <razao>
      Quando a classe de alerta é calculada
      Então a classe CSS retornada deve ser "<classe>"

      Exemplos:
        | razao | classe      |
        | 0.5   | bg-ok       |
        | 0.75  | bg-warning  |
        | 0.95  | bg-critical |

  # ══════════════════════════════════════════════════════════════════════
  # REGRA 04 — Plugin CPU
  # ══════════════════════════════════════════════════════════════════════
  Regra: ["FGH003_SP004"] Plugin CPU

    @id("FGH003_A009")
    @swimlane("HudFrontend")
    Cenário: Expor signal de CPU com percentual total e opção per-CPU
      Dado que o plugin CPU foi inicializado com os dados:
        | campo     | valor |
        | total     | 45    |
        | showPerCpu | true |
      Quando o componente é criado
      Então o signal "cpu" deve expor o campo "total" com valor 45
      E a flag "showPerCpu" deve estar habilitada

    @id("FGH003_A010")
    @swimlane("HudFrontend")
    Esquema do Cenário: Retornar classe de alerta correta baseada no percentual de CPU
      Dado que o percentual de uso de CPU é <percentual>
      Quando a classe de alerta é calculada
      Então a classe CSS retornada deve ser "<classe>"

      Exemplos:
        | percentual | classe   |
        | 45         | ok       |
        | 75         | warning  |
        | 95         | critical |

    @id("FGH003_A011")
    @swimlane("HudFrontend")
    Esquema do Cenário: Retornar classe de badge correta baseada no percentual de CPU
      Dado que o percentual de uso de CPU é <percentual>
      Quando a classe de badge é calculada
      Então a classe CSS do badge deve ser "<classe>"

      Exemplos:
        | percentual | classe      |
        | 45         | bg-ok       |
        | 75         | bg-warning  |
        | 95         | bg-critical |

  # ══════════════════════════════════════════════════════════════════════
  # REGRA 05 — Plugin Memória
  # ══════════════════════════════════════════════════════════════════════
  Regra: ["FGH003_SP005"] Plugin Memória

    @id("FGH003_A012")
    @swimlane("HudFrontend")
    Cenário: Expor signal de memória com percentual de uso
      Dado que o plugin Memória foi inicializado com percentual de uso 80
      Quando o componente é criado
      Então o signal "mem" deve expor o campo "percent" com valor 80

    @id("FGH003_A013")
    @swimlane("HudFrontend")
    Esquema do Cenário: Formatar bytes com unidades corretas
      Dado que o valor em bytes é <bytes>
      Quando a função formatBytes é invocada
      Então o resultado formatado deve ser "<esperado>"

      Exemplos:
        | bytes       | esperado |
        | 0           | 0B       |
        | 512         | 512B     |
        | 1024        | 1K       |
        | 1536        | 1.5K    |
        | 1048576     | 1M       |
        | 18488365465 | 17.2G    |

    @id("FGH003_A014")
    @swimlane("HudFrontend")
    Esquema do Cenário: Retornar classe de alerta correta baseada no percentual de memória
      Dado que o percentual de uso de memória é <percentual>
      Quando a classe de alerta é calculada
      Então a classe CSS retornada deve ser "<classe>"

      Exemplos:
        | percentual | classe   |
        | 50         | ok       |
        | 76         | warning  |
        | 92         | critical |

  # ══════════════════════════════════════════════════════════════════════
  # REGRA 06 — Plugin Network
  # ══════════════════════════════════════════════════════════════════════
  Regra: ["FGH003_SP006"] Plugin Network

    @id("FGH003_A015")
    @swimlane("HudFrontend")
    Cenário: Expor signal de rede com múltiplas interfaces
      Dado que o plugin Network foi inicializado com 2 interfaces de rede:
        | interface |
        | eth0      |
        | wlan0     |
      Quando o componente é criado
      Então o signal "network" deve conter 2 interfaces
      E as interfaces "eth0" e "wlan0" devem estar presentes

    @id("FGH003_A016")
    @swimlane("HudFrontend")
    Esquema do Cenário: Formatar taxa de rede removendo espaços e sufixo por segundo
      Dado que a taxa de rede bruta é "<taxa_bruta>"
      Quando a função de formatação de taxa é invocada
      Então o resultado formatado deve ser "<esperado>"

      Exemplos:
        | taxa_bruta | esperado |
        | 2.5 Kb/s   | 2.5Kb/s  |
        | 0 B/s      | 0B/s     |

  # ══════════════════════════════════════════════════════════════════════
  # REGRA 07 — Plugin Disk I/O
  # ══════════════════════════════════════════════════════════════════════
  Regra: ["FGH003_SP007"] Plugin Disk I/O

    @id("FGH003_A017")
    @swimlane("HudFrontend")
    Cenário: Expor signal de I/O de disco com múltiplos dispositivos
      Dado que o plugin Disk I/O foi inicializado com 2 dispositivos:
        | dispositivo |
        | sda         |
        | nvme0n1     |
      Quando o componente é criado
      Então o signal "diskio" deve conter 2 dispositivos
      E os dispositivos "sda" e "nvme0n1" devem estar presentes

    @id("FGH003_A018")
    @swimlane("HudFrontend")
    Esquema do Cenário: Formatar taxa de disco removendo espaços
      Dado que a taxa de disco bruta é "<taxa_bruta>"
      Quando a função de formatação de taxa é invocada
      Então o resultado formatado deve ser "<esperado>"

      Exemplos:
        | taxa_bruta | esperado |
        | 1.2 Mb/s   | 1.2Mb/s  |
        | 0 B/s      | 0B/s     |

  # ══════════════════════════════════════════════════════════════════════
  # REGRA 08 — Plugin File System
  # ══════════════════════════════════════════════════════════════════════
  Regra: ["FGH003_SP008"] Plugin File System

    @id("FGH003_A019")
    @swimlane("HudFrontend")
    Cenário: Expor signal de sistema de arquivos com múltiplos volumes
      Dado que o plugin File System foi inicializado com 2 sistemas de arquivos
      Quando o componente é criado
      Então o signal "fs" deve conter 2 sistemas de arquivos

    @id("FGH003_A020")
    @swimlane("HudFrontend")
    Esquema do Cenário: Retornar classe de alerta correta baseada no percentual de uso de disco
      Dado que o percentual de uso do disco é <percentual>
      Quando a classe de alerta é calculada
      Então a classe CSS retornada deve ser "<classe>"

      Exemplos:
        | percentual | classe   |
        | 40         | ok       |
        | 80         | warning  |
        | 95         | critical |

    @id("FGH003_A021")
    @swimlane("HudFrontend")
    Esquema do Cenário: Formatar bytes de espaço em disco com unidades corretas
      Dado que o valor em bytes é <bytes>
      Quando a função formatBytes é invocada
      Então o resultado formatado deve ser "<esperado>"

      Exemplos:
        | bytes        | esperado |
        | 0            | 0B       |
        | 1024         | 1K       |
        | 1536         | 1.5K    |
        | 1048576      | 1M       |
        | 115343360000 | 107.4G   |

  # ══════════════════════════════════════════════════════════════════════
  # REGRA 09 — Plugin GPU
  # ══════════════════════════════════════════════════════════════════════
  Regra: ["FGH003_SP009"] Plugin GPU

    @id("FGH003_A022")
    @swimlane("HudFrontend")
    Cenário: Expor signal de GPU com múltiplas placas e validar nome
      Dado que o plugin GPU foi inicializado com 2 GPUs:
        | nome       | memoria |
        | GTX 1080   | 8192    |
        | RTX 3090   | 24576   |
      Quando o componente é criado
      Então o signal "gpu" deve conter 2 GPUs
      E a primeira GPU deve ter o nome "GTX 1080"

  # ══════════════════════════════════════════════════════════════════════
  # REGRA 10 — Plugin Sensores
  # ══════════════════════════════════════════════════════════════════════
  Regra: ["FGH003_SP010"] Plugin Sensores

    @id("FGH003_A023")
    @swimlane("HudFrontend")
    Cenário: Expor signal de sensores com múltiplos dispositivos
      Dado que o plugin Sensores foi inicializado com 2 sensores
      Quando o componente é criado
      Então o signal "sensors" deve conter 2 sensores

    @id("FGH003_A024")
    @swimlane("HudFrontend")
    Esquema do Cenário: Retornar classe de alerta correta para sensor de temperatura
      Dado que o sensor é do tipo "temperature" com thresholds:
        | warning | critical |
        | 60      | 80       |
      E o valor atual do sensor é <valor>
      Quando a classe de alerta do sensor é calculada
      Então a classe CSS retornada deve ser "<classe>"

      Exemplos:
        | valor | classe   |
        | 45    | ok       |
        | 72    | warning  |
        | 88    | critical |

    @id("FGH003_A025")
    @swimlane("HudFrontend")
    Esquema do Cenário: Retornar classe de alerta correta para sensor de bateria com lógica invertida
      Dado que o sensor é do tipo "battery" com lógica invertida de alerta
      E o valor atual da bateria é <valor>%
      Quando a classe de alerta do sensor é calculada
      Então a classe CSS retornada deve ser "<classe>"

      Exemplos:
        | valor | classe   |
        | 80    | ok       |
        | 25    | warning  |
        | 10    | critical |

  # ══════════════════════════════════════════════════════════════════════
  # REGRA 11 — Plugin Docker
  # ══════════════════════════════════════════════════════════════════════
  Regra: ["FGH003_SP011"] Plugin Docker

    Contexto:
      Dado que o plugin Docker foi inicializado com 2 containers:
        | id       | nome       | status  |
        | abc123   | web-server | running |
        | def456   | db-backup  | exited  |

    @id("FGH003_A026")
    @swimlane("HudFrontend")
    Cenário: Expor signal de containers Docker
      Quando o componente é criado
      Então o signal "containers" deve conter 2 containers

    @id("FGH003_A027")
    @swimlane("HudFrontend")
    Cenário: Alterar chave de ordenação dos containers via serviço de métricas
      Quando a função changeSort é invocada com a chave "memory"
      Então a chamada deve ser delegada ao containerSortKey.set com valor "memory"

    @id("FGH003_A028")
    @swimlane("HudFrontend")
    Cenário: Alternar destaque local de container de forma idempotente
      Dado que nenhum container está destacado localmente
      Quando o destaque é alternado para o container "abc123"
      Então o container "abc123" deve estar destacado
      Quando o destaque é alternado novamente para o container "abc123"
      Então nenhum container deve estar destacado

    @id("FGH003_A029")
    @swimlane("HudFrontend")
    Esquema do Cenário: Retornar classes de status corretas para containers
      Dado que o status do container é "<status>"
      Quando a classe de status é calculada
      Então a classe CSS de status deve ser "<classe_cor>"

      Exemplos:
        | status  | classe_cor |
        | running | green      |
        | exited  | red        |
        | paused  | yellow     |

    @id("FGH003_A030")
    @swimlane("HudFrontend")
    Esquema do Cenário: Formatar taxas e bytes de containers corretamente
      Dado que o valor bruto é <valor>
      Quando a função "<funcao>" é invocada
      Então o resultado formatado deve ser "<esperado>"

      Exemplos:
        | valor   | funcao      | esperado |
        | 1048576 | formatBytes | 1M       |
        | 0       | formatRate  | 0        |
        | 2048    | formatRate  | 2K       |

    @id("FGH003_A031")
    @swimlane("HudFrontend")
    Esquema do Cenário: Formatar comandos de containers suportando arrays e strings
      Dado que o campo command do container contém <valor_comando> do tipo "<tipo>"
      Quando a função de formatação de comando é invocada
      Então o resultado deve ser "<esperado>"

      Exemplos:
        | valor_comando         | tipo   | esperado            |
        | nginx -g daemon off   | string | nginx -g daemon off |
        | ["nginx","-g","off"]  | array  | nginx -g off        |
        |                       | null   | -                   |

  # ══════════════════════════════════════════════════════════════════════
  # REGRA 12 — Plugin Processos
  # ══════════════════════════════════════════════════════════════════════
  Regra: ["FGH003_SP012"] Plugin Processos

    Contexto:
      Dado que o plugin Processos foi inicializado com 2 processos:
        | pid  | nome    | status  |
        | 1024 | nginx   | running |
        | 2048 | postgres | sleeping |

    @id("FGH003_A032")
    @swimlane("HudFrontend")
    Cenário: Expor signal de processos do sistema
      Quando o componente é criado
      Então o signal "processes" deve conter 2 processos

    @id("FGH003_A033")
    @swimlane("HudFrontend")
    Cenário: Alterar chave de ordenação dos processos via serviço de métricas
      Quando a função changeSort é invocada com a chave "cpu_percent"
      Então a chamada deve ser delegada ao processSortKey.set com valor "cpu_percent"

    @id("FGH003_A034")
    @swimlane("HudFrontend")
    Cenário: Fixar processo quando ele não está fixado previamente
      Dado que nenhum processo está fixado
      Quando a função pinProcess é invocada com PID 1024
      Então o processo com PID 1024 deve ser fixado via pinProcess

    @id("FGH003_A035")
    @swimlane("HudFrontend")
    Cenário: Desfixar processo ao fixar o mesmo processo já fixado
      Dado que o processo com PID 1024 está fixado
      Quando a função pinProcess é invocada com PID 1024
      Então a função unpinProcess deve ser chamada
      E nenhum processo deve estar fixado

    @id("FGH003_A036")
    @swimlane("HudFrontend")
    Esquema do Cenário: Retornar classe de status de CPU correta para processos
      Dado que o percentual de CPU do processo é <percentual>
      Quando a classe de alerta é calculada
      Então a classe CSS retornada deve ser "<classe>"

      Exemplos:
        | percentual | classe   |
        | 10         | ok       |
        | 60         | warning  |
        | 85         | critical |

    @id("FGH003_A037")
    @swimlane("HudFrontend")
    Cenário: Recuperar strings de memória virtual e residente do processo
      Dado que o processo possui memory_info com dados reais:
        """json
        {
          "vms": 1073741824,
          "rss": 268435456
        }
        """
      Quando as funções getVirt e getRes são invocadas
      Então getVirt deve retornar o valor formatado de "vms"
      E getRes deve retornar o valor formatado de "rss"
      Mas se memory_info estiver ausente
      Então getVirt e getRes devem retornar valores de fallback

    @id("FGH003_A038")
    @swimlane("HudFrontend")
    Esquema do Cenário: Formatar tempo de execução de processo corretamente
      Dado que o tempo de CPU do processo em segundos é <segundos>
      Quando a função de formatação de tempo de processo é invocada
      Então o resultado formatado deve ser "<esperado>"

      Exemplos:
        | segundos | esperado |
        | 150      | 2:30.00  |
        | 3720     | 1h02     |
        |          | 00:00.00 |

    @id("FGH003_A039")
    @swimlane("HudFrontend")
    Esquema do Cenário: Mapear status de processo para código e verificar se está em execução
      Dado que o status do processo é "<status>"
      Quando o mapeamento de status é realizado
      Então o código de status deve ser "<codigo>"
      E isProcessRunning deve retornar <em_execucao>

      Exemplos:
        | status   | codigo | em_execucao |
        | running  | R      | true        |
        | S        | S      | false       |
        | zombie   | Z      | false       |
        | sleeping | S      | false       |
