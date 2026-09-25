"use client";

import {
  Eye,
  Layers3,
  LockKeyhole,
  MessageCircle,
  MoveUpRight,
  Sparkles,
} from "lucide-react";

const proofItems = [
  {
    value: "10",
    label: "Interaction formats",
    detail: "Different ways to ask",
    icon: Layers3,
    accent: "pink",
  },
  {
    value: "∞",
    label: "Built for honest replies",
    detail: "Keep the conversation moving",
    icon: MessageCircle,
    accent: "cyan",
  },
  {
    value: "NO",
    label: "Identity shown to recipient",
    detail: "Your name stays out of it",
    icon: LockKeyhole,
    accent: "violet",
  },
  {
    value: "MANY",
    label: "Ways to get curious",
    detail: "Ask it your way",
    icon: Eye,
    accent: "coral",
  },
] as const;

export function SocialProofStrip() {
  return (
    <section
      id="proof"
      className="sekret-proof"
      aria-label="Sekretly platform highlights"
    >
      <div
        className="sekret-proof__glow"
        aria-hidden="true"
      />

      <div className="sekret-proof__inner">
        <div className="sekret-proof__heading">
          <span className="sekret-proof__spark">
            <Sparkles size={14} />
          </span>

          <p>
            no names.
            <strong> just vibes.</strong>
          </p>

          <span className="sekret-proof__line" />
        </div>

        <div className="sekret-proof__grid">
          {proofItems.map((item) => {
            const Icon = item.icon;

            return (
              <article
                key={item.label}
                className={`sekret-proof-card sekret-proof-card--${item.accent}`}
              >
                <div className="sekret-proof-card__shine" />

                <div className="sekret-proof-card__top">
                  <span className="sekret-proof-card__icon">
                    <Icon size={18} />
                  </span>

                  <MoveUpRight
                    size={15}
                    className="sekret-proof-card__arrow"
                  />
                </div>

                <div className="sekret-proof-card__content">
                  <strong>
                    {item.value}
                  </strong>

                  <p>{item.label}</p>

                  <small>
                    {item.detail}
                  </small>
                </div>

                <div
                  className="sekret-proof-card__orb"
                  aria-hidden="true"
                />
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}