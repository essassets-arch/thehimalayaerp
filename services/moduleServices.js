// Wrappers for optional module services

const isModuleEnabled = (moduleName) => {
  const envVar = `VITE_ENABLE_${moduleName.toUpperCase()}`;
  return import.meta.env[envVar] !== 'false';
};

// Production Service Wrapper
export const productionService = {
  async getWorkOrders() {
    if (!isModuleEnabled('production')) {
      console.log('⏭️ Production module disabled');
      return [];
    }
    
    try {
      const response = await fetch('/api/production/work-orders', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await response.json();
      return data.data || [];
    } catch (error) {
      console.warn('⚠️ Production service error:', error.message);
      return [];
    }
  },

  async getMaterialRequests() {
    if (!isModuleEnabled('production')) {
      console.log('⏭️ Production module disabled');
      return [];
    }
    
    try {
      const response = await fetch('/api/production/material-requests', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await response.json();
      return data.data || [];
    } catch (error) {
      console.warn('⚠️ Production service error:', error.message);
      return [];
    }
  }
};

// Purchase Service Wrapper
export const purchaseService = {
  async getBOM() {
    if (!isModuleEnabled('purchase')) {
      console.log('⏭️ Purchase module disabled');
      return [];
    }
    
    try {
      const response = await fetch('/api/purchase/bom', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await response.json();
      return data.data || [];
    } catch (error) {
      console.warn('⚠️ Purchase service error:', error.message);
      return [];
    }
  }
};

// Notification Service Wrapper
export const notificationService = {
  async getNotifications() {
    if (!isModuleEnabled('notifications')) {
      console.log('⏭️ Notifications module disabled');
      return [];
    }
    
    try {
      const response = await fetch('/api/notifications', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await response.json();
      return data.data || [];
    } catch (error) {
      console.warn('⚠️ Notification service error:', error.message);
      return [];
    }
  }
};
