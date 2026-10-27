import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import { animateRig, createRig, setPose, syncCustomAvatar } from './rig';
import { createCodeScreen } from './codeScreen';
import { currentStep, tour, useTour } from '../tour/store';
import { damp, lerpAngle, prefersReducedMotion, wrapAngle } from '../lib/motion';

/* The hero: an oak desk in a light Scandinavian room, with Pooja typing at it. */

type V3 = [number, number, number];
const std = (color: number, o: THREE.MeshStandardMaterialParameters = {}) =>
  new THREE.MeshStandardMaterial({ color, roughness: 0.8, metalness: 0, ...o });
const MAT = {
  oak: std(0xc29b72, { roughness: 0.6 }),
  white: std(0xf7f7f5, { roughness: 0.55 }),
  pine: std(0x3e5a4a),
  leaf: std(0x7e957f, { roughness: 0.9 }),
  bookA: std(0xd8c9b4),
  bookB: std(0x9fb0a2),
};

function Part({ geo, mat, p, r, s }: { geo: THREE.BufferGeometry; mat: THREE.Material; p: V3; r?: V3; s?: V3 }) {
  return <mesh geometry={geo} material={mat} position={p} rotation={r} scale={s} castShadow receiveShadow />;
}

function Desk() {
  const top = useMemo(() => new THREE.BoxGeometry(1, 0.05, 1.9), []);
  const leg = useMemo(() => new THREE.CylinderGeometry(0.022, 0.018, 1.03, 8), []);
  return (
    <>
      <Part geo={top} mat={MAT.oak} p={[1, 1.05, 0]} />
      {([[0.56, -0.88], [0.56, 0.88], [1.44, -0.88], [1.44, 0.88]] as const).map(([x, z]) => (
        <Part key={`${x}${z}`} geo={leg} mat={MAT.white} p={[x, 0.515, z]} />
      ))}
    </>
  );
}

function Monitor({ screen }: { screen: THREE.Texture }) {
  return (
    <>
      <Part geo={new THREE.BoxGeometry(0.24, 0.02, 0.3)} mat={MAT.white} p={[1.28, 1.085, 0]} />
      <Part geo={new THREE.BoxGeometry(0.05, 0.34, 0.06)} mat={MAT.white} p={[1.28, 1.25, 0]} />
      <Part geo={new THREE.BoxGeometry(0.05, 0.62, 1.02)} mat={MAT.white} p={[1.25, 1.6, 0]} />
      <mesh position={[1.222, 1.6, 0]} rotation={[0, -Math.PI / 2, 0]}>
        <planeGeometry args={[0.95, 0.56]} />
        <meshBasicMaterial map={screen} toneMapped={false} />
      </mesh>
    </>
  );
}

function DeskProps() {
  const leaf = useMemo(() => new THREE.SphereGeometry(0.12, 12, 10), []);
  return (
    <>
      <Part geo={new THREE.BoxGeometry(0.2, 0.022, 0.62)} mat={MAT.white} p={[0.74, 1.087, 0]} />
      <Part geo={new THREE.BoxGeometry(0.1, 0.03, 0.06)} mat={MAT.white} p={[0.76, 1.09, 0.5]} />
      <Part geo={new THREE.CylinderGeometry(0.055, 0.05, 0.12, 20)} mat={MAT.pine} p={[0.85, 1.135, -0.6]} />
      <Part geo={new THREE.CylinderGeometry(0.1, 0.08, 0.18, 20)} mat={MAT.white} p={[1.22, 1.165, -0.76]} />
      {([[0, 0.12, 0, 1], [0.06, 0.08, 0.04, 0.8], [-0.05, 0.07, -0.03, 0.75]] as const).map(([dx, dy, dz, k]) => (
        <Part key={`${dx}`} geo={leaf} mat={MAT.leaf} p={[1.22 + dx, 1.3 + dy, -0.76 + dz]} s={[k, k * 1.4, k]} />
      ))}
      <Part geo={new THREE.BoxGeometry(0.18, 0.05, 0.26)} mat={MAT.bookA} p={[1.2, 1.1, 0.72]} />
      <Part geo={new THREE.BoxGeometry(0.17, 0.04, 0.24)} mat={MAT.bookB} p={[1.2, 1.145, 0.72]} />
    </>
  );
}

function Chair() {
  const leg = useMemo(() => new THREE.CylinderGeometry(0.02, 0.018, 0.38, 8), []);
  return (
    <>
      <Part geo={new THREE.BoxGeometry(0.55, 0.07, 0.55)} mat={MAT.white} p={[0, 0.4, 0]} />
      <Part geo={new THREE.BoxGeometry(0.06, 0.5, 0.5)} mat={MAT.white} p={[-0.29, 0.72, 0]} r={[0, 0, 0.12]} />
      {([[0.2, 0.2], [0.2, -0.2], [-0.2, 0.2], [-0.2, -0.2]] as const).map(([x, z]) => (
        <Part key={`${x}${z}`} geo={leg} mat={MAT.oak} p={[x * 1.15, 0.185, z * 1.15]} r={[z * 0.25, 0, -x * 0.25]} />
      ))}
    </>
  );
}

const CAM_BASE = new THREE.Vector3(-0.4, 2.6, 6.8);

function Scene({ visible }: { visible: boolean }) {
  const { camera, size, gl, scene } = useThree();
  const cam = camera as THREE.PerspectiveCamera;
  const reduce = useMemo(prefersReducedMotion, []);
  const rig = useMemo(() => createRig(false), []);
  const screen = useMemo(createCodeScreen, []);
  const station = useRef<THREE.Group>(null!);
  const swivel = useRef<THREE.Group>(null!);
  const seated = useRef(-1);
  const mouse = useRef({ x: 0, y: 0 });
  const look = useMemo(() => new THREE.Vector3(0.35, 1, 0), []);
  const v = useMemo(() => new THREE.Vector3(), []);

  useEffect(() => {
    const onMove = (e: PointerEvent) => { mouse.current.x = e.clientX / innerWidth - 0.5; mouse.current.y = e.clientY / innerHeight - 0.5; };
    addEventListener('pointermove', onMove, { passive: true });
    return () => removeEventListener('pointermove', onMove);
  }, []);

  // On wide screens shift the scene right so the headline has room on the left.
  useEffect(() => {
    const { width: w, height: h } = size;
    const desktop = w > 860;
    cam.fov = desktop ? 30 : 34;
    if (desktop) cam.setViewOffset(w, h, -w * 0.2, 0, w, h); else cam.clearViewOffset();
    cam.updateProjectionMatrix();
  }, [size, cam]);

  // Scenery never moves: compute its matrices once.
  useLayoutEffect(() => {
    station.current.traverse((o) => { if ((o as THREE.Mesh).isMesh) { o.updateMatrix(); o.matrixAutoUpdate = false; } });
  }, []);

  function seat(typing: boolean) {
    swivel.current.add(rig.root);
    rig.root.position.set(0.02, 0.027, 0);
    rig.root.rotation.set(0, 0, 0);
    rig.root.scale.setScalar(0.85);
    rig.yaw.rotation.y = Math.PI / 2;
    rig.root.visible = true;
    swivel.current.rotation.y = 0;
    setPose(rig, 1, typing ? 1 : 0, 0, 0, 0);
    Object.assign(rig.cur, rig.tgt);
    rig.talk = false;
  }

  useFrame((state, delta) => {
    const dt = Math.min(delta, 0.05);
    const t = state.clock.elapsedTime;
    if (seated.current !== tour.heroSeat) { seated.current = tour.heroSeat; seat(tour.heroMode === 'typing'); }
    syncCustomAvatar(rig);

    const step = currentStep();
    rig.talk = !!(step?.hero && tour.phase === 'talk');
    const sw = swivel.current;

    switch (tour.heroMode) {
      case 'typing':
        setPose(rig, 1, 1, 0, 0, 0);
        sw.rotation.y = damp(sw.rotation.y, 0, 4, dt);
        break;
      case 'turning':
      case 'facing': {
        setPose(rig, 1, 0, tour.waveLeft > 0 ? 1 : 0, 0, 0);
        const target = wrapAngle(Math.atan2(cam.position.x, cam.position.z) - station.current.rotation.y - Math.PI / 2);
        sw.rotation.y = lerpAngle(sw.rotation.y, target, Math.min(1, dt * (reduce ? 60 : 3.2)));
        if (tour.heroMode === 'turning' && Math.abs(wrapAngle(sw.rotation.y - target)) < 0.06) tour.heroMode = 'facing';
        break;
      }
      case 'standing':
        setPose(rig, 0, 0, 0, 0, 0);
        rig.root.position.x = damp(rig.root.position.x, 0.5, 3, dt);
        if (rig.cur.sit < 0.05 || reduce) {
          scene.attach(rig.root); // keep world transform, leave the chair
          const q = rig.root.quaternion;
          rig.yaw.rotation.y += 2 * Math.atan2(q.y, q.w);
          rig.root.rotation.set(0, 0, 0);
          rig.cur.sit = 0;
          tour.heroMode = 'walkout';
        }
        break;
      case 'walkout': {
        setPose(rig, 0, 0, 0, 1, 0);
        rig.yaw.rotation.y = lerpAngle(rig.yaw.rotation.y, 1.3, Math.min(1, dt * 6));
        const speed = 1.4 * dt * rig.cur.walk;
        rig.root.position.x += Math.sin(rig.yaw.rotation.y) * speed;
        rig.root.position.z += Math.cos(rig.yaw.rotation.y) * speed;
        rig.root.getWorldPosition(v).project(cam);
        if (v.x > 1.25 || reduce) tour.heroMode = 'gone';
        break;
      }
      case 'gone':
        rig.root.visible = false;
        break;
    }
    if (tour.heroMode !== 'gone') animateRig(rig, t, dt, reduce);
    screen.update(dt, t, tour.heroMode === 'typing', visible, reduce);

    // gentle camera drift with the pointer
    cam.position.set(CAM_BASE.x + (reduce ? 0 : mouse.current.x * 0.5), CAM_BASE.y - (reduce ? 0 : mouse.current.y * 0.25), CAM_BASE.z);
    cam.lookAt(look);

    if (rig.talk) {
      rig.head.getWorldPosition(v); v.y += 0.5; v.project(cam);
      const r = gl.domElement.getBoundingClientRect();
      tour.bubble.x = r.left + ((v.x + 1) / 2) * r.width;
      tour.bubble.y = r.top + ((1 - v.y) / 2) * r.height;
    }
  });

  return (
    <>
      <hemisphereLight args={[0xffffff, 0xcfccc4, 1.5]} />
      <directionalLight
        color={0xfff3e4} intensity={2.2} position={[-3.5, 6, 3]} castShadow
        shadow-mapSize={[1024, 1024]} shadow-radius={6} shadow-bias={-0.0005}
        shadow-camera-left={-3} shadow-camera-right={3} shadow-camera-top={3} shadow-camera-bottom={-3}
        shadow-camera-near={1} shadow-camera-far={15}
      />
      <directionalLight color={0xe6eef0} intensity={0.7} position={[4, 3, -2]} />
      <mesh rotation-x={-Math.PI / 2} receiveShadow>
        <planeGeometry args={[60, 60]} />
        <shadowMaterial color={0x2b302c} opacity={0.16} transparent />
      </mesh>
      <mesh rotation-x={-Math.PI / 2} position={[0.55, 0.004, -0.1]} receiveShadow>
        <circleGeometry args={[1.45, 64]} />
        <meshStandardMaterial color={0xd6d6d0} roughness={1} />
      </mesh>
      <group ref={station} rotation-y={0.55} scale={1.18}>
        <Desk />
        <Monitor screen={screen.texture} />
        <DeskProps />
        <group ref={swivel}><Chair /></group>
      </group>
    </>
  );
}

export default function DeskScene() {
  const wrap = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(true);
  const tourOn = useTour(() => tour.on);

  // Stop rendering when the hero is off screen and no intro is running.
  useEffect(() => {
    const io = new IntersectionObserver(([e]) => setVisible(e.isIntersecting));
    if (wrap.current) io.observe(wrap.current);
    return () => io.disconnect();
  }, []);

  return (
    <div ref={wrap} className="hero-canvas" role="img" aria-label="3D scene of Pooja working at her desk">
      <Canvas
        shadows flat dpr={[1, 1.75]}
        frameloop={visible || tourOn ? 'always' : 'never'}
        camera={{ fov: 30, near: 0.1, far: 60, position: CAM_BASE.toArray() }}
        gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
      >
        <Scene visible={visible} />
      </Canvas>
    </div>
  );
}
