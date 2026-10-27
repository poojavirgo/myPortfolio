import * as THREE from 'three';

/** The monitor: a 2D canvas drawn as a code editor, used as a texture on the 3D screen. */

const CODE = [
  'export function Portfolio() {',
  "  const pooja = useAvatar('pooja.glb')",
  '  useFrame((_, dt) => pooja.update(dt))',
  '',
  '  return (',
  '    <Canvas shadows>',
  '      <Desk wood="oak" />',
  '      <Pooja onArrive={sayHello} />',
  '      <Projects tour />',
  '    </Canvas>',
  '  )',
  '}',
];
const CODE_LEN = CODE.join('\n').length;
const TOKEN = /(\bexport\b|\bfunction\b|\bconst\b|\breturn\b|'[^']*'?|"[^"]*"?|<\/?[A-Za-z]+|\/>|>)/;

export function createCodeScreen() {
  const canvas = document.createElement('canvas');
  canvas.width = 640;
  canvas.height = 380;
  const g = canvas.getContext('2d')!;
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;

  let typed = 0, pause = 0, tick = 0, lastShown = -1, lastBlink = false;

  function draw(blink: boolean) {
    const W = canvas.width, H = canvas.height;
    g.fillStyle = '#FBFBF9'; g.fillRect(0, 0, W, H);
    g.fillStyle = '#ECECE8'; g.fillRect(0, 0, W, 34);
    ['#E8A598', '#E7CD8C', '#9EC2A4'].forEach((c, i) => { g.fillStyle = c; g.beginPath(); g.arc(22 + i * 20, 17, 6, 0, 7); g.fill(); });
    g.fillStyle = '#8A908B'; g.font = "500 15px 'IBM Plex Mono', monospace"; g.fillText('Portfolio.tsx', 96, 22);
    g.font = "16px 'IBM Plex Mono', monospace";
    let left = Math.floor(typed), y = 66, lastX = 54, lastY = 66;
    for (let i = 0; i < CODE.length; i++) {
      g.fillStyle = '#B9BDB8'; g.fillText(String(i + 1).padStart(2, ' '), 14, y);
      const line = CODE[i].slice(0, Math.max(0, left));
      left -= CODE[i].length + 1;
      let x = 54;
      for (const tok of line.split(TOKEN)) {
        if (!tok) continue;
        g.fillStyle = /^(export|function|const|return)$/.test(tok) ? '#3E5A4A' : /^['"]/.test(tok) ? '#B07A4A' : /^<|\/>|^>$/.test(tok) ? '#5F7FA0' : '#2A2E2B';
        g.fillText(tok, x, y);
        x += g.measureText(tok).width;
      }
      if (line.length) { lastX = x; lastY = y; }
      if (left < 0) break;
      y += 25;
    }
    if (blink) { g.fillStyle = '#3E5A4A'; g.fillRect(lastX + 2, lastY - 15, 9, 19); }
    texture.needsUpdate = true;
  }

  /** Advance typing and redraw at ~12 fps, only while the screen is visible. */
  function update(dt: number, t: number, typing: boolean, visible: boolean, reduce: boolean) {
    if (typing && !reduce) {
      if (pause > 0) pause -= dt;
      else { typed += dt * 22; if (typed > CODE_LEN + 4) { typed = 0; pause = 2.5; } }
    }
    if (!visible) return;
    tick += dt;
    const shown = Math.floor(typed), blink = Math.floor(t * 2) % 2 === 0;
    if (tick > 0.08 && (shown !== lastShown || blink !== lastBlink)) {
      draw(blink); lastShown = shown; lastBlink = blink; tick = 0;
    }
  }

  draw(true);
  return { texture, update };
}
