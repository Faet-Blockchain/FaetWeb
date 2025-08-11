import type { MetaMaskInpageProvider } from '@metamask/providers';

declare global {
  interface Window {
    ethereum?: MetaMaskInpageProvider;
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