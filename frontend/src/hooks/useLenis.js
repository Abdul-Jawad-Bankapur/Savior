import { useEffect, useRef, useState, useCallback } from 'react';
import { gsap } from '../lib/gsap';

export function useLenis() {
  const lenisRef = useRef(null);

  useEffect(() => {
    let lenis;
    let rafId;

    const initLenis = async () => {
      const { Lenis } = await import('lenis');

      lenis = new Lenis({
        duration: 1.2,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        orientation: 'vertical',
        smoothWheel: true,
      });

      lenisRef.current = lenis;

      const { ScrollTrigger } = await import('gsap/ScrollTrigger');

      lenis.on('scroll', ScrollTrigger.update);
      gsap.ticker.add((time) => lenis.raf(time * 1000));
      gsap.ticker.lagSmoothing(0);

      function raf(time) {
        lenis.raf(time);
        rafId = requestAnimationFrame(raf);
      }
      rafId = requestAnimationFrame(raf);
    };

    initLenis();

    return () => {
      if (rafId) cancelAnimationFrame(rafId);
      if (lenis) lenis.destroy();
    };
  }, []);

  return lenisRef;
}
