import { useState, useCallback } from 'react';

const FADE_DURATION = 150;

export const useFadeAnimation = () => {
  const [isFading, setIsFading] = useState(false);

  const triggerFade = useCallback((callback: () => void) => {
    setIsFading(true);
    setTimeout(() => {
      callback();
      setIsFading(false);
    }, FADE_DURATION);
  }, []);

  return {
    isFading,
    triggerFade,
    fadeDuration: FADE_DURATION,
  };
};
