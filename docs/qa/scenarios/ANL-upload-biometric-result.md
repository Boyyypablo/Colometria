---
id: ANL-upload-biometric-result
area: ANL
title: Upload com biométrico gera resultado legível
persona: Lia
journey: J-analyze-ready-results
expected: Análise READY ou NEEDS_REVIEW com estação/recomendações após refresh
entry_points: http://localhost:3000/analyze
qa_status: pass
bug_ids:
fix_status:
retest_status:
fix_commits:
evidence: docs/qa/evidence/2026-08-02-smoke/CH-first-analysis-result.png
last_report: docs/qa/reports/2026-08-02-smoke.md
overlaps:
---

Walked via Marina (Feature) com fixture JPEG: READY Primavera Brilhante 100%, foto via /api/uploads. Sem biométrico HTML5 bloqueia. Network Tour 4G não throttleável neste browser — gap de paridade.
