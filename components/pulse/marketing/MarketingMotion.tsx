'use client';

import { useEffect, useRef, type ReactNode } from 'react';

/** All animation is optional, reversible, and independent of the cadence demonstration. */
export function MarketingMotion({ children }: { children: ReactNode }) {
  const root = useRef<HTMLDivElement>(null);
  const initialAnchorRestored = useRef(false);
  useEffect(() => {
    let disposed = false;
    let anchorFrame = 0;
    const requestedHash = window.location.hash;
    let revert: (() => void) | undefined;
    void Promise.all([import('gsap'), import('gsap/ScrollTrigger')]).then(async ([{ gsap }, { ScrollTrigger }]) => {
      await document.fonts.ready;
      if (disposed || !root.current) return;
      gsap.registerPlugin(ScrollTrigger);
      const media = gsap.matchMedia(root);
      media.add({ motion: '(prefers-reduced-motion: no-preference)', desktop: '(min-width: 1000px)' }, (match) => {
        if (!match.conditions?.motion) return;
        {
          gsap.from('.hero-line', { yPercent: 104, duration: 1.4, stagger: .065, ease: 'power3.out', clearProps: 'all' });
          gsap.from('.hero-cover', { y: 30, opacity: 0, duration: 1.1, ease: 'power2.out', clearProps: 'all' });
          gsap.to('.hero-cover .photo-heat', { clipPath: 'polygon(0 0,100% 0,100% 18%,0 18%,0 44%,100% 44%,100% 100%,0 100%)', duration: 4, ease: 'sine.inOut' });
          gsap.to('.hero-aura', { xPercent: 3, scale: 1.05, duration: 4, ease: 'sine.inOut' });
          gsap.to('.hero-track', { yPercent: 14, rotation: -3, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: .7 } });
          gsap.to('.mirage-echo', { y: 80, opacity: 0, ease: 'none', scrollTrigger: { trigger: '.mirage', start: 'top bottom', end: '55% top', scrub: .7 } });
          root.current?.querySelectorAll<HTMLElement>('[data-reveal]').forEach((element) => {
            gsap.from(element, { y: 30, opacity: 0, duration: .9, ease: 'power2.out', scrollTrigger: { trigger: element, start: 'top 94%', once: true }, clearProps: 'all' });
          });
          if (match.conditions?.desktop) {
            const stage = root.current?.querySelector<HTMLElement>('.lineup-stage');
            const grid = root.current?.querySelector<HTMLElement>('.study-grid');
            const posters = Array.from(root.current?.querySelectorAll<HTMLElement>('.study-poster') ?? []);
            if (stage && grid) {
              gsap.from(posters, { x: (_, element: HTMLElement) => grid.clientWidth / 2 - element.offsetLeft - element.offsetWidth / 2,
                y: (_, element: HTMLElement) => grid.clientHeight / 2 - element.offsetTop - element.offsetHeight / 2,
                scale: .65, rotation: (index) => [-9, 7, -5, 10, -3, 4][index], stagger: .06, ease: 'power2.inOut',
                scrollTrigger: { trigger: stage, start: 'top 64px', end: '+=1050', pin: true, scrub: .8, invalidateOnRefresh: true } });
            }
            const strip = root.current?.querySelector<HTMLElement>('.gallery-strip');
            const gallery = root.current?.querySelector<HTMLElement>('.gallery-stage');
            if (strip && gallery) {
              gsap.set(gallery, { attr: { 'data-scroll-gallery': 'true' } });
              const photos = Array.from(strip.querySelectorAll<HTMLElement>('.thermal-photo'));
              const updateHeat = () => photos.forEach(photo => { const rect = photo.getBoundingClientRect(); photo.style.setProperty('--heat-cut', `${Math.max(0, Math.min(100, (window.innerWidth / 2 - rect.left) / rect.width * 100))}%`); });
              gsap.set(strip, { x: () => window.innerWidth * .56 });
              gsap.to(strip, { x: () => -(strip.scrollWidth - window.innerWidth * .44), ease: 'none', onUpdate: updateHeat,
                scrollTrigger: { trigger: gallery, start: 'top 64px', end: () => `+=${strip.scrollWidth}`, pin: true, scrub: .7, invalidateOnRefresh: true } });
            }
          }
        }
        return () => { root.current?.querySelector<HTMLElement>('.gallery-strip')?.style.removeProperty('transform'); root.current?.querySelector('.gallery-stage')?.removeAttribute('data-scroll-gallery'); root.current?.querySelectorAll<HTMLElement>('.thermal-photo').forEach(photo => photo.style.removeProperty('--heat-cut')); };
      });
      revert = () => media.revert();
      ScrollTrigger.refresh();
      // Pin spacers change document offsets during hydration. Restore a direct
      // section link once, after that layout has settled, without hijacking later scrolls.
      if (!initialAnchorRestored.current) {
        initialAnchorRestored.current = true;
        anchorFrame = requestAnimationFrame(() => {
          if (!disposed && requestedHash && window.location.hash === requestedHash) {
            document.getElementById(requestedHash.slice(1))?.scrollIntoView({ block: 'start', behavior: 'instant' });
          }
        });
      }
    }).catch(() => { /* Keep the complete server-rendered page usable if animation cannot load. */ });
    return () => { disposed = true; cancelAnimationFrame(anchorFrame); revert?.(); };
  }, []);
  return <div ref={root}>{children}</div>;
}
