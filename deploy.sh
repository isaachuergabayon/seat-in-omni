#!/bin/bash
# deploy.sh — Actualiza el data.json y despliega a GitHub Pages
#
# Uso:
#   ./deploy.sh                        → usa ~/Downloads/data.json
#   ./deploy.sh /ruta/a/data.json      → usa el fichero que le pases

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
TARGET="$SCRIPT_DIR/public/data.json"
SOURCE="${1:-$HOME/Downloads/data.json}"

# Verificar que el fichero fuente existe
if [ ! -f "$SOURCE" ]; then
  echo "❌ No se encontró el fichero: $SOURCE"
  echo ""
  echo "  1. Ve al admin: http://localhost:5173/admin"
  echo "  2. Pulsa 'Exportar JSON'"
  echo "  3. Vuelve a ejecutar este script"
  exit 1
fi

echo "📂 Usando: $SOURCE"

# Copiar el data.json exportado
cp "$SOURCE" "$TARGET"
echo "✅ data.json actualizado"

# Commit y push
cd "$SCRIPT_DIR"
git add public/data.json
git commit -m "chore: update office data [$(date '+%Y-%m-%d %H:%M')]"
git push

echo ""
echo "🚀 Desplegando... (~2 minutos)"
echo "   Progreso: https://github.com/isaachuergabayon/seat-in-omni/actions"
echo "   App:      https://isaachuergabayon.github.io/seat-in-omni/"
