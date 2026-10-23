// @ts-nocheck -- ported 1:1 from design/mockup/Notifications.dc.html by scripts/port-mockup.mjs; typed as it gets wired to real data
"use client";

import React, { Fragment } from "react";
import { saveMode, SkLink, route } from "@/lib/sk/runtime";


export default class Notifications extends React.Component<Record<string, any>, any> {
  static defaultProps = {"mode":"dark","ads":"on"};

  constructor(props) {
    super(props);
    var m = null; // light/dark arrives as props.mode from the sk-mode cookie
    this.state = { mode: m || props.mode || 'dark', filter: 'all', read: {}, push: false };
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
    var E = { letter: '/sk/love_letter.png', fox: '/sk/fox.png', shush: '/sk/shushing_face.png', hourglass: '/sk/hourglass_not_done.png', moon: '/sk/crescent_moon.png', die: '/sk/game_die.png', bell: '/sk/bell.png' };
    var N = this.props.items || [];
    var shown = N.filter(function (n) { return s.filter === 'all' || n.type === s.filter; });
    var isUnread = function (n) { return n.unread && !s.read[n.id]; };
    var unread = N.filter(isUnread).length;
    var groups = ['Today', 'Earlier'].map(function (d) {
      return { title: d, items: shown.filter(function (n) { return n.day === d; }).map(function (n) {
        var u = isUnread(n);
        return { title: n.title, sub: n.sub, ago: n.ago, icon: n.icon, tint: n.tint, href: n.href, unread: u, weight: u ? 800 : 500, bg: u ? (dark ? 'rgba(255,59,141,.07)' : 'rgba(216,27,114,.05)') : 'transparent', read: function () { var r = Object.assign({}, s.read); r[n.id] = true; self.setState({ read: r }); if (n.unread) self.props.markRead([n.id]); if (n.type === 'games') { try { window.localStorage.removeItem('sk-join'); window.localStorage.setItem('sk-nav', String(Date.now())); } catch (e) {} } } };
      }) };
    }).filter(function (g) { return g.items.length; });
    return {
      mode: dark ? 'dark' : 'light', isDark: dark, isLight: !dark, modeWord: dark ? 'Light' : 'Dark',
      toggleMode: function () { var n = dark ? 'light' : 'dark'; saveMode(n); self.setState({ mode: n }); },
      ads: this.props.ads === 'off' ? 'off' : 'on',
      unread: unread, hasUnread: false,
      pushOff: !s.push, pushOn: function () { self.setState({ push: true }); },
      filters: [['all', 'All'], ['messages', 'Messages'], ['safety', 'Safety'], ['games', 'Games'], ['account', 'Account']].map(function (f) { var on = s.filter === f[0]; return { label: f[1], on: on ? 'true' : 'false', cls: on ? 'on' : '', pick: function () { self.setState({ filter: f[0] }); } }; }),
      markAll: function () { var r = {}; N.forEach(function (n) { r[n.id] = true; }); self.setState({ read: r }); self.props.markAllRead(); },
      groups: groups, empty: groups.length === 0
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
        <div className="shell">
          {" "}
          <nav className="side" aria-label="Main">
            {" "}
            <SkLink href="/" className="logo" aria-label="Sekretly home page" style={{ padding: "0 10px 20px" }}>
              <span className="logo-mark">
                S
              </span>
              <span className="logo-word">
                Sekretly
              </span>
            </SkLink>
            {" "}
            <SkLink href="/home" className="nav-i">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M3 11 12 3l9 8" />
                <path d="M5 10v10h14V10" />
              </svg>
              Home
            </SkLink>
            {" "}
            <SkLink href="/inbox" className="nav-i">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M22 12h-6l-2 3h-4l-2-3H2" />
                <path d="M5.5 5h13L22 12v7H2v-7z" />
              </svg>
              Inbox
              {v.navInbox ? (
                <>
                <span className="count">
                  {v.navInbox}
                </span>
                </>
              ) : null}
            </SkLink>
            {" "}
            <SkLink href="/create" className="nav-i">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
                <path d="M12 5v14M5 12h14" />
              </svg>
              Create link
            </SkLink>
            {" "}
            <SkLink href="/links" className="nav-i">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M10 13a5 5 0 0 0 7 0l3-3a5 5 0 0 0-7-7l-1 1" />
                <path d="M14 11a5 5 0 0 0-7 0l-3 3a5 5 0 0 0 7 7l1-1" />
              </svg>
              My links
            </SkLink>
            {" "}
            <SkLink href="/games" className="nav-i">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <rect x="2" y="7" width="20" height="11" rx="5" />
                <path d="M7 11v3M5.5 12.5h3" />
              </svg>
              Games
            </SkLink>
            {" "}
            <SkLink href="/notifications" className="nav-i" aria-current="page">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
                <path d="M10.3 21a1.9 1.9 0 0 0 3.4 0" />
              </svg>
              Notifications
              {v.hasUnread ? (
                <>
                <span className="count">
                  {v.unread}
                </span>
                </>
              ) : null}
            </SkLink>
            {" "}
            <SkLink href="/profile" className="nav-i">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
                <circle cx="12" cy="8" r="4" />
                <path d="M4 21a8 8 0 0 1 16 0" />
              </svg>
              Profile
            </SkLink>
            {" "}
            <SkLink href="/settings" className="nav-i">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
                <circle cx="12" cy="12" r="3" />
                <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
              </svg>
              Settings
            </SkLink>
            {" "}
          </nav>
          {" "}
          <div className="main">
            {" "}
            <div className="wrap" style={{ maxWidth: "720px" }}>
              {" "}
              <header className="topbar">
                {" "}
                <SkLink href="/home" className="icon-btn tap narrow-only" aria-label="Back to home">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M15 18 9 12l6-6" />
                  </svg>
                </SkLink>
                {" "}
                <h1 className="grow" style={{ fontSize: "28px" }}>
                  Notifications
                </h1>
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
              {v.pushOff ? (
                <>
                {" "}
                <div className="card" style={{ display: "flex", alignItems: "center", gap: "12px", padding: "14px", background: "var(--card2)" }}>
                  {" "}
                  <img className="wave" src="/sk/bell.png" alt="" style={{ width: "36px", height: "36px", flex: "none" }} />
                  {" "}
                  <div style={{ flex: "1", minWidth: "0" }}>
                    <b style={{ fontSize: "15px" }}>
                      Push is off on this phone
                    </b>
                    <div className="muted" style={{ fontSize: "13px" }}>
                      Turn it on to hear about messages instantly.
                    </div>
                  </div>
                  {" "}
                  <button className="btn btn-sm btn-cta tap" onClick={v.pushOn}>
                    Turn on
                  </button>
                  {" "}
                </div>
                {" "}
                </>
              ) : null}
              {" "}
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "14px" }}>
                {" "}
                <div className="rail" role="tablist" aria-label="Filter" style={{ display: "flex", gap: "8px", flex: "1" }}>
                  {" "}
                  {(v.filters || []).map((f, i0) => (
                    <Fragment key={i0}>
                    {" "}
                    <button role="tab" aria-selected={f.on} className={`chip tap ${f.cls}`} onClick={f.pick}>
                      {f.label}
                    </button>
                    {" "}
                    </Fragment>
                  ))}
                  {" "}
                </div>
                {" "}
                <button className="btn btn-sm btn-ghost" onClick={v.markAll} style={{ border: "0", color: "var(--pink)" }}>
                  Mark all read
                </button>
                {" "}
              </div>
              {" "}
              {(v.groups || []).map((g, i0) => (
                <Fragment key={i0}>
                {" "}
                <section style={{ marginTop: "18px" }}>
                  {" "}
                  <h2 className="muted" style={{ fontSize: "13px", letterSpacing: ".08em", textTransform: "uppercase", fontFamily: "var(--font-body), system-ui, sans-serif", fontWeight: "800" }}>
                    {g.title}
                  </h2>
                  {" "}
                  <ul className="card" style={{ listStyle: "none", margin: "8px 0 0", padding: "0", overflow: "hidden" }}>
                    {" "}
                    {(g.items || []).map((n, i2) => (
                      <Fragment key={i2}>
                      {" "}
                      <li>
                        {" "}
                        <SkLink href={route(n.href)} onClick={n.read} className="list-row" style={{ background: n.bg }}>
                          {" "}
                          <span className="av" style={{ background: n.tint }}>
                            <img src={n.icon} alt="" />
                          </span>
                          {" "}
                          <span style={{ flex: "1", minWidth: "0" }}>
                            {" "}
                            <span style={{ display: "block", fontSize: "15px", fontWeight: n.weight, lineHeight: "1.35" }}>
                              {n.title}
                            </span>
                            {" "}
                            <span className="muted" style={{ display: "block", fontSize: "13px", marginTop: "2px" }}>
                              {n.sub}{" · "}{n.ago}
                            </span>
                            {" "}
                          </span>
                          {" "}
                          {n.unread ? (
                            <>
                            <span style={{ width: "10px", height: "10px", borderRadius: "50%", background: "#ff3b8d", flex: "none" }} aria-label="Unread" />
                            </>
                          ) : null}
                          {" "}
                        </SkLink>
                        {" "}
                      </li>
                      {" "}
                      </Fragment>
                    ))}
                    {" "}
                  </ul>
                  {" "}
                </section>
                {" "}
                </Fragment>
              ))}
              {" "}
              {v.empty ? (
                <>
                {" "}
                <div style={{ textAlign: "center", padding: "40px 10px" }} className="muted">
                  {" "}
                  <img src="/sk/ghost.png" alt="" style={{ width: "64px", height: "64px" }} />
                  {" "}
                  <p style={{ marginTop: "8px" }}>
                    All quiet here.
                  </p>
                  {" "}
                </div>
                {" "}
                </>
              ) : null}
              {" "}
              <div className="ad-wrap" style={{ marginTop: "22px" }}>
                <div className="ad ad-banner">
                  <b>
                    Banner · end of notifications
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
            </div>
            {" "}
          </div>
          {" "}
        </div>
        {" "}
        <nav className="bnav" aria-label="Main">
          {" "}
          <SkLink href="/home">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M3 11 12 3l9 8" />
              <path d="M5 10v10h14V10" />
            </svg>
            Home
          </SkLink>
          {" "}
          <SkLink href="/inbox">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M22 12h-6l-2 3h-4l-2-3H2" />
              <path d="M5.5 5h13L22 12v7H2v-7z" />
            </svg>
            Inbox
            {v.navInbox ? (
              <>
              <span className="badge">
                {v.navInbox}
              </span>
              </>
            ) : null}
          </SkLink>
          {" "}
          <SkLink href="/create" className="fab" aria-label="Create link">
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" aria-hidden="true">
              <path d="M12 5v14M5 12h14" />
            </svg>
          </SkLink>
          {" "}
          <SkLink href="/games">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <rect x="2" y="7" width="20" height="11" rx="5" />
              <path d="M7 11v3M5.5 12.5h3" />
            </svg>
            Games
          </SkLink>
          {" "}
          <SkLink href="/profile">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
              <circle cx="12" cy="8" r="4" />
              <path d="M4 21a8 8 0 0 1 16 0" />
            </svg>
            Profile
          </SkLink>
          {" "}
        </nav>
        {" "}
      </div>
      {" "}
      </>
    );
  }
}
