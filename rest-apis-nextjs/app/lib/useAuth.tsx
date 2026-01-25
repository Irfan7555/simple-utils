'use client';

import { useEffect, useState } from 'react';
import { refreshAuth } from './api';

export function useAuth() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        await refreshAuth();
        setIsLoggedIn(true);
      } catch (e) {
        setIsLoggedIn(false);
      } finally {
        setIsLoading(false);
      }
    };
    checkAuth();
  }, []);

  return { isLoggedIn, isLoading };
}
