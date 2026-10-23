// @ts-nocheck -- ported 1:1 from design/mockup/Help.dc.html by scripts/port-mockup.mjs; typed as it gets wired to real data
"use client";

import React, { Fragment } from "react";
import { saveMode, SkLink } from "@/lib/sk/runtime";


export default class Help extends React.Component<Record<string, any>, any> {
  static defaultProps = {"mode":"dark","ads":"on"};

  constructor(props) {
    super(props);
    var m = null; // light/dark arrives as props.mode from the sk-mode cookie
    this.state = { mode: m || props.mode || 'dark', q: '', cat: 'All', open: { 0: true } };
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
    var F = [
      ['Getting started', 'Do I need an account to send a message?', 'No. Anyone with your link can send you one anonymous message. You need an account to chat back and forth, make your own links, or play games.'],
      ['Getting started', 'How old do I have to be?', 'You must be 16 or older. We ask for your date of birth when you sign up and never show it on your profile.'],
      ['Getting started', 'Is Sekretly free?', 'Yes. Sekretly is paid for by a small number of clearly labelled ads. Ads never appear inside chats, the message box, or during a game turn.'],
      ['Getting started', 'Can I install Sekretly like an app?', 'Yes. On Android, tap Install when Chrome offers it, or open the menu and choose Add to Home screen. On iPhone, open Sekretly in Safari, tap Share, then Add to Home Screen. Notifications on iPhone need iOS 16.4 or newer.'],
      ['Links', 'How do I create a link?', 'Tap the + button, pick a theme, pick a topic or write your own, set optional limits, then share. It takes about ten seconds.'],
      ['Links', 'Can I pause my link?', 'Yes. Pause or resume any link from My links. If you set a message cap or a time limit, the link pauses on its own when it is reached.'],
      ['Links', 'What does “Reset all links” do?', 'It makes a new private key for your account, so every old link stops working forever. Use it if a link was shared somewhere you did not want.'],
      ['Messages & chats', 'Can anyone see who sent a message?', 'No. Not you, not other users. We privately record which account or device sent a message only to route replies and to handle reports.'],
      ['Messages & chats', 'How long do messages last?', 'You choose in Settings, from 1 day to 3 weeks. The default is 1 day. When a message expires it is deleted from our servers.'],
      ['Messages & chats', 'Why can’t I reply to some messages?', 'Messages from people without an account are one-way. You can still share them to your story.'],
      ['Messages & chats', 'What is a hidden message?', 'A message that contains a word on your personal hidden-words list. It still arrives, but stays covered until you tap to reveal it.'],
      ['Games', 'How do I join a game?', 'Open a game link from a friend, or tap a game in the Games listing. You need an account to play.'],
      ['Games', 'Will other players see my username?', 'No. Everyone gets a random nickname and colour that only exists inside that game.'],
      ['Games', 'What if I do not respond in Truth or Dare?', 'After 20 seconds your turn is skipped. Miss two turns in a row and you are removed from the game.'],
      ['Safety', 'How do I report someone?', 'Tap Report on any message, chat or game player and pick a reason from the list, or choose “Other reason” and write your own. Reports are anonymous.'],
      ['Safety', 'What happens when I report a message?', 'The sender gets a warning that tells them why. After 3 warnings, your next report blocks them from messaging you. Warnings only count between the two of you.'],
      ['Safety', 'I blocked someone by mistake. Can I undo it?', 'Yes. Go to Settings › Safety › Blocked senders and tap Undo, or tap Undo at the top of the chat.'],
      ['Safety', 'Does Sekretly block bad words?', 'No. Sekretly doesn’t filter words before they send. The person who receives a message decides whether to report it.'],
      ['Messages & chats', 'Can I send photos and videos?', 'Yes, in anonymous messages and chats. They arrive blurred, and the receiver taps to view them.'],
      ['Messages & chats', 'Can I find out who sent a message?', 'No. Hints are coming soon. They give a vague clue, like the state or time of day, never a name or number.'],
      ['Account', 'I forgot my password.', 'Tap “Forgot password” on the log in screen and we will email a code to your recovery email. Without a recovery email, the account cannot be recovered.'],
      ['Account', 'How do I delete my account?', 'Go to Settings, Account, Delete account. Your links stop working and your messages are deleted.']
    ];
    var cats = ['All', 'Getting started', 'Links', 'Messages & chats', 'Games', 'Safety', 'Account'];
    var q = s.q.trim().toLowerCase();
    var list = F.map(function (f, i) { return { i: i, c: f[0], q: f[1], a: f[2] }; }).filter(function (f) {
      if (s.cat !== 'All' && f.c !== s.cat) return false;
      if (q && (f.q + ' ' + f.a).toLowerCase().indexOf(q) < 0) return false;
      return true;
    });
    return {
      mode: dark ? 'dark' : 'light', isDark: dark, isLight: !dark, modeWord: dark ? 'Light' : 'Dark',
      drawerCls: self.state.drawer ? 'is-open' : '', drawerOpen: self.state.drawer ? 'true' : 'false', drawerHidden: self.state.drawer ? 'false' : 'true',
      toggleDrawer: function () { self.setState({ drawer: !self.state.drawer }); },
      jumpHow: function () { try { window.localStorage.setItem('sk-jump', 'how'); } catch (e) {} self.setState({ drawer: false }); },
      jumpGames: function () { try { window.localStorage.setItem('sk-jump', 'games'); } catch (e) {} self.setState({ drawer: false }); },
      toggleMode: function () { var n = dark ? 'light' : 'dark'; saveMode(n); self.setState({ mode: n }); },
      ads: this.props.ads === 'off' ? 'off' : 'on',
      q: s.q,
      onQ: function (e) { self.setState({ q: e.target.value }); },
      cats: cats.map(function (c) { var on = s.cat === c; return { label: c, on: on ? 'true' : 'false', cls: on ? 'on' : '', pick: function () { self.setState({ cat: c }); } }; }),
      faqs: list.map(function (f) { var o = !!s.open[f.i]; return { q: f.q, a: f.a, open: o, sign: o ? '−' : '+', toggle: function () { var n = Object.assign({}, s.open); n[f.i] = !o; self.setState({ open: n }); } }; }),
      none: list.length === 0,
      resultLabel: list.length + (list.length === 1 ? ' answer' : ' answers') + (s.cat !== 'All' ? ' in ' + s.cat : '')
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
            <SkLink href="/about">
              About
            </SkLink>
            <SkLink href="/help" aria-current="page">
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
              <SkLink href="/about" className="nav-i" onClick={v.toggleDrawer}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <circle cx="12" cy="12" r="9" />
                  <path d="M12 11v5M12 8h.01" />
                </svg>
                About
              </SkLink>
              {" "}
              <SkLink href="/help" className="nav-i" aria-current="page" onClick={v.toggleDrawer}>
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
        <header style={{ background: "var(--hero)", padding: "64px 0 48px" }}>
          {" "}
          <div className="pub-wrap" style={{ textAlign: "center" }}>
            {" "}
            <h1 style={{ fontSize: "clamp(40px, 6cqi, 72px)", lineHeight: ".96", fontWeight: "800" }}>
              How can we help?
            </h1>
            {" "}
            <div style={{ maxWidth: "560px", margin: "22px auto 0", position: "relative" }}>
              {" "}
              <label htmlFor="hp-q" className="sr">
                Search help
              </label>
              {" "}
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden="true" style={{ position: "absolute", left: "16px", top: "18px", color: "var(--muted)" }}>
                <circle cx="11" cy="11" r="7" />
                <path d="m20 20-3.5-3.5" />
              </svg>
              {" "}
              <input id="hp-q" className="field" value={v.q ?? ""} onChange={v.onQ} placeholder="Search: pause link, delete account, games…" style={{ minHeight: "58px", paddingLeft: "46px", borderRadius: "20px", fontSize: "17px" }} />
              {" "}
            </div>
            {" "}
          </div>
          {" "}
        </header>
        {" "}
        <main className="pub-wrap" style={{ paddingTop: "32px" }}>
          {" "}
          <div className="rail" role="tablist" aria-label="Topics" style={{ display: "flex", gap: "8px", paddingBottom: "4px" }}>
            {" "}
            {(v.cats || []).map((c, i0) => (
              <Fragment key={i0}>
              {" "}
              <button role="tab" aria-selected={c.on} className={`chip tap ${c.cls}`} onClick={c.pick}>
                {c.label}
              </button>
              {" "}
              </Fragment>
            ))}
            {" "}
          </div>
          {" "}
          <div style={{ display: "flex", flexWrap: "wrap", gap: "32px 48px", marginTop: "22px" }}>
            {" "}
            <section style={{ flex: "999 1 560px", minWidth: "0" }}>
              {" "}
              <p className="muted" style={{ fontSize: "14px" }}>
                {v.resultLabel}
              </p>
              {" "}
              <ul style={{ listStyle: "none", margin: "10px 0 0", padding: "0" }} className="card">
                {" "}
                {(v.faqs || []).map((f, i0) => (
                  <Fragment key={i0}>
                  {" "}
                  <li style={{ borderBottom: "1px solid var(--line)" }}>
                    {" "}
                    <button className="tap" onClick={f.toggle} aria-expanded={f.open} style={{ width: "100%", minHeight: "60px", display: "flex", alignItems: "center", gap: "12px", padding: "14px 18px", background: "transparent", border: "0", color: "var(--ink)", textAlign: "left", fontWeight: "700", fontSize: "16px" }}>
                      {" "}
                      <span style={{ flex: "1" }}>
                        {f.q}
                      </span>
                      {" "}
                      <span aria-hidden="true" className="pink" style={{ fontSize: "22px", lineHeight: "1" }}>
                        {f.sign}
                      </span>
                      {" "}
                    </button>
                    {" "}
                    {f.open ? (
                      <>
                      {" "}
                      <p className="muted rise" style={{ padding: "0 18px 18px", fontSize: "15.5px", lineHeight: "1.6" }}>
                        {f.a}
                      </p>
                      {" "}
                      </>
                    ) : null}
                    {" "}
                  </li>
                  {" "}
                  </Fragment>
                ))}
                {" "}
              </ul>
              {" "}
              {v.none ? (
                <>
                {" "}
                <div className="card" style={{ padding: "24px", textAlign: "center", marginTop: "10px" }}>
                  {" "}
                  <img src="/sk/ghost.png" alt="" style={{ width: "56px", height: "56px" }} />
                  {" "}
                  <p style={{ marginTop: "8px", fontWeight: "700" }}>
                    No answers for “{v.q}”
                  </p>
                  {" "}
                  <SkLink href="/contact" className="btn btn-sm" style={{ marginTop: "12px" }}>
                    Ask the team
                  </SkLink>
                  {" "}
                </div>
                {" "}
                </>
              ) : null}
              {" "}
              <div className="ad-wrap" style={{ marginTop: "26px" }}>
                <div className="ad ad-banner">
                  <b>
                    Responsive banner
                  </b>
                  <span className="ad-m">
                    320 × 100 on phones
                  </span>
                  <span className="ad-d">
                    728 × 90 on wide screens
                  </span>
                </div>
              </div>
              {" "}
            </section>
            {" "}
            <aside style={{ flex: "1 1 280px", minWidth: "0", display: "flex", flexDirection: "column", gap: "12px" }}>
              {" "}
              <SkLink href="/safety" className="card tap" style={{ padding: "18px", display: "flex", gap: "12px", alignItems: "center", textDecoration: "none" }}>
                {" "}
                <img src="/sk/shushing_face.png" alt="" style={{ width: "40px", height: "40px" }} />
                {" "}
                <span>
                  <b style={{ display: "block" }}>
                    Safety center
                  </b>
                  <span className="muted" style={{ fontSize: "14px" }}>
                    Rules, reporting and strikes
                  </span>
                </span>
                {" "}
              </SkLink>
              {" "}
              <SkLink href="/contact" className="card tap" style={{ padding: "18px", display: "flex", gap: "12px", alignItems: "center", textDecoration: "none" }}>
                {" "}
                <img src="/sk/love_letter.png" alt="" style={{ width: "40px", height: "40px" }} />
                {" "}
                <span>
                  <b style={{ display: "block" }}>
                    Still stuck?
                  </b>
                  <span className="muted" style={{ fontSize: "14px" }}>
                    Message the team, we reply in 2 days
                  </span>
                </span>
                {" "}
              </SkLink>
              {" "}
              <div className="card" style={{ padding: "18px", borderColor: "var(--bad)" }}>
                {" "}
                <b>
                  In danger right now?
                </b>
                {" "}
                <p className="muted" style={{ fontSize: "14px", marginTop: "4px" }}>
                  Call 112. For self-harm support call [HELP-LINE NUMBER].
                </p>
                {" "}
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
