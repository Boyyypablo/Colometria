# QA Run Report — 2026-08-04 — smoke-tunnel

- **Scope:** Ciclo smoke + verificação de paridade com túnel Cloudflare (app local + Postgres Docker)
- **Cadence tier:** smoke
- **Build:** `4583790` (+ working tree: tunnel scripts, next image qualities, Docker VPS files) · **Environment:** `http://localhost:3000` (dev); túnel `https://solely-dryer-src-watershed.trycloudflare.com`
- **Started:** 2026-08-04T15:58:11-03:00 · **Status:** in-progress <!-- in-progress | closed -->

## Personas

| Persona | Base | Device / Network / Locale | Sessions |
|---|---|---|---|
| Sofia | Casual User | laptop / wifi-fast / pt-BR | CH-login-dashboard-smoke |
| Marina | New User | laptop / wifi-fast / pt-BR | CH-first-analysis-feature |
| Lia | Mobile User | phone-small / 4g (sem throttle tooling) / pt-BR | CH-analyze-upload-network |
| Helena | Power User | desktop / wifi-fast / pt-BR | CH-consultant-approve-feature |
| Sofia | Casual User | laptop / wifi-fast / pt-BR | CH-vto-interrupt |

## Flows in Scope

- `J-login-dashboard-revisit` — Login e reabrir análise (`../journeys/J-login-dashboard-revisit.md`)
- `J-onboarding-lgpd-analyze` — Cadastro LGPD + 1ª análise (`../journeys/J-onboarding-lgpd-analyze.md`)
- `J-analyze-ready-results` — Upload sob condições de rede/mobile (`../journeys/J-analyze-ready-results.md`)
- `J-hybrid-consultant-approve` — Pedir revisão e aprovar (`../journeys/J-hybrid-consultant-approve.md`)
- `J-vto-color-simulation` — Simulação visual (`../journeys/J-vto-color-simulation.md`)

## Session Matrix & Results

| # | Charter | Journey / Scenario | Persona | Tour | Status | Issue | Fix commit |
|---|---|---|---|---|---|---|---|
| 1 | CH-login-dashboard-smoke | J-login-dashboard-revisit / AUTH-login-dashboard, DSH-reopen-analysis | Sofia | Feature Tour | Pending | | |
| 2 | CH-first-analysis-feature | J-onboarding-lgpd-analyze / AUTH-register-lgpd-happy, ANL-upload-biometric-result | Marina | Feature Tour | Pending | | |
| 3 | CH-analyze-upload-network | J-analyze-ready-results / ANL-upload-biometric-result | Lia | Network Tour | Pending | | |
| 4 | CH-consultant-approve-feature | J-hybrid-consultant-approve / CNS-request-and-approve | Helena | Feature Tour | Pending | | |
| 5 | CH-vto-interrupt | J-vto-color-simulation / VTO-simulation-completed | Sofia | Interrupt Tour | Pending | | |

Status legend: `Pending | Pass | Fixed | Skipped | Blocked (needs human verify) | Blocked (human decision)`

## Session Debriefs

<!-- filled during run -->

## What Was Fixed

<!-- none yet -->

## Paper Cuts

| Persona | Where (journey/step) | Felt | Sharpness | Outcome |
|---|---|---|---|---|
| | | | | |

## Runtime Errors Observed

- Dev console: `images.qualities` warning (config já inclui `[75, 92]` — requer restart do Next para sumir)
- Dev console histórico: `ClientFetchError` Auth no boot (HTML em vez de JSON) — revalidar na sessão AUTH
- Hydration `bis_skin_checked` — extensão do browser (Bitdefender), não produto

## Human Verifications Needed

- [ ] (preencher se surgir)

## Decisions for a Human

<!-- preencher se governor bloquear -->

## Learnings

<!-- preencher ao fechar -->

## Final Status

<!-- Written LAST -->

- **Exit gate (full automated suite):** `npm test` → 10 files / 49 tests passed (2026-08-04T15:57)
- **Issues by user impact:** Blocks-Completion — · Data-Loss — · Trust-Damage — · Friction — · Cosmetic —
- **Coverage:** — / 5 journeys
- **Verdict:** in-progress
