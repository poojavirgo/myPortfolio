import { useEffect } from 'react';
import { STEPS } from '../data/tour';
import { currentStep, endTour, goTo, hideBubble, showBubble, startTour, tour } from './store';
import { speak, voiceState } from './voice';

/**
 * Runs the guided intro: walk → talk → hold → next step.
 * It waits on the 3D scenes (hero facing the camera, walker arrived) through the shared tour object.
 */
export default function TourDirector() {
  useEffect(() => {
    let raf = 0;
    let last = performance.now();

    const tick = (now: number) => {
      raf = requestAnimationFrame(tick);
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;
      if (tour.waveLeft > 0) tour.waveLeft -= dt;
      if (!tour.on) return;

      if (tour.phase === 'intro') {
        tour.timer -= dt;
        if (tour.timer <= 0) goTo(0);
        return;
      }
      const s = currentStep() ?? STEPS[tour.i];
      const b = tour.bubble;

      switch (tour.phase) {
        case 'prep': {
          const ready = s.hero ? tour.heroMode === 'facing' : tour.overlayArrived;
          if (ready) {
            tour.phase = 'talk';
            showBubble(s.text);
            speak(s.text);
            if (s.wave) tour.waveLeft = 1.9;
          }
          break;
        }
        case 'talk':
          if (b.typed < b.text.length) b.typed = Math.min(b.text.length, b.typed + dt * 32);
          else if (!voiceState.speaking) { tour.phase = 'hold'; tour.timer = 1.3 + b.text.length * 0.022; }
          break;
        case 'hold':
          tour.timer -= dt;
          if (tour.timer > 0) break;
          if (s.then === 'exit-hero') { hideBubble(); tour.heroMode = 'standing'; tour.phase = 'exiting'; }
          else if (s.then === 'exit-overlay') { hideBubble(); tour.overlayExit = true; tour.overlayEl = null; tour.phase = 'exiting'; }
          else goTo(tour.i + 1);
          break;
        case 'exiting':
          if (s.hero && tour.heroMode === 'gone') goTo(tour.i + 1);
          else if (!s.hero && tour.overlayOffscreen) endTour();
          break;
      }
    };

    raf = requestAnimationFrame(tick);
    startTour();
    return () => cancelAnimationFrame(raf);
  }, []);

  return null;
}
