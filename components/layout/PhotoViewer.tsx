"use client";

import { useCallback, useEffect, useRef, useState } from "react";

// Tap a photo in a message or chat to see it full screen: pinch or double-tap to zoom (the wheel on a computer),
// drag to look around while zoomed, and swipe down, tap the dark area, ✕, Back or Esc to close.
// It picks up any unblurred message photo (.media img; a blurred one's first tap still just reveals it) and any
// img[data-zoom], on every screen, so the ported screens need no changes.

const PICK = ".media:not(.blur) img, img[data-zoom]";
const MAX = 4;
const DOUBLE_MS = 300;

type View = { s: number; x: number; y: number };
type Pt = { x: number; y: number };
const ZERO: View = { s: 1, x: 0, y: 0 };

export function PhotoViewer() {
  const [photo, setPhoto] = useState<{ src: string; alt: string } | null>(null);
  const [view, setViewState] = useState<View>(ZERO);
  const [drop, setDrop] = useState(0); // how far it's been swiped down (to close)
  const [live, setLive] = useState(false); // a finger is moving it: no easing
  const stage = useRef<HTMLDivElement>(null);
  const pic = useRef<HTMLImageElement>(null);
  const pts = useRef(new Map<number, Pt>());
  const start = useRef<{ view: View; pts: Pt[]; at: number; moved: boolean } | null>(null);
  const lastTap = useRef(0);
  const pushed = useRef(false);
  const viewRef = useRef<View>(ZERO); // the same, readable mid-gesture
  const setView = (v: View) => {
    viewRef.current = v;
    setViewState(v);
  };

  // a point relative to the middle of the screen
  const local = (e: { clientX: number; clientY: number }): Pt => {
    const r = stage.current!.getBoundingClientRect();
    return { x: e.clientX - r.left - r.width / 2, y: e.clientY - r.top - r.height / 2 };
  };

  // keeps a zoomed photo from sliding off the screen
  const clamp = (v: View): View => {
    const r = stage.current?.getBoundingClientRect();
    if (!r || v.s <= 1) return ZERO;
    const mx = ((v.s - 1) * r.width) / 2, my = ((v.s - 1) * r.height) / 2;
    return { s: v.s, x: Math.max(-mx, Math.min(mx, v.x)), y: Math.max(-my, Math.min(my, v.y)) };
  };

  // zoom to scale s keeping point p (relative to the middle) where it is
  const zoomAt = (from: View, s: number, p: Pt): View => {
    const k = s / from.s;
    return clamp({ s, x: p.x - (p.x - from.x) * k, y: p.y - (p.y - from.y) * k });
  };

  const close = useCallback(() => {
    if (pushed.current) {
      pushed.current = false;
      history.back(); // the popstate below clears it
    } else setPhoto(null);
  }, []);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const img = (e.target as Element | null)?.closest?.(PICK) as HTMLImageElement | null;
      if (!img || !img.currentSrc && !img.src) return;
      e.preventDefault();
      e.stopPropagation();
      // Back closes the photo instead of leaving the screen (same address and state, so nothing else reacts)
      history.pushState(history.state, "");
      pushed.current = true;
      setView(ZERO);
      setDrop(0);
      setPhoto({ src: img.currentSrc || img.src, alt: img.alt || "Photo" });
    };
    const onPop = () => {
      pushed.current = false;
      setPhoto(null);
    };
    document.addEventListener("click", onClick, true);
    window.addEventListener("popstate", onPop);
    return () => {
      document.removeEventListener("click", onClick, true);
      window.removeEventListener("popstate", onPop);
    };
  }, []);

  useEffect(() => {
    if (!photo) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && close();
    const root = document.documentElement, was = root.style.overflow;
    root.style.overflow = "hidden";
    document.addEventListener("keydown", onKey);
    return () => {
      root.style.overflow = was;
      document.removeEventListener("keydown", onKey);
    };
  }, [photo, close]);

  if (!photo) return null;

  const begin = () => {
    start.current = { view: viewRef.current, pts: [...pts.current.values()], at: Date.now(), moved: false };
  };

  const down = (e: React.PointerEvent) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    pts.current.set(e.pointerId, local(e));
    setLive(true);
    begin();
  };

  const move = (e: React.PointerEvent) => {
    if (!pts.current.has(e.pointerId) || !start.current) return;
    pts.current.set(e.pointerId, local(e));
    const now = [...pts.current.values()], st = start.current;
    if (now.length >= 2 && st.pts.length >= 2) {
      // pinch: scale by the change in finger spread, around the point between the fingers
      const d0 = Math.hypot(st.pts[0].x - st.pts[1].x, st.pts[0].y - st.pts[1].y) || 1;
      const d1 = Math.hypot(now[0].x - now[1].x, now[0].y - now[1].y);
      const m0 = { x: (st.pts[0].x + st.pts[1].x) / 2, y: (st.pts[0].y + st.pts[1].y) / 2 };
      const m1 = { x: (now[0].x + now[1].x) / 2, y: (now[0].y + now[1].y) / 2 };
      const s = Math.max(1, Math.min(MAX, (st.view.s * d1) / d0));
      const z = zoomAt(st.view, s, m0);
      setView(clamp({ s, x: z.x + m1.x - m0.x, y: z.y + m1.y - m0.y }));
      st.moved = true;
      return;
    }
    const dx = now[0].x - st.pts[0].x, dy = now[0].y - st.pts[0].y;
    if (Math.abs(dx) + Math.abs(dy) > 8) st.moved = true;
    if (st.view.s > 1) setView(clamp({ s: st.view.s, x: st.view.x + dx, y: st.view.y + dy }));
    else setDrop(Math.max(0, dy));
  };

  const up = (e: React.PointerEvent) => {
    const st = start.current;
    const p = pts.current.get(e.pointerId);
    pts.current.delete(e.pointerId);
    if (pts.current.size) {
      begin(); // one finger lifted from a pinch: carry on panning with the other
      return;
    }
    setLive(false);
    start.current = null;
    if (!st || !p) return;
    if (drop > 110) return close();
    setDrop(0);
    if (st.moved || st.pts.length > 1 || Date.now() - st.at > 300) return;
    // a tap: twice on the photo zooms in (or back out); once on the dark area closes
    // (the stage holds the pointer, so the event's target is always the stage: go by where the finger was)
    const r = pic.current?.getBoundingClientRect();
    const onPhoto = !!r && e.clientX >= r.left && e.clientX <= r.right && e.clientY >= r.top && e.clientY <= r.bottom;
    if (Date.now() - lastTap.current < DOUBLE_MS) {
      lastTap.current = 0;
      const v = viewRef.current;
      setView(v.s > 1 ? ZERO : zoomAt(v, 2.5, p));
      return;
    }
    lastTap.current = Date.now();
    if (!onPhoto && viewRef.current.s === 1) close();
  };

  const wheel = (e: React.WheelEvent) => {
    const v = viewRef.current;
    setView(zoomAt(v, Math.max(1, Math.min(MAX, v.s * (e.deltaY < 0 ? 1.15 : 1 / 1.15))), local(e)));
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={photo.alt}
      style={{ position: "fixed", inset: 0, zIndex: 1000, background: `rgba(6,4,10,${Math.max(0.35, 0.94 - drop / 500)})`, display: "flex" }}
    >
      <div
        ref={stage}
        onPointerDown={down}
        onPointerMove={move}
        onPointerUp={up}
        onPointerCancel={up}
        onWheel={wheel}
        style={{ position: "absolute", inset: 0, touchAction: "none", overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center" }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element -- a member's uploaded photo, shown as is */}
        <img
          ref={pic}
          src={photo.src}
          alt={photo.alt}
          draggable={false}
          style={{
            maxWidth: "100%",
            maxHeight: "100%",
            objectFit: "contain",
            userSelect: "none",
            transform: `translate(${view.x}px, ${view.y + drop}px) scale(${view.s})`,
            transition: live ? "none" : "transform .22s cubic-bezier(.2,.9,.3,1)",
            cursor: view.s > 1 ? "grab" : "zoom-in",
          }}
        />
      </div>
      <button
        type="button"
        onClick={close}
        aria-label="Close photo"
        style={{ position: "absolute", top: "max(14px, env(safe-area-inset-top))", right: 14, width: 44, height: 44, borderRadius: 22, border: 0, background: "rgba(255,255,255,.14)", color: "#fff", fontSize: 22, lineHeight: "44px", cursor: "pointer" }}
      >
        ✕
      </button>
    </div>
  );
}
