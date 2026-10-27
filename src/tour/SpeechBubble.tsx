import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { tour } from './store';
import { clamp, prefersReducedMotion } from '../lib/motion';

/**
 * The speech bubble follows whichever avatar is talking. It updates the DOM directly in a
 * rAF loop (position via transform, text as it types) so it never causes React re-renders.
 */
export default function SpeechBubble() {
  const el = useRef<HTMLDivElement>(null);
  const inner = useRef<HTMLDivElement>(null);
  const textEl = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    const bubble = el.current!, p = textEl.current!;
    const reduce = prefersReducedMotion();
    let raf = 0, shownText = '', shownChars = -1, width = 0, visible = false;

    const tick = () => {
      raf = requestAnimationFrame(tick);
      const b = tour.bubble;
      if (b.visible !== visible) { visible = b.visible; bubble.hidden = !visible; }
      if (!visible) { shownText = ''; return; }

      if (b.text !== shownText) {
        // measure the full line once and lock the width, so typing doesn't reflow it
        shownText = b.text;
        bubble.style.width = '';
        p.textContent = b.text;
        width = bubble.offsetWidth;
        bubble.style.width = `${width}px`;
        shownChars = -1;
        if (!reduce) gsap.fromTo(inner.current, { scale: 0.85, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.35, ease: 'back.out(2)' });
      }
      const chars = Math.floor(b.typed);
      if (chars !== shownChars) { shownChars = chars; p.textContent = b.text.slice(0, chars); }

      const onScreen = b.y > 70 && b.y < innerHeight + 40;
      bubble.style.visibility = onScreen ? 'visible' : 'hidden';
      const x = clamp(b.x, width / 2 + 12, innerWidth - width / 2 - 12);
      bubble.style.transform = `translate(${x}px, ${b.y - 12}px) translate(-50%, -100%)`;
      bubble.style.setProperty('--tail', `${clamp(b.x - x, -width / 2 + 22, width / 2 - 22)}px`);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <div ref={el} className="bubble" hidden aria-live="polite">
      <div ref={inner} className="bubble-inner">
        <span className="who">Pooja</span>
        <p ref={textEl} />
      </div>
    </div>
  );
}
