import { invoke } from "@tauri-apps/api/core";

/** invoke() that always rejects with a real Error (Tauri rejects with plain strings). */
export async function call<T>(command: string, args?: Record<string, unknown>): Promise<T> {
  try {
    return await invoke<T>(command, args);
  } catch (e) {
    throw new Error(
      typeof e === "string" ? e : e instanceof Error ? e.message : "Unknown native error",
    );
  }
}