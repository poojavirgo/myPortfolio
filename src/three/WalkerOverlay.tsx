import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { animateRig, createRig, setPose, syncCustomAvatar } from './rig';
import { currentStep, tour, useTour } from '../tour/store';
import { clamp, lerpAngle, prefersReducedMotion } from '../lib/motion';

/*
 * Pooja walking over the page. A transparent full-screen canvas with an orthographic camera
 * where one world unit is one CSS pixel, so she can stand exactly next to any DOM element.
 */

function Walker() {
  const { camera, size } = useThree();
  const reduce = useMemo(prefersReducedMotion, []);
  const rig = useMemo(() => createRig(true), []);
  const holder = useRef<THREE.Group>(null!);
  const pos = useMemo(() => new THREE.Vector2(), []);
  const target = useMemo(() => new THREE.Vector2(), []);
  const entered = useRef(-1);

  const scale = size.width < 560 ? 40 : 52;
  const minY = () => 3.0 * scale + 140; // room above her head for the speech bubble
  const maxY = () => size.height - (tour.barH + 40);

  // Ortho camera centred on the screen: world x = screen x, world y = -screen y.
  useEffect(() => {
    camera.position.set(size.width / 2, -size.height / 2, 1000);
    camera.updateProjectionMatrix();
  }, [camera, size]);

  function spotFor(el: Element) {
    const s = tour.overlayStep!;
    const r = el.getBoundingClientRect();
    target.set(
      clamp(r.left + r.width * (s.ax ?? 0.5) + (s.dx ?? 0), 46, size.width - 46),
      clamp(r.top + r.height * (s.ay ?? 1) + (s.dy ?? 0), minY(), maxY()),
    );
  }

  useFrame((state, delta) => {
    if (!tour.overlayActive) return;
    const dt = Math.min(delta, 0.05);
    const t = state.clock.elapsedTime;
    syncCustomAvatar(rig);

    if (entered.current !== tour.overlayEnter) {
      entered.current = tour.overlayEnter;
      pos.set(size.width + 80, clamp(size.height * 0.72, minY(), maxY()));
      target.copy(pos);
    }
    if (tour.overlayExit) target.set(size.width + 90, pos.y);
    else if (tour.overlayEl && tour.overlayStep) spotFor(tour.overlayEl);
    if (reduce && !tour.overlayExit) pos.copy(target);

    const dx = target.x - pos.x, dy = target.y - pos.y, dist = Math.hypot(dx, dy);
    const moving = dist > 3;
    if (moving) {
      const step = Math.min(dist, Math.max(160, Math.min(700, dist * 2.2)) * dt);
      pos.x += (dx / dist) * step;
      pos.y += (dy / dist) * step;
      rig.yaw.rotation.y = lerpAngle(rig.yaw.rotation.y, Math.atan2(dx, dy), Math.min(1, dt * 10));
    } else {
      rig.yaw.rotation.y = lerpAngle(rig.yaw.rotation.y, 0, Math.min(1, dt * 4));
    }
    tour.overlayArrived = !moving && !tour.overlayExit;
    tour.overlayOffscreen = tour.overlayExit && pos.x > size.width + 70;

    const step = currentStep();
    rig.talk = !!(step && !step.hero && tour.phase === 'talk');
    setPose(rig, 0, 0, !moving && rig.talk && tour.waveLeft > 0 ? 1 : 0, moving ? 1 : 0, 0);
    animateRig(rig, t, dt, reduce);

    holder.current.scale.setScalar(scale);
    holder.current.position.set(pos.x, -pos.y, 0);
    if (rig.talk) { tour.bubble.x = pos.x; tour.bubble.y = pos.y - 2.95 * scale; }
  });

  return (
    <group ref={holder}>
      <group rotation-x={0.32}>
        <primitive object={rig.root} />
      </group>
    </group>
  );
}

export default function WalkerOverlay() {
  const active = useTour(() => tour.overlayActive);
  return (
    <Canvas
      className="walker"
      orthographic flat dpr={[1, 1.5]}
      frameloop={active ? 'always' : 'never'}
      camera={{ position: [0, 0, 1000], near: 1, far: 3000, zoom: 1 }}
      gl={{ antialias: true, alpha: true }}
      style={{ position: 'fixed', inset: 0, zIndex: 40, pointerEvents: 'none', visibility: active ? 'visible' : 'hidden' }}
      aria-hidden
    >
      <hemisphereLight args={[0xffffff, 0xd8d6ce, 2.4]} />
      <directionalLight color={0xfff6ea} intensity={2.2} position={[-0.5, 1, 1.2]} />
      <Walker />
    </Canvas>
  );
}
