# CH-vto-interrupt: Sofia dispara VTO e interrompe o poll

```yaml
charter:
  id: CH-vto-interrupt
  mission: "Como Sofia, validar simulação VTO sob interrupção (sair/voltar) e limite diário"
  mode: charter-with-tour
  persona:
    name: Sofia
    device: laptop
    network: wifi-fast
    locale: pt-BR
  journey: J-vto-color-simulation
  scenarios: [VTO-simulation-completed]
  tour: Interrupt Tour
  time_box_minutes: 30
  guidance:
    must_try:
      - "Disparar COLOR_DRAPE ou BLOUSE_TONE e sair durante o poll"
      - "Voltar e verificar COMPLETED/FAILED + preview autenticado"
      - "Observar mensagem se bater VTO_DAILY_LIMIT"
    must_avoid:
      - "Inventar provider externo se mock local basta"
      - "Usar conta consultora para VTO da dona"
```
