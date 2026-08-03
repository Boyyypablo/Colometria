# J-onboarding-lgpd-analyze

```mermaid
flowchart TD
  A[Entry: / ou CTA Cadastro] --> B[Formulário /register]
  B -->|sem LGPD| B1[Bloqueio / erro inline]
  B1 --> B
  B -->|email duplicado| B2[Erro 409 preservando inputs]
  B -->|válido + LGPD| C[Conta criada + auto-login]
  C -->|falha signIn| L[/login]
  C --> D[/analyze]
  D -->|sai sem enviar| X1[Abandono: volta depois no login]
  D -->|foto + biométrico| E[POST /api/analyses]
  E --> F[Redirect /analyses/id]
  F --> G[True end: READY ou NEEDS_REVIEW com estação/recomendações]
```

```yaml
journey:
  id: J-onboarding-lgpd-analyze
  name: Completar onboarding e primeira análise
  value_statement: "Nova usuária sai com conta LGPD-ok e um resultado de colorimetria na primeira sessão"
  personas: [Marina, Lia]
  entry_points:
    - url: http://localhost:3000/
      origin: direct
    - url: http://localhost:3000/register
      origin: in-app-nav
  actions:
    - step: 1
      verb: Abre o cadastro e preenche nome, email, senha
      expected_observable: Formulário visível com checkbox LGPD
    - step: 2
      verb: Aceita LGPD e envia
      expected_observable: Redireciona autenticada para /analyze
    - step: 3
      verb: Envia foto com consentimento biométrico e contexto
      expected_observable: Processamento e chegada em /analyses/[id]
  goal:
    observable: Análise com status READY ou NEEDS_REVIEW e recomendações legíveis
    side_effects: [record-created, private-upload]
  true_end_state: Relatório sazonal visível após refresh; imagem só via API autenticada
  exit:
    natural: Página da análise com próximos passos (VTO / pedir revisão)
  abandonment:
    - at_step: 2
      how: Fecha a aba sem marcar LGPD
      resume: Volta ao /register; conta ainda não existe
    - at_step: 3
      how: Sai de /analyze sem upload
      resume: Login → /dashboard vazia → /analyze
  crosses: [auth, storage, analysis-pipeline]
```
