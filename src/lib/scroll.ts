import { gsap } from 'gsap';
import { ScrollToPlugin } from 'gsap/ScrollToPlugin';
import { prefersReducedMotion } from './motion';

gsap.registerPlugin(ScrollToPlugin);

/** Smoothly scroll to an element: centred on screen, or to its top with a small gap. */
export function scrollToElement(el: Element, center = true) {
  const r = el.getBoundingClientRect();
  const offsetY = center ? Math.max(80, (innerHeight - Math.min(r.height, innerHeight)) / 2) : 24;
  gsap.to(window, {
    duration: prefersReducedMotion() ? 0 : 1.1,
    ease: 'power2.inOut',
    scrollTo: { y: el, offsetY, autoKill: true },
  });
}

export function scrollToTop() {
  gsap.to(window, { duration: prefersReducedMotion() ? 0 : 1, ease: 'power2.inOut', scrollTo: { y: 0, autoKill: true } });
}
