---
id: VTO-simulation-completed
area: VTO
title: Simulação VTO completa com preview
persona: Sofia
journey: J-vto-color-simulation
expected: Job COMPLETED com imagem de saída autenticada; limite diário comunicado se atingido
entry_points: http://localhost:3000/analyses/[id]
qa_status: pass
bug_ids:
fix_status:
retest_status:
fix_commits:
evidence:
last_report: docs/qa/reports/2026-08-02-smoke.md
overlaps:
---

COLOR_DRAPE gerou segunda img em /api/uploads. Interrupt (sair durante QUEUED) + return; re-run mostrou preview. Limite diário não atingido neste run.
