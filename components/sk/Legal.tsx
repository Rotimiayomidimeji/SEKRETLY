// @ts-nocheck -- ported 1:1 from design/mockup/Legal.dc.html by scripts/port-mockup.mjs; typed as it gets wired to real data
"use client";

import React, { Fragment } from "react";
import { saveMode, SkLink } from "@/lib/sk/runtime";


export default class Legal extends React.Component<Record<string, any>, any> {
  static defaultProps = {"mode":"dark"};

  constructor(props) {
    super(props);
    var m = null; // light/dark arrives as props.mode from the sk-mode cookie
    this.state = { mode: m || props.mode || 'dark', tab: props.tab || 'privacy' };
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
    var S = {
      privacy: ['We collect the minimum to run Sekretly', 'IP addresses: staff only, deleted after [30] days', 'Messages delete on your timer', 'We never sell your data'],
      terms: ['16+ only, one account each', 'You own what you send', 'Reports warn the sender', '4th report from one person blocks you from them'],
      ads: ['Ads keep Sekretly free', 'Google may use cookies for ads', 'You can opt out of personalised ads', 'No ads in chats or game turns']
    };
    return {
      mode: dark ? 'dark' : 'light', isDark: dark, isLight: !dark, modeWord: dark ? 'Light' : 'Dark',
      drawerCls: self.state.drawer ? 'is-open' : '', drawerOpen: self.state.drawer ? 'true' : 'false', drawerHidden: self.state.drawer ? 'false' : 'true',
      toggleDrawer: function () { self.setState({ drawer: !self.state.drawer }); },
      jumpHow: function () { try { window.localStorage.setItem('sk-jump', 'how'); } catch (e) {} self.setState({ drawer: false }); },
      jumpGames: function () { try { window.localStorage.setItem('sk-jump', 'games'); } catch (e) {} self.setState({ drawer: false }); },
      toggleMode: function () { var n = dark ? 'light' : 'dark'; saveMode(n); self.setState({ mode: n }); },
      tabs: [['privacy', 'Privacy policy'], ['terms', 'Terms of use'], ['ads', 'Cookies & ads']].map(function (t) { var on = s.tab === t[0]; return { label: t[1], on: on ? 'true' : 'false', cls: on ? 'on' : '', pick: function () { self.setState({ tab: t[0] }); } }; }),
      isPrivacy: s.tab === 'privacy', isTerms: s.tab === 'terms', isAds: s.tab === 'ads',
      summary: S[s.tab]
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
        <main className="pub-wrap" style={{ paddingTop: "48px" }}>
          {" "}
          <h1 style={{ fontSize: "clamp(38px, 5.6cqi, 64px)", lineHeight: ".96", fontWeight: "800" }}>
            Legal
          </h1>
          {" "}
          <p className="muted" style={{ marginTop: "10px", fontSize: "15px" }}>
            Last updated 19 October 2026
          </p>
          {" "}
          <div role="tablist" aria-label="Documents" style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginTop: "20px" }}>
            {" "}
            {(v.tabs || []).map((t, i0) => (
              <Fragment key={i0}>
              {" "}
              <button role="tab" aria-selected={t.on} className={`chip tap ${t.cls}`} onClick={t.pick} style={{ minHeight: "46px", fontSize: "15px" }}>
                {t.label}
              </button>
              {" "}
              </Fragment>
            ))}
            {" "}
          </div>
          {" "}
          <div style={{ display: "flex", flexWrap: "wrap", gap: "32px 56px", marginTop: "30px" }}>
            {" "}
            <aside style={{ flex: "1 1 220px", minWidth: "0" }}>
              {" "}
              <div className="card" style={{ padding: "18px" }}>
                {" "}
                <b style={{ fontSize: "14px" }}>
                  In short
                </b>
                {" "}
                <ul style={{ margin: "10px 0 0", paddingLeft: "18px", fontSize: "14.5px", lineHeight: "1.6" }} className="muted">
                  {" "}
                  {(v.summary || []).map((x, i0) => (
                    <Fragment key={i0}>
                    <li>
                      {x}
                    </li>
                    </Fragment>
                  ))}
                  {" "}
                </ul>
                {" "}
              </div>
              {" "}
            </aside>
            {" "}
            <article className="prose" style={{ flex: "999 1 560px", minWidth: "0" }}>
              {" "}
              {v.isPrivacy ? (
                <>
                {" "}
                <div>
                  {" "}
                  <h2 style={{ marginTop: "0" }}>
                    Privacy policy
                  </h2>
                  {" "}
                  <p>
                    This policy explains what Sekretly collects, why, and what you can do about it. It follows the Nigeria Data Protection Act 2023.
                  </p>
                  {" "}
                  <h3>
                    What we collect
                  </h3>
                  {" "}
                  <ul>
                    {" "}
                    <li>
                      <b>
                        Account details:
                      </b>
                      {" username, password (stored scrambled), date of birth, avatar, bio, and an optional recovery email."}
                    </li>
                    {" "}
                    <li>
                      <b>
                        Messages and chats:
                      </b>
                      {" the text you send and receive, until it disappears on your timer."}
                    </li>
                    {" "}
                    <li>
                      <b>
                        Approximate sender info:
                      </b>
                      {" country, approximate state or region, device type, phone system, browser, mobile network and local time. Never your exact location."}
                    </li>
                    {" "}
                    <li>
                      <b>
                        Game content:
                      </b>
                      {" nicknames, answers, votes, and dare photos or videos, which are deleted when the game ends."}
                    </li>
                    {" "}
                    <li>
                      <b>
                        Device and connection data:
                      </b>
                      {" IP address, approximate state or city worked out from it, device, browser, mobile network, how you arrived and pages visited. We use it for security, stopping abuse, stats and (later) approximate hints. Only Sekretly staff can see IP addresses, and we delete them after [30] days. Hints never show an IP address or exact location."}
                    </li>
                    {" "}
                    <li>
                      <b>
                        Reports and warnings:
                      </b>
                      {" the reason chosen, the reported message, and the warning count between two people."}
                    </li>
                    {" "}
                    <li>
                      <b>
                        Usage data:
                      </b>
                      {" pages visited and buttons tapped, used to improve the app."}
                    </li>
                    {" "}
                  </ul>
                  {" "}
                  <h3>
                    Why we use it
                  </h3>
                  {" "}
                  <p>
                    To run the service, deliver and route messages, keep people safe, handle reports, show stats, and later offer optional hints. We never sell your personal data or your messages.
                  </p>
                  {" "}
                  <h3>
                    How long we keep it
                  </h3>
                  {" "}
                  <p>
                    Messages are deleted when they expire (1 day to 3 weeks, your choice). Sender info is deleted with the message. Reported messages are kept for 30 days for review. Dare evidence is deleted when the game ends.
                  </p>
                  {" "}
                  <h3>
                    Your rights
                  </h3>
                  {" "}
                  <p>
                    You can access, correct, export or delete your data. Delete your account from Settings, or contact [legal email] for anything else.
                  </p>
                  {" "}
                </div>
                {" "}
                </>
              ) : null}
              {" "}
              {v.isTerms ? (
                <>
                {" "}
                <div>
                  {" "}
                  <h2 style={{ marginTop: "0" }}>
                    Terms of use
                  </h2>
                  {" "}
                  <p>
                    By using Sekretly you agree to these terms and our Community Rules.
                  </p>
                  {" "}
                  <h3>
                    Who can use Sekretly
                  </h3>
                  {" "}
                  <p>
                    You must be 16 or older and give your real date of birth. One person, one account.
                  </p>
                  {" "}
                  <h3>
                    Your content
                  </h3>
                  {" "}
                  <p>
                    You are responsible for what you send, including photos and videos. You keep ownership of it, and you let us store and show it so the service works.
                  </p>
                  {" "}
                  <h3>
                    Reports, warnings and blocks
                  </h3>
                  {" "}
                  <p>
                    We don’t filter words before they send. Anyone who receives a message can report it. Each report sends the sender a warning with the reason. After 3 warnings from the same person, their next report blocks the sender from messaging them, until they choose to undo it. Serious reports are also reviewed by our team.
                  </p>
                  {" "}
                  <h3>
                    Anonymity has limits
                  </h3>
                  {" "}
                  <p>
                    Other users cannot see who you are. We can, privately, and we may share information with authorities when the law requires it or someone is in danger.
                  </p>
                  {" "}
                  <h3>
                    Games
                  </h3>
                  {" "}
                  <p>
                    Play fair and safe. Do not post dares that are dangerous, illegal or sexual. We may end a game or remove a player.
                  </p>
                  {" "}
                  <h3>
                    Ending your account
                  </h3>
                  {" "}
                  <p>
                    You can delete your account any time. We may suspend or remove accounts that break these terms, for example after many warnings from different people or one serious report.
                  </p>
                  {" "}
                  <h3>
                    The legal bits
                  </h3>
                  {" "}
                  <p>
                    Sekretly is provided as is. These terms are governed by the laws of the Federal Republic of Nigeria. We will tell you in the app before important changes take effect.
                  </p>
                  {" "}
                </div>
                {" "}
                </>
              ) : null}
              {" "}
              {v.isAds ? (
                <>
                {" "}
                <div>
                  {" "}
                  <h2 style={{ marginTop: "0" }}>
                    Cookies & ads
                  </h2>
                  {" "}
                  <p>
                    Sekretly is free because of ads. This section explains how they work.
                  </p>
                  {" "}
                  <h3>
                    Cookies we use
                  </h3>
                  {" "}
                  <ul>
                    {" "}
                    <li>
                      <b>
                        Essential:
                      </b>
                      {" keep you logged in and remember your light or dark mode."}
                    </li>
                    {" "}
                    <li>
                      <b>
                        Analytics:
                      </b>
                      {" help us see which features people use. No message text is ever included."}
                    </li>
                    {" "}
                    <li>
                      <b>
                        Advertising:
                      </b>
                      {" third-party vendors, including Google, use cookies to serve ads based on your previous visits to Sekretly and other websites."}
                    </li>
                    {" "}
                  </ul>
                  {" "}
                  <h3>
                    Google ads
                  </h3>
                  {" "}
                  <p>
                    Google’s use of advertising cookies lets it and its partners serve ads to you based on your visits to this and other sites. You can opt out of personalised advertising in Google’s Ads Settings, or opt out of some third-party vendors at aboutads.info.
                  </p>
                  {" "}
                  <h3>
                    Where ads appear
                  </h3>
                  {" "}
                  <p>
                    Only in labelled boxes: the inbox list, the screen after sending a message, paused link pages, game lobbies, the bottom of Settings, and our help and about pages. Never inside chats, the message box, or a game turn.
                  </p>
                  {" "}
                </div>
                {" "}
                </>
              ) : null}
              {" "}
            </article>
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
