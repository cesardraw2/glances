/// <reference lib="webworker" />

let processSortKey = 'cpu_percent';
let containerSortKey = 'cpu_percent';

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
      const processes = parsedData.processes || parsedData.processlist;
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
        
        // Atribui de volta à chave apropriada (mock ou real)
        if (parsedData.processes) parsedData.processes = processes;
        if (parsedData.processlist) parsedData.processlist = processes;
      }

      // Send the cleanly parsed and sorted payload back to main thread
      postMessage({ type: 'METRICS_UPDATED', payload: parsedData });
    } catch (e) {
      console.error('Worker failed to parse or process SSE metrics:', e);
    }
  }
});
