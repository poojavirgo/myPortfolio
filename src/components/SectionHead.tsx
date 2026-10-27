export default function SectionHead({ label, title, intro }: { label: string; title: string; intro: string }) {
  return (
    <div className="sec-head reveal">
      <div><span className="label">{label}</span><h2>{title}</h2></div>
      <p>{intro}</p>
    </div>
  );
}
