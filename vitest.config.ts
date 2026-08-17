import { defineConfig } from "vitest/config";

// Unit tests run in jsdom because SceneryStack's `dot` module expects browser
// globals (`self`, `window.location`). The bare "scenerystack" barrel is aliased
// to "scenerystack/dot": the physics under test only needs Vector2, and the full
// barrel eagerly initialises scenery/tambo (canvas + Web Audio), which jsdom
// cannot provide. The regex anchors on the exact specifier so subpath imports
// such as "scenerystack/dot" are left untouched.
export default defineConfig({
  resolve: {
    alias: [{ find: /^scenerystack$/, replacement: "scenerystack/dot" }],
  },
  test: {
    environment: "jsdom",
    include: ["tests/**/*.test.ts"],
    // --expose-gc lets us call global.gc() to force garbage collection
    execArgv: ["--expose-gc"],
    testTimeout: 30_000,
  },
});
