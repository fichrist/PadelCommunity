import { useState, useEffect } from 'react';

/**
 * Returns a key that increments whenever the Supabase session is restored
 * after the browser tab was inactive. Use this as a dependency in useEffect
 * to re-fetch data when the user returns to the tab.
 */
export function useSessionRefresh(): number {
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    const handle = () => setRefreshKey(k => k + 1);
    window.addEventListener('supabase-session-restored', handle);
    return () => window.removeEventListener('supabase-session-restored', handle);
  }, []);

  return refreshKey;
}
