import asyncio
import json
import random
import time
import socket
import platform
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse

app = FastAPI(title="Glances Mock API with SSE Support")

# Configuração de CORS para permitir acesso do Angular (porta 4200)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:4200", "http://127.0.0.1:4200"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Estado global simulado
START_TIME = time.time()
SYSTEM_INFO = {
    "hostname": socket.gethostname(),
    "system": platform.system(),
    "release": platform.release(),
    "version": "v4.0.0-mock",
}
EXTENDED_PROCESS_PID = None

# Configuração dos plugins ativos (simulando glances.conf)
ACTIVE_PLUGINS = ["system", "quicklook", "load", "cpu", "mem", "network", "diskio", "fs", "processes"]

# Mock de base para processos
PROCESS_NAMES = [
    {"name": "systemd", "username": "root"},
    {"name": "ksoftirqd/0", "username": "root"},
    {"name": "postgres", "username": "postgres"},
    {"name": "nginx", "username": "www-data"},
    {"name": "node", "username": "node"},
    {"name": "angular-dev", "username": "cesardraw"},
    {"name": "fastapi-app", "username": "cesardraw"},
    {"name": "chrome", "username": "cesardraw"},
    {"name": "vscode", "username": "cesardraw"},
    {"name": "docker-daemon", "username": "root"},
]

@app.get("/api/config")
def get_config():
    """
    Retorna a lista de plugins ativos simulando a leitura do glances.conf
    """
    return {"plugins": ACTIVE_PLUGINS}

@app.post("/api/processes/extended/{pid}")
def set_extended_process(pid: int):
    global EXTENDED_PROCESS_PID
    EXTENDED_PROCESS_PID = pid
    return True

@app.post("/api/processes/extended/disable")
def disable_extended_process():
    global EXTENDED_PROCESS_PID
    EXTENDED_PROCESS_PID = None
    return True

@app.get("/api/processes/extended")
def get_extended_process():
    global EXTENDED_PROCESS_PID
    if EXTENDED_PROCESS_PID is None:
        return {}
    return {
        "pid": EXTENDED_PROCESS_PID,
        "extended_stats": True,
        "cmdline": "/usr/bin/mock-process --pid=" + str(EXTENDED_PROCESS_PID),
        "cpu_min": 10.5,
        "cpu_max": 85.2,
        "cpu_mean": 35.6,
        "cpu_affinity": [0, 1, 2, 3],
        "memory_min": 1.2,
        "memory_max": 5.8,
        "memory_mean": 2.4,
        "memory_info": {"rss": 128471040, "vms": 3205791744, "shared": 24903680, "text": 40960, "lib": 0, "data": 1283724800, "dirty": 0}
    }

def generate_metrics():
    """
    Gera métricas simuladas com flutuações e alertas automáticos
    """
    # 1. Uptime
    uptime = int(time.time() - START_TIME)
    
    # 2. CPU
    # Gerar oscilações interessantes. De vez em quando um pico crítico (>90%)
    dice = random.random()
    if dice > 0.95:
        cpu_total = random.uniform(90.0, 99.0)  # CRITICAL
    elif dice > 0.80:
        cpu_total = random.uniform(70.0, 89.9)  # WARNING
    else:
        cpu_total = random.uniform(15.0, 50.0)  # OK
        
    cpu_user = cpu_total * 0.7
    cpu_system = cpu_total * 0.2
    cpu_idle = 100.0 - cpu_total
    
    # Simular 4 núcleos
    cores_count = 4
    cores = []
    for i in range(cores_count):
        # Cada core flutua um pouco ao redor do total
        core_val = max(0.0, min(100.0, cpu_total + random.uniform(-15.0, 15.0)))
        cores.append({"id": i, "percent": round(core_val, 1)})
        
    cpu_decoration = "OK"
    if cpu_total >= 90.0:
        cpu_decoration = "CRITICAL"
    elif cpu_total >= 70.0:
        cpu_decoration = "WARNING"
        
    cpu_data = {
        "total": round(cpu_total, 1),
        "user": round(cpu_user, 1),
        "system": round(cpu_system, 1),
        "idle": round(cpu_idle, 1),
        "ctx_switches": random.randint(1200, 3500),
        "interrupts": random.randint(800, 2000),
        "cores": cores,
        "decoration": cpu_decoration
    }

    # 3. Load average (relacionado ao uso de CPU com lag)
    load_1 = cpu_total / 20.0
    load_5 = (cpu_total + 10.0) / 25.0
    load_15 = (cpu_total + 20.0) / 30.0
    load_data = {
        "min1": round(load_1, 2),
        "min5": round(load_5, 2),
        "min15": round(load_15, 2),
        "cpucore": cores_count
    }

    # 4. Memória (16GB total)
    mem_total = 16 * 1024 * 1024 * 1024  # 16 GB
    # Memória usada flutua lentamente ao redor de 65-75%, às vezes picos
    if dice > 0.92:
        mem_percent = random.uniform(91.0, 96.0)  # CRITICAL
    elif dice > 0.85:
        mem_percent = random.uniform(75.0, 89.9)  # WARNING
    else:
        mem_percent = random.uniform(55.0, 74.9)  # OK
        
    mem_used = int(mem_total * (mem_percent / 100.0))
    mem_free = mem_total - mem_used
    mem_cached = int(mem_total * 0.15)
    mem_buffers = int(mem_total * 0.05)
    
    mem_decoration = "OK"
    if mem_percent >= 90.0:
        mem_decoration = "CRITICAL"
    elif mem_percent >= 75.0:
        mem_decoration = "WARNING"
        
    # Swap
    swap_total = 4 * 1024 * 1024 * 1024  # 4 GB
    swap_percent = random.uniform(10.0, 15.0)
    swap_used = int(swap_total * (swap_percent / 100.0))
    swap_free = swap_total - swap_used

    mem_data = {
        "total": mem_total,
        "used": mem_used,
        "free": mem_free,
        "cached": mem_cached,
        "buffers": mem_buffers,
        "percent": round(mem_percent, 1),
        "decoration": mem_decoration,
        "swap_total": swap_total,
        "swap_used": swap_used,
        "swap_free": swap_free,
        "swap_percent": round(swap_percent, 1)
    }

    # 5. Rede (Rx/Tx)
    # Flutuações de tráfego de rede em Bytes
    rx_speed = random.randint(1024, 1024 * 1024 * 5)  # de 1KB/s a 5MB/s
    tx_speed = random.randint(512, 1024 * 1024 * 2)   # de 512B/s a 2MB/s
    
    # Formatação de velocidade
    def format_speed(bps):
        if bps > 1024 * 1024:
            return f"{bps / (1024 * 1024):.1f} Mb/s"
        elif bps > 1024:
            return f"{bps / 1024:.1f} Kb/s"
        return f"{bps} b/s"

    network_data = [
        {
            "interface": "eth0",
            "rx": rx_speed,
            "tx": tx_speed,
            "rx_rate": format_speed(rx_speed),
            "tx_rate": format_speed(tx_speed)
        },
        {
            "interface": "lo",
            "rx": random.randint(100, 2000),
            "tx": random.randint(100, 2000),
            "rx_rate": "1.2 Kb/s",
            "tx_rate": "1.2 Kb/s"
        }
    ]

    # 6. Disk IO
    read_speed = random.randint(0, 1024 * 1024 * 20)  # até 20MB/s
    write_speed = random.randint(0, 1024 * 1024 * 15) # até 15MB/s
    diskio_data = [
        {
            "device": "sda",
            "read": read_speed,
            "write": write_speed,
            "read_rate": format_speed(read_speed),
            "write_rate": format_speed(write_speed)
        }
    ]

    # 7. File System
    fs_data = [
        {
            "device": "/dev/sda1",
            "mount": "/",
            "size": 120 * 1024 * 1024 * 1024, # 120GB
            "used": 45 * 1024 * 1024 * 1024,  # 45GB
            "free": 75 * 1024 * 1024 * 1024,
            "percent": 37.5,
            "decoration": "OK"
        },
        {
            "device": "/dev/sda2",
            "mount": "/home",
            "size": 400 * 1024 * 1024 * 1024, # 400GB
            "used": 350 * 1024 * 1024 * 1024, # 350GB (87.5% - WARNING)
            "free": 50 * 1024 * 1024 * 1024,
            "percent": 87.5,
            "decoration": "WARNING"
        }
    ]

    # 8. Processos
    # Vamos gerar uma lista de processos dinamicamente baseada nos modelos
    processes = []
    pids = list(range(1000, 1010))
    
    # Processo do topo flutua bastante
    total_cpu_left = cpu_total
    total_mem_left = mem_percent
    
    for i, proc in enumerate(PROCESS_NAMES):
        pid = pids[i]
        # Distribuir CPU e Memória
        if i == len(PROCESS_NAMES) - 1:
            p_cpu = total_cpu_left
            p_mem = total_mem_left / len(PROCESS_NAMES) * 1.5
        else:
            p_cpu = random.uniform(0.0, total_cpu_left * 0.4)
            p_mem = random.uniform(0.1, total_mem_left / len(PROCESS_NAMES) * 1.2)
            total_cpu_left -= p_cpu
            
        p_cpu = round(max(0.0, p_cpu), 1)
        p_mem = round(max(0.1, p_mem), 1)
        
        # Alertas de processo
        p_decoration = "OK"
        if p_cpu >= 80.0:
            p_decoration = "CRITICAL"
        elif p_cpu >= 50.0:
            p_decoration = "WARNING"
            
        status = "sleeping" if p_cpu < 1.0 else "running"
        if proc["name"] == "systemd":
            status = "sleeping"
            
        processes.append({
            "pid": pid,
            "name": proc["name"],
            "username": proc["username"],
            "cpu_percent": p_cpu,
            "mem_percent": p_mem,
            "status": status,
            "decoration": p_decoration
        })
        
    # Ordenar por CPU decrescente
    processes.sort(key=lambda x: x["cpu_percent"], reverse=True)

    global EXTENDED_PROCESS_PID
    for p in processes:
        if EXTENDED_PROCESS_PID is not None and p["pid"] == EXTENDED_PROCESS_PID:
            p["extended_stats"] = True
            p["cmdline"] = "/usr/bin/" + p["name"]
            p["cpu_min"] = 12.4
            p["cpu_max"] = 72.8
            p["cpu_mean"] = round(p["cpu_percent"] * 0.9 + 5.0, 1)
            p["cpu_affinity"] = [0, 1]
            p["memory_min"] = round(p["mem_percent"] * 0.8, 1)
            p["memory_max"] = round(p["mem_percent"] * 1.2, 1)
            p["memory_mean"] = p["mem_percent"]
            p["memory_info"] = {
                "rss": int(p["mem_percent"] * 1024 * 1024 * 10),
                "vms": int(p["mem_percent"] * 1024 * 1024 * 50),
                "shared": 4096 * 1024,
                "text": 64 * 1024,
                "lib": 0,
                "data": int(p["mem_percent"] * 1024 * 1024 * 8),
                "dirty": 0
            }

    # Consolidar
    metrics = {
        "system": {
            **SYSTEM_INFO,
            "uptime": uptime
        },
        "load": load_data,
        "cpu": cpu_data,
        "mem": mem_data,
        "network": network_data,
        "diskio": diskio_data,
        "fs": fs_data,
        "processes": processes
    }
    return metrics

async def sse_generator(delay: float):
    """
    Função geradora assíncrona para streaming SSE
    """
    try:
        while True:
            # Gerar novas métricas
            data = generate_metrics()
            # Formatar no padrão SSE
            yield f"data: {json.dumps(data)}\n\n"
            # Aguardar o delay antes do próximo tick
            await asyncio.sleep(delay)
    except asyncio.CancelledError:
        # Lidar com desconexão do cliente de forma graciosa
        pass

@app.get("/api/metrics/sse")
async def get_metrics_sse(refresh: float = 1.0):
    """
    Endpoint SSE de streaming em tempo real das métricas do Glances
    """
    return StreamingResponse(sse_generator(refresh), media_type="text/event-stream")

if __name__ == "__main__":
    import uvicorn
    # Rodando na porta 8000
    uvicorn.run("app:app", host="0.0.0.0", port=8000, reload=True)
