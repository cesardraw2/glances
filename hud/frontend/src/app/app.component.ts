import { Component, computed, inject, ChangeDetectionStrategy, signal, HostListener } from '@angular/core';
import { CommonModule, NgComponentOutlet } from '@angular/common';
import { MetricsService } from './services/metrics.service';
import { SystemInfoComponent } from './plugins/system-info.component';
import { QuickLookComponent } from './plugins/quicklook-plugin.component';
import { LoadPluginComponent } from './plugins/load-plugin.component';
import { CpuPluginComponent } from './plugins/cpu-plugin.component';
import { MemPluginComponent } from './plugins/mem-plugin.component';
import { NetworkPluginComponent } from './plugins/network-plugin.component';
import { DiskIoPluginComponent } from './plugins/diskio-plugin.component';
import { FsPluginComponent } from './plugins/fs-plugin.component';
import { ProcessesPluginComponent } from './plugins/processes-plugin.component';
import { DockerPluginComponent } from './plugins/docker-plugin.component';
import { GpuPluginComponent } from './plugins/gpu-plugin.component';
import { SensorsPluginComponent } from './plugins/sensors-plugin.component';
import { OllamaPluginComponent } from './plugins/ollama-plugin.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, NgComponentOutlet],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './app.component.html'
})
export class AppComponent {
  private metricsService = inject(MetricsService);
  readonly isConnected = this.metricsService.isConnected;
  readonly activePlugins = this.metricsService.plugins;
  readonly isAuthenticated = this.metricsService.isAuthenticated;
  readonly loginError = this.metricsService.loginError;

  onLogin(username: string, password: string) {
    this.metricsService.login(password, username);
  }

  // Signals para controle de visibilidade das seções (Atalhos do Glances)
  readonly showSidebar = signal<boolean>(true);
  readonly showNetwork = signal<boolean>(true);
  readonly showDiskIo = signal<boolean>(true);
  readonly showFileSystem = signal<boolean>(true);
  readonly showDocker = signal<boolean>(true);
  readonly showGpu = signal<boolean>(true);
  readonly showQuickLook = signal<boolean>(true);
  readonly showTopMenu = signal<boolean>(true);
  readonly showSensors = signal<boolean>(true);
  readonly showOllama = signal<boolean>(true);

  readonly hasGpu = computed(() => {
    const list = this.metricsService.gpu();
    return list && list.length > 0;
  });

  readonly cpuColClass = computed(() => {
    return (this.showGpu() && this.hasGpu()) ? 'col-span-12 md:col-span-3' : 'col-span-12 md:col-span-4';
  });

  readonly memColClass = computed(() => {
    return (this.showGpu() && this.hasGpu()) ? 'col-span-12 md:col-span-3' : 'col-span-12 md:col-span-4';
  });

  // Alerta dinâmico ativo na barra de status
  readonly version = this.metricsService.version;
  readonly activeAlert = computed(() => {
    const list = this.metricsService.alerts();
    if (!list || list.length === 0) return null;
    return list[list.length - 1]; // Pega o alerta mais recente
  });

  // Escuta de teclado para emular os atalhos de HUD do Glances
  @HostListener('window:keydown', ['$event'])
  handleKeyDown(event: KeyboardEvent) {
    const target = event.target as HTMLElement;
    if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') return;

    const rawKey = event.key;
    const key = rawKey.toLowerCase();
    
    // Toggles de visibilidade
    if (rawKey === 'D') {
      // 'D' maiúsculo para Docker (containers)
      this.showDocker.update(v => !v);
    } else if (rawKey === 'O') {
      // 'O' maiúsculo para Ollama
      this.showOllama.update(v => !v);
    } else if (key === 'g') {
      // 'g' para GPU
      this.showGpu.update(v => !v);
    } else if (key === '2') {
      this.showSidebar.update(v => !v);
    } else if (key === 'n') {
      this.showNetwork.update(v => !v);
    } else if (key === 'd') {
      // 'd' minúsculo para Disk I/O
      this.showDiskIo.update(v => !v);
    } else if (key === 'f') {
      // 'f' para filesystem no glances original
      this.showFileSystem.update(v => !v);
    } else if (key === 's') {
      // 's' para sensors no glances original
      this.showSensors.update(v => !v);
    } else if (key === '3') {
      // '3' para quicklook
      this.showQuickLook.update(v => !v);
    } else if (key === '5') {
      // '5' para top menu
      this.showTopMenu.update(v => !v);
    } else if (key === '1') {
      // '1' para percpu (cores individuais)
      this.metricsService.showPerCpu.update(v => !v);
    }
    
    // Atalhos de ordenação da tabela de processos
    else if (key === 'a' || key === 'c') {
      this.metricsService.processSortKey.set('cpu_percent');
    } else if (key === 'm') {
      this.metricsService.processSortKey.set('mem_percent');
    } else if (key === 'p') {
      this.metricsService.processSortKey.set('name');
    } else if (key === 'u') {
      this.metricsService.processSortKey.set('username');
    } else if (key === 't') {
      this.metricsService.processSortKey.set('time');
    } else if (key === 'i') {
      this.metricsService.processSortKey.set('io');
    }
  }

  // Registro central dos componentes de plugin do Glances
  readonly componentRegistry: Record<string, any> = {
    system: SystemInfoComponent,
    quicklook: QuickLookComponent,
    load: LoadPluginComponent,
    cpu: CpuPluginComponent,
    mem: MemPluginComponent,
    network: NetworkPluginComponent,
    diskio: DiskIoPluginComponent,
    fs: FsPluginComponent,
    docker: DockerPluginComponent,
    gpu: GpuPluginComponent,
    sensors: SensorsPluginComponent,
    processes: ProcessesPluginComponent,
    ollama: OllamaPluginComponent,
  };

  // Cabeçalho de Uptime e SO
  readonly topPlugins = computed(() => 
    this.activePlugins()
      .filter(p => p === 'system')
      .map(p => ({ name: p, component: this.componentRegistry[p] }))
      .filter(item => item.component !== undefined)
  );

  // Painel Horizontal Superior de Recursos (Quicklook, CPU, Mem, Load)
  readonly subTopPlugins = computed(() => 
    this.activePlugins()
      .filter(p => p === 'quicklook' || p === 'cpu' || p === 'mem' || p === 'load')
      .map(p => ({ name: p, component: this.componentRegistry[p] }))
      .filter(item => item.component !== undefined)
  );

  // Barra lateral esquerda (Network, Disk I/O, FS, Sensors)
  readonly sidebarPlugins = computed(() => 
    this.activePlugins()
      .filter(p => {
        if (p === 'network') return this.showNetwork();
        if (p === 'diskio') return this.showDiskIo();
        if (p === 'fs') return this.showFileSystem();
        if (p === 'sensors') return this.showSensors();
        return p === 'network' || p === 'diskio' || p === 'fs' || p === 'sensors';
      })
      .map(p => ({ name: p, component: this.componentRegistry[p] }))
      .filter(item => item.component !== undefined)
  );

  // Painel de Trabalho Principal (Docker/Containers, Processos)
  readonly mainPlugins = computed(() => 
    this.activePlugins()
      .filter(p => {
        if (p === 'docker') return this.showDocker();
        if (p === 'ollama') return this.showOllama();
        if (p === 'processes') return true;
        return false;
      })
      .map(p => ({ name: p, component: this.componentRegistry[p] }))
      .filter(item => item.component !== undefined)
  );
}
