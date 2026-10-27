import { useEffect, useRef } from 'react';
import { prefersReducedMotion } from '../lib/motion';

/** A soft dot that trails the mouse. Mouse users only; animates only while catching up. */
export default function Cursor() {
  const dot = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = dot.current!;
    if (!matchMedia('(pointer: fine)').matches || prefersReducedMotion()) { el.hidden = true; return; }
    let cx = -50, cy = -50, tx = -50, ty = -50, raf = 0, hot = false;
    const follow = () => {
      cx += (tx - cx) * 0.2; cy += (ty - cy) * 0.2;
      el.style.transform = `translate(${cx}px, ${cy}px) translate(-50%, -50%)`;
      raf = Math.abs(tx - cx) + Math.abs(ty - cy) > 0.4 ? requestAnimationFrame(follow) : 0;
    };
    const onMove = (e: PointerEvent) => {
      tx = e.clientX; ty = e.clientY;
      const h = !!(e.target as Element).closest?.('a,button,label');
      if (h !== hot) { hot = h; el.classList.toggle('big', h); }
      if (!raf) raf = requestAnimationFrame(follow);
    };
    addEventListener('pointermove', onMove, { passive: true });
    return () => { removeEventListener('pointermove', onMove); cancelAnimationFrame(raf); };
  }, []);

  return <div className="cursor" ref={dot} aria-hidden="true" />;
}
