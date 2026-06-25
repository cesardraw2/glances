# language: pt
# ╔══════════════════════════════════════════════════════════════════════════╗
# ║  LEGENDA DE NOMENCLATURA (Naming Convention)                           ║
# ║                                                                        ║
# ║  Epic:       OperacaoGlancesHUD                                        ║
# ║  Feature ID: FGH[NNN]       (Feature Glances HUD)                      ║
# ║  Rule ID:    FGH[NNN]_SP[NNN] (Subprocesso BPMN)                       ║
# ║  Cenário ID: FGH[NNN]_A[NNN]  (Activity)                               ║
# ║                                                                        ║
# ║  Feature:    FGH002 - Motor de Métricas (MetricsService)               ║
# ║  Total:      83 cenários | 17 regras                                   ║
# ╚══════════════════════════════════════════════════════════════════════════╝

@epic("OperacaoGlancesHUD")
@feature("#FGH002 - Motor de Métricas")
Funcionalidade: Motor de Métricas do HUD
  O MetricsService é o coração do HUD Glances, responsável por:
  - Conectar-se ao backend via SSE (Server-Sent Events)
  - Normalizar dados brutos de CPU, memória, rede, disco, containers e processos
  - Expor signals reativos para consumo pelo restante da aplicação
  - Gerenciar autenticação, pin/unpin de processos e ciclo de vida SSE

  # ══════════════════════════════════════════════════════════════════════
  # REGRA 01 — Inicialização e Conexão
  # ══════════════════════════════════════════════════════════════════════
  Regra: ["FGH002_SP001"] Inicialização e Conexão do Serviço

    Contexto:
      Dado que o MetricsService foi instanciado no contexto Angular

    @swimlane("MetricsEngine")
    @id("FGH002_A001")
    Cenário: Serviço conecta ao SSE ao ser criado
      Quando o serviço é inicializado
      Então uma chamada fetch deve ser disparada para o endpoint SSE
      E o serviço deve estar no estado conectando

    @swimlane("MetricsEngine")
    @id("FGH002_A002")
    Cenário: Serviço registra callbacks de cleanup no destroyRef
      Quando o serviço é inicializado
      Então callbacks de limpeza devem ser registrados via destroyRef.onDestroy
      E os recursos SSE devem ser liberados ao destruir o componente

    @swimlane("MetricsEngine")
    @id("FGH002_A003")
    Cenário: Valores padrão dos signals de controle estão corretos na inicialização
      Quando o serviço é inicializado
      Então os signals de controle devem possuir os seguintes valores:
        | signal             | valor_padrão  |
        | processSortKey     | cpu_percent   |
        | containerSortKey   | cpu_percent   |
        | showPerCpu         | false         |
        | isAuthenticated    | true          |
        | loginError         | null          |
        | metrics            | null          |

    @swimlane("MetricsEngine")
    @id("FGH002_A004")
    Cenário: Serviço expõe a lista completa de 12 plugins
      Quando o serviço é inicializado
      Então a lista de plugins deve conter exatamente 12 itens
      E a lista deve incluir os plugins "system" e "processes"

  # ══════════════════════════════════════════════════════════════════════
  # REGRA 02 — Formatação de Taxas de Bytes
  # ══════════════════════════════════════════════════════════════════════
  Regra: ["FGH002_SP002"] Formatação de Taxas de Bytes

    @swimlane("MetricsEngine")
    @id("FGH002_A005")
    @id("FGH002_A006")
    @id("FGH002_A007")
    @id("FGH002_A008")
    @id("FGH002_A009")
    @id("FGH002_A010")
    Esquema do Cenário: Formata taxas de bytes em unidades legíveis
      Dado que o MetricsService está disponível
      Quando formatBytesRate é invocado com o valor <entrada>
      Então o resultado deve ser "<saida>"

      Exemplos:
        | entrada       | saida       |
        | 0             | 0 B/s       |
        | null          | 0 B/s       |
        | undefined     | 0 B/s       |
        | NaN           | 0 B/s       |
        | 500           | 500 B/s     |
        | 1500          | 1.5 Kb/s    |
        | 2500000       | 2.5 Mb/s    |
        | 3500000000    | 3.5 Gb/s    |

  # ══════════════════════════════════════════════════════════════════════
  # REGRA 03 — Normalização de Dados do Sistema
  # ══════════════════════════════════════════════════════════════════════
  Regra: ["FGH002_SP003"] Normalização de Dados do Sistema

    Contexto:
      Dado que o MetricsService está ativo e recebendo dados SSE

    @swimlane("MetricsEngine")
    @id("FGH002_A011")
    Cenário: System retorna null quando não há métricas disponíveis
      Dado que o payload SSE não contém dados do sistema
      Quando o signal system é consultado
      Então o valor retornado deve ser null

    @swimlane("MetricsEngine")
    @id("FGH002_A012")
    Cenário: System retorna dados com uptime extraído do nível raiz
      Dado que o payload SSE contém uptime no nível raiz
      Quando o signal system é consultado
      Então os dados do sistema devem incluir o uptime do nível raiz

    @swimlane("MetricsEngine")
    @id("FGH002_A013")
    Cenário: System utiliza fallback para system.uptime quando uptime raiz está ausente
      Dado que o payload SSE não contém uptime no nível raiz
      Mas contém uptime dentro do objeto system
      Quando o signal system é consultado
      Então os dados do sistema devem incluir o uptime do campo system.uptime

    @swimlane("MetricsEngine")
    @id("FGH002_A014")
    Cenário: ipAddress retorna string vazia quando não há dados de IP
      Dado que o payload SSE não contém dados de rede IP
      Quando o signal ipAddress é consultado
      Então o valor retornado deve ser ""

    @swimlane("MetricsEngine")
    @id("FGH002_A015")
    Cenário: ipAddress retorna endereço com máscara CIDR quando disponível
      Dado que o payload SSE contém IP "192.168.1.10" com mask_cidr "24"
      Quando o signal ipAddress é consultado
      Então o valor retornado deve ser "192.168.1.10/24"

    @swimlane("MetricsEngine")
    @id("FGH002_A016")
    Cenário: ipAddress retorna apenas o endereço quando mask_cidr está ausente
      Dado que o payload SSE contém IP "192.168.1.10" sem mask_cidr
      Quando o signal ipAddress é consultado
      Então o valor retornado deve conter apenas o endereço IP sem barra

    @swimlane("MetricsEngine")
    @id("FGH002_A017")
    Cenário: publicIp retorna string vazia quando não há IP público
      Dado que o payload SSE não contém dados de IP público
      Quando o signal publicIp é consultado
      Então o valor retornado deve ser ""

    @swimlane("MetricsEngine")
    @id("FGH002_A018")
    Esquema do Cenário: publicIp resolve campo correto com fallback e rejeição de 'None'
      Dado que o payload SSE contém o campo de IP público <campo> com valor <valor>
      Quando o signal publicIp é consultado
      Então o valor retornado deve ser "<esperado>"

      Exemplos:
        | campo      | valor          | esperado       |
        | publicip   | 8.8.8.8        | 8.8.8.8        |
        | public_ip  | 1.1.1.1        | 1.1.1.1        |
        | publicip   | None           |                |

  # ══════════════════════════════════════════════════════════════════════
  # REGRA 04 — Normalização de CPU e Memória
  # ══════════════════════════════════════════════════════════════════════
  Regra: ["FGH002_SP004"] Normalização de CPU e Memória

    Contexto:
      Dado que o MetricsService está ativo e recebendo dados SSE

    @swimlane("MetricsEngine")
    @id("FGH002_A019")
    Cenário: CPU retorna null quando não há dados disponíveis
      Dado que o payload SSE não contém dados de CPU
      Quando o signal cpu é consultado
      Então o valor retornado deve ser null

    @swimlane("MetricsEngine")
    @id("FGH002_A020")
    Cenário: CPU mapeia percpu para array de cores com id e percentual
      Dado que o payload SSE contém dados de CPU com percpu populado
      Quando o signal cpu é consultado
      Então o campo cores deve ser um array de objetos com propriedades "id" e "percent"

    @swimlane("MetricsEngine")
    @id("FGH002_A021")
    Cenário: CPU trata ausência de percpu sem erros
      Dado que o payload SSE contém dados de CPU sem o campo percpu
      Quando o signal cpu é consultado
      Então o campo cores deve ser undefined

    @swimlane("MetricsEngine")
    @id("FGH002_A022")
    Cenário: Memória retorna null quando não há dados disponíveis
      Dado que o payload SSE não contém dados de memória
      Quando o signal mem é consultado
      Então o valor retornado deve ser null

    @swimlane("MetricsEngine")
    @id("FGH002_A023")
    Cenário: Memória mescla dados de swap do memswap
      Dado que o payload SSE contém dados de memória e memswap
      Quando o signal mem é consultado
      Então o resultado deve conter os campos mesclados:
        | campo          | origem   |
        | swap_total     | memswap  |
        | swap_used      | memswap  |
        | swap_free      | memswap  |
        | swap_percent   | memswap  |

    @swimlane("MetricsEngine")
    @id("FGH002_A024")
    Cenário: Memória assume swap zerado quando memswap está ausente
      Dado que o payload SSE contém dados de memória sem memswap
      Quando o signal mem é consultado
      Então os campos de swap devem ser 0

  # ══════════════════════════════════════════════════════════════════════
  # REGRA 05 — Normalização de Rede
  # ══════════════════════════════════════════════════════════════════════
  Regra: ["FGH002_SP005"] Normalização de Dados de Rede

    Contexto:
      Dado que o MetricsService está ativo e recebendo dados SSE

    @swimlane("MetricsEngine")
    @id("FGH002_A025")
    Cenário: Network retorna null quando não há dados de rede
      Dado que o payload SSE não contém dados de rede
      Quando o signal network é consultado
      Então o valor retornado deve ser null

    @swimlane("MetricsEngine")
    @id("FGH002_A026")
    Cenário: Network filtra interfaces virtuais com tráfego baixo
      Dado que o payload SSE contém interfaces de rede incluindo virtuais:
        | interface_name | bytes_recv_rate_per_sec | bytes_sent_rate_per_sec |
        | eth0           | 50000                   | 30000                   |
        | veth1234       | 100                     | 50                      |
        | br-abcdef      | 200                     | 100                     |
        | docker0        | 500                     | 300                     |
        | virbr0         | 10                      | 5                       |
      Quando o signal network é consultado
      Então apenas "eth0" deve estar presente na lista de interfaces
      E interfaces virtuais com tráfego abaixo de 10000 bytes/s devem ser excluídas

    @swimlane("MetricsEngine")
    @id("FGH002_A027")
    Cenário: Network mantém interfaces virtuais com tráfego alto
      Dado que o payload SSE contém uma interface "docker0" com tráfego acima de 10000 bytes/s
      Quando o signal network é consultado
      Então "docker0" deve estar presente na lista de interfaces

    @swimlane("MetricsEngine")
    @id("FGH002_A028")
    Cenário: Network normaliza nomes de campos e formata taxas em unidades legíveis
      Dado que o payload SSE contém interface com campo "interface_name" e taxas em bytes
      Quando o signal network é consultado
      Então o campo "interface_name" deve ser normalizado para "interface"
      E as taxas de bytes devem ser formatadas com sufixo adequado (Mb/s, Kb/s)

    @swimlane("MetricsEngine")
    @id("FGH002_A029")
    Cenário: Network repassa dados já normalizados sem alteração
      Dado que o payload SSE contém interfaces já normalizadas com chave "interface"
      Quando o signal network é consultado
      Então os dados devem ser repassados sem transformação adicional

  # ══════════════════════════════════════════════════════════════════════
  # REGRA 06 — Normalização de Disco
  # ══════════════════════════════════════════════════════════════════════
  Regra: ["FGH002_SP006"] Normalização de Dados de Disco

    Contexto:
      Dado que o MetricsService está ativo e recebendo dados SSE

    @swimlane("MetricsEngine")
    @id("FGH002_A030")
    Cenário: DiskIO retorna null quando não há dados de disco
      Dado que o payload SSE não contém dados de disk I/O
      Quando o signal diskio é consultado
      Então o valor retornado deve ser null

    @swimlane("MetricsEngine")
    @id("FGH002_A031")
    Cenário: DiskIO filtra dispositivos loop e ram
      Dado que o payload SSE contém dispositivos de disco incluindo "loop0", "ram0" e "sda"
      Quando o signal diskio é consultado
      Então apenas "sda" deve estar presente na lista
      E dispositivos loop e ram devem ser excluídos

    @swimlane("MetricsEngine")
    @id("FGH002_A032")
    Cenário: DiskIO normaliza nomes de campos e formata taxas
      Dado que o payload SSE contém disco com campo "disk_name" e taxas em bytes
      Quando o signal diskio é consultado
      Então o campo "disk_name" deve ser normalizado para "device"
      E as taxas devem ser formatadas em unidades legíveis

    @swimlane("MetricsEngine")
    @id("FGH002_A033")
    Cenário: DiskIO repassa dados já normalizados sem alteração
      Dado que o payload SSE contém discos já normalizados com chave "device"
      Quando o signal diskio é consultado
      Então os dados devem ser repassados sem transformação adicional

    @swimlane("MetricsEngine")
    @id("FGH002_A034")
    Cenário: FileSystem retorna null quando não há dados de sistema de arquivos
      Dado que o payload SSE não contém dados de filesystem
      Quando o signal fs é consultado
      Então o valor retornado deve ser null

    @swimlane("MetricsEngine")
    @id("FGH002_A035")
    Cenário: FileSystem normaliza device_name para device e mnt_point para mount
      Dado que o payload SSE contém filesystem com campos "device_name" e "mnt_point"
      Quando o signal fs é consultado
      Então o campo "device_name" deve ser normalizado para "device"
      E o campo "mnt_point" deve ser normalizado para "mount"

    @swimlane("MetricsEngine")
    @id("FGH002_A036")
    Cenário: FileSystem repassa dados já normalizados sem alteração
      Dado que o payload SSE contém filesystem já normalizado com chaves "device" e "mount"
      Quando o signal fs é consultado
      Então os dados devem ser repassados sem transformação adicional

  # ══════════════════════════════════════════════════════════════════════
  # REGRA 07 — Orquestração de Containers
  # ══════════════════════════════════════════════════════════════════════
  Regra: ["FGH002_SP007"] Orquestração de Containers

    Contexto:
      Dado que o MetricsService está ativo e recebendo dados SSE

    @swimlane("MetricsEngine")
    @id("FGH002_A037")
    Cenário: Containers retorna lista vazia quando não há dados
      Dado que o payload SSE não contém dados de containers
      Quando o signal containers é consultado
      Então o valor retornado deve ser uma lista vazia

    @swimlane("MetricsEngine")
    @id("FGH002_A038")
    @id("FGH002_A039")
    @id("FGH002_A040")
    @id("FGH002_A041")
    Esquema do Cenário: Containers ordena por critério selecionado
      Dado que o payload SSE contém uma lista de containers com dados variados
      E o containerSortKey está definido como "<chave_ordenacao>"
      Quando o signal containers é consultado
      Então a lista deve estar ordenada por <criterio> em ordem <direcao>

      Exemplos:
        | chave_ordenacao | criterio                          | direcao      |
        | cpu_percent     | percentual de CPU                 | decrescente  |
        | memory_usage    | uso de memória                    | decrescente  |
        | memory.usage    | uso de memória (campo aninhado)   | decrescente  |
        | name            | nome do container                 | alfabética   |

  # ══════════════════════════════════════════════════════════════════════
  # REGRA 08 — Orquestração de Processos
  # ══════════════════════════════════════════════════════════════════════
  Regra: ["FGH002_SP008"] Orquestração de Processos

    Contexto:
      Dado que o MetricsService está ativo e recebendo dados SSE

    @swimlane("MetricsEngine")
    @id("FGH002_A042")
    Cenário: Processos retorna null quando não há dados disponíveis
      Dado que o payload SSE não contém dados de processos
      Quando o signal processes é consultado
      Então o valor retornado deve ser null

    @swimlane("MetricsEngine")
    @id("FGH002_A043")
    Cenário: Processos utiliza chave processlist como fallback para processes
      Dado que o payload SSE contém dados sob a chave "processlist" ao invés de "processes"
      Quando o signal processes é consultado
      Então os dados devem ser extraídos da chave "processlist"

    @swimlane("MetricsEngine")
    @id("FGH002_A044")
    @id("FGH002_A045")
    @id("FGH002_A046")
    @id("FGH002_A047")
    @id("FGH002_A048")
    @id("FGH002_A049")
    Esquema do Cenário: Processos ordena por critério selecionado
      Dado que o payload SSE contém uma lista de processos com dados variados
      E o processSortKey está definido como "<chave_ordenacao>"
      Quando o signal processes é consultado
      Então a lista deve estar ordenada por <criterio> em ordem <direcao>

      Exemplos:
        | chave_ordenacao  | criterio                                         | direcao          |
        | cpu_percent      | percentual de CPU                                | decrescente      |
        | mem_percent      | percentual de memória (com fallback memory_percent) | decrescente   |
        | time             | tempo de CPU (cpu_times.user + system, sem cpu_times → 0)   | decrescente |
        | io               | I/O total (io_counters[2]+[3], sem io_counters → 0) | decrescente  |
        | name             | nome do processo                                 | alfabética (case-insensitive) |
        | username         | nome do usuário                                  | alfabética (case-insensitive) |

    @swimlane("MetricsEngine")
    @id("FGH002_A050")
    Cenário: Processo estendido retorna null quando não há processos
      Dado que o payload SSE não contém dados de processos
      Quando o signal extendedProcess é consultado
      Então o valor retornado deve ser null

    @swimlane("MetricsEngine")
    @id("FGH002_A051")
    Cenário: Processo estendido retorna null quando nenhum processo possui extended_stats
      Dado que o payload SSE contém processos sem a flag extended_stats
      Quando o signal extendedProcess é consultado
      Então o valor retornado deve ser null

    @swimlane("MetricsEngine")
    @id("FGH002_A052")
    Cenário: Processo estendido retorna o processo que possui extended_stats ativo
      Dado que o payload SSE contém processos onde um possui extended_stats igual a true
      Quando o signal extendedProcess é consultado
      Então o processo com extended_stats ativo deve ser retornado

  # ══════════════════════════════════════════════════════════════════════
  # REGRA 09 — Signals Simples de Métricas
  # ══════════════════════════════════════════════════════════════════════
  Regra: ["FGH002_SP009"] Signals Simples de Métricas

    Contexto:
      Dado que o MetricsService está ativo e recebendo dados SSE

    @swimlane("MetricsEngine")
    @id("FGH002_A053")
    Cenário: Alerts retorna lista vazia como padrão
      Dado que o payload SSE não contém alertas
      Quando o signal alerts é consultado
      Então o valor retornado deve ser uma lista vazia

    @swimlane("MetricsEngine")
    @id("FGH002_A054")
    Cenário: Alerts expõe dados do campo metrics.alert
      Dado que o payload SSE contém alertas no campo "alert"
      Quando o signal alerts é consultado
      Então os alertas recebidos devem ser expostos corretamente

    @swimlane("MetricsEngine")
    @id("FGH002_A055")
    Cenário: Version expõe a versão do Glances a partir das métricas
      Dado que o payload SSE contém informação de versão
      Quando o signal version é consultado
      Então a versão do Glances deve ser retornada

    @swimlane("MetricsEngine")
    @id("FGH002_A056")
    Cenário: Load expõe dados de carga com min1, min5, min15 e cpucore
      Dado que o payload SSE contém dados de load average
      Quando o signal load é consultado
      Então o resultado deve conter os campos "min1", "min5", "min15" e "cpucore"

    @swimlane("MetricsEngine")
    @id("FGH002_A057")
    Cenário: Sensors expõe array de sensores do sistema
      Dado que o payload SSE contém dados de sensores
      Quando o signal sensors é consultado
      Então o resultado deve ser um array de sensores

    @swimlane("MetricsEngine")
    @id("FGH002_A058")
    Cenário: GPU expõe array de GPUs disponíveis
      Dado que o payload SSE contém dados de GPU
      Quando o signal gpu é consultado
      Então o resultado deve ser um array de GPUs

    @swimlane("MetricsEngine")
    @id("FGH002_A059")
    Cenário: ProcessCount expõe contagem com total, running e sleeping
      Dado que o payload SSE contém dados de contagem de processos
      Quando o signal processcount é consultado
      Então o resultado deve conter os campos "total", "running" e "sleeping"

  # ══════════════════════════════════════════════════════════════════════
  # REGRA 10 — Ciclo de Vida SSE
  # ══════════════════════════════════════════════════════════════════════
  Regra: ["FGH002_SP010"] Ciclo de Vida SSE

    Contexto:
      Dado que o MetricsService foi instanciado e o EventSource foi criado

    @swimlane("MetricsEngine")
    @id("FGH002_A060")
    Cenário: Conexão SSE aberta atualiza estado para conectado
      Quando o evento onopen do EventSource é disparado
      Então o signal isConnected deve ser true

    @swimlane("MetricsEngine")
    @id("FGH002_A061")
    Cenário: Mensagem SSE com JSON válido atualiza métricas
      Quando o evento onmessage é disparado com um payload JSON válido
      Então o signal metrics deve ser atualizado com os dados recebidos

    @swimlane("MetricsEngine")
    @id("FGH002_A062")
    Cenário: Mensagem SSE com JSON inválido registra erro sem crash
      Quando o evento onmessage é disparado com um payload JSON inválido
      Então um console.error deve ser registrado
      E o serviço não deve lançar exceção

    @swimlane("MetricsEngine")
    @id("FGH002_A063")
    Cenário: Erro SSE fecha EventSource e atualiza estado
      Quando o evento onerror do EventSource é disparado
      Então o EventSource deve ser fechado
      E o signal isConnected deve ser false

  # ══════════════════════════════════════════════════════════════════════
  # REGRA 11 — Construção de URL SSE
  # ══════════════════════════════════════════════════════════════════════
  Regra: ["FGH002_SP011"] Construção de URL SSE

    @swimlane("MetricsEngine")
    @id("FGH002_A064")
    @id("FGH002_A065")
    @id("FGH002_A066")
    Esquema do Cenário: URL SSE é construída com parâmetros condicionais
      Dado que o MetricsService está configurado
      E o token de autenticação é <token>
      E o parâmetro refresh na query string é <refresh>
      Quando a URL SSE é construída
      Então a URL deve <condicao_token> o parâmetro token
      E a URL deve <condicao_refresh> o parâmetro refresh

      Exemplos:
        | token         | refresh | condicao_token | condicao_refresh |
        | abc123        | null    | incluir        | não incluir      |
        | null          | 5       | não incluir    | incluir          |
        | null          | null    | não incluir    | não incluir      |

  # ══════════════════════════════════════════════════════════════════════
  # REGRA 12 — Roteamento de API
  # ══════════════════════════════════════════════════════════════════════
  Regra: ["FGH002_SP012"] Roteamento de API por Ambiente

    @swimlane("MetricsEngine")
    @id("FGH002_A067")
    Cenário: Ambiente de desenvolvimento utiliza porta dedicada do backend
      Dado que a aplicação está rodando na porta 4200
      Quando o baseUrl é resolvido
      Então o baseUrl deve ser "localhost:8000"
      E o apiPath deve ser "api"

    @swimlane("MetricsEngine")
    @id("FGH002_A068")
    Cenário: Ambiente de produção utiliza window.origin como base
      Dado que a aplicação está rodando em uma porta diferente de 4200
      Quando o baseUrl é resolvido
      Então o baseUrl deve ser igual a window.origin
      E o apiPath deve ser "api/4"

  # ══════════════════════════════════════════════════════════════════════
  # REGRA 13 — Cabeçalhos de Autenticação
  # ══════════════════════════════════════════════════════════════════════
  Regra: ["FGH002_SP013"] Cabeçalhos de Autenticação

    @swimlane("MetricsEngine")
    @id("FGH002_A069")
    Cenário: Retorna header Authorization Bearer quando token existe
      Dado que um token de autenticação "jwt-token-abc" está armazenado
      Quando os cabeçalhos de autenticação são gerados
      Então o header "Authorization" deve conter "Bearer jwt-token-abc"

    @swimlane("MetricsEngine")
    @id("FGH002_A070")
    Cenário: Retorna headers vazios quando não há token
      Dado que nenhum token de autenticação está armazenado
      Quando os cabeçalhos de autenticação são gerados
      Então o objeto de headers deve estar vazio

  # ══════════════════════════════════════════════════════════════════════
  # REGRA 14 — Pin/Unpin de Processos
  # ══════════════════════════════════════════════════════════════════════
  Regra: ["FGH002_SP014"] Pin e Unpin de Processos

    Contexto:
      Dado que o MetricsService está ativo e autenticado

    @swimlane("MetricsEngine")
    @id("FGH002_A071")
    Cenário: Pin de processo envia POST para endpoint correto
      Quando pinProcess é chamado com o PID 1234
      Então uma requisição POST deve ser enviada para "/processes/extended/1234"

    @swimlane("MetricsEngine")
    @id("FGH002_A072")
    Cenário: Pin de processo trata erro de rede graciosamente
      Dado que o endpoint de pin está indisponível
      Quando pinProcess é chamado com o PID 1234
      Então um console.error deve ser registrado
      E o serviço não deve lançar exceção

    @swimlane("MetricsEngine")
    @id("FGH002_A073")
    Cenário: Unpin de processo envia POST para endpoint de disable
      Quando unpinProcess é chamado
      Então uma requisição POST deve ser enviada para "/processes/extended/disable"

    @swimlane("MetricsEngine")
    @id("FGH002_A074")
    Cenário: Unpin de processo trata erro de rede graciosamente
      Dado que o endpoint de unpin está indisponível
      Quando unpinProcess é chamado
      Então um console.error deve ser registrado
      E o serviço não deve lançar exceção

  # ══════════════════════════════════════════════════════════════════════
  # REGRA 15 — Fluxo de Autenticação
  # ══════════════════════════════════════════════════════════════════════
  Regra: ["FGH002_SP015"] Fluxo de Autenticação e Resiliência

    Contexto:
      Dado que o MetricsService foi instanciado

    @swimlane("MetricsEngine")
    @id("FGH002_A075")
    Cenário: Resposta 401 marca usuário como não autenticado
      Quando o servidor responde com status 401
      Então o signal isAuthenticated deve ser false

    @swimlane("MetricsEngine")
    @id("FGH002_A076")
    Cenário: Resposta 500 ainda tenta conexão SSE
      Quando o servidor responde com status 500
      Então o serviço deve tentar estabelecer conexão SSE mesmo assim

    @swimlane("MetricsEngine")
    @id("FGH002_A077")
    Cenário: Erro de rede ECONNREFUSED ainda tenta fallback SSE
      Quando ocorre um erro de rede do tipo ECONNREFUSED
      Então o serviço deve tentar estabelecer conexão SSE como fallback

  # ══════════════════════════════════════════════════════════════════════
  # REGRA 16 — Login
  # ══════════════════════════════════════════════════════════════════════
  Regra: ["FGH002_SP016"] Fluxo de Login

    Contexto:
      Dado que o MetricsService está ativo
      E o usuário está na tela de login

    @swimlane("MetricsEngine")
    @id("FGH002_A078")
    Cenário: Login bem-sucedido armazena token e reconecta
      Quando o login é realizado com credenciais válidas
      Então o token deve ser armazenado
      E o signal isAuthenticated deve ser true
      E o signal loginError deve ser null
      E o serviço deve reconectar ao SSE

    @swimlane("MetricsEngine")
    @id("FGH002_A079")
    Cenário: Login falho com detail expõe mensagem do servidor
      Quando o login falha com resposta contendo campo "detail"
      Então o signal loginError deve conter a mensagem do servidor

    @swimlane("MetricsEngine")
    @id("FGH002_A080")
    Cenário: Login falho sem detail usa mensagem padrão
      Quando o login falha com resposta sem campo "detail" ou erro de parse JSON
      Então o signal loginError deve conter uma mensagem de erro padrão

    @swimlane("MetricsEngine")
    @id("FGH002_A081")
    Cenário: Falha de rede no login exibe mensagem de conexão
      Quando o login falha por erro de rede
      Então o signal loginError deve ser "Falha na conexão com o servidor"

  # ══════════════════════════════════════════════════════════════════════
  # REGRA 17 — Valores Padrão (Validação Cruzada)
  # ══════════════════════════════════════════════════════════════════════
  Regra: ["FGH002_SP017"] Valores Padrão e Validação Cruzada

    @swimlane("MetricsEngine")
    @id("FGH002_A082")
    Cenário: Todos os signals de controle possuem valores padrão corretos
      Dado que o MetricsService foi recém-instanciado
      Quando os signals de controle são consultados
      Então os valores devem corresponder à tabela de referência:
        | signal             | tipo     | valor_padrão  |
        | processSortKey     | string   | cpu_percent   |
        | containerSortKey   | string   | cpu_percent   |
        | showPerCpu         | boolean  | false         |
        | isAuthenticated    | boolean  | true          |
        | loginError         | null     | null          |
        | metrics            | null     | null          |

    @swimlane("MetricsEngine")
    @id("FGH002_A083")
    Cenário: Lista de 12 plugins inclui system e processes
      Dado que o MetricsService foi recém-instanciado
      Quando a lista de plugins é consultada
      Então a lista deve conter exatamente 12 plugins
      E os seguintes plugins devem estar presentes:
        | plugin     |
        | system     |
        | processes  |
