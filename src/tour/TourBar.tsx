import { useEffect, useRef, useState } from 'react';
import { STEPS } from '../data/tour';
import { endTour, nextStep, startTour, tour, useTour } from './store';
import { setVoiceEnabled, speak, voiceSupported } from './voice';
import { scrollToTop } from '../lib/scroll';

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
    setVoiceEnabled(next);
    if (next && tour.phase === 'talk') speak(tour.bubble.text);
  };

  return (
    <div ref={bar} className="tourbar" role="group" aria-label="Guided intro">
      <span className="tb-step">{!on ? 'Intro done' : intro ? 'Intro' : `${i + 1} / ${STEPS.length}`}</span>
      {voiceSupported && (
        <button type="button" aria-pressed={voice} onClick={toggleVoice}>{voice ? 'Voice on' : 'Voice off'}</button>
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
