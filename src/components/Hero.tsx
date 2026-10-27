import { lazy, Suspense, useRef } from 'react';
import { gsap } from 'gsap';
import { useGSAP } from '@gsap/react';
import { links, profile } from '../data/content';
import { prefersReducedMotion } from '../lib/motion';

// three.js is split into its own chunk and loads after the page text is on screen
const DeskScene = lazy(() => import('../three/DeskScene'));

export default function Hero() {
  const text = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    if (prefersReducedMotion()) return;
    gsap.from('.hero-text > *', { y: 26, duration: 0.9, ease: 'power3.out', stagger: 0.08 });
  }, { scope: text });

  return (
    <div className="hero" id="hero">
      <Suspense fallback={null}><DeskScene /></Suspense>
      <div className="hero-text" ref={text}>
        <div className="who-row">
          <img src={profile.photo} alt={profile.name} width={56} height={56} />
          <div><span className="label">{profile.title}</span><span className="label">{profile.location}</span></div>
        </div>
        <h1>{profile.name} <span>{profile.headline}</span></h1>
        <p className="lede">{profile.summary}</p>
        <div className="cta">
          <a className="btn primary" href="#projects">See my work</a>
          <a className="btn" href="#contact">Contact me</a>
        </div>
        <div className="links">
          {links.map((l) => <a key={l.href} href={l.href} target="_blank" rel="noopener">{l.label}</a>)}
        </div>
      </div>
    </div>
  );
}
