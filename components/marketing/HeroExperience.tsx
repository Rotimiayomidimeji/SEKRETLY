"use client";

import Image from "next/image";
import {
  motion,
  useMotionValue,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
} from "framer-motion";
import {
  ArrowDownRight,
  ArrowUpRight,
  Check,
  ChevronRight,
  Sparkles,
} from "lucide-react";
import {
  type MouseEvent,
  useRef,
} from "react";

import { MagneticButton } from "@/components/motion/MagneticButton";

type HeroExperienceProps = {
  onStart: () => void;
};

export function HeroExperience({
  onStart,
}: HeroExperienceProps) {
  const heroRef = useRef<HTMLElement>(null);
  const reducedMotion = useReducedMotion();

  /*
   * Scroll motion.
   * Kept deliberately restrained so the hero
   * never disappears/crops aggressively.
   */
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });

  const copyYRaw = useTransform(
    scrollYProgress,
    [0, 1],
    [0, -28]
  );

  const artYRaw = useTransform(
    scrollYProgress,
    [0, 1],
    [0, -45]
  );

  const copyY = useSpring(copyYRaw, {
    stiffness: 90,
    damping: 26,
  });

  const artY = useSpring(artYRaw, {
    stiffness: 80,
    damping: 25,
  });

  /*
   * Pointer parallax.
   * Only moves the artwork a few pixels.
   */
  const pointerX = useMotionValue(0);
  const pointerY = useMotionValue(0);

  const smoothX = useSpring(pointerX, {
    stiffness: 75,
    damping: 20,
  });

  const smoothY = useSpring(pointerY, {
    stiffness: 75,
    damping: 20,
  });

  const rotateY = useTransform(
    smoothX,
    [-1, 1],
    [-2.5, 2.5]
  );

  const rotateX = useTransform(
    smoothY,
    [-1, 1],
    [2, -2]
  );

  const translateX = useTransform(
    smoothX,
    [-1, 1],
    [-10, 10]
  );

  const translateY = useTransform(
    smoothY,
    [-1, 1],
    [-7, 7]
  );

  function handlePointerMove(
    event: MouseEvent<HTMLElement>
  ) {
    if (reducedMotion) return;

    const bounds =
      event.currentTarget.getBoundingClientRect();

    const x =
      (event.clientX - bounds.left) /
      bounds.width;

    const y =
      (event.clientY - bounds.top) /
      bounds.height;

    pointerX.set((x - 0.5) * 2);
    pointerY.set((y - 0.5) * 2);
  }

  function resetPointer() {
    pointerX.set(0);
    pointerY.set(0);
  }

  return (
    <section
      ref={heroRef}
      id="top"
      className="sekret-hero"
      onMouseMove={handlePointerMove}
      onMouseLeave={resetPointer}
    >
      {/* BACKGROUND ATMOSPHERE */}
      <div
        className="sekret-hero__background"
        aria-hidden="true"
      >
        <div className="sekret-hero__glow sekret-hero__glow--pink" />
        <div className="sekret-hero__glow sekret-hero__glow--purple" />
        <div className="sekret-hero__grid" />
        <div className="sekret-hero__vignette" />
      </div>

      {/* LEFT CONTENT */}
      <motion.div
        className="sekret-hero__copy"
        style={{
          y: reducedMotion ? 0 : copyY,
        }}
      >
        <motion.div
          className="sekret-hero__eyebrow"
          initial={
            reducedMotion
              ? false
              : { opacity: 0, y: 14 }
          }
          animate={{
            opacity: 1,
            y: 0,
          }}
          transition={{
            duration: 0.55,
            delay: 0.05,
          }}
        >
          <span className="sekret-hero__eyebrow-dot" />

          <span>ANONYMOUS</span>
          <i>•</i>
          <span>REAL</span>
          <i>•</i>
          <span>NO JUDGMENT</span>
        </motion.div>

        <motion.h1
          initial={
            reducedMotion
              ? false
              : {
                  opacity: 0,
                  y: 35,
                }
          }
          animate={{
            opacity: 1,
            y: 0,
          }}
          transition={{
            duration: 0.75,
            delay: 0.12,
            ease: [0.16, 1, 0.3, 1],
          }}
        >
          <span className="sekret-hero__title-white">
            Say It.
          </span>

          <span className="sekret-hero__title-pink">
            Stay
            <span
              className="sekret-hero__scribble"
              aria-hidden="true"
            />
          </span>

          <span className="sekret-hero__title-white">
            Unknown.
          </span>
        </motion.h1>

        <motion.p
          className="sekret-hero__description"
          initial={
            reducedMotion
              ? false
              : {
                  opacity: 0,
                  y: 18,
                }
          }
          animate={{
            opacity: 1,
            y: 0,
          }}
          transition={{
            duration: 0.6,
            delay: 0.24,
          }}
        >
          Share honest thoughts, get real answers,
          explore what people actually think — all
          anonymously.
        </motion.p>

        <motion.div
          className="sekret-hero__actions"
          initial={
            reducedMotion
              ? false
              : {
                  opacity: 0,
                  y: 16,
                }
          }
          animate={{
            opacity: 1,
            y: 0,
          }}
          transition={{
            duration: 0.6,
            delay: 0.32,
          }}
        >
          <MagneticButton
            className="sekret-hero__primary"
            onClick={onStart}
          >
            <span>Create Your Link</span>
            <ArrowUpRight size={17} />

            <span
              className="sekret-hero__button-shine"
              aria-hidden="true"
            />
          </MagneticButton>

          <a
            href="#loop"
            className="sekret-hero__secondary"
          >
            <span>See How It Works</span>
            <ChevronRight size={17} />
          </a>
        </motion.div>

        <motion.div
          className="sekret-hero__microproof"
          initial={
            reducedMotion
              ? false
              : { opacity: 0 }
          }
          animate={{ opacity: 1 }}
          transition={{
            duration: 0.7,
            delay: 0.43,
          }}
        >
          <div
            className="sekret-hero__avatars"
            aria-hidden="true"
          >
            <span>J</span>
            <span>M</span>
            <span>A</span>
            <span>+</span>
          </div>

          <div className="sekret-hero__proof-copy">
            <strong>
              Built for real reactions.
            </strong>

            <small>
              <Check size={12} />
              No account needed to answer
            </small>
          </div>
        </motion.div>
      </motion.div>
{/* COMPLETE CHARACTER + PHONE ARTWORK */}
<motion.div
  className="sekret-hero__art-stage"
  initial={
    reducedMotion
      ? false
      : {
          opacity: 0,
          scale: 0.97,
        }
  }
  animate={{
    opacity: 1,
    scale: 1,
  }}
  transition={{
    duration: 1,
    delay: 0.12,
    ease: [0.16, 1, 0.3, 1],
  }}
>
  <div
    className="sekret-hero__art-halo"
    aria-hidden="true"
  />

  <div className="sekret-hero__art-canvas">
    <Image
      src="/images/hero/sekretly-hero.png"
      alt="Sekretly anonymous character holding the interaction phone"
      fill
      priority
      sizes="(max-width: 900px) 100vw, 72vw"
      className="sekret-hero__art-image"
    />
  </div>

  <motion.div
    className="sekret-hero__status"
    animate={
      reducedMotion
        ? undefined
        : { y: [0, -4, 0] }
    }
    transition={{
      duration: 4,
      repeat: Infinity,
      ease: "easeInOut",
    }}
  >
    <span />
    LIVE
    <b>ANONYMOUS</b>
  </motion.div>

  <motion.div
    className="sekret-hero__floating-note"
    animate={
      reducedMotion
        ? undefined
        : {
            y: [0, -7, 0],
            rotate: [-2, 1, -2],
          }
    }
    transition={{
      duration: 5.5,
      repeat: Infinity,
      ease: "easeInOut",
    }}
  >
    <Sparkles size={13} />
    no filters. just truth.
  </motion.div>
</motion.div>

      <a
        href="#proof"
        className="sekret-hero__scroll"
      >
        <span>keep scrolling</span>
        <ArrowDownRight size={14} />
      </a>
    </section>
  );
}