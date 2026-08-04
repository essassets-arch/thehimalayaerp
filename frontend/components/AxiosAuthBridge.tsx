'use client';

import { useEffect } from 'react';
import axios from 'axios';
import { useAuthStore } from '@/store/authStore';

export function AxiosAuthBridge() {
  const accessToken = useAuthStore((state) => state.accessToken);

  useEffect(() => {
    const interceptor = axios.interceptors.request.use((config) => {
      const url = String(config.url || '');
      if (accessToken && (url.startsWith('/api/') || url.startsWith('/api/backend/') || url.startsWith('http'))) {
        config.headers.Authorization = `Bearer ${accessToken}`;
      }
      return config;
    });
    return () => axios.interceptors.request.eject(interceptor);
  }, [accessToken]);

  return null;
}

