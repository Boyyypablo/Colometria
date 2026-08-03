# Personas — Colometria

Instâncias do produto (colorimetria pessoal, pt-BR). Atualizar só quando a audiência mudar.

## Marina

```yaml
persona:
  name: Marina
  base: New User
  goal: Descobrir a estação de colorimetria dela na primeira visita, sem fricção de cadastro
  device: laptop
  network: wifi-fast
  modality: mouse-keyboard
  locale: pt-BR
  patience_seconds: 60
```

Primeira impressão: cadastro + LGPD + 1ª análise. Abandona em spinner longo ou erro sem copy clara.

## Sofia

```yaml
persona:
  name: Sofia
  base: Casual User
  goal: Reabrir uma análise antiga e lembrar do que usar/evitar
  device: laptop
  network: wifi-fast
  modality: mouse-keyboard
  locale: pt-BR
  patience_seconds: 90
```

Lembra do objetivo, não dos passos. Revela discoverability no dashboard e continuidade de sessão.

## Lia

```yaml
persona:
  name: Lia
  base: Mobile User
  goal: Tirar/enviar selfie no celular e ver o resultado rápido
  device: phone-small
  network: 4g
  modality: touch
  locale: pt-BR
  patience_seconds: 45
```

Viewport ~375px, uma mão, rede instável. Revela touch targets, upload lento, layout quebrado.

## Renata

```yaml
persona:
  name: Renata
  base: Accessibility-Reliant
  goal: Completar cadastro e análise só com teclado / leitor de tela
  device: laptop
  network: wifi-fast
  modality: keyboard-only
  locale: pt-BR
  patience_seconds: 120
```

Labels, ordem de foco, anúncios de status da análise. Abandona se o fluxo for só visual.

## Helena

```yaml
persona:
  name: Helena
  base: Power User
  goal: Esvaziar a fila de revisões e aprovar com estação + notas sem retrabalho
  device: desktop
  network: wifi-fast
  modality: mouse-keyboard
  locale: pt-BR
  patience_seconds: 30
```

Consultora diária. Revela regressões de fila, permissões e override que a usuária vê depois.
