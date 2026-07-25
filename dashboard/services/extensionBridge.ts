// CodeVault Dashboard-Extension Message Bridge Client
type BridgeResponse = {
  source: "codevault-extension";
  id: string;
  payload?: any;
  error?: string;
};

const pendingPromises = new Map<
  string,
  {
    resolve: (value: any) => void;
    reject: (reason: any) => void;
    timeoutId: ReturnType<typeof setTimeout>;
  }
>();

let listenerAdded = false;

function setupListener() {
  if (typeof window === "undefined" || listenerAdded) return;

  window.addEventListener("message", (event) => {
    // Only accept messages from the same window
    if (event.source !== window) return;

    const data = event.data as BridgeResponse | { source: string } | null;
    if (!data || data.source !== "codevault-extension") return;

    // Handle incoming response
    const res = data as BridgeResponse;
    const pending = pendingPromises.get(res.id);
    if (pending) {
      clearTimeout(pending.timeoutId);
      pendingPromises.delete(res.id);

      if (res.error) {
        pending.reject(new Error(res.error));
      } else {
        pending.resolve(res.payload);
      }
    }
  });

  listenerAdded = true;
}

export const extensionBridge = {
  /**
   * Sends a message to the CodeVault extension and returns a Promise with the response.
   * Rejects if the extension is not installed, deactivated, or times out.
   */
  async send<T>(type: string, payload?: any): Promise<T> {
    if (typeof window === "undefined") {
      throw new Error("Bridge can only be used in client-side environment");
    }

    setupListener();

    return new Promise<T>((resolve, reject) => {
      const id = Math.random().toString(36).substring(2, 11);
      
      // 1.5s timeout. If extension doesn't respond, it's not active or installed.
      const timeoutId = setTimeout(() => {
        pendingPromises.delete(id);
        reject(new Error("Extension connection timed out. Make sure the CodeVault extension is installed and active."));
      }, 1500);

      pendingPromises.set(id, { resolve, reject, timeoutId });

      window.postMessage(
        {
          source: "codevault-dashboard",
          id,
          type,
          payload
        },
        "*"
      );
    });
  },

  /**
   * Pings the extension to verify if it is installed and running.
   */
  async ping(): Promise<boolean> {
    try {
      const res = await this.send<{ ok: boolean }>("PING");
      return res?.ok === true;
    } catch {
      return false;
    }
  }
};
