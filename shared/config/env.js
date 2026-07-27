/**
 * Consolidated environment variable configuration for Himalaya ERP.
 * Prevents direct import.meta.env access in feature components.
 */

export const env = {
  ENABLE_PRODUCTION: import.meta.env.VITE_ENABLE_PRODUCTION !== 'false',
  ENABLE_PURCHASE: import.meta.env.VITE_ENABLE_PURCHASE !== 'false',
  ENABLE_NOTIFICATIONS: import.meta.env.VITE_ENABLE_NOTIFICATIONS !== 'false',
  IS_DEV: import.meta.env.DEV,
  IS_PROD: import.meta.env.PROD
};
