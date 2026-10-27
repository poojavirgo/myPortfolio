import { useRef } from 'react';
import { projects, projectsIntro, type Project } from '../data/content';
import { useReveal } from '../lib/useReveal';
import SectionHead from './SectionHead';

function ProjectCard({ p }: { p: Project }) {
  return (
    <article className="card reveal" data-card={p.id}>
      <div className="shot"><img src={p.image} alt={p.alt} loading="lazy" /></div>
      <div className="meta"><span className="label">{p.kind}</span>{p.year && <span className="label">{p.year}</span>}</div>
      <h3>{p.href ? <a href={p.href} target="_blank" rel="noopener">{p.title} ↗</a> : p.title}</h3>
      <p>{p.text}</p>
      {p.stack && <div className="stack">{p.stack.join(' · ')}</div>}
    </article>
  );
}

export default function Projects() {
  const ref = useRef<HTMLElement>(null);
  useReveal(ref);
  return (
    <section id="projects" ref={ref}>
      <SectionHead label="Selected work" title="Featured Work & Projects" intro={projectsIntro} />
      <div className="projects">{projects.map((p) => <ProjectCard key={p.id} p={p} />)}</div>
    </section>
  );
}
