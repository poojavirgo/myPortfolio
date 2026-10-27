import { useRef, useState, type FormEvent } from 'react';
import { contact, links, profile } from '../data/content';
import { useReveal } from '../lib/useReveal';

type Status = { kind: 'idle' | 'sending' | 'sent' | 'error'; msg: string };

export default function Contact() {
  const ref = useRef<HTMLElement>(null);
  useReveal(ref);
  const [status, setStatus] = useState<Status>({ kind: 'idle', msg: '' });
  const [copied, setCopied] = useState('Copy');
  const emailRef = useRef<HTMLElement>(null);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(profile.email);
      setCopied('Copied');
    } catch {
      const r = document.createRange();
      if (emailRef.current) r.selectNodeContents(emailRef.current);
      const sel = getSelection(); sel?.removeAllRanges(); sel?.addRange(r);
      setCopied('Press Ctrl+C');
    }
    setTimeout(() => setCopied('Copy'), 1600);
  };

  const submit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const data = Object.fromEntries(new FormData(form)) as Record<string, string>;
    if (!data.name?.trim() || !data.reply?.trim() || !data.message?.trim()) {
      return setStatus({ kind: 'error', msg: 'Please fill in your name, how to reach you, and a message.' });
    }
    if (!contact.formEndpoint) {
      return setStatus({ kind: 'error', msg: 'The form is not connected yet. Please email me at the address on the left.' });
    }
    setStatus({ kind: 'sending', msg: 'Sending…' });
    try {
      const res = await fetch(contact.formEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error(String(res.status));
      form.reset();
      setStatus({ kind: 'sent', msg: 'Thanks! Your message is on its way.' });
    } catch {
      setStatus({ kind: 'error', msg: 'Sending failed. Please email me instead.' });
    }
  };

  return (
    <section id="contact" ref={ref}>
      <div className="contact reveal">
        <div className="contact-info">
          <span className="label">Contact</span>
          <h2>{contact.heading}</h2>
          <p className="lede">{contact.text}</p>
          <div className="mail-row">
            <code ref={emailRef}>{profile.email}</code>
            <button className="btn" type="button" onClick={copy}>{copied}</button>
          </div>
          <div className="links">
            {links.map((l) => <a key={l.href} href={l.href} target="_blank" rel="noopener">{l.label}</a>)}
          </div>
        </div>
        <form id="contact-form" noValidate onSubmit={submit}>
          <div className="field"><label htmlFor="f-name">Your name</label><input id="f-name" name="name" required autoComplete="name" /></div>
          <div className="field"><label htmlFor="f-reply">Email or phone</label><input id="f-reply" name="reply" required autoComplete="email" /></div>
          <div className="field full"><label htmlFor="f-msg">Message</label><textarea id="f-msg" name="message" required /></div>
          <div className="form-foot">
            <span role="status" className={`form-status ${status.kind}`}>{status.msg}</span>
            <button className="btn primary" type="submit" disabled={status.kind === 'sending'}>Send message</button>
          </div>
        </form>
      </div>
    </section>
  );
}
