import { Canvas, useFrame } from "@react-three/fiber";
import { EffectComposer, Vignette } from "@react-three/postprocessing";
import { Environment, Lightformer, Sparkles } from "@react-three/drei";
import { Physics, RigidBody, BallCollider } from "@react-three/rapier";
import { useMemo, useRef } from "react";
import * as THREE from "three";
import My3DText from "./Text3D";

const count = 50; 

const accents = ["`#191919 `", "#1a1a1a", "#0a0a0a "]; // Define your accent colors here

const shuffle = (accent = 0) => [
  { color: "#222", roughness: 0.1, metalness: 0.5 }, // Very dark gray
  { color: "#333", roughness: 0.1, metalness: 0.5 }, // Darker gray
  { color: "#444", roughness: 1.1, metalness: 0.5 }, // Medium dark gray
  { color: "#555", roughness: 0.1, metalness: 1.1 }, // Light dark gray
  { color: "#666", roughness: 0.1, metalness: 0.1 }, // Light dark gray with a bluish tone
  { color: "#777", roughness: 0.1, metalness: 0.1 }, // Grayish shade
  { color: accents[accent], roughness: 0.1, accent: true }, // Accent color
  { color: "#888", roughness: 0.1, metalness: 0.5 }, // Light gray
  { color: "#999", roughness: 0.1, metalness: 0.3 }, // Even lighter gray
  { color: "#111", roughness: 0.1 }, // Almost black
  { color: "#1a1a1a", roughness: 0.3 }, // Very dark charcoal gray
  { color: "#2e2e2e", roughness: 0.3 }, // Slightly lighter dark gray
  { color: "#0a0a0a", roughness: 0.1 }, // Near black
  { color: "#0f0f0f", roughness: 0.2 }, // Charcoal black
  { color: "#191919", roughness: 0.1 }, // Dark slate gray
  {
    color: accents[accent],
    roughness: 0.1,
    accent: true,
    transparent: true,
    opacity: 0.5,
  },
  { color: "#232323", roughness: 0.3, accent: true }, // Darker gray shade with accent
  { color: "#1c1c1c", roughness: 0.1, accent: true }, // Dark graphite
];

function Balls({ scale, vec }) {
  const api = useRef();
  

  
  useFrame((state, delta) => {
    delta = Math.min(9, delta); // Cap delta time
    api.current.applyImpulse(
      vec
        .copy(api.current.translation())
        .normalize()
        .multiply({
          x: -120 * delta * scale,
          y: -120 * delta * scale,
          z: -120 * delta * scale,
        })
    );
  });

  const randomMaterial = shuffle(Math.floor(Math.random() * accents.length))[
    Math.floor(Math.random() * 18)
  ];

  function Pointer({ vec = new THREE.Vector3() }) {
    const ref = useRef();
    useFrame(({ mouse, viewport }) => {
      vec.lerp(
        {
          x: (mouse.x * viewport.width) / 2,
          y: (mouse.y * viewport.height) / 2,
          z: 0,
        },
        0.2
      );
      ref.current.setNextKinematicTranslation(vec);
    });
    return (
      <RigidBody
        position={[100, 100, 100]}
        type="kinematicPosition"
        colliders={false}
        ref={ref}
      >
        <BallCollider args={[2]} />
      </RigidBody>
    );
  }

  return (
    <RigidBody
      linearDamping={1}
      angularDamping={0.75}
      friction={1}
      colliders={"ball"}
      ref={api}
      position={[
        Math.random() * 30 - 5,
        Math.random() * 10,
        Math.random() * 50 - 5,
      ]}
      scale={[scale, scale, scale]}
    >
      <mesh>
        <sphereGeometry args={[1, 32, 32]} />
        <meshStandardMaterial {...randomMaterial} />
      </mesh>
    </RigidBody>
  );
}

const App = () => {
  // Generate a random scale for the balls
  const balls = useMemo(() => {
    return Array.from({ length: count }, () => ({
      scale: [1, 1][Math.floor(Math.random() * 5)],
    }));
  }, []);

  return (
    <Canvas
      shadows
      gl={{ alpha: true, stencil: false, depth: false, antialias: false }}
      camera={{ position: [0, 0, 20], fov: 32.5, near: 1, far: 100 }}
    >
      <spotLight
        position={[10, 10, 10]}
        angle={0.15}
        penumbra={1}
        intensity={1}
        castShadow
      />
      <ambientLight intensity={0.4} />
      {/* <OrbitControls /> */}
      <ambientLight intensity={0.3} />
      <pointLight position={[10, 10, 10]} intensity={1.5} castShadow />
      {/* <Environment preset="city" /> */}
      <Physics gravity={[0, 0, 0]}>
        <Pointer />

        {/* Render balls */}
        {balls.map((balls, index) => (
          <Balls key={index} scale={balls.scale} vec={new THREE.Vector3()} />
        ))}
      </Physics>
      <Environment>
        <group rotation={[-Math.PI / 3, 0, 1]}>
          <Lightformer
            form="circle"
            intensity={100}
            rotation-x={Math.PI / 2}
            position={[0, 5, -9]}
            scale={2}
          />
          <Lightformer
            form="circle"
            intensity={2}
            rotation-y={Math.PI / 2}
            position={[-5, 1, -1]}
            scale={2}
          />
          <Lightformer
            form="circle"
            intensity={2}
            rotation-y={Math.PI / 2}
            position={[-5, -1, -1]}
            scale={2}
          />
          <Lightformer
            form="circle"
            intensity={2}
            rotation-y={-Math.PI / 2}
            position={[10, 1, 0]}
            scale={8}
          />
          <Lightformer
            form="ring"
            color="#4060ff"
            intensity={80}
            onUpdate={(self) => self.lookAt(0, 0, 0)}
            position={[10, 10, 0]}
            scale={10}
          />
        </group>
      </Environment>
      <EffectComposer>
        <Vignette />
      </EffectComposer>
    </Canvas>
  );
};

function Pointer({ vec = new THREE.Vector3() }) {
  const ref = useRef();
  useFrame(({ mouse, viewport }) => {
    vec.lerp(
      {
        x: (mouse.x * viewport.width) / 2,
        y: (mouse.y * viewport.height) / 2,
        z: 0,
      },
      0.2
    );
    ref.current.setNextKinematicTranslation(vec);
  });
  return (
    <RigidBody
      linearDamping={90}
      friction={8}
      scale={[0.1, 0.1, 0.1]}
      position={[100, 100, 100]}
      type="kinematicPosition"
      colliders={false}
      ref={ref}
    >
      
      <BallCollider args={[2]} />
      <Sparkles scale={[4, 4, 4]} />
    </RigidBody>
  );
}

export default App;
