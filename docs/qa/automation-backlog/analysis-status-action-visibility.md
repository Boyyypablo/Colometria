# analysis-status-action-visibility

- **Intent:** E2E/component — botão Pedir revisão só em READY; notas da consultora visíveis na dona; form staff oculto em APPROVED
- **Source bugs:** BUG-20260802-review-btn-while-waiting; BUG-20260802-consultant-notes-hidden; BUG-20260802-staff-form-after-approved
- **Why automate:** regressões baratas de condição de status que o smoke já pegou duas vezes se voltarem
- **Suggested stack:** Vitest + RTL ou Playwright smoke
- **Priority:** P2
