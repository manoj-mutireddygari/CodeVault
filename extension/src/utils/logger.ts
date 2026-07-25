const enabled = import.meta.env.DEV;
export const logger = {
  debug: (event: string, context?: unknown) => { if (enabled) console.debug(`[CodeVault] ${event}`, context ?? ""); },
  warn: (event: string, context?: unknown) => console.warn(`[CodeVault] ${event}`, context ?? "")
};
