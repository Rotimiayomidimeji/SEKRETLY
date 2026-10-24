// @ts-nocheck -- ported 1:1 from design/mockup/Home.dc.html by scripts/port-mockup.mjs; typed as it gets wired to real data
"use client";

import React, { Fragment } from "react";
import { saveMode, SkLink, route } from "@/lib/sk/runtime";


export default class Home extends React.Component<Record<string, any>, any> {
  static defaultProps = {"mode":"dark","ads":"on"};

  constructor(props) {
    super(props);
    var m = null; // light/dark arrives as props.mode from the sk-mode cookie
    this.state = { mode: m || props.mode || 'dark', count: props.unread || 0, drop: false, installPrompt: false, installed: false, toast: null, paused: (props.links || []).reduce(function (p, l) { if (l.paused) p[l.id] = true; return p; }, {}), hero: 0, spot: 0, left: props.drop ? props.drop.secondsLeft : 0, tick: 0 };
  }
  componentDidMount() {
    var self = this;
    // two spots on Home take turns so the page stays short: the top card and the spotlight
    this.rot = setInterval(function () {
      var s = self.state, t = s.tick + 1, n = { tick: t, left: Math.max(0, s.left - 1) };
      if (t % 7 === 0) n.hero = (s.hero + 1) % 2;
      if (t % 5 === 0) n.spot = (s.spot + 1) % Math.max(1, (self.props.spots || []).length);
      self.setState(n);
    }, 1000);
    this.onStore = function (e) { if (e.key === 'sk-mode' && e.newValue) self.setState({ mode: e.newValue }); };
    try { window.addEventListener('storage', this.onStore); } catch (e) {}
    try { window.addEventListener('beforeinstallprompt', this.onBip = function (e) { e.preventDefault(); self.bip = e; self.t1 = setTimeout(function () { if (!self.state.installed) self.setState({ drop: true }); }, 2500); }); } catch (e) {}
  }
  componentWillUnmount() { try { window.removeEventListener('storage', this.onStore); window.removeEventListener('beforeinstallprompt', this.onBip); } catch (e) {} clearInterval(this.rot); clearTimeout(this.t1); clearTimeout(this.t2); clearTimeout(this.t3); clearTimeout(this.t4); }
  componentDidUpdate(prev) {
    var self = this;
    if (prev.mode !== this.props.mode && this.props.mode) this.setState({ mode: this.props.mode });
    // the page refreshes every few seconds; a bigger unread count means something new arrived
    if (prev.unread !== this.props.unread) {
      var more = (this.props.unread || 0) > this.state.count;
      this.setState({ count: this.props.unread || 0, toast: more ? 'msg' : this.state.toast });
      if (more) { clearTimeout(this.t3); this.t3 = setTimeout(function () { if (self.state.toast === 'msg') self.setState({ toast: null }); }, 4400); }
    }
  }
  renderVals() {
    var self = this, s = this.state, dark = s.mode !== 'light';
    var J = function (g, r, late) { return function () { try { window.localStorage.setItem('sk-join', JSON.stringify({ game: g, room: r, role: 'player', late: !!late })); window.localStorage.setItem('sk-nav', String(Date.now())); } catch (e) {} }; };
    var E = { peach: '/sk/peach.png', moon: '/sk/crescent_moon.png', unicorn: '/sk/unicorn.png', shush: '/sk/shushing_face.png', fire: '/sk/fire.png', eyes: '/sk/eyes.png', letter: '/sk/love_letter.png', sparkles: '/sk/sparkles.png' };
    var base = this.props.links || [];
    var toasts = {
      msg: { title: 'Someone sent you a message', sub: 'Tap to read · just now', icon: E.letter, href: 'Inbox.dc.html' },
      installed: { title: 'Sekretly is on your home screen', sub: 'Open it like any other app', icon: E.sparkles, href: 'Home.dc.html' },
      manual: { title: 'Add Sekretly to your home screen', sub: 'Open your browser menu (⋮ or Share) and tap “Add to Home screen”', icon: E.sparkles, href: 'Home.dc.html' }
    };
    var t = s.toast ? toasts[s.toast] : toasts.msg;
    var pad = function (n) { return n < 10 ? '0' + n : String(n); };
    var SP = this.props.spots && this.props.spots.length ? this.props.spots : [{ title: 'Your week, wrapped', sub: 'See what people said this week', icon: E.sparkles, href: 'WeeklyWrap.dc.html', bg: 'linear-gradient(135deg,#22337d,#7a3cff 70%,#d81b72)', ink: '#ffffff', line: 'transparent' }];
    var sp = SP[s.spot % SP.length];
    return {
      heroInbox: s.hero === 0, heroDrop: s.hero === 1,
      dropLeft: Math.floor(s.left / 3600) + 'h ' + pad(Math.floor(s.left % 3600 / 60)) + 'm',
      heroDots: ['New messages', 'Today’s drop'].map(function (l, k) { var on = s.hero === k; return { label: 'Show ' + l, on: on ? 'true' : 'false', w: on ? '22px' : '7px', c: on ? 'var(--pink)' : 'var(--line)', pick: function () { self.setState({ hero: k, tick: 0 }); } }; }),
      sp: { title: sp.title, sub: sp.sub, icon: sp.icon, href: sp.href, bg: sp.bg, ink: sp.ink, line: sp.line, go: function () { if (sp.held) { try { window.localStorage.setItem('sk-ibf', 'held'); } catch (e) {} } } },
      spDots: SP.map(function (x, k) { return { c: k === s.spot ? (sp.ink === '#ffffff' ? '#ffffff' : 'var(--pink)') : (sp.ink === '#ffffff' ? 'rgba(255,255,255,.4)' : 'var(--line)') }; }),
      newGame: function () { try { window.localStorage.removeItem('sk-pick'); window.localStorage.removeItem('sk-edit'); window.localStorage.setItem('sk-nav', String(Date.now())); } catch (e) {} },
      mode: dark ? 'dark' : 'light', isDark: dark, isLight: !dark, modeWord: dark ? 'Light' : 'Dark',
      toggleMode: function () { var n = dark ? 'light' : 'dark'; saveMode(n); self.setState({ mode: n }); },
      ads: this.props.ads === 'off' ? 'off' : 'on',
      count: s.count, navInbox: s.count, countLabel: s.count === 0 ? 'No new messages' : s.count + (s.count === 1 ? ' new message' : ' new messages'),
      countSub: s.count === 0 ? 'share a link to get some · tap to open' : 'since you last checked' + (this.props.hintCount ? ' · ' + this.props.hintCount + ' left a hint' : ' · tap to read'),
      streak: this.props.streak || 0, streakLabel: (this.props.streak || 0) + ((this.props.streak || 0) === 1 ? ' day' : ' days'), dropQ: this.props.drop ? this.props.drop.question : '', dropSub: this.props.drop ? this.props.drop.sub : '',
      notifUnread: this.props.notifUnread || 0, hasNotif: (this.props.notifUnread || 0) > 0,
      links: base.map(function (l) {
        var p = !!s.paused[l.id];
        return Object.assign({}, l, { status: p ? 'Paused' : 'Live', action: p ? 'Resume link' : 'Pause', toggle: function () { var n = Object.assign({}, s.paused); n[l.id] = !p; self.setState({ paused: n }); self.props.setPaused(l.id, !p); } });
      }),
      games: [
        { name: 'Friday Night Never', type: 'Never Have I Ever', joined: 3, max: 6, left: '1h 20m', icon: E.shush, tint: 'linear-gradient(135deg,#ff5fa2,#7a3cff)', href: 'NHIELobbyJoin.dc.html', join: J('nhie', 'Friday Night Never') },
        { name: 'Hostel B confessions', type: 'Never Have I Ever', joined: 7, max: 10, left: '42m', icon: E.fire, tint: 'linear-gradient(135deg,#ffb35c,#ff4f6d)', href: 'NHIELobbyJoin.dc.html', join: J('nhie', 'Hostel B confessions') },
        { name: 'Class of 2027 chaos', type: 'Would You Rather', joined: 2, max: 8, left: '1h 55m', icon: E.eyes, tint: 'linear-gradient(135deg,#22e1ff,#3a6bff)', href: 'WYRLobbyJoin.dc.html', join: J('wyr', 'Class of 2027 chaos') }
      ],
      showDrop: s.drop && !s.installed,
      hideDrop: function () { self.setState({ drop: false }); },
      askInstall: function () {
        if (self.bip) {
          self.bip.prompt();
          self.bip.userChoice.then(function (c) { if (c && c.outcome === 'accepted') { self.setState({ installed: true, drop: false, toast: 'installed' }); } self.bip = null; });
          return;
        }
        self.setState({ toast: 'manual' });
        clearTimeout(self.t4); self.t4 = setTimeout(function () { if (self.state.toast === 'manual') self.setState({ toast: null }); }, 5200);
      },
      installPrompt: s.installPrompt,
      cancelInstall: function () { self.setState({ installPrompt: false }); },
      doInstall: function () {
        self.setState({ installPrompt: false, installed: true, drop: false, toast: 'installed' });
        clearTimeout(self.t4); self.t4 = setTimeout(function () { if (self.state.toast === 'installed') self.setState({ toast: null }); }, 4400);
      },
      toast: !!s.toast, toastTitle: t.title, toastSub: t.sub, toastIcon: t.icon, toastHref: t.href
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
            <SkLink href="/home" className="nav-i" aria-current="page">
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
            <SkLink href="/notifications" className="nav-i">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
                <path d="M10.3 21a1.9 1.9 0 0 0 3.4 0" />
              </svg>
              Notifications
              {v.navNotif ? (
                <>
                <span className="count">
                  {v.navNotif}
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
            <button className="btn btn-sm tap" onClick={v.askInstall} style={{ marginTop: "auto" }}>
              Install app
            </button>
            {" "}
          </nav>
          {" "}
          <div className="main">
            {" "}
            <div className="wrap cols" style={{ maxWidth: "1180px" }}>
              {" "}
              <div className="colmain">
                {" "}
                <header className="topbar">
                  {" "}
                  <span className="av" style={{ background: "linear-gradient(135deg,#d6ff6b,#22c4a0)" }}>
                    <img src={`/sk/${v.avatar}.png`} alt="" />
                  </span>
                  {" "}
                  <div className="grow">
                    {" "}
                    <div className="muted" style={{ fontSize: "13px" }}>
                      {v.greeting}
                    </div>
                    {" "}
                    <div className="d" style={{ fontSize: "22px", fontWeight: "800", letterSpacing: "-.02em" }}>
                      {"Hey, "}{v.username}
                    </div>
                    {" "}
                  </div>
                  {" "}
                  <SkLink href="/streak" className="tap" aria-label={`Your streak, ${v.streakLabel}`} style={{ display: "inline-flex", alignItems: "center", gap: "5px", minHeight: "44px", padding: "0 12px", borderRadius: "99px", textDecoration: "none", fontWeight: "800", fontSize: "15px", color: "#ffffff", background: "linear-gradient(135deg,#ff8a2b,#ff3d6e)", flex: "none" }}>
                    {" "}
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="#ffffff" aria-hidden="true">
                      <path d="M12 2c1 4 5 6 5 11a5 5 0 0 1-10 0c0-2 1-3.5 2-4.5 0 2 1 3 2 3 0-4-1-6 1-9.5z" />
                    </svg>
                    {v.streak}{" "}
                  </SkLink>
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
                  <SkLink href="/notifications" className="icon-btn tap" aria-label={`Notifications, ${v.notifUnread} unread`}>
                    {" "}
                    <img className="wave" src="/sk/bell.png" alt="" style={{ width: "26px", height: "26px" }} />
                    {" "}
                    {v.hasNotif ? (
                      <>
                      <span className="badge">
                        {v.notifUnread}
                      </span>
                      </>
                    ) : null}
                    {" "}
                  </SkLink>
                  {" "}
                </header>
                {" "}
                {v.heroInbox ? (
                  <>
                  {" "}
                  <SkLink href="/inbox" className="tap rise" style={{ display: "flex", alignItems: "center", gap: "16px", padding: "20px", minHeight: "168px", borderRadius: "26px", textDecoration: "none", color: "#ffffff", background: "radial-gradient(120% 120% at 100% 0%,#7a3cff 0%,#d81b72 55%,#8a0f47 100%)", overflow: "hidden" }}>
                    {" "}
                    <div style={{ flex: "1", minWidth: "0" }}>
                      {" "}
                      <span style={{ display: "inline-flex", alignItems: "center", gap: "8px", fontSize: "13px", fontWeight: "700", padding: "6px 10px", borderRadius: "99px", background: "rgba(0,0,0,.22)" }}>
                        <span className="live" style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#5be0a0" }} />
                        Inbox
                      </span>
                      {" "}
                      <div className="d" style={{ marginTop: "10px", fontSize: "clamp(28px, 6cqi, 40px)", fontWeight: "800", letterSpacing: "-.03em", lineHeight: "1" }}>
                        {v.countLabel}
                      </div>
                      {" "}
                      <div style={{ marginTop: "6px", fontSize: "15px", color: "rgba(255,255,255,.88)" }}>
                        {v.countSub}
                      </div>
                      {" "}
                    </div>
                    {" "}
                    <img src="/sk/love_letter.png" alt="" style={{ width: "88px", height: "88px", flex: "none", transform: "rotate(-8deg)" }} />
                    {" "}
                  </SkLink>
                  {" "}
                  </>
                ) : null}
                {" "}
                {v.heroDrop ? (
                  <>
                  {" "}
                  <SkLink href="/drop" className="tap rise" style={{ display: "flex", alignItems: "center", gap: "16px", padding: "20px", minHeight: "168px", borderRadius: "26px", textDecoration: "none", color: "#ffffff", background: "radial-gradient(130% 120% at 100% 0%,#ffb347 0%,#ff4f6d 40%,#7a1fa2 100%)", overflow: "hidden" }}>
                    {" "}
                    <div style={{ flex: "1", minWidth: "0" }}>
                      {" "}
                      <span style={{ display: "inline-flex", alignItems: "center", gap: "8px", fontSize: "13px", fontWeight: "700", padding: "6px 10px", borderRadius: "99px", background: "rgba(0,0,0,.22)" }}>
                        <span className="live" style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#5be0a0" }} />
                        {"Today’s drop · closes in "}{v.dropLeft}
                      </span>
                      {" "}
                      <div className="d" style={{ marginTop: "10px", fontSize: "clamp(22px, 5cqi, 32px)", fontWeight: "800", letterSpacing: "-.03em", lineHeight: "1.02" }}>
                        {v.dropQ}
                      </div>
                      {" "}
                      <div style={{ marginTop: "6px", fontSize: "15px", color: "rgba(255,255,255,.9)" }}>
                        {v.dropSub}
                      </div>
                      {" "}
                    </div>
                    {" "}
                    <img className="float" src="/sk/sparkles.png" alt="" style={{ width: "76px", height: "76px", flex: "none" }} />
                    {" "}
                  </SkLink>
                  {" "}
                  </>
                ) : null}
                {" "}
                <div className="row" style={{ justifyContent: "center", gap: "6px", marginTop: "8px" }} role="group" aria-label="Top card">
                  {" "}
                  {(v.heroDots || []).map((hd, i0) => (
                    <Fragment key={i0}>
                    <button className="tap" onClick={hd.pick} aria-label={hd.label} aria-pressed={hd.on} style={{ width: "28px", height: "28px", border: "0", background: "transparent", padding: "0", display: "grid", placeItems: "center" }}>
                      <span style={{ display: "block", width: hd.w, height: "7px", borderRadius: "9px", background: hd.c, transition: "width .25s" }} />
                    </button>
                    </Fragment>
                  ))}
                  {" "}
                </div>
                {" "}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: "10px", marginTop: "12px" }}>
                  {" "}
                  <div className="card" style={{ padding: "14px" }}>
                    <div className="d" style={{ fontSize: "26px", fontWeight: "800" }}>
                      {v.stats.week}
                    </div>
                    <div className="muted" style={{ fontSize: "12.5px" }}>
                      messages this week
                    </div>
                  </div>
                  {" "}
                  <div className="card" style={{ padding: "14px" }}>
                    <div className="d" style={{ fontSize: "26px", fontWeight: "800" }}>
                      {v.stats.visits}
                    </div>
                    <div className="muted" style={{ fontSize: "12.5px" }}>
                      link visits this week
                    </div>
                  </div>
                  {" "}
                  <div className="card" style={{ padding: "14px" }}>
                    <div className="d" style={{ fontSize: "26px", fontWeight: "800" }}>
                      {v.stats.chats}
                    </div>
                    <div className="muted" style={{ fontSize: "12.5px" }}>
                      active chats
                    </div>
                  </div>
                  {" "}
                </div>
                {" "}
                <SkLink href={route(v.sp.href)} onClick={v.sp.go} className="tap" aria-live="polite" style={{ display: "flex", alignItems: "center", gap: "12px", marginTop: "12px", padding: "14px", borderRadius: "22px", textDecoration: "none", color: v.sp.ink, background: v.sp.bg, border: `1px solid ${v.sp.line}`, minHeight: "76px" }}>
                  {" "}
                  <img className="pop" src={v.sp.icon} alt="" style={{ width: "42px", height: "42px", flex: "none" }} />
                  {" "}
                  <span style={{ flex: "1", minWidth: "0" }}>
                    <b style={{ display: "block", fontSize: "15.5px" }}>
                      {v.sp.title}
                    </b>
                    <span style={{ fontSize: "13px", opacity: ".88" }}>
                      {v.sp.sub}
                    </span>
                  </span>
                  {" "}
                  <span style={{ display: "flex", gap: "4px", flex: "none" }} aria-hidden="true">
                    {(v.spDots || []).map((sd, i0) => (
                      <Fragment key={i0}>
                      <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: sd.c }} />
                      </Fragment>
                    ))}
                  </span>
                  {" "}
                </SkLink>
                {" "}
                <div className="sec-h">
                  <h2>
                    My links
                  </h2>
                  <SkLink href="/links" className="pink" style={{ fontWeight: "700", fontSize: "14px" }}>
                    Manage
                  </SkLink>
                </div>
                {" "}
                <div className="rail" style={{ display: "flex", gap: "12px", margin: "0 -16px", padding: "0 16px 4px", scrollSnapType: "x mandatory" }}>
                  {" "}
                  {(v.links || []).map((l, i0) => (
                    <Fragment key={i0}>
                    {" "}
                    <article className={l.th} style={{ flex: "none", width: "216px", minHeight: "230px", borderRadius: "24px", padding: "16px", display: "flex", flexDirection: "column", scrollSnapAlign: "start" }}>
                      {" "}
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        {" "}
                        <span style={{ fontSize: "12px", fontWeight: "800", letterSpacing: ".06em", textTransform: "uppercase", padding: "5px 9px", borderRadius: "99px", background: "rgba(0,0,0,.24)" }}>
                          {l.status}
                        </span>
                        {" "}
                        <img src={l.emoji} alt="" style={{ width: "38px", height: "38px" }} />
                        {" "}
                      </div>
                      {" "}
                      <div className="d" style={{ marginTop: "14px", fontSize: "21px", fontWeight: "800", lineHeight: "1.05", letterSpacing: "-.02em" }}>
                        {l.topic}
                      </div>
                      {" "}
                      <div style={{ marginTop: "auto", paddingTop: "12px" }}>
                        <span className="d" style={{ fontSize: "26px", fontWeight: "800" }}>
                          {l.count}
                        </span>
                        {" "}
                        <span style={{ fontSize: "13px", opacity: ".85" }}>
                          {"messages · "}{l.limit}
                        </span>
                      </div>
                      {" "}
                      <button className="tap" onClick={l.toggle} style={{ marginTop: "10px", minHeight: "44px", borderRadius: "14px", border: "0", background: "rgba(255,255,255,.95)", color: "#2a0a1c", fontWeight: "800", fontSize: "14px" }}>
                        {l.action}
                      </button>
                      {" "}
                    </article>
                    {" "}
                    </Fragment>
                  ))}
                  {" "}
                  <SkLink href="/create" className="tap" style={{ flex: "none", width: "150px", minHeight: "230px", borderRadius: "24px", border: "2px dashed var(--line)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "10px", textDecoration: "none", fontWeight: "700", scrollSnapAlign: "start" }}>
                    {" "}
                    <span className="logo-mark" style={{ width: "52px", height: "52px", borderRadius: "18px", fontSize: "28px" }}>
                      +
                    </span>
                    {"New link "}
                  </SkLink>
                  {" "}
                </div>
                {" "}
                <div className="ad-wrap">
                  <div className="ad ad-banner">
                    <b>
                      Responsive banner · home feed
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
                <div className="sec-h" style={{ marginTop: "8px" }}>
                  <h2>
                    Play with your people
                  </h2>
                  <SkLink href="/games" className="pink" style={{ fontWeight: "700", fontSize: "14px" }}>
                    All games
                  </SkLink>
                </div>
                {" "}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: "10px" }}>
                  {" "}
                  <SkLink href="/games/new" onClick={v.newGame} className="card tap" style={{ padding: "14px", textDecoration: "none", display: "flex", flexDirection: "column", gap: "8px", minHeight: "140px" }}>
                    {" "}
                    <img src="/sk/shushing_face.png" alt="" style={{ width: "42px", height: "42px" }} />
                    {" "}
                    <b className="d" style={{ fontSize: "17px", lineHeight: "1.05" }}>
                      Never Have I Ever
                    </b>
                    {" "}
                    <span className="muted" style={{ fontSize: "13px", marginTop: "auto" }}>
                      3–10 players · start one
                    </span>
                    {" "}
                  </SkLink>
                  {" "}
                  <SkLink href="/games/new" onClick={v.newGame} className="card tap" style={{ padding: "14px", textDecoration: "none", display: "flex", flexDirection: "column", gap: "8px", minHeight: "140px" }}>
                    {" "}
                    <img src="/sk/game_die.png" alt="" style={{ width: "42px", height: "42px" }} />
                    {" "}
                    <b className="d" style={{ fontSize: "17px", lineHeight: "1.05" }}>
                      Truth or Dare
                    </b>
                    {" "}
                    <span className="muted" style={{ fontSize: "13px", marginTop: "auto" }}>
                      2–4 players · start one
                    </span>
                    {" "}
                  </SkLink>
                  {" "}
                </div>
                {" "}
                <h3 style={{ fontSize: "15px", margin: "18px 0 10px" }}>
                  Open games near you
                </h3>
                {" "}
                <ul style={{ listStyle: "none", margin: "0", padding: "0", display: "flex", flexDirection: "column", gap: "10px" }}>
                  {" "}
                  {(v.games || []).map((g, i0) => (
                    <Fragment key={i0}>
                    {" "}
                    <li className="card" style={{ display: "flex", alignItems: "center", gap: "12px", padding: "12px" }}>
                      {" "}
                      <span className="av" style={{ background: g.tint }}>
                        <img src={g.icon} alt="" />
                      </span>
                      {" "}
                      <div style={{ flex: "1", minWidth: "0" }}>
                        {" "}
                        <div style={{ fontWeight: "800", fontSize: "15px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                          {g.name}
                        </div>
                        {" "}
                        <div className="muted" style={{ fontSize: "13px" }}>
                          {g.type}{" · "}{g.joined}/{g.max}{" · "}{g.left}{" left"}
                        </div>
                        {" "}
                      </div>
                      {" "}
                      <SkLink href={route(g.href)} onClick={g.join} className="btn btn-sm btn-cta tap">
                        Join
                      </SkLink>
                      {" "}
                    </li>
                    {" "}
                    </Fragment>
                  ))}
                  {" "}
                </ul>
                {" "}
              </div>
              {" "}
              <aside className="rightrail" aria-label="Sponsored and tips">
                {" "}
                <div className="ad ad-half">
                  <b>
                    Half page · sticky right rail
                  </b>
                  300 × 600 · wide screens only
                </div>
                {" "}
              </aside>
              {" "}
            </div>
            {" "}
          </div>
          {" "}
        </div>
        {" "}
        <nav className="bnav" aria-label="Main">
          {" "}
          <SkLink href="/home" aria-current="page">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
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
        {v.showDrop ? (
          <>
          {" "}
          <div className="drop" role="region" aria-label="Install Sekretly">
            {" "}
            <div className="card" style={{ display: "flex", alignItems: "center", gap: "12px", padding: "12px 12px 12px 14px", boxShadow: "var(--shadow)", background: "var(--card2)" }}>
              {" "}
              <span className="logo-mark" style={{ width: "42px", height: "42px", borderRadius: "13px", fontSize: "22px" }}>
                S
              </span>
              {" "}
              <div style={{ flex: "1", minWidth: "0" }}>
                {" "}
                <b style={{ fontSize: "15px" }}>
                  Install Sekretly
                </b>
                {" "}
                <div className="muted" style={{ fontSize: "13px" }}>
                  Faster, and never miss a message.
                </div>
                {" "}
              </div>
              {" "}
              <button className="btn btn-sm btn-cta tap" onClick={v.askInstall}>
                Install
              </button>
              {" "}
              <button className="icon-btn tap" onClick={v.hideDrop} aria-label="Dismiss" style={{ width: "36px", height: "36px", borderRadius: "12px" }}>
                {" "}
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" aria-hidden="true">
                  <path d="M6 6l12 12M18 6 6 18" />
                </svg>
                {" "}
              </button>
              {" "}
            </div>
            {" "}
          </div>
          {" "}
          </>
        ) : null}
        {" "}
        {v.installPrompt ? (
          <>
          {" "}
          <div style={{ position: "fixed", inset: "0", zIndex: "60", background: "rgba(0,0,0,.45)", display: "flex", alignItems: "center", justifyContent: "center", padding: "20px" }}>
            {" "}
            <div role="dialog" aria-label="Install app" className="pop" style={{ width: "min(100%, 340px)", background: "#ffffff", color: "#202124", borderRadius: "16px", boxShadow: "0 10px 40px rgba(0,0,0,.4)", padding: "20px", fontFamily: "Roboto, system-ui, sans-serif" }}>
              {" "}
              <div style={{ fontSize: "18px", fontWeight: "500" }}>
                Install app?
              </div>
              {" "}
              <div style={{ display: "flex", alignItems: "center", gap: "12px", marginTop: "16px" }}>
                {" "}
                <span className="logo-mark" style={{ width: "44px", height: "44px", borderRadius: "12px", fontSize: "22px" }}>
                  S
                </span>
                {" "}
                <div>
                  <div style={{ fontWeight: "600" }}>
                    Sekretly
                  </div>
                  <div style={{ fontSize: "13px", color: "#5f6368" }}>
                    sekretly.com
                  </div>
                </div>
                {" "}
              </div>
              {" "}
              <div style={{ display: "flex", justifyContent: "flex-end", gap: "8px", marginTop: "20px" }}>
                {" "}
                <button onClick={v.cancelInstall} style={{ minHeight: "40px", padding: "0 16px", borderRadius: "20px", border: "0", background: "transparent", color: "#1a73e8", fontWeight: "600" }}>
                  Cancel
                </button>
                {" "}
                <button onClick={v.doInstall} style={{ minHeight: "40px", padding: "0 18px", borderRadius: "20px", border: "0", background: "#1a73e8", color: "#ffffff", fontWeight: "600" }}>
                  Install
                </button>
                {" "}
              </div>
              {" "}
            </div>
            {" "}
          </div>
          {" "}
          </>
        ) : null}
        {" "}
        {v.toast ? (
          <>
          {" "}
          <SkLink href={route(v.toastHref)} className="toast" role="status">
            {" "}
            <img src={v.toastIcon} alt="" style={{ width: "34px", height: "34px", flex: "none" }} />
            {" "}
            <span style={{ fontSize: "14px", lineHeight: "1.35" }}>
              <b>
                {v.toastTitle}
              </b>
              <br />
              <span className="muted">
                {v.toastSub}
              </span>
            </span>
            {" "}
          </SkLink>
          {" "}
          </>
        ) : null}
        {" "}
      </div>
      {" "}
      </>
    );
  }
}
