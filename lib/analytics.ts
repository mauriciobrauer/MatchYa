// Analytics helper para tracking de eventos personalizados

export type AnalyticsEvent = 
  | 'tournament_click'
  | 'product_click'
  | 'match_card_click'
  | 'tab_switch'
  | 'admin_login'
  | 'admin_action'
  | 'date_tab_switch'
  | 'match_type_tab_switch';

export interface AnalyticsEventData {
  event: AnalyticsEvent;
  properties?: Record<string, string | number | boolean>;
}

/**
 * Trackea un evento personalizado
 * Compatible con Vercel Analytics y Google Analytics si se agrega después
 */
export function trackEvent(event: AnalyticsEvent, properties?: Record<string, string | number | boolean>) {
  // Para Vercel Analytics (usando window.va)
  if (typeof window !== 'undefined' && (window as any).va) {
    (window as any).va('track', event, properties);
  }

  // Para Google Analytics 4 si se agrega después
  if (typeof window !== 'undefined' && (window as any).gtag) {
    (window as any).gtag('event', event, properties);
  }

  // Log en desarrollo
  if (process.env.NODE_ENV === 'development') {
    console.log('📊 Analytics Event:', event, properties);
  }
}

/**
 * Hook para tracking de clicks en elementos
 */
export function useAnalytics() {
  const trackClick = (event: AnalyticsEvent, properties?: Record<string, string | number | boolean>) => {
    trackEvent(event, properties);
  };

  return { trackClick };
}

