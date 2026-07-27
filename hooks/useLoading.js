import { useState, useCallback } from 'react';

export const useLoading = (initialState = false) => {
  const [isLoading, setIsLoading] = useState(initialState);
  const [error, setError] = useState(null);

  const withLoading = useCallback(async (fn, errorMessage = 'Operation failed') => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await fn();
      return result;
    } catch (err) {
      setError(err.message || errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const reset = useCallback(() => {
    setIsLoading(false);
    setError(null);
  }, []);

  return { 
    isLoading, 
    error, 
    setIsLoading, 
    setError, 
    withLoading,
    reset 
  };
};
