// @ts-nocheck -- ported 1:1 from design/mockup/JoinPublic.dc.html by scripts/port-mockup.mjs; typed as it gets wired to real data
"use client";

import React, { Fragment } from "react";
import { saveMode, SkLink } from "@/lib/sk/runtime";


export default class JoinPublic extends React.Component<Record<string, any>, any> {
  static defaultProps = {"game":"nhie","state":"open"};

  constructor(props) {
    super(props);
    this.state = this.blank();
  }
  blank() { return { step: 'invite', spins: 2, spun: 0, age: false, notified: false }; }
  // a different link (game or room state) starts the join over
  componentDidUpdate(prev) { if (prev.game !== this.props.game || prev.state !== this.props.state) this.setState(this.blank()); }
  renderVals() {
    var self = this, s = this.state, st = this.props.state || 'open';
    var GM = {
      nhie: { name: 'Never Have I Ever', icon: '/sk/shushing_face.png', room: 'Friday Night Never', sc: { name: 'Neon lounge', sky: 'radial-gradient(120% 90% at 50% 0%,#4a1263 0%,#160a22 55%,#08050c 100%)', glow: '#ff3b8d', floor: 'linear-gradient(rgba(255,59,141,.55) 2px,transparent 2px),linear-gradient(90deg,rgba(255,59,141,.55) 2px,transparent 2px)', table: 'radial-gradient(circle at 50% 38%,#8a2a7a,#3a0f3a 70%)' } },
      tod: { name: 'Truth or Dare', icon: '/sk/bottle_with_popping_cork_3d.png', room: 'Dare Club 300L', sc: { name: 'Bonfire night', sky: 'radial-gradient(90% 80% at 50% 80%,#7a2d0b 0%,#2a0d05 50%,#0b0503 100%)', glow: '#ff7a1a', floor: 'linear-gradient(rgba(255,160,70,.35) 2px,transparent 2px),linear-gradient(90deg,rgba(255,160,70,.35) 2px,transparent 2px)', table: 'radial-gradient(circle at 50% 40%,#b0703a,#5a2b14 70%)' } },
      wyr: { name: 'Would You Rather', icon: '/sk/crossed_swords_3d.png', room: 'Class of 2027 chaos', sc: { name: 'Split arena', sky: 'radial-gradient(120% 90% at 50% 0%,#0d2a5a 0%,#071229 55%,#04060d 100%)', glow: '#22e1ff', floor: 'linear-gradient(rgba(34,225,255,.4) 2px,transparent 2px),linear-gradient(90deg,rgba(34,225,255,.4) 2px,transparent 2px)', table: 'radial-gradient(circle at 50% 40%,#2a2f4a,#11142a 70%)' } },
      mlt: { name: 'Most Likely To', icon: '/sk/crown_3d.png', room: 'Hostel B awards', sc: { name: 'Award show', sky: 'radial-gradient(120% 90% at 50% 0%,#3a2a08 0%,#150d22 55%,#07050b 100%)', glow: '#ffd23d', floor: 'linear-gradient(rgba(255,210,61,.35) 2px,transparent 2px),linear-gradient(90deg,rgba(255,210,61,.35) 2px,transparent 2px)', table: 'radial-gradient(circle at 50% 38%,#2b2333,#0d0a12 70%)' } },
      hot: { name: 'Hot Takes', icon: '/sk/hot_pepper_3d.png', room: 'Sunday vibes only', sc: { name: 'Hot seat', sky: 'linear-gradient(110deg,#0b2a4a 0%,#170a18 50%,#4a0b12 100%)', glow: '#ff4f6d', floor: 'linear-gradient(rgba(255,120,120,.35) 2px,transparent 2px),linear-gradient(90deg,rgba(120,200,255,.35) 2px,transparent 2px)', table: 'radial-gradient(circle at 50% 40%,#45404f,#17141d 70%)' } },
      poll: { name: 'Anonymous Polls', icon: '/sk/ballot_box_with_ballot_3d.png', room: 'Group chat polls', sc: { name: 'Live studio', sky: 'radial-gradient(120% 90% at 50% 0%,#0b3a3a 0%,#081a1f 55%,#04090b 100%)', glow: '#5be0a0', floor: 'linear-gradient(rgba(91,224,160,.35) 2px,transparent 2px),linear-gradient(90deg,rgba(91,224,160,.35) 2px,transparent 2px)', table: 'radial-gradient(circle at 50% 40%,#1d3a3a,#0a1719 70%)' } }
    };
    var gm = Object.assign({}, GM[this.props.game] || GM.nhie, this.props.room ? { room: this.props.room } : {});
    var NAMES = [['MangoMoon', '#ffd23d'], ['JollofJet', '#ff9a4a'], ['SuyaStar', '#ff5fa2'], ['PuffPuff', '#ffe27a'], ['ZoboQueen', '#b78bff'], ['AgegeBread', '#7ef0c1'], ['NeonNaija', '#22e1ff'], ['ChinChin', '#ff9ad5']];
    var pick = [2, 5, 0][s.spun] !== undefined ? [2, 5, 0][s.spun] : 0;
    var reel = []; for (var k = 0; k < 3; k++) NAMES.forEach(function (x) { reel.push({ name: x[0], color: x[1] }); });
    var landing = 8 * (s.spun + 1) + pick;
    var me = NAMES[pick];
    var crew = [['CocoaRay', '#7ef0c1'], ['BlueFox', '#7fb2ff'], ['KolaNut', '#ff9ad5'], ['PixelOwl', '#ffb35c'], ['ZoboQueen', '#b78bff']];
    var n = this.props.max || 6, taken = this.props.seated || 0;
    var seats = [], R = 182;
    for (var i = 0; i < n; i++) {
      var a = (90 + i * 360 / n) * Math.PI / 180, mine = i === 0, filled = !mine && i <= taken - (st === 'full' ? 0 : 0);
      if (st === 'full' && mine) filled = true;
      var who = mine ? (st === 'full' ? crew[4] : me) : crew[i - 1];
      seats.push({ x: Math.round(R * Math.cos(a)), y: Math.round(R * Math.sin(a)), label: mine && st !== 'full' ? (s.step === 'invite' ? 'Your seat' : 'You') : filled ? who[0] : 'open',
        initial: mine && st !== 'full' && s.step === 'invite' ? '?' : (filled || mine ? who[0].charAt(0) : '+'), color: mine && st !== 'full' && s.step === 'invite' ? 'rgba(255,255,255,.25)' : (filled || mine ? who[1] : 'rgba(255,255,255,.12)'),
        cls: mine && st !== 'full' ? 'g3-me g3-hop' : '', op: filled || mine ? 1 : 0.4, glow: mine && st !== 'full' ? '0 0 30px #ffffff' : 'none' });
    }
    return {
      gm: gm, sc: gm.sc, seats: seats,
      seatChip: taken + ' / ' + n + ' seated', statusChip: st === 'started' ? 'Round 2 of 3' : st === 'full' ? 'Full' : 'Waiting to start',
      holoSub: st === 'started' ? 'game in progress' : st === 'full' ? 'table full' : 'your seat is open',
      stInvite: s.step === 'invite', stNick: s.step === 'nick', stRules: s.step === 'rules',
      isOpen: st === 'open', isStarted: st === 'started', isFull: st === 'full',
      inviteBody: st === 'full' ? 'Every seat is taken right now. Want a ping when one opens?' : st === 'started' ? 'They already started. Jump in as a spectator and you get a seat from the next round.' : 'Someone you know invited you to play ' + gm.name + '. Three friends are already at the table.',
      chips: ['3 rounds', 'Mild → Unhinged', '15s turns', 'Up to 6'],
      notify: function () { self.setState({ notified: true }); }, notifyLabel: s.notified ? 'We’ll ping you ✓' : 'Ping me when a seat opens',
      toNick: function () { self.setState({ step: 'nick' }); },
      reel: reel, reelY: '-' + (landing * 64) + 'px', nick: me[0],
      nickLine: 'Say hi to ' + me[0] + '. Nobody can trace it back to you.',
      spin: function () { if (s.spins > 0) self.setState({ spun: s.spun + 1, spins: s.spins - 1 }); }, noSpin: s.spins === 0, spinOp: s.spins === 0 ? 0.5 : 1, spinLabel: s.spins ? 'Spin again · ' + s.spins + ' left' : 'No spins left',
      toRules: function () { self.setState({ step: 'rules' }); },
      enterLobby: function (e) { if (e && e.preventDefault) e.preventDefault(); if (!s.age || st !== 'open') return; self.props.join(me[0]).then(function (r) { if (r && r.ok) window.location.href = '/g/' + r.code + '/lobby'; else if (r && r.login) window.location.href = '/login?next=' + encodeURIComponent(window.location.pathname); else window.alert((r && r.error) || 'Couldn’t join.'); }); },
      lobbyHref: ({ nhie: 'NHIE', tod: 'TruthDare', wyr: 'WYR', mlt: 'MostLikely', hot: 'HotTakes', poll: 'Polls' }[self.props.game || 'nhie'] || 'NHIE') + (st === 'started' ? '.dc.html' : 'LobbyJoin.dc.html'),
      enterLabel: st === 'started' ? 'Join the table as ' + me[0] : 'Enter the lobby as ' + me[0],
      age: s.age, noAge: !s.age, ageStr: s.age ? 'true' : 'false', boxBg: s.age ? '#ffffff' : 'transparent', toggleAge: function () { self.setState({ age: !s.age }); },
      orbStart: function (e) { self.drag = { x: e.clientX, o: self.orb || 0 }; try { e.currentTarget.setPointerCapture(e.pointerId); } catch (x) {} },
      orbMove: function (e) { if (!self.drag) return; var o = Math.max(-40, Math.min(40, self.drag.o + (e.clientX - self.drag.x) * 0.35)); e.currentTarget.style.setProperty('--orb', o.toFixed(1) + 'deg'); self.drag.cur = o; },
      orbEnd: function () { if (!self.drag) return; if (self.drag.cur !== undefined) self.orb = self.drag.cur; self.drag = null; }
    };
  }

  render() {
    // like the mockup runtime: the template sees the props merged with renderVals()
    const v = { ...this.props, ...(this.renderVals() || {}) };
    return (
      <>
      {" "}
      <div className="sk jp" style={{ background: v.sc.sky }}>
        {" "}
        <div className="jp-wrap">
          {" "}
          <header style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
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
            <SkLink href="/games/join" style={{ color: "rgba(255,255,255,.85)", fontWeight: "700", fontSize: "13.5px" }}>
              Open in the app
            </SkLink>
            {" "}
          </header>
          {" "}
          <section className="g3" aria-label="The table" style={{ height: "300px" }} onPointerDown={v.orbStart} onPointerMove={v.orbMove} onPointerUp={v.orbEnd} onPointerLeave={v.orbEnd}>
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
                {v.statusChip}
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
                  <div className="g3-holo" style={{ marginBottom: "14px" }}>
                    <img src={v.gm.icon} alt="" style={{ width: "26px", height: "26px" }} />
                    <b>
                      {v.gm.name}
                    </b>
                    <span style={{ fontSize: "11px", fontWeight: "700", opacity: ".85" }}>
                      {v.holoSub}
                    </span>
                  </div>
                </div>
              </div>
              {" "}
              {(v.seats || []).map((p, i0) => (
                <Fragment key={i0}>
                {" "}
                <div className="g3-at" style={{ transform: `translate3d(${p.x}px, ${p.y}px, 0)` }}>
                  <div className="g3-shadow" />
                  <div className="g3-bb">
                    <div className={`g3-fig ${p.cls}`} style={{ opacity: p.op }}>
                      <span className="g3-name">
                        {p.label}
                      </span>
                      <div className="g3-head" style={{ background: p.color, boxShadow: p.glow }}>
                        {p.initial}
                      </div>
                      <div className="g3-body" style={{ background: p.color }} />
                    </div>
                  </div>
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
          {v.stInvite ? (
            <>
            {" "}
            <section className="jp-card rise">
              {" "}
              <div style={{ fontSize: "13px", fontWeight: "800", letterSpacing: ".08em", textTransform: "uppercase", opacity: ".85" }}>
                You’re invited
              </div>
              {" "}
              <h1 className="d" style={{ marginTop: "6px", fontSize: "32px", lineHeight: "1.02" }}>
                {v.gm.room}
              </h1>
              {" "}
              <p style={{ marginTop: "8px", fontSize: "15px", lineHeight: "1.5", opacity: ".9" }}>
                {v.inviteBody}
              </p>
              {" "}
              <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", marginTop: "12px" }}>
                {(v.chips || []).map((c, i0) => (
                  <Fragment key={i0}>
                  <span className="pill" style={{ background: "rgba(255,255,255,.14)", color: "#ffffff" }}>
                    {c}
                  </span>
                  </Fragment>
                ))}
              </div>
              {" "}
              {v.isOpen ? (
                <>
                <button className="jp-btn tap" onClick={v.toNick} style={{ marginTop: "16px", background: "#ffffff", color: "#1a0b14" }}>
                  Take my seat
                </button>
                </>
              ) : null}
              {" "}
              {v.isStarted ? (
                <>
                <button className="jp-btn tap" onClick={v.toNick} style={{ marginTop: "16px", background: "#ffffff", color: "#1a0b14" }}>
                  Watch now · join next round
                </button>
                </>
              ) : null}
              {" "}
              {v.isFull ? (
                <>
                {" "}
                <div>
                  {" "}
                  <button className="jp-btn tap" onClick={v.notify} style={{ marginTop: "16px", background: "#ffffff", color: "#1a0b14" }}>
                    {v.notifyLabel}
                  </button>
                  {" "}
                  <SkLink href="/signup" className="jp-btn tap" style={{ marginTop: "8px", background: "transparent", color: "#ffffff", border: "1px solid rgba(255,255,255,.35)" }}>
                    Start my own game
                  </SkLink>
                  {" "}
                </div>
                {" "}
                </>
              ) : null}
              {" "}
              <p style={{ marginTop: "12px", fontSize: "12.5px", opacity: ".75", textAlign: "center" }}>
                No account needed. You’ll play under a random nickname.
              </p>
              {" "}
            </section>
            {" "}
            </>
          ) : null}
          {" "}
          {v.stNick ? (
            <>
            {" "}
            <section className="jp-card rise" style={{ textAlign: "center" }}>
              {" "}
              <div style={{ fontSize: "13px", fontWeight: "800", letterSpacing: ".08em", textTransform: "uppercase", opacity: ".85" }}>
                Your secret identity
              </div>
              {" "}
              <div className="jp-slot" style={{ marginTop: "12px" }}>
                <div className="jp-reel" style={{ transform: `translateY(${v.reelY})` }}>
                  {(v.reel || []).map((r, i0) => (
                    <Fragment key={i0}>
                    <span style={{ color: r.color }}>
                      {r.name}
                    </span>
                    </Fragment>
                  ))}
                </div>
              </div>
              {" "}
              <p style={{ marginTop: "12px", fontSize: "14.5px", opacity: ".9" }}>
                {v.nickLine}
              </p>
              {" "}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px", marginTop: "14px" }}>
                {" "}
                <button className="jp-btn tap" onClick={v.spin} disabled={!!(v.noSpin)} style={{ background: "rgba(255,255,255,.12)", color: "#ffffff", fontSize: "15px", opacity: v.spinOp }}>
                  {v.spinLabel}
                </button>
                {" "}
                <button className="jp-btn tap" onClick={v.toRules} style={{ background: "#ffffff", color: "#1a0b14", fontSize: "15px" }}>
                  Keep it
                </button>
                {" "}
              </div>
              {" "}
            </section>
            {" "}
            </>
          ) : null}
          {" "}
          {v.stRules ? (
            <>
            {" "}
            <section className="jp-card rise">
              {" "}
              <h2 style={{ fontSize: "22px" }}>
                Three quick rules
              </h2>
              {" "}
              <div style={{ marginTop: "6px" }}>
                {" "}
                <div className="jp-rule">
                  <img src="/sk/shushing_face.png" alt="" />
                  <span>
                    <b>
                      Nicknames only.
                    </b>
                    {" Nobody sees your real name, number or account."}
                  </span>
                </div>
                {" "}
                <div className="jp-rule">
                  <img src="/sk/sparkles.png" alt="" />
                  <span>
                    <b>
                      Say anything, but players can report.
                    </b>
                    {" Each report is a warning. After 3, the next one removes you from their games."}
                  </span>
                </div>
                {" "}
                <div className="jp-rule">
                  <img src="/sk/locked_3d.png" alt="" />
                  <span>
                    <b>
                      16+ only.
                    </b>
                    {" Some decks get spicy."}
                  </span>
                </div>
                {" "}
              </div>
              {" "}
              <div className="jp-check tap" onClick={v.toggleAge} role="checkbox" aria-checked={v.ageStr} tabIndex="0" style={{ marginTop: "12px" }}>
                {" "}
                <span className="jp-box" style={{ background: v.boxBg }}>
                  {v.age ? (
                    <>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#1a0b14" strokeWidth="3.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="M20 6 9 17l-5-5" />
                    </svg>
                    </>
                  ) : null}
                </span>
                {" I’m 16 or older and I’ll keep it fun "}
              </div>
              {" "}
              {v.age ? (
                <>
                <SkLink href="#" onClick={v.enterLobby} className="jp-btn tap pop" style={{ marginTop: "12px", background: "#ffffff", color: "#1a0b14" }}>
                  {v.enterLabel}
                </SkLink>
                </>
              ) : null}
              {" "}
              {v.noAge ? (
                <>
                <div className="jp-btn" style={{ marginTop: "12px", background: "rgba(255,255,255,.12)", color: "rgba(255,255,255,.7)" }}>
                  Tick the box to continue
                </div>
                </>
              ) : null}
              {" "}
            </section>
            {" "}
            </>
          ) : null}
          {" "}
        </div>
        {" "}
      </div>
      {" "}
      </>
    );
  }
}
