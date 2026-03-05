// Declare gtag on the Window interface for TypeScript
declare global {
    interface Window {
        gtag?: (...args: unknown[]) => void;
    }
}

/**
 * Safely sends a custom event to Google Analytics.
 * Only executes if window.gtag is available (usually only in production/client-side).
 *
 * @param eventName The name of the event (e.g., 'internship_view').
 * @param params Optional properties to send with the event.
 */
export const trackEvent = (eventName: string, params?: Record<string, unknown>) => {
    if (typeof window !== 'undefined' && window.gtag) {
        window.gtag('event', eventName, params);
    }
};
