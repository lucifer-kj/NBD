export function register() {
  if (
    typeof globalThis !== "undefined" &&
    globalThis.localStorage &&
    typeof globalThis.localStorage.getItem !== "function"
  ) {
    try {
      globalThis.localStorage.getItem = () => null;
      globalThis.localStorage.setItem = () => {};
      globalThis.localStorage.removeItem = () => {};
    } catch {
      // Ignore
    }
  }
}
