import { Injectable, signal, computed, inject, DestroyRef } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class MetricsService {
  private destroyRef = inject(DestroyRef);

  // Expõe a lista de plugins fixa suportada pelo HUD
  readonly plugins = signal<string[]>(['system', 'quicklook', 'load', 'cpu', 'mem', 'network', 'diskio', 'fs', 'docker', 'gpu', 'sensors', 'ollama', 'processes']);

  // Signal para gerenciar estado das métricas do stream SSE
  readonly metrics = signal<any>(null);
  readonly isConnected = signal<boolean>(false);

  // Signals de controle de autenticação
  readonly isAuthenticated = signal<boolean>(true);
  readonly loginError = signal<string | null>(null);

  // Signals de controle reativo via atalhos
  readonly processSortKey = signal<string>('cpu_percent');
  readonly containerSortKey = signal<string>('cpu_percent');
  readonly showPerCpu = signal<boolean>(false);

  // Helper para formatar Bytes em strings amigáveis
  public formatBytes(bytes: number): string {
    if (bytes === undefined || bytes === null || isNaN(bytes) || bytes === 0) {
      return '0 B';
    }
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    const val = parseFloat((bytes / Math.pow(k, i)).toFixed(1));
    return `${val} ${sizes[i]}`;
  }

  // Helper para formatar taxas numéricas de bytes/s do Glances em strings amigáveis
  private formatBytesRate(bytesPerSec: number): string {
    if (bytesPerSec === undefined || bytesPerSec === null || isNaN(bytesPerSec) || bytesPerSec === 0) {
      return '0 B/s';
    }
    const k = 1000;
    const sizes = ['B/s', 'Kb/s', 'Mb/s', 'Gb/s', 'Tb/s'];
    const i = Math.floor(Math.log(bytesPerSec) / Math.log(k));
    const val = parseFloat((bytesPerSec / Math.pow(k, i)).toFixed(1));
    return `${val} ${sizes[i]}`;
  }

  // Signals computados para expor fatias de dados cirurgicamente com normalização
  readonly system = computed(() => {
    const sys = this.metrics()?.system;
    if (!sys) return null;
    return {
      ...sys,
      uptime: this.metrics()?.uptime !== undefined ? this.metrics()?.uptime : sys.uptime
    };
  });

  readonly ipAddress = computed(() => {
    const rawIp = this.metrics()?.ip;
    if (!rawIp) return '';
    const address = rawIp.address || '';
    const mask = rawIp.mask_cidr !== undefined ? `/${rawIp.mask_cidr}` : '';
    return address + mask;
  });

  readonly publicIp = computed(() => {
    const pubIp = this.metrics()?.publicip || this.metrics()?.public_ip;
    return (pubIp && pubIp !== 'None') ? pubIp : '';
  });

  readonly load = computed(() => this.metrics()?.load);
  
  readonly cpu = computed(() => {
    const rawCpu = this.metrics()?.cpu;
    if (!rawCpu) return null;
    const rawPerCpu = this.metrics()?.percpu;
    const cores = rawPerCpu ? rawPerCpu.map((item: any) => ({
      id: item.cpu_number,
      percent: item.total
    })) : undefined;
    return {
      ...rawCpu,
      cores
    };
  });

  readonly mem = computed(() => {
    const rawMem = this.metrics()?.mem;
    const rawSwap = this.metrics()?.memswap;
    if (!rawMem) return null;
    
    return {
      ...rawMem,
      swap_total: rawSwap?.total ?? 0,
      swap_used: rawSwap?.used ?? 0,
      swap_free: rawSwap?.free ?? 0,
      swap_percent: rawSwap?.percent ?? 0
    };
  });

  readonly network = computed(() => {
    const rawNet = this.metrics()?.network;
    if (!rawNet) return null;
    
    return rawNet
      .filter((net: any) => {
        const name = net.interface_name || net.interface || '';
        const isVirtual = name.startsWith('veth') || name.startsWith('br-') || name.startsWith('docker') || name.startsWith('virbr');
        if (isVirtual) {
          const rxRate = net.bytes_recv_rate_per_sec || 0;
          const txRate = net.bytes_sent_rate_per_sec || 0;
          return rxRate > 10000 || txRate > 10000;
        }
        return true;
      })
      .map((net: any) => {
        if (net.interface !== undefined) return net;
        
        const rx = net.bytes_recv_rate_per_sec !== undefined ? this.formatBytesRate(net.bytes_recv_rate_per_sec) : '0 B/s';
        const tx = net.bytes_sent_rate_per_sec !== undefined ? this.formatBytesRate(net.bytes_sent_rate_per_sec) : '0 B/s';
        
        return {
          interface: net.interface_name || '',
          rx_rate: rx,
          tx_rate: tx,
          speed: net.speed
        };
      });
  });

  readonly diskio = computed(() => {
    const rawDisk = this.metrics()?.diskio;
    if (!rawDisk) return null;
    
    return rawDisk
      .filter((disk: any) => {
        const name = disk.disk_name || disk.device || '';
        return !name.startsWith('loop') && !name.startsWith('ram');
      })
      .map((disk: any) => {
        if (disk.device !== undefined) return disk;
        
        const read = disk.read_bytes_rate_per_sec !== undefined ? this.formatBytesRate(disk.read_bytes_rate_per_sec) : '0 B/s';
        const write = disk.write_bytes_rate_per_sec !== undefined ? this.formatBytesRate(disk.write_bytes_rate_per_sec) : '0 B/s';
        
        return {
          device: disk.disk_name || '',
          read_rate: read,
          write_rate: write
        };
      });
  });

  readonly fs = computed(() => {
    const rawFs = this.metrics()?.fs;
    if (!rawFs) return null;
    
    return rawFs.map((item: any) => {
      if (item.mount !== undefined) return item;
      
      return {
        device: item.device_name || '',
        mount: item.mnt_point || '',
        size: item.size || 0,
        used: item.used || 0,
        free: item.free || 0,
        percent: item.percent || 0
      };
    });
  });

  readonly processcount = computed(() => this.metrics()?.processcount);
  readonly containers = computed(() => {
    const list = this.metrics()?.containers;
    if (!list || !Array.isArray(list)) return [];
    
    const key = this.containerSortKey();
    const sorted = [...list];
    
    if (key === 'cpu_percent') {
      sorted.sort((a, b) => (b.cpu_percent || 0) - (a.cpu_percent || 0));
    } else if (key === 'memory_usage') {
      const getMem = (item: any) => item.memory_usage || (item.memory && item.memory.usage) || 0;
      sorted.sort((a, b) => getMem(b) - getMem(a));
    } else if (key === 'name') {
      sorted.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
    }
    return sorted;
  });
  readonly gpu = computed(() => this.metrics()?.gpu);
  readonly sensors = computed(() => this.metrics()?.sensors);
  readonly alerts = computed(() => this.metrics()?.alert || []);
  readonly version = computed(() => this.metrics()?.version);
  readonly ollama = computed(() => this.metrics()?.ollama);
  
  // Compatibilidade com 'processes' (Mock) ou 'processlist' (Glances Real)
  readonly rawProcesses = computed(() => {
    const data = this.metrics();
    return data ? (data.processes || data.processlist) : null;
  });

  readonly processes = computed(() => {
    const list = this.rawProcesses();
    if (!list) return null;

    const key = this.processSortKey();
    const sorted = [...list];

    if (key === 'cpu_percent' || key === 'mem_percent') {
      const getVal = (item: any, k: string) => {
        if (k === 'mem_percent') {
          return item.mem_percent !== undefined ? item.mem_percent : (item.memory_percent !== undefined ? item.memory_percent : 0);
        }
        return item[k] !== undefined ? item[k] : 0;
      };
      sorted.sort((a, b) => getVal(b, key) - getVal(a, key));
    } else if (key === 'time') {
      const getVal = (item: any) => {
        if (item.cpu_times) {
          return (item.cpu_times.user ?? 0) + (item.cpu_times.system ?? 0);
        }
        return 0;
      };
      sorted.sort((a, b) => getVal(b) - getVal(a));
    } else if (key === 'io') {
      const getVal = (item: any) => {
        if (item.io_counters && item.io_counters.length >= 4) {
          return (item.io_counters[2] ?? 0) + (item.io_counters[3] ?? 0);
        }
        return 0;
      };
      sorted.sort((a, b) => getVal(b) - getVal(a));
    } else if (key === 'name' || key === 'username') {
      sorted.sort((a, b) => {
        const valA = (a[key] || '').toLowerCase();
        const valB = (b[key] || '').toLowerCase();
        return valA.localeCompare(valB);
      });
    }
    return sorted;
  });

  readonly extendedProcess = computed(() => {
    const list = this.processes();
    if (!list) return null;
    return list.find((p: any) => p.extended_stats === true) || null;
  });

  private getHeaders(): Record<string, string> {
    const headers: Record<string, string> = {};
    const token = localStorage.getItem('glances_jwt_token');
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    return headers;
  }

  async pinProcess(pid: number) {
    const url = `${this.getBaseUrl()}/${this.getApiVersionPath()}/processes/extended/${pid}`;
    try {
      await fetch(url, {
        method: 'POST',
        headers: this.getHeaders()
      });
    } catch (err) {
      console.error('Erro ao pinar processo:', err);
    }
  }

  async unpinProcess() {
    const url = `${this.getBaseUrl()}/${this.getApiVersionPath()}/processes/extended/disable`;
    try {
      await fetch(url, {
        method: 'POST',
        headers: this.getHeaders()
      });
    } catch (err) {
      console.error('Erro ao despinhar processo:', err);
    }
  }

  constructor() {
    this.checkAuthenticationAndConnect();
  }

  private getBaseUrl(): string {
    if (window.location.port === '4200') {
      return 'http://localhost:8000';
    }
    return window.location.origin;
  }

  // Determina a versão da API dinâmica (se for Mock ou Real)
  private getApiVersionPath(): string {
    if (window.location.port === '4200') {
      return 'api'; // Mock usa /api/config e /api/metrics/sse
    }
    return 'api/4'; // Glances real usa /api/4/...
  }

  async checkAuthenticationAndConnect() {
    const token = localStorage.getItem('glances_jwt_token');
    const headers: Record<string, string> = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    try {
      // Faz um fetch rápido na API de config do Glances para validar autenticação e token
      const configPath = `${this.getApiVersionPath()}/config`;
      const response = await fetch(`${this.getBaseUrl()}/${configPath}`, { headers });
      
      if (response.status === 401) {
        // Exige autenticação e não temos token válido
        this.isAuthenticated.set(false);
      } else if (response.ok) {
        // Autenticado ou público!
        this.isAuthenticated.set(true);
        this.connectSSE(token);
      } else {
        console.error('Erro na validação de autenticação:', response.statusText);
        // Tenta conectar de qualquer forma
        this.connectSSE(token);
      }
    } catch (err) {
      console.error('Erro de conexão ao verificar autenticação:', err);
      // Backend off ou sem rede, conecta o SSE para disparar fallbacks
      this.connectSSE(token);
    }
  }

  async login(password: string, username: string = 'admin') {
    this.loginError.set(null);
    try {
      const loginPath = `${this.getApiVersionPath()}/token`;
      const response = await fetch(`${this.getBaseUrl()}/${loginPath}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });

      if (response.ok) {
        const data = await response.json();
        localStorage.setItem('glances_jwt_token', data.access_token);
        this.isAuthenticated.set(true);
        this.checkAuthenticationAndConnect(); // Revalida e conecta
      } else {
        const errData = await response.json().catch(() => ({}));
        this.loginError.set(errData.detail || 'Senha incorreta ou erro de autenticação');
      }
    } catch (err) {
      this.loginError.set('Falha na conexão com o servidor');
    }
  }

  private connectSSE(token: string | null) {
    const ssePath = `${this.getApiVersionPath()}/metrics/sse`;
    
    // Lê o parâmetro 'refresh' da URL atual do navegador se existir
    const params = new URLSearchParams(window.location.search);
    const refreshVal = params.get('refresh');
    
    const queryParts: string[] = [];
    if (token) {
      queryParts.push(`token=${token}`);
    }
    if (refreshVal) {
      queryParts.push(`refresh=${refreshVal}`);
    }
    
    const sseQuery = queryParts.length > 0 ? `?${queryParts.join('&')}` : '';
    const eventSource = new EventSource(`${this.getBaseUrl()}/${ssePath}${sseQuery}`);

    eventSource.onopen = () => {
      this.isConnected.set(true);
    };

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        this.metrics.set(data);
      } catch (e) {
        console.error('Erro ao ler mensagens SSE:', e);
      }
    };

    eventSource.onerror = (err) => {
      console.error('Desconexão ou erro SSE. Tentando reconectar...', err);
      this.isConnected.set(false);
      eventSource.close();
      
      // Reconectar após 3 segundos
      const timeoutId = setTimeout(() => {
        this.connectSSE(token);
      }, 3000);

      this.destroyRef.onDestroy(() => clearTimeout(timeoutId));
    };

    // Garantir fechamento da conexão ao destruir o service
    this.destroyRef.onDestroy(() => {
      eventSource.close();
    });
  }
}
