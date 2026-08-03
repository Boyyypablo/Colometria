# BUG-20260802-review-btn-while-waiting: Botão "Pedir revisão" permanece com status Aguarda consultora

- **Status:** fixed
- **Impact (user-side):** Friction
- **Severity:** Medium · **Priority:** P2
- **Persona Affected:** Marina
- **Journey Step:** J-hybrid-consultant-approve, step 1
- **Scenarios:** CNS-request-and-approve
- **Found:** 2026-08-02 · **Report:** docs/qa/reports/2026-08-02-smoke.md
- **Origin:**

## Summary

Depois de pedir revisão, o status muda para "Aguarda consultora", mas o botão "Pedir revisão da consultora" continua disponível — Marina pode clicar de novo sem necessidade.

## Reproduction

- **Charter:** CH-consultant-approve-feature · **Tour:** Feature Tour
- **Environment:** laptop / wifi-fast / pt-BR

1. Em análise READY, clicar Pedir revisão
2. Após refresh, ver badge "Aguarda consultora"
3. Observar que o botão de pedir revisão ainda aparece

**Expected:** Botão some (ou desabilita) quando já está em NEEDS_REVIEW
**Actual:** Botão permanece enquanto status !== APPROVED

## Evidence

- Observado em sessão live em `/analyses/cmscjn9a4000bn8xsfbd2gtbd`

## Fix

- **Root cause:** Condição `status !== "APPROVED"` inclui NEEDS_REVIEW
- **Fix commit:** working tree (não commitado) — `src/app/analyses/[id]/page.tsx` usa `status === "READY"`
- **Regression test:** documented replay — reabrir análise NEEDS_REVIEW não deve mostrar o botão; READY sim

## Verification

- **Retested:** 2026-08-02, code review + condition change · **Report:** docs/qa/reports/2026-08-02-smoke.md
- **Result:** condição corrigida; re-walk browser pendente no próximo ciclo se necessário
