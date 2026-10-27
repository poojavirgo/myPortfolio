// Browser speech synthesis.
// Browsers only allow a page to speak after the visitor clicks something, so voice starts off
// and the "Turn on voice" button unlocks it. The first line is spoken inside that click.

const synth = typeof window !== 'undefined' ? window.speechSynthesis : undefined;
const FEMALE = /female|zira|samantha|veena|heera|kalpana|aria|jenny|neerja|swara|karen|moira|tessa|serena|victoria|libby|sonia/i;

let voice: SpeechSynthesisVoice | null = null;
let enabled = false;
let speakId = 0;

function pickVoice() {
  if (!synth) return;
  const vs = synth.getVoices();
  if (!vs.length) return;
  voice =
    vs.find((v) => /en-IN/i.test(v.lang) && FEMALE.test(v.name)) ??
    vs.find((v) => /en-IN/i.test(v.lang)) ??
    vs.find((v) => /^en/i.test(v.lang) && FEMALE.test(v.name)) ??
    vs.find((v) => /^en/i.test(v.lang)) ??
    null;
}
if (synth) {
  pickVoice();
  synth.addEventListener?.('voiceschanged', pickVoice);
}

export const voiceSupported = !!synth;
// `utterance` keeps a reference to the line being spoken: Chrome garbage-collects
// unreferenced utterances, which cuts speech off and stops `onend` from firing.
export const voiceState = { speaking: false, utterance: null as SpeechSynthesisUtterance | null };

function say(text: string) {
  if (!synth) return;
  const id = ++speakId;
  const u = new SpeechSynthesisUtterance(text);
  if (!voice) pickVoice();
  if (voice) u.voice = voice;
  u.lang = voice?.lang ?? 'en-IN';
  u.rate = 1;
  u.pitch = 1.12;
  u.volume = 1;
  const done = () => { if (id === speakId) { voiceState.speaking = false; voiceState.utterance = null; } };
  u.onend = done;
  u.onerror = done;
  window.setTimeout(done, 1500 + text.length * 85); // safety net if a browser never fires onend
  voiceState.utterance = u;
  voiceState.speaking = true;
  synth.resume(); // Chrome can get stuck in a paused state
  synth.speak(u);
}

/** Turn voice on or off. Call from a click handler; `text` is spoken immediately to unlock audio. */
export function setVoiceEnabled(on: boolean, text?: string) {
  enabled = on;
  if (!on) return stopVoice();
  if (!synth) return;
  // speak synchronously inside the click (no cancel first: Chrome can drop a line queued
  // right after cancel), or Safari and iOS stay silent
  say(text || ' ');
}

export function speak(text: string) {
  if (!enabled || !synth) return;
  try {
    if (synth.speaking || synth.pending) {
      // Chrome often drops an utterance queued in the same tick as cancel()
      synth.cancel();
      const id = ++speakId;
      voiceState.speaking = true;
      window.setTimeout(() => { if (id === speakId) say(text); }, 80);
    } else {
      say(text);
    }
  } catch {
    voiceState.speaking = false;
  }
}

export function stopVoice() {
  speakId++;
  voiceState.speaking = false;
  voiceState.utterance = null;
  try { synth?.cancel(); } catch { /* ignore */ }
}

