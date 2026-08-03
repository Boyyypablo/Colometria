---
id: AUTH-register-lgpd-happy
area: AUTH
title: Cadastrar com LGPD e chegar em /analyze
persona: Marina
journey: J-onboarding-lgpd-analyze
expected: Após cadastro com LGPD, sessão ativa e redirecionamento para /analyze
entry_points: http://localhost:3000/register; http://localhost:3000/
qa_status: pass
bug_ids:
fix_status:
retest_status:
fix_commits:
evidence: docs/qa/evidence/2026-08-02-smoke/CH-first-analysis-register-ok.png
last_report: docs/qa/reports/2026-08-02-smoke.md
overlaps:
---

Sem LGPD: HTML5 bloqueia envio (foco no checkbox). Com LGPD: 201 + auto-login → /analyze.
