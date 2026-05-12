const CHUNK_PUBLIC_PATH = "server/instrumentation.js";
const runtime = require("./chunks/[turbopack]_runtime.js");
runtime.loadChunk("server/chunks/instrumentation_ts_ca8ae59b._.js");
runtime.getOrInstantiateRuntimeModule("[project]/instrumentation.ts [instrumentation] (ecmascript)", CHUNK_PUBLIC_PATH);
module.exports = runtime.getOrInstantiateRuntimeModule("[project]/instrumentation.ts [instrumentation] (ecmascript)", CHUNK_PUBLIC_PATH).exports;
