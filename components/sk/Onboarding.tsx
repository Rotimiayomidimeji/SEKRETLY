// @ts-nocheck -- ported 1:1 from design/mockup/Onboarding.dc.html by scripts/port-mockup.mjs; typed as it gets wired to real data
"use client";

import React, { Fragment } from "react";
import { saveMode, SkLink, route } from "@/lib/sk/runtime";


export default class Onboarding extends React.Component<Record<string, any>, any> {
  static defaultProps = {"mode":"dark"};

  constructor(props) {
    super(props);
    var m = null; // light/dark arrives as props.mode from the sk-mode cookie
    this.state = Object.assign({ mode: m || props.mode || 'dark' }, this.arrive());
  }
  // from the link page popup: { from: 'link', user, to } in sk-onb, stamped by sk-nav
  arrive() {
    var o = null;
    o = this.props.from === 'link' ? { from: 'link', user: this.props.username, to: this.props.to } : null; this.nav = '';
    return { onb: o, step: o && o.from === 'link' ? 1 : 0, push: null, pushPrompt: false, os: 'android', installPrompt: false, installed: false };
  }
  componentDidMount() {
    var self = this;
    this.onStore = function (e) { if (e.key === 'sk-mode' && e.newValue) self.setState({ mode: e.newValue }); };
    try { window.addEventListener('storage', this.onStore); } catch (e) {}
    // the browser offers "install" once the app qualifies; keep the event so the button can show it
    try { window.addEventListener('beforeinstallprompt', this.onBip = function (e) { e.preventDefault(); self.bip = e; }); } catch (e) {}
  }
  componentWillUnmount() { try { window.removeEventListener('storage', this.onStore); } catch (e) {} clearInterval(this.nt); }
  componentDidUpdate(prev) { if (prev.mode !== this.props.mode && this.props.mode) this.setState({ mode: this.props.mode }); }
  renderVals() {
    var self = this, s = this.state, dark = s.mode !== 'light';
    var line = dark ? 'rgba(255,255,255,.14)' : 'rgba(48,34,72,.14)';
    return {
      mode: dark ? 'dark' : 'light', isDark: dark, isLight: !dark, modeWord: dark ? 'Light' : 'Dark',
      toggleMode: function () { var n = dark ? 'light' : 'dark'; saveMode(n); self.setState({ mode: n }); },
      stepNo: s.step + 1,
      who: s.onb && s.onb.user ? s.onb.user : (self.props.username || 'you'), to: s.onb && s.onb.to ? s.onb.to : 'peach', fromLink: !!(s.onb && s.onb.from === 'link'),
      welcomeBody: s.onb && s.onb.from === 'link' ? 'When @' + s.onb.to + ' replies, it lands in your inbox. Two quick things so you see it the second it arrives.' : 'Two quick things so you never miss a message. Then we make your first link.',
      pushBody: s.onb && s.onb.from === 'link' ? '@' + s.onb.to + ' could reply any minute. We ping you for replies, new messages and game turns, nothing else.' : 'We only ping you for new messages, chat replies and game turns. You can fine-tune it in Settings.',
      finish: function () { if (self.props.complete) self.props.complete(); },
      finishHref: s.onb && s.onb.from === 'link' ? 'Inbox.dc.html' : 'Create.dc.html',
      bars: [0, 1, 2].map(function (i) { return { c: i <= s.step ? '#d81b72' : line }; }),
      s0: s.step === 0, s1: s.step === 1, s2: s.step === 2,
      next: function () { self.setState({ step: Math.min(2, s.step + 1) }); },
      pushOn: s.push === true, pushOff: s.push !== true,
      pushNext: s.push === true ? 'Next' : 'Not now',
      askPush: function () {
        if (typeof Notification === 'undefined') { self.setState({ push: false }); return; }
        Notification.requestPermission().then(function (p) { self.setState({ push: p === 'granted' }); });
      },
      pushPrompt: s.pushPrompt,
      allowPush: function () { self.setState({ pushPrompt: false, push: true }); },
      blockPush: function () { self.setState({ pushPrompt: false, push: false }); },
      osTabs: [['android', 'Android'], ['ios', 'iPhone']].map(function (o) { var on = s.os === o[0]; return { label: o[1], on: on ? 'true' : 'false', cls: on ? 'on' : '', pick: function () { self.setState({ os: o[0] }); } }; }),
      isAndroid: s.os === 'android', isIos: s.os === 'ios',
      installed: s.installed, notInstalled: !s.installed,
      askInstall: function () {
        if (self.bip) { self.bip.prompt(); self.bip.userChoice.then(function (c) { if (c.outcome === 'accepted') self.setState({ installed: true }); }); }
        else self.setState({ manual: true });
      },
      manual: !!s.manual,
      installPrompt: s.installPrompt,
      cancelInstall: function () { self.setState({ installPrompt: false }); },
      doInstall: function () { self.setState({ installPrompt: false, installed: true }); },
      finishLabel: s.onb && s.onb.from === 'link' ? (s.installed ? 'Go to my inbox' : 'Maybe later, go to my inbox') : (s.installed ? 'Create my first link' : 'Maybe later, create my first link')
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
        <header style={{ display: "flex", alignItems: "center", gap: "10px", padding: "16px 20px" }}>
          {" "}
          <div style={{ flex: "1", display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: "6px" }} aria-label={`Step ${v.stepNo} of 3`}>
            {" "}
            {(v.bars || []).map((b, i0) => (
              <Fragment key={i0}>
              <span style={{ height: "6px", borderRadius: "9px", background: b.c, transition: "background .3s" }} />
              </Fragment>
            ))}
            {" "}
          </div>
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
        <main style={{ flex: "1", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center", padding: "10px 24px 32px" }}>
          {" "}
          <div style={{ width: "100%", maxWidth: "420px" }}>
            {" "}
            {v.s0 ? (
              <>
              {" "}
              <div className="rise">
                {" "}
                <span className="pop" style={{ width: "150px", height: "150px", borderRadius: "48px", background: "linear-gradient(135deg,#d6ff6b,#22c4a0)", display: "inline-grid", placeItems: "center" }}>
                  {" "}
                  <img src="/sk/frog.png" alt="" style={{ width: "110px", height: "110px" }} />
                  {" "}
                </span>
                {" "}
                <h1 style={{ marginTop: "22px", fontSize: "38px", lineHeight: "1", fontWeight: "800" }}>
                  Welcome, @{v.who}
                </h1>
                {" "}
                {v.fromLink ? (
                  <>
                  <div className="pill pop" style={{ marginTop: "14px", background: "#0d7f4b", color: "#ffffff" }}>
                    ✓ Your message reached @{v.to}
                  </div>
                  </>
                ) : null}
                {" "}
                <p className="muted" style={{ marginTop: "10px", fontSize: "16.5px", lineHeight: "1.5" }}>
                  {v.welcomeBody}
                </p>
                {" "}
                <button className="btn btn-cta btn-lg btn-block tap" onClick={v.next} style={{ marginTop: "26px" }}>
                  Let’s go
                </button>
                {" "}
              </div>
              {" "}
              </>
            ) : null}
            {" "}
            {v.s1 ? (
              <>
              {" "}
              <div className="rise">
                {" "}
                {v.fromLink ? (
                  <>
                  <div className="pill pop" style={{ marginBottom: "18px", background: "#0d7f4b", color: "#ffffff" }}>
                    ✓ Sent to @{v.to}{" · you’re @"}{v.who}{" now"}
                  </div>
                  </>
                ) : null}
                {" "}
                <img className="wave" src="/sk/bell.png" alt="" style={{ width: "120px", height: "120px" }} />
                {" "}
                <h1 style={{ marginTop: "16px", fontSize: "34px", lineHeight: "1.02", fontWeight: "800" }}>
                  Know the second someone says something
                </h1>
                {" "}
                <p className="muted" style={{ marginTop: "10px", fontSize: "16px", lineHeight: "1.5" }}>
                  {v.pushBody}
                </p>
                {" "}
                {v.pushOn ? (
                  <>
                  {" "}
                  <div className="pill pop" style={{ marginTop: "16px", background: "#0d7f4b", color: "#ffffff" }}>
                    ✓ Notifications on
                  </div>
                  {" "}
                  </>
                ) : null}
                {" "}
                {v.pushOff ? (
                  <>
                  {" "}
                  <button className="btn btn-cta btn-lg btn-block tap" onClick={v.askPush} style={{ marginTop: "22px" }}>
                    Turn on notifications
                  </button>
                  {" "}
                  </>
                ) : null}
                {" "}
                <button className="btn btn-ghost btn-block" onClick={v.next} style={{ marginTop: "8px", border: "0" }}>
                  {v.pushNext}
                </button>
                {" "}
              </div>
              {" "}
              </>
            ) : null}
            {" "}
            {v.s2 ? (
              <>
              {" "}
              <div className="rise">
                {" "}
                <div style={{ width: "150px", height: "150px", margin: "0 auto", borderRadius: "40px", background: "var(--card)", border: "1px solid var(--line)", display: "grid", placeItems: "center", boxShadow: "var(--shadow)" }}>
                  {" "}
                  <span className="logo-mark" style={{ width: "84px", height: "84px", borderRadius: "26px", fontSize: "46px" }}>
                    S
                  </span>
                  {" "}
                </div>
                {" "}
                <h1 style={{ marginTop: "20px", fontSize: "34px", lineHeight: "1.02", fontWeight: "800" }}>
                  Put Sekretly on your home screen
                </h1>
                {" "}
                <p className="muted" style={{ marginTop: "10px", fontSize: "16px", lineHeight: "1.5" }}>
                  Opens like an app, loads faster, and on iPhone it is the only way to get notifications.
                </p>
                {" "}
                <div role="tablist" aria-label="Your phone" style={{ display: "inline-flex", gap: "6px", marginTop: "16px", padding: "4px", borderRadius: "99px", background: "var(--card)", border: "1px solid var(--line)" }}>
                  {" "}
                  {(v.osTabs || []).map((o, i0) => (
                    <Fragment key={i0}>
                    {" "}
                    <button role="tab" aria-selected={o.on} className={`chip tap ${o.cls}`} onClick={o.pick} style={{ border: "0" }}>
                      {o.label}
                    </button>
                    {" "}
                    </Fragment>
                  ))}
                  {" "}
                </div>
                {" "}
                {v.installed ? (
                  <>
                  {" "}
                  <div className="pill pop" style={{ marginTop: "16px", background: "#0d7f4b", color: "#ffffff" }}>
                    ✓ Installed on your home screen
                  </div>
                  {" "}
                  </>
                ) : null}
                {" "}
                {v.isAndroid ? (
                  <>
                  {" "}
                  {v.notInstalled ? (
                    <>
                    {" "}
                    <button className="btn btn-cta btn-lg btn-block tap" onClick={v.askInstall} style={{ marginTop: "18px" }}>
                      Install Sekretly
                    </button>
                    {" "}
                    {v.manual ? (
                      <>
                      <p className="muted" style={{ marginTop: "10px", fontSize: "13.5px", lineHeight: "1.5" }}>
                        {"Open your browser menu (⋮) and tap "}
                        <b>
                          Install app
                        </b>
                        {" or "}
                        <b>
                          Add to Home screen
                        </b>
                        .
                      </p>
                      </>
                    ) : null}
                    {" "}
                    </>
                  ) : null}
                  {" "}
                  </>
                ) : null}
                {" "}
                {v.isIos ? (
                  <>
                  {" "}
                  <ol className="card" style={{ listStyle: "none", margin: "18px 0 0", padding: "6px 0", textAlign: "left" }}>
                    {" "}
                    <li className="list-row">
                      <span className="pill">
                        1
                      </span>
                      {"Open this page in "}
                      <b>
                        Safari
                      </b>
                    </li>
                    {" "}
                    <li className="list-row">
                      <span className="pill">
                        2
                      </span>
                      {"Tap "}
                      <b>
                        Share
                      </b>
                      {" "}
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <path d="M12 3v13" />
                        <path d="m7 8 5-5 5 5" />
                        <path d="M5 12v8h14v-8" />
                      </svg>
                    </li>
                    {" "}
                    <li className="list-row">
                      <span className="pill">
                        3
                      </span>
                      {"Choose "}
                      <b>
                        Add to Home Screen
                      </b>
                    </li>
                    {" "}
                  </ol>
                  {" "}
                  </>
                ) : null}
                {" "}
                <SkLink href={route(v.finishHref)} onClick={v.finish} className="btn btn-lg btn-block tap" style={{ marginTop: "10px" }}>
                  {v.finishLabel}
                </SkLink>
                {" "}
                {v.fromLink ? (
                  <>
                  <SkLink href="/create" onClick={v.finish} className="btn btn-ghost btn-block tap" style={{ marginTop: "6px", border: "0" }}>
                    Make my own link too
                  </SkLink>
                  </>
                ) : null}
                {" "}
                <SkLink href="/home" onClick={v.finish} className="muted" style={{ display: "inline-flex", minHeight: "44px", alignItems: "center", marginTop: "6px", fontWeight: "700", fontSize: "14px" }}>
                  Skip to home
                </SkLink>
                {" "}
              </div>
              {" "}
              </>
            ) : null}
            {" "}
          </div>
          {" "}
        </main>
        {" "}
        {v.pushPrompt ? (
          <>
          {" "}
          <div style={{ position: "fixed", inset: "0", zIndex: "50", background: "rgba(0,0,0,.35)" }}>
            {" "}
            <div role="dialog" aria-label="Browser permission" className="rise" style={{ position: "absolute", top: "10px", left: "0", right: "0", margin: "0 auto", width: "min(94%, 360px)", background: "#ffffff", color: "#202124", borderRadius: "14px", boxShadow: "0 10px 40px rgba(0,0,0,.4)", padding: "16px", fontFamily: "Roboto, system-ui, sans-serif" }}>
              {" "}
              <div style={{ fontSize: "14px" }}>
                <b>
                  sekretlyy.vercel.app
                </b>
                {" wants to"}
              </div>
              {" "}
              <div style={{ display: "flex", alignItems: "center", gap: "10px", marginTop: "10px", fontSize: "14px" }}>
                {" "}
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#5f6368" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
                  <path d="M10.3 21a1.9 1.9 0 0 0 3.4 0" />
                </svg>
                {"Show notifications "}
              </div>
              {" "}
              <div style={{ display: "flex", justifyContent: "flex-end", gap: "8px", marginTop: "16px" }}>
                {" "}
                <button onClick={v.blockPush} style={{ minHeight: "40px", padding: "0 16px", borderRadius: "20px", border: "1px solid #dadce0", background: "#ffffff", color: "#1a73e8", fontWeight: "600" }}>
                  Block
                </button>
                {" "}
                <button onClick={v.allowPush} style={{ minHeight: "40px", padding: "0 16px", borderRadius: "20px", border: "0", background: "#1a73e8", color: "#ffffff", fontWeight: "600" }}>
                  Allow
                </button>
                {" "}
              </div>
              {" "}
            </div>
            {" "}
          </div>
          {" "}
          </>
        ) : null}
        {" "}
        {v.installPrompt ? (
          <>
          {" "}
          <div style={{ position: "fixed", inset: "0", zIndex: "50", background: "rgba(0,0,0,.45)", display: "flex", alignItems: "center", justifyContent: "center", padding: "20px" }}>
            {" "}
            <div role="dialog" aria-label="Install app" className="pop" style={{ width: "min(100%, 340px)", background: "#ffffff", color: "#202124", borderRadius: "16px", boxShadow: "0 10px 40px rgba(0,0,0,.4)", padding: "20px", fontFamily: "Roboto, system-ui, sans-serif" }}>
              {" "}
              <div style={{ fontSize: "18px", fontWeight: "500" }}>
                Install app?
              </div>
              {" "}
              <div style={{ display: "flex", alignItems: "center", gap: "12px", marginTop: "16px" }}>
                {" "}
                <span className="logo-mark" style={{ width: "44px", height: "44px", borderRadius: "12px", fontSize: "22px" }}>
                  S
                </span>
                {" "}
                <div>
                  <div style={{ fontWeight: "600" }}>
                    Sekretly
                  </div>
                  <div style={{ fontSize: "13px", color: "#5f6368" }}>
                    sekretlyy.vercel.app
                  </div>
                </div>
                {" "}
              </div>
              {" "}
              <div style={{ display: "flex", justifyContent: "flex-end", gap: "8px", marginTop: "20px" }}>
                {" "}
                <button onClick={v.cancelInstall} style={{ minHeight: "40px", padding: "0 16px", borderRadius: "20px", border: "0", background: "transparent", color: "#1a73e8", fontWeight: "600" }}>
                  Cancel
                </button>
                {" "}
                <button onClick={v.doInstall} style={{ minHeight: "40px", padding: "0 18px", borderRadius: "20px", border: "0", background: "#1a73e8", color: "#ffffff", fontWeight: "600" }}>
                  Install
                </button>
                {" "}
              </div>
              {" "}
            </div>
            {" "}
          </div>
          {" "}
          </>
        ) : null}
        {" "}
      </div>
      {" "}
      </>
    );
  }
}
