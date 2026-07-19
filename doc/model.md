# Model - Doppler Effect

This document describes the model (the underlying physics, math, and behavior) for the simulation,
in terms appropriate for an educator. It is the companion to
[implementation-notes.md](./implementation-notes.md), which targets developers.

## Overview

The simulation demonstrates the **classical Doppler effect** for sound in a uniform medium. A **source**
emits periodic circular **wavefronts** that expand at speed *c*; when the source or an **observer**
(microphone) moves, the spacing of wavefronts along the line of sight changes and the **observed
frequency** shifts. Students drag the source and observer, pick preset scenarios, enable a
microphone at an arbitrary point, and watch wavefronts, frequency readouts, and waveforms update in
real time.

The key ideas a student should take away:

- Motion **toward** the observer compresses wavefront spacing → **higher** observed pitch; motion
  **apart** stretches spacing → **lower** pitch.
- The shift depends on the velocity components **along the line of sight**, not total speed alone
  (perpendicular motion gives no first-order shift).
- Each emitted wavefront expands from the source position **at emission**; the geometric bunching of
  circles is the visual origin of the effect.
- The formula below is **non-relativistic** and assumes a stationary uniform medium.

## Quantities and units

Model space uses **metres** and **seconds**; the view maps to screen coordinates via a fixed scale.

| Quantity | Symbol | Units | Notes |
|---|---|---|---|
| Sound speed | c | m/s | Uniform medium (default 343 m/s; user adjustable) |
| Source position / velocity | **x**_s, **v**_s | m, m/s | Green source icon |
| Observer position / velocity | **x**_o, **v**_o | m, m/s | Purple observer icon |
| Microphone position | **x**_m | m | Optional listening point (can differ from observer) |
| Emitted frequency | f₀ | Hz | Tone at the source |
| Observed frequency | f | Hz | At observer from Doppler formula |
| Simulation time | t | s | Advances when play is on |
| Wave radius | r | m | Distance front has traveled since emission |
| Phase at emission | φ | rad | Tied to emitted waveform generator |

## Governing equations

**Classical Doppler shift** along the unit vector **d**̂ from the wave origin (at emission) to the
observer:

```
f = f₀ · (c − v_o,∥) / (c − v_s,∥)
```

where v_s,∥ = **v**_s · **d**̂ and v_o,∥ = **v**_o · **d**̂ (positive when motion is **along** **d**̂
in the direction from source toward observer). This matches the implementation in `DopplerCalculator`
(with the sim's sign convention for approach/recede scenarios).

**Wave emission.** New fronts spawn every Δt = 1/f₀ at the **current** source position, storing
position, birth time, source velocity at emission, f₀, and phase. Existing fronts expand:

```
r(t) = ∫ c dt   (discrete steps: r ← r + c · Δt)
```

**Arrival at observer.** A front has reached the observer when r ≥ |**x**_o − **x**_emit|; arrival
time is reconstructed from radius overshoot and current *c* (robust to mid-flight speed changes).

**Observed waveform.** The waveform display uses the Doppler-shifted frequency for the most recently
arrived front; phase continuity follows φ at arrival plus 2πfΔt since arrival (stationary-frequency
branch avoids double-counting when the observer also moves).

**Microphone detection.** A separate point can detect front **crossings** (radius sweeps past distance
during a step) for audible clicks, independent of the main observer readout.

## Simplifications and assumptions

- **Non-relativistic** classical acoustics; no electromagnetic Doppler or relativistic corrections.
- **Single uniform medium** with constant *c* (no wind, temperature gradients, or attenuation with distance).
- **Point source** and **point observer**; no directivity, diffraction, or standing-room reverberation.
- No **shock-wave (Mach cone)** rendering when |**v**_s| > *c*; formula still evaluated but physics is
  not modeled in that regime.
- Time reversal restores source/observer kinematics and rebuilds wave radii from history — approximate
  if *c* changed during a wave's lifetime.

## References

- R. Serway & J. Jewett, *Physics for Scientists and Engineers* — Doppler effect for sound.
- Any introductory waves text: moving source vs. moving observer diagrams.
- PhET *Sound* / Doppler teaching models (pedagogical lineage).
