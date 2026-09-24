"use client";

import { motion } from "framer-motion";

export function SplitTextReveal({ text, className = "" }: { text: string; className?: string }) {
  return <span className={className} aria-label={text}>{text.split(" ").map((word, index) => <span className="split-word" key={`${word}-${index}`}><motion.span initial={{ y: "110%" }} whileInView={{ y: 0 }} viewport={{ once: true }} transition={{ duration: 0.65, delay: index * 0.06, ease: [0.16, 1, 0.3, 1] }}>{word}</motion.span>{index < text.split(" ").length - 1 ? " " : ""}</span>)}</span>;
}
