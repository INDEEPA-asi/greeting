import { useEffect, useState } from 'react';

const query = '(prefers-reduced-motion: reduce)';

export function useMotionPreference() {
  const [system, setSystem] = useState(() => window.matchMedia?.(query).matches ?? false);
  const [user, setUser] = useState(false);

  useEffect(() => {
    const media = window.matchMedia?.(query);
    if (!media) return;
    const sync = () => setSystem(media.matches);
    media.addEventListener?.('change', sync);
    return () => media.removeEventListener?.('change', sync);
  }, []);

  return { reduced: system || user, system, user, setUser };
}
