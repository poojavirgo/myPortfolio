import { useEffect, useRef, useState } from 'react';
import { STEPS } from '../data/tour';
import { endTour, nextStep, startTour, tour, useTour } from './store';
import { setVoiceEnabled, voiceSupported } from './voice';
import { scrollToTop } from '../lib/scroll';

function SpeakerIcon({ on }: { on: boolean }) {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M11 5 6 9H3v6h3l5 4V5z" fill="currentColor" stroke="none" />
      {on ? <><path d="M15.5 8.5a5 5 0 0 1 0 7" /><path d="M18.5 5.5a9 9 0 0 1 0 13" /></> : <path d="m16 9 6 6m0-6-6 6" />}
    </svg>
  );
}

export default function TourBar() {
  const on = useTour(() => tour.on);
  const i = useTour(() => tour.i);
  const intro = useTour(() => tour.phase === 'intro');
  const [voice, setVoice] = useState(false);
  const bar = useRef<HTMLDivElement>(null);

  // the walking avatar keeps her feet above this bar
  useEffect(() => {
    const ro = new ResizeObserver(() => { tour.barH = bar.current?.offsetHeight ?? 56; });
    if (bar.current) ro.observe(bar.current);
    return () => ro.disconnect();
  }, []);

  const toggleVoice = () => {
    const next = !voice;
    setVoice(next);
    // speaks the current line right away, inside the click, which is what unlocks audio
    setVoiceEnabled(next, tour.bubble.visible ? tour.bubble.text : undefined);
  };

  return (
    <div ref={bar} className="tourbar" role="group" aria-label="Guided intro">
      <span className="tb-step">{!on ? 'Intro done' : intro ? 'Intro' : `${i + 1} / ${STEPS.length}`}</span>
      {voiceSupported && (
        <button type="button" className={voice ? 'voice' : 'voice off'} aria-pressed={voice} onClick={toggleVoice}>
          <SpeakerIcon on={voice} />{voice ? 'Voice on' : 'Turn on voice'}
        </button>
      )}
      {on ? (
        <>
          <button type="button" className="primary" onClick={nextStep}>Next</button>
          <button type="button" onClick={endTour}>Skip intro</button>
        </>
      ) : (
        <button type="button" onClick={() => { scrollToTop(); startTour(); }}>Replay intro</button>
      )}
    </div>
  );
}
