// @ts-nocheck -- ported 1:1 from design/mockup/Forgot.dc.html by scripts/port-mockup.mjs; typed as it gets wired to real data
"use client";

import React, { Fragment } from "react";
import { saveMode, SkLink } from "@/lib/sk/runtime";


export default class Forgot extends React.Component<Record<string, any>, any> {
  static defaultProps = {"mode":"dark"};

  constructor(props) {
    super(props);
    var m = null; // light/dark arrives as props.mode from the sk-mode cookie
    this.state = { mode: m || props.mode || 'dark', step: 0, user: '', tried: false, code: '', np: '', resent: false };
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
    var line = dark ? 'rgba(255,255,255,.11)' : 'rgba(48,34,72,.13)';
    var hasEmail = s.hasEmail !== false;
    return {
      mode: dark ? 'dark' : 'light', isDark: dark, isLight: !dark, modeWord: dark ? 'Light' : 'Dark',
      toggleMode: function () { var n = dark ? 'light' : 'dark'; saveMode(n); self.setState({ mode: n }); },
      bars: [0, 1, 2].map(function (i) { return { c: i <= Math.min(s.step, 2) ? '#d81b72' : line }; }),
      s0: s.step === 0, s1: s.step === 1, s2: s.step === 2, s3: s.step === 3,
      user: s.user, onUser: function (e) { self.setState({ user: e.target.value.trim(), tried: false, hasEmail: null, err: null }); },
      noUser: s.user.length < 3 || !!s.busy,
      noEmail: s.tried && !hasEmail,
      sendCode: function () {
        if (s.busy) return;
        self.setState({ busy: true, err: null });
        self.props.startReset(s.user).then(function (r) {
          if (r.ok) self.setState({ busy: false, step: 1, masked: r.masked });
          else if (r.noEmail) self.setState({ busy: false, tried: true, hasEmail: false });
          else self.setState({ busy: false, err: r.error });
        });
      },
      code: s.code, onCode: function (e) { self.setState({ code: e.target.value.replace(/\D/g, '').slice(0, 6) }); },
      codeShort: s.code.length < 6,
      verify: function () {
        if (s.busy) return;
        self.setState({ busy: true, err: null });
        self.props.checkReset(s.user, s.code).then(function (r) { self.setState(r.ok ? { busy: false, step: 2 } : { busy: false, err: r.error }); });
      },
      resend: function () { self.setState({ resent: true, err: null }); self.props.startReset(s.user); },
      resendLabel: s.resent ? 'New code sent' : 'Resend code',
      np: s.np, onNp: function (e) { self.setState({ np: e.target.value }); },
      npOk: s.np.length >= 8,
      npHint: s.np.length >= 8 ? 'Looks good' : (8 - s.np.length) + ' more characters',
      finish: function () {
        if (s.busy) return;
        self.setState({ busy: true, err: null });
        self.props.finishReset(s.user, s.code, s.np).then(function (r) { self.setState(r.ok ? { busy: false, step: 3 } : { busy: false, err: r.error }); });
      },
      hasErr: !!s.err, err: s.err || '', masked: s.masked || ''
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
          <SkLink href="/login" className="icon-btn tap" aria-label="Back to log in">
            {" "}
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M15 18 9 12l6-6" />
            </svg>
            {" "}
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
          <div className="card rise" style={{ width: "100%", maxWidth: "420px", padding: "24px", boxShadow: "var(--shadow)" }}>
            {" "}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: "6px" }} aria-hidden="true">
              {" "}
              {(v.bars || []).map((b, i0) => (
                <Fragment key={i0}>
                <span style={{ height: "5px", borderRadius: "9px", background: b.c }} />
                </Fragment>
              ))}
              {" "}
            </div>
            {" "}
            {v.hasErr ? (
              <>
              <p role="alert" style={{ marginTop: "14px", fontSize: "14px", fontWeight: "700", color: "var(--bad)" }}>
                {v.err}
              </p>
              </>
            ) : null}
            {" "}
            {v.s0 ? (
              <>
              {" "}
              <div style={{ marginTop: "18px" }}>
                {" "}
                <h1 style={{ fontSize: "30px", fontWeight: "800" }}>
                  Forgot your password?
                </h1>
                {" "}
                <p className="muted" style={{ marginTop: "6px", fontSize: "15px", lineHeight: "1.5" }}>
                  Enter your username. If it has a recovery email, we will send a 6-digit code.
                </p>
                {" "}
                <label htmlFor="fg-user" className="label" style={{ marginTop: "18px" }}>
                  Username
                </label>
                {" "}
                <input id="fg-user" className="field" value={v.user ?? ""} onChange={v.onUser} placeholder="peach" />
                {" "}
                {v.noEmail ? (
                  <>
                  {" "}
                  <div role="alert" style={{ marginTop: "12px", padding: "12px 14px", borderRadius: "14px", background: "var(--card2)", fontSize: "14px", lineHeight: "1.5" }}>
                    {" "}
                    <b>
                      @{v.user}{" has no recovery email."}
                    </b>
                    {" We cannot reset this account. You can "}
                    <SkLink href="/signup" className="pink" style={{ fontWeight: "700" }}>
                      start a new one
                    </SkLink>
                    {", and add a recovery email this time. "}
                  </div>
                  {" "}
                  </>
                ) : null}
                {" "}
                <button className="btn btn-cta btn-lg btn-block tap" onClick={v.sendCode} disabled={!!(v.noUser)} style={{ marginTop: "18px" }}>
                  Send code
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
              <div style={{ marginTop: "18px" }}>
                {" "}
                <img className="pop" src="/sk/love_letter.png" alt="" style={{ width: "56px", height: "56px" }} />
                {" "}
                <h1 style={{ marginTop: "8px", fontSize: "30px", fontWeight: "800" }}>
                  Check your email
                </h1>
                {" "}
                <p className="muted" style={{ marginTop: "6px", fontSize: "15px", lineHeight: "1.5" }}>
                  {"We sent a code to "}
                  <b style={{ color: "var(--ink)" }}>
                    {v.masked}
                  </b>
                  . It expires in 10 minutes.
                </p>
                {" "}
                <label htmlFor="fg-code" className="label" style={{ marginTop: "18px" }}>
                  6-digit code
                </label>
                {" "}
                <input id="fg-code" className="field" value={v.code ?? ""} onChange={v.onCode} inputMode="numeric" maxLength="6" placeholder="••••••" style={{ fontSize: "26px", letterSpacing: ".5em", textAlign: "center", fontWeight: "800" }} />
                {" "}
                <button className="btn btn-cta btn-lg btn-block tap" onClick={v.verify} disabled={!!(v.codeShort)} style={{ marginTop: "18px" }}>
                  Verify
                </button>
                {" "}
                <button className="btn btn-ghost btn-block" onClick={v.resend} style={{ marginTop: "8px", border: "0" }}>
                  {v.resendLabel}
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
              <div style={{ marginTop: "18px" }}>
                {" "}
                <h1 style={{ fontSize: "30px", fontWeight: "800" }}>
                  New password
                </h1>
                {" "}
                <label htmlFor="fg-new" className="label" style={{ marginTop: "18px" }}>
                  Password
                </label>
                {" "}
                <input id="fg-new" className="field" type="password" value={v.np ?? ""} onChange={v.onNp} placeholder="At least 8 characters" />
                {" "}
                <div className="hint">
                  {v.npHint}
                </div>
                {" "}
                {v.npOk ? (
                  <>
                  {" "}
                  <button className="btn btn-cta btn-lg btn-block tap" onClick={v.finish} style={{ marginTop: "18px" }}>
                    Save and log in
                  </button>
                  {" "}
                  </>
                ) : null}
                {" "}
              </div>
              {" "}
              </>
            ) : null}
            {" "}
            {v.s3 ? (
              <>
              {" "}
              <div style={{ marginTop: "18px", textAlign: "center" }}>
                {" "}
                <img className="pop" src="/sk/sparkles.png" alt="" style={{ width: "72px", height: "72px" }} />
                {" "}
                <h1 style={{ marginTop: "8px", fontSize: "30px", fontWeight: "800" }}>
                  You are back in
                </h1>
                {" "}
                <p className="muted" style={{ marginTop: "6px", fontSize: "15px" }}>
                  We logged you out of other devices, just in case.
                </p>
                {" "}
                <SkLink href="/home" className="btn btn-cta btn-lg btn-block tap" style={{ marginTop: "18px" }}>
                  Go to home
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
      </div>
      {" "}
      </>
    );
  }
}
