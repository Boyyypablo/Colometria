# BUG-20260802-consultant-notes-hidden: Notas da consultora não aparecem para a dona

- **Status:** fixed
- **Impact (user-side):** Trust-Damage
- **Severity:** High · **Priority:** P1
- **Persona Affected:** Marina
- **Journey Step:** J-hybrid-consultant-approve, step 4
- **Scenarios:** CNS-request-and-approve
- **Found:** 2026-08-02 · **Report:** docs/qa/reports/2026-08-02-smoke.md
- **Origin:**

## Summary

Helena escreveu notas no formulário de aprovação, mas Marina, ao reabrir a análise aprovada, vê o selo e não vê as notas — o true end do fluxo híbrido fica incompleto.

## Reproduction

- **Charter:** CH-consultant-approve-feature · **Tour:** Feature Tour
- **Environment:** desktop then laptop / wifi-fast / pt-BR

1. Como consultora, aprovar com notas preenchidas
2. Como dona, abrir a mesma análise
3. Procurar as notas no relatório

**Expected:** Notas visíveis para a dona
**Actual:** Apenas selo; `reviews.notes` não renderizado

## Evidence

- Snapshot pós-aprovação como Marina em `/analyses/cmscjn9a4000bn8xsfbd2gtbd` sem texto das notas

## Fix

- **Root cause:** Página carregava `reviews` mas não renderizava `notes`
- **Fix commit:** working tree — bloco "Notas da consultora" em `page.tsx`
- **Regression test:** documented replay — análise com review.notes deve exibir o bloco

## Verification

- **Retested:** 2026-08-02, code path · **Report:** docs/qa/reports/2026-08-02-smoke.md
- **Result:** render adicionado; confirmar no próximo walk
