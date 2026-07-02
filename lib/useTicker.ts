import { useEffect, useState } from 'react';

/**
 * Call once per screen and pass the value down. One interval for the whole
 * queue instead of one per row.
 */
export function useTicker() {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(interval);
  }, []);

  return now;
}
