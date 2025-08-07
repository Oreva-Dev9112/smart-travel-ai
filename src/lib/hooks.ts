'use client';

import { useState, useEffect, useRef, useCallback, KeyboardEvent, RefObject } from 'react';

/**
 * Hook for handling keyboard navigation
 */
export function useKeyboardNavigation(
  refs: RefObject<HTMLElement>[],
  options: {
    horizontal?: boolean;
    vertical?: boolean;
    loop?: boolean;
    onEscape?: () => void;
  } = {}
) {
  const { horizontal = true, vertical = false, loop = true, onEscape } = options;
  const [currentIndex, setCurrentIndex] = useState(0);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      const key = e.key;
      let nextIndex = currentIndex;

      if (horizontal && key === 'ArrowRight') {
        nextIndex = loop
          ? (currentIndex + 1) % refs.length
          : Math.min(currentIndex + 1, refs.length - 1);
        e.preventDefault();
      } else if (horizontal && key === 'ArrowLeft') {
        nextIndex = loop
          ? (currentIndex - 1 + refs.length) % refs.length
          : Math.max(currentIndex - 1, 0);
        e.preventDefault();
      } else if (vertical && key === 'ArrowDown') {
        nextIndex = loop
          ? (currentIndex + 1) % refs.length
          : Math.min(currentIndex + 1, refs.length - 1);
        e.preventDefault();
      } else if (vertical && key === 'ArrowUp') {
        nextIndex = loop
          ? (currentIndex - 1 + refs.length) % refs.length
          : Math.max(currentIndex - 1, 0);
        e.preventDefault();
      } else if (key === 'Home') {
        nextIndex = 0;
        e.preventDefault();
      } else if (key === 'End') {
        nextIndex = refs.length - 1;
        e.preventDefault();
      } else if (key === 'Escape' && onEscape) {
        onEscape();
        e.preventDefault();
      }

      if (nextIndex !== currentIndex) {
        setCurrentIndex(nextIndex);
        refs[nextIndex]?.current?.focus();
      }
    },
    [currentIndex, refs, horizontal, vertical, loop, onEscape]
  );

  return {
    currentIndex,
    setCurrentIndex,
    handleKeyDown,
  };
}

/**
 * Hook to determine if an element is in the viewport
 */
export function useInView(ref: RefObject<HTMLElement>, options = {}) {
  const [isInView, setIsInView] = useState(false);
  
  useEffect(() => {
    if (!ref.current) return;
    
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsInView(entry.isIntersecting);
      },
      options
    );
    
    observer.observe(ref.current);
    
    return () => {
      observer.disconnect();
    };
  }, [ref, options]);
  
  return isInView;
}

/**
 * Hook for handling focus trap within a container
 */
export function useFocusTrap(containerRef: RefObject<HTMLElement>, isActive = true) {
  useEffect(() => {
    if (!isActive || !containerRef.current) return;
    
    const container = containerRef.current;
    const focusableElements = container.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    
    const firstElement = focusableElements[0] as HTMLElement;
    const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;
    
    function handleTabKey(e: KeyboardEvent) {
      if (e.key !== 'Tab') return;
      
      if (e.shiftKey) {
        // If shift+tab and on first element, move to last
        if (document.activeElement === firstElement) {
          e.preventDefault();
          lastElement.focus();
        }
      } else {
        // If tab and on last element, move to first
        if (document.activeElement === lastElement) {
          e.preventDefault();
          firstElement.focus();
        }
      }
    }
    
    // Focus first element when trap activates
    firstElement?.focus();
    
    // Add event listener for tab navigation
    document.addEventListener('keydown', handleTabKey as any);
    
    return () => {
      document.removeEventListener('keydown', handleTabKey as any);
    };
  }, [containerRef, isActive]);
}

/**
 * Hook for handling mobile touch gestures
 */
export function useSwipeGesture(
  ref: RefObject<HTMLElement>,
  {
    onSwipeLeft,
    onSwipeRight,
    onSwipeUp,
    onSwipeDown,
    threshold = 50,
  }: {
    onSwipeLeft?: () => void;
    onSwipeRight?: () => void;
    onSwipeUp?: () => void;
    onSwipeDown?: () => void;
    threshold?: number;
  } = {}
) {
  const touchStart = useRef({ x: 0, y: 0 });
  const touchEnd = useRef({ x: 0, y: 0 });
  
  const onTouchStart = useCallback((e: TouchEvent) => {
    touchStart.current = {
      x: e.targetTouches[0].clientX,
      y: e.targetTouches[0].clientY,
    };
    touchEnd.current = { x: 0, y: 0 };
  }, []);
  
  const onTouchMove = useCallback((e: TouchEvent) => {
    touchEnd.current = {
      x: e.targetTouches[0].clientX,
      y: e.targetTouches[0].clientY,
    };
  }, []);
  
  const onTouchEnd = useCallback(() => {
    const distX = touchStart.current.x - touchEnd.current.x;
    const distY = touchStart.current.y - touchEnd.current.y;
    
    if (Math.abs(distX) > Math.abs(distY)) {
      // Horizontal swipe
      if (Math.abs(distX) > threshold) {
        if (distX > 0 && onSwipeLeft) {
          onSwipeLeft();
        } else if (distX < 0 && onSwipeRight) {
          onSwipeRight();
        }
      }
    } else {
      // Vertical swipe
      if (Math.abs(distY) > threshold) {
        if (distY > 0 && onSwipeUp) {
          onSwipeUp();
        } else if (distY < 0 && onSwipeDown) {
          onSwipeDown();
        }
      }
    }
  }, [onSwipeLeft, onSwipeRight, onSwipeUp, onSwipeDown, threshold]);
  
  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    
    element.addEventListener('touchstart', onTouchStart as any);
    element.addEventListener('touchmove', onTouchMove as any);
    element.addEventListener('touchend', onTouchEnd as any);
    
    return () => {
      element.removeEventListener('touchstart', onTouchStart as any);
      element.removeEventListener('touchmove', onTouchMove as any);
      element.removeEventListener('touchend', onTouchEnd as any);
    };
  }, [ref, onTouchStart, onTouchMove, onTouchEnd]);
}

/**
 * Hook for media queries
 */
export function useMediaQuery(query: string) {
  const [matches, setMatches] = useState(false);
  
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const media = window.matchMedia(query);
    const listener = () => setMatches(media.matches);
    
    // Set initial value
    setMatches(media.matches);
    
    // Listen for changes
    media.addEventListener('change', listener);
    
    return () => {
      media.removeEventListener('change', listener);
    };
  }, [query]);
  
  return matches;
} 