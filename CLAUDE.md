# CLAUDE.md — Doppler Effect

Sim-specific context for AI assistants. General SceneryStack guidance: [OpenPhysics/.github/CLAUDE.md](https://github.com/OpenPhysics/.github/blob/main/CLAUDE.md).

## Project

Interactive Doppler effect simulation: drag source and observer, visualize circular wave fronts, live frequency shift, and waveform displays.

## Key files

| Area | Location |
|---|---|
| Screen | `src/screen-name/SimScreen.ts` |
| Model | `SimModel.ts`, `DopplerCalculator.ts`, `MovableObject.ts`, `WaveGenerator.ts`, `WaveformManager.ts` |
| View | `SimScreenView.ts`, `WaveManager.ts`, `MoveableObjectView.ts`, `GraphDisplayNode.ts`, `MicrophoneNode.ts` |
| Input | `DragHandlerManager.ts`, `KeyboardHandlerManager.ts` |
| Colors | `DopplerEffectColors.ts`, `DopplerEffectNamespace.ts` |

## Accessibility

Follows the shared [OpenPhysics accessibility convention](https://github.com/OpenPhysics/OpenPhysics/blob/main/ACCESSIBILITY.md).
`SimScreenView` registers `SimScreenSummaryContent` (live current-details: emitted/observed
frequency + play state) via the `screenSummaryContent` super-option — replacing a former
hard-coded English `descriptionContent` — and orders the PDOM through a wrapper `Node`. A11y
strings live under the top-level `a11y` key in each locale JSON, via `StringManager.getA11yStrings()`.

## Physics

Observed frequency: `f' = f * (v - vₒ) / (v - vₛ)` where `vₒ` and `vₛ` are velocity components along the line of sight.

## Interaction

- Keyboard presets `0`–`6` load scenario configurations
- Microphone node for listening to observed frequency
- Motion trails toggle; projector mode supported
