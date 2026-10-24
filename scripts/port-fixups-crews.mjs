// Crews wiring: real crews (saved from game tables), RSVPs, inside jokes, and the daily crew question.
// Same rules as port-fixups.mjs. Images are /sk/ paths when these run.

const between = (start, end, replacement) => (src) => {
  const a = src.indexOf(start), b = src.indexOf(end, a + start.length);
  if (a < 0 || b < 0) throw new Error("crews fixup: can't find " + (a < 0 ? start : end).slice(0, 50));
  return src.slice(0, a) + replacement + src.slice(b);
};
const line = (re, replacement) => (src) => {
  if (!re.test(src)) throw new Error("crews fixup: no match for " + re);
  return src.replace(re, replacement);
};

export const CREW_FIXUPS = {
  // props: crews (from loadCrews), pick (crew id), fresh ({ code, game, players } from a game table), create, rsvp, addJoke
  Crews: [
    between(
      `    try {\n      m = window.localStorage.getItem('sk-mode');\n      pickName`,
      `    var names = [`,
      `    fresh = props.fresh || null;\n`,
    ),
    [`    var names = ['Hostel B gang', 'Class of 2027', 'Sunday brunch crew'];`, `    var ids = (props.crews || []).map(function (c) { return c.id; }), pickName = props.pick || null;`],
    [`crew: Math.max(0, names.indexOf(pickName)), tab: 0, rsvp: 0,`, `crew: Math.max(0, ids.indexOf(pickName)), tab: 0, rsvp: {},`],
    between(
      `    var C = [\n`,
      `\n    var c = C[s.crew] || C[0];`,
      `    var C = (this.props.crews || []).slice();
    if (!C.length) C.push({ id: '', name: 'No crews yet', icon: '/sk/sparkles.png', bg: 'radial-gradient(130% 110% at 100% 0%,#5be0a0 0%,#127a80 50%,#0a2b3a 100%)', who: ['You'], streak: 0, nightTitle: 'Save a game table as a crew', nightSub: 'Play a game, then tap “Save this table as a crew”', myRsvp: -1, going: 0, invite: '', board: [{ n: 'You', pts: 0, title: 'New to the crew' }], history: [], jokes: [] });`,
    ),
    [`    var going = Math.max(1, c.who.length - 2) - 1 + (s.rsvp === 0 ? 1 : 0);`, `    var myR = s.rsvp[c.id] !== undefined ? s.rsvp[c.id] : c.myRsvp;\n    var going = c.going + (myR === 0 && c.myRsvp !== 0 ? 1 : 0) - (myR !== 0 && c.myRsvp === 0 ? 1 : 0);`],
    between(`    var J = s.extra.concat([\n`, `\n    ]);`, `    var J = s.extra.filter(function (j) { return j.crew === c.id; }).concat(c.jokes || [`),
    [`copyInvite: function () { try { navigator.clipboard.writeText('https://sekretly.com/crew/invite'); } catch (e) {} self.setState({ copied: true }); },`, `copyInvite: function () { if (!c.invite) return; try { navigator.clipboard.writeText(c.invite); } catch (e) {} self.setState({ copied: true }); },`],
    [
      `rsvp: ['Going', 'Maybe', 'Can’t'].map(function (n, i) { return { name: n, on: s.rsvp === i ? 'true' : 'false', pick: function () { self.setState({ rsvp: i }); } }; }),`,
      `rsvp: ['Going', 'Maybe', 'Can’t'].map(function (n, i) { return { name: n, on: myR === i ? 'true' : 'false', pick: function () { if (!c.id) return; var r = Object.assign({}, s.rsvp); r[c.id] = i; self.setState({ rsvp: r }); self.props.rsvp(c.id, i); } }; }),`,
    ],
    line(/      board: c\.who\.map\(function \(n, k\) \{ return \{ n: n, pts: 1240 - k \* 110[^\n]*\n/, `      board: (c.board || []).map(function (b, k) {\n`),
    line(/        return \{ rank: k \+ 1, n: b\.n, i: b\.n\.charAt\(0\), c: COL\[c\.who\.indexOf\(b\.n\) % COL\.length\], pts: b\.pts, title: titles\[b\.n\] \|\| 'New to the crew',/, `        return { rank: k + 1, n: b.n, i: b.n.charAt(0), c: COL[c.who.indexOf(b.n) % COL.length], pts: b.pts, title: b.title,`),
    between(`      history: [\n`, `\n      ],\n      draft:`, `      history: c.history || [], sampleHistory: [`),
    [
      `self.setState({ extra: [{ text: s.draft.trim(), from: 'pinned by you · just now', fresh: true }].concat(s.extra), draft: '' }); },`,
      `if (!c.id) return; self.props.addJoke(c.id, s.draft.trim()); self.setState({ extra: [{ crew: c.id, text: s.draft.trim(), from: 'pinned by you · just now', fresh: true }].concat(s.extra), draft: '' }); },`,
    ],
    between(
      `      createCrew: function () {`,
      `\n    };\n  }\n}`,
      `      createCrew: function () {
        if (s.creating) return;
        self.setState({ creating: true });
        self.props.create({ name: s.newName.trim() || 'Friday table', code: (self.props.fresh || {}).code || '', invite: s.players.filter(function (k) { return s.inv[k]; }) }).then(function (r) {
          if (r && r.ok) window.location.href = '/crews?pick=' + r.id + '&saved=1';
          else self.setState({ creating: false });
        });
      }`,
    ),
  ],

  // props: crew { id, name, day, question, members [{ id, name, icon, tint, done, me }], myPick, results [{ name, icon, tint, votes }], whys [], revealed }, vote(crewId, pick, why)
  CrewDaily: [
    [`this.state = { mode: m || props.mode || 'dark', phase: props.phase || 'answer', pick: -1, why: '', left: 1 * 3600 + 58 * 60 + 40, nudged: {} };`, `var X = props.crew || {};\n    this.state = { mode: m || props.mode || 'dark', phase: X.revealed ? 'reveal' : X.myPick ? 'wait' : 'answer', pick: -1, why: '', left: X.secondsLeft || 0, nudged: {} };`],
    [`    if (prev.phase !== this.props.phase && this.props.phase) this.setState({ phase: this.props.phase });`, ``],
    between(`    var M = [\n`, `\n    var meDone =`, `    var X = this.props.crew || { members: [], results: [], whys: [] };\n    var M = X.members;`),
    [`var maxV = 3;`, `var maxV = Math.max(1, X.results.reduce(function (a, r) { return Math.max(a, r.votes); }, 0));`],
    [`<div class="muted" style="font-size: 13px">Class of 2027 · day 9</div>`, `<div class="muted" style="font-size: 13px">{{crewName}}</div>`],
    [`>Who here becomes famous first?</h1>`, `>{{question}}</h1>`],
    [`pick: function () { self.setState({ pick: i }); } }; }),`, `pick: function () { self.setState({ pick: i }); } }; }), crewName: X.name, question: X.question,`],
    [`submit: function () { if (s.pick >= 0) self.setState({ phase: 'wait' }); },`, `submit: function () { if (s.pick < 0) return; var t = M.filter(function (m) { return !m.me; })[s.pick]; self.setState({ phase: 'wait' }); self.props.vote(X.id, t.id, s.why); },`],
    [`myPick: s.pick >= 0 ? M.filter(function (m) { return !m.me; })[s.pick].name : 'Moon',`, `myPick: s.pick >= 0 ? M.filter(function (m) { return !m.me; })[s.pick].name : (X.myPick || ''),`],
    [`<button class="btn btn-block tap" onClick="{{reveal}}" style="margin-top: 12px">Preview the 9pm reveal</button>`, ``],
    [`      results: M.filter(function (m) { return m.votes > 0; })`, `      whys: X.whys || [],\n      results: X.results.filter(function (m) { return m.votes > 0; })`],
    line(
      /            <div class="card" style="padding: 12px 14px; font-size: 14\.5px">"Moon’s cooking videos[\s\S]*?Fox\. Podcast\. Calling it now\."<\/div>/,
      `            <sc-for list="{{whys}}" as="wy" hint-placeholder-count="3"><div class="card" style="padding: 12px 14px; font-size: 14.5px">“{{wy}}”</div></sc-for>`,
    ),
    line(/<span>Crew streak: day 9\. Moon’s win was pinned to Inside jokes\.<\/span>/, `<span>Tomorrow brings a new question at the same time.</span>`),
  ],
};
