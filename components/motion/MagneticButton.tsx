"use client";

import { motion, useMotionValue, useSpring } from "framer-motion";
import type { ButtonHTMLAttributes, ReactNode } from "react";

export function MagneticButton({ children, className = "", ...props }: ButtonHTMLAttributes<HTMLButtonElement> & { children: ReactNode }) {
  const x = useSpring(useMotionValue(0), { stiffness: 260, damping: 18 });
  const y = useSpring(useMotionValue(0), { stiffness: 260, damping: 18 });
  return <motion.div className="magnetic-wrap" style={{ x, y }} onMouseMove={(event) => { const box = event.currentTarget.getBoundingClientRect(); x.set((event.clientX - box.left - box.width / 2) * 0.1); y.set((event.clientY - box.top - box.height / 2) * 0.1); }} onMouseLeave={() => { x.set(0); y.set(0); }}><button className={className} {...props}>{children}</button></motion.div>;
}
