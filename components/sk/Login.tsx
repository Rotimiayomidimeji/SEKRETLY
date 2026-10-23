// @ts-nocheck -- ported 1:1 from design/mockup/Login.dc.html by scripts/port-mockup.mjs; typed as it gets wired to real data
"use client";

import React, { Fragment } from "react";
import { saveMode, SkLink } from "@/lib/sk/runtime";


export default class Login extends React.Component<Record<string, any>, any> {
  static defaultProps = {"mode":"dark"};

  constructor(props) {
    super(props);
    var m = null; // light/dark arrives as props.mode from the sk-mode cookie
    this.state = { mode: m || props.mode || 'dark', user: '', pass: '', tries: 0, shake: 0 };
  }
  componentDidMount() {
    var self = this;
    this.onStore = function (e) { if (e.key === 'sk-mode' && e.newValue) self.setState({ mode: e.newValue }); };
    try { window.addEventListener('storage', this.onStore); } catch (e) {}
  }
  componentWillUnmount() { try { window.removeEventListener('storage', this.onStore); } catch (e) {} }
  componentDidUpdate(prev) { if (prev.mode !== this.props.mode && this.props.mode) this.setState({ mode: this.props.mode }); }
  renderVals() {
    var self = this, s = this.state, dark = s.mode !== 'light';
    var correct = false; // the server decides
    var locked = !!s.locked;
    return {
      mode: dark ? 'dark' : 'light', isDark: dark, isLight: !dark, modeWord: dark ? 'Light' : 'Dark',
      toggleMode: function () { var n = dark ? 'light' : 'dark'; saveMode(n); self.setState({ mode: n }); },
      user: s.user, pass: s.pass,
      onUser: function (e) { self.setState({ user: e.target.value }); },
      onPass: function (e) { self.setState({ pass: e.target.value }); },
      ok: correct, notOk: !correct,
      err: s.tries > 0 && !correct,
      errMsg: locked ? 'Too many tries. Wait 15 minutes, or reset your password.' : 'That username and password do not match. ' + (s.left == null ? 5 - s.tries : s.left) + (s.left === 1 ? ' try left.' : ' tries left.'),
      locked: locked,
      btnLabel: locked ? 'Locked for 15 minutes' : s.busy ? 'Logging in…' : 'Log in',
      shakeCls: s.shake % 2 ? 'shake' : '',
      attempt: function () {
        if (locked || s.busy) return;
        self.setState({ busy: true });
        self.props.login({ username: s.user, password: s.pass, next: self.props.next || '' }).then(function (r) {
          if (!r) return;
          self.setState({ busy: false, tries: self.state.tries + 1, shake: self.state.shake + 1, left: r.left, locked: !!r.locked });
        });
      }
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
        <main style={{ flex: "1", display: "flex", alignItems: "center", justifyContent: "center", padding: "12px 20px 40px" }}>
          {" "}
          <div className={`card rise ${v.shakeCls}`} style={{ width: "100%", maxWidth: "420px", padding: "24px", boxShadow: "var(--shadow)" }}>
            {" "}
            <img className="float" src="/sk/shushing_face.png" alt="" style={{ width: "64px", height: "64px" }} />
            {" "}
            <h1 style={{ marginTop: "10px", fontSize: "32px", fontWeight: "800" }}>
              Welcome back
            </h1>
            {" "}
            <p className="muted" style={{ marginTop: "6px", fontSize: "15px" }}>
              Your secrets missed you.
            </p>
            {" "}
            <div style={{ marginTop: "20px" }}>
              {" "}
              <label htmlFor="li-user" className="label">
                Username
              </label>
              {" "}
              <input id="li-user" className="field" value={v.user ?? ""} onChange={v.onUser} autoComplete="username" placeholder="peach" />
              {" "}
            </div>
            {" "}
            <div style={{ marginTop: "14px" }}>
              {" "}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                {" "}
                <label htmlFor="li-pass" className="label">
                  Password
                </label>
                {" "}
                <SkLink href="/forgot-password" className="pink" style={{ fontSize: "13.5px", fontWeight: "700" }}>
                  Forgot password?
                </SkLink>
                {" "}
              </div>
              {" "}
              <input id="li-pass" className="field" type="password" value={v.pass ?? ""} onChange={v.onPass} autoComplete="current-password" placeholder="Your password" />
              {" "}
            </div>
            {" "}
            {v.err ? (
              <>
              {" "}
              <div role="alert" style={{ marginTop: "12px", padding: "12px 14px", borderRadius: "14px", background: "var(--card2)", color: "var(--bad)", fontSize: "14px", fontWeight: "700" }}>
                {v.errMsg}
              </div>
              {" "}
              </>
            ) : null}
            {" "}
            {v.ok ? (
              <>
              {" "}
              <SkLink href="/home" className="btn btn-cta btn-lg btn-block tap" style={{ marginTop: "18px" }}>
                Log in
              </SkLink>
              {" "}
              </>
            ) : null}
            {" "}
            {v.notOk ? (
              <>
              {" "}
              <button className="btn btn-cta btn-lg btn-block tap" onClick={v.attempt} disabled={!!(v.locked)} style={{ marginTop: "18px" }}>
                {v.btnLabel}
              </button>
              {" "}
              </>
            ) : null}
            {" "}
            <p className="muted" style={{ marginTop: "16px", textAlign: "center", fontSize: "14px" }}>
              {"New here? "}
              <SkLink href="/signup" className="pink" style={{ fontWeight: "700" }}>
                Create an account
              </SkLink>
            </p>
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
