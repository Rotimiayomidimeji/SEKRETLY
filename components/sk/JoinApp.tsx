// @ts-nocheck -- ported 1:1 from design/mockup/JoinApp.dc.html by scripts/port-mockup.mjs; typed as it gets wired to real data
"use client";

import React, { Fragment } from "react";
import { saveMode, SkLink, route } from "@/lib/sk/runtime";


export default class JoinApp extends React.Component<Record<string, any>, any> {
  static defaultProps = {"mode":"dark"};

  constructor(props) {
    super(props);
    var m = null; // light/dark arrives as props.mode from the sk-mode cookie
    this.state = { mode: m || props.mode || 'dark', code: '', declined: {}, gift: false };
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
    var code = s.code.toUpperCase();
    var IV = [
      { id: 'a', gid: 'tod', href: 'TruthDareLobbyJoin.dc.html', room: 'Dare Club 300L', from: 'Fox invited you', game: 'Truth or Dare', seats: '2 of 4 seated', icon: '/sk/bottle_with_popping_cork_3d.png', tint: 'linear-gradient(135deg,#ff9a4a,#7a2d0b)' },
      { id: 'b', gid: 'mlt', href: 'MostLikelyLobbyJoin.dc.html', room: 'Hostel B awards', from: 'Moon invited you', game: 'Most Likely To', seats: '5 of 8 seated', icon: '/sk/crown_3d.png', tint: 'linear-gradient(135deg,#ffd23d,#3a2a08)' }
    ].filter(function (x) { return !s.declined[x.id]; });
    var joinAs = function (game, room, late) { return function () { try { window.localStorage.setItem('sk-join', JSON.stringify({ game: game, room: room, role: 'player', late: !!late })); window.localStorage.setItem('sk-nav', String(Date.now())); } catch (e) {} }; };
    var DAYS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
    return {
      mode: dark ? 'dark' : 'light', isDark: dark, isLight: !dark, modeWord: dark ? 'Light' : 'Dark',
      toggleMode: function () { var x = dark ? 'light' : 'dark'; saveMode(x); self.setState({ mode: x }); },
      code: code, onCode: function (e) { var c = e.target.value.replace(/[^a-z0-9]/gi, '').toUpperCase().slice(0, 5); self.setState({ code: c }); if (c.length === 5 && self.props.peek) self.props.peek(c).then(function (v) { self.setState({ peek: { code: c, room: v } }); }); },
      codeHref: '/join/' + code, codeHint: code.length < 5,
      codeOk: (function () { var p = s.peek; return code.length === 5 && !!p && p.code === code && !!p.room && p.room.status === 'LOBBY'; })(),
      codeBad: (function () { var p = s.peek; return code.length === 5 && !!p && p.code === code && (!p.room || p.room.status !== 'LOBBY'); })(),
      peekName: s.peek && s.peek.room ? s.peek.room.name : '',
      peekMeta: s.peek && s.peek.room ? ({ nhie: 'Never Have I Ever', tod: 'Truth or Dare', wyr: 'Would You Rather', mlt: 'Most Likely To', hot: 'Hot Takes', poll: 'Anonymous Polls' }[s.peek.room.game] || 'Game') + ' · ' + s.peek.room.players.length + ' of ' + s.peek.room.max + ' seated' : '',
      rooms: (this.props.rooms || []).map(function (r) { return { name: r.name, type: { nhie: 'Never Have I Ever', tod: 'Truth or Dare', wyr: 'Would You Rather', mlt: 'Most Likely To', hot: 'Hot Takes', poll: 'Anonymous Polls' }[r.g] || 'Game', joined: r.joined, max: r.max, href: '/join/' + r.code }; }),
      noRooms: !(this.props.rooms || []).length,
      invites: IV.map(function (x) { return Object.assign({}, x, { join: joinAs(x.gid, x.room), decline: function () { var o = Object.assign({}, s.declined); o[x.id] = true; self.setState({ declined: o }); } }); }),
      inviteCount: IV.length, noInvites: IV.length === 0,
      live: [['Fox', '#ffb35c', 'Truth or Dare · Dare Club 300L · turn 3 of 6', 'Jump in', 'tod', 'Dare Club 300L', 'TruthDare.dc.html', true], ['Ada', '#7ef0c1', 'Hot Takes · Sunday vibes only · in the lobby', 'Join', 'hot', 'Sunday vibes only', 'HotTakesLobbyJoin.dc.html', false], ['Tolu', '#ff9ad5', 'Would You Rather · Class of 2027 chaos · turn 4 of 8', 'Jump in', 'wyr', 'Class of 2027 chaos', 'WYR.dc.html', true]].map(function (x) { return { name: x[0], initial: x[0].charAt(0), bg: x[1], what: x[2], cta: x[3], href: x[6], join: joinAs(x[4], x[5], x[7]) }; }),
      week: DAYS.map(function (d, k) { var done = k < 4, today = k === 4; return { label: done ? '🔥' : d, bg: done ? '#ff3b8d' : today ? 'var(--card2)' : 'transparent', ink: done ? '#ffffff' : 'var(--muted)' }; }),
      giftCls: s.gift ? 'pop' : 'float', giftDone: s.gift,
      giftTitle: s.gift ? 'Situationship pack unlocked' : 'Daily pack ready', giftSub: s.gift ? '30 new spicy cards in all six games. Next pack in 23h.' : 'Open it for a free card pack. Comes back every day.',
      giftCta: s.gift ? 'Opened' : 'Open', openGift: function () { self.setState({ gift: true }); },
      ranks: [['MangoMoon (you)', '#ffd23d', 1240, 800], ['BlueFox', '#7fb2ff', 1180, 600], ['ZoboQueen', '#b78bff', 960, 600], ['KolaNut', '#ff9ad5', 720, 600], ['CocoaRay', '#7ef0c1', 610, 600]].map(function (r, k) { return { n: k + 1, name: r[0], initial: r[0].charAt(0), bg: r[1], xp: r[2], w: r[3] }; })
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
              Home
            </SkLink>
            {" "}
            <SkLink href="/inbox" className="nav-i">
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
            <SkLink href="/games" className="nav-i" aria-current="page">
              Games
            </SkLink>
            {" "}
            <SkLink href="/notifications" className="nav-i">
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
              Profile
            </SkLink>
            {" "}
          </nav>
          {" "}
          <div className="main">
            {" "}
            <div className="wrap" style={{ maxWidth: "760px" }}>
              {" "}
              <header className="topbar">
                {" "}
                <SkLink href="/games" className="icon-btn tap" aria-label="Back to games">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M15 18 9 12l6-6" />
                  </svg>
                </SkLink>
                {" "}
                <h1 className="grow" style={{ fontSize: "26px" }}>
                  Join a game
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
              <section className="card" style={{ padding: "16px" }}>
                {" "}
                <label htmlFor="ja-code" style={{ fontWeight: "800" }}>
                  Room code
                </label>
                {" "}
                <input id="ja-code" className="ja-code" value={v.code ?? ""} onChange={v.onCode} maxLength="5" placeholder="·····" autoComplete="off" style={{ marginTop: "10px" }} />
                {" "}
                {v.codeBad ? (
                  <>
                  <p style={{ marginTop: "8px", fontSize: "13.5px", color: "var(--bad)", fontWeight: "700" }}>
                    No room with that code. Check the letters, or ask for the link.
                  </p>
                  </>
                ) : null}
                {" "}
                {v.codeOk ? (
                  <>
                  {" "}
                  <div className="ja-prev pop" style={{ background: "radial-gradient(120% 90% at 50% 0%,#4a1263 0%,#160a22 70%)" }}>
                    {" "}
                    <img src="/sk/shushing_face.png" alt="" style={{ width: "46px", height: "46px", flex: "none" }} />
                    {" "}
                    <span style={{ flex: "1" }}>
                      <b className="d" style={{ fontSize: "18px" }}>
                        {v.peekName}
                      </b>
                      <div style={{ fontSize: "13px", opacity: ".85" }}>
                        {v.peekMeta}
                      </div>
                    </span>
                    {" "}
                    <SkLink href={route(v.codeHref)} className="btn btn-sm tap" style={{ background: "#ffffff", color: "#1a0b14", border: "0" }}>
                      Join
                    </SkLink>
                    {" "}
                  </div>
                  {" "}
                  </>
                ) : null}
                {" "}
                {v.codeHint ? (
                  <>
                  <p className="muted" style={{ marginTop: "8px", fontSize: "13px" }}>
                    Ask the host for the 5-letter room code
                  </p>
                  </>
                ) : null}
                {" "}
              </section>
              {" "}
              <div className="sec-h">
                <h2>
                  Open rooms
                </h2>
                <SkLink href="/games" className="pink" style={{ fontWeight: "700", fontSize: "14px" }}>
                  All games
                </SkLink>
              </div>
              {" "}
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                {" "}
                {(v.rooms || []).map((r, i0) => (
                  <Fragment key={i0}>
                  {" "}
                  <div className="card" style={{ padding: "12px", display: "flex", gap: "12px", alignItems: "center" }}>
                    {" "}
                    <span style={{ flex: "1", minWidth: "0" }}>
                      <b>
                        {r.name}
                      </b>
                      <div className="muted" style={{ fontSize: "12.5px" }}>
                        {r.type}{" · "}{r.joined}/{r.max}{" joined"}
                      </div>
                    </span>
                    {" "}
                    <SkLink href={route(r.href)} className="btn btn-sm btn-cta tap">
                      Join
                    </SkLink>
                    {" "}
                  </div>
                  {" "}
                  </Fragment>
                ))}
                {" "}
                {v.noRooms ? (
                  <>
                  <p className="muted" style={{ fontSize: "14px" }}>
                    {"No open rooms right now. "}
                    <SkLink href="/games/new" className="pink">
                      Start one
                    </SkLink>
                    {" and invite your people."}
                  </p>
                  </>
                ) : null}
                {" "}
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
          <SkLink href="/games/new" className="fab" aria-label="Create game">
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" aria-hidden="true">
              <path d="M12 5v14M5 12h14" />
            </svg>
          </SkLink>
          {" "}
          <SkLink href="/games" aria-current="page">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
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
