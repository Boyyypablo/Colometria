# CH-login-dashboard-smoke: Sofia revisita o histórico

```yaml
charter:
  id: CH-login-dashboard-smoke
  mission: "Como Sofia, confirmar login → dashboard → reopen análise com true end após refresh"
  mode: charter-with-tour
  persona:
    name: Sofia
    device: laptop
    network: wifi-fast
    locale: pt-BR
  journey: J-login-dashboard-revisit
  scenarios: [AUTH-login-dashboard, DSH-reopen-analysis]
  tour: Feature Tour
  time_box_minutes: 30
  guidance:
    must_try:
      - "Login usuaria@colometria.app e abrir uma análise existente"
      - "Fresh load confirma o mesmo conteúdo"
      - "Credencial inválida mostra erro sem vazar stack"
    must_avoid:
      - "Criar conta nova neste charter"
      - "Entrar no fluxo de consultora"
```
