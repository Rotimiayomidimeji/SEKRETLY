import { Float } from "@react-three/drei";
import { Mesh } from "three";
import { useRef } from "react";

export function InteractionObject({ kind, position, color = "#ff3b8d", scale = 1 }: { kind: string; position: [number, number, number]; color?: string; scale?: number }) {
  const ref = useRef<Mesh>(null);
  const geometry = kind === "heart" ? <sphereGeometry args={[0.38, 20, 20]} /> : kind === "star" ? <octahedronGeometry args={[0.46, 1]} /> : kind === "flame" ? <coneGeometry args={[0.36, 0.8, 5]} /> : kind === "dice" ? <boxGeometry args={[0.65, 0.65, 0.65]} /> : kind === "envelope" ? <boxGeometry args={[0.8, 0.55, 0.12]} /> : <icosahedronGeometry args={[0.42, 1]} />;
  return <Float speed={1.4} rotationIntensity={0.45} floatIntensity={0.6}><mesh ref={ref} position={position} scale={scale} rotation={[0.2, 0.4, 0.1]}>{geometry}<meshPhysicalMaterial color={color} roughness={0.18} metalness={kind === "star" || kind === "dice" ? 0.7 : 0.2} clearcoat={0.9} clearcoatRoughness={0.12} emissive={color} emissiveIntensity={0.12} /></mesh></Float>;
}
