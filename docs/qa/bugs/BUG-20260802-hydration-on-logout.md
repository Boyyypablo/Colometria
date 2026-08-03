# BUG-20260802-hydration-on-logout: Overlay de hydration error ao clicar Sair

- **Status:** open
- **Impact (user-side):** Trust-Damage
- **Severity:** Medium · **Priority:** P2
- **Persona Affected:** Marina
- **Journey Step:** J-login-dashboard-revisit / logout
- **Scenarios:** AUTH-login-dashboard
- **Found:** 2026-08-02 · **Report:** docs/qa/reports/2026-08-02-smoke.md
- **Origin:**

## Summary

Ao clicar Sair, o Next.js Dev Tools mostrou hydration mismatch (referência a `AppHeader.tsx` e mensagens sobre `Date.now()` / locale). O logout completou, mas a overlay assusta a usuária.

## Reproduction

- **Charter:** CH-first-analysis-feature · **Tour:** Feature Tour
- **Environment:** laptop / wifi-fast / pt-BR · Next.js dev

1. Estar autenticada em `/analyses/[id]`
2. Clicar Sair
3. Observar overlay de hydration error antes/during redirect

**Expected:** Logout limpo sem erro de React
**Actual:** Overlay de hydration; logout ainda funciona

## Evidence

- Snapshot a11y com região "Error feedback" / hydration message apontando `src/components/AppHeader.tsx`

## Fix

<!-- pending — escalado: root cause não isolada no AppHeader (server component limpo); possível interação Next.js overlay + form server action -->

## Verification

<!-- pending -->
