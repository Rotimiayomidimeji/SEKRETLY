// @ts-nocheck -- ported 1:1 from design/mockup/Contact.dc.html by scripts/port-mockup.mjs; typed as it gets wired to real data
"use client";

import React, { Fragment } from "react";
import { saveMode, SkLink } from "@/lib/sk/runtime";


export default class Contact extends React.Component<Record<string, any>, any> {
  static defaultProps = {"mode":"dark"};

  constructor(props) {
    super(props);
    var m = null; // light/dark arrives as props.mode from the sk-mode cookie
    this.state = { mode: m || props.mode || 'dark', topic: 'General question', email: '', msg: '', agree: false, sent: false, touched: false };
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
    var okEmail = /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(s.email);
    var okMsg = s.msg.trim().length >= 20;
    var valid = okEmail && okMsg && s.agree;
    var T = ['General question', 'Report a problem', 'Safety concern', 'Account help', 'Ads & partnerships', 'Press', 'Legal or data request'];
    return {
      mode: dark ? 'dark' : 'light', isDark: dark, isLight: !dark, modeWord: dark ? 'Light' : 'Dark',
      drawerCls: self.state.drawer ? 'is-open' : '', drawerOpen: self.state.drawer ? 'true' : 'false', drawerHidden: self.state.drawer ? 'false' : 'true',
      toggleDrawer: function () { self.setState({ drawer: !self.state.drawer }); },
      jumpHow: function () { try { window.localStorage.setItem('sk-jump', 'how'); } catch (e) {} self.setState({ drawer: false }); },
      jumpGames: function () { try { window.localStorage.setItem('sk-jump', 'games'); } catch (e) {} self.setState({ drawer: false }); },
      toggleMode: function () { var n = dark ? 'light' : 'dark'; saveMode(n); self.setState({ mode: n }); },
      topics: T.map(function (t) { var on = s.topic === t; return { label: t, on: on ? 'true' : 'false', cls: on ? 'on' : '', pick: function () { self.setState({ topic: t }); } }; }),
      isSafety: s.topic === 'Safety concern' || s.topic === 'Report a problem',
      email: s.email,
      onEmail: function (e) { self.setState({ email: e.target.value.trim(), touched: true }); },
      emailBad: s.email.length > 3 && !okEmail,
      emailLine: s.email.length > 3 && !okEmail ? 'var(--bad)' : 'var(--line)',
      msg: s.msg,
      onMsg: function (e) { self.setState({ msg: e.target.value }); },
      msgCount: s.msg.length,
      msgHint: okMsg ? 'Looks good' : 'At least 20 characters',
      agree: s.agree,
      onAgree: function (e) { self.setState({ agree: e.target.checked }); },
      cant: !valid,
      submit: function () { if (valid) self.setState({ sent: true }); },
      reset: function () { self.setState({ sent: false, msg: '', agree: false }); },
      notSent: !s.sent, sent: s.sent
    };
  }

  render() {
    // like the mockup runtime: the template sees the props merged with renderVals()
    const v = { ...this.props, ...(this.renderVals() || {}) };
    return (
      <>
      {" "}
      <div className="sk" data-mode={v.mode}>
        {" "}
        <nav className="pub-nav" aria-label="Main">
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
          <div className="pub-links">
            {" "}
            <SkLink href="/#how" onClick={v.jumpHow}>
              How it works
            </SkLink>
            <SkLink href="/safety">
              Safety
            </SkLink>
            <SkLink href="/about">
              About
            </SkLink>
            <SkLink href="/help">
              Help
            </SkLink>
            <SkLink href="/contact" aria-current="page">
              Contact
            </SkLink>
            {" "}
          </div>
          {" "}
          <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: "8px" }}>
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
            <SkLink href="/signup" className="btn btn-cta">
              Get your link
            </SkLink>
            {" "}
            <button className="icon-btn pub-menu tap" onClick={v.toggleDrawer} aria-label="Open menu" aria-expanded={v.drawerOpen}>
              {" "}
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden="true">
                <path d="M4 7h16M4 12h16M4 17h10" />
              </svg>
              {" "}
            </button>
            {" "}
          </div>
          {" "}
        </nav>
        {" "}
        <div className={`pdr ${v.drawerCls}`}>
          {" "}
          <div className="pdr-scrim" onClick={v.toggleDrawer} />
          {" "}
          <aside className="pdr-panel" role="dialog" aria-label="Menu" aria-hidden={v.drawerHidden}>
            {" "}
            <div className="pdr-head">
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
              <button className="icon-btn tap" onClick={v.toggleDrawer} aria-label="Close menu">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" aria-hidden="true">
                  <path d="M6 6l12 12M18 6 6 18" />
                </svg>
              </button>
              {" "}
            </div>
            {" "}
            <nav aria-label="Site" style={{ display: "flex", flexDirection: "column", gap: "3px" }}>
              {" "}
              <SkLink href="/" className="nav-i" onClick={v.toggleDrawer}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M3 11 12 3l9 8" />
                  <path d="M5 10v10h14V10" />
                </svg>
                Home
              </SkLink>
              {" "}
              <SkLink href="/#how" className="nav-i" onClick={v.jumpHow}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z" />
                </svg>
                How it works
              </SkLink>
              {" "}
              <SkLink href="/#games" className="nav-i" onClick={v.jumpGames}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <rect x="2" y="7" width="20" height="11" rx="5" />
                  <path d="M7 11v3M5.5 12.5h3" />
                </svg>
                Games
              </SkLink>
              {" "}
              <SkLink href="/safety" className="nav-i" onClick={v.toggleDrawer}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M12 3 4 6v6c0 5 3.4 8.3 8 9 4.6-.7 8-4 8-9V6z" />
                </svg>
                Safety
              </SkLink>
              {" "}
              <SkLink href="/about" className="nav-i" onClick={v.toggleDrawer}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <circle cx="12" cy="12" r="9" />
                  <path d="M12 11v5M12 8h.01" />
                </svg>
                About
              </SkLink>
              {" "}
              <SkLink href="/help" className="nav-i" onClick={v.toggleDrawer}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <circle cx="12" cy="12" r="9" />
                  <path d="M9.5 9a2.5 2.5 0 1 1 3.5 2.3c-.7.3-1 .9-1 1.7M12 17h.01" />
                </svg>
                Help & FAQ
              </SkLink>
              {" "}
              <SkLink href="/contact" className="nav-i" aria-current="page" onClick={v.toggleDrawer}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <rect x="3" y="5" width="18" height="14" rx="2" />
                  <path d="m3 7 9 6 9-6" />
                </svg>
                Contact
              </SkLink>
              {" "}
            </nav>
            {" "}
            <div className="pdr-foot">
              {" "}
              <button className="mode-btn tap" onClick={v.toggleMode} style={{ justifyContent: "center" }}>
                {"Switch to "}{v.modeWord}{" mode"}
              </button>
              {" "}
              <SkLink href="/login" className="btn btn-block tap">
                Sign in
              </SkLink>
              {" "}
              <SkLink href="/signup" className="btn btn-cta btn-block tap">
                Get your link
              </SkLink>
              {" "}
            </div>
            {" "}
          </aside>
          {" "}
        </div>
        {" "}
        <main className="pub-wrap" style={{ paddingTop: "56px", display: "flex", flexWrap: "wrap", gap: "40px 56px" }}>
          {" "}
          <section style={{ flex: "1 1 340px", minWidth: "0" }}>
            {" "}
            <p style={{ fontSize: "12.5px", fontWeight: "800", letterSpacing: ".14em", textTransform: "uppercase" }} className="pink">
              Contact
            </p>
            {" "}
            <h1 style={{ marginTop: "12px", fontSize: "clamp(40px, 6cqi, 68px)", lineHeight: ".96", fontWeight: "800" }}>
              Talk to a real person.
            </h1>
            {" "}
            <p className="muted" style={{ marginTop: "16px", fontSize: "17.5px", lineHeight: "1.55", maxWidth: "36ch" }}>
              Questions, bugs, safety worries or partnership ideas. We reply within 2 working days.
            </p>
            {" "}
            <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginTop: "26px" }}>
              {" "}
              <div className="card" style={{ padding: "16px", display: "flex", gap: "14px", alignItems: "flex-start", borderColor: "var(--bad)" }}>
                {" "}
                <img src="/sk/bell.png" alt="" style={{ width: "34px", height: "34px", flex: "none" }} />
                {" "}
                <div>
                  {" "}
                  <div style={{ fontWeight: "800" }}>
                    Someone in danger right now?
                  </div>
                  {" "}
                  <p className="muted" style={{ fontSize: "14.5px", marginTop: "4px", lineHeight: "1.5" }}>
                    Call 112 for emergency services in Nigeria. For self-harm support, call [HELP-LINE NUMBER]. Do not wait for our reply.
                  </p>
                  {" "}
                </div>
                {" "}
              </div>
              {" "}
              <div className="card" style={{ padding: "16px" }}>
                {" "}
                <div style={{ fontWeight: "800" }}>
                  Email
                </div>
                {" "}
                <p className="muted" style={{ fontSize: "14.5px", marginTop: "4px", lineHeight: "1.7" }}>
                  General: [support email]
                  <br />
                  Safety: [safety email]
                  <br />
                  Ads & partnerships: [partners email]
                  <br />
                  Legal & data requests: [legal email]
                </p>
                {" "}
              </div>
              {" "}
              <div className="card" style={{ padding: "16px" }}>
                {" "}
                <div style={{ fontWeight: "800" }}>
                  Looking for a quick answer?
                </div>
                {" "}
                <p className="muted" style={{ fontSize: "14.5px", marginTop: "4px" }}>
                  Most questions are answered in Help.
                </p>
                {" "}
                <SkLink href="/help" className="btn btn-sm" style={{ marginTop: "10px" }}>
                  Open Help & FAQ
                </SkLink>
                {" "}
              </div>
              {" "}
            </div>
            {" "}
          </section>
          {" "}
          <section className="card" style={{ flex: "1 1 480px", minWidth: "0", padding: "24px" }}>
            {" "}
            {v.notSent ? (
              <>
              {" "}
              <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                {" "}
                <h2 style={{ fontSize: "24px" }}>
                  Send us a message
                </h2>
                {" "}
                <div>
                  {" "}
                  <span className="label" id="ct-topic-l">
                    What is this about?
                  </span>
                  {" "}
                  <div role="radiogroup" aria-labelledby="ct-topic-l" style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                    {" "}
                    {(v.topics || []).map((t, i0) => (
                      <Fragment key={i0}>
                      {" "}
                      <button role="radio" aria-checked={t.on} className={`chip tap ${t.cls}`} onClick={t.pick}>
                        {t.label}
                      </button>
                      {" "}
                      </Fragment>
                    ))}
                    {" "}
                  </div>
                  {" "}
                </div>
                {" "}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "14px" }}>
                  {" "}
                  <div>
                    {" "}
                    <label htmlFor="ct-name" className="label">
                      {"Name "}
                      <span className="muted" style={{ fontWeight: "500" }}>
                        (optional)
                      </span>
                    </label>
                    {" "}
                    <input id="ct-name" className="field" autoComplete="name" placeholder="What should we call you?" />
                    {" "}
                  </div>
                  {" "}
                  <div>
                    {" "}
                    <label htmlFor="ct-email" className="label">
                      Email
                    </label>
                    {" "}
                    <input id="ct-email" className="field" type="email" autoComplete="email" value={v.email ?? ""} onChange={v.onEmail} placeholder="you@example.com" style={{ borderColor: v.emailLine }} />
                    {" "}
                    {v.emailBad ? (
                      <>
                      <div className="hint" style={{ color: "var(--bad)" }}>
                        Enter a valid email so we can reply.
                      </div>
                      </>
                    ) : null}
                    {" "}
                  </div>
                  {" "}
                </div>
                {" "}
                <div>
                  {" "}
                  <label htmlFor="ct-user" className="label">
                    {"Sekretly username "}
                    <span className="muted" style={{ fontWeight: "500" }}>
                      (optional)
                    </span>
                  </label>
                  {" "}
                  <input id="ct-user" className="field" placeholder="@yourname" />
                  {" "}
                </div>
                {" "}
                {v.isSafety ? (
                  <>
                  {" "}
                  <div style={{ padding: "12px 14px", borderRadius: "14px", background: "var(--card2)", fontSize: "14px", lineHeight: "1.5" }}>
                    For safety reports, include the link or the username involved. You can also report any message straight from the app, which is faster.
                  </div>
                  {" "}
                  </>
                ) : null}
                {" "}
                <div>
                  {" "}
                  <label htmlFor="ct-msg" className="label">
                    Message
                  </label>
                  {" "}
                  <textarea id="ct-msg" className="field" value={v.msg ?? ""} onChange={v.onMsg} maxLength="2000" placeholder="Tell us what happened or what you need." />
                  {" "}
                  <div className="hint" style={{ display: "flex", justifyContent: "space-between" }}>
                    <span>
                      {v.msgHint}
                    </span>
                    <span>
                      {v.msgCount}/2000
                    </span>
                  </div>
                  {" "}
                </div>
                {" "}
                <label style={{ display: "flex", gap: "12px", alignItems: "flex-start", fontSize: "14px", lineHeight: "1.45", cursor: "pointer" }}>
                  {" "}
                  <input type="checkbox" checked={!!(v.agree)} onChange={v.onAgree} style={{ width: "22px", height: "22px", margin: "0", accentColor: "#d81b72", flex: "none" }} />
                  {" "}
                  <span>
                    {"I agree that Sekretly can use these details to reply to me, as described in the "}
                    <SkLink href="/legal" className="pink">
                      Privacy policy
                    </SkLink>
                    .
                  </span>
                  {" "}
                </label>
                {" "}
                <button className="btn btn-cta btn-lg btn-block tap" onClick={v.submit} disabled={!!(v.cant)}>
                  Send message
                </button>
                {" "}
              </div>
              {" "}
              </>
            ) : null}
            {" "}
            {v.sent ? (
              <>
              {" "}
              <div style={{ textAlign: "center", padding: "40px 10px" }}>
                {" "}
                <img className="pop" src="/sk/love_letter.png" alt="" style={{ width: "96px", height: "96px" }} />
                {" "}
                <h2 style={{ marginTop: "14px", fontSize: "30px" }}>
                  Message sent
                </h2>
                {" "}
                <p className="muted" style={{ marginTop: "8px", fontSize: "16px", lineHeight: "1.5" }}>
                  {"Your reference is "}
                  <b style={{ color: "var(--ink)" }}>
                    SK-24817
                  </b>
                  {". We will reply to "}{v.email}{" within 2 working days."}
                </p>
                {" "}
                <button className="btn tap" onClick={v.reset} style={{ marginTop: "18px" }}>
                  Send another
                </button>
                {" "}
              </div>
              {" "}
              </>
            ) : null}
            {" "}
          </section>
          {" "}
        </main>
        {" "}
        <footer className="ft">
          {" "}
          <div className="ft-in">
            {" "}
            <div className="ft-top">
              {" "}
              <div className="ft-brand">
                {" "}
                <SkLink href="/" className="logo" aria-label="Sekretly home">
                  <span className="logo-mark">
                    S
                  </span>
                  <span className="logo-word" style={{ color: "var(--ink)" }}>
                    Sekretly
                  </span>
                </SkLink>
                {" "}
                <p>
                  Built for the things you almost said. Anonymous messages and party games, made in Nigeria.
                </p>
                {" "}
                <SkLink href="/signup" className="btn btn-cta btn-sm tap">
                  Get your link
                </SkLink>
                {" "}
              </div>
              {" "}
              <div className="ft-cols">
                {" "}
                <div className="ft-col">
                  <b>
                    Product
                  </b>
                  <SkLink href="/signup">
                    Create a link
                  </SkLink>
                  <SkLink href="/#games" onClick={v.jumpGames}>
                    Games
                  </SkLink>
                  <SkLink href="/#how" onClick={v.jumpHow}>
                    How it works
                  </SkLink>
                </div>
                {" "}
                <div className="ft-col">
                  <b>
                    Company
                  </b>
                  <SkLink href="/about">
                    About
                  </SkLink>
                  <SkLink href="/contact">
                    Contact
                  </SkLink>
                  <SkLink href="/help">
                    Help & FAQ
                  </SkLink>
                </div>
                {" "}
                <div className="ft-col">
                  <b>
                    Safety
                  </b>
                  <SkLink href="/safety">
                    Safety center
                  </SkLink>
                  <SkLink href="/safety">
                    Community rules
                  </SkLink>
                  <SkLink href="/safety">
                    Report a problem
                  </SkLink>
                </div>
                {" "}
                <div className="ft-col">
                  <b>
                    Legal
                  </b>
                  <SkLink href="/legal">
                    Privacy policy
                  </SkLink>
                  <SkLink href="/legal">
                    Terms of use
                  </SkLink>
                  <SkLink href="/legal">
                    Cookies & ads
                  </SkLink>
                </div>
                {" "}
              </div>
              {" "}
            </div>
            {" "}
            <div className="ft-bottom">
              {" "}
              <span>
                © 2026 Sekretly · 16+ only
              </span>
              {" "}
              <span>
                Say it. Stay unknown.
              </span>
              {" "}
            </div>
            {" "}
          </div>
          {" "}
        </footer>
        {" "}
      </div>
      {" "}
      </>
    );
  }
}
