// @ts-nocheck -- ported 1:1 from design/mockup/NotFound.dc.html by scripts/port-mockup.mjs; typed as it gets wired to real data
"use client";

import React, { Fragment } from "react";
import { saveMode, SkLink } from "@/lib/sk/runtime";


export default class NotFound extends React.Component<Record<string, any>, any> {
  static defaultProps = {"mode":"dark","kind":"notfound"};

  constructor(props) {
    super(props);
    var m = null; // light/dark arrives as props.mode from the sk-mode cookie
    this.state = { mode: m || props.mode || 'dark', trying: false, back: false };
  }
  componentDidMount() {
    var self = this;
    this.onStore = function (e) { if (e.key === 'sk-mode' && e.newValue) self.setState({ mode: e.newValue }); };
    try { window.addEventListener('storage', this.onStore); } catch (e) {}
  }
  componentWillUnmount() { try { window.removeEventListener('storage', this.onStore); } catch (e) {} clearTimeout(this.t); }
  componentDidUpdate(prev) {
    if (prev.mode !== this.props.mode && this.props.mode) this.setState({ mode: this.props.mode });
    if (prev.kind !== this.props.kind) this.setState({ trying: false, back: false });
  }
  renderVals() {
    var self = this, s = this.state, dark = s.mode !== 'light';
    var off = this.props.kind === 'offline';
    return {
      mode: dark ? 'dark' : 'light', isDark: dark, isLight: !dark, modeWord: dark ? 'Light' : 'Dark',
      toggleMode: function () { var n = dark ? 'light' : 'dark'; saveMode(n); self.setState({ mode: n }); },
      isLost: !off, isOffline: off,
      netLabel: s.back ? 'Connected' : s.trying ? 'Checking…' : 'No connection',
      retryLabel: s.trying ? 'Checking…' : s.back ? 'Connected' : 'Try again',
      back: s.back,
      retry: function () { if (s.trying) return; self.setState({ trying: true }); clearTimeout(self.t); self.t = setTimeout(function () { self.setState({ trying: false, back: true }); }, 1400); }
    };
  }

  render() {
    // like the mockup runtime: the template sees the props merged with renderVals()
    const v = { ...this.props, ...(this.renderVals() || {}) };
    return (
      <>
      {" "}
      <div className="sk" data-mode={v.mode} style={{ background: "var(--hero)", display: "flex", flexDirection: "column" }}>
        {" "}
        <header style={{ display: "flex", alignItems: "center", gap: "8px", padding: "16px 20px" }}>
          {" "}
          <SkLink href="/" className="logo" aria-label="Sekretly home">
            <span className="logo-mark">
              S
            </span>
            <span className="logo-word">
              Sekretly
            </span>
          </SkLink>
          {" "}
          <span style={{ flex: "1" }} />
          {" "}
          <button className="mode-btn tap" onClick={v.toggleMode} aria-label={`Switch to ${v.modeWord} mode`}>
            {" "}
            {v.isDark ? (
              <>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden="true">
                <circle cx="12" cy="12" r="4.5" />
                <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
              </svg>
              </>
            ) : null}
            {" "}
            {v.isLight ? (
              <>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M21 13.2A8.5 8.5 0 1 1 10.8 3a7 7 0 0 0 10.2 10.2z" />
              </svg>
              </>
            ) : null}
            {" "}
          </button>
          {" "}
        </header>
        {" "}
        <main style={{ flex: "1", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center", padding: "12px 20px 48px" }}>
          {" "}
          {v.isLost ? (
            <>
            {" "}
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
              {" "}
              <div style={{ position: "relative" }}>
                <div className="nf-big rise">
                  404
                </div>
                <img className="float" src="/sk/ghost.png" alt="" style={{ position: "absolute", right: "-34px", top: "-26px", width: "80px", height: "80px" }} />
              </div>
              {" "}
              <h1 className="rise" style={{ marginTop: "18px", fontSize: "clamp(28px, 6cqi, 44px)", fontWeight: "800", letterSpacing: "-.03em" }}>
                This page went anonymous
              </h1>
              {" "}
              <p className="muted rise" style={{ marginTop: "8px", fontSize: "16px", lineHeight: "1.5", maxWidth: "36ch" }}>
                The link may be mistyped, or it was deleted. If a friend sent it, ask them for a fresh one.
              </p>
              {" "}
              <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "10px", marginTop: "22px" }}>
                {" "}
                <SkLink href="/" className="btn btn-cta btn-lg tap">
                  Go home
                </SkLink>
                {" "}
                <SkLink href="/signup" className="btn btn-lg tap">
                  Make my own link
                </SkLink>
                {" "}
              </div>
              {" "}
              <SkLink href="/help" className="muted" style={{ marginTop: "16px", fontSize: "14px", fontWeight: "700" }}>
                Get help
              </SkLink>
              {" "}
              <div className="ad ad-mrec" style={{ marginTop: "26px" }}>
                <b>
                  Medium rectangle
                </b>
                300 × 250 · page not found
              </div>
              {" "}
            </div>
            {" "}
            </>
          ) : null}
          {" "}
          {v.isOffline ? (
            <>
            {" "}
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
              {" "}
              <img className="float" src="/sk/crescent_moon.png" alt="" style={{ width: "110px", height: "110px" }} />
              {" "}
              <div className="pill" style={{ marginTop: "14px", gap: "8px" }}>
                <span className="nf-dot" />
                {v.netLabel}
              </div>
              {" "}
              <h1 style={{ marginTop: "14px", fontSize: "clamp(28px, 6cqi, 44px)", fontWeight: "800", letterSpacing: "-.03em" }}>
                You’re offline
              </h1>
              {" "}
              <p className="muted" style={{ marginTop: "8px", fontSize: "16px", lineHeight: "1.5", maxWidth: "36ch" }}>
                Your messages are safe. Anything you were typing is saved on this phone and sends when you’re back.
              </p>
              {" "}
              <button className="btn btn-cta btn-lg tap" onClick={v.retry} style={{ marginTop: "22px", minWidth: "200px" }}>
                {v.retryLabel}
              </button>
              {" "}
              {v.back ? (
                <>
                <SkLink href="/home" className="btn btn-lg tap pop" style={{ marginTop: "10px" }}>
                  Back online · open the app
                </SkLink>
                </>
              ) : null}
              {" "}
            </div>
            {" "}
            </>
          ) : null}
          {" "}
        </main>
        {" "}
      </div>
      {" "}
      </>
    );
  }
}
