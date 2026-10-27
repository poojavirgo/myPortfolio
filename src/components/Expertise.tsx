import { useRef } from 'react';
import { expertise, expertiseIntro } from '../data/content';
import { useReveal } from '../lib/useReveal';
import SectionHead from './SectionHead';

export default function Expertise() {
  const ref = useRef<HTMLElement>(null);
  useReveal(ref);
  return (
    <section id="expertise" ref={ref}>
      <SectionHead label="What I do" title="Expertise" intro={expertiseIntro} />
      <div className="expertise">
        {expertise.map((a) => (
          <div className="area reveal" key={a.title}>
            <h3>{a.title}</h3>
            <p>{a.text}</p>
            <ul className="tags">{a.tags.map((t) => <li key={t}>{t}</li>)}</ul>
          </div>
        ))}
      </div>
    </section>
  );
}
