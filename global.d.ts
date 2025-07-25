declare global {
  interface Window {
    ethereum?: {
      request: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
      isMetaMask?: boolean;
      on?: (event: string, callback: (...args: unknown[]) => void) => void;
      removeListener?: (event: string, callback: (...args: unknown[]) => void) => void;
    } & EventTarget;
    grecaptcha: Grecaptcha;
  }
}

interface Grecaptcha {
  execute: (siteKey: string, options: { action: string }) => Promise<string>;
  render?: (element: string | HTMLElement, options: object) => number;
  reset?: (widgetId?: number) => void;
}

export {};