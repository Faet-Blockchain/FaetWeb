declare global {
  interface Window {
    ethereum?: {
      request(args: {
        method: "wallet_watchAsset";
        params: {
          type: "ERC20";
          options: {
            address: `0x${string}`;
            symbol: string;
            decimals: number;
            image?: string;
          };
        };
      }): Promise<boolean>;
      request(args: { method: string; params?: unknown }): Promise<unknown>;

      on?: (event: string, handler: (...args: unknown[]) => void) => void;
      removeListener?: (
        event: string,
        handler: (...args: unknown[]) => void,
      ) => void;
      providers?: EthereumProvider[];
      isMetaMask?: boolean;
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
  request(args: { method: string; params?: unknown }): Promise<unknown>;
}

// Chart component types
interface TooltipFormatterProps {
  value: number;
  name: string;
  payload: {
    percentage?: number;
    [key: string]: unknown;
  };
}

interface TooltipProps {
  payload?: {
    percentage?: number;
    [key: string]: unknown;
  };
}

// Recharts ValueType can be string, number, or arrays of these
type ValueType = string | number | (string | number)[];

interface ChartDataItem {
  name: string;
  value: number;
  fill: string;
  percentage: number;
}

interface LabelProps {
  percent?: number;
}

// Network configuration types
interface NetworkConfig {
  name: string;
  contracts: {
    token: string;
    staking: string;
  };
}

export {};
