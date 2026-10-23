// @ts-nocheck -- ported 1:1 from design/mockup/About.dc.html by scripts/port-mockup.mjs; typed as it gets wired to real data
"use client";

import React, { Fragment } from "react";
import { saveMode, SkLink } from "@/lib/sk/runtime";


export default class About extends React.Component<Record<string, any>, any> {
  static defaultProps = {"mode":"dark","ads":"on"};

  constructor(props) {
    super(props);
    var m = null; // light/dark arrives as props.mode from the sk-mode cookie
    this.state = { mode: m || props.mode || 'dark' };
  }
  componentDidMount() {
    var self = this;
    this.onStore = function (e) { if (e.key === 'sk-mode' && e.newValue) self.setState({ mode: e.newValue }); };
    try { window.addEventListener('storage', this.onStore); } catch (e) {}
  }
  componentWillUnmount() { try { window.removeEventListener('storage', this.onStore); } catch (e) {} }
  componentDidUpdate(prev) { if (prev.mode !== this.props.mode && this.props.mode) this.setState({ mode: this.props.mode }); }
  renderVals() {
    var self = this, dark = this.state.mode !== 'light';
    return {
      mode: dark ? 'dark' : 'light', isDark: dark, isLight: !dark, modeWord: dark ? 'Light' : 'Dark',
      drawerCls: self.state.drawer ? 'is-open' : '', drawerOpen: self.state.drawer ? 'true' : 'false', drawerHidden: self.state.drawer ? 'false' : 'true',
      toggleDrawer: function () { self.setState({ drawer: !self.state.drawer }); },
      jumpHow: function () { try { window.localStorage.setItem('sk-jump', 'how'); } catch (e) {} self.setState({ drawer: false }); },
      jumpGames: function () { try { window.localStorage.setItem('sk-jump', 'games'); } catch (e) {} self.setState({ drawer: false }); },
      toggleMode: function () { var n = dark ? 'light' : 'dark'; saveMode(n); self.setState({ mode: n }); },
      ads: this.props.ads === 'off' ? 'off' : 'on',
      values: [
        { icon: '/sk/shushing_face.png', title: 'Anonymous, not cruel', body: 'Nobody sees who sent what. Rude words are blocked before they send, and reports are reviewed by people.' },
        { icon: '/sk/hourglass_not_done.png', title: 'Less data, on purpose', body: 'Messages disappear on your timer. We keep only approximate info, never your exact location.' },
        { icon: '/sk/game_die.png', title: 'Fun comes first', body: 'Themes, ready-made words and live games make honesty feel like play, not pressure.' },
        { icon: '/sk/sparkles.png', title: 'Real, never fake', body: 'No fake messages to make you sign up. No invented hints. If it shows up, a real person sent it.' }
      ]
    };
  }

  render() {
    // like the mockup runtime: the template sees the props merged with renderVals()
    const v = { ...this.props, ...(this.renderVals() || {}) };
    return (
      <>
      {" "}
      <div className="sk" data-mode={v.mode} data-ads={v.ads}>
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
            <SkLink href="/about" aria-current="page">
              About
            </SkLink>
            <SkLink href="/help">
              Help
            </SkLink>
            <SkLink href="/contact">
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
              <SkLink href="/about" className="nav-i" aria-current="page" onClick={v.toggleDrawer}>
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
              <SkLink href="/contact" className="nav-i" onClick={v.toggleDrawer}>
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
        <header style={{ background: "var(--hero)", padding: "72px 0 64px" }}>
          {" "}
          <div className="pub-wrap">
            {" "}
            <p style={{ fontSize: "12.5px", fontWeight: "800", letterSpacing: ".14em", textTransform: "uppercase" }} className="pink">
              About us
            </p>
            {" "}
            <h1 style={{ marginTop: "14px", fontSize: "clamp(42px, 7cqi, 84px)", lineHeight: ".95", fontWeight: "800", maxWidth: "14ch" }}>
              A home for the things you almost said.
            </h1>
            {" "}
            <p className="muted" style={{ marginTop: "18px", fontSize: "19px", lineHeight: "1.55", maxWidth: "46ch" }}>
              Sekretly is an anonymous social app for honest messages, disappearing chats and party games. Built in Nigeria, open to everyone 16 and older.
            </p>
            {" "}
          </div>
          {" "}
        </header>
        {" "}
        <main className="pub-wrap" style={{ paddingTop: "56px" }}>
          {" "}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "14px" }}>
            {" "}
            {(v.values || []).map((v, i0) => (
              <Fragment key={i0}>
              {" "}
              <article className="card" style={{ padding: "22px" }}>
                {" "}
                <img src={v.icon} alt="" style={{ width: "46px", height: "46px" }} />
                {" "}
                <h2 style={{ marginTop: "12px", fontSize: "22px" }}>
                  {v.title}
                </h2>
                {" "}
                <p className="muted" style={{ marginTop: "8px", fontSize: "15.5px", lineHeight: "1.55" }}>
                  {v.body}
                </p>
                {" "}
              </article>
              {" "}
              </Fragment>
            ))}
            {" "}
          </div>
          {" "}
          <div style={{ display: "flex", flexWrap: "wrap", gap: "40px 64px", marginTop: "64px" }}>
            {" "}
            <div className="prose" style={{ flex: "1 1 520px", minWidth: "0" }}>
              {" "}
              <h2 style={{ marginTop: "0" }}>
                Why we built Sekretly
              </h2>
              {" "}
              <p>
                Most of what people really think never gets said. Not because it is mean, but because saying it with your name attached is scary. A compliment you were too shy to give. A confession from first year. A rating your friends would never say to your face.
              </p>
              {" "}
              <p>
                Sekretly gives those words somewhere safe to land. You make a link, share it, and the people around you answer honestly. Our ready-made words and sentences make it easy to say something kind, even when you do not know how to start.
              </p>
              {" "}
              <h2>
                How it works
              </h2>
              {" "}
              <ul>
                {" "}
                <li>
                  <b>
                    Links:
                  </b>
                  {" pick a topic like “Describe me in 3 words”, a theme, and share it to your story."}
                </li>
                {" "}
                <li>
                  <b>
                    Messages:
                  </b>
                  {" anyone can answer without an account. Messages disappear after the time you choose."}
                </li>
                {" "}
                <li>
                  <b>
                    Chats:
                  </b>
                  {" friends with an account can chat back and forth, and both of you stay anonymous."}
                </li>
                {" "}
                <li>
                  <b>
                    Games:
                  </b>
                  {" live party games where everyone gets a random nickname."}
                </li>
                {" "}
              </ul>
              {" "}
              <h2>
                How Sekretly is paid for
              </h2>
              {" "}
              <p>
                Sekretly is free. We show a small number of clearly labelled ads in places like your inbox list and the screen after you send a message. We never put ads inside chats, inside the message box, or during a game turn. Later we will offer optional premium hints, which only ever show real, approximate information. We never sell your messages.
              </p>
              {" "}
              <h2>
                Who runs Sekretly
              </h2>
              {" "}
              <p>
                {"Sekretly is run by [COMPANY OR FOUNDER NAME], based in [CITY], Nigeria. You can reach the team any time through our "}
                <SkLink href="/contact" className="pink">
                  contact page
                </SkLink>
                .
              </p>
              {" "}
            </div>
            {" "}
            <aside style={{ flex: "1 1 300px", minWidth: "0", display: "flex", flexDirection: "column", gap: "14px" }}>
              {" "}
              <div className="card" style={{ padding: "20px" }}>
                {" "}
                <h3 style={{ fontSize: "18px" }}>
                  Quick facts
                </h3>
                {" "}
                <dl style={{ margin: "12px 0 0", display: "grid", gridTemplateColumns: "auto 1fr", gap: "10px 16px", fontSize: "14.5px" }}>
                  {" "}
                  <dt className="muted">
                    Founded
                  </dt>
                  <dd style={{ margin: "0" }}>
                    2026
                  </dd>
                  {" "}
                  <dt className="muted">
                    Based in
                  </dt>
                  <dd style={{ margin: "0" }}>
                    Nigeria
                  </dd>
                  {" "}
                  <dt className="muted">
                    Age
                  </dt>
                  <dd style={{ margin: "0" }}>
                    16+ only
                  </dd>
                  {" "}
                  <dt className="muted">
                    Price
                  </dt>
                  <dd style={{ margin: "0" }}>
                    Free, with ads
                  </dd>
                  {" "}
                  <dt className="muted">
                    Platform
                  </dt>
                  <dd style={{ margin: "0" }}>
                    Web app, installable
                  </dd>
                  {" "}
                </dl>
                {" "}
              </div>
              {" "}
              <div className="card" style={{ padding: "20px" }}>
                {" "}
                <h3 style={{ fontSize: "18px" }}>
                  Talk to us
                </h3>
                {" "}
                <p className="muted" style={{ marginTop: "6px", fontSize: "14.5px" }}>
                  Questions, press, partnerships or a safety concern.
                </p>
                {" "}
                <SkLink href="/contact" className="btn btn-block" style={{ marginTop: "12px" }}>
                  Contact the team
                </SkLink>
                {" "}
              </div>
              {" "}
              <div className="ad ad-mrec">
                <b>
                  Medium rectangle
                </b>
                300 × 250 · content page
              </div>
              {" "}
            </aside>
            {" "}
          </div>
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
