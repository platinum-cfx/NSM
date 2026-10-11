// alt:V client entry for the fivem-client resource.
// Bundled by tools/build-client-bundle.mjs (esbuild) into client.js with:
//   - alt-client / natives left external (resolved by the alt:V client)
//   - gen/payload.gen.js   (this server's FiveM client scripts, transformed)
//   - gen/prelude.gen.js   (client-prelude.lua as a JS string)
import * as alt from 'alt-client';
import * as natives from 'natives';
import { createFiveMClientRuntime } from './core.mjs';
import { createFengariVM } from './vm-fengari.mjs';
import { PAYLOAD } from './gen/payload.gen.js';
import { PRELUDE_SRC } from './gen/prelude.gen.js';

// fengari (pure-JS Lua 5.3) is the baseline VM: it runs in any JS sandbox.
// If the client's V8 turns out to permit WebAssembly + the wasmoon emscripten
// environment, vm-wasmoon.mjs can be swapped in for Lua 5.4 + better perf
// (see docs/CLIENT_COMPATIBILITY.md — needs on-device verification).
const vm = createFengariVM();

const rt = createFiveMClientRuntime({
  vm,
  alt,
  natives,
  payload: PAYLOAD,
  preludeSrc: PRELUDE_SRC,
  config: { convars: PAYLOAD.convars || {} },
  log: (...a) => alt.log(...a),
  logError: (...a) => alt.logError(...a),
});

rt.boot().catch((e) => {
  alt.logError('[fivem-client] boot failed:', (e && e.message) || e);
});
