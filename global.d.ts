import type { MetaMaskInpageProvider } from "@metamask/providers";

declare global {
  interface Window {
    ethereum?: MetaMaskInpageProvider & {
      providers?: MetaMaskInpageProvider[];

      // --- Request overloads for strong typing ---
      request(args: { method: "eth_accounts" }): Promise<string[]>;
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
      request(args: {
        method: "wallet_watchAsset";
        params: {
          type: "ERC721";
          options: {
            address: `0x${string}`;
            tokenId: string;
          };
        };
      }): Promise<boolean>;
      request(args: {
        method: "wallet_revokePermissions";
        params: [{ eth_accounts: {} }];
      }): Promise<null>;
      request(args: { method: string; params?: unknown }): Promise<unknown>;
    };
    grecaptcha: Grecaptcha;
  }
}

interface Grecaptcha {
  execute: (siteKey: string, options: { action: string }) => Promise<string>;
  render?: (element: string | HTMLElement, options: object) => number;
  reset?: (widgetId?: number) => void;
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
