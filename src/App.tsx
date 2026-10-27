import { lazy, Suspense } from 'react';
import Header from './components/Header';
import Hero from './components/Hero';
import Marquee from './components/Marquee';
import Expertise from './components/Expertise';
import History from './components/History';
import Projects from './components/Projects';
import Contact from './components/Contact';
import Footer from './components/Footer';
import Cursor from './components/Cursor';
import SpeechBubble from './tour/SpeechBubble';
import TourBar from './tour/TourBar';
import TourDirector from './tour/TourDirector';

const WalkerOverlay = lazy(() => import('./three/WalkerOverlay'));

export default function App() {
  return (
    <>
      <div className="wrap">
        <Header />
        <main>
          <Hero />
          <Marquee />
          <Expertise />
          <History />
          <Projects />
          <Contact />
        </main>
        <Footer />
      </div>

      {/* guided intro: walking avatar, speech bubble, controls */}
      <Suspense fallback={null}><WalkerOverlay /></Suspense>
      <SpeechBubble />
      <TourBar />
      <TourDirector />
      <Cursor />
    </>
  );
}
