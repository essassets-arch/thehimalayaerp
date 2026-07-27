const listeners = {};

export const emit = (event, data) => {
  if (listeners[event]) {
    listeners[event].forEach(cb => {
      try {
        cb(data);
      } catch (err) {
        console.error(`Error in event listener for ${event}:`, err);
      }
    });
  }
};

export const on = (event, callback) => {
  if (!listeners[event]) {
    listeners[event] = [];
  }
  listeners[event].push(callback);
  
  // Return cleanup function to unsubscribe
  return () => {
    listeners[event] = listeners[event].filter(cb => cb !== callback);
  };
};
