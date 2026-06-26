/// <reference lib="webworker" />

let processSortKey = 'cpu_percent';
let containerSortKey = 'cpu_percent';

// Helper functions copied for worker-side formatting
function formatBytes(bytes: number): string {
  if (bytes === undefined || bytes === null || isNaN(bytes) || bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  const val = parseFloat((bytes / Math.pow(k, i)).toFixed(1));
  return `${val} ${sizes[i]}`;
}

function cpuClass(cpu: number): string {
  if (cpu >= 80) return 'critical';
  if (cpu >= 50) return 'warning';
  return 'ok';
}

function getMockVirt(name: string): string {
  if (name.includes('chrome') || name.includes('node') || name.includes('firefox')) return '3.02G';
  if (name.includes('vscode')) return '2.35G';
  if (name.includes('angular')) return '1.85G';
  return '0';
}

function getMockRes(name: string): string {
  if (name.includes('chrome') || name.includes('firefox')) return '300M';
  if (name.includes('node') || name.includes('angular')) return '150M';
  return '0';
}

function getVirt(proc: any): string {
  if (proc.memory_info?.vms !== undefined) {
    return formatBytes(proc.memory_info.vms);
  }
  return getMockVirt(proc.name || '');
}

function getRes(proc: any): string {
  if (proc.memory_info?.rss !== undefined) {
    return formatBytes(proc.memory_info.rss);
  }
  return getMockRes(proc.name || '');
}

function formatProcessTime(cpuTimes: any): string {
  if (!cpuTimes) return '00:00.00';
  const totalSecs = (cpuTimes.user ?? 0) + (cpuTimes.system ?? 0);
  const mins = Math.floor(totalSecs / 60);
  const secs = Math.floor(totalSecs % 60);
  const hundredths = Math.floor((totalSecs % 1) * 100);
  
  if (mins >= 60) {
    const hrs = Math.floor(mins / 60);
    const remainingMins = mins % 60;
    return `${hrs}h${remainingMins.toString().padStart(2, '0')}`;
  }
  return `${mins}:${secs.toString().padStart(2, '0')}.${hundredths.toString().padStart(2, '0')}`;
}

function getProcessStatus(proc: any): string {
  const s = proc.status || '';
  if (s === 'running' || s === 'R') return 'R';
  if (s === 'sleeping' || s === 'S') return 'S';
  return s.substring(0, 1).toUpperCase();
}

function isProcessRunning(proc: any): boolean {
  const s = proc.status || '';
  return s === 'running' || s === 'R';
}

addEventListener('message', ({ data }) => {
  if (data.type === 'SET_KEYS') {
    if (data.processSortKey) processSortKey = data.processSortKey;
    if (data.containerSortKey) containerSortKey = data.containerSortKey;
    return;
  }

  if (data.type === 'PARSE_SSE') {
    try {
      const parsedData = JSON.parse(data.payload);

      // Pre-sort containers
      const containers = parsedData.containers;
      if (containers && Array.isArray(containers)) {
        if (containerSortKey === 'cpu_percent') {
          containers.sort((a, b) => (b.cpu_percent || 0) - (a.cpu_percent || 0));
        } else if (containerSortKey === 'memory_usage') {
          const getMem = (item: any) => item.memory_usage || (item.memory && item.memory.usage) || 0;
          containers.sort((a, b) => getMem(b) - getMem(a));
        } else if (containerSortKey === 'name') {
          containers.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
        }
      }

      // Pre-sort processes
      let processes = parsedData.processes || parsedData.processlist;
      if (processes && Array.isArray(processes)) {
        const key = processSortKey;
        if (key === 'cpu_percent' || key === 'mem_percent') {
          const getVal = (item: any, k: string) => {
            if (k === 'mem_percent') {
              return item.mem_percent !== undefined ? item.mem_percent : (item.memory_percent !== undefined ? item.memory_percent : 0);
            }
            return item[k] !== undefined ? item[k] : 0;
          };
          processes.sort((a, b) => getVal(b, key) - getVal(a, key));
        } else if (key === 'time') {
          const getVal = (item: any) => {
            if (item.cpu_times) {
              return (item.cpu_times.user ?? 0) + (item.cpu_times.system ?? 0);
            }
            return 0;
          };
          processes.sort((a, b) => getVal(b) - getVal(a));
        } else if (key === 'io') {
          const getVal = (item: any) => {
            if (item.io_counters && item.io_counters.length >= 4) {
              return (item.io_counters[2] ?? 0) + (item.io_counters[3] ?? 0);
            }
            return 0;
          };
          processes.sort((a, b) => getVal(b) - getVal(a));
        } else if (key === 'name' || key === 'username') {
          processes.sort((a, b) => {
            const valA = (a[key] || '').toLowerCase();
            const valB = (b[key] || '').toLowerCase();
            return valA.localeCompare(valB);
          });
        }
        
        // FORMAT PROCESSES HERE IN BACKGROUND
        processes = processes.map((proc: any) => ({
          ...proc,
          _cpuClass: cpuClass(proc.cpu_percent || 0),
          _cpuStr: (proc.cpu_percent || 0).toFixed(1),
          _memStr: (proc.mem_percent !== undefined ? proc.mem_percent : (proc.memory_percent !== undefined ? proc.memory_percent : 0)).toFixed(1),
          _virtStr: getVirt(proc),
          _resStr: getRes(proc),
          _timeStr: formatProcessTime(proc.cpu_times),
          _statusStr: getProcessStatus(proc),
          _isRunning: isProcessRunning(proc)
        }));
        
        // Atribui de volta à chave apropriada (mock ou real)
        if (parsedData.processes) parsedData.processes = processes;
        if (parsedData.processlist) parsedData.processlist = processes;
      }

      postMessage({ type: 'METRICS_UPDATED', payload: parsedData });
    } catch (e) {
      console.error('Worker failed to parse or process SSE metrics:', e);
    }
  }
});
