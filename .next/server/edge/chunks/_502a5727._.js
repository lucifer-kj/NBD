(globalThis.TURBOPACK = globalThis.TURBOPACK || []).push(["chunks/_502a5727._.js", {

"[project]/instrumentation.ts [instrumentation-edge] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { g: global, __dirname } = __turbopack_context__;
{
__turbopack_context__.s({
    "register": (()=>register)
});
function register() {
    if (typeof globalThis !== "undefined" && globalThis.localStorage && typeof globalThis.localStorage.getItem !== "function") {
        try {
            globalThis.localStorage.getItem = ()=>null;
            globalThis.localStorage.setItem = ()=>{};
            globalThis.localStorage.removeItem = ()=>{};
        } catch (e) {
        // Ignore
        }
    }
}
}}),
"[project]/edge-wrapper.js { MODULE => \"[project]/instrumentation.ts [instrumentation-edge] (ecmascript)\" } [instrumentation-edge] (ecmascript)": (function(__turbopack_context__) {

var { g: global, __dirname, m: module, e: exports } = __turbopack_context__;
{
self._ENTRIES ||= {};
const modProm = Promise.resolve().then(()=>__turbopack_context__.i("[project]/instrumentation.ts [instrumentation-edge] (ecmascript)"));
modProm.catch(()=>{});
self._ENTRIES["middleware_instrumentation"] = new Proxy(modProm, {
    get (modProm, name) {
        if (name === "then") {
            return (res, rej)=>modProm.then(res, rej);
        }
        let result = (...args)=>modProm.then((mod)=>(0, mod[name])(...args));
        result.then = (res, rej)=>modProm.then((mod)=>mod[name]).then(res, rej);
        return result;
    }
});
}}),
}]);

//# sourceMappingURL=_502a5727._.js.map