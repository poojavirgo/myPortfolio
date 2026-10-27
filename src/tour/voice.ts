// Browser speech synthesis. Off by default; the visitor turns it on (browsers need a click before audio).

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
if (synth) { pickVoice(); synth.onvoiceschanged = pickVoice; }

export const voiceSupported = !!synth;

export const voiceState = { speaking: false };

export function setVoiceEnabled(on: boolean) { enabled = on; if (!on) stopVoice(); }

export function speak(text: string) {
  if (!enabled || !synth) return;
  try {
    synth.cancel();
    const id = ++speakId;
    const u = new SpeechSynthesisUtterance(text);
    if (voice) u.voice = voice;
    u.rate = 1;
    u.pitch = 1.12;
    const done = () => { if (id === speakId) voiceState.speaking = false; };
    u.onend = done;
    u.onerror = done;
    window.setTimeout(done, 1500 + text.length * 85); // some browsers never fire onend
    voiceState.speaking = true;
    synth.speak(u);
  } catch {
    voiceState.speaking = false;
  }
}

export function stopVoice() {
  speakId++;
  voiceState.speaking = false;
  try { synth?.cancel(); } catch { /* ignore */ }
}
