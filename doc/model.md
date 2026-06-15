# Model - Doppler Effect

This document describes the model (the underlying physics, math, and behavior) for the simulation, in
terms appropriate for an educator. It is the companion to
[implementation-notes.md](./implementation-notes.md), which targets developers.

## Overview

The simulation demonstrates the **Doppler effect**: the change in observed frequency of a wave when the
source, the observer, or both are moving relative to the medium. A moving source emits sound waves that
bunch up ahead of its motion and spread out behind it, so an observer ahead hears a higher pitch and an
observer behind hears a lower pitch. Students can move both the source and a microphone (observer),
choose preset scenarios, and watch the emitted wavefronts, the measured frequency, and the resulting
waveform update in real time.

## Quantities and units

| Quantity | Symbol | Units | Notes |
|---|---|---|---|
| Wave (sound) speed | c | m/s | Speed of propagation in the medium (constant) |
| Source position / velocity | xₛ, vₛ | m, m/s | Set by dragging the source |
| Observer position / velocity | x_o, v_o | m, m/s | Set by dragging the microphone |
| Emitted frequency | f₀ | Hz | Frequency produced at the source |
| Observed frequency | f | Hz | Frequency measured at the observer |
| Time | t | s | Advances through the model `step(dt)` chain |

## Governing equations

The observed frequency for motion along the line connecting source and observer is

```
f = f₀ · (c + v_o) / (c − vₛ)
```

where velocities are taken as positive when source and observer move **toward** each other. For
arbitrary 2-D motion the model uses the components of each velocity projected onto the line of sight
between source and observer, so the shift depends only on the rate at which their separation changes.

Wavefronts are emitted at regular intervals from the source's position **at the moment of emission** and
then expand outward at speed `c`; the bunching and stretching of these circles is the geometric origin
of the frequency shift.

## Simplifications and assumptions

- Non-relativistic: speeds are small compared with light, and the classical Doppler formula is used.
- A single uniform, stationary medium with constant wave speed; no wind, temperature gradients, or
  reflections.
- Point source and point observer; no diffraction, attenuation with distance, or shock-wave (Mach-cone)
  rendering when a source exceeds the wave speed.

## References

- Any introductory physics text, "The Doppler Effect" (e.g. Serway & Jewett, *Physics for Scientists and
  Engineers*).
- Based on the PhET *Sound* / Doppler teaching model.
</content>
