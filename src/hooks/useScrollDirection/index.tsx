import { useState, useEffect } from 'react';

type direction = 'up' | 'down';

const SCROLL_UP = 'up';
const SCROLL_DOWN = 'down';

const useScrollDirection = ({
  initialDirection,
  thresholdPixels,
  off,
}: {
  initialDirection: direction;
  thresholdPixels?: number;
  off?: boolean;
}) => {
  const [scrollDir, setScrollDir] = useState(initialDirection);

  useEffect(() => {
    const threshold = thresholdPixels || 0;
    let lastScrollY = window.pageYOffset;
    let ticking = false;

    const updateScrollDir = () => {
      const scrollY = window.pageYOffset;

      if (Math.abs(scrollY - lastScrollY) < threshold) {
        // We haven't exceeded the threshold
        ticking = false;
        return;
      }

      setScrollDir(scrollY > lastScrollY ? SCROLL_DOWN : SCROLL_UP);
      lastScrollY = scrollY > 0 ? scrollY : 0;
      ticking = false;
    };

    const onScroll = () => {
      console.log({ ticking });
      if (!ticking) {
        window.requestAnimationFrame(updateScrollDir);
        ticking = true;
      }
    };

    /**
     * Bind the scroll handler if `off` is set to false.
     * If `off` is set to true reset the scroll direction.
     */
    !off
      ? window.addEventListener('scroll', onScroll)
      : setScrollDir(initialDirection);

    return () => window.removeEventListener('scroll', onScroll);
  }, [initialDirection, thresholdPixels, off]);

  return scrollDir;
};

export { useScrollDirection };
