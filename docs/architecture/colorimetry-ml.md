# Colorimetria: face detect + IA treinável

Plano vivo do produto. Se um provider falhar em produção, **troca-se o adapter** — não o fluxo de negócio.

Documento irmão (roadmap detalhado): [`colorimetry-ml-roadmap.md`](./colorimetry-ml-roadmap.md).

## Objetivos

1. Identificar o rosto e amostrar só ROIs estáveis (bochechas, mandíbula, testa).
2. Evoluir de regras fixas para modelo treinável + calibração por pessoa.
3. Usar feedback (consultora + usuária) como ground truth do que ajuda ou não.

## Fases (resumo)

| Fase | Status | Entrega |
|------|--------|---------|
| 1 | **código no working tree** (não commitado) | Face detect pluggable + ROI + features tipadas + stubs schema |
| 2 | planejada | Dataset rotulado operacional + UI de feedback + export treino |
| 3 | planejada | Modelo tabular v1 + `UserColorProfile` + retreino offline |

## Contrato de troca (adapters)

```
FACE_DETECTOR=heuristic|blazeface|onnx-yunet
COLOR_PREDICTOR=rules|tabular-v1
```

| Camada | Pasta | Hoje | Swap |
|--------|-------|------|------|
| Visão | `src/lib/vision/face/` | `heuristic` | env + implementar provider |
| Predição | `src/lib/color/predictor/` | `rules` | env + artefato `ModelVersion` |

Regras de resiliência:

1. Falha do detector ativo → fallback `heuristic` + warning em `photoQuality`.
2. Preditor desconhecido / artefato ausente → `rules`.
3. Bump de `featureSchemaVersion` exige migração de export + não misturar samples antigos no mesmo treino sem adapter.

### Providers de face

| Id | Deps | Quando usar | Critério de abandono |
|----|------|-------------|----------------------|
| `heuristic` | nenhuma | Default / fallback eterno | Nunca remover — é o paraquedas |
| `blazeface` | tfjs + blazeface | Selfies frontais melhores bbox | >15% fallback ou p95 latência >2s |
| `onnx-yunet` | onnxruntime-node | Escala / Node pesado | Se BlazeFace falhar em prod |

### ROIs amostrados

- `leftCheek`, `rightCheek` — **subtom** (prioridade em `labUndertone`)
- `forehead` — valor / luminosidade
- `jaw` — validação cruzada
- Excluir boca/olhos do Lab de subtom

## Dados

Já no schema (Fase 1 foundation):

- `AnalysisSample` — features + predicted + label gold
- `FeedbackEvent` — HELPED / DID_NOT_HELP + `target`
- `UserColorProfile` — bias por usuária (uso na Fase 3)
- `ModelVersion` — artefato + metrics + `active`

Labels gold:

1. `ConsultantReview.overrideSeasonId` → `AnalysisSample.labelSeasonId`
2. Feedback de item → ranking / personalização (não substitui estação sozinho)

## LGPD

- Consentimento biométrico no upload (já existe).
- Imagens e crops só em `UPLOAD_DIR` privado.
- API cloud de face = **novo texto de consentimento** + DPA.
- **TTL:** `PHOTO_RETENTION_DAYS=365` (default) — análises/imagens/samples mais antigos entram em purge (job a implementar).
- Export de treino: sem email/nome; só `userId` hash opcional.

## Personalização (decisão)

Começa por **bias de estação** via `UserColorProfile` (temperature/value/chroma), não por re-rank de swatches. Re-rank de cores fica para iteração posterior.

## Manutenção contínua

1. Dashboard interno (ou query SQL) semanal: faceDetected %, NEEDS_REVIEW %, concordância consultora.
2. Abaixo do limiar → trocar `FACE_DETECTOR` / investigar ROI.
3. Retreino (Fase 3): `npm run ml:train` → nova `ModelVersion` → activate só após eval holdout ≥ baseline `rules`.
