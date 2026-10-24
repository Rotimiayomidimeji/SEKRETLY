// @ts-nocheck -- ported 1:1 from design/mockup/CreateGame.dc.html by scripts/port-mockup.mjs; typed as it gets wired to real data
"use client";

import React, { Fragment } from "react";
import { saveMode, SkLink } from "@/lib/sk/runtime";


export default class CreateGame extends React.Component<Record<string, any>, any> {
  static defaultProps = {"mode":"dark","game":"nhie"};

  constructor(props) {
    super(props);
    var m = null; // light/dark arrives as props.mode from the sk-mode cookie
    this.state = this.arrive(m || props.mode || 'dark');
  }
  // what to show on arrival: a game picked in the hub, settings coming back from the lobby, or a blank wizard
  arrive(mode) {
    var pick = null, edit = null, saved = null, crew = null;
    this.nav = '';
    if (edit && saved) return Object.assign({}, saved, { mode: mode, step: edit === 'review' ? 3 : 1, reached: 3 });
    var game = pick || this.props.game || 'nhie';
    return { crew: crew || null, mode: mode, step: pick || crew ? 1 : 0, reached: pick || crew ? 1 : 0, game: crew && !pick ? 'mlt' : game, room: '', roomSeed: 0, join: 'both', max: 6, laps: 1, timer: 15, spice: 'mild', esc: true,
      packs: { campus: true, situationship: true }, special: this.defaults(game), scene: null, shape: 'round', sound: true, when: 'now',
      pollQ: 'Best place to hang out after exams?', pollOpts: ['Beach', 'Mall', 'Owambe'] };
  }
  defaults(game) { return { nhie: {}, tod: { proof: true, pass: true }, wyr: { bonus: true }, mlt: { full: true, titles: true }, hot: { avg: true }, poll: { bonus: true, anyone: true } }[game] || {}; }
  componentDidMount() {
    var self = this;
    this.onStore = function (e) { if (e.key === 'sk-mode' && e.newValue) self.setState({ mode: e.newValue }); };
    try { window.addEventListener('storage', this.onStore); } catch (e) {}
    // a new link (hub tile, lobby Edit, New game) restarts the wizard instead of showing the last one
  }
  componentWillUnmount() { try { window.removeEventListener('storage', this.onStore); } catch (e) {} clearInterval(this.tk); }
  componentDidUpdate(prev) { if (prev.mode !== this.props.mode && this.props.mode) this.setState({ mode: this.props.mode }); }
  renderVals() {
    var self = this, s = this.state, dark = s.mode !== 'light';
    var SC = {
      neon: { name: 'Neon lounge', sky: 'radial-gradient(120% 90% at 50% 0%,#4a1263 0%,#160a22 55%,#08050c 100%)', glow: '#ff3b8d', floor: 'linear-gradient(rgba(255,59,141,.55) 2px,transparent 2px),linear-gradient(90deg,rgba(255,59,141,.55) 2px,transparent 2px)', table: 'radial-gradient(circle at 50% 38%,#8a2a7a,#3a0f3a 70%)' },
      bonfire: { name: 'Bonfire night', sky: 'radial-gradient(90% 80% at 50% 80%,#7a2d0b 0%,#2a0d05 50%,#0b0503 100%)', glow: '#ff7a1a', floor: 'linear-gradient(rgba(255,160,70,.35) 2px,transparent 2px),linear-gradient(90deg,rgba(255,160,70,.35) 2px,transparent 2px)', table: 'radial-gradient(circle at 50% 40%,#b0703a,#5a2b14 70%)' },
      arena: { name: 'Split arena', sky: 'radial-gradient(120% 90% at 50% 0%,#0d2a5a 0%,#071229 55%,#04060d 100%)', glow: '#22e1ff', floor: 'linear-gradient(rgba(34,225,255,.4) 2px,transparent 2px),linear-gradient(90deg,rgba(34,225,255,.4) 2px,transparent 2px)', table: 'radial-gradient(circle at 50% 40%,#2a2f4a,#11142a 70%)' },
      awards: { name: 'Award show', sky: 'radial-gradient(120% 90% at 50% 0%,#3a2a08 0%,#150d22 55%,#07050b 100%)', glow: '#ffd23d', floor: 'linear-gradient(rgba(255,210,61,.35) 2px,transparent 2px),linear-gradient(90deg,rgba(255,210,61,.35) 2px,transparent 2px)', table: 'radial-gradient(circle at 50% 38%,#2b2333,#0d0a12 70%)' },
      hotseat: { name: 'Hot seat', sky: 'linear-gradient(110deg,#0b2a4a 0%,#170a18 50%,#4a0b12 100%)', glow: '#ff4f6d', floor: 'linear-gradient(rgba(255,120,120,.35) 2px,transparent 2px),linear-gradient(90deg,rgba(120,200,255,.35) 2px,transparent 2px)', table: 'radial-gradient(circle at 50% 40%,#45404f,#17141d 70%)' },
      studio: { name: 'Live studio', sky: 'radial-gradient(120% 90% at 50% 0%,#0b3a3a 0%,#081a1f 55%,#04090b 100%)', glow: '#5be0a0', floor: 'linear-gradient(rgba(91,224,160,.35) 2px,transparent 2px),linear-gradient(90deg,rgba(91,224,160,.35) 2px,transparent 2px)', table: 'radial-gradient(circle at 50% 40%,#1d3a3a,#0a1719 70%)' }
    };
    var GM = {
      nhie: { name: 'Never Have I Ever', icon: '/sk/shushing_face.png', hook: 'Tip a cup every time you have. Last one standing wins.', players: '3–10 players', scene: 'neon', min: 3, cap: 10,
        special: [['lives5', 'Start with 5 cups', 'Longer games, more chances to confess'], ['write', 'Players write statements', 'Each round someone writes their own']] },
      tod: { name: 'Truth or Dare', icon: '/sk/bottle_with_popping_cork_3d.png', hook: 'Spin the bottle. Truth, dare, or wear the chicken.', players: '2–8 players', scene: 'bonfire', min: 2, cap: 8,
        special: [['proof', 'Photos &amp; videos for every player', 'Dares need a photo or video. Truths can add one. Blurred until tapped'], ['pass', 'One “pass” card each', 'Skip one turn without the chicken']] },
      wyr: { name: 'Would You Rather', icon: '/sk/crossed_swords_3d.png', hook: 'Pick a side and watch the table split in two.', players: '2–20 players', scene: 'arena', min: 2, cap: 20,
        special: [['bonus', 'Guess the winner bonus', '+2 for calling the bigger side'], ['custom', 'Players add questions', 'Mix your own in with the deck']] },
      mlt: { name: 'Most Likely To', icon: '/sk/crown_3d.png', hook: 'Vote a nickname. The crown drops on the winner.', players: '3–15 players', scene: 'awards', min: 3, cap: 15,
        special: [['full', 'Show full vote counts', 'Off: only the winner is revealed'], ['titles', 'Shareable title cards', '“Most likely to…” cards for the winners']] },
      hot: { name: 'Hot Takes', icon: '/sk/hot_pepper_3d.png', hook: 'Rate spicy opinions. Read the room to score.', players: '2–20 players', scene: 'hotseat', min: 2, cap: 20,
        special: [['avg', 'Show the room average', 'The thermometer rises live'], ['submit', 'Players submit takes', 'Anonymous, reviewed by you']] },
      poll: { name: 'Anonymous Polls', icon: '/sk/ballot_box_with_ballot_3d.png', hook: 'Drop polls, guess the winner, watch columns rise.', players: '2–50 players', scene: 'studio', min: 2, cap: 50,
        special: [['multi', 'Allow multiple answers', 'Players can tick more than one'], ['anyone', 'Anyone can add a poll', 'Off: only you post polls']] }
    };
    var gm = GM[s.game] || GM.nhie;
    var sceneId = s.scene || gm.scene, sc = SC[sceneId];
    var ROOMS = ['Friday Night Never', 'Hostel B after dark', 'Class of 2027 chaos', 'Owambe aftermath', 'No chickens allowed', 'Sunday vibes only'];
    // saved crews: same people every time, under their game nicknames
    var CREWS = { 'Hostel B gang': ['Fox', 'KolaNut', 'PixelOwl', 'Zobo', 'MangoMoon'], 'Class of 2027': ['Moon', 'PixelOwl', 'ChinChin', 'Suya', 'Zobo', 'Fox', 'KolaNut'], 'Sunday brunch crew': ['KolaNut', 'Moon', 'Zobo'] };
    var crewList = s.crew && CREWS[s.crew] ? CREWS[s.crew] : null;
    var room = s.room || (crewList ? s.crew + ' night' : ROOMS[(s.roomSeed + Object.keys(GM).indexOf(s.game)) % ROOMS.length]);
    var opt = function (list, cur, key) { return list.map(function (x) { return { label: x[1], on: cur === x[0] ? 'true' : 'false', pick: function () { var o = {}; o[key] = x[0]; self.setState(o); } }; }); };
    var PK = [['campus', 'Campus life'], ['situationship', 'Situationship'], ['owambe', 'Owambe'], ['hostel', 'Hostel secrets'], ['exam', 'Exam szn'], ['unhinged', 'Unhinged 🔒']];
    var STEP = ['Pick a game', 'Set it up', 'Choose the table', 'Review'];
    var seats = [], n = s.max > 8 ? 8 : s.max, R = 182, C = ['#ffd23d', '#7ef0c1', '#7fb2ff', '#ff9ad5', '#ffb35c', '#b78bff', '#5be0a0', '#ff8b98'];
    for (var i = 0; i < n; i++) { var a = (90 + i * 360 / n) * Math.PI / 180, mate = crewList && i > 0 ? crewList[i - 1] : null; seats.push({ x: Math.round(R * Math.cos(a) * (s.shape === 'long' ? 1.12 : 1)), y: Math.round(R * Math.sin(a) * (s.shape === 'long' ? 0.8 : 1)), label: i === 0 ? 'You' : mate || 'open', initial: i === 0 ? 'Y' : mate ? mate.charAt(0) : '+', color: i === 0 ? C[0] : C[i % C.length], cls: i === 0 ? 'g3-me' : '', op: i === 0 || mate ? 1 : 0.4 }); }
    var spiceLabel = s.esc ? { mild: 'Mild → Unhinged', spicy: 'Spicy → Unhinged', unhinged: 'Unhinged all night' }[s.spice] : { mild: 'Mild', spicy: 'Spicy', unhinged: 'Unhinged' }[s.spice];
    var packsOn = PK.filter(function (p) { return s.packs[p[0]]; }).map(function (p) { return p[1]; });
    var summary = (crewList ? ['Crew: ' + s.crew] : []).concat([(s.max * s.laps) + ' turns', spiceLabel, s.timer + 's turns', 'Up to ' + s.max, { link: 'Public link', friends: 'Friends only', both: 'Link + friends' }[s.join]]).concat(packsOn);
    var last = s.step === 3;
    var LOBBY = { nhie: 'NHIELobby', tod: 'TruthDareLobby', wyr: 'WYRLobby', mlt: 'MostLikelyLobby', hot: 'HotTakesLobby', poll: 'PollsLobby' };
    var stash = function () {
      try {
        window.localStorage.setItem('sk-wiz', JSON.stringify(Object.assign({}, s, { room: room })));
        window.localStorage.setItem('sk-game', JSON.stringify({ game: s.game, room: room, max: s.max, laps: s.laps, timer: s.timer, spice: s.spice, esc: s.esc, special: s.special, packs: packsOn, join: s.join, when: s.when, settings: summary.slice(0, 5).concat([sc.name]) }));
        window.localStorage.removeItem('sk-join');
        window.localStorage.setItem('sk-nav', String(Date.now()));
      } catch (e) {}
    };
    return {
      mode: dark ? 'dark' : 'light', isDark: dark, isLight: !dark, modeWord: dark ? 'Light' : 'Dark',
      toggleMode: function () { var x = dark ? 'light' : 'dark'; saveMode(x); self.setState({ mode: x }); },
      stepNo: s.step + 1, stepName: STEP[s.step], steps: STEP.map(function (x, k) { var reached = Math.max(s.reached || 0, s.step); return { label: (k + 1) + ' · ' + ['Game', 'Setup', 'Table', 'Review'][k], c: k <= s.step ? '#ff3b8d' : 'var(--line)', cur: k === s.step ? 'step' : 'false', locked: k > reached, go: function () { if (k <= reached) self.setState({ step: k }); } }; }),
      s1: s.step === 0, s2: s.step === 1, s3: s.step === 2, s4: s.step === 3,
      games: Object.keys(GM).map(function (k) { var g = GM[k]; return { name: g.name, icon: g.icon, hook: g.hook, players: g.players, on: s.game === k ? 'true' : 'false', pick: function () { self.setState({ game: k, scene: null, special: self.defaults(k), step: 1, reached: Math.max(s.reached || 0, 1), max: Math.min(Math.max(s.max, g.min), g.cap) }); } }; }),
      room: room, onRoom: function (e) { self.setState({ room: e.target.value }); }, rollRoom: function () { self.setState({ room: '', roomSeed: s.roomSeed + 1 }); },
      joinOpts: opt([['link', 'Public link'], ['friends', 'Friends'], ['both', 'Both']], s.join, 'join'),
      max: s.max, maxHint: gm.min + '–' + gm.cap + ' for ' + gm.name,
      maxDown: function () { self.setState({ max: Math.max(gm.min, s.max - 1) }); }, maxUp: function () { self.setState({ max: Math.min(gm.cap, s.max + 1) }); },
      roundOpts: opt([[1, 'Once'], [2, 'Twice'], [3, '3 times']], s.laps, 'laps'), lapHint: 'Everyone leads ' + ['', 'once', 'twice', '3 times'][s.laps] + ': ' + (s.max * s.laps) + ' turns with ' + s.max + ' players',
      timerOpts: opt([[10, '10s'], [15, '15s'], [30, '30s']], s.timer, 'timer'),
      spiceOpts: opt([['mild', 'Mild'], ['spicy', 'Spicy'], ['unhinged', 'Unhinged']], s.spice, 'spice'), spiceHint: 'Where the deck starts',
      escStr: s.esc ? 'true' : 'false', toggleEsc: function () { self.setState({ esc: !s.esc }); },
      packCount: packsOn.length,
      packs: PK.map(function (p) { var on = !!s.packs[p[0]], locked = p[0] === 'unhinged'; return { label: p[1], cls: on ? 'on' : '', on: on ? 'true' : 'false', locked: locked, pick: function () { var o = Object.assign({}, s.packs); o[p[0]] = !on; self.setState({ packs: o }); } }; }),
      gname: gm.name, gicon: gm.icon,
      special: gm.special.map(function (x) { var on = !!s.special[x[0]]; return { label: x[1], hint: x[2], on: on ? 'true' : 'false', toggle: function () { var o = Object.assign({}, s.special); o[x[0]] = !on; self.setState({ special: o }); } }; }),
      isPoll: s.game === 'poll', pollQ: s.pollQ, onPollQ: function (e) { self.setState({ pollQ: e.target.value }); },
      pollOpts: s.pollOpts.map(function (t, k) { return { text: t, n: k + 1, edit: function (e) { var o = s.pollOpts.slice(); o[k] = e.target.value; self.setState({ pollOpts: o }); }, remove: function () { if (s.pollOpts.length > 2) self.setState({ pollOpts: s.pollOpts.filter(function (x, j) { return j !== k; }) }); } }; }),
      addPollOpt: function () { if (s.pollOpts.length < 6) self.setState({ pollOpts: s.pollOpts.concat(['']) }); }, pollFull: s.pollOpts.length >= 6,
      scenes: Object.keys(SC).map(function (k) { return { name: SC[k].name, sky: SC[k].sky, table: SC[k].table, on: sceneId === k ? 'true' : 'false', pick: function () { self.setState({ scene: k }); } }; }),
      shapes: opt([['round', 'Round'], ['long', 'Long']], s.shape, 'shape'),
      soundStr: s.sound ? 'true' : 'false', toggleSound: function () { self.setState({ sound: !s.sound }); },
      whenOpts: opt([['now', 'Start now'], ['later', 'Tonight 9pm']].concat(crewList ? [['weekly', 'Every Fri 9pm']] : []), s.when, 'when'),
      crewHint: crewList ? 'Everyone in ' + s.crew + ' gets an invite and keeps their nickname' : 'Pick a saved crew and the seats fill themselves',
      crewOpts: [['', 'No crew']].concat(Object.keys(CREWS).map(function (k) { return [k, k + ' · ' + (CREWS[k].length + 1)]; })).map(function (c) {
        var on = (s.crew || '') === c[0];
        return { label: c[1], cls: on ? 'on' : '', on: on ? 'true' : 'false', pick: function () { var g = GM[s.game] || GM.nhie, size = c[0] ? CREWS[c[0]].length + 1 : s.max; self.setState({ crew: c[0] || null, join: c[0] ? 'friends' : s.join, max: Math.min(Math.max(size, g.min), g.cap), when: !c[0] && s.when === 'weekly' ? 'now' : s.when }); } };
      }),
      summary: summary, sceneName: sc.name, sc: sc, seats: seats, spiceLabel: spiceLabel,
      tableRadius: s.shape === 'long' ? '999px' : '', tableTransform: s.shape === 'long' ? 'scaleX(1.25) scaleY(.75)' : '',
      hasBack: s.step > 0, back: function () { self.setState({ step: s.step - 1 }); },
      notLast: !last, isLast: last, nextLabel: ['Set it up', 'Choose the table', 'Review'][s.step] || 'Next',
      next: function () { var nx = Math.min(3, s.step + 1); self.setState({ step: nx, reached: Math.max(s.reached || 0, nx) }); },
      noBack: s.step === 0, backLabel: ['', 'Game', 'Setup', 'Table'][s.step] || 'Back',
      lobbyHref: LOBBY[s.game] + '.dc.html',
      openRoom: function () {
        if (s.opening) return;
        self.setState({ opening: true });
        self.props.create({ game: s.game, name: (room || 'Game night').slice(0, 40), max: s.max, laps: s.laps, timer: s.timer, spice: s.spice, esc: s.esc, special: s.special || {}, packs: packsOn, isPublic: s.join !== 'friends', pollQ: s.pollQ, pollOpts: s.pollOpts }).then(function (r) {
          if (r && r.ok) { window.location.href = '/g/' + r.code + '/lobby'; return; }
          self.setState({ opening: false }); window.alert((r && r.error) || 'Couldn’t open the room.');
        });
      }, openLabel: s.when === 'weekly' ? 'Lock in weekly game night' : s.when === 'later' ? 'Schedule the room' : crewList ? 'Open & invite the crew' : 'Open the room',
      changeGame: function () { self.setState({ step: 0 }); },
      open: stash,
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
      <div className="sk" data-mode={v.mode}>
        {" "}
        <div className="cg-wrap">
          {" "}
          <header className="topbar">
            {" "}
            {v.hasBack ? (
              <>
              <button className="icon-btn tap" onClick={v.back} aria-label="Previous step">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M15 18 9 12l6-6" />
                </svg>
              </button>
              </>
            ) : null}
            {" "}
            {v.noBack ? (
              <>
              <SkLink href="/games" className="icon-btn tap" aria-label="Back to games">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M15 18 9 12l6-6" />
                </svg>
              </SkLink>
              </>
            ) : null}
            {" "}
            <div className="grow">
              <h1 style={{ fontSize: "22px" }}>
                New game
              </h1>
              <div className="muted" style={{ fontSize: "13px" }}>
                {"Step "}{v.stepNo}{" of 4 · "}{v.stepName}
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
          <nav className="cg-steps" aria-label="Steps">
            {(v.steps || []).map((sp, i0) => (
              <Fragment key={i0}>
              <button className="tap" onClick={sp.go} disabled={!!(sp.locked)} aria-current={sp.cur}>
                <span style={{ background: sp.c }} />
                {sp.label}
              </button>
              </Fragment>
            ))}
          </nav>
          {" "}
          <div className="cg-grid">
            {" "}
            <div>
              {" "}
              {v.s1 ? (
                <>
                {" "}
                <section className="rise">
                  {" "}
                  <h2 style={{ fontSize: "24px" }}>
                    Pick a game
                  </h2>
                  {" "}
                  <p className="muted" style={{ marginTop: "4px", fontSize: "14.5px" }}>
                    Every game has its own 3D table. Players join with random nicknames.
                  </p>
                  {" "}
                  <div className="cg-tiles" style={{ marginTop: "14px" }}>
                    {" "}
                    {(v.games || []).map((g, i0) => (
                      <Fragment key={i0}>
                      {" "}
                      <button className="gm-tile tap" onClick={g.pick} aria-pressed={g.on}>
                        {" "}
                        <img src={g.icon} alt="" />
                        {" "}
                        <b className="d" style={{ fontSize: "16px", lineHeight: "1.1" }}>
                          {g.name}
                        </b>
                        {" "}
                        <span className="muted" style={{ fontSize: "12.5px", lineHeight: "1.35" }}>
                          {g.hook}
                        </span>
                        {" "}
                        <span className="pill" style={{ marginTop: "auto", alignSelf: "flex-start", fontSize: "11px" }}>
                          {g.players}
                        </span>
                        {" "}
                      </button>
                      {" "}
                      </Fragment>
                    ))}
                    {" "}
                  </div>
                  {" "}
                </section>
                {" "}
                </>
              ) : null}
              {" "}
              {v.s2 ? (
                <>
                {" "}
                <section className="rise">
                  {" "}
                  <h2 style={{ fontSize: "24px" }}>
                    Set it up
                  </h2>
                  {" "}
                  <div className="card row" style={{ marginTop: "12px", padding: "12px 14px", gap: "12px" }}>
                    <img src={v.gicon} alt="" style={{ width: "40px", height: "40px" }} />
                    <span style={{ flex: "1" }}>
                      <span className="muted" style={{ fontSize: "12px", fontWeight: "800", letterSpacing: ".08em", textTransform: "uppercase" }}>
                        Game
                      </span>
                      <b className="d" style={{ display: "block", fontSize: "18px" }}>
                        {v.gname}
                      </b>
                    </span>
                    <button className="btn btn-sm tap" onClick={v.changeGame}>
                      Change
                    </button>
                  </div>
                  {" "}
                  <div className="card" style={{ padding: "4px 16px", marginTop: "12px" }}>
                    {" "}
                    <div className="cg-row" style={{ display: "block" }}>
                      <b>
                        Play with a crew
                      </b>
                      <div className="muted" style={{ fontSize: "12.5px" }}>
                        {v.crewHint}
                      </div>
                      {" "}
                      <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginTop: "8px" }}>
                        {(v.crewOpts || []).map((co, i0) => (
                          <Fragment key={i0}>
                          <button className={`chip tap ${co.cls}`} aria-pressed={co.on} onClick={co.pick}>
                            {co.label}
                          </button>
                          </Fragment>
                        ))}
                      </div>
                      {" "}
                    </div>
                    {" "}
                    <div className="cg-row">
                      <span>
                        <b>
                          Room name
                        </b>
                        <input className="field" value={v.room ?? ""} onChange={v.onRoom} maxLength="32" aria-label="Room name" style={{ marginTop: "8px", minHeight: "46px" }} />
                      </span>
                      <button className="icon-btn tap" onClick={v.rollRoom} aria-label="Random room name" style={{ alignSelf: "flex-end" }}>
                        <img src="/sk/game_die.png" alt="" style={{ width: "26px", height: "26px" }} />
                      </button>
                    </div>
                    {" "}
                    <div className="cg-row" style={{ display: "block" }}>
                      <b>
                        Who can join
                      </b>
                      <div className="seg" style={{ marginTop: "8px" }}>
                        {(v.joinOpts || []).map((j, i0) => (
                          <Fragment key={i0}>
                          <button onClick={j.pick} aria-pressed={j.on} style={{ color: "var(--ink)" }}>
                            {j.label}
                          </button>
                          </Fragment>
                        ))}
                      </div>
                    </div>
                    {" "}
                    <div className="cg-row">
                      <span>
                        <b>
                          Max players
                        </b>
                        <div className="muted" style={{ fontSize: "12.5px" }}>
                          {v.maxHint}
                        </div>
                      </span>
                      <span className="num-step" style={{ flex: "none" }}>
                        <button onClick={v.maxDown} aria-label="Fewer" style={{ color: "var(--ink)" }}>
                          −
                        </button>
                        <b>
                          {v.max}
                        </b>
                        <button onClick={v.maxUp} aria-label="More" style={{ color: "var(--ink)" }}>
                          +
                        </button>
                      </span>
                    </div>
                    {" "}
                    <div className="cg-row" style={{ display: "block" }}>
                      <b>
                        Turns each
                      </b>
                      <div className="muted" style={{ fontSize: "12.5px" }}>
                        {v.lapHint}
                      </div>
                      <div className="seg" style={{ marginTop: "8px" }}>
                        {(v.roundOpts || []).map((ro, i0) => (
                          <Fragment key={i0}>
                          <button onClick={ro.pick} aria-pressed={ro.on} style={{ color: "var(--ink)" }}>
                            {ro.label}
                          </button>
                          </Fragment>
                        ))}
                      </div>
                    </div>
                    {" "}
                    <div className="cg-row" style={{ display: "block" }}>
                      <b>
                        Turn timer
                      </b>
                      <div className="seg" style={{ marginTop: "8px" }}>
                        {(v.timerOpts || []).map((tm, i0) => (
                          <Fragment key={i0}>
                          <button onClick={tm.pick} aria-pressed={tm.on} style={{ color: "var(--ink)" }}>
                            {tm.label}
                          </button>
                          </Fragment>
                        ))}
                      </div>
                    </div>
                    {" "}
                    <div className="cg-row" style={{ display: "block" }}>
                      <b>
                        Spice
                      </b>
                      <div className="muted" style={{ fontSize: "12.5px" }}>
                        {v.spiceHint}
                      </div>
                      <div className="seg" style={{ marginTop: "8px" }}>
                        {(v.spiceOpts || []).map((sp2, i0) => (
                          <Fragment key={i0}>
                          <button onClick={sp2.pick} aria-pressed={sp2.on} style={{ color: "var(--ink)" }}>
                            {sp2.label}
                          </button>
                          </Fragment>
                        ))}
                      </div>
                    </div>
                    {" "}
                    <div className="cg-row">
                      <span>
                        <b>
                          Get spicier each round
                        </b>
                        <div className="muted" style={{ fontSize: "12.5px" }}>
                          Mild → Spicy → Unhinged keeps people hooked
                        </div>
                      </span>
                      <button className="switch" role="switch" aria-checked={v.escStr} aria-label="Escalate spice" onClick={v.toggleEsc} />
                    </div>
                    {" "}
                  </div>
                  {" "}
                  <div className="sec-h">
                    <h2 style={{ fontSize: "18px" }}>
                      Card packs
                    </h2>
                    <span className="muted" style={{ fontSize: "12.5px" }}>
                      {v.packCount}{" on"}
                    </span>
                  </div>
                  {" "}
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                    {" "}
                    {(v.packs || []).map((pk, i0) => (
                      <Fragment key={i0}>
                      <button className={`chip tap cg-pack ${pk.cls}`} onClick={pk.pick} aria-pressed={pk.on} disabled={!!(pk.locked)}>
                        {pk.label}
                      </button>
                      </Fragment>
                    ))}
                    {" "}
                  </div>
                  {" "}
                  <div className="sec-h">
                    <h2 style={{ fontSize: "18px" }}>
                      {v.gname}{" rules"}
                    </h2>
                  </div>
                  {" "}
                  <div className="card" style={{ padding: "4px 16px" }}>
                    {" "}
                    {(v.special || []).map((sx, i0) => (
                      <Fragment key={i0}>
                      {" "}
                      <div className="cg-row">
                        <span>
                          <b>
                            {sx.label}
                          </b>
                          <div className="muted" style={{ fontSize: "12.5px" }}>
                            {sx.hint}
                          </div>
                        </span>
                        <button className="switch" role="switch" aria-checked={sx.on} aria-label={sx.label} onClick={sx.toggle} />
                      </div>
                      {" "}
                      </Fragment>
                    ))}
                    {" "}
                    {v.isPoll ? (
                      <>
                      {" "}
                      <div className="cg-row" style={{ display: "block" }}>
                        {" "}
                        <b>
                          Your first poll
                        </b>
                        {" "}
                        <input className="field" value={v.pollQ ?? ""} onChange={v.onPollQ} aria-label="Poll question" style={{ marginTop: "8px", minHeight: "46px" }} />
                        {" "}
                        {(v.pollOpts || []).map((po, i0) => (
                          <Fragment key={i0}>
                          <div className="cg-poll">
                            <input className="field" value={po.text ?? ""} onChange={po.edit} aria-label={`Option ${po.n}`} style={{ minHeight: "42px", fontSize: "15px" }} />
                            <button className="icon-btn tap" onClick={po.remove} aria-label={`Remove option ${po.n}`} style={{ width: "42px", height: "42px" }}>
                              ×
                            </button>
                          </div>
                          </Fragment>
                        ))}
                        {" "}
                        <button className="btn btn-sm tap" onClick={v.addPollOpt} disabled={!!(v.pollFull)} style={{ marginTop: "8px" }}>
                          + Add option
                        </button>
                        {" "}
                      </div>
                      {" "}
                      </>
                    ) : null}
                    {" "}
                  </div>
                  {" "}
                </section>
                {" "}
                </>
              ) : null}
              {" "}
              {v.s3 ? (
                <>
                {" "}
                <section className="rise">
                  {" "}
                  <h2 style={{ fontSize: "24px" }}>
                    Choose the table
                  </h2>
                  {" "}
                  <p className="muted" style={{ marginTop: "4px", fontSize: "14.5px" }}>
                    Where your crew sits. Drag the preview to look around.
                  </p>
                  {" "}
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: "10px", marginTop: "14px" }}>
                    {" "}
                    {(v.scenes || []).map((scn, i0) => (
                      <Fragment key={i0}>
                      {" "}
                      <button className="cg-scene tap" onClick={scn.pick} aria-pressed={scn.on} style={{ background: scn.sky }}>
                        <i style={{ background: scn.table }} />
                        <span style={{ position: "relative" }}>
                          {scn.name}
                        </span>
                      </button>
                      {" "}
                      </Fragment>
                    ))}
                    {" "}
                  </div>
                  {" "}
                  <div className="card" style={{ padding: "4px 16px", marginTop: "12px" }}>
                    {" "}
                    <div className="cg-row" style={{ display: "block" }}>
                      <b>
                        Table shape
                      </b>
                      <div className="seg" style={{ marginTop: "8px" }}>
                        {(v.shapes || []).map((sh, i0) => (
                          <Fragment key={i0}>
                          <button onClick={sh.pick} aria-pressed={sh.on} style={{ color: "var(--ink)" }}>
                            {sh.label}
                          </button>
                          </Fragment>
                        ))}
                      </div>
                    </div>
                    {" "}
                    <div className="cg-row">
                      <span>
                        <b>
                          Ambient sound
                        </b>
                        <div className="muted" style={{ fontSize: "12.5px" }}>
                          Soft room tone and a drumroll on reveals
                        </div>
                      </span>
                      <button className="switch" role="switch" aria-checked={v.soundStr} aria-label="Ambient sound" onClick={v.toggleSound} />
                    </div>
                    {" "}
                  </div>
                  {" "}
                </section>
                {" "}
                </>
              ) : null}
              {" "}
              {v.s4 ? (
                <>
                {" "}
                <section className="rise">
                  {" "}
                  <h2 style={{ fontSize: "24px" }}>
                    Ready to open?
                  </h2>
                  {" "}
                  <div className="card" style={{ padding: "16px", marginTop: "12px" }}>
                    {" "}
                    <div className="row">
                      <img src={v.gicon} alt="" style={{ width: "44px", height: "44px" }} />
                      <span style={{ flex: "1" }}>
                        <b className="d" style={{ fontSize: "20px", display: "block" }}>
                          {v.room}
                        </b>
                        <span className="muted" style={{ fontSize: "13px" }}>
                          {v.gname}{" · "}{v.sceneName}
                        </span>
                      </span>
                    </div>
                    {" "}
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", marginTop: "12px" }}>
                      {(v.summary || []).map((su, i0) => (
                        <Fragment key={i0}>
                        <span className="pill">
                          {su}
                        </span>
                        </Fragment>
                      ))}
                    </div>
                    {" "}
                  </div>
                  {" "}
                  <div className="card" style={{ padding: "4px 16px", marginTop: "12px" }}>
                    {" "}
                    <div className="cg-row" style={{ display: "block" }}>
                      <b>
                        When
                      </b>
                      <div className="seg" style={{ marginTop: "8px" }}>
                        {(v.whenOpts || []).map((wh, i0) => (
                          <Fragment key={i0}>
                          <button onClick={wh.pick} aria-pressed={wh.on} style={{ color: "var(--ink)" }}>
                            {wh.label}
                          </button>
                          </Fragment>
                        ))}
                      </div>
                    </div>
                    {" "}
                  </div>
                  {" "}
                  <div className="card" style={{ padding: "12px 14px", marginTop: "12px", display: "flex", gap: "10px", alignItems: "center", fontSize: "13.5px", lineHeight: "1.4" }}>
                    {" "}
                    <img src="/sk/shushing_face.png" alt="" style={{ width: "30px", height: "30px", flex: "none" }} />
                    {" "}
                    <span>
                      You host as a nickname too. Nobody sees that you made the room. Players can report each other, same warning rules as links.
                    </span>
                    {" "}
                  </div>
                  {" "}
                </section>
                {" "}
                </>
              ) : null}
              {" "}
            </div>
            {" "}
            <div className="cg-prev">
              {" "}
              <section className="g3" aria-label="Table preview" onPointerDown={v.orbStart} onPointerMove={v.orbMove} onPointerUp={v.orbEnd} onPointerLeave={v.orbEnd}>
                {" "}
                <div className="g3-sky" style={{ background: v.sc.sky }} />
                {" "}
                <div className="g3-glow" style={{ background: v.sc.glow }} />
                {" "}
                <div className="g3-hud">
                  <span className="g3-chip">
                    {v.room}
                  </span>
                  <span className="g3-chip">
                    {v.max}{" seats"}
                  </span>
                </div>
                {" "}
                <div className="g3-cam">
                  {" "}
                  <div className="g3-floor" style={{ backgroundImage: v.sc.floor }} />
                  {" "}
                  <div className="g3-table" style={{ background: v.sc.table, borderRadius: v.tableRadius, transform: v.tableTransform }} />
                  {" "}
                  <div className="g3-at" style={{ transform: "translate3d(0, 40px, 0)" }}>
                    <div className="g3-bb">
                      <div className="g3-holo g3-flip" style={{ marginBottom: "14px" }}>
                        <img src={v.gicon} alt="" style={{ width: "26px", height: "26px" }} />
                        <b>
                          {v.gname}
                        </b>
                        <span style={{ fontSize: "11px", fontWeight: "700", opacity: ".85" }}>
                          {v.spiceLabel}
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
                          <div className="g3-head" style={{ background: p.color }}>
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
                  {v.sceneName}{" · drag to look around"}
                </div>
                {" "}
              </section>
              {" "}
            </div>
            {" "}
          </div>
          {" "}
        </div>
        {" "}
        <div className="cg-foot">
          <div>
            {" "}
            {v.hasBack ? (
              <>
              <button className="btn btn-lg tap" onClick={v.back}>
                {"← "}{v.backLabel}
              </button>
              </>
            ) : null}
            {" "}
            {v.notLast ? (
              <>
              <button className="btn btn-cta btn-lg tap" onClick={v.next} style={{ flex: "1" }}>
                {v.nextLabel}{" →"}
              </button>
              </>
            ) : null}
            {" "}
            {v.isLast ? (
              <>
              <button onClick={v.openRoom} className="btn btn-cta btn-lg tap" style={{ flex: "1" }}>
                {v.openLabel}
              </button>
              </>
            ) : null}
            {" "}
          </div>
        </div>
        {" "}
      </div>
      {" "}
      </>
    );
  }
}
