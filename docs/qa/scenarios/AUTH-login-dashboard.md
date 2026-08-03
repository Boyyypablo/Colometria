---
id: AUTH-login-dashboard
area: AUTH
title: Login leva ao dashboard autenticado
persona: Sofia
journey: J-login-dashboard-revisit
expected: Credenciais válidas abrem /dashboard; inválidas mostram erro sem vazar dados
entry_points: http://localhost:3000/login
qa_status: pass
bug_ids: BUG-20260802-hydration-on-logout
fix_status: pending
retest_status:
fix_commits:
evidence:
last_report: docs/qa/reports/2026-08-02-smoke.md
overlaps:
---

Inválido → "Email ou senha inválidos.". Válido (Marina / consultora) → /dashboard. Hydration overlay no logout aberto.
