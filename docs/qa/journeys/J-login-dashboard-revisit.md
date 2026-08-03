# J-login-dashboard-revisit

```mermaid
flowchart TD
  A[Entry: /login] --> B[Credenciais]
  B -->|inválidas| B1[Erro visível]
  B1 --> B
  B -->|ok| C[/dashboard]
  C -->|lista vazia| C1[Empty state + CTA analisar]
  C -->|tem análises| D[Clica uma análise]
  D --> E[/analyses/id]
  E --> F[True end: mesmo status/recomendações após refresh]
  A2[Deep link protegido] -->|sem sessão| A
  E -->|análise de outra| R[/dashboard]
```

```yaml
journey:
  id: J-login-dashboard-revisit
  name: Login e revisitação do histórico
  value_statement: "Usuária recorrente encontra e confere uma análise anterior sem recomeçar do zero"
  personas: [Sofia, Marina]
  entry_points:
    - url: http://localhost:3000/login
      origin: direct
    - url: http://localhost:3000/dashboard
      origin: in-app-nav
  actions:
    - step: 1
      verb: Entra com email/senha
      expected_observable: Chega em /dashboard autenticada
    - step: 2
      verb: Abre uma análise da lista
      expected_observable: Relatório carrega com status e recomendações
  goal:
    observable: Análise revisitada com dados consistentes após F5
    side_effects: []
  true_end_state: Fresh load de /analyses/[id] mostra o mesmo resultado
  exit:
    natural: Página da análise ou volta ao dashboard
  abandonment:
    - at_step: 1
      how: Credenciais erradas e desiste
      resume: Tenta de novo no /login
  crosses: [auth, middleware]
```
