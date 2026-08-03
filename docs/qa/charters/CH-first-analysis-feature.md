# CH-first-analysis-feature: Marina completa o primeiro valor do produto

```yaml
charter:
  id: CH-first-analysis-feature
  mission: "Como Marina, validar se o onboarding LGPD + primeira análise entrega resultado confiável sem atalhos de dev"
  mode: charter-with-tour
  persona:
    name: Marina
    device: laptop
    network: wifi-fast
    locale: pt-BR
  journey: J-onboarding-lgpd-analyze
  scenarios: [AUTH-register-lgpd-happy, ANL-upload-biometric-result]
  tour: Feature Tour
  time_box_minutes: 60
  guidance:
    must_try:
      - "Cadastrar email novo com e sem checkbox LGPD"
      - "Completar upload biométrico até true end (READY ou NEEDS_REVIEW + refresh)"
      - "Confirmar que a foto não é URL pública"
    must_avoid:
      - "Usar contas seed para este charter (é first-time)"
      - "Ler código para decidir o que 'deveria' acontecer"
```
