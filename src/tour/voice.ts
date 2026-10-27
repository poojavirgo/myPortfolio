// Browser speech synthesis.
// Browsers only allow a page to speak after the visitor clicks something, so voice starts off
// and the "Turn on voice" button unlocks it. The first line is spoken inside that click.

const synth = typeof window !== 'undefined' ? window.speechSynthesis : undefined;
// Female voices by name across macOS/iOS, Chrome, Edge/Windows and Android.
// Put your favourite first; the best available one is picked automatically.
const PREFERRED = ['Veena', 'Neerja', 'Heera', 'Samantha', 'Google UK English Female', 'Google US English', 'Ava', 'Allison', 'Susan', 'Zoe', 'Karen', 'Moira', 'Serena', 'Tessa', 'Kate', 'Fiona', 'Victoria'];
const FEMALE = /female|woman|veena|neerja|heera|kalpana|swara|lekha|samantha|ava|allison|susan|zoe|karen|moira|tessa|serena|kate|fiona|victoria|zira|aria|jenny|sonia|libby|michelle|emma|clara|natasha|catherine|hazel|susan|flo|sandy|shelley|joanna|salli|kendra|kimberly|ivy|amy|olivia|google us english|google uk english female/i;
const MALE = /\bmale\b|\bman\b|rishi|prabhat|ravi|daniel|alex\b|fred|tom\b|oliver|aaron|arthur|gordon|reed|rocko|eddy|grandpa|ralph|junior|albert|bruce|lee\b|nathan|evan|david|mark\b|guy\b|ryan|christopher|eric|roger|steffan|andrew|brian|george|james|william|liam|thomas|matthew|joey|justin|kevin/i;

let voice: SpeechSynthesisVoice | null = null;
let foundFemale = false;
let enabled = false;
let speakId = 0;

function score(v: SpeechSynthesisVoice) {
  const name = v.name;
  if (MALE.test(name) && !/female/i.test(name)) return -1000;
  let s = 0;
  const pref = PREFERRED.findIndex((p) => name.toLowerCase().includes(p.toLowerCase()));
  if (pref >= 0) s += 100 - pref;
  if (FEMALE.test(name)) s += 50;
  if (/^en-IN/i.test(v.lang)) s += 8;
  else if (/^en/i.test(v.lang)) s += 4;
  else s -= 200; // never read English with a non-English voice
  if (/enhanced|premium|natural|neural/i.test(name)) s += 3;
  return s;
}

function pickVoice() {
  if (!synth) return;
  const vs = synth.getVoices();
  if (!vs.length) return;
  const best = [...vs].sort((a, b) => score(b) - score(a))[0];
  voice = best && score(best) > -200 ? best : null;
  foundFemale = !!voice && score(voice) >= 50;
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
  // if this device has no known female voice, raise the pitch of the closest one
  u.pitch = foundFemale ? 1.05 : 1.4;
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

