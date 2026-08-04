#!/usr/bin/env bash
# Sobe a stack de produção na VPS (app + Postgres no Docker).
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

ENV_FILE="${ENV_FILE:-.env.production}"

if [[ ! -f "$ENV_FILE" ]]; then
  echo "Crie $ENV_FILE a partir de .env.production.example"
  exit 1
fi

docker compose -f docker-compose.prod.yml --env-file "$ENV_FILE" up -d --build
docker compose -f docker-compose.prod.yml --env-file "$ENV_FILE" ps

echo
echo "Opcional (seed demo — só em ambiente de teste):"
echo "  docker compose -f docker-compose.prod.yml --env-file $ENV_FILE exec app npx prisma db seed"
echo
echo "Logs:"
echo "  docker compose -f docker-compose.prod.yml --env-file $ENV_FILE logs -f app"
