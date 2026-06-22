import type { ObservableArray } from "scenerystack";
import { Vector2 } from "scenerystack";
import { beforeEach, describe, expect, it } from "vitest";
import type { Wave } from "./DopplerEffectModel";
import { WaveGenerator } from "./WaveGenerator";

/**
 * Minimal array-backed stand-in for the subset of ObservableArray that
 * WaveGenerator actually uses (add / length / get / remove / clear).
 */
function makeFakeWaveArray() {
  const items: Wave[] = [];
  const fake = {
    items,
    add: (wave: Wave) => {
      items.push(wave);
    },
    remove: (wave: Wave) => {
      const i = items.indexOf(wave);
      if (i >= 0) {
        items.splice(i, 1);
      }
    },
    get: (i: number) => items[i],
    clear: () => {
      items.length = 0;
    },
    get length() {
      return items.length;
    },
  };
  return fake as typeof fake & ObservableArray<Wave>;
}

describe("WaveGenerator.generateWaves", () => {
  let time: number;
  let waves: ReturnType<typeof makeFakeWaveArray>;
  let generator: WaveGenerator;
  const frequency = 10; // Hz -> wave interval 0.1 s

  beforeEach(() => {
    time = 0;
    waves = makeFakeWaveArray();
    generator = new WaveGenerator(
      waves,
      () => time,
      () => new Vector2(0, 0),
      () => new Vector2(0, 0),
      () => frequency,
      () => 343,
      () => 0,
    );
  });

  it("does not emit a wave before one full interval has elapsed", () => {
    time = 0.05; // < 0.1
    generator.generateWaves();
    expect(waves.length).toBe(0);
  });

  it("emits a wave once the interval is exceeded", () => {
    time = 0.11; // > 0.1
    generator.generateWaves();
    expect(waves.length).toBe(1);
    expect(waves.get(0)?.birthTime).toBeCloseTo(0.11, 6);
    expect(waves.get(0)?.sourceFrequency).toBe(frequency);
  });

  it("emits at most one wave per call and respects the cadence", () => {
    // Step time forward in small increments and emit on each frame.
    for (let i = 1; i <= 30; i++) {
      time = i * 0.0167; // ~60 fps, total ~0.5 s
      generator.generateWaves();
    }
    // Over ~0.5 s at 10 Hz we expect roughly 5 waves (one per 0.1 s interval).
    expect(waves.length).toBeGreaterThanOrEqual(4);
    expect(waves.length).toBeLessThanOrEqual(6);
  });

  it("clears all waves and emission state on reset", () => {
    time = 0.5;
    generator.generateWaves();
    expect(waves.length).toBeGreaterThan(0);
    generator.reset();
    expect(waves.length).toBe(0);
  });
});

describe("WaveGenerator.updateWaves", () => {
  it("expands wave radius by soundSpeed * dt", () => {
    let time = 0;
    const waves = makeFakeWaveArray();
    const soundSpeed = 343;
    const generator = new WaveGenerator(
      waves,
      () => time,
      () => new Vector2(0, 0),
      () => new Vector2(0, 0),
      () => 10,
      () => soundSpeed,
      () => 0,
    );

    time = 0.2;
    generator.generateWaves();
    expect(waves.length).toBe(1);

    generator.updateWaves(time, 0.1);
    expect(waves.get(0)?.radius).toBeCloseTo(soundSpeed * 0.1, 6);
  });
});
