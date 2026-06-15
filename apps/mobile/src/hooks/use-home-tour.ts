import { useEffect } from 'react';
import { useCopilot } from 'react-native-copilot';
import { useMMKVBoolean } from 'react-native-mmkv';

import { storage } from '@/lib/storage';

const HAS_SEEN_TOUR = 'HAS_SEEN_TOUR';

/**
 * Starts the spotlight tour once, the first time the Home screen renders for a
 * user who hasn't seen it. Marks it seen on start so it never auto-runs again
 * (the welcome intro screen already ran before this).
 */
export function useHomeTour() {
  const { start } = useCopilot();
  const [seen, setSeen] = useMMKVBoolean(HAS_SEEN_TOUR, storage);

  useEffect(() => {
    if (seen)
      return;
    const timer = setTimeout(() => {
      setSeen(true);
      start();
    }, 800);
    return () => clearTimeout(timer);
  }, [seen, setSeen, start]);
}
