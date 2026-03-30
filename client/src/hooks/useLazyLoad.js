import { useEffect, useRef, useState } from 'react';

/**
 * Hook to defer loading of components until they're visible in the viewport
 * This improves initial page load performance by not fetching data for
 * below-the-fold content until needed
 */
export const useLazyLoad = (options = {}) => {
  const {
    threshold = 0.1,
    rootMargin = '100px',
    onVisible = () => {},
  } = options;

  const ref = useRef(null);
  const [isVisible, setIsVisible] = useState(false);
  const hasTriggered = useRef(false);

  useEffect(() => {
    if (!ref.current || hasTriggered.current) {
      return;
    }

    // Fallback for browsers without IntersectionObserver
    if (!('IntersectionObserver' in window)) {
      setIsVisible(true);
      hasTriggered.current = true;
      onVisible();
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !hasTriggered.current) {
            setIsVisible(true);
            hasTriggered.current = true;
            onVisible();
            observer.disconnect();
          }
        });
      },
      {
        threshold,
        rootMargin,
      }
    );

    observer.observe(ref.current);

    return () => {
      if (observer) {
        observer.disconnect();
      }
    };
  }, [threshold, rootMargin, onVisible]);

  return { ref, isVisible };
};

/**
 * Hook for deferred loading with a timeout fallback
 * If component doesn't become visible within timeout, load anyway
 */
export const useLazyLoadWithFallback = (options = {}) => {
  const {
    threshold = 0.1,
    rootMargin = '100px',
    fallbackTimeout = 3000,
    onVisible = () => {},
  } = options;

  const ref = useRef(null);
  const [isVisible, setIsVisible] = useState(false);
  const hasTriggered = useRef(false);
  const timeoutRef = useRef(null);

  useEffect(() => {
    if (!ref.current) {
      return;
    }

    const triggerVisible = () => {
      if (!hasTriggered.current) {
        setIsVisible(true);
        hasTriggered.current = true;
        onVisible();
      }
    };

    // Set fallback timeout
    timeoutRef.current = setTimeout(triggerVisible, fallbackTimeout);

    // Fallback for browsers without IntersectionObserver
    if (!('IntersectionObserver' in window)) {
      triggerVisible();
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !hasTriggered.current) {
            clearTimeout(timeoutRef.current);
            triggerVisible();
            observer.disconnect();
          }
        });
      },
      {
        threshold,
        rootMargin,
      }
    );

    observer.observe(ref.current);

    return () => {
      clearTimeout(timeoutRef.current);
      if (observer) {
        observer.disconnect();
      }
    };
  }, [threshold, rootMargin, fallbackTimeout, onVisible]);

  return { ref, isVisible };
};
