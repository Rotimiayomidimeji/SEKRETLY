"use client";

import { motion, useScroll, useSpring, useTransform } from "framer-motion";
import type { ReactNode } from "react";
import { useRef } from "react";

export function ParallaxLayer({ children, className = "", distance = 40 }: { children: ReactNode; className?: string; distance?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const y = useSpring(useTransform(scrollYProgress, [0, 1], [distance, -distance]), { stiffness: 100, damping: 24 });
  return <motion.div ref={ref} className={className} style={{ y }}>{children}</motion.div>;
}
