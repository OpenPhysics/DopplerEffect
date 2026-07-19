# CLAUDE.md — Doppler Effect

Sim-specific context for AI assistants. General SceneryStack guidance: [OpenPhysics/.github/CLAUDE.md](https://github.com/OpenPhysics/.github/blob/main/CLAUDE.md).

## Project

Interactive Doppler effect simulation: drag source and observer, visualize circular wave fronts, live frequency shift, and waveform displays.

## Key files

| Area | Location |
|---|---|
| Screen | `src/doppler-effect/DopplerEffectScreen.ts` |
| Model | `DopplerEffectModel.ts`, `DopplerCalculator.ts`, `MovableObject.ts`, `WaveGenerator.ts`, `WaveformManager.ts` |
| View | `DopplerEffectScreenView.ts`, `WaveManager.ts`, `MoveableObjectView.ts`, `GraphDisplayNode.ts`, `MicrophoneNode.ts` |
| Input | `DragHandlerManager.ts`, `KeyboardHandlerManager.ts` |
| Colors | `DopplerEffectColors.ts`, `DopplerEffectNamespace.ts` |

## Accessibility

Follows the shared [OpenPhysics accessibility convention](https://github.com/OpenPhysics/Baton/blob/main/ACCESSIBILITY.md).
`DopplerEffectScreenView` registers `DopplerEffectScreenSummaryContent` (live current-details: emitted/observed
frequency + play state) via the `screenSummaryContent` super-option — replacing a former
hard-coded English `descriptionContent` — and orders the PDOM through a wrapper `Node`. A11y
strings live under the top-level `a11y` key in each locale JSON, via `StringManager.getA11yStrings()`.

## Testing

Fleet-standard Vitest layout:

| Path | Purpose |
|---|---|
| `vitest.config.ts` | Test environment + `setupFiles` when present; `execArgv: ["--expose-gc"]` with memory-leak suite |
| `tests/setup.ts` | Canvas / AudioContext mocks + `init({ name: "…" })` before SceneryStack imports (when required) |
| `tests/**/*.test.ts` | Model/physics unit tests — mirror `src/` under `tests/` |
| `tests/memory-leak.test.ts` | WeakRef + `forceGC` dispose regression (fleet pattern) |

- Put unit tests only under root `tests/` (never co-locate or use `__tests__/`).
- Run `npm test`. CI runs the suite when a `test` script is present.
- Expand `memory-leak.test.ts` for components that add/remove nodes or link Properties at runtime (see OpticsLab).

## Physics

Observed frequency: `f' = f * (v - vₒ) / (v - vₛ)` where `vₒ` and `vₛ` are velocity components along the line of sight.

## Interaction

- Keyboard presets `0`–`6` load scenario configurations
- Microphone node for listening to observed frequency
- Motion trails toggle; projector mode supported
