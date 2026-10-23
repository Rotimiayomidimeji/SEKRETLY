// @ts-nocheck -- ported 1:1 from design/mockup/Verify.dc.html by scripts/port-mockup.mjs; typed as it gets wired to real data
"use client";

import React, { Fragment } from "react";
import { saveMode, SkLink } from "@/lib/sk/runtime";


export default class Verify extends React.Component<Record<string, any>, any> {
  static defaultProps = {"mode":"dark"};

  constructor(props) {
    super(props);
    var m = null; // light/dark arrives as props.mode from the sk-mode cookie
    this.state = Object.assign({ mode: m || props.mode || 'dark' }, this.arrive());
  }
  // Signup leaves the email it collected in sk-email and stamps sk-nav
  arrive() {
    var em = '';
    em = this.props.email || ''; this.nav = '';
    return { email: em, code: '', wrong: false, done: !!this.props.verified, wait: 30 };
  }
  componentDidMount() {
    var self = this;
    this.onStore = function (e) { if (e.key === 'sk-mode' && e.newValue) self.setState({ mode: e.newValue }); };
    try { window.addEventListener('storage', this.onStore); } catch (e) {}
    this.tk = setInterval(function () {
      if (self.state.wait > 0) self.setState({ wait: self.state.wait - 1 });
    }, 1000);
  }
  componentWillUnmount() { try { window.removeEventListener('storage', this.onStore); } catch (e) {} clearInterval(this.tk); }
  componentDidUpdate(prev) { if (prev.mode !== this.props.mode && this.props.mode) this.setState({ mode: this.props.mode }); }
  renderVals() {
    var self = this, s = this.state, dark = s.mode !== 'light';
    var at = s.email.indexOf('@'), name = at > 0 ? s.email.slice(0, at) : s.email;
    var masked = name.charAt(0) + '•••••' + (at > 0 ? s.email.slice(at) : '');
    var boxes = [0, 1, 2, 3, 4, 5].map(function (i) { return { d: s.code.charAt(i) || '', cls: s.wrong ? 'bad' : (i === s.code.length ? 'on' : '') }; });
    return {
      mode: dark ? 'dark' : 'light', isDark: dark, isLight: !dark, modeWord: dark ? 'Light' : 'Dark',
      toggleMode: function () { var n = dark ? 'light' : 'dark'; saveMode(n); self.setState({ mode: n }); },
      asking: !s.done, done: s.done, masked: masked, boxes: boxes,
      code: s.code, onCode: function (e) { self.setState({ code: e.target.value.replace(/\D/g, '').slice(0, 6), wrong: false }); },
      codeShort: s.code.length < 6 || !!s.busy, wrong: s.wrong,
      wrongText: s.why === 'expired' ? 'That code has expired or was tried too many times. Tap Resend for a new one.' : 'That code doesn’t match. Check the newest email and try again.',
      verify: function () {
        if (s.busy) return;
        self.setState({ busy: true });
        self.props.verify(s.code).then(function (r) { self.setState(r && r.ok ? { busy: false, done: true } : { busy: false, wrong: true, why: r && r.reason }); });
      },
      cantResend: s.wait > 0, resendLabel: s.wait > 0 ? 'Resend code in ' + s.wait + 's' : 'Resend code',
      resend: function () { if (s.wait === 0) { self.setState({ wait: 30, code: '', wrong: false }); self.props.resend(); } }
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
          <SkLink href="/signup" className="icon-btn tap" aria-label="Back to sign up">
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
            {v.asking ? (
              <>
              {" "}
              <div>
                {" "}
                <img className="pop" src="/sk/love_letter.png" alt="" style={{ width: "56px", height: "56px" }} />
                {" "}
                <h1 style={{ marginTop: "8px", fontSize: "30px", fontWeight: "800" }}>
                  Check your email
                </h1>
                {" "}
                <p className="muted" style={{ marginTop: "6px", fontSize: "15px", lineHeight: "1.5" }}>
                  {"We sent a 6-digit code to "}
                  <b style={{ color: "var(--ink)" }}>
                    {v.masked}
                  </b>
                  . It only proves the email is yours, so you can get back in if you forget your password.
                </p>
                {" "}
                <label htmlFor="vf-code" className="label" style={{ marginTop: "16px" }}>
                  6-digit code
                </label>
                {" "}
                <div className="vf-wrap">
                  {" "}
                  <div className="vf-boxes" aria-hidden="true">
                    {" "}
                    {(v.boxes || []).map((b, i0) => (
                      <Fragment key={i0}>
                      <span className={`vf-box ${b.cls}`}>
                        {b.d}
                      </span>
                      </Fragment>
                    ))}
                    {" "}
                  </div>
                  {" "}
                  <input id="vf-code" value={v.code ?? ""} onChange={v.onCode} inputMode="numeric" autoComplete="one-time-code" maxLength="6" />
                  {" "}
                </div>
                {" "}
                {v.wrong ? (
                  <>
                  <p role="alert" style={{ marginTop: "10px", fontSize: "14px", fontWeight: "700", color: "var(--bad)" }}>
                    {v.wrongText}
                  </p>
                  </>
                ) : null}
                {" "}
                <button className="btn btn-cta btn-lg btn-block tap" onClick={v.verify} disabled={!!(v.codeShort)} style={{ marginTop: "18px" }}>
                  Verify
                </button>
                {" "}
                <button className="btn btn-ghost btn-block" onClick={v.resend} disabled={!!(v.cantResend)} style={{ marginTop: "8px", border: "0" }}>
                  {v.resendLabel}
                </button>
                {" "}
                <div className="row" style={{ justifyContent: "space-between", marginTop: "6px", fontSize: "13.5px" }}>
                  {" "}
                  <SkLink href="/signup" className="pink" style={{ fontWeight: "700" }}>
                    Change email
                  </SkLink>
                  {" "}
                  <SkLink href="/onboarding" className="muted" style={{ fontWeight: "700" }}>
                    Skip for now
                  </SkLink>
                  {" "}
                </div>
                {" "}
              </div>
              {" "}
              </>
            ) : null}
            {" "}
            {v.done ? (
              <>
              {" "}
              <div style={{ textAlign: "center" }}>
                {" "}
                <img className="pop" src="/sk/sparkles.png" alt="" style={{ width: "72px", height: "72px" }} />
                {" "}
                <h1 style={{ marginTop: "8px", fontSize: "30px", fontWeight: "800" }}>
                  Email verified
                </h1>
                {" "}
                <p className="muted" style={{ marginTop: "6px", fontSize: "15px", lineHeight: "1.5" }}>
                  Your account can be recovered now. We never show your email to anyone.
                </p>
                {" "}
                <SkLink href="/onboarding" className="btn btn-cta btn-lg btn-block tap" style={{ marginTop: "18px" }}>
                  Continue
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
