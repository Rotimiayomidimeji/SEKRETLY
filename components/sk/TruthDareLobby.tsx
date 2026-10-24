// @ts-nocheck -- ported 1:1 from design/mockup/TruthDareLobby.dc.html by scripts/port-mockup.mjs; typed as it gets wired to real data
"use client";

import React, { Fragment } from "react";
import { saveMode, SkLink, route } from "@/lib/sk/runtime";
import TruthDare from "./TruthDare";

export default class TruthDareLobby extends React.Component<Record<string, any>, any> {
  static defaultProps = {"mode":"dark","role":"host","ads":"on"};

  constructor(props) {
    super(props);
    var m = null; // light/dark arrives as props.mode from the sk-mode cookie
    this.load();
    this.state = this.freshL(m || props.mode || 'dark');
  }
  // what the wizard or the invite handed over; re-read whenever a new link arrives (sk-nav)
  load() {
    var g = null, j = null;
    try { g = JSON.parse(window.localStorage.getItem('sk-game') || 'null'); j = JSON.parse(window.localStorage.getItem('sk-join') || 'null'); this.nav = window.localStorage.getItem('sk-nav') || ''; } catch (e) { this.nav = ''; }
    this.picked = g && g.game === 'tod' ? g : null;
    this.joined = j && j.game === 'tod' ? j : null;
    clearTimeout(this.hostTimer); clearTimeout(this.goTimer); this.hostTimer = null;
  }
  freshL(mode) { return { mode: mode, joined: 1, ready: false, rerolls: 1, nick: 0, invited: {}, lock: false, qr: false, copied: false, count: 0, go: false, inGame: false, toast: null }; }
  role() { var r = this.props.role || 'host'; if (r !== 'host' && this.joined && this.joined.role === 'guest') r = 'guest'; return r; }
  componentDidMount() {
    var self = this;
    this.onStore = function (e) { if (e.key === 'sk-mode' && e.newValue) self.setState({ mode: e.newValue }); };
    try { window.addEventListener('storage', this.onStore); } catch (e) {}
    // friends drop into seats; non-hosts see the host start after everyone arrives
    this.tk = setInterval(function () {
      self.props.load(self.props.code).then(function (v) {
        if (!v) return;
        if (v.status !== 'LOBBY') { window.location.href = '/g/' + v.code; return; }
        self.setState({ view: v });
      });
    }, 1500);
  }
  componentWillUnmount() { try { window.removeEventListener('storage', this.onStore); } catch (e) {} clearInterval(this.tk); clearTimeout(this.hostTimer); clearTimeout(this.goTimer); clearTimeout(this.tt); }
  componentDidUpdate(prev) {
    if (prev.mode !== this.props.mode && this.props.mode) this.setState({ mode: this.props.mode });
    if (prev.role !== this.props.role) { this.load(); this.setState(this.freshL(this.state.mode)); }
  }
  flash(title, sub, icon) { var self = this; this.setState({ toast: { title: title, sub: sub, icon: icon } }); clearTimeout(this.tt); this.tt = setTimeout(function () { self.setState({ toast: null }); }, 3000); }
  renderVals() {
    var self = this, s = this.state, dark = s.mode !== 'light';
    var V = this.state.view || this.props.view || { players: [], me: null, max: 6, name: '', code: '', settings: {} };
    var role = V.me && V.me.isHost ? 'host' : 'player', host = role === 'host';
    s = Object.assign({}, s, { joined: (V.players || []).length });
    var GM = {
      nhie: { name: 'Never Have I Ever', icon: '/sk/shushing_face.png', room: 'Friday Night Never', host: 'NHIEHost', play: 'NHIE', min: 3, rules: ['A statement drops each round, from Mild to Unhinged.', 'Tap “I have” and you tip one of your 3 cups.', 'Last one holding cups wins.'],
        sc: { name: 'Neon lounge', sky: 'radial-gradient(120% 90% at 50% 0%,#4a1263 0%,#160a22 55%,#08050c 100%)', glow: '#ff3b8d', floor: 'linear-gradient(rgba(255,59,141,.55) 2px,transparent 2px),linear-gradient(90deg,rgba(255,59,141,.55) 2px,transparent 2px)', table: 'radial-gradient(circle at 50% 38%,#8a2a7a,#3a0f3a 70%)' } },
      tod: { name: 'Truth or Dare', icon: '/sk/bottle_with_popping_cork_3d.png', room: 'Dare Club 300L', host: 'TruthDareHost', play: 'TruthDare', min: 2, rules: ['The bottle spins and lands on someone.', 'They pick truth or dare. The table judges it.', 'Chicken out and you wear the 🐔.'],
        sc: { name: 'Bonfire night', sky: 'radial-gradient(90% 80% at 50% 80%,#7a2d0b 0%,#2a0d05 50%,#0b0503 100%)', glow: '#ff7a1a', floor: 'linear-gradient(rgba(255,160,70,.35) 2px,transparent 2px),linear-gradient(90deg,rgba(255,160,70,.35) 2px,transparent 2px)', table: 'radial-gradient(circle at 50% 40%,#b0703a,#5a2b14 70%)' } },
      wyr: { name: 'Would You Rather', icon: '/sk/crossed_swords_3d.png', room: 'Class of 2027 chaos', host: 'WYRHost', play: 'WYR', min: 2, rules: ['Two options. Pick a side.', 'Your figure walks to your side of the table.', 'Call the winning side for +2.'],
        sc: { name: 'Split arena', sky: 'radial-gradient(120% 90% at 50% 0%,#0d2a5a 0%,#071229 55%,#04060d 100%)', glow: '#22e1ff', floor: 'linear-gradient(rgba(34,225,255,.4) 2px,transparent 2px),linear-gradient(90deg,rgba(34,225,255,.4) 2px,transparent 2px)', table: 'radial-gradient(circle at 50% 40%,#2a2f4a,#11142a 70%)' } },
      mlt: { name: 'Most Likely To', icon: '/sk/crown_3d.png', room: 'Hostel B awards', host: 'MostLikelyHost', play: 'MostLikely', min: 3, rules: ['A “most likely to…” question drops.', 'Vote a nickname, never yourself.', 'Most votes gets the crown. Vote with the table to score.'],
        sc: { name: 'Award show', sky: 'radial-gradient(120% 90% at 50% 0%,#3a2a08 0%,#150d22 55%,#07050b 100%)', glow: '#ffd23d', floor: 'linear-gradient(rgba(255,210,61,.35) 2px,transparent 2px),linear-gradient(90deg,rgba(255,210,61,.35) 2px,transparent 2px)', table: 'radial-gradient(circle at 50% 38%,#2b2333,#0d0a12 70%)' } },
      hot: { name: 'Hot Takes', icon: '/sk/hot_pepper_3d.png', room: 'Sunday vibes only', host: 'HotTakesHost', play: 'HotTakes', min: 2, rules: ['A spicy opinion appears.', 'Rate it from Hard no to Facts.', 'Land close to the room’s average to score.'],
        sc: { name: 'Hot seat', sky: 'linear-gradient(110deg,#0b2a4a 0%,#170a18 50%,#4a0b12 100%)', glow: '#ff4f6d', floor: 'linear-gradient(rgba(255,120,120,.35) 2px,transparent 2px),linear-gradient(90deg,rgba(120,200,255,.35) 2px,transparent 2px)', table: 'radial-gradient(circle at 50% 40%,#45404f,#17141d 70%)' } },
      poll: { name: 'Anonymous Polls', icon: '/sk/ballot_box_with_ballot_3d.png', room: 'Group chat polls', host: 'PollsHost', play: 'Polls', min: 2, rules: ['Anyone can drop a poll.', 'Vote, then guess the winner for +2.', 'Columns rise live on the table.'],
        sc: { name: 'Live studio', sky: 'radial-gradient(120% 90% at 50% 0%,#0b3a3a 0%,#081a1f 55%,#04090b 100%)', glow: '#5be0a0', floor: 'linear-gradient(rgba(91,224,160,.35) 2px,transparent 2px),linear-gradient(90deg,rgba(91,224,160,.35) 2px,transparent 2px)', table: 'radial-gradient(circle at 50% 40%,#1d3a3a,#0a1719 70%)' } }
    };
    var jn = role !== 'host' ? this.joined : null;
    var gid = 'tod';
    var gm = GM[gid] || GM.nhie;
    gm = Object.assign({}, gm, { room: V.name || gm.room });
    var max = V.max || 6; this.max = max;
    var me = V.me ? [V.me.nick, V.me.color] : ['You', '#ffd23d'];
    var crew = (V.players || []).filter(function (p) { return !p.me; }).map(function (p) { return [p.nick, p.color]; });
    var n = max, R = max > 6 ? 196 : 182;
    var seats = [];
    for (var i = 0; i < max; i++) {
      var a = (90 + i * 360 / n) * Math.PI / 180, filled = i < s.joined, nm = i === 0 ? me : crew[i - 1];
      seats.push({ x: Math.round(R * Math.cos(a)), y: Math.round(R * Math.sin(a)), label: !filled ? 'open seat' : i === 0 ? (host ? 'You · host' : 'You') : nm[0], initial: filled ? nm[0].charAt(0) : '+', color: filled ? nm[1] : 'transparent',
        cls: !filled ? 'lb-ghost' : (i === 0 ? 'g3-me' : (i === s.joined - 1 && s.joined > 1 ? 'lb-new' : '')), ready: filled && (i === 0 ? s.ready || host : i % 2 === 1 || s.joined >= max) });
    }
    var counting = s.count > 0;
    var canStart = s.joined >= gm.min;
    var FR = [['Fox', '#ffb35c', 'online now'], ['Moon', '#9db8ff', 'active 5m ago'], ['Ada', '#7ef0c1', 'played with you last week'], ['Tolu', '#ff9ad5', 'online now']];
    var roomHref = (host ? gm.host : gm.play) + '.dc.html'; this.playHref = roomHref;
    var friendsOnly = !!(host && this.picked && this.picked.join === 'friends'), scheduled = !!(host && this.picked && this.picked.when === 'later');
    var hand = function (extra) { try { window.localStorage.setItem('sk-join', JSON.stringify(Object.assign({ game: gid, room: gm.room, role: role, nick: me[0], color: me[1] }, extra || {}))); window.localStorage.setItem('sk-nav', String(Date.now())); } catch (e) {} };
    this.enterNow = function () { hand(); };
    var S = V.settings || {}, settings = [(max * (S.laps || 1)) + ' turns', { mild: 'Mild', spicy: 'Spicy', unhinged: 'Unhinged' }[S.spice || 'mild'] + (S.esc === false ? '' : ' → Unhinged'), (S.timer || 15) + 's turns', 'Up to ' + max, V.isPublic ? 'Public link' : 'Friends only', gm.sc.name];
    return {
      mode: dark ? 'dark' : 'light', isDark: dark, isLight: !dark, modeWord: dark ? 'Light' : 'Dark',
      toggleMode: function () { var x = dark ? 'light' : 'dark'; saveMode(x); self.setState({ mode: x }); },
      ads: this.props.ads === 'off' ? 'off' : 'on',
      gm: gm, sc: gm.sc, backHref: host ? 'CreateGame.dc.html' : 'GamesHub.dc.html', backClick: function () { if (!host) return; try { window.localStorage.setItem('sk-edit', 'review'); window.localStorage.setItem('sk-nav', String(Date.now())); } catch (e) {} },
      editSetup: function () { try { window.localStorage.setItem('sk-edit', 'setup'); window.localStorage.setItem('sk-nav', String(Date.now())); } catch (e) {} },
      friendsOnly: friendsOnly, notFriendsOnly: !friendsOnly, scheduled: scheduled,
      roleLine: host ? 'you’re the host' : role === 'guest' ? 'joined from a link' : 'joined in the app',
      seatChip: s.joined + ' / ' + max + ' seated', lockChip: s.lock ? 'Locked 🔒' : 'Open room',
      seats: seats, counting: counting, notCounting: !counting, countNum: s.count,
      holoTitle: s.go ? 'Starting!' : s.joined >= max ? 'Table full' : 'Waiting…', holoSub: s.go ? 'taking you to the table' : (max - s.joined) + ' seats open',
      isHost: host, notHost: !host, isGuest: role === 'guest',
      copy: function () { var u = (self.props.origin || '') + '/join/' + self.props.code; try { navigator.clipboard.writeText(u); } catch (e) {} self.setState({ copied: true }); self.flash('Link copied', u.replace(/^https?:\/\//, ''), gm.icon); }, copyLabel: s.copied ? 'Copied ✓' : 'Copy code',
      invite: function () { self.flash('Invite ready', 'Share it anywhere. Joiners get a random nickname.', '/sk/busts_in_silhouette_3d.png'); },
      qr: s.qr, toggleQr: function () { self.setState({ qr: !s.qr }); },
      invitedCount: Object.keys(s.invited).length,
      friends: FR.map(function (f) { var done = !!s.invited[f[0]]; return { name: f[0], initial: f[0].charAt(0), bg: f[1], sub: f[2], label: done ? 'Invited ✓' : 'Invite', cls: done ? '' : 'btn-cta', send: function () { var o = Object.assign({}, s.invited); o[f[0]] = true; self.setState({ invited: o }); } }; }),
      settings: settings,
      lockStr: s.lock ? 'true' : 'false', toggleLock: function () { self.setState({ lock: !s.lock }); },
      canStartNow: host && canStart, cantStartNow: host && !canStart, showGo: !host && s.go, hostName: 'BlueFox',
      startLabel: canStart ? (scheduled ? 'Start now instead · ' : 'Start game · ') + s.joined + ' players' : 'Waiting for ' + (gm.min - s.joined) + ' more to start',
      roomHref: roomHref,
      enter: function () { hand(); },
      startNow: function () { self.props.start(self.props.code).then(function (r) { if (r && r.ok) window.location.href = '/g/' + self.props.code; else self.flash((r && r.error) || 'Couldn’t start', '', gm.icon); }); },
      goNow: function () { hand(); clearTimeout(self.goTimer); self.setState({ inGame: true }); },
      inGame: s.inGame, inLobby: !s.inGame,
      waitingHost: !host && !s.go, waitText: s.joined < max ? 'Waiting for ' + (max - s.joined) + ' more to join…' : 'Everyone’s here. Waiting for the host to start…',
      me: { name: me[0], initial: me[0].charAt(0), color: me[1] },
      reroll: function () { if (s.rerolls > 0) { self.setState({ rerolls: s.rerolls - 1 }); self.props.reroll(self.props.code).then(function () { return self.props.load(self.props.code); }).then(function (v) { if (v) self.setState({ view: v }); }); } }, noReroll: s.rerolls === 0, rerollLabel: s.rerolls ? 'Reroll · 1 left' : 'Locked in',
      readyStr: s.ready ? 'true' : 'false', toggleReady: function () { self.setState({ ready: !s.ready }); }, readyHint: s.ready ? 'The host can see you’re ready' : 'Let the host know you’re in',
      rules: gm.rules.map(function (t, k) { return { n: k + 1, text: t }; }),
      orbStart: function (e) { self.drag = { x: e.clientX, o: self.orb || 0 }; try { e.currentTarget.setPointerCapture(e.pointerId); } catch (x) {} },
      orbMove: function (e) { if (!self.drag) return; var o = Math.max(-40, Math.min(40, self.drag.o + (e.clientX - self.drag.x) * 0.35)); e.currentTarget.style.setProperty('--orb', o.toFixed(1) + 'deg'); self.drag.cur = o; },
      orbEnd: function () { if (!self.drag) return; if (self.drag.cur !== undefined) self.orb = self.drag.cur; self.drag = null; },
      toast: !!s.toast, toastTitle: s.toast ? s.toast.title : '', toastSub: s.toast ? s.toast.sub : '', toastIcon: s.toast ? s.toast.icon : ''
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
        {v.inLobby ? (
          <>
          {" "}
          <div className="lb-wrap">
            {" "}
            <header className="topbar">
              {" "}
              <SkLink href={route(v.backHref)} onClick={v.backClick} className="icon-btn tap" aria-label="Back">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M15 18 9 12l6-6" />
                </svg>
              </SkLink>
              {" "}
              <img src={v.gm.icon} alt="" style={{ width: "38px", height: "38px", flex: "none" }} />
              {" "}
              <div className="grow">
                <h1 style={{ fontSize: "20px", lineHeight: "1.1" }}>
                  {v.gm.room}
                </h1>
                <div className="muted" style={{ fontSize: "13px" }}>
                  {v.gm.name}{" · "}{v.roleLine}
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
            <div className="lb-grid">
              {" "}
              <section className="g3" aria-label="The table" onPointerDown={v.orbStart} onPointerMove={v.orbMove} onPointerUp={v.orbEnd} onPointerLeave={v.orbEnd}>
                {" "}
                <div className="g3-sky" style={{ background: v.sc.sky }} />
                {" "}
                <div className="g3-glow" style={{ background: v.sc.glow }} />
                {" "}
                <div className="g3-hud">
                  <span className="g3-chip">
                    {v.seatChip}
                  </span>
                  <span className="g3-chip">
                    {v.lockChip}
                  </span>
                </div>
                {" "}
                <div className="g3-cam">
                  {" "}
                  <div className="g3-floor" style={{ backgroundImage: v.sc.floor }} />
                  {" "}
                  <div className="g3-table" style={{ background: v.sc.table }} />
                  {" "}
                  <div className="g3-at" style={{ transform: "translate3d(0, 40px, 0)" }}>
                    <div className="g3-bb">
                      {" "}
                      {v.counting ? (
                        <>
                        <div className="lb-count" style={{ marginBottom: "20px" }}>
                          {v.countNum}
                        </div>
                        </>
                      ) : null}
                      {" "}
                      {v.notCounting ? (
                        <>
                        <div className="g3-holo" style={{ marginBottom: "14px" }}>
                          <img src={v.gm.icon} alt="" style={{ width: "26px", height: "26px" }} />
                          <b>
                            {v.holoTitle}
                          </b>
                          <span style={{ fontSize: "11px", fontWeight: "700", opacity: ".85" }}>
                            {v.holoSub}
                          </span>
                        </div>
                        </>
                      ) : null}
                      {" "}
                    </div>
                  </div>
                  {" "}
                  {(v.seats || []).map((p, i0) => (
                    <Fragment key={i0}>
                    {" "}
                    <div className="g3-at" style={{ transform: `translate3d(${p.x}px, ${p.y}px, 0)` }}>
                      {" "}
                      <div className="g3-shadow" />
                      {" "}
                      <div className="g3-bb">
                        <div className={`g3-fig ${p.cls}`}>
                          {" "}
                          <span className="g3-name">
                            {p.label}
                          </span>
                          {" "}
                          <div className="g3-head" style={{ background: p.color }}>
                            {p.initial}
                            {p.ready ? (
                              <>
                              <span className="g3-badge" style={{ background: "#5be0a0" }}>
                                ✓
                              </span>
                              </>
                            ) : null}
                          </div>
                          {" "}
                          <div className="g3-body" style={{ background: p.color }} />
                          {" "}
                        </div>
                      </div>
                      {" "}
                    </div>
                    {" "}
                    </Fragment>
                  ))}
                  {" "}
                </div>
                {" "}
                <div className="g3-hint">
                  {v.sc.name}{" · drag to look around"}
                </div>
                {" "}
              </section>
              {" "}
              <div className="lb-side" style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                {" "}
                {v.isHost ? (
                  <>
                  {" "}
                  <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                    {" "}
                    {v.scheduled ? (
                      <>
                      {" "}
                      <section className="card row" style={{ padding: "14px", gap: "12px", background: "linear-gradient(135deg,rgba(216,27,114,.16),rgba(122,60,255,.16))" }}>
                        <img src="/sk/hourglass_not_done.png" alt="" style={{ width: "36px", height: "36px" }} />
                        <span style={{ flex: "1", fontSize: "14px", lineHeight: "1.4" }}>
                          <b>
                            Scheduled for 9:00pm.
                          </b>
                          {" "}
                          <span className="muted">
                            Everyone gets a reminder 10 minutes before. You can still start early.
                          </span>
                        </span>
                      </section>
                      {" "}
                      </>
                    ) : null}
                    {" "}
                    {v.friendsOnly ? (
                      <>
                      {" "}
                      <section className="card row" style={{ padding: "14px", gap: "12px" }}>
                        <img src="/sk/locked_3d.png" alt="" style={{ width: "34px", height: "34px" }} />
                        <span style={{ flex: "1", fontSize: "14px", lineHeight: "1.4" }}>
                          <b>
                            Friends only.
                          </b>
                          {" "}
                          <span className="muted">
                            No public link. Invite people from your list below.
                          </span>
                        </span>
                      </section>
                      {" "}
                      </>
                    ) : null}
                    {" "}
                    {v.notFriendsOnly ? (
                      <>
                      {" "}
                      <section className="card" style={{ padding: "16px" }}>
                        {" "}
                        <div className="row" style={{ alignItems: "flex-end" }}>
                          {" "}
                          <div style={{ flex: "1" }}>
                            <div className="muted" style={{ fontSize: "12px", fontWeight: "800", letterSpacing: ".08em", textTransform: "uppercase" }}>
                              Room code
                            </div>
                            <div className="lb-code">
                              K7Q2
                            </div>
                          </div>
                          {" "}
                          <button className="btn btn-sm tap" onClick={v.copy}>
                            {v.copyLabel}
                          </button>
                          {" "}
                        </div>
                        {" "}
                        <div className="muted" style={{ fontSize: "13px", marginTop: "8px" }}>
                          sekretly.com/g/K7Q2 · anyone with the link joins with a random nickname
                        </div>
                        {" "}
                        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: "8px", marginTop: "12px" }}>
                          {" "}
                          <button className="btn btn-sm tap" onClick={v.invite} style={{ background: "#128c4a", color: "#ffffff", border: "0" }}>
                            WhatsApp
                          </button>
                          {" "}
                          <button className="btn btn-sm tap" onClick={v.invite}>
                            Copy link
                          </button>
                          {" "}
                          <button className="btn btn-sm tap" onClick={v.toggleQr}>
                            QR code
                          </button>
                          {" "}
                        </div>
                        {" "}
                        {v.qr ? (
                          <>
                          {" "}
                          <div className="pop" style={{ margin: "12px auto 0", width: "150px", height: "150px", borderRadius: "16px", background: "repeating-conic-gradient(#211a2c 0 25%, #ffffff 0 50%) 0 0/18px 18px", border: "10px solid #ffffff" }} role="img" aria-label="QR code for K7Q2" />
                          {" "}
                          </>
                        ) : null}
                        {" "}
                      </section>
                      {" "}
                      </>
                    ) : null}
                    {" "}
                    <section className="card" style={{ overflow: "hidden" }}>
                      {" "}
                      <div className="row" style={{ padding: "14px 14px 6px" }}>
                        <b style={{ flex: "1" }}>
                          Invite friends on Sekretly
                        </b>
                        <span className="muted" style={{ fontSize: "12.5px" }}>
                          {v.invitedCount}{" invited"}
                        </span>
                      </div>
                      {" "}
                      {(v.friends || []).map((fr, i0) => (
                        <Fragment key={i0}>
                        {" "}
                        <div className="list-row">
                          {" "}
                          <span className="av" style={{ background: fr.bg, width: "40px", height: "40px", borderRadius: "14px", color: "#1a0b14", fontWeight: "800" }}>
                            {fr.initial}
                          </span>
                          {" "}
                          <span style={{ flex: "1" }}>
                            <b>
                              {fr.name}
                            </b>
                            <div className="muted" style={{ fontSize: "12.5px" }}>
                              {fr.sub}
                            </div>
                          </span>
                          {" "}
                          <button className={`btn btn-sm tap ${fr.cls}`} onClick={fr.send}>
                            {fr.label}
                          </button>
                          {" "}
                        </div>
                        {" "}
                        </Fragment>
                      ))}
                      {" "}
                    </section>
                    {" "}
                    <section className="card" style={{ padding: "14px" }}>
                      {" "}
                      <div className="row">
                        <b style={{ flex: "1" }}>
                          Room settings
                        </b>
                        <SkLink href="/games/new" onClick={v.editSetup} className="pink" style={{ fontSize: "13.5px", fontWeight: "800" }}>
                          Edit
                        </SkLink>
                      </div>
                      {" "}
                      <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", marginTop: "10px" }}>
                        {" "}
                        {(v.settings || []).map((st, i0) => (
                          <Fragment key={i0}>
                          <span className="pill">
                            {st}
                          </span>
                          </Fragment>
                        ))}
                        {" "}
                      </div>
                      {" "}
                      <div className="row" style={{ marginTop: "12px" }}>
                        <span style={{ flex: "1", fontSize: "14px" }}>
                          <b>
                            Lock the room
                          </b>
                          <div className="muted" style={{ fontSize: "12.5px" }}>
                            No new players after you start
                          </div>
                        </span>
                        <button className="switch" role="switch" aria-checked={v.lockStr} aria-label="Lock the room" onClick={v.toggleLock} />
                      </div>
                      {" "}
                    </section>
                    {" "}
                    {v.canStartNow ? (
                      <>
                      <button onClick={v.startNow} className="btn btn-cta btn-lg btn-block tap">
                        {v.startLabel}
                      </button>
                      </>
                    ) : null}
                    {" "}
                    {v.cantStartNow ? (
                      <>
                      <button className="btn btn-cta btn-lg btn-block" disabled={!!(true)}>
                        {v.startLabel}
                      </button>
                      </>
                    ) : null}
                    {" "}
                  </div>
                  {" "}
                  </>
                ) : null}
                {" "}
                {v.notHost ? (
                  <>
                  {" "}
                  <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                    {" "}
                    {v.isGuest ? (
                      <>
                      {" "}
                      <div className="card" style={{ padding: "12px 14px", display: "flex", gap: "10px", alignItems: "center", fontSize: "13.5px", lineHeight: "1.4" }}>
                        {" "}
                        <img src="/sk/wrapped_gift_3d.png" alt="" style={{ width: "32px", height: "32px", flex: "none" }} />
                        {" "}
                        <span style={{ flex: "1" }}>
                          <b>
                            Playing as a guest.
                          </b>
                          {" "}
                          <span className="muted">
                            Sign up after to keep your nickname, XP and streak.
                          </span>
                        </span>
                        {" "}
                      </div>
                      {" "}
                      </>
                    ) : null}
                    {" "}
                    <section className="card lb-nick">
                      {" "}
                      <span className="av pop" style={{ background: v.me.color }}>
                        {v.me.initial}
                      </span>
                      {" "}
                      <span style={{ flex: "1" }}>
                        <span className="muted" style={{ fontSize: "12px", fontWeight: "800", letterSpacing: ".08em", textTransform: "uppercase" }}>
                          You are
                        </span>
                        <b className="d" style={{ display: "block", fontSize: "26px", lineHeight: "1.05" }}>
                          {v.me.name}
                        </b>
                        <span className="muted" style={{ fontSize: "12.5px" }}>
                          Nobody can see who you really are
                        </span>
                      </span>
                      {" "}
                      <button className="btn btn-sm tap" onClick={v.reroll} disabled={!!(v.noReroll)}>
                        {v.rerollLabel}
                      </button>
                      {" "}
                    </section>
                    {" "}
                    <section className="card row" style={{ padding: "14px" }}>
                      {" "}
                      <span style={{ flex: "1" }}>
                        <b>
                          I’m ready
                        </b>
                        <div className="muted" style={{ fontSize: "12.5px" }}>
                          {v.readyHint}
                        </div>
                      </span>
                      {" "}
                      <button className="switch" role="switch" aria-checked={v.readyStr} aria-label="I’m ready" onClick={v.toggleReady} />
                      {" "}
                    </section>
                    {" "}
                    <section className="card" style={{ padding: "16px" }}>
                      {" "}
                      <b>
                        {"How "}{v.gm.name}{" works"}
                      </b>
                      {" "}
                      <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginTop: "12px" }}>
                        {" "}
                        {(v.rules || []).map((ru, i0) => (
                          <Fragment key={i0}>
                          <div className="lb-rule">
                            <b>
                              {ru.n}
                            </b>
                            <span>
                              {ru.text}
                            </span>
                          </div>
                          </Fragment>
                        ))}
                        {" "}
                      </div>
                      {" "}
                    </section>
                    {" "}
                    {v.showGo ? (
                      <>
                      {" "}
                      <div className="card pop" style={{ padding: "14px", display: "flex", gap: "12px", alignItems: "center", borderColor: "#ff3b8d", boxShadow: "0 0 0 4px rgba(255,59,141,.15)" }}>
                        {" "}
                        <img src="/sk/crown_3d.png" alt="" style={{ width: "36px", height: "36px", flex: "none" }} />
                        {" "}
                        <span style={{ flex: "1", fontSize: "14px", lineHeight: "1.4" }}>
                          <b>
                            {v.hostName}{" started the game!"}
                          </b>
                          <br />
                          <span className="muted">
                            Taking you to the table…
                          </span>
                        </span>
                        {" "}
                        <button onClick={v.goNow} className="btn btn-sm btn-cta tap">
                          Go now
                        </button>
                        {" "}
                      </div>
                      {" "}
                      </>
                    ) : null}
                    {" "}
                    {v.waitingHost ? (
                      <>
                      <div className="btn btn-lg btn-block" style={{ pointerEvents: "none", opacity: ".8" }}>
                        {v.waitText}
                      </div>
                      </>
                    ) : null}
                    {" "}
                    <div className="ad-wrap" style={{ margin: "0" }}>
                      <div className="ad ad-mrec">
                        <b>
                          Medium rectangle · lobby
                        </b>
                        300 × 250 · only while waiting
                      </div>
                    </div>
                    {" "}
                    <SkLink href="/games" className="btn btn-ghost btn-block" style={{ border: "0" }}>
                      Leave lobby
                    </SkLink>
                    {" "}
                  </div>
                  {" "}
                  </>
                ) : null}
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
        {v.inGame ? (
          <>
          {" "}
          <TruthDare role="player" />
          {" "}
          </>
        ) : null}
        {" "}
        {v.toast ? (
          <>
          {" "}
          <div className="toast" role="status">
            <img src={v.toastIcon} alt="" style={{ width: "32px", height: "32px", flex: "none" }} />
            <span style={{ fontSize: "14px", lineHeight: "1.35" }}>
              <b>
                {v.toastTitle}
              </b>
              <br />
              <span className="muted">
                {v.toastSub}
              </span>
            </span>
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
