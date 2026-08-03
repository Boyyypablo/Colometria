---
id: DSH-reopen-analysis
area: DSH
title: Reabrir análise do histórico
persona: Sofia
journey: J-login-dashboard-revisit
expected: Clique na lista abre /analyses/[id] com o mesmo conteúdo após F5
entry_points: http://localhost:3000/dashboard
qa_status: pass
bug_ids:
fix_status:
retest_status:
fix_commits:
evidence:
last_report: docs/qa/reports/2026-08-02-smoke.md
overlaps: AUTH-login-dashboard
---

Dashboard listou análise; deep-link /analyses/[id] confirmou mesmo status/estação após fresh load.
