"use client";
/*
  Remotion 3D Composition for GADDA V9.
  - Strict Remotion 3D rules: <ThreeCanvas>, zero useFrame() calls,
    everything driven deterministically by useCurrentFrame().
  - Soft editorial lighting rig (warm bedside lamp + cool moonlight key +
    warm fill + procedural studio/bedroom <Environment> lightformers).
  - Grounded ContactShadows both under the bed in the bedroom AND under
    cutaway / comparison / solution stacks.
*/
import { useLayoutEffect, useMemo } from "react";
import * as THREE from "three";
import { ThreeCanvas } from "@remotion/three";
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { ContactShadows, Environment, Lightformer } from "@react-three/drei";
import { useThree } from "@react-three/fiber";
import { Bedroom } from "./Bedroom";
import { MattressShowcase } from "./MattressCutaway";
import { Sleeper } from "./Sleeper";
import { worldAt, type StageInput, type World } from "./world";

function CameraRig({ w }: { w: World }) {
  const { camera, scene } = useThree();

  useLayoutEffect(() => {
    camera.position.set(w.camPos[0], w.camPos[1], w.camPos[2]);
    camera.lookAt(w.camTarget[0], w.camTarget[1], w.camTarget[2]);
    if ((camera as THREE.PerspectiveCamera).isPerspectiveCamera) {
      const pCam = camera as THREE.PerspectiveCamera;
      if (Math.abs(pCam.fov - w.fov) > 0.01) {
        pCam.fov = w.fov;
        pCam.updateProjectionMatrix();
      }
    }
    if (!scene.background || !(scene.background instanceof THREE.Color)) {
      scene.background = new THREE.Color(w.bg[0], w.bg[1], w.bg[2]);
    } else {
      scene.background.setRGB(w.bg[0], w.bg[1], w.bg[2]);
    }
  }, [camera, scene, w.camPos, w.camTarget, w.fov, w.bg]);

  return null;
}

function StageLighting({ w, highQuality }: { w: World; highQuality: boolean }) {
  const night = w.night;
  const studio = 1 - night;
  const shadowSize = highQuality ? 2048 : 1024;

  return (
    <>
      <hemisphereLight
        args={[
          night > 0.5 ? "#c8d5e8" : "#fffcf6",
          night > 0.5 ? "#4a3e33" : "#d6cbb9",
          0.62 + studio * 0.45,
        ]}
      />

      <directionalLight
        position={[-3.8, 5.4, 3.2]}
        intensity={0.78 + studio * 0.98}
        color={night > 0.5 ? "#cfe0f4" : "#fff9f0"}
        castShadow
        shadow-mapSize-width={shadowSize}
        shadow-mapSize-height={shadowSize}
        shadow-camera-near={0.5}
        shadow-camera-far={16}
        shadow-camera-left={-3.4}
        shadow-camera-right={3.4}
        shadow-camera-top={3.4}
        shadow-camera-bottom={-3.4}
        shadow-bias={-0.0004}
        shadow-normalBias={0.02}
        shadow-radius={4}
      />

      <directionalLight
        position={[3.6, 3.1, 2.8]}
        intensity={0.44 + studio * 0.42}
        color="#fce7cf"
      />

      <directionalLight
        position={[1.5, 2.8, -3.5]}
        intensity={0.22 + studio * 0.28}
        color="#ffe8d1"
      />

      {w.lamp > 0.02 && w.room > 0.02 && (
        <pointLight
          position={[-1.34, 0.78, -0.74]}
          intensity={2.15 * w.lamp * w.room}
          distance={5.6}
          decay={1.85}
          color="#ffc07c"
        />
      )}

      <Environment resolution={128} frames={1}>
        <Lightformer
          form="rect"
          intensity={1.35}
          position={[0.5, 5.5, 2]}
          rotation={[Math.PI / 2, 0, 0]}
          scale={[8, 6, 1]}
          color="#fff6ea"
        />
        <Lightformer
          form="rect"
          intensity={0.85}
          position={[-5, 2.2, 0]}
          rotation={[0, Math.PI / 2, 0]}
          scale={[6, 4, 1]}
          color="#bfd4ea"
        />
        <Lightformer
          form="ring"
          intensity={0.75}
          position={[4.5, 3, 3.5]}
          scale={4.5}
          color="#ffe6cc"
        />
        <Lightformer
          form="rect"
          intensity={0.4}
          position={[0, -2, 0]}
          rotation={[-Math.PI / 2, 0, 0]}
          scale={[10, 10, 1]}
          color="#d7c7b2"
        />
      </Environment>
    </>
  );
}

export function Scene3D(input: StageInput) {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();

  const w = useMemo(() => worldAt(input, frame), [input, frame]);
  const activeStack = useMemo(
    () => input.stacks.find((s) => s.key === input.product) || input.stacks[0],
    [input.stacks, input.product]
  );

  const highQuality = input.quality === "high";

  return (
    <AbsoluteFill>
      <ThreeCanvas
        width={width}
        height={height}
        shadows="percentage"
        dpr={highQuality ? [1, 1.5] : [1, 1]}
        camera={{ fov: 30, near: 0.1, far: 30, position: [3.25, 2.35, 3.45] }}
        gl={{
          antialias: highQuality,
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 1.08,
          powerPreference: "high-performance",
        }}
      >
        <CameraRig w={w} />
        <StageLighting w={w} highQuality={highQuality} />

        <Bedroom w={w} frame={frame} />
        <Sleeper w={w} frame={frame} />
        {activeStack && (
          <MattressShowcase w={w} stacks={input.stacks} activeProduct={activeStack} />
        )}

        {w.room > 0.4 ? (
          <ContactShadows
            position={[0, 0.018, 0.05]}
            opacity={0.44 * w.room}
            scale={5.2}
            blur={2.4}
            far={1.6}
            resolution={256}
            frames={1}
          />
        ) : (
          <ContactShadows
            position={[0, 0.02, 0]}
            opacity={0.38 * (1 - w.room)}
            scale={7}
            blur={2.2}
            far={2.8}
            resolution={256}
            frames={1}
          />
        )}
      </ThreeCanvas>
    </AbsoluteFill>
  );
}
