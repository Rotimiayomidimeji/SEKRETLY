import { Environment, Float, Sparkles } from "@react-three/drei";

export function SceneLighting() {
  return <><ambientLight intensity={1.4} /><pointLight position={[2, 3, 4]} intensity={28} distance={9} color="#ff3b8d" /><pointLight position={[-4, -1, 2]} intensity={22} distance={8} color="#20e7ff" /><Float speed={1.2} rotationIntensity={0.12} floatIntensity={0.4}><Sparkles count={28} scale={7} size={2} speed={0.2} color="#fff8f2" /></Float><Environment preset="night" /></>;
}
