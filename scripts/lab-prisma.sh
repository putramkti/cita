#!/usr/bin/env bash
# Run prisma against cita-lab DB only — never touches prod .env
# Usage: ./scripts/lab-prisma.sh push
#        ./scripts/lab-prisma.sh studio
#        ./scripts/lab-prisma.sh "db execute --file=/path/to.sql"
set -euo pipefail

cd "$(dirname "$0")/.."

if [ ! -f .env.local ]; then
  echo "❌ .env.local missing — abort"
  exit 1
fi

# Read URLs into variables (preserve & = ? chars by reading whole line)
DATABASE_URL=$(grep -E "^DATABASE_URL=" .env.local | head -1 | sed 's/^DATABASE_URL=//')
DIRECT_URL=$(grep -E "^DIRECT_URL=" .env.local | head -1 | sed 's/^DIRECT_URL=//')

# Strip surrounding quotes if any
DATABASE_URL="${DATABASE_URL%\"}"
DATABASE_URL="${DATABASE_URL#\"}"
DIRECT_URL="${DIRECT_URL%\"}"
DIRECT_URL="${DIRECT_URL#\"}"

# Safety check — must point to lab project
if ! echo "$DATABASE_URL" | grep -q "pprhhjosjemsebxcmjkq"; then
  echo "❌ DATABASE_URL not pointing to cita-lab (pprhhjosjemsebxcmjkq) — abort"
  echo "   Got: $(echo "$DATABASE_URL" | sed 's|://[^@]*@|://***@|')"
  exit 1
fi

if echo "$DATABASE_URL" | grep -q "gwplxqfmnreqabwxyfxq"; then
  echo "❌ DATABASE_URL points to PROD — abort"
  exit 1
fi

echo "✓ Target: cita-lab DB ($(echo "$DATABASE_URL" | sed 's|.*@\([^/?]*\).*|\1|'))"
echo ""

export DATABASE_URL
export DIRECT_URL

# Run prisma command
exec npx prisma "$@"
