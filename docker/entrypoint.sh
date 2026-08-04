#!/bin/sh
set -eu

echo "[entrypoint] aguardando postgres e aplicando migrations..."
node ./node_modules/prisma/build/index.js migrate deploy

echo "[entrypoint] iniciando Next.js (standalone)..."
exec node server.js
