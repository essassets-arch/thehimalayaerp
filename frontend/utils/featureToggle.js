export const FEATURES = {
  notifications: {
    enabled: import.meta.env.VITE_ENABLE_NOTIFICATIONS !== 'false',
    description: 'Real-time notifications via SSE'
  },
  production: {
    enabled: import.meta.env.VITE_ENABLE_PRODUCTION !== 'false',
    description: 'Production module (work orders, material requests)'
  },
  purchase: {
    enabled: import.meta.env.VITE_ENABLE_PURCHASE !== 'false',
    description: 'Purchase module (BOM, procurement)'
  }
};

export const isFeatureEnabled = (featureName) => {
  return FEATURES[featureName]?.enabled || false;
};

export const getFeatureStatus = () => {
  const status = {};
  Object.entries(FEATURES).forEach(([key, value]) => {
    status[key] = {
      enabled: value.enabled,
      status: value.enabled ? '✅ Active' : '❌ Disabled'
    };
  });
  return status;
};

// Log feature status on startup
console.log('🔧 Feature Status:');
console.table(getFeatureStatus());
