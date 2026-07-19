# CLAUDE.md — Doppler Effect

Sim-specific context for AI assistants. General SceneryStack guidance: [OpenPhysics/.github/CLAUDE.md](https://github.com/OpenPhysics/.github/blob/main/CLAUDE.md).

## Project

Interactive classical **Doppler effect** simulation for sound in a uniform medium. Drag source and observer, visualize expanding circular wavefronts, live frequency shift, waveform displays, and optional microphone listening.

Physics for educators: `doc/model.md`. Architecture: `doc/implementation-notes.md`.

## Key files

| Area | Location |
|---|---|
| Screen | `src/doppler-effect/DopplerEffectScreen.ts` |
| Model | `model/DopplerEffectModel.ts`, `DopplerCalculator.ts`, `MovableObject.ts`, `WaveGenerator.ts`, `WaveformManager.ts`, `DopplerEffectConstants.ts` |
| View | `view/DopplerEffectScreenView.ts`, `WaveManager.ts`, `MoveableObjectView.ts`, `GraphDisplayNode.ts`, `MicrophoneNode.ts`, `DopplerEffectScreenSummaryContent.ts` |
| Input | `DragHandlerManager.ts`, `KeyboardHandlerManager.ts` |
| Colors / strings | `DopplerEffectColors.ts`, `DopplerEffectNamespace.ts`, `src/i18n/StringManager.ts` |

## Model

`DopplerEffectModel` drives source and observer `MovableObject`s, emits circular wavefronts via `WaveGenerator`, and computes observed frequency through `DopplerCalculator`.

| Property | Type | Meaning |
|---|---|---|
| `sourceProperty` / `observerProperty` | `MovableObject` | position, velocity, frequency |
| `scenarioProperty` | `EnumerationProperty<Scenario>` | preset configurations (Free Play, approaching, …) |
| `soundSpeedProperty` | `NumberProperty` | medium speed *c* |
| `isPlayingProperty` | `BooleanProperty` | play/pause |
| `timeSpeedProperty` | `Property<TimeSpeed>` | simulation rate |
| `showTrailsProperty` | `BooleanProperty` | motion trails |
| `waves` | `ObservableArray<Wave>` | expanding wavefronts |

### Stepping & numerics

- Observed frequency: `f' = f · (v − vₒ) / (v − vₛ)` where `vₒ` and `vₛ` are velocity components **along the line of sight**.
- Each wavefront expands from the source position **at emission**; radius grows at `c`. Wave restoration on time-scrub uses `WaveGenerator`'s own history (not snapshotted in `SimulationState`).
- Keyboard presets `0`–`6` load scenario configurations.

## Accessibility

Follows the shared [OpenPhysics accessibility convention](https://github.com/OpenPhysics/Baton/blob/main/ACCESSIBILITY.md).
`DopplerEffectScreenView` registers `DopplerEffectScreenSummaryContent` (live current-details: emitted/observed
frequency + play state) via the `screenSummaryContent` super-option, and orders the PDOM through a wrapper
`Node`. A11y strings live under the top-level `a11y` key in each locale JSON, via
`StringManager.getA11yStrings()`.

## Compliance carve-outs

- **Root constants:** `src/DopplerEffectConstants.ts` (sim-wide); no separate nested primary constants module.
- **Domain clock:** `timeSpeedProperty` (including reverse) and simulation-state history drive the clock instead of composing fleet-standard `TimeModel` (`src/common/TimeModel.ts` is present for shared reference only).

## Testing

Fleet-standard Vitest layout:

| Path | Purpose |
|---|---|
| `vitest.config.ts` | `jsdom` environment (no `setupFiles`); `scenerystack` aliased to `scenerystack/dot`; `execArgv: ["--expose-gc"]` |
| `tests/**/*.test.ts` | Model/physics unit tests |
| `tests/memory-leak.test.ts` | WeakRef + `forceGC` dispose regression (fleet pattern) |

Actual specs:

- `tests/DopplerCalculator.test.ts`
- `tests/WaveGenerator.test.ts`
- `tests/memory-leak.test.ts`

Vitest environment: **`jsdom`** (not the fleet-default `happy-dom`) — physics tests need browser globals without pulling the full SceneryStack barrel.

Run `npm test`. CI runs the suite when a `test` script is present.

## Commands

```bash
npm run lint && npm run check && npm run build
npm test
```

## Development notes

- Microphone node listens at an arbitrary point (can differ from observer icon). Motion trails and projector mode supported via preferences.
