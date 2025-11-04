// Type definitions for Analytics
declare global {
  interface Window {
    va?: (action: string, event: string, properties?: Record<string, any>) => void;
    gtag?: (...args: any[]) => void;
  }
}

export {};

