"use client";

import { useEffect } from "react";

// Phones: keeps screens steady while the keyboard is up.
//   · --vvh is the height you can actually see (the screen minus the keyboard). The inbox and chat use it, so the
//     message box rides up on the keyboard and the header stays where it is. Android does this through the viewport
//     setting in app/layout.tsx (interactive-widget); iPhones need the number.
//   · html.sk-typing is set while a text box has focus, so the bottom menu steps aside instead of riding up too.
export function KeyboardFit() {
  useEffect(() => {
    const vv = window.visualViewport;
    const root = document.documentElement;
    const fit = () => {
      if (!vv) return;
      root.style.setProperty("--vvh", Math.round(vv.height) + "px");
      // iPhones slide the whole page up to show the box; inside a chat, put it back
      if (vv.offsetTop > 0 && document.querySelector(".ib-detail.open")) window.scrollTo(0, 0);
    };
    const typing = (e: FocusEvent) => {
      const t = e.target as HTMLElement | null;
      const on = e.type === "focusin" && !!t && (t.tagName === "TEXTAREA" || (t.tagName === "INPUT" && !/^(checkbox|radio|range|button|submit|file|color)$/.test((t as HTMLInputElement).type)) || t.isContentEditable);
      root.classList.toggle("sk-typing", on);
    };
    fit();
    vv?.addEventListener("resize", fit);
    vv?.addEventListener("scroll", fit);
    document.addEventListener("focusin", typing);
    document.addEventListener("focusout", typing);
    return () => {
      vv?.removeEventListener("resize", fit);
      vv?.removeEventListener("scroll", fit);
      document.removeEventListener("focusin", typing);
      document.removeEventListener("focusout", typing);
      root.classList.remove("sk-typing");
    };
  }, []);
  return null;
}
