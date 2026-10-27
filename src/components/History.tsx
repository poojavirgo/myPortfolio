import { useRef } from 'react';
import { education, history, historyIntro, languages } from '../data/content';
import { useReveal } from '../lib/useReveal';
import SectionHead from './SectionHead';

export default function History() {
  const ref = useRef<HTMLElement>(null);
  useReveal(ref);
  return (
    <section id="history" ref={ref}>
      <SectionHead label="Experience" title="History" intro={historyIntro} />
      <ol className="timeline">
        {history.map((j) => (
          <li className="job reveal" key={`${j.company}-${j.when}`}>
            <div><div className="when">{j.when}</div><div className="where">{j.where}</div></div>
            <div>
              <h3>
                {j.role} <span>· {j.company}</span>
                {j.badge && <span className="badge">{j.badge}</span>}
              </h3>
              <p>{j.text}</p>
            </div>
          </li>
        ))}
      </ol>
      <div className="extra reveal">
        <div><span className="label">Education</span><p>{education}</p></div>
        <div><span className="label">Languages</span><p>{languages}</p></div>
      </div>
    </section>
  );
}
