// Phase 6 wiring: real multiplayer rooms. The game screens follow the server's live table (features/games/engine);
// the lobbies, Create game, the hub and the join screens use real rooms (features/games/actions).
// Same rules as port-fixups.mjs: [exact mockup text, replacement] pairs, or functions. Images are /sk/ paths by now.

const between = (start, end, replacement) => (src) => {
  const a = src.indexOf(start), b = src.indexOf(end, a + start.length);
  if (a < 0 || b < 0) throw new Error("games fixup: can't find " + (a < 0 ? start : end).slice(0, 50));
  return src.slice(0, a) + replacement + src.slice(b);
};
const line = (re, replacement) => (src) => {
  if (!re.test(src)) throw new Error("games fixup: no match for " + re);
  return src.replace(re, replacement);
};

// ---- the table (same engine in all six game screens)
// props: code, view (room view), role ("host" | "player"), load(code), move(code, type, value), tick(code), host(code, type, value)
const ENGINE = [
  // who's at the table, the settings and "me" come from the room, not browser storage
  between(
    `  load() {`,
    `  cups() {`,
    `  load() {
    var v = this.props.view || {}, st = v.settings || {}, me = v.me || {};
    this.myNick = me.nick || 'You'; this.nick = this.myNick; this.nickColor = me.color || '#ffd23d';
    this.seats = (v.state && v.state.seats) || (v.players || []).map(function (p) { return { nick: p.nick, color: p.color }; });
    this.n = this.seats.length || 2;
    this.laps = st.laps || 1; this.timer = st.timer || 15;
    this.spiceStart = { mild: 0, spicy: 1, unhinged: 2 }[st.spice] || 0; this.esc = st.esc !== false;
    this.special = st.special || {}; this.packs = st.packs || [];
    this.guest = false; this.late = false; this.room = v.name || '';
  }
`,
  ),
  // seats in the room's order (the same on every phone); this phone's player is "MangoMoon" inside the engine
  between(`  P() {`, `  // turn order:`, `  P() { var me = this.myNick; return (this.seats || []).map(function (p) { return [p.nick === me ? 'MangoMoon' : p.nick, p.color]; }); }\n`),
  // poll options name real players, identical on every phone
  [`    var names = this.inGame().filter(function (n) { return n !== 'MangoMoon'; });`, `    var me = this.myNick, names = this.inGame().map(function (n) { return n === 'MangoMoon' ? me : n; });`],
  // the other players' answers are the real ones the server collected
  between(`  others(k) {`, `  prompt(k) {`, `  others(k) { return this.serverOthers || {}; }\n`),
  // every local move also goes to the server; the server's table is applied without echoing back
  [
    `    this.state = this.fresh(m || props.mode || 'dark');\n`,
    `    this.state = this.fresh(m || props.mode || 'dark');
    var base = this.setState.bind(this), self = this;
    this.setState = function (p, cb) { if (!self.syncing && p && typeof p === 'object') self.forward(p); return base(p, cb); };
`,
  ],
  [
    `  cups() {`,
    `  toNick(v) { return v === 'MangoMoon' ? this.myNick : v; }
  forward(p) {
    var code = this.props.code, s = this.state, self = this;
    var send = function (type, value) { self.props.move(code, type, value).then(function (r) { if (r && !r.ok && r.error) self.flash(r.error, '', ''); self.poll(); }); };
    if (p.card !== undefined && p.card !== null && p.phase === 'answer') send('pick', { card: p.card, own: s.own });
    if (p.mine !== undefined && p.mine !== null) send('answer', this.toNick(p.mine));
    if (p.guessPick !== undefined && p.guessPick !== null) send('guess', this.toNick(p.guessPick));
    if (p.choice && p.phase === 'act') send('choose', p.choice);
    if (p.didIt && p.phase === 'answer') send('did', p.didIt);
    if (p.kicked && p.kicked.length > s.kicked.length) this.props.host(code, 'kick', this.toNick(p.kicked[p.kicked.length - 1]));
    if (p.phase === 'over') this.props.host(code, 'end');
    if (p.paused !== undefined && p.paused !== s.paused) this.props.host(code, 'pause', p.paused);
  }
  poll() {
    var self = this;
    if (this.polling) return;
    this.polling = true;
    this.props.load(this.props.code).then(function (v) { self.polling = false; if (v) self.apply(v); }).catch(function () { self.polling = false; });
  }
  apply(v) {
    var self = this, st = v.state, me = this.myNick;
    this.skew = Date.now() - v.now;
    if (!st || v.version === this.version) return;
    this.version = v.version; this.table = st; this.seats = st.seats; this.n = st.seats.length;
    var toInt = function (n) { return n === me ? 'MangoMoon' : n; };
    var keys = function (o) { var r = {}; Object.keys(o || {}).forEach(function (k) { r[toInt(k)] = typeof o[k] === 'string' ? toInt(o[k]) : o[k]; }); return r; };
    var tallies = { scores: keys(st.scores), lives: keys(st.lives), catches: keys(st.catches), crowns: keys(st.crowns), chickens: keys(st.chickens) };
    var patch = { k: st.k, phase: st.phase, card: st.card, own: st.own || '', choice: st.choice, didIt: st.didIt, paused: st.paused, kicked: st.kicked.map(toInt) };
    if (st.k !== this.state.k) Object.assign(patch, { mine: null, guessPick: null, answers: null, last: null });
    var mine = st.answers[me], guess = st.guesses[me];
    if (mine !== undefined) patch.mine = toInt(mine);
    if (guess !== undefined) patch.guessPick = toInt(guess);
    var reveal = st.phase === 'reveal' && this.resolvedK !== st.k;
    if (!reveal) Object.assign(patch, tallies);
    this.syncing = true;
    this.setState(patch, function () {
      if (reveal) {
        // the reveal uses everyone's real answers; the totals are the server's
        self.resolvedK = st.k; self.serverOthers = keys(st.answers);
        self.syncing = true; self.resolve(); self.setState(tallies); self.syncing = false;
      }
    });
    this.syncing = false;
  }
  cups() {`,
  ],
  // the clock follows the server; when a phase's time is up, ask the server to move the table on
  between(
    `  tick() {`,
    `  resolve() {`,
    `  tick() {
    var st = this.table;
    if (!st) return;
    var now = Date.now() - (this.skew || 0);
    this.syncing = true; this.setState({ t: st.paused ? this.state.t : Math.max(0, (now - st.phaseAt) / 1000) }); this.syncing = false;
    if (!st.paused && st.phase !== 'over' && now >= st.deadline && this.asked !== this.version) { this.asked = this.version; this.props.tick(this.props.code); }
  }
`,
  ),
  [`    this.tk = setInterval(function () { self.tick(); }, 500);`, `    this.tk = setInterval(function () { self.tick(); }, 500);\n    this.pl = setInterval(function () { self.poll(); }, 1000);\n    this.apply(this.props.view || {});`],
  [`clearInterval(this.tk); clearTimeout(this.tt); }`, `clearInterval(this.tk); clearInterval(this.pl); clearTimeout(this.tt); }`],
  // scoreboards show real nicknames, including your own
  [`    var s = this.state, id = this.game();\n    return this.P().filter(`, `    var s = this.state, id = this.game(), myNick = this.myNick;\n    return this.P().filter(`],
  [`      return { name: nm, color: p[1], score: score, label: label };`, `      return { name: nm === 'MangoMoon' ? myNick : nm, color: p[1], score: score, label: label };`],
];

// ---- lobbies (same in all six)
// props: code, view, load(code), start(code), reroll(code), origin
const LOBBY = (gid) => [
  [`    var role = this.role(), host = role === 'host';`, `    var V = this.state.view || this.props.view || { players: [], me: null, max: 6, name: '', code: '', settings: {} };
    var role = V.me && V.me.isHost ? 'host' : 'player', host = role === 'host';
    s = Object.assign({}, s, { joined: (V.players || []).length });`],
  line(/    if \(jn && jn\.room\) gm = [^\n]*\n    else if \(this\.picked[^\n]*\n/, `    gm = Object.assign({}, gm, { room: V.name || gm.room });\n`),
  line(/    var max = this\.picked && this\.picked\.game === gid && this\.picked\.max [^\n]*\n/, `    var max = V.max || 6; this.max = max;\n`),
  between(`    var NICK = [`, `    var crew = [`, `    var me = V.me ? [V.me.nick, V.me.color] : ['You', '#ffd23d'];\n`),
  line(/    var crew = \[\[[^\n]*\n/, `    var crew = (V.players || []).filter(function (p) { return !p.me; }).map(function (p) { return [p.nick, p.color]; });\n`),
  line(/    var settings = this\.picked && [^\n]*\n/, `    var S = V.settings || {}, settings = [(max * (S.laps || 1)) + ' turns', { mild: 'Mild', spicy: 'Spicy', unhinged: 'Unhinged' }[S.spice || 'mild'] + (S.esc === false ? '' : ' → Unhinged'), (S.timer || 15) + 's turns', 'Up to ' + max, V.isPublic ? 'Public link' : 'Friends only', gm.sc.name];\n`),
  // friends drop in for real: poll the room; when the host starts, everyone goes to the table
  between(
    `    this.tk = setInterval(function () {`,
    `  componentWillUnmount()`,
    `    this.tk = setInterval(function () {
      self.props.load(self.props.code).then(function (v) {
        if (!v) return;
        if (v.status !== 'LOBBY') { window.location.href = '/g/' + v.code; return; }
        self.setState({ view: v });
      });
    }, 1500);
  }
`,
  ),
  [`<a href="{{roomHref}}" onClick="{{enter}}" class="btn btn-cta btn-lg btn-block tap">{{startLabel}}</a>`, `<button onClick="{{startNow}}" class="btn btn-cta btn-lg btn-block tap">{{startLabel}}</button>`],
  [
    `      enter: function () { hand(); },`,
    `      enter: function () { hand(); },
      startNow: function () { self.props.start(self.props.code).then(function (r) { if (r && r.ok) window.location.href = '/g/' + self.props.code; else self.flash((r && r.error) || 'Couldn’t start', '', gm.icon); }); },`,
  ],
  line(/      copy: function \(\) \{ self\.setState\(\{ copied: true \}\); self\.flash\('Link copied', 'sekretly\.com\/g\/K7Q2', gm\.icon\); \},/,
    `      copy: function () { var u = (self.props.origin || '') + '/join/' + self.props.code; try { navigator.clipboard.writeText(u); } catch (e) {} self.setState({ copied: true }); self.flash('Link copied', u.replace(/^https?:\\/\\//, ''), gm.icon); },`),
  line(/      reroll: function \(\) \{ if \(s\.rerolls > 0\) self\.setState\(\{ nick: s\.nick \+ 1, rerolls: s\.rerolls - 1 \}\); \},/,
    `      reroll: function () { if (s.rerolls > 0) { self.setState({ rerolls: s.rerolls - 1 }); self.props.reroll(self.props.code).then(function () { return self.props.load(self.props.code); }).then(function (v) { if (v) self.setState({ view: v }); }); } },`),
  [`var gid = '${gid}';`, `var gid = '${gid}';`],
];

export const GAME_FIXUPS = {
  NHIE: ENGINE, TruthDare: ENGINE, WYR: ENGINE, MostLikely: ENGINE, HotTakes: ENGINE, Polls: ENGINE,
  NHIELobby: LOBBY("nhie"), TruthDareLobby: LOBBY("tod"), WYRLobby: LOBBY("wyr"), MostLikelyLobby: LOBBY("mlt"), HotTakesLobby: LOBBY("hot"), PollsLobby: LOBBY("poll"),

  // props: game (from ?game=), create(settings)
  CreateGame: [
    // the table's shape as two plain style properties (the converter reads property: value pairs)
    [`style="background: {{sc.table}}; {{tableShape}}"`, `style="background: {{sc.table}}; border-radius: {{tableRadius}}; transform: {{tableTransform}}"`],
    line(/tableShape: s\.shape === 'long' \? [^\n]*?: '',/, `tableRadius: s.shape === 'long' ? '999px' : '', tableTransform: s.shape === 'long' ? 'scaleX(1.25) scaleY(.75)' : '',`),
    // the game picked in the hub arrives in the address, not browser storage
    line(/    try \{\n      crew = window\.localStorage[\s\S]*?\} catch \(e\) \{ this\.nav = ''; \}\n/, `    this.nav = '';\n`),
    line(/    this\.tk = setInterval\(function \(\) \{ var nv = ''; try \{ nv = window\.localStorage\.getItem\('sk-nav'\)[^\n]*\n/, ``),
    [`<a href="{{lobbyHref}}" onClick="{{open}}" class="btn btn-cta btn-lg tap" style="flex: 1">{{openLabel}}</a>`, `<button onClick="{{openRoom}}" class="btn btn-cta btn-lg tap" style="flex: 1">{{openLabel}}</button>`],
    [
      `      lobbyHref: LOBBY[s.game] + '.dc.html',`,
      `      lobbyHref: LOBBY[s.game] + '.dc.html',
      openRoom: function () {
        if (s.opening) return;
        self.setState({ opening: true });
        self.props.create({ game: s.game, name: (room || 'Game night').slice(0, 40), max: s.max, laps: s.laps, timer: s.timer, spice: s.spice, esc: s.esc, special: s.special || {}, packs: packsOn, isPublic: s.join !== 'friends', pollQ: s.pollQ, pollOpts: s.pollOpts }).then(function (r) {
          if (r && r.ok) { window.location.href = '/g/' + r.code + '/lobby'; return; }
          self.setState({ opening: false }); window.alert((r && r.error) || 'Couldn’t open the room.');
        });
      },`,
    ],
  ],

  // props: rooms (open public rooms), crews
  GamesHub: [
    between(`    var O = [\n`, `\n    var gById`, `    var O = this.props.rooms || [];`),
    line(/href: \{ nhie: 'NHIELobbyJoin', [^}]*\}\[o\.g\] \+ '\.dc\.html' \};/, `href: '/join/' + o.code };`),
    [`href="NHIELobbyJoin.dc.html" onClick="{{joinCode}}"`, `href="{{codeHref}}"`],
    [`codeOk: s.code.length >= 5,`, `codeOk: s.code.length >= 5, codeHref: '/join/' + s.code,`],
    [`href="CreateGame.dc.html" onClick="{{g.pick}}"`, `href="{{g.newHref}}"`],
    line(/games: G\.map\(function \(g\) \{ return Object\.assign\(\{ tint: 'var\(--card2\)' \}, g, \{/, `games: G.map(function (g) { return Object.assign({ tint: 'var(--card2)' }, g, { newHref: '/games/new?game=' + g.id,`),
  ],

  // props: game, state ("open" | "started" | "full"), room, seated, max, join(nick)
  JoinPublic: [
    [`var gm = GM[this.props.game] || GM.nhie;`, `var gm = Object.assign({}, GM[this.props.game] || GM.nhie, this.props.room ? { room: this.props.room } : {});`],
    line(/    var taken = st === 'full' \? 6 : st === 'started' \? 5 : 3;\n    var seats = \[\], n = 6, R = 182;/, `    var n = this.props.max || 6, taken = this.props.seated || 0;\n    var seats = [], R = 182;`),
    line(/seatChip: \(st === 'full' \? 6 : taken\) \+ ' \/ 6 seated',/, `seatChip: taken + ' / ' + n + ' seated',`),
    [`<a href="{{lobbyHref}}" onClick="{{enterLobby}}"`, `<a href="#" onClick="{{enterLobby}}"`],
    line(/      enterLobby: function \(\) \{[^\n]*\n/, `      enterLobby: function (e) { if (e && e.preventDefault) e.preventDefault(); if (!s.age || st !== 'open') return; self.props.join(me[0]).then(function (r) { if (r && r.ok) window.location.href = '/g/' + r.code + '/lobby'; else if (r && r.login) window.location.href = '/login?next=' + encodeURIComponent(window.location.pathname); else window.alert((r && r.error) || 'Couldn’t join.'); }); },\n`),
  ],

  // props: none needed beyond mode; joining by code goes to /join/<code>
  JoinApp: [
    [`href="NHIELobbyJoin.dc.html" onClick="{{joinCode}}"`, `href="{{codeHref}}"`],
    [`codeOk: code === 'K7Q2',`, `codeOk: code.length === 5, codeHref: '/join/' + code,`],
    [`self.setState({ code: e.target.value.replace(/[^a-z0-9]/gi, '').slice(0, 4) }); },`, `self.setState({ code: e.target.value.replace(/[^a-z0-9]/gi, '').toUpperCase().slice(0, 5) }); },`],
  ],
};
