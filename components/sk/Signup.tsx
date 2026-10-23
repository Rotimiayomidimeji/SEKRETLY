// @ts-nocheck -- ported 1:1 from design/mockup/Signup.dc.html by scripts/port-mockup.mjs; typed as it gets wired to real data
"use client";

import React, { Fragment } from "react";
import { saveMode, SkLink } from "@/lib/sk/runtime";


export default class Signup extends React.Component<Record<string, any>, any> {
  static defaultProps = {"mode":"dark"};

  constructor(props) {
    super(props);
    var m = null; // light/dark arrives as props.mode from the sk-mode cookie
    this.state = { mode: m || props.mode || 'dark', av: 0, user: '', pass: '', show: false, dob: '', emailOpen: false, terms: false, email: '' };
  }
  componentDidMount() {
    var self = this;
    this.onStore = function (e) { if (e.key === 'sk-mode' && e.newValue) self.setState({ mode: e.newValue }); };
    try { window.addEventListener('storage', this.onStore); } catch (e) {}
  }
  componentWillUnmount() { try { window.removeEventListener('storage', this.onStore); } catch (e) {} }
  componentDidUpdate(prev) { if (prev.mode !== this.props.mode && this.props.mode) this.setState({ mode: this.props.mode }); }
  // asks the server whether a username is free (debounced) and remembers each answer
  lookUp(v) {
    var self = this, key = v.toLowerCase();
    clearTimeout(this.lt);
    if (!/^[A-Za-z0-9_]{3,20}$/.test(v) || (this.state.taken || {})[key] !== undefined) return;
    this.lt = setTimeout(function () {
      self.props.checkUsername(key).then(function (r) {
        var t = Object.assign({}, self.state.taken); t[key] = !r.available; self.setState({ taken: t });
      });
    }, 300);
  }
  // creates the account; the server logs the person in and moves them on (verify email, or onboarding)
  submit() {
    var self = this, s = this.state;
    if (s.busy) return;
    this.setState({ busy: true, error: null });
    this.props.signup({ username: s.user, password: s.pass, birthDate: s.dob, avatar: ['fox', 'panda', 'frog', 'octopus', 'unicorn', 'koala'][s.av % 6], email: s.emailOpen ? s.email : '', acceptedTerms: s.terms })
      .then(function (r) {
        if (!r) return;
        var t = Object.assign({}, self.state.taken);
        if (r.taken) t[s.user.toLowerCase()] = true;
        self.setState({ busy: false, error: r.error || null, taken: t });
      });
  }
  renderVals() {
    var self = this, s = this.state, dark = s.mode !== 'light';
    var avatars = [
      { name: 'fox', src: '/sk/fox.png', bg: 'linear-gradient(135deg,#ffb35c,#ff5f8f)' },
      { name: 'panda', src: '/sk/panda.png', bg: 'linear-gradient(135deg,#7ef0c1,#3aa0ff)' },
      { name: 'frog', src: '/sk/frog.png', bg: 'linear-gradient(135deg,#d6ff6b,#22c4a0)' },
      { name: 'octopus', src: '/sk/octopus.png', bg: 'linear-gradient(135deg,#ffd0f0,#a46bff)' },
      { name: 'unicorn', src: '/sk/unicorn.png', bg: 'linear-gradient(135deg,#9fe7ff,#ff9ad5)' },
      { name: 'koala', src: '/sk/koala.png', bg: 'linear-gradient(135deg,#ffe48a,#ff8a5c)' }
    ];
    var av = avatars[s.av % avatars.length];
    var ok = dark ? '#5be0a0' : '#0d7f4b', bad = dark ? '#ff8b98' : '#c4213a', muted = dark ? '#bcaec2' : '#665e74';
    var line = dark ? 'rgba(255,255,255,.11)' : 'rgba(48,34,72,.13)';
    var known = (s.taken || {})[s.user.toLowerCase()];
    var u = s.user, us = 'empty';
    if (u.length) us = !/^[A-Za-z0-9_]{3,20}$/.test(u) ? 'invalid' : (known === undefined ? 'checking' : (known ? 'taken' : 'ok'));
    var userMsg = { checking: 'Checking @' + u + '…', empty: '3–20 letters, numbers or _', invalid: 'Use 3–20 letters, numbers or _ only', taken: '@' + u + ' is taken. Try ' + u + '_' + (u.length + 7) + '?', ok: 'Nice, @' + u + ' is yours' }[us];
    var p = s.pass, score = 0;
    if (p.length >= 8) score = 1;
    if (p.length >= 8 && /[0-9]/.test(p) && /[A-Za-z]/.test(p)) score = 2;
    if (p.length >= 12 && /[0-9]/.test(p) && /[^A-Za-z0-9]/.test(p)) score = 3;
    var c = score ? ['#ff8b98', '#ffc048', '#5be0a0'][score - 1] : line;
    var age = null;
    if (s.dob) {
      var b = new Date(s.dob), now = new Date();
      age = now.getFullYear() - b.getFullYear();
      if (now.getMonth() < b.getMonth() || (now.getMonth() === b.getMonth() && now.getDate() < b.getDate())) age--;
    }
    var ds = age === null ? 'empty' : (age < 16 ? 'young' : 'ok');
    var valid = us === 'ok' && score >= 1 && ds === 'ok' && s.terms;
    return {
      mode: dark ? 'dark' : 'light', isDark: dark, isLight: !dark, modeWord: dark ? 'Light' : 'Dark',
      toggleMode: function () { var n = dark ? 'light' : 'dark'; saveMode(n); self.setState({ mode: n }); },
      avSrc: av.src, avBg: av.bg, avName: av.name,
      shuffle: function () { self.setState({ av: s.av + 1 }); },
      user: u, onUser: function (e) { var v = e.target.value.replace(/\s/g, ''); self.setState({ user: v, error: null }); self.lookUp(v); },
      userLine: us === 'ok' ? ok : (us === 'empty' || us === 'checking' ? line : bad),
      userMsg: userMsg, userMsgColor: us === 'ok' ? ok : (us === 'empty' || us === 'checking' ? muted : bad),
      pass: p, onPass: function (e) { self.setState({ pass: e.target.value }); },
      passType: s.show ? 'text' : 'password', passToggle: s.show ? 'Hide' : 'Show',
      togglePass: function () { self.setState({ show: !s.show }); },
      bar1: score >= 1 ? c : line, bar2: score >= 2 ? c : line, bar3: score >= 3 ? c : line,
      passMsg: !p.length ? 'At least 8 characters' : (score === 0 ? (8 - p.length) + ' more to go' : ['', 'Okay. Add a number to make it stronger.', 'Good password', 'Strong password'][score]),
      dob: s.dob, onDob: function (e) { self.setState({ dob: e.target.value }); },
      dobLine: ds === 'young' ? bad : line,
      dobMsg: ds === 'young' ? 'Sekretly is for people 16 and older.' : 'Never shown on your profile.',
      dobMsgColor: ds === 'young' ? bad : muted,
      emailOpen: s.emailOpen, emailSign: s.emailOpen ? '−' : '+',
      toggleEmail: function () { self.setState({ emailOpen: !s.emailOpen }); },
      email: s.email, onEmail: function (e) { self.setState({ email: e.target.value }); },
      nextHref: s.emailOpen && /.+@.+..+/.test(s.email.trim()) ? 'Verify.dc.html' : 'Onboarding.dc.html',
      submit: function () { self.submit(); }, busy: !!s.busy, ctaLabel: s.busy ? 'Creating your account…' : 'Create my account',
      hasError: !!s.error, error: s.error || '',
      terms: s.terms, onTerms: function (e) { self.setState({ terms: e.target.checked }); },
      canGo: valid, cantGo: !valid
    };
  }

  render() {
    // like the mockup runtime: the template sees the props merged with renderVals()
    const v = { ...this.props, ...(this.renderVals() || {}) };
    return (
      <>
      {" "}
      <div className="sk" data-mode={v.mode} style={{ display: "flex", flexWrap: "wrap" }}>
        {" "}
        <aside className="au-side" style={{ flex: "1 1 420px", minWidth: "0", position: "relative", overflow: "hidden", flexDirection: "column", justifyContent: "space-between", padding: "40px 48px", background: "radial-gradient(120% 80% at 80% 0%,#6a1450 0%,#24092f 52%,#0c0811 100%)", color: "#ffffff", minHeight: "100vh" }}>
          {" "}
          <SkLink href="/" className="logo">
            <span className="logo-mark">
              S
            </span>
            <span className="logo-word">
              Sekretly
            </span>
          </SkLink>
          {" "}
          <div style={{ position: "relative" }}>
            {" "}
            <h2 style={{ fontSize: "clamp(40px, 5cqi, 64px)", lineHeight: ".98", fontWeight: "800", maxWidth: "11ch" }}>
              Your people have things to say.
            </h2>
            {" "}
            <p style={{ marginTop: "16px", fontSize: "17px", lineHeight: "1.5", color: "rgba(255,255,255,.82)", maxWidth: "34ch" }}>
              Make a link, drop it on your story, and watch the honest answers roll in.
            </p>
            {" "}
            <div style={{ marginTop: "36px", display: "flex", flexDirection: "column", gap: "12px", alignItems: "flex-start" }}>
              {" "}
              <div className="float" style={{ background: "#ff5fa2", color: "#24061a", padding: "14px 18px", borderRadius: "22px 22px 22px 6px", fontWeight: "700", fontSize: "16px" }}>
                you make every room less awkward
              </div>
              {" "}
              <div className="float2" style={{ marginLeft: "60px", background: "#ffffff", color: "#24061a", padding: "14px 18px", borderRadius: "22px 22px 6px 22px", fontWeight: "700", fontSize: "16px" }}>
                9/10. Minus one for always being late.
              </div>
              {" "}
              <div className="float" style={{ marginLeft: "20px", background: "#22e1ff", color: "#04232b", padding: "14px 18px", borderRadius: "22px 22px 22px 6px", fontWeight: "700", fontSize: "16px" }}>
                loyal · funny · chaotic
              </div>
              {" "}
            </div>
            {" "}
            <img className="float2" src="/sk/shushing_face.png" alt="" style={{ position: "absolute", right: "0", top: "-40px", width: "110px", height: "110px" }} />
            {" "}
          </div>
          {" "}
          <p style={{ fontSize: "13px", color: "rgba(255,255,255,.72)" }}>
            16+ only · Anonymous to everyone
          </p>
          {" "}
        </aside>
        {" "}
        <main style={{ flex: "999 1 420px", minWidth: "0", display: "flex", justifyContent: "center", padding: "16px 20px 32px" }}>
          {" "}
          <div style={{ width: "100%", maxWidth: "440px" }}>
            {" "}
            <header style={{ display: "flex", alignItems: "center", gap: "8px", paddingBottom: "16px" }}>
              {" "}
              <SkLink href="/" className="logo">
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
                <span>
                  {v.modeWord}
                </span>
                {" "}
              </button>
              {" "}
            </header>
            {" "}
            <div className="rise">
              {" "}
              <h1 style={{ fontSize: "34px", lineHeight: "1.02", fontWeight: "800" }}>
                Make your Sekretly
              </h1>
              {" "}
              <p className="muted" style={{ marginTop: "8px", fontSize: "15px" }}>
                No phone number. No real name. Just a username.
              </p>
              {" "}
              <div className="card" style={{ display: "flex", alignItems: "center", gap: "14px", marginTop: "20px", padding: "14px" }}>
                {" "}
                <span style={{ width: "68px", height: "68px", borderRadius: "22px", background: v.avBg, display: "grid", placeItems: "center", flex: "none" }}>
                  {" "}
                  <img className="pop" src={v.avSrc} alt={`Your avatar, a ${v.avName}`} style={{ width: "52px", height: "52px" }} />
                  {" "}
                </span>
                {" "}
                <div style={{ flex: "1", minWidth: "0" }}>
                  {" "}
                  <div style={{ fontWeight: "700", fontSize: "15px" }}>
                    Your avatar
                  </div>
                  {" "}
                  <div className="muted" style={{ fontSize: "13.5px" }}>
                    {"A random "}{v.avName}. Change it anytime.
                  </div>
                  {" "}
                </div>
                {" "}
                <button className="icon-btn tap" onClick={v.shuffle} aria-label="Shuffle avatar" style={{ width: "48px", height: "48px" }}>
                  {" "}
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M16 3h5v5" />
                    <path d="M4 20 21 3" />
                    <path d="M21 16v5h-5" />
                    <path d="M15 15l6 6" />
                    <path d="M4 4l5 5" />
                  </svg>
                  {" "}
                </button>
                {" "}
              </div>
              {" "}
              <div style={{ marginTop: "16px" }}>
                {" "}
                <label htmlFor="su-user" className="label">
                  Username
                </label>
                {" "}
                <div style={{ display: "flex", alignItems: "center", minHeight: "54px", borderRadius: "16px", border: `1px solid ${v.userLine}`, background: "var(--field)", padding: "0 14px" }}>
                  {" "}
                  <span className="muted" style={{ fontSize: "15px" }}>
                    sekretly.com/
                  </span>
                  {" "}
                  <input id="su-user" value={v.user ?? ""} onChange={v.onUser} autoComplete="username" placeholder="yourname" maxLength="20" style={{ flex: "1", minWidth: "0", border: "0", background: "transparent", color: "var(--ink)", fontSize: "16px", fontWeight: "700", outline: "none", padding: "14px 0" }} />
                  {" "}
                </div>
                {" "}
                <div className="hint" style={{ color: v.userMsgColor }}>
                  {v.userMsg}
                </div>
                {" "}
              </div>
              {" "}
              <div style={{ marginTop: "14px" }}>
                {" "}
                <label htmlFor="su-pass" className="label">
                  Password
                </label>
                {" "}
                <div style={{ display: "flex", alignItems: "center", minHeight: "54px", borderRadius: "16px", border: "1px solid var(--line)", background: "var(--field)", padding: "0 6px 0 14px" }}>
                  {" "}
                  <input id="su-pass" type={v.passType} value={v.pass ?? ""} onChange={v.onPass} autoComplete="new-password" placeholder="At least 8 characters" style={{ flex: "1", minWidth: "0", border: "0", background: "transparent", color: "var(--ink)", fontSize: "16px", outline: "none", padding: "14px 0" }} />
                  {" "}
                  <button className="tap pink" onClick={v.togglePass} style={{ minHeight: "44px", padding: "0 12px", border: "0", background: "transparent", fontWeight: "700", fontSize: "14px" }}>
                    {v.passToggle}
                  </button>
                  {" "}
                </div>
                {" "}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: "6px", marginTop: "8px" }} aria-hidden="true">
                  {" "}
                  <span style={{ height: "5px", borderRadius: "9px", background: v.bar1 }} />
                  {" "}
                  <span style={{ height: "5px", borderRadius: "9px", background: v.bar2 }} />
                  {" "}
                  <span style={{ height: "5px", borderRadius: "9px", background: v.bar3 }} />
                  {" "}
                </div>
                {" "}
                <div className="hint">
                  {v.passMsg}
                </div>
                {" "}
              </div>
              {" "}
              <div style={{ marginTop: "14px" }}>
                {" "}
                <label htmlFor="su-dob" className="label">
                  Date of birth
                </label>
                {" "}
                <input id="su-dob" className="field" type="date" value={v.dob ?? ""} onChange={v.onDob} max="2026-10-19" style={{ borderColor: v.dobLine }} />
                {" "}
                <div className="hint" style={{ color: v.dobMsgColor }}>
                  {v.dobMsg}
                </div>
                {" "}
              </div>
              {" "}
              <div style={{ marginTop: "14px", borderRadius: "16px", border: "1px dashed var(--line)", padding: "4px 14px" }}>
                {" "}
                <button className="tap" onClick={v.toggleEmail} aria-expanded={v.emailOpen} style={{ width: "100%", minHeight: "48px", border: "0", background: "transparent", color: "var(--ink)", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0", fontWeight: "700", fontSize: "14px" }}>
                  {" "}
                  <span>
                    {"Recovery email "}
                    <span className="muted" style={{ fontWeight: "500" }}>
                      · optional, recommended
                    </span>
                  </span>
                  {" "}
                  <span aria-hidden="true" className="pink" style={{ fontSize: "20px" }}>
                    {v.emailSign}
                  </span>
                  {" "}
                </button>
                {" "}
                {v.emailOpen ? (
                  <>
                  {" "}
                  <div style={{ paddingBottom: "12px" }}>
                    {" "}
                    <label htmlFor="su-email" className="sr">
                      Recovery email
                    </label>
                    {" "}
                    <input id="su-email" className="field" type="email" value={v.email ?? ""} onChange={v.onEmail} placeholder="you@example.com" />
                    {" "}
                    <p className="hint" style={{ lineHeight: "1.45" }}>
                      Only used to reset your password. Without it, a forgotten password means a lost account.
                    </p>
                    {" "}
                  </div>
                  {" "}
                  </>
                ) : null}
                {" "}
              </div>
              {" "}
              <label style={{ display: "flex", gap: "12px", alignItems: "flex-start", marginTop: "16px", fontSize: "14px", lineHeight: "1.45", cursor: "pointer" }}>
                {" "}
                <input type="checkbox" checked={!!(v.terms)} onChange={v.onTerms} style={{ width: "22px", height: "22px", margin: "0", accentColor: "#d81b72", flex: "none" }} />
                {" "}
                <span>
                  {"I accept the "}
                  <SkLink href="/legal" className="pink">
                    Terms
                  </SkLink>
                  {", "}
                  <SkLink href="/legal" className="pink">
                    Privacy Policy
                  </SkLink>
                  {" and "}
                  <SkLink href="/safety" className="pink">
                    Community Rules
                  </SkLink>
                  .
                </span>
                {" "}
              </label>
              {" "}
              {v.hasError ? (
                <>
                <p role="alert" style={{ marginTop: "14px", fontSize: "14px", fontWeight: "700", color: "var(--bad)" }}>
                  {v.error}
                </p>
                </>
              ) : null}
              {" "}
              {v.canGo ? (
                <>
                {" "}
                <button onClick={v.submit} disabled={!!(v.busy)} className="btn btn-cta btn-lg btn-block tap" style={{ marginTop: "18px" }}>
                  {v.ctaLabel}
                </button>
                {" "}
                </>
              ) : null}
              {" "}
              {v.cantGo ? (
                <>
                {" "}
                <button className="btn btn-cta btn-lg btn-block" disabled={!!(true)} style={{ marginTop: "18px" }}>
                  Create my account
                </button>
                {" "}
                </>
              ) : null}
              {" "}
              <p className="muted" style={{ marginTop: "14px", textAlign: "center", fontSize: "14px" }}>
                {"Already have an account? "}
                <SkLink href="/login" className="pink" style={{ fontWeight: "700" }}>
                  Log in
                </SkLink>
              </p>
              {" "}
            </div>
            {" "}
          </div>
          {" "}
        </main>
        {" "}
      </div>
      {" "}
      </>
    );
  }
}
