# Colometria

Produto web de **colorimetria pessoal** (imagens primeiro): análise sazonal CIELAB → 12 estações, recomendações e simulação visual, com fluxo híbrido self-service + consultora.

## Stack

- Next.js (App Router) + TypeScript + Tailwind
- **PostgreSQL próprio** (Docker Compose, porta **5433**) + Prisma — **sem Supabase**
- Auth.js (email/senha)
- Storage local privado em `uploads/` (servido só via API autenticada)
- VTO: Hugging Face Inference Providers (`HF_TOKEN`) — também Gemini / fal / mock

## Subir o ambiente

```bash
# 1) Postgres (porta 5433 — evita conflito com outros Postgres locais)
npm run db:up

# 2) Dependências (se ainda não)
npm install

# 3) Migrar + seed (12 paletas + usuários demo)
npx prisma migrate dev --name init
npm run db:seed

# 4) App
npm run dev
```

Abra http://localhost:3000

### Contas demo (seed)

| Email | Senha | Papel |
|-------|-------|-------|
| `usuaria@colometria.app` | `colometria123` | Usuária |
| `consultora@colometria.app` | `colometria123` | Consultora |
| `admin@colometria.app` | `colometria123` | Admin |

## Variáveis

Copie `.env.example` → `.env`. Principal: `DATABASE_URL` (padrão `localhost:5433`).

## Testes externos via túnel (sem VPS)

Com o app local + Postgres Docker, exponha só a porta 3000:

```bash
npm run db:up
npm run dev
# em outro terminal:
npm run tunnel
```

Copie a URL `https://….trycloudflare.com` e envie aos testadores.  
Opcional: coloque essa URL em `AUTH_URL` no `.env` e reinicie o `npm run dev`.

Requisito: [cloudflared](https://developers.cloudflare.com/cloudflare-one/connections/connect-apps/install-and-setup/installation/) (`winget install Cloudflare.cloudflared`).

## Deploy em VPS (Docker)

Stack completa no servidor: app Next.js + Postgres **só na rede interna** (porta do banco não fica pública).

```bash
# Na VPS (Ubuntu/Debian com Docker + Compose)
git clone https://github.com/Boyyypablo/Colometria.git
cd Colometria
cp .env.production.example .env.production
# Edite AUTH_URL, AUTH_SECRET, POSTGRES_PASSWORD, HF_TOKEN

chmod +x scripts/vps-up.sh
./scripts/vps-up.sh
```

- App: `http://SEU_IP:3000` (ou domínio atrás de Caddy/Nginx + HTTPS)
- Crie a conta pela UI de registro (ou rode o seed localmente apontando ao DB via `ssh -L`)
- Firewall: liberar só `22` e `3000` (ou `80/443` se usar proxy)

## Testes

```bash
npm test
```

## LGPD

Cadastro exige consentimento LGPD; upload exige consentimento biométrico. Imagens não vão para pasta pública.

## Colorimetria / IA

Plano vivo (face detect pluggable + modelo treinável): [`docs/architecture/colorimetry-ml.md`](docs/architecture/colorimetry-ml.md).

```bash
# .env
FACE_DETECTOR=heuristic   # trocar para blazeface|onnx-yunet quando o adapter estiver pronto
COLOR_PREDICTOR=rules     # trocar para tabular-v1 após treino
```

