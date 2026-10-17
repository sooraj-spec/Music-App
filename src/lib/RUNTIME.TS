/** True when running inside the Tauri window (false in a plain browser). */
export const isTauriRuntime = (): boolean =>
  typeof window !== "undefined" && "__TAURI_INTERNALS__" in window;