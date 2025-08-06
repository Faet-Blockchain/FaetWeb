declare global {
  interface Window {
    ethereum?: {
      request: (args: {
        method: string;
        params?: unknown[];
      }) => Promise<unknown>;
      on?: (event: string, handler: (...args: unknown[]) => void) => void;
      removeListener?: (
        event: string,
        handler: (...args: unknown[]) => void,
      ) => void;
    } & EventTarget;
    grecaptcha: Grecaptcha;
  }
}

interface Grecaptcha {
  execute: (siteKey: string, options: { action: string }) => Promise<string>;
  render?: (element: string | HTMLElement, options: object) => number;
  reset?: (widgetId?: number) => void;
}

interface EthereumProvider {
  isMetaMask?: boolean;
  request: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
}

interface EthereumWindow extends Window {
  ethereum?: EthereumProvider & {
    providers?: EthereumProvider[];
  };
}

declare const window: EthereumWindow;

export {};
