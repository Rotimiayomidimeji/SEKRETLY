// @ts-nocheck -- ported 1:1 from design/mockup/Crews.dc.html by scripts/port-mockup.mjs; typed as it gets wired to real data
"use client";

import React, { Fragment } from "react";
import { saveMode, SkLink } from "@/lib/sk/runtime";


export default class Crews extends React.Component<Record<string, any>, any> {
  static defaultProps = {"mode":"dark"};

  constructor(props) {
    super(props);
    var m = null, pickName = null, fresh = null;
    fresh = props.fresh || null;
    var ids = (props.crews || []).map(function (c) { return c.id; }), pickName = props.pick || null;
    var inv = {};
    ((fresh && fresh.players) || []).forEach(function (p) { inv[p] = true; });
    this.state = { mode: m || props.mode || 'dark', crew: Math.max(0, ids.indexOf(pickName)), tab: 0, rsvp: {}, copied: false, draft: '', extra: [],
      naming: !!fresh, fromGame: fresh && fresh.game ? String(fresh.game).replace('Sekretly · ', '') : 'tonight’s game', players: (fresh && fresh.players) || [], inv: inv, newName: '', made: null, saved: false };
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
    var COL = ['#ffd23d', '#7ef0c1', '#7fb2ff', '#ff9ad5', '#ffb35c', '#b78bff', '#5be0a0', '#ff8b98'];
    var C = (this.props.crews || []).slice();
    if (!C.length) C.push({ id: '', name: 'No crews yet', icon: '/sk/sparkles.png', bg: 'radial-gradient(130% 110% at 100% 0%,#5be0a0 0%,#127a80 50%,#0a2b3a 100%)', who: ['You'], streak: 0, nightTitle: 'Save a game table as a crew', nightSub: 'Play a game, then tap “Save this table as a crew”', myRsvp: -1, going: 0, invite: '', board: [{ n: 'You', pts: 0, title: 'New to the crew' }], history: [], jokes: [] });
    var c = C[s.crew] || C[0];
    var myR = s.rsvp[c.id] !== undefined ? s.rsvp[c.id] : c.myRsvp;
    var going = c.going + (myR === 0 && c.myRsvp !== 0 ? 1 : 0) - (myR !== 0 && c.myRsvp === 0 ? 1 : 0);
    var J = s.extra.filter(function (j) { return j.crew === c.id; }).concat(c.jokes || [
    ]);
    var BGS = ['#ffe48a', '#ffd0f0', '#bff3dd', '#cfe3ff', '#ffc9b5'];
    var titles = { Fox: 'Dare devil', You: 'Knows everyone’s secrets', KolaNut: 'Hot take queen', PixelOwl: 'Quiet but deadly', Zobo: 'Always late, always there', MangoMoon: 'Wildcard', Moon: 'Poll prophet', ChinChin: 'Chaos agent', Suya: 'Never has, never will' };
    var crewPlay = function () { try { window.localStorage.setItem('sk-crew', c.name); window.localStorage.removeItem('sk-pick'); window.localStorage.removeItem('sk-edit'); window.localStorage.setItem('sk-nav', String(Date.now())); } catch (e) {} };
    return {
      mode: dark ? 'dark' : 'light', isDark: dark, isLight: !dark, modeWord: dark ? 'Light' : 'Dark',
      toggleMode: function () { var n = dark ? 'light' : 'dark'; saveMode(n); self.setState({ mode: n }); },
      crewTabs: C.map(function (x, i) { var on = s.crew === i; return { name: x.name, on: on ? 'true' : 'false', cls: on ? 'on' : '', pick: function () { self.setState({ crew: i, tab: 0, saved: false }); } }; }),
      justSaved: s.saved,
      c: { name: c.name, icon: c.icon, bg: c.bg, streak: c.streak, nightTitle: c.nightTitle, nightSub: c.nightSub,
        members: c.who.map(function (n, k) { return { n: n, i: n.charAt(0), c: COL[k % COL.length] }; }) },
      copyInvite: function () { if (!c.invite) return; try { navigator.clipboard.writeText(c.invite); } catch (e) {} self.setState({ copied: true }); },
      inviteLabel: s.copied ? 'Invite link copied' : 'Invite someone',
      playNow: crewPlay,
      rsvp: ['Going', 'Maybe', 'Can’t'].map(function (n, i) { return { name: n, on: myR === i ? 'true' : 'false', pick: function () { if (!c.id) return; var r = Object.assign({}, s.rsvp); r[c.id] = i; self.setState({ rsvp: r }); self.props.rsvp(c.id, i); } }; }),
      goingText: Math.max(0, going) + ' of ' + c.who.length + ' going · reminder 1 hour before',
      tabs: ['Leaderboard', 'History', 'Inside jokes'].map(function (n, i) { return { name: n, on: s.tab === i ? 'true' : 'false', pick: function () { self.setState({ tab: i }); } }; }),
      tabBoard: s.tab === 0, tabHistory: s.tab === 1, tabJokes: s.tab === 2,
      board: (c.board || []).map(function (b, k) {
        return { rank: k + 1, n: b.n, i: b.n.charAt(0), c: COL[c.who.indexOf(b.n) % COL.length], pts: b.pts, title: b.title, bg: b.n === 'You' ? 'rgba(255,59,141,.10)' : 'transparent', rankInk: k === 0 ? '#ffb020' : 'var(--ink)' };
      }),
      history: c.history || [], sampleHistory: [
      ],
      draft: s.draft, onDraft: function (e) { self.setState({ draft: e.target.value.slice(0, 120) }); },
      addJoke: function (e) { if (e && e.preventDefault) e.preventDefault(); if (!s.draft.trim()) return; if (!c.id) return; self.props.addJoke(c.id, s.draft.trim()); self.setState({ extra: [{ crew: c.id, text: s.draft.trim(), from: 'pinned by you · just now', fresh: true }].concat(s.extra), draft: '' }); },
      jokes: J.map(function (j, i) { return { text: j.text, from: j.from, bg: BGS[i % BGS.length], rot: (i % 2 ? 1.2 : -1.2) + 'deg', cls: j.fresh ? 'pop' : '' }; }),
      naming: s.naming, fromGame: s.fromGame, closeNaming: function () { self.setState({ naming: false }); },
      newName: s.newName, onNewName: function (e) { self.setState({ newName: e.target.value.slice(0, 30) }); },
      invitees: s.players.map(function (n) { var on = !!s.inv[n]; return { name: n, on: on ? 'true' : 'false', cls: on ? 'on' : '', pick: function () { var v = Object.assign({}, s.inv); v[n] = !on; self.setState({ inv: v }); } }; }),
      createCrew: function () {
        if (s.creating) return;
        self.setState({ creating: true });
        self.props.create({ name: s.newName.trim() || 'Friday table', code: (self.props.fresh || {}).code || '', invite: s.players.filter(function (k) { return s.inv[k]; }) }).then(function (r) {
          if (r && r.ok) window.location.href = '/crews?pick=' + r.id + '&saved=1';
          else self.setState({ creating: false });
        });
      }
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
                <path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z" />
              </svg>
              Settings
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
                <div className="grow">
                  <h1 style={{ fontSize: "24px" }}>
                    Crews
                  </h1>
                  <div className="muted" style={{ fontSize: "13px" }}>
                    Saved tables you play with again
                  </div>
                </div>
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
              <div className="rail" role="group" aria-label="Your crews" style={{ display: "flex", gap: "8px", margin: "0 -16px", padding: "0 16px 4px" }}>
                {" "}
                {(v.crewTabs || []).map((ct, i0) => (
                  <Fragment key={i0}>
                  {" "}
                  <button className={`chip tap ${ct.cls}`} aria-pressed={ct.on} onClick={ct.pick}>
                    {ct.name}
                  </button>
                  {" "}
                  </Fragment>
                ))}
                {" "}
              </div>
              {" "}
              {v.justSaved ? (
                <>
                {" "}
                <div className="card pop row" style={{ marginTop: "12px", padding: "12px 14px", gap: "10px", borderColor: "rgba(91,224,160,.45)" }}>
                  {" "}
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={{ color: "var(--ok)", flex: "none" }}>
                    <path d="m5 12 5 5 9-10" />
                  </svg>
                  {" "}
                  <span style={{ fontSize: "14px" }}>
                    <b>
                      Crew saved.
                    </b>
                    {" "}
                    <span className="muted">
                      Everyone got an invite to join it.
                    </span>
                  </span>
                  {" "}
                </div>
                {" "}
                </>
              ) : null}
              {" "}
              <section className="rise" style={{ marginTop: "12px", padding: "18px", borderRadius: "26px", color: "#ffffff", background: v.c.bg, position: "relative", overflow: "hidden" }}>
                {" "}
                <img className="float2" src={v.c.icon} alt="" style={{ position: "absolute", right: "12px", top: "12px", width: "64px", height: "64px" }} />
                {" "}
                <h2 style={{ fontSize: "28px", maxWidth: "12ch", lineHeight: "1" }}>
                  {v.c.name}
                </h2>
                {" "}
                <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", marginTop: "12px" }}>
                  {" "}
                  {(v.c.members || []).map((mb, i0) => (
                    <Fragment key={i0}>
                    {" "}
                    <span style={{ display: "inline-flex", alignItems: "center", gap: "6px", padding: "4px 10px 4px 4px", borderRadius: "99px", background: "rgba(0,0,0,.24)", fontSize: "13px", fontWeight: "700" }}>
                      <span style={{ width: "24px", height: "24px", borderRadius: "50%", display: "grid", placeItems: "center", background: mb.c, color: "#1a0b14", fontSize: "12px", fontWeight: "800" }}>
                        {mb.i}
                      </span>
                      {mb.n}
                    </span>
                    {" "}
                    </Fragment>
                  ))}
                  {" "}
                </div>
                {" "}
                <div className="row" style={{ gap: "8px", marginTop: "14px", flexWrap: "wrap" }}>
                  {" "}
                  <span style={{ display: "inline-flex", alignItems: "center", gap: "6px", padding: "7px 11px", borderRadius: "99px", background: "rgba(0,0,0,.25)", fontWeight: "800", fontSize: "13px" }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="#ffffff" aria-hidden="true">
                      <path d="M12 2c1 4 5 6 5 11a5 5 0 0 1-10 0c0-2 1-3.5 2-4.5 0 2 1 3 2 3 0-4-1-6 1-9.5z" />
                    </svg>
                    {v.c.streak}-week crew streak
                  </span>
                  {" "}
                  <button className="tap" onClick={v.copyInvite} style={{ minHeight: "36px", padding: "0 12px", borderRadius: "99px", border: "0", background: "rgba(255,255,255,.92)", color: "#2a0a1c", fontWeight: "800", fontSize: "13px" }}>
                    {v.inviteLabel}
                  </button>
                  {" "}
                </div>
                {" "}
              </section>
              {" "}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: "10px", marginTop: "12px" }}>
                {" "}
                <SkLink href="/games/new" onClick={v.playNow} className="btn btn-cta btn-lg tap">
                  Play now
                </SkLink>
                {" "}
                <SkLink href="/crews/daily" className="btn btn-lg tap">
                  Crew question
                </SkLink>
                {" "}
              </div>
              {" "}
              <div className="card" style={{ marginTop: "12px", padding: "16px" }}>
                {" "}
                <div className="row" style={{ justifyContent: "space-between", gap: "10px" }}>
                  {" "}
                  <div>
                    <div className="muted" style={{ fontSize: "12px", fontWeight: "800", letterSpacing: ".06em", textTransform: "uppercase" }}>
                      Next game night
                    </div>
                    <b className="d" style={{ fontSize: "20px" }}>
                      {v.c.nightTitle}
                    </b>
                    <div className="muted" style={{ fontSize: "13.5px" }}>
                      {v.c.nightSub}
                    </div>
                  </div>
                  {" "}
                  <SkLink href="/games/new" onClick={v.playNow} className="btn btn-sm tap">
                    Change
                  </SkLink>
                  {" "}
                </div>
                {" "}
                <div className="seg" role="group" aria-label="Are you coming?" style={{ marginTop: "12px" }}>
                  {" "}
                  {(v.rsvp || []).map((r, i0) => (
                    <Fragment key={i0}>
                    <button aria-pressed={r.on} onClick={r.pick}>
                      {r.name}
                    </button>
                    </Fragment>
                  ))}
                  {" "}
                </div>
                {" "}
                <div className="muted" style={{ fontSize: "13px", marginTop: "8px" }}>
                  {v.goingText}
                </div>
                {" "}
              </div>
              {" "}
              <div className="seg" role="group" aria-label="Crew sections" style={{ marginTop: "18px" }}>
                {" "}
                {(v.tabs || []).map((t, i0) => (
                  <Fragment key={i0}>
                  <button aria-pressed={t.on} onClick={t.pick}>
                    {t.name}
                  </button>
                  </Fragment>
                ))}
                {" "}
              </div>
              {" "}
              {v.tabBoard ? (
                <>
                {" "}
                <div className="rise" style={{ marginTop: "12px" }}>
                  {" "}
                  <div className="muted" style={{ fontSize: "13px", marginBottom: "8px" }}>
                    October season · points from games and crew questions
                  </div>
                  {" "}
                  <ol className="card" style={{ listStyle: "none", margin: "0", padding: "0", overflow: "hidden" }}>
                    {" "}
                    {(v.board || []).map((b, i0) => (
                      <Fragment key={i0}>
                      {" "}
                      <li className="list-row" style={{ background: b.bg }}>
                        {" "}
                        <span className="d" style={{ width: "22px", fontWeight: "800", fontSize: "18px", color: b.rankInk }}>
                          {b.rank}
                        </span>
                        {" "}
                        <span style={{ width: "38px", height: "38px", borderRadius: "12px", display: "grid", placeItems: "center", background: b.c, color: "#1a0b14", fontWeight: "800", flex: "none" }}>
                          {b.i}
                        </span>
                        {" "}
                        <div style={{ flex: "1", minWidth: "0" }}>
                          <b style={{ fontSize: "15px" }}>
                            {b.n}
                          </b>
                          <div className="muted" style={{ fontSize: "12.5px" }}>
                            {b.title}
                          </div>
                        </div>
                        {" "}
                        <b className="d" style={{ fontSize: "17px" }}>
                          {b.pts}
                        </b>
                        {" "}
                      </li>
                      {" "}
                      </Fragment>
                    ))}
                    {" "}
                  </ol>
                  {" "}
                </div>
                {" "}
                </>
              ) : null}
              {" "}
              {v.tabHistory ? (
                <>
                {" "}
                <ul className="rise" style={{ listStyle: "none", margin: "12px 0 0", padding: "0", display: "flex", flexDirection: "column", gap: "10px" }}>
                  {" "}
                  {(v.history || []).map((h, i0) => (
                    <Fragment key={i0}>
                    {" "}
                    <li className="card" style={{ padding: "14px" }}>
                      {" "}
                      <div className="row" style={{ justifyContent: "space-between" }}>
                        <b style={{ fontSize: "15px" }}>
                          {h.game}
                        </b>
                        <span className="muted" style={{ fontSize: "12.5px" }}>
                          {h.when}
                        </span>
                      </div>
                      {" "}
                      <p style={{ fontSize: "14px", marginTop: "6px", lineHeight: "1.45" }}>
                        {h.highlight}
                      </p>
                      {" "}
                      <div className="muted" style={{ fontSize: "12.5px", marginTop: "6px" }}>
                        {h.meta}
                      </div>
                      {" "}
                    </li>
                    {" "}
                    </Fragment>
                  ))}
                  {" "}
                </ul>
                {" "}
                </>
              ) : null}
              {" "}
              {v.tabJokes ? (
                <>
                {" "}
                <div className="rise" style={{ marginTop: "12px" }}>
                  {" "}
                  <form onSubmit={v.addJoke} style={{ display: "flex", gap: "8px" }}>
                    {" "}
                    <label htmlFor="cr-joke" className="sr">
                      Pin an inside joke
                    </label>
                    {" "}
                    <input id="cr-joke" className="field" value={v.draft ?? ""} onChange={v.onDraft} maxLength="120" placeholder="Pin something only the crew gets" style={{ flex: "1", minWidth: "0" }} />
                    {" "}
                    <button type="submit" className="btn btn-cta tap" style={{ flex: "none" }}>
                      Pin
                    </button>
                    {" "}
                  </form>
                  {" "}
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: "10px", marginTop: "12px" }}>
                    {" "}
                    {(v.jokes || []).map((j, i0) => (
                      <Fragment key={i0}>
                      {" "}
                      <div className={j.cls} style={{ padding: "14px", borderRadius: "20px", minHeight: "116px", display: "flex", flexDirection: "column", background: j.bg, color: "#2a0a1c", transform: `rotate(${j.rot})` }}>
                        {" "}
                        <p className="d" style={{ fontSize: "15.5px", fontWeight: "700", lineHeight: "1.2" }}>
                          {j.text}
                        </p>
                        {" "}
                        <span style={{ marginTop: "auto", paddingTop: "8px", fontSize: "12px", fontWeight: "700", opacity: ".8" }}>
                          {j.from}
                        </span>
                        {" "}
                      </div>
                      {" "}
                      </Fragment>
                    ))}
                    {" "}
                  </div>
                  {" "}
                  <p className="muted" style={{ fontSize: "12.5px", marginTop: "10px" }}>
                    Game moments pin themselves here. Only crew members see this wall.
                  </p>
                  {" "}
                </div>
                {" "}
                </>
              ) : null}
              {" "}
              <p className="muted" style={{ fontSize: "12.5px", marginTop: "16px", lineHeight: "1.5" }}>
                Everyone stays under their game nickname inside a crew. Leave any time from the ⋯ menu; reports and warnings work the same as in games.
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
          <SkLink href="/games/new" onClick={v.playNow} className="fab" aria-label="Create game">
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
        {v.naming ? (
          <>
          {" "}
          <div className="scrim">
            {" "}
            <div className="sheet" role="dialog" aria-label="Save this table as a crew">
              {" "}
              <h2 style={{ fontSize: "22px" }}>
                Save this table as a crew
              </h2>
              {" "}
              <p className="muted" style={{ fontSize: "13.5px", marginTop: "4px" }}>
                {"From "}{v.fromGame}. Everyone you keep gets an invite and stays under their nickname.
              </p>
              {" "}
              <label htmlFor="cr-name" className="label" style={{ marginTop: "14px" }}>
                Crew name
              </label>
              {" "}
              <input id="cr-name" className="field" value={v.newName ?? ""} onChange={v.onNewName} maxLength="30" placeholder="e.g. Room 204 survivors" />
              {" "}
              <label className="label" style={{ marginTop: "14px" }}>
                Who’s in?
              </label>
              {" "}
              <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                {" "}
                {(v.invitees || []).map((iv, i0) => (
                  <Fragment key={i0}>
                  {" "}
                  <button className={`chip tap ${iv.cls}`} aria-pressed={iv.on} onClick={iv.pick}>
                    {iv.name}
                  </button>
                  {" "}
                  </Fragment>
                ))}
                {" "}
              </div>
              {" "}
              <button className="btn btn-cta btn-lg btn-block tap" onClick={v.createCrew} style={{ marginTop: "16px" }}>
                Save crew
              </button>
              {" "}
              <button className="btn btn-ghost btn-block tap" onClick={v.closeNaming} style={{ marginTop: "6px", border: "0" }}>
                Not now
              </button>
              {" "}
            </div>
            {" "}
          </div>
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
