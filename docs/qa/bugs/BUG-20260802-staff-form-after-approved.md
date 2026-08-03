# BUG-20260802-staff-form-after-approved: Formulário de revisão permanece após APPROVED

- **Status:** fixed
- **Impact (user-side):** Friction
- **Severity:** Low · **Priority:** P3
- **Persona Affected:** Helena
- **Journey Step:** J-hybrid-consultant-approve, step 3
- **Scenarios:** CNS-request-and-approve
- **Found:** 2026-08-02 · **Report:** docs/qa/reports/2026-08-02-smoke.md
- **Origin:**

## Summary

Depois de aprovar, a consultora ainda vê o formulário "Aprovar com esta estação", sugerindo que a ação não terminou.

## Reproduction

1. Aprovar análise
2. Refresh
3. Formulário ainda presente com badge "Aprovado pela consultora"

**Expected:** Formulário some após APPROVED
**Actual:** `isStaff` sozinho controlava a visibilidade

## Evidence

- Snapshot staff pós-aprovação

## Fix

- **Root cause:** `{isStaff && (` sem filtrar status
- **Fix commit:** working tree — `isStaff && status !== "APPROVED"`
- **Regression test:** documented replay

## Verification

- **Retested:** 2026-08-02 · **Report:** docs/qa/reports/2026-08-02-smoke.md
- **Result:** condição corrigida
