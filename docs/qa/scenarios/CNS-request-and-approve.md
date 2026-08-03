---
id: CNS-request-and-approve
area: CNS
title: Pedir revisão e obter aprovação consultora
persona: Helena
journey: J-hybrid-consultant-approve
expected: Após aprovação, dona vê APPROVED/selo no fresh load; USER não acessa /consultant
entry_points: http://localhost:3000/analyses/[id]; http://localhost:3000/consultant
qa_status: pass
bug_ids: BUG-20260802-review-btn-while-waiting; BUG-20260802-consultant-notes-hidden; BUG-20260802-staff-form-after-approved
fix_status: fixed
retest_status: pending
fix_commits:
evidence:
last_report: docs/qa/reports/2026-08-02-smoke.md
overlaps:
---

Fluxo ponta a ponta Pass (selo + redirect USER de /consultant). Três frictions UI corrigidas no working tree; re-walk browser pendente.
