"use client";

import {
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
} from "framer-motion";
import { ArrowDown, Link2, MessageCircle, Sparkles } from "lucide-react";
import { useRef } from "react";

const steps = [
  {
    label: "Create",
    copy: "Choose a prompt people will actually want to answer.",
    icon: Sparkles,
    color: "#ff3b8d",
  },
  {
    label: "Share",
    copy: "Drop your unique link wherever your people are.",
    icon: Link2,
    color: "#a855ff",
  },
  {
    label: "Receive",
    copy: "Watch honest responses arrive in your private inbox.",
    icon: MessageCircle,
    color: "#20e7ff",
  },
];

export function HowItWorksExperience() {
  const ref = useRef<HTMLElement>(null);
  const reduced = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const y = useTransform(scrollYProgress, [0, 1], [45, -45]);
  return (
    <section ref={ref} id="loop" className="how-section section-band">
      <div className="how-section__heading">
        <p className="eyebrow">how it spreads</p>
        <h2>
          MAKE SOMETHING.
          <br />
          <em>DROP THE LINK.</em>
        </h2>
        <p className="section-intro">
          A tiny question can turn into a whole night of replies. Here’s the
          loop.
        </p>
      </div>
      <div className="how-sequence">
        <motion.div
          className="how-sequence__phone"
          style={{ y: reduced ? 0 : y }}
        >
          <div className="how-phone__notch" />
          <div className="how-phone__screen">
            <span className="how-phone__brand">S</span>
            <small>@maya / honest opinion</small>
            <strong>what do you actually think about me?</strong>
            <div className="how-phone__bubble">be honest 👀</div>
            <div className="how-phone__bubble how-phone__bubble--pink">
              you make every room less awkward
            </div>
          </div>
        </motion.div>
        <div className="how-steps">
          {steps.map(({ label, copy, icon: Icon, color }, index) => (
            <motion.div
              key={label}
              className="how-step"
              initial={{ opacity: 0, x: 24 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ delay: index * 0.1 }}
            >
              <span className="how-step__index">0{index + 1}</span>
              <span
                className="how-step__icon"
                style={{
                  color,
                  borderColor: `${color}66`,
                  background: `${color}16`,
                }}
              >
                <Icon size={20} />
              </span>
              <div>
                <h3>{label}</h3>
                <p>{copy}</p>
              </div>
              {index < steps.length - 1 && (
                <ArrowDown className="how-step__arrow" size={18} />
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
