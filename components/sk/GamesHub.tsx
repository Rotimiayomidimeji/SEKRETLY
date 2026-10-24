// @ts-nocheck -- ported 1:1 from design/mockup/GamesHub.dc.html by scripts/port-mockup.mjs; typed as it gets wired to real data
"use client";

import React, { Fragment } from "react";
import { saveMode, SkLink, route } from "@/lib/sk/runtime";


export default class GamesHub extends React.Component<Record<string, any>, any> {
  static defaultProps = {"mode":"dark","ads":"on"};

  constructor(props) {
    super(props);
    var m = null; // light/dark arrives as props.mode from the sk-mode cookie
    this.state = { mode: m || props.mode || 'dark', filter: 'all', code: '' };
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
    var E = { shush: '/sk/shushing_face.png', die: '/sk/game_die.png', eyes: '/sk/eyes.png', fire: '/sk/fire.png', sparkles: '/sk/sparkles.png', letter: '/sk/love_letter.png' };
    var tint = { nhie: 'linear-gradient(135deg,#ff5fa2,#7a3cff)', tod: 'linear-gradient(135deg,#ffb35c,#ff4f6d)', wyr: 'linear-gradient(135deg,#22e1ff,#3a6bff)', mlt: 'linear-gradient(135deg,#ff8a3d,#c2185b)', hot: 'linear-gradient(135deg,#ffd23d,#ff7a45)', poll: 'linear-gradient(135deg,#7ef0c1,#3aa0ff)' };
    var off = dark ? 'rgba(255,255,255,.16)' : 'rgba(48,34,72,.14)';
    var G = [
      { id: 'nhie', name: 'Never Have I Ever', meta: 'Tip a cup · 3–10', icon: E.shush, tag: 'Hot', tagBg: '#c2185b', tagInk: '#fff' },
      { id: 'tod', name: 'Truth or Dare', meta: 'Spin the bottle · 2–8', icon: '/sk/bottle_with_popping_cork_3d.png', tag: 'Live', tagBg: '#0d7f4b', tagInk: '#fff' },
      { id: 'wyr', name: 'Would You Rather', meta: 'Pick a side · 2–20', icon: '/sk/crossed_swords_3d.png', tag: 'Live', tagBg: '#0d7f4b', tagInk: '#fff' },
      { id: 'mlt', name: 'Most Likely To', meta: 'Win the crown · 3–15', icon: '/sk/crown_3d.png', tag: 'New', tagBg: '#7a3cff', tagInk: '#fff' },
      { id: 'hot', name: 'Hot Takes', meta: 'Read the room · 2–20', icon: '/sk/hot_pepper_3d.png', tag: 'New', tagBg: '#7a3cff', tagInk: '#fff' },
      { id: 'poll', name: 'Anonymous Polls', meta: 'Guess the winner · any size', icon: '/sk/ballot_box_with_ballot_3d.png', tag: 'Live', tagBg: '#0d7f4b', tagInk: '#fff' }
    ].map(function (g) { g.tint = tint[g.id]; return g; });
    var O = this.props.rooms || [];
    var gById = {}; G.forEach(function (g) { gById[g.id] = g; });
    var shown = O.filter(function (o) { return s.filter === 'all' || o.g === s.filter; });
    return {
      mode: dark ? 'dark' : 'light', isDark: dark, isLight: !dark, modeWord: dark ? 'Light' : 'Dark',
      toggleMode: function () { var n = dark ? 'light' : 'dark'; saveMode(n); self.setState({ mode: n }); },
      ads: this.props.ads === 'off' ? 'off' : 'on',
      crews: [
        { name: 'Hostel B gang', meta: '6 members · 4-week streak', next: 'Game night Fri 9pm · Most Likely To', icon: E.fire, tint: 'linear-gradient(135deg,#ffb35c,#ff4f6d)' },
        { name: 'Class of 2027', meta: '8 members · question reveals 9pm', next: 'Today’s crew question is open', icon: E.eyes, tint: 'linear-gradient(135deg,#22e1ff,#3a6bff)' },
        { name: 'Sunday brunch crew', meta: '4 members · 7-week streak', next: 'Hot Takes rematch · Sun 2pm', icon: E.shush, tint: 'linear-gradient(135deg,#ff5fa2,#7a3cff)' }
      ].map(function (c) {
        return Object.assign({}, c, {
          open: function () { try { window.localStorage.setItem('sk-crew', c.name); } catch (e) {} },
          play: function () { try { window.localStorage.setItem('sk-crew', c.name); window.localStorage.removeItem('sk-pick'); window.localStorage.removeItem('sk-edit'); window.localStorage.setItem('sk-nav', String(Date.now())); } catch (e) {} }
        });
      }),
      code: s.code, onCode: function (e) { self.setState({ code: e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '') }); }, codeOk: s.code.length >= 5, codeHref: '/join/' + s.code,
      games: G.map(function (g) { return Object.assign({ tint: 'var(--card2)' }, g, { newHref: '/games/new?game=' + g.id, pick: function () { try { window.localStorage.setItem('sk-pick', g.id); window.localStorage.removeItem('sk-edit'); window.localStorage.removeItem('sk-crew'); window.localStorage.setItem('sk-nav', String(Date.now())); } catch (e) {} } }); }),
      filters: [['all', 'All'], ['nhie', 'Never Have I Ever'], ['tod', 'Truth or Dare'], ['wyr', 'Would You Rather'], ['mlt', 'Most Likely To'], ['hot', 'Hot Takes'], ['poll', 'Polls']].map(function (f) { var on = s.filter === f[0]; return { label: f[1], on: on ? 'true' : 'false', cls: on ? 'on' : '', pick: function () { self.setState({ filter: f[0] }); } }; }),
      openCount: shown.length,
      joinCode: function () { try { window.localStorage.setItem('sk-join', JSON.stringify({ game: 'nhie', room: 'Friday Night Never', role: 'player' })); window.localStorage.setItem('sk-nav', String(Date.now())); } catch (e) {} },
      newGame: function () { try { window.localStorage.removeItem('sk-pick'); window.localStorage.removeItem('sk-edit'); window.localStorage.removeItem('sk-crew'); window.localStorage.setItem('sk-nav', String(Date.now())); } catch (e) {} },
      open: shown.map(function (o, i) {
        var joinRoom = function () { try { window.localStorage.setItem('sk-join', JSON.stringify({ game: o.g, room: o.name, role: 'player' })); window.localStorage.setItem('sk-nav', String(Date.now())); } catch (e) {} };
        var g = gById[o.g], seats = [];
        for (var k = 0; k < o.max; k++) seats.push({ c: k < o.joined ? '#5be0a0' : off });
        return { name: o.name, type: g.name, icon: g.icon, tint: g.tint, joined: o.joined, max: o.max, left: o.left, seats: seats, adAfter: i === 2, join: joinRoom, href: '/join/' + o.code };
      })
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
            <SkLink href="/games" className="nav-i" aria-current="page">
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
          </nav>
          {" "}
          <div className="main">
            {" "}
            <div className="wrap">
              {" "}
              <header className="topbar">
                {" "}
                <h1 className="grow" style={{ fontSize: "30px" }}>
                  Games
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
                <SkLink href="/notifications" className="icon-btn tap" aria-label="Notifications">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
                    <path d="M10.3 21a1.9 1.9 0 0 0 3.4 0" />
                  </svg>
                  {v.navNotif ? (
                    <>
                    <span className="badge">
                      {v.navNotif}
                    </span>
                    </>
                  ) : null}
                </SkLink>
                {" "}
              </header>
              {" "}
              <div className="card row" style={{ padding: "10px 10px 10px 14px", gap: "8px" }}>
                {" "}
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={{ color: "var(--muted)", flex: "none" }}>
                  <path d="M10 13a5 5 0 0 0 7 0l3-3a5 5 0 0 0-7-7l-1 1" />
                  <path d="M14 11a5 5 0 0 0-7 0l-3 3a5 5 0 0 0 7 7l1-1" />
                </svg>
                {" "}
                <label htmlFor="gh-code" className="sr">
                  Game code
                </label>
                {" "}
                <input id="gh-code" value={v.code ?? ""} onChange={v.onCode} placeholder="Got a game code? e.g. MANGO7" maxLength="6" style={{ flex: "1", minWidth: "0", border: "0", background: "transparent", color: "var(--ink)", fontSize: "16px", fontWeight: "700", outline: "none", textTransform: "uppercase", minHeight: "44px" }} />
                {" "}
                {v.codeOk ? (
                  <>
                  <SkLink href={route(v.codeHref)} className="btn btn-sm btn-cta tap">
                    Join
                  </SkLink>
                  </>
                ) : null}
                {" "}
              </div>
              {" "}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: "10px", marginTop: "12px" }}>
                {" "}
                <SkLink href="/streak" className="card tap lift" style={{ padding: "14px", textDecoration: "none", display: "flex", gap: "10px", alignItems: "center" }}>
                  <img src="/sk/fire.png" alt="" style={{ width: "36px", height: "36px" }} />
                  <span>
                    <b className="d" style={{ fontSize: "17px", display: "block" }}>
                      12-day streak
                    </b>
                    <span className="muted" style={{ fontSize: "12.5px" }}>
                      Play or drop today
                    </span>
                  </span>
                </SkLink>
                {" "}
                <SkLink href="/games/join" className="card tap lift" style={{ padding: "14px", textDecoration: "none", display: "flex", gap: "10px", alignItems: "center" }}>
                  <img className="float" src="/sk/wrapped_gift_3d.png" alt="" style={{ width: "36px", height: "36px" }} />
                  <span>
                    <b className="d" style={{ fontSize: "17px", display: "block" }}>
                      Daily pack
                    </b>
                    <span className="muted" style={{ fontSize: "12.5px" }}>
                      2 invites waiting
                    </span>
                  </span>
                </SkLink>
                {" "}
              </div>
              {" "}
              <div className="sec-h">
                <h2>
                  Your crews
                </h2>
                <SkLink href="/crews" className="pink" style={{ fontWeight: "700", fontSize: "14px" }}>
                  All crews
                </SkLink>
              </div>
              {" "}
              <div className="rail" style={{ display: "flex", gap: "10px", margin: "0 -16px", padding: "0 16px 4px" }}>
                {" "}
                {(v.crews || []).map((cr, i0) => (
                  <Fragment key={i0}>
                  {" "}
                  <div className="card" style={{ flex: "none", width: "236px", padding: "14px", display: "flex", flexDirection: "column", gap: "10px" }}>
                    {" "}
                    <SkLink href="/crews" onClick={cr.open} className="row" style={{ gap: "10px", textDecoration: "none", color: "var(--ink)" }}>
                      {" "}
                      <span className="av" style={{ width: "42px", height: "42px", borderRadius: "14px", background: cr.tint }}>
                        <img src={cr.icon} alt="" />
                      </span>
                      {" "}
                      <span style={{ minWidth: "0" }}>
                        <b style={{ display: "block", fontSize: "15px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                          {cr.name}
                        </b>
                        <span className="muted" style={{ fontSize: "12.5px" }}>
                          {cr.meta}
                        </span>
                      </span>
                      {" "}
                    </SkLink>
                    {" "}
                    <div className="muted" style={{ fontSize: "13px" }}>
                      {cr.next}
                    </div>
                    {" "}
                    <SkLink href="/games/new" onClick={cr.play} className="btn btn-sm btn-cta tap">
                      Start a game with them
                    </SkLink>
                    {" "}
                  </div>
                  {" "}
                  </Fragment>
                ))}
                {" "}
                <div className="card" style={{ flex: "none", width: "168px", padding: "14px", display: "flex", flexDirection: "column", justifyContent: "center", gap: "6px", borderStyle: "dashed" }}>
                  {" "}
                  <b style={{ fontSize: "14px" }}>
                    New crew?
                  </b>
                  {" "}
                  <span className="muted" style={{ fontSize: "12.5px", lineHeight: "1.4" }}>
                    Finish a game and tap “Save this table as a crew”.
                  </span>
                  {" "}
                </div>
                {" "}
              </div>
              {" "}
              <div className="sec-h">
                <h2>
                  Start a game
                </h2>
                <span className="muted" style={{ fontSize: "13px" }}>
                  every table is 3D
                </span>
              </div>
              {" "}
              <div className="gh-games">
                {" "}
                {(v.games || []).map((g, i0) => (
                  <Fragment key={i0}>
                  {" "}
                  <SkLink href={route(g.newHref)} className="card tap lift" style={{ padding: "14px", textDecoration: "none", display: "flex", flexDirection: "column", gap: "8px", minHeight: "168px", position: "relative", overflow: "hidden" }}>
                    {" "}
                    <span className="pill" style={{ position: "absolute", top: "12px", right: "12px", background: g.tagBg, color: g.tagInk }}>
                      {g.tag}
                    </span>
                    {" "}
                    <span className="av" style={{ background: g.tint }}>
                      <img src={g.icon} alt="" />
                    </span>
                    {" "}
                    <b className="d" style={{ fontSize: "17px", lineHeight: "1.05" }}>
                      {g.name}
                    </b>
                    {" "}
                    <span className="muted" style={{ fontSize: "12.5px", marginTop: "auto" }}>
                      {g.meta}
                    </span>
                    {" "}
                  </SkLink>
                  {" "}
                  </Fragment>
                ))}
                {" "}
              </div>
              {" "}
              <div className="sec-h">
                <h2>
                  Open games
                </h2>
                <span className="muted" style={{ fontSize: "13px" }}>
                  {v.openCount}{" looking for players"}
                </span>
              </div>
              {" "}
              <div className="rail" role="tablist" aria-label="Filter games" style={{ display: "flex", gap: "8px", marginBottom: "12px" }}>
                {" "}
                {(v.filters || []).map((f, i0) => (
                  <Fragment key={i0}>
                  <button role="tab" aria-selected={f.on} className={`chip tap ${f.cls}`} onClick={f.pick}>
                    {f.label}
                  </button>
                  </Fragment>
                ))}
                {" "}
              </div>
              {" "}
              <ul style={{ listStyle: "none", margin: "0", padding: "0", display: "flex", flexDirection: "column", gap: "10px" }}>
                {" "}
                {(v.open || []).map((o, i0) => (
                  <Fragment key={i0}>
                  {" "}
                  <li className="card" style={{ display: "flex", alignItems: "center", gap: "12px", padding: "12px" }}>
                    {" "}
                    <span className="av" style={{ background: o.tint }}>
                      <img src={o.icon} alt="" />
                    </span>
                    {" "}
                    <div style={{ flex: "1", minWidth: "0" }}>
                      {" "}
                      <div style={{ fontWeight: "800", fontSize: "15px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                        {o.name}
                      </div>
                      {" "}
                      <div className="muted" style={{ fontSize: "13px" }}>
                        {o.type}{" · "}{o.left}{" left"}
                      </div>
                      {" "}
                      <div style={{ display: "flex", gap: "3px", marginTop: "6px" }} aria-label={`${o.joined} of ${o.max} joined`}>
                        {" "}
                        {(o.seats || []).map((st, i2) => (
                          <Fragment key={i2}>
                          <span style={{ width: "14px", height: "5px", borderRadius: "9px", background: st.c }} />
                          </Fragment>
                        ))}
                        {" "}
                      </div>
                      {" "}
                    </div>
                    {" "}
                    <span className="muted" style={{ fontSize: "13px", fontWeight: "800" }}>
                      {o.joined}/{o.max}
                    </span>
                    {" "}
                    <SkLink href={route(o.href)} onClick={o.join} className="btn btn-sm btn-cta tap">
                      Join
                    </SkLink>
                    {" "}
                  </li>
                  {" "}
                  {o.adAfter ? (
                    <>
                    {" "}
                    <li className="ad ad-feed">
                      <b>
                        In-feed native ad · game listing
                      </b>
                      after the 3rd open game
                    </li>
                    {" "}
                    </>
                  ) : null}
                  {" "}
                  </Fragment>
                ))}
                {" "}
              </ul>
              {" "}
              <p className="muted" style={{ marginTop: "12px", fontSize: "13px" }}>
                Creators are never shown. Everyone plays under a random nickname.
              </p>
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
          <SkLink href="/games/new" onClick={v.newGame} className="fab" aria-label="Create game">
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
