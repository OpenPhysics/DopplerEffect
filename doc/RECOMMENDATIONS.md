# Codebase Recommendations — Doppler Effect

A review of the current `src/` tree (≈5,100 LoC, SceneryStack 3, TypeScript 6,
Biome, Vite). The code is well-structured overall: the model/view split is clean,
specialized helpers (`WaveGenerator`, `WaveformManager`, `DopplerCalculator`) keep
the model focused, and units are documented inline throughout. The items below are
ordered by impact.

## High impact

### 1. There are no automated tests

There is not a single `*.test.ts` / `*.spec.ts` file in the repo, yet the physics
core is pure and trivially testable. `DopplerCalculator` (`calculateObservedFrequency`,
`findWavesAtObserver`) and `WaveGenerator` take plain inputs and return plain outputs
with no rendering dependency.

**Recommendation:** Add a unit-test runner (Vitest fits the existing Vite setup) and
cover at minimum:
- `DopplerCalculator.calculateObservedFrequency`: source approaching/receding,
  observer approaching/receding, perpendicular motion (no shift), and the
  `f' = f·(v − vₒ)/(v − vₛ)` identity at zero velocity.
- `findWavesAtObserver`: arrival-time reconstruction and "most recent first" sort order.
- `WaveGenerator.generateWaves`: emission cadence equals `1/frequency`.

Then add a `test` job to `.github/workflows/ci.yml` (today CI only builds/lints).
This is the single highest-leverage change — the formulas are the whole point of the sim.

### 2. Hard-coded English accessibility strings violate the project's own a11y convention

`CLAUDE.md` states a11y strings must live under the `a11y` key in each locale JSON and
be accessed via `StringManager.getA11yStrings()`. `DopplerEffectScreenView.ts` does this
correctly for the source, observer, and scenario selector — but eight other accessible
names are hard-coded English literals:

| Line | Hard-coded string |
|---|---|
| `171` | `"Grid lines showing distance scale"` |
| `236` | `"Microphone"` |
| `263` | `"Frequency graphs"` |
| `282` | `"Status information"` |
| `303` | `"Control panel"` |
| `334` | `"Reset simulation"` |
| `341` | `"Scale: 1000 meters"` |
| `371` | `"Simulation speed control"` |
| `379` | `"Keyboard shortcuts help"` |

These are invisible to translators (the sim ships `en`, `fr`, `es`) and inconsistent with
the surrounding code in the same file.

**Recommendation:** Move all of these into the `a11y.controls` block of the locale JSONs
and reference them via `getA11yStrings()`, exactly as the microphone node and source/observer
already do.

## Medium impact

### 3. Time-reversal keeps two parallel histories and deep-copies every wave each frame

`DopplerEffectModel.storeSimulationState()` runs on **every** forward step and allocates a
full deep copy of all live waves (each with several `Vector2.copy()` calls) into
`simulationStateHistory` (`DopplerEffectModel.ts:460–485`). Separately, `WaveGenerator`
maintains its own `waveHistory`, and `restoreSimulationState()` restores positions from the
model's history but waves from the generator's history. Two sources of truth for the same
feature.

Additional concerns in the same area:
- `findClosestState()` is an O(n) linear scan (`:492–514`), even though the history is
  strictly time-ordered and supports binary search.
- `restoreWavesFromHistory()` recomputes radius as `age × currentSoundSpeed`
  (`WaveGenerator.ts:146`), which contradicts the carefully step-integrated radius that the
  rest of the model relies on (see the comment in `DopplerCalculator.findWavesAtObserver`).
  Reversing after a sound-speed change yields inconsistent wavefronts.

**Recommendation:** Consolidate to a single history mechanism, replace the linear scan with a
binary search, and reduce per-frame allocation (e.g. only snapshot wave *deltas*, or store
history at a coarser interval). At minimum, deduplicate the two history paths so the wave and
position state cannot drift apart.

### 4. The view re-renders multiple times per simulation step

`addModelListeners()` links `updateView` to `sourcePositionProperty`, `observerPositionProperty`,
`sourceVelocityProperty`, and `observerVelocityProperty` (`DopplerEffectScreenView.ts:520–523`).
During a single `model.step()` the source and observer positions both change, each firing a full
`updateView()` (which updates both object views, the selection highlight, and **all** wave nodes),
and `ScreenView.step()` then calls `updateView()` again. That is up to three full view passes per
frame.

**Recommendation:** Drive per-frame rendering from `step()` only (the framework already calls it
each frame), or coalesce the property links so a step triggers one `updateView()`. Reserve the
property listeners for off-step interactions (dragging) if needed.

## Low impact / polish

### 5. Redundant distance API
`getSourceObserverDistance()` (`DopplerEffectModel.ts:649`) recomputes what the existing
`sourceObserverDistanceProperty` (`:304`) already derives. Prefer the property and drop the
method, or have the method read `.value`.

### 6. Dead defensive code
- `this.waveformUpdateCounter = (this.waveformUpdateCounter || 0) + 1` (`:540`) — the field is
  already initialized to `0` and only ever incremented; the `|| 0` is noise.
- `configureScenarioVelocities()` builds a fallback config (`:614–619`) for a `Map` that is
  guaranteed to contain every `Scenario` enum value; the `?? {…}` branch is unreachable.

### 7. Constructor ordering is fragile
`this.waveGenerator` is constructed (`:312`) with a callback that closes over
`this.waveformManager`, which is not assigned until `:322`. It works only because the callback is
invoked lazily during `step()`. Construct `waveformManager` and `dopplerCalculator` before
`waveGenerator` to make the dependency order explicit.

### 8. `MAX_AGE` wave cap interacts with reversal
Waves older than `WAVE.MAX_AGE` are dropped during forward stepping (`WaveGenerator.ts:94`).
Reversing time far enough can therefore land in a window where the on-screen waves no longer
match what was originally emitted. Worth documenting as a known limitation or bounding the
reverse range to the retained history.

---

### Suggested sequencing
1. Add Vitest + physics tests and wire into CI (#1) — protects everything that follows.
2. Localize the remaining accessibility strings (#2) — small, mechanical, convention-aligned.
3. Refactor time-reversal history (#3) and view-update coalescing (#4) under test cover.
4. Sweep the polish items (#5–#8).
</content>
</invoke>
