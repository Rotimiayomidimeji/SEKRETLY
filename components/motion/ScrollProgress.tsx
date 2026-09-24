"use client";

import { motion, useScroll, useSpring } from "framer-motion";

export function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  return <motion.div className="scroll-progress" style={{ scaleX: useSpring(scrollYProgress, { stiffness: 100, damping: 30 }) }} aria-hidden="true" />;
}
