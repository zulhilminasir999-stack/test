import React from 'react';
import Lenis from 'lenis';
import 'lenis/dist/lenis.css';

export function SmoothScroll({ children }: { children: React.ReactNode }) {
  const lenisRef = React.useRef<Lenis | null>(null);
  const rafIdRef = React.useRef<number | null>(null);

  React.useEffect(() => {
    // Initialize Lenis
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: true,
      wheelMultiplier: 1.1,
      touchMultiplier: 2,
    });

    lenisRef.current = lenis;
    (window as unknown as { lenis: Lenis }).lenis = lenis;

    // RAF loop
    const raf = (time: number) => {
      lenis.raf(time);
      rafIdRef.current = requestAnimationFrame(raf);
    };

    rafIdRef.current = requestAnimationFrame(raf);

    return () => {
      if (lenisRef.current) {
        lenisRef.current.destroy();
      }
      if (rafIdRef.current) {
        cancelAnimationFrame(rafIdRef.current);
      }
    };
  }, []);

  return <>{children}</>;
}

