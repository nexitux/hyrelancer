import { useState, useEffect, useRef } from 'react';

/**
 * Hook for counting animation with intersection observer
 * Starts animation when element comes into view
 * @param {number} target - The target number to count to
 * @param {number} duration - Animation duration in milliseconds
 * @returns {[number, React.RefObject]} - Current count and ref for the element
 */
export const useCountAnimationOnView = (target, duration = 2000) => {
  const [count, setCount] = useState(0);
  const [hasStarted, setHasStarted] = useState(false);
  const elementRef = useRef(null);
  const animationRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasStarted) {
          setHasStarted(true);
          
          // Start the animation
          const startTime = Date.now();
          const animate = () => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            // Easing function for smooth animation
            const easeOutQuart = 1 - Math.pow(1 - progress, 4);
            const currentCount = Math.floor(easeOutQuart * target);
            
            setCount(currentCount);

            if (progress < 1) {
              animationRef.current = requestAnimationFrame(animate);
            } else {
              setCount(target);
            }
          };
          
          animationRef.current = requestAnimationFrame(animate);
        }
      },
      {
        threshold: 0.1,
        rootMargin: '0px'
      }
    );

    const currentElement = elementRef.current;
    if (currentElement) {
      observer.observe(currentElement);
    }

    return () => {
      if (currentElement) {
        observer.unobserve(currentElement);
      }
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [target, duration, hasStarted]);

  return [count, elementRef];
};
