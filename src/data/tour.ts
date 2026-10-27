// What the avatar says and where she walks.
// el: CSS selector to stand by · ax/ay: point on that element (0..1) · dx/dy: pixel nudge
// then: 'exit-hero' = stand up and leave the desk, 'exit-overlay' = walk off screen and end the tour

export interface TourStep {
  text: string;
  hero?: boolean;
  el?: string;
  ax?: number; ay?: number; dx?: number; dy?: number;
  wave?: boolean;
  then?: 'exit-hero' | 'exit-overlay';
}

/** Path to your own rigged avatar, e.g. `${import.meta.env.BASE_URL}models/pooja.glb`. Empty = built-in avatar. */
export const AVATAR_URL = '';

export const HERO_LINES: TourStep[] = [
  { wave: true, text: "Hi, I'm Pooja! I'm a senior software engineer here in Oslo." },
  { text: "For 9+ years I've built production apps with React, TypeScript, Next.js and Node.js." },
  { text: "Come with me, I'll show you what I do.", then: 'exit-hero' },
];

export const TOUR: TourStep[] = [
  { el: '#expertise .expertise', ax: 0.98, ay: 0.55,
    text: 'Frontend is my main strength. I also work with Node.js, Python and FastAPI, including AI features with RAG.' },
  { el: '#history .timeline', ax: 0.98, ay: 0.3,
    text: 'I led frontend at Airthings and Skyfri, and most recently built Nordic energy dashboards at Fortum.' },
  { el: '[data-card="radon"]', ax: 0.85, ay: 0.92,
    text: 'RadonMap is my favourite. I led it from idea to production at Airthings, and BBC StoryWorks featured it.' },
  { el: '[data-card="nasa"]', ax: 0.85, ay: 0.92,
    text: "NASA Explorer pulls live data from NASA's public APIs, like the picture of the day and near-Earth asteroids." },
  { el: '[data-card="chat"]', ax: 0.85, ay: 0.92,
    text: 'This is a real-time chat app where several people can talk at once.' },
  { el: '[data-card="food"]', ax: 0.85, ay: 0.92,
    text: 'And this is a food ordering app, in the style of Swiggy and Foodpanda.' },
  { el: '#contact-form', ax: 0.2, ay: 1, dy: 20, wave: true, then: 'exit-overlay',
    text: 'Got a project in mind? Send me a message right here. Thanks for visiting!' },
];

export const STEPS: TourStep[] = [...HERO_LINES.map((s) => ({ ...s, hero: true })), ...TOUR];
