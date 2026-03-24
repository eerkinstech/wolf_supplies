/**
 * Get environment variables in a way that works for both Vite and Next.js
 * Provides a compatibility layer for migrating from Vite to Next.js
 */

export const getApiUrl = () => {
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }

  if (typeof window !== 'undefined' && window.location?.origin) {
    return window.location.origin;
  }

  return 'https://wolfsupplies.co.uk';
};

export const getStripePublishableKey = () => {
  // For Next.js (Client):
  if (typeof window !== 'undefined' && import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY) {
    return import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;
  }

  // Fallback for Vite:
  if (typeof import.meta !== 'undefined' && import.meta?.env?.VITE_STRIPE_PUBLISHABLE_KEY) {
    return import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;
  }

  return '';
};

export const getEnv = (varName, defaultValue = '') => {
  // For Next.js - combine NEXT_PUBLIC_ prefix if not already present
  const nextVarName = varName.startsWith('NEXT_PUBLIC_') ? varName : `NEXT_PUBLIC_${varName}`;
  if (typeof window !== 'undefined' && import.meta.env[nextVarName]) {
    return import.meta.env[nextVarName];
  }

  // Fallback for Vite using VITE_ prefix
  const viteVarName = varName.startsWith('VITE_') ? varName : `VITE_${varName}`;
  if (typeof import.meta !== 'undefined' && import.meta?.env?.[viteVarName]) {
    return import.meta.env[viteVarName];
  }

  return defaultValue;
};
