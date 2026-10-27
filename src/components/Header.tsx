import type { MouseEvent } from 'react';
import { profile } from '../data/content';
import { scrollToElement, scrollToTop } from '../lib/scroll';

const NAV = [
  { href: '#expertise', label: 'Expertise' },
  { href: '#history', label: 'History' },
  { href: '#projects', label: 'Projects' },
  { href: '#contact', label: 'Contact' },
];

// GSAP handles in-page scrolling (CSS smooth-scroll would fight the tour's scrolling)
function onNav(e: MouseEvent<HTMLAnchorElement>) {
  const id = e.currentTarget.getAttribute('href');
  if (!id?.startsWith('#')) return;
  e.preventDefault();
  if (id === '#top') return scrollToTop();
  const el = document.querySelector(id);
  if (el) scrollToElement(el, false);
}

export default function Header() {
  return (
    <header className="site-header">
      <a className="brand" href="#top" id="top" onClick={onNav}><i />{profile.name}</a>
      <nav aria-label="Sections">
        {NAV.map((n) => <a key={n.href} href={n.href} onClick={onNav}>{n.label}</a>)}
      </nav>
    </header>
  );
}
