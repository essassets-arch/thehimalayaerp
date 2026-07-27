export const ERPError = (message, code = 'INTERNAL_ERROR', meta = {}) => {
  return {
    success: false,
    error: {
      code,
      message,
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
