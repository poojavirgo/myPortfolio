import { useRef } from 'react';
import { gsap } from 'gsap';
import { useGSAP } from '@gsap/react';
import { marquee } from '../data/content';
import { prefersReducedMotion } from '../lib/motion';

/** Endless tech strip. GSAP loops it and it slows down while hovered. */
export default function Marquee() {
  const track = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    if (prefersReducedMotion()) return;
    const tween = gsap.to(track.current, { xPercent: -50, duration: 48, ease: 'none', repeat: -1 });
    const el = track.current!;
    const slow = () => gsap.to(tween, { timeScale: 0.25, duration: 0.6 });
    const normal = () => gsap.to(tween, { timeScale: 1, duration: 0.6 });
    el.addEventListener('pointerenter', slow);
    el.addEventListener('pointerleave', normal);
    return () => { el.removeEventListener('pointerenter', slow); el.removeEventListener('pointerleave', normal); };
  }, { scope: track });

  return (
    <div className="marquee" aria-label="Technologies">
      <div className="track" ref={track}>
        {marquee.map((m) => <span key={m}>{m}</span>)}
        {marquee.map((m) => <span key={`${m}-2`} aria-hidden="true">{m}</span>)}
      </div>
    </div>
  );
}
