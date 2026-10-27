import { useSyncExternalStore } from 'react';
import { STEPS, type TourStep } from '../data/tour';
import { stopVoice } from './voice';
import { scrollToElement, scrollToTop } from '../lib/scroll';
import { prefersReducedMotion } from '../lib/motion';

/*
 * Tour state is a plain mutable object rather than React state: the two 3D scenes read it
 * every frame inside useFrame, and writing to it never triggers React renders.
 * The few things React UI shows (step counter, buttons) subscribe through useTour().
 */

export type Phase = 'idle' | 'intro' | 'prep' | 'talk' | 'hold' | 'exiting';
export type HeroMode = 'typing' | 'turning' | 'facing' | 'standing' | 'walkout' | 'gone';

export const tour = {
  on: false,
  i: 0,
  phase: 'idle' as Phase,
  timer: 0,
  waveLeft: 0,

  heroMode: 'typing' as HeroMode,
  heroSeat: 0, // bump to re-seat the desk avatar

  overlayActive: false,
  overlayEnter: 0, // bump to place the walking avatar at the right screen edge
  overlayEl: null as Element | null,
  overlayStep: null as TourStep | null,
  overlayArrived: false,
  overlayExit: false,
  overlayOffscreen: false,
  barH: 56,

  bubble: { text: '', typed: 0, visible: false, x: 0, y: 0 },
};

export const currentStep = (): TourStep | null =>
  tour.on && tour.phase !== 'intro' && tour.phase !== 'idle' ? STEPS[tour.i] : null;

// ---- tiny subscription for React UI ----
const listeners = new Set<() => void>();
export function emit() { listeners.forEach((l) => l()); }
const subscribe = (l: () => void) => { listeners.add(l); return () => { listeners.delete(l); }; };
export function useTour<T extends string | number | boolean>(select: () => T): T {
  return useSyncExternalStore(subscribe, select, select);
}

// ---- actions ----
function clearActiveCards() {
  document.querySelectorAll('.card.active').forEach((c) => c.classList.remove('active'));
}
export function showBubble(text: string) {
  tour.bubble.text = text;
  tour.bubble.typed = prefersReducedMotion() ? text.length : 0;
  tour.bubble.visible = true;
}
export function hideBubble() { tour.bubble.visible = false; tour.bubble.text = ''; }

function seatHero(typing: boolean) {
  tour.heroMode = typing ? 'typing' : 'turning';
  tour.heroSeat++;
}

export function startTour() {
  stopVoice(); hideBubble(); clearActiveCards();
  tour.overlayActive = false;
  seatHero(true);
  tour.on = true;
  tour.phase = 'intro';
  tour.timer = prefersReducedMotion() ? 0.3 : 1.6;
  emit();
}

export function endTour() {
  stopVoice(); hideBubble(); clearActiveCards();
  tour.on = false;
  tour.phase = 'idle';
  tour.overlayActive = false;
  seatHero(true);
  emit();
}

export function goTo(i: number): void {
  stopVoice(); hideBubble(); clearActiveCards();
  if (i >= STEPS.length) return endTour();
  const s = STEPS[i];
  tour.i = i;
  tour.phase = 'prep';

  if (s.hero) {
    tour.overlayActive = false;
    if (tour.heroMode !== 'turning' && tour.heroMode !== 'facing') seatHero(false);
    const hero = document.getElementById('hero');
    const r = hero?.getBoundingClientRect();
    if (r && (r.bottom < 200 || r.top > innerHeight * 0.5)) scrollToTop();
  } else {
    tour.heroMode = 'gone';
    const el = s.el ? document.querySelector(s.el) : null;
    if (!el) return goTo(i + 1);
    tour.overlayEl = el;
    tour.overlayStep = s;
    tour.overlayArrived = false;
    tour.overlayExit = false;
    if (!tour.overlayActive) { tour.overlayActive = true; tour.overlayOffscreen = false; tour.overlayEnter++; }
    el.closest('.card')?.classList.add('active');
    const r = el.getBoundingClientRect();
    if (r.top < 80 || r.bottom > innerHeight - 100) scrollToElement(el);
  }
  emit();
}

export const nextStep = () => (tour.phase === 'intro' ? goTo(0) : goTo(tour.i + 1));
