export const prefersReducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export const clamp = (v: number, a: number, b: number) => Math.min(Math.max(v, a), Math.max(a, b));

/** Frame-rate independent ease towards a target. */
export const damp = (current: number, target: number, rate: number, dt: number) =>
  current + (target - current) * Math.min(1, dt * rate);

export const wrapAngle = (a: number) => Math.atan2(Math.sin(a), Math.cos(a));
export const lerpAngle = (a: number, b: number, k: number) => a + wrapAngle(b - a) * k;
