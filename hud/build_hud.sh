#!/bin/bash
set -e

# Caminhos
FRONTEND_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/frontend" && pwd)"
GLANCES_STATIC_HUD_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../glances/outputs/static" && pwd)/hud"

echo "=== Iniciando Compilação do Glances HUD Angular ==="
echo "Pasta do Frontend: $FRONTEND_DIR"
echo "Pasta de Destino no Glances: $GLANCES_STATIC_HUD_DIR"

# Entrar na pasta do frontend
cd "$FRONTEND_DIR"

# Usar o path do Node.js correto com pnpm
export PATH="/home/cesardraw/.nvm/versions/node/v22.22.3/bin:$PATH"

echo "1. Instalando dependências..."
pnpm install

echo "2. Compilando SPA Angular com base-href=/hud/ ..."
pnpm exec ng build --configuration production --base-href /hud/

echo "3. Criando pasta de destino no Glances..."
rm -rf "$GLANCES_STATIC_HUD_DIR"
mkdir -p "$GLANCES_STATIC_HUD_DIR"

echo "4. Copiando arquivos compilados..."
cp -R dist/frontend/browser/* "$GLANCES_STATIC_HUD_DIR/"

echo "=== HUD Compilado e Integrado com Sucesso! ==="
