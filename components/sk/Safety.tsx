// @ts-nocheck -- ported 1:1 from design/mockup/Safety.dc.html by scripts/port-mockup.mjs; typed as it gets wired to real data
"use client";

import React, { Fragment } from "react";
import { saveMode, SkLink } from "@/lib/sk/runtime";


export default class Safety extends React.Component<Record<string, any>, any> {
  static defaultProps = {"mode":"dark"};

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
    var rules = [
      ['Be kind, even when honest', 'Honest is fine. Cruel is not. Say it the way you would want to hear it.'],
      ['No bullying or harassment', 'No targeting, mocking or pile-ons. No sending the same person message after message.'],
      ['No hate', 'Nothing that attacks people for their ethnicity, religion, gender, sexuality, disability or where they are from.'],
      ['No sexual content', 'No sexual messages, images or dares. Sekretly is 16+, not adults-only.'],
      ['No threats or violence', 'No threats, even as a joke. We report credible threats to the police.'],
      ['No exposing people', 'Never share someone’s phone number, address, photos or secrets without their consent.'],
      ['No spam or scams', 'No advertising, links to scams, or fake giveaways.'],
      ['No pretending', 'Do not pretend to be Sekretly staff, or a specific real person.'],
      ['Safe dares only', 'No dares that are dangerous, illegal, or that put someone else at risk.'],
      ['16 and older only', 'If you are under 16, you cannot use Sekretly. Accounts that lie about age are removed.']
    ];
    return {
      mode: dark ? 'dark' : 'light', isDark: dark, isLight: !dark, modeWord: dark ? 'Light' : 'Dark',
      drawerCls: self.state.drawer ? 'is-open' : '', drawerOpen: self.state.drawer ? 'true' : 'false', drawerHidden: self.state.drawer ? 'false' : 'true',
      toggleDrawer: function () { self.setState({ drawer: !self.state.drawer }); },
      jumpHow: function () { try { window.localStorage.setItem('sk-jump', 'how'); } catch (e) {} self.setState({ drawer: false }); },
      jumpGames: function () { try { window.localStorage.setItem('sk-jump', 'games'); } catch (e) {} self.setState({ drawer: false }); },
      toggleMode: function () { var n = dark ? 'light' : 'dark'; saveMode(n); self.setState({ mode: n }); },
      tools: [
        { tag: 'One tap', title: 'Report with a reason', body: 'Every message, chat and game player has a Report button. Pick from our list of reasons, or write your own.' },
        { tag: 'Automatic', title: 'Senders get warned', body: 'Each report sends the sender a warning that says why. They know exactly what crossed the line.' },
        { tag: 'Automatic', title: '4th report blocks them', body: 'After 3 warnings, your next report blocks that sender from messaging you. Undo it whenever you like.' },
        { tag: 'You control', title: 'Photos and videos blurred', body: 'Anything sent to you anonymously starts blurred. You decide whether to look.' },
        { tag: 'You control', title: 'Your hidden words', body: 'Add words you never want to see. Messages with them arrive covered until you tap.' },
        { tag: 'You control', title: 'Pause or reset links', body: 'Pause a link when it gets too much. Reset makes every old link stop working for good.' },
        { tag: 'You control', title: 'Who can reach you', body: 'Turn off two-way chats, or stop people without an account from messaging you.' },
        { tag: 'Support', title: 'Self-harm support', body: 'Report a message about self-harm and the sender gets free help-lines instead of a warning.' }
      ],
      rules: rules.map(function (r, i) { return { n: (i + 1 < 10 ? '0' : '') + (i + 1), title: r[0], body: r[1] }; }),
      strikes: [
        { n: '1', c: '#ffc048', title: 'First warning', body: 'The sender gets a notification saying their message was reported, and why.' },
        { n: '2', c: '#ff9a3d', title: 'Second warning', body: 'Another report from the same person, another warning.' },
        { n: '3', c: '#ff7a45', title: 'Last warning', body: 'They are told one more report will block them from this person.' },
        { n: '4', c: '#ff4f6d', title: 'Blocked from you', body: 'The 4th report blocks them from messaging you. You can undo it any time.' }
      ]
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
            <SkLink href="/safety" aria-current="page">
              Safety
            </SkLink>
            <SkLink href="/about">
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
              <SkLink href="/safety" className="nav-i" aria-current="page" onClick={v.toggleDrawer}>
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
        <header style={{ background: "var(--hero)", padding: "64px 0 52px" }}>
          {" "}
          <div className="pub-wrap" style={{ display: "flex", flexWrap: "wrap", gap: "24px 48px", alignItems: "center" }}>
            {" "}
            <div style={{ flex: "1 1 460px", minWidth: "0" }}>
              {" "}
              <p style={{ fontSize: "12.5px", fontWeight: "800", letterSpacing: ".14em", textTransform: "uppercase" }} className="pink">
                Safety center
              </p>
              {" "}
              <h1 style={{ marginTop: "12px", fontSize: "clamp(40px, 6.4cqi, 76px)", lineHeight: ".95", fontWeight: "800" }}>
                Unknown doesn’t mean uncontrolled.
              </h1>
              {" "}
              <p className="muted" style={{ marginTop: "16px", fontSize: "18px", lineHeight: "1.55", maxWidth: "44ch" }}>
                Sekretly doesn’t censor words. People can send what they want, but whoever receives it is in control. Here is how that works.
              </p>
              {" "}
              <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginTop: "20px" }}>
                {" "}
                <SkLink href="#tools" className="chip">
                  Your tools
                </SkLink>
                <SkLink href="#rules" className="chip">
                  Community rules
                </SkLink>
                <SkLink href="#strikes" className="chip">
                  Strikes
                </SkLink>
                <SkLink href="#help" className="chip">
                  Get help
                </SkLink>
                {" "}
              </div>
              {" "}
            </div>
            {" "}
            <img className="float" src="/sk/shushing_face.png" alt="" style={{ width: "150px", height: "150px", flex: "none" }} />
            {" "}
          </div>
          {" "}
        </header>
        {" "}
        <main className="pub-wrap">
          {" "}
          <section id="tools" style={{ paddingTop: "56px" }}>
            {" "}
            <h2 style={{ fontSize: "clamp(30px, 4cqi, 44px)" }}>
              Your safety tools
            </h2>
            {" "}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "12px", marginTop: "18px" }}>
              {" "}
              {(v.tools || []).map((t, i0) => (
                <Fragment key={i0}>
                {" "}
                <article className="card" style={{ padding: "20px" }}>
                  {" "}
                  <span className="pill">
                    {t.tag}
                  </span>
                  {" "}
                  <h3 style={{ marginTop: "12px", fontSize: "19px" }}>
                    {t.title}
                  </h3>
                  {" "}
                  <p className="muted" style={{ marginTop: "6px", fontSize: "15px", lineHeight: "1.55" }}>
                    {t.body}
                  </p>
                  {" "}
                </article>
                {" "}
                </Fragment>
              ))}
              {" "}
            </div>
            {" "}
          </section>
          {" "}
          <section id="rules" style={{ paddingTop: "64px", display: "flex", flexWrap: "wrap", gap: "32px 56px" }}>
            {" "}
            <div style={{ flex: "1 1 320px", minWidth: "0" }}>
              {" "}
              <h2 style={{ fontSize: "clamp(30px, 4cqi, 44px)" }}>
                Community rules
              </h2>
              {" "}
              <p className="muted" style={{ marginTop: "10px", fontSize: "16px", lineHeight: "1.55", maxWidth: "34ch" }}>
                Nothing is filtered before it sends. These are the kinds of things people report, and reports are what lead to warnings and blocks.
              </p>
              {" "}
            </div>
            {" "}
            <ol style={{ flex: "999 1 560px", minWidth: "0", listStyle: "none", padding: "0", margin: "0", display: "flex", flexDirection: "column", gap: "10px" }}>
              {" "}
              {(v.rules || []).map((r, i0) => (
                <Fragment key={i0}>
                {" "}
                <li className="card" style={{ padding: "16px 18px", display: "flex", gap: "16px", alignItems: "flex-start" }}>
                  {" "}
                  <span className="d pink" style={{ fontSize: "22px", fontWeight: "800", width: "34px", flex: "none" }}>
                    {r.n}
                  </span>
                  {" "}
                  <span>
                    <b style={{ display: "block", fontSize: "16.5px" }}>
                      {r.title}
                    </b>
                    <span className="muted" style={{ fontSize: "14.5px", lineHeight: "1.5" }}>
                      {r.body}
                    </span>
                  </span>
                  {" "}
                </li>
                {" "}
                </Fragment>
              ))}
              {" "}
            </ol>
            {" "}
          </section>
          {" "}
          <section id="strikes" style={{ paddingTop: "64px" }}>
            {" "}
            <h2 style={{ fontSize: "clamp(30px, 4cqi, 44px)" }}>
              How reports work
            </h2>
            {" "}
            <p className="muted" style={{ marginTop: "10px", fontSize: "16px", maxWidth: "62ch", lineHeight: "1.55" }}>
              Warnings count per person. If you get reported by one friend, it doesn’t affect what you send anyone else. The person who blocked you can undo it any time. Serious reports (threats, self-harm, anything involving minors) also go to our team.
            </p>
            {" "}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "12px", marginTop: "18px" }}>
              {" "}
              {(v.strikes || []).map((k, i0) => (
                <Fragment key={i0}>
                {" "}
                <div className="card" style={{ padding: "20px", borderTop: `6px solid ${k.c}` }}>
                  {" "}
                  <div className="d" style={{ fontSize: "40px", fontWeight: "800", color: k.c }}>
                    {k.n}
                  </div>
                  {" "}
                  <h3 style={{ fontSize: "19px", marginTop: "4px" }}>
                    {k.title}
                  </h3>
                  {" "}
                  <p className="muted" style={{ marginTop: "6px", fontSize: "14.5px", lineHeight: "1.5" }}>
                    {k.body}
                  </p>
                  {" "}
                </div>
                {" "}
                </Fragment>
              ))}
              {" "}
            </div>
            {" "}
          </section>
          {" "}
          <section id="help" style={{ paddingTop: "64px" }}>
            {" "}
            <div className="card" style={{ padding: "26px", display: "flex", flexWrap: "wrap", gap: "20px 40px", alignItems: "center", borderColor: "var(--bad)" }}>
              {" "}
              <div style={{ flex: "1 1 380px", minWidth: "0" }}>
                {" "}
                <h2 style={{ fontSize: "28px" }}>
                  Need help right now?
                </h2>
                {" "}
                <p className="muted" style={{ marginTop: "8px", fontSize: "16px", lineHeight: "1.55" }}>
                  If you or someone else is in danger, call 112. If you are thinking about hurting yourself, please talk to someone: [HELP-LINE NAME] on [HELP-LINE NUMBER], free and confidential.
                </p>
                {" "}
              </div>
              {" "}
              <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                {" "}
                <SkLink href="/contact" className="btn btn-cta btn-lg">
                  Contact our safety team
                </SkLink>
                {" "}
                <SkLink href="/help" className="btn btn-lg">
                  Help & FAQ
                </SkLink>
                {" "}
              </div>
              {" "}
            </div>
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
