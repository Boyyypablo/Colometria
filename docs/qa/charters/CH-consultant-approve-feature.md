# CH-consultant-approve-feature: Helena fecha a fila híbrida

```yaml
charter:
  id: CH-consultant-approve-feature
  mission: "Como Helena, percorrer pedido de revisão → aprovação e confirmar o que a dona vê depois"
  mode: charter-with-tour
  persona:
    name: Helena
    device: desktop
    network: wifi-fast
    locale: pt-BR
  journey: J-hybrid-consultant-approve
  scenarios: [CNS-request-and-approve]
  tour: Feature Tour
  time_box_minutes: 60
  guidance:
    must_try:
      - "Como usuária, pedir revisão em análise não APPROVED"
      - "Como consultora@colometria.app, aprovar com estação + notas"
      - "Reabrir como dona e confirmar APPROVED/selo após refresh; USER bloqueada em /consultant"
    must_avoid:
      - "Alterar schema/seed mid-session"
      - "Pular o true end da dona"
```
