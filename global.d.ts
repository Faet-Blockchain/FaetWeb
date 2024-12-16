declare global {
    interface Window {
      grecaptcha: Grecaptcha;
    }
  }
  
  interface Grecaptcha {
    execute: (siteKey: string, options: { action: string }) => Promise<string>;
    render?: (element: string | HTMLElement, options: object) => number;
    reset?: (widgetId?: number) => void;
  }
  
  export {};
  