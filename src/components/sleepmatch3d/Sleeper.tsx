"use client";
/*
  Seamless sculpted 3D sleeper loaded from /3d/sleeper.glb (single continuous
  organic clothed human mesh with 65-bone Mixamo rig, zero segmented joints,
  zero WASM needed). Styled in editorial matte alabaster-clay PBR material.
  Every bone rotation and breathing cycle is driven strictly by useCurrentFrame().
*/
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { GLTFLoader, type GLTF } from "three/examples/jsm/loaders/GLTFLoader.js";
import * as SkeletonUtils from "three/examples/jsm/utils/SkeletonUtils.js";
import { POSE_BONES, type World } from "./world";

let gltfPromise: Promise<GLTF> | null = null;
function loadSleeperGltf(): Promise<GLTF> {
  if (!gltfPromise) {
    const loader = new GLTFLoader();
    gltfPromise = new Promise((resolve, reject) => {
      loader.load("/3d/sleeper.glb", resolve, undefined, reject);
    });
  }
  return gltfPromise;
}

type RigHandle = {
  root: THREE.Object3D;
  bones: Map<string, { bone: THREE.Bone; rest: THREE.Quaternion }>;
  material: THREE.MeshPhysicalMaterial;
  scale: number;
  centerY: number;
};

const tmpQ = new THREE.Quaternion();
const breathEuler = new THREE.Euler();
const breathQ = new THREE.Quaternion();

export function Sleeper({ w, frame }: { w: World; frame: number }) {
  const [rig, setRig] = useState<RigHandle | null>(null);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    loadSleeperGltf()
      .then((gltf) => {
        if (!mountedRef.current) return;
        const cloned = SkeletonUtils.clone(gltf.scene);

        const clayMat = new THREE.MeshPhysicalMaterial({
          color: "#e6dac9",
          roughness: 0.62,
          metalness: 0.01,
          sheen: 0.42,
          sheenRoughness: 0.68,
          sheenColor: new THREE.Color("#fff5e8"),
          transparent: true,
          opacity: 1,
        });

        const bones = new Map<string, { bone: THREE.Bone; rest: THREE.Quaternion }>();
        cloned.traverse((obj) => {
          if ((obj as THREE.Mesh).isMesh) {
            const mesh = obj as THREE.Mesh;
            mesh.castShadow = true;
            mesh.receiveShadow = true;
            mesh.material = clayMat;
            mesh.frustumCulled = false;
          }
          if ((obj as THREE.Bone).isBone) {
            const b = obj as THREE.Bone;
            const short = b.name.replace(/^mixamorig:?/i, "");
            if ((POSE_BONES as readonly string[]).includes(short)) {
              bones.set(short, { bone: b, rest: b.quaternion.clone() });
            }
          }
        });

        cloned.updateMatrixWorld(true);
        const box = new THREE.Box3().setFromObject(cloned);
        const size = new THREE.Vector3();
        const center = new THREE.Vector3();
        box.getSize(size);
        box.getCenter(center);
        const h = size.y > 0.01 ? size.y : 1.7;
        const scale = 1.64 / h;

        setRig({
          root: cloned,
          bones,
          material: clayMat,
          scale,
          centerY: center.y * scale,
        });
      })
      .catch(() => {
        // Stage remains functional if model fails
      });

    return () => {
      mountedRef.current = false;
    };
  }, []);

  useLayoutEffect(() => {
    if (!rig) return;
    const breathPhase = Math.sin((frame / 30) * 1.5);
    for (const [name, entry] of rig.bones.entries()) {
      const qArr = w.pose[name];
      if (qArr) {
        tmpQ.set(qArr[0], qArr[1], qArr[2], qArr[3]);
        entry.bone.quaternion.copy(entry.rest).multiply(tmpQ);
      } else {
        entry.bone.quaternion.copy(entry.rest);
      }
      if ((name === "Spine1" || name === "Spine2") && w.breathe > 0.01) {
        breathEuler.set(breathPhase * 0.018 * w.breathe, 0, 0);
        breathQ.setFromEuler(breathEuler);
        entry.bone.quaternion.multiply(breathQ);
      }
    }
    const op = THREE.MathUtils.clamp(w.sleeper, 0, 1);
    rig.material.opacity = op;
    rig.material.depthWrite = op > 0.5;
  }, [rig, w.pose, w.breathe, w.sleeper, frame]);

  const rollRad = useMemo(() => THREE.MathUtils.degToRad(-w.roll), [w.roll]);

  if (!rig || w.sleeper <= 0.01) return null;

  const sinkDrop = w.sink * 0.055;
  const yPos = 0.53 + w.lift - sinkDrop;

  return (
    <group position={[0, yPos, 0.06]}>
      <group rotation={[-Math.PI / 2, 0, 0]}>
        <group rotation={[0, rollRad, 0]}>
          <primitive
            object={rig.root}
            scale={rig.scale}
            position={[0, -rig.centerY, 0]}
          />
        </group>
      </group>
    </group>
  );
}
