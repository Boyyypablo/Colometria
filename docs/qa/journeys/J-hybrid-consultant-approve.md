# J-hybrid-consultant-approve

```mermaid
flowchart TD
  U[Usuária em /analyses/id] -->|não APPROVED| R[Pedir revisão]
  R --> Q[Item na fila /consultant]
  Q --> C[Consultora abre e preenche estação + notas]
  C --> A[POST aprovação]
  A --> T[True end: APPROVED + selo; usuária vê override após refresh]
  Q2[USER tenta /consultant] --> D[/dashboard]
  U -->|já APPROVED| X[Botão revisão ausente]
```

```yaml
journey:
  id: J-hybrid-consultant-approve
  name: Pedir revisão e aprovação da consultora
  value_statement: "Fluxo híbrido fecha com selo de consultora e resultado override visível para a dona"
  personas: [Sofia, Helena]
  entry_points:
    - url: http://localhost:3000/analyses/[id]
      origin: in-app-nav
    - url: http://localhost:3000/consultant
      origin: in-app-nav
  actions:
    - step: 1
      verb: Usuária pede revisão na análise
      expected_observable: Status/indicação de revisão solicitada
    - step: 2
      verb: Consultora abre a fila e a análise
      expected_observable: Item listado com contexto suficiente
    - step: 3
      verb: Consultora aprova com estação e notas
      expected_observable: Confirmação de aprovação
    - step: 4
      verb: Usuária reabre a análise
      expected_observable: APPROVED / selo / override
  goal:
    observable: Análise APPROVED com selo consultora visível para a dona
    side_effects: [record-updated]
  true_end_state: Fresh load da dona mostra APPROVED e notas; USER não acessa /consultant
  exit:
    natural: Análise aprovada; fila sem o item
  abandonment:
    - at_step: 2
      how: Consultora não atende a fila
      resume: Item permanece; usuária ainda vê NEEDS_REVIEW/pedido
  crosses: [auth-roles, consultant-api]
```
