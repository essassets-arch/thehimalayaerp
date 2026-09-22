export const ERPError = (message, code = 'INTERNAL_ERROR', meta = {}) => {
  const safeMessage = typeof message === 'string'
    ? message
    : (Array.isArray(message)
        ? message.join('; ')
        : (message?.message || (typeof message === 'object' ? JSON.stringify(message) : String(message || 'Operation failed'))));
  return {
    success: false,
    error: {
      code,
      message: safeMessage,
      meta
    }
  };
};

export const ERPSuccess = (data = null, meta = {}) => {
  return {
    success: true,
    data,
    meta
  };
};
