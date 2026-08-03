# CH-analyze-upload-network: Lia envia selfie em 4G

```yaml
charter:
  id: CH-analyze-upload-network
  mission: "Como Lia no celular em 4G, estressar upload/análise sob latência e ver se erros são compreensíveis"
  mode: charter-with-tour
  persona:
    name: Lia
    device: phone-small
    network: 4g
    locale: pt-BR
  journey: J-analyze-ready-results
  scenarios: [ANL-upload-biometric-result]
  tour: Network Tour
  time_box_minutes: 60
  guidance:
    must_try:
      - "Login seed usuaria@colometria.app e ir a /analyze em viewport ~375px"
      - "Enviar imagem válida e observar feedback sob rede lenta"
      - "Tentar arquivo grande/inválido e ausência de biométrico"
    must_avoid:
      - "Aprovar como consultora neste charter"
      - "Desviar para VTO antes de fechar o resultado"
```
