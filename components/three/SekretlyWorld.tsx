"use client";

import { Canvas, useThree } from "@react-three/fiber";
import { Suspense, useEffect } from "react";
import { HeroCharacter } from "./HeroCharacter";
import { SceneLighting } from "./SceneLighting";

function PointerCamera() {
  const { camera } = useThree();
  useEffect(() => { const onMove = (event: PointerEvent) => { camera.position.x += (event.clientX / window.innerWidth - 0.5) * 0.012; camera.position.y += -(event.clientY / window.innerHeight - 0.5) * 0.008; camera.position.x *= 0.985; camera.position.y *= 0.985; camera.lookAt(0, 0, 0); }; window.addEventListener("pointermove", onMove, { passive: true }); return () => window.removeEventListener("pointermove", onMove); }, [camera]);
  return null;
}

export function SekretlyWorld() {
  return <div className="sekretly-world" aria-label="A dimensional anonymous character with floating social objects"><Canvas dpr={[1, 1.35]} camera={{ position: [0, 0, 6], fov: 35 }} gl={{ antialias: true, powerPreference: "high-performance" }} fallback={<div className="sekretly-world__fallback">✦</div>}><Suspense fallback={null}><PointerCamera /><SceneLighting /><HeroCharacter /></Suspense></Canvas></div>;
}
