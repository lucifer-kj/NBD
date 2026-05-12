module.exports = {

"[project]/instrumentation.ts [instrumentation] (ecmascript)": ((__turbopack_context__) => {
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

};

//# sourceMappingURL=instrumentation_ts_ca8ae59b._.js.map