/**
 * Simple analytics helper for tracking events in production.
 * Ready to be connected to Google Analytics, PostHog, Mixpanel, or Vercel Analytics.
 */
export const trackEvent = (eventName: string, eventData?: Record<string, any>) => {
  if (process.env.NODE_ENV === 'production') {
    // Example: window.gtag('event', eventName, eventData);
    // Example: window.posthog.capture(eventName, eventData);
    console.log(`[Analytics Tracked] ${eventName}`, eventData);
  } else {
    // Dev environment mock logging
    console.debug(`[Analytics Dev] ${eventName}`, eventData);
  }
};
