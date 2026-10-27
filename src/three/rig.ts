import * as THREE from 'three';
import type { GLTF } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { damp } from '../lib/motion';
import { customAvatar } from './loadAvatar';

/*
 * The procedural avatar: a small rig of groups (pelvis, knees, spine, arms, head) built from
 * primitive shapes, animated in code. Both avatars (desk + walking) share one set of
 * materials and geometries. A rigged .glb can replace the body (see attachCustom).
 */

export const COL = {
  skin: 0xc68b62, hair: 0x231612, top: 0x9ea1a6, pants: 0x2f3440, shoe: 0xf7f7f5,
  eye: 0x1a1210, blush: 0xe39a92, gold: 0xc9a04a,
};

export interface Pose { sit: number; type: number; wave: number; walk: number; look: number }
type ClipKey = 'type' | 'sit' | 'wave' | 'talk' | 'walk' | 'idle';

export interface Rig {
  root: THREE.Group; yaw: THREE.Group; proc: THREE.Group;
  pelvis: THREE.Group; spine: THREE.Group; head: THREE.Group;
  hipL: THREE.Group; hipR: THREE.Group; kneeL: THREE.Group; kneeR: THREE.Group;
  armL: THREE.Group; armR: THREE.Group; smile: THREE.Mesh; mouth: THREE.Mesh;
  tgt: Pose; cur: Pose; talk: boolean; phase: number; customVersion: number;
  custom?: { model: THREE.Object3D; mixer: THREE.AnimationMixer; acts: Partial<Record<ClipKey, THREE.AnimationAction>>; cur: THREE.AnimationAction | null };
}

// ---- shared resources ----
const std = (color: number, o: THREE.MeshStandardMaterialParameters = {}) =>
  new THREE.MeshStandardMaterial({ color, roughness: 0.8, metalness: 0, ...o });
let mats: Record<string, THREE.Material> | null = null;
const getMats = () =>
  mats ??
  (mats = {
    skin: std(COL.skin), hair: std(COL.hair, { roughness: 0.5 }), top: std(COL.top), pants: std(COL.pants),
    shoe: std(COL.shoe), eye: std(COL.eye, { roughness: 0.3 }), blush: std(COL.blush, { roughness: 1 }),
    gold: std(COL.gold, { metalness: 0.6, roughness: 0.3 }),
  });

const geos = new Map<string, THREE.BufferGeometry>();
const cached = <T extends THREE.BufferGeometry>(key: string, make: () => T): T => {
  let g = geos.get(key) as T | undefined;
  if (!g) { g = make(); geos.set(key, g); }
  return g;
};
const sphere = (r: number, w = 16, h = 12) => cached(`s${r},${w},${h}`, () => new THREE.SphereGeometry(r, w, h));
const cyl = (a: number, b: number, h: number, s = 12) => cached(`c${a},${b},${h},${s}`, () => new THREE.CylinderGeometry(a, b, h, s));
const box = (x: number, y: number, z: number) => cached(`b${x},${y},${z}`, () => new THREE.BoxGeometry(x, y, z));

function mesh(geo: THREE.BufferGeometry, mat: THREE.Material, x = 0, y = 0, z = 0) {
  const m = new THREE.Mesh(geo, mat);
  m.position.set(x, y, z);
  m.castShadow = true;
  return m;
}

export function createRig(withShadowDisc: boolean): Rig {
  const m = getMats();
  const root = new THREE.Group(), yaw = new THREE.Group(), proc = new THREE.Group();
  root.add(yaw); yaw.add(proc);
  const pelvis = new THREE.Group(); pelvis.position.y = 0.92; proc.add(pelvis);
  const hips = mesh(sphere(0.2, 14, 10), m.pants); hips.scale.set(1.25, 0.6, 0.9); pelvis.add(hips);

  const leg = (side: number): [THREE.Group, THREE.Group] => {
    const hip = new THREE.Group(); hip.position.set(0.12 * side, 0, 0); pelvis.add(hip);
    hip.add(mesh(cyl(0.105, 0.09, 0.46), m.pants, 0, -0.23, 0));
    const knee = new THREE.Group(); knee.position.y = -0.46; hip.add(knee);
    knee.add(mesh(sphere(0.09, 10, 8), m.pants));
    knee.add(mesh(cyl(0.088, 0.075, 0.4), m.pants, 0, -0.2, 0));
    knee.add(mesh(box(0.18, 0.12, 0.32), m.shoe, 0, -0.4, 0.05));
    return [hip, knee];
  };
  const [hipL, kneeL] = leg(-1);
  const [hipR, kneeR] = leg(1);

  // grey knit half-zip sweater
  const spine = new THREE.Group(); pelvis.add(spine);
  spine.add(mesh(cyl(0.22, 0.26, 0.82, 20), m.top, 0, 0.44, 0));
  const chest = mesh(sphere(0.22, 18, 12), m.top, 0, 0.84, 0); chest.scale.set(1.15, 0.55, 1); spine.add(chest);
  spine.add(mesh(cyl(0.13, 0.15, 0.14, 20), m.top, 0, 0.98, 0));
  spine.add(mesh(box(0.018, 0.3, 0.02), m.eye, 0, 0.82, 0.225));
  spine.add(mesh(cyl(0.07, 0.08, 0.14, 10), m.skin, 0, 1.0, 0));

  // head, hair tied back, face
  const head = new THREE.Group(); head.position.y = 1.32; spine.add(head);
  head.add(mesh(sphere(0.32, 28, 20), m.skin));
  head.add(mesh(sphere(0.345, 28, 20), m.hair, 0, 0.05, -0.075));
  const fringe = mesh(sphere(0.26, 20, 14), m.hair, 0, 0.2, 0.15); fringe.scale.set(1.05, 0.42, 0.62); head.add(fringe);
  head.add(mesh(sphere(0.15), m.hair, 0, 0.06, -0.37));
  for (const s of [-1, 1]) {
    head.add(mesh(sphere(0.042, 12, 10), m.eye, 0.11 * s, 0, 0.29));
    const b = mesh(cached('blush', () => new THREE.CircleGeometry(0.05, 16)), m.blush, 0.18 * s, -0.08, 0.262);
    b.rotation.y = 0.55 * s; head.add(b);
    head.add(mesh(sphere(0.035, 10, 8), m.gold, 0.33 * s, -0.16, 0));
  }
  const smile = mesh(cached('smile', () => new THREE.TorusGeometry(0.055, 0.012, 6, 16, Math.PI)), m.eye, 0, -0.12, 0.3);
  smile.rotation.z = Math.PI; head.add(smile);
  const mouth = mesh(sphere(0.05, 14, 10), m.eye, 0, -0.13, 0.285);
  mouth.scale.set(1.1, 0.3, 0.5); mouth.visible = false; head.add(mouth);

  const arm = (side: number) => {
    const sh = new THREE.Group(); sh.position.set(0.29 * side, 0.84, 0); spine.add(sh);
    sh.add(mesh(sphere(0.1, 14, 10), m.top));
    sh.add(mesh(cyl(0.075, 0.065, 0.6, 10), m.top, 0, -0.3, 0));
    sh.add(mesh(sphere(0.07, 12, 10), m.skin, 0, -0.63, 0));
    return sh;
  };
  const armL = arm(-1), armR = arm(1);

  if (withShadowDisc) {
    const disc = new THREE.Mesh(
      new THREE.CircleGeometry(0.5, 32),
      new THREE.MeshBasicMaterial({ color: 0x1f2421, transparent: true, opacity: 0.12 }),
    );
    disc.rotation.x = -Math.PI / 2; disc.position.y = 0.01; disc.scale.set(1, 0.7, 1); root.add(disc);
  }

  const pose = (): Pose => ({ sit: 0, type: 0, wave: 0, walk: 0, look: 0 });
  return {
    root, yaw, proc, pelvis, spine, head, hipL, hipR, kneeL, kneeR, armL, armR, smile, mouth,
    tgt: pose(), cur: pose(), talk: false, phase: 0, customVersion: 0,
  };
}

/** Set pose targets in place (no allocations; called every frame). */
export function setPose(r: Rig, sit: number, type: number, wave: number, walk: number, look: number) {
  const g = r.tgt; g.sit = sit; g.type = type; g.wave = wave; g.walk = walk; g.look = look;
}

const RATES: Pose = { sit: 3, type: 5, wave: 7, walk: 9, look: 4 };
const KEYS = Object.keys(RATES) as (keyof Pose)[];

export function animateRig(r: Rig, t: number, dt: number, reduce: boolean) {
  for (const k of KEYS) r.cur[k] = damp(r.cur[k], r.tgt[k], RATES[k], dt);
  const p = r.cur;
  r.phase += dt * 9 * p.walk;
  if (r.custom) return animateCustom(r, dt);

  const sw = Math.sin(r.phase) * p.walk;
  const sitA = (p.sit * Math.PI) / 2;
  r.hipL.rotation.x = -sitA + sw * 0.55;
  r.hipR.rotation.x = -sitA - sw * 0.55;
  r.kneeL.rotation.x = sitA + Math.max(0, Math.sin(r.phase)) * 0.7 * p.walk;
  r.kneeR.rotation.x = sitA + Math.max(0, -Math.sin(r.phase)) * 0.7 * p.walk;
  r.pelvis.position.y = 0.92 - p.sit * 0.44 + Math.abs(Math.sin(r.phase)) * 0.045 * p.walk + (1 - p.walk) * Math.sin(t * 2) * 0.006;
  r.spine.rotation.x = p.sit * 0.06 + p.type * 0.12;

  const bl = reduce ? 0 : Math.sin(t * 15) * 0.07 * p.type;
  const br = reduce ? 0 : Math.sin(t * 15 + 1.9) * 0.07 * p.type;
  r.armL.rotation.x = -1.45 * p.type - sw * 0.5 + bl;
  r.armL.rotation.z = -0.12 + 0.22 * p.type;
  const wv = p.wave;
  r.armR.rotation.x = (-1.45 * p.type + sw * 0.5 + br) * (1 - wv);
  r.armR.rotation.z = (0.12 - 0.22 * p.type) * (1 - wv) + (2.5 + Math.sin(t * 11) * 0.32) * wv;

  r.head.rotation.x = p.type * 0.22 + (r.talk ? Math.sin(t * 5) * 0.04 : 0);
  r.head.rotation.y = p.look;
  r.head.rotation.z = wv * Math.sin(t * 3) * 0.06;
  r.smile.visible = !r.talk;
  r.mouth.visible = r.talk;
  if (r.talk) r.mouth.scale.y = 0.25 + Math.abs(Math.sin(t * 16)) * 0.75;
}

// ---- custom .glb avatar (e.g. Mixamo clips named idle, walk, wave, talk, sit_typing) ----
type CloneFn = (o: THREE.Object3D) => THREE.Object3D;

export function attachCustom(r: Rig, gltf: GLTF, clone: CloneFn) {
  const model = clone(gltf.scene);
  const bounds = new THREE.Box3().setFromObject(model);
  const h = bounds.max.y - bounds.min.y || 1;
  const s = 2.65 / h;
  model.scale.setScalar(s);
  model.position.y = -bounds.min.y * s;
  model.traverse((o) => { if ((o as THREE.Mesh).isMesh) o.castShadow = true; });
  if (r.custom) r.yaw.remove(r.custom.model);
  r.proc.visible = false;
  r.yaw.add(model);

  const mixer = new THREE.AnimationMixer(model);
  const acts: Partial<Record<ClipKey, THREE.AnimationAction>> = {};
  const patterns: Record<ClipKey, RegExp> = { type: /typ/i, sit: /sit/i, wave: /wav/i, talk: /talk/i, walk: /walk/i, idle: /idle/i };
  (Object.keys(patterns) as ClipKey[]).forEach((k) => {
    const clip = gltf.animations.find((c) => patterns[k].test(c.name));
    if (clip) acts[k] = mixer.clipAction(clip);
  });
  if (!acts.idle && gltf.animations[0]) acts.idle = mixer.clipAction(gltf.animations[0]);
  r.custom = { model, mixer, acts, cur: null };
}

function animateCustom(r: Rig, dt: number) {
  const c = r.custom!;
  const p = r.cur;
  const pick = (...keys: ClipKey[]) => keys.map((k) => c.acts[k]).find(Boolean) ?? null;
  let act: THREE.AnimationAction | null;
  if (p.walk > 0.3) act = pick('walk', 'idle');
  else if (p.sit > 0.5)
    act = p.wave > 0.3 ? pick('wave', 'talk', 'sit', 'idle') : r.talk ? pick('talk', 'sit', 'idle') : p.type > 0.5 ? pick('type', 'sit', 'idle') : pick('sit', 'idle');
  else act = p.wave > 0.3 ? pick('wave', 'talk', 'idle') : r.talk ? pick('talk', 'idle') : pick('idle');
  if (act && act !== c.cur) {
    act.reset().fadeIn(0.3).play();
    c.cur?.fadeOut(0.3);
    c.cur = act;
  }
  c.mixer.update(dt);
}

/** Called from useFrame: swaps the body when a new avatar was loaded. */
export function syncCustomAvatar(r: Rig) {
  if (r.customVersion === customAvatar.version || !customAvatar.gltf || !customAvatar.clone) return;
  r.customVersion = customAvatar.version;
  attachCustom(r, customAvatar.gltf, customAvatar.clone);
}
