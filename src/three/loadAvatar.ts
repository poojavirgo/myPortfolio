import type * as THREE from 'three';
import type { GLTF } from 'three/examples/jsm/loaders/GLTFLoader.js';

/*
 * Optional custom avatar. GLTFLoader and SkeletonUtils are imported dynamically,
 * so their code is only downloaded when someone actually loads a .glb.
 * This module has no runtime three.js import, so the page shell stays light.
 */

export const customAvatar = {
  gltf: null as GLTF | null,
  clone: null as ((o: THREE.Object3D) => THREE.Object3D) | null,
  version: 0,
};

async function getTools() {
  const [{ GLTFLoader }, SkeletonUtils] = await Promise.all([
    import('three/examples/jsm/loaders/GLTFLoader.js'),
    import('three/examples/jsm/utils/SkeletonUtils.js'),
  ]);
  return { loader: new GLTFLoader(), clone: SkeletonUtils.clone };
}

function use(gltf: GLTF, clone: (o: THREE.Object3D) => THREE.Object3D) {
  customAvatar.gltf = gltf;
  customAvatar.clone = clone;
  customAvatar.version++;
  return gltf.animations.map((c) => c.name);
}

export async function loadAvatarUrl(url: string) {
  const { loader, clone } = await getTools();
  return use(await loader.loadAsync(url), clone);
}

export async function loadAvatarFile(file: File) {
  const { loader, clone } = await getTools();
  const gltf = await loader.parseAsync(await file.arrayBuffer(), '');
  return use(gltf, clone);
}
