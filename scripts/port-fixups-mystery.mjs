// Phase 3b wiring: Daily drop, Receipt, Streak, Badges and Weekly wrap read real data.
// Same rules as port-fixups.mjs: [exact mockup text, replacement] pairs (the converter stops if one is missing),
// or a function for changes a plain replacement can't express. Images are already /sk/ paths when these run.

const between = (start, end, replacement) => (src) => {
  const a = src.indexOf(start), b = src.indexOf(end, a + start.length);
  if (a < 0 || b < 0) throw new Error("fixup: can't find " + (a < 0 ? start : end).slice(0, 50));
  return src.slice(0, a) + replacement + src.slice(b);
};
/** Swaps visible text between tags: ">old<" becomes ">new<". */
const text = (from, to) => [`>${from}<`, `>${to}<`];

export const MYSTERY_FIXUPS = {
  // props: username, number, question, secondsLeft, closesLabel, drop ({ theme, self, kind, hints, url } | null),
  //        answers, taps, withHints, feed[{ text, when, hint }], streak, makeDrop(input)
  DropAnswer: [
    text("Daily drop · No. 214", "Daily drop · No. {{number}}"),
    text("@peach · today's drop", "@{{username}} · today's drop"),
    text("What's one thing people get wrong about me?", "{{question}}"),
    text("Answer anonymously · closes at 7pm tomorrow", "Answer anonymously · {{closesLabel}}"),
    text("Dropping keeps your 12-day streak going.", "{{streakLine}}"),
    text("13-day streak", "{{streakAfter}}"),
    // shown as text: a read-only input would keep its first (empty) value after the drop is made
    [`<input id="dr-link" class="field" value="sekretly.com/peach/d214" readonly="readonly" style="flex: 1; min-width: 0">`, `<div id="dr-link" class="field" style="flex: 1; min-width: 0; display: flex; align-items: center; overflow: hidden; white-space: nowrap">{{dropUrl}}</div>`],
    [`<div class="muted" style="font-size: 12.5px">with hints</div><div class="v">2</div>`, `<div class="muted" style="font-size: 12.5px">with hints</div><div class="v">{{withHints}}</div>`],
    [
      `step: props.step || 'pick', theme: 1, self: true, selfText: '', kind: true, hint: true, copied: false, left: 5 * 3600 + 41 * 60 + 2, answers: 3, taps: 41, extra: 0 };`,
      `step: props.drop ? 'live' : 'pick', theme: props.drop ? Math.max(0, ['default', 'sunset', 'midnight', 'bubblegum', 'neon', 'ocean'].indexOf(props.drop.theme)) : 1,
      self: props.drop ? !!props.drop.self : true, selfText: props.drop ? props.drop.self || '' : '', kind: props.drop ? props.drop.kind : true, hint: props.drop ? props.drop.hints : true,
      copied: false, left: props.secondsLeft || 0, answers: props.answers || 0, taps: props.taps || 0, extra: 0, url: props.drop ? props.drop.url : '', saving: false };`,
    ],
    // no pretend answers ticking in; the page refreshes with real ones
    [`      if (s.step === 'live' && s.left % 5 === 0) { n.taps = s.taps + 2; }\n`, ``],
    [`      if (s.step === 'live' && s.left % 9 === 0 && s.extra < 2) { n.extra = s.extra + 1; n.answers = s.answers + 1; }\n`, ``],
    [
      `    if (prev.step !== this.props.step && this.props.step) this.setState({ step: this.props.step });`,
      `    if (prev.answers !== this.props.answers || prev.taps !== this.props.taps) this.setState({ answers: this.props.answers || 0, taps: this.props.taps || 0 });`,
    ],
    between(`    var F = [\n`, `\n    return {`, `    var feed = (this.props.feed || []).map(function (f, k) { return { text: f.text, when: f.when, hint: f.hint, hasHint: !!f.hint, cls: k === 0 && f.when === 'just now' ? 'fresh' : '' }; });`),
    [
      `      goShare: function () { self.setState({ step: 'share' }); },`,
      `      goShare: function () {
        if (s.saving) return;
        self.setState({ saving: true });
        self.props.makeDrop({ theme: T[s.theme].name.toLowerCase(), self: s.self ? s.selfText : '', kind: s.kind, hints: s.hint }).then(function (r) {
          self.setState(r && r.ok ? { saving: false, step: 'share', url: r.url } : { saving: false });
        });
      },
      number: this.props.number, username: this.props.username, question: this.props.question, closesLabel: this.props.closesLabel,
      streakLine: this.props.drop ? 'Today’s drop is in. Your streak is safe.' : (this.props.streak ? 'Dropping keeps your ' + this.props.streak + '-day streak going.' : 'Drop today to start a streak.'),
      streakAfter: (this.props.drop ? this.props.streak : this.props.streak + 1) + '-day streak',
      dropUrl: s.url, withHints: this.props.withHints || 0,`,
    ],
    [`copy: function () { try { navigator.clipboard.writeText('https://sekretly.com/peach/d214'); } catch (e) {} self.setState({ copied: true }); },`, `copy: function () { try { navigator.clipboard.writeText('https://' + s.url); } catch (e) {} self.setState({ copied: true }); },`],
  ],

  // props: receipts (account holder's sent messages), focusId, lookup(codes), decideGuess(id, reveal), sendFollowUp(code, text)
  Receipt: [
    text("Messages you sent from this phone. Nobody, not even @peach, can link them to you.", "Messages you sent. Nobody, not even the person you sent them to, can link them to you."),
    [
      `this.state = { mode: m || props.mode || 'dark', sel: 0, code: '', decide: null, follow: '', followSent: false };`,
      `var mine = props.receipts || [];
    this.state = { mode: m || props.mode || 'dark', sel: Math.max(0, mine.findIndex(function (r) { return r.id === props.focusId; })), code: '', decide: null, follow: '', followSent: false, R: mine, err: '' };`,
    ],
    // receipts for codes saved on this phone (sent without an account) join the list after the page loads
    [
      `  componentDidMount() {\n    var self = this;`,
      `  componentDidMount() {
    var self = this;
    var codes = []; try { codes = JSON.parse(window.localStorage.getItem('sk-receipts') || '[]'); } catch (e) {}
    if (codes.length && this.props.lookup) this.props.lookup(codes).then(function (list) { self.merge(list || []); });`,
    ],
    [
      `  renderVals() {`,
      `  merge(list) {
    var have = {}; this.state.R.forEach(function (r) { have[r.code] = true; });
    this.setState({ R: this.state.R.concat(list.filter(function (r) { return !have[r.code]; })) });
  }
  renderVals() {`,
    ],
    between(
      `    var R = [\n`,
      `\n    var c = R[s.sel];`,
      `    var R = s.R.map(function (r) { return Object.assign({}, r, { steps: r.steps.map(function (st) { return { label: st.label, when: st.when, done: st.done, bg: st.done ? ok : wait, line: st.last ? 'transparent' : (st.next ? ok : 'var(--line)'), ink: st.done ? 'var(--ink)' : 'var(--muted)' }; }) }); });
    var EMPTY = { id: '', code: '—', to: 'nobody yet', topic: 'No receipts here yet', msg: 'Send someone an anonymous message and its receipt shows up here. Have a code? Enter it above.', hint: '', icon: '/sk/love_letter.png', tint: 'linear-gradient(135deg,#ff5fa2,#7a3cff)', status: '', dot: '#8f8399', steps: [], reacted: false, reactIcon: '', reactWord: '', replied: false, reply: '', guessed: false, canFollow: false };`,
    ),
    [`    var c = R[s.sel];`, `    var c = R[Math.min(s.sel, R.length - 1)] || EMPTY;`],
    [
      `lookup: function (e) { if (e && e.preventDefault) e.preventDefault(); var i = R.findIndex(function (r) { return r.code === s.code.trim(); }); if (i >= 0) self.setState({ sel: i, decide: null }); },`,
      `lookup: function (e) {
        if (e && e.preventDefault) e.preventDefault();
        var code = s.code.trim(), i = R.findIndex(function (r) { return r.code === code; });
        if (i >= 0) { self.setState({ sel: i, decide: null, err: '' }); return; }
        self.props.lookup([code]).then(function (list) {
          if (!list || !list.length) { self.setState({ err: 'No receipt with that code.' }); return; }
          try { var saved = JSON.parse(window.localStorage.getItem('sk-receipts') || '[]'); window.localStorage.setItem('sk-receipts', JSON.stringify([code].concat(saved.filter(function (x) { return x !== code; })).slice(0, 30))); } catch (x) {}
          self.merge(list); self.setState({ sel: self.state.R.length - 1, decide: null, err: '' });
        });
      },`,
    ],
    [`reveal: function () { self.setState({ decide: 'reveal' }); }, hide: function () { self.setState({ decide: 'hide' }); },`, `reveal: function () { self.setState({ decide: 'reveal' }); self.props.decideGuess(c.id, true); }, hide: function () { self.setState({ decide: 'hide' }); self.props.decideGuess(c.id, false); },`],
    [`canFollow: !s.followSent, followSent: s.followSent,`, `canFollow: !!c.canFollow && !s.followSent, followSent: s.followSent,`],
    [
      `sendFollow: function () { if (s.follow.trim()) self.setState({ followSent: true }); }`,
      `sendFollow: function () { if (!s.follow.trim()) return; self.props.sendFollowUp(c.code, s.follow).then(function (r) { self.setState(r && r.ok ? { followSent: true } : { err: (r && r.error) || 'Couldn’t send. Try again.' }); }); }`,
    ],
    [`undecided: s.decide === null, revealed: s.decide === 'reveal',`, `undecided: s.decide === null && !c.revealed, revealed: s.decide === 'reveal' || !!c.revealed,`],
  ],

  // props: current, longest, saves, savedToday, atRisk, month { name, offset, days, today, dropped[], saved[] }, avatar, spendSave()
  Streak: [
    [`<div class="d" style="font-size: 64px; font-weight: 800; line-height: .9; margin-top: 4px">12</div>`, `<div class="d" style="font-size: 64px; font-weight: 800; line-height: .9; margin-top: 4px">{{current}}</div>`],
    text("Drop today's link before 7pm tomorrow to make it 13.", "{{streakSub}}"),
    [`<button class="btn btn-sm tap" onClick="{{showRisk}}" style="margin-top: 12px">Preview: streak at risk</button>`, `<sc-if value="{{atRisk}}" hint-placeholder-val="{{ false }}"><button class="btn btn-sm tap" onClick="{{showRisk}}" style="margin-top: 12px">Your streak is at risk</button></sc-if>`],
    text("October", "{{monthName}}"),
    text("Your 12-day streak ends in 2 hours", "{{riskTitle}}"),
    [`risk: false, saves: 1, used: false };`, `risk: false, saves: props.saves || 0, used: !!props.savedToday };`],
    between(
      `    var today = 23, saved = { 17: true }, cal = [];`,
      `    var M = [`,
      `    var MO = this.props.month || { name: '', offset: 0, days: 30, today: 1, dropped: [], saved: [] }, today = MO.today, cal = [];
    var dropped = {}, saved = {}; MO.dropped.forEach(function (d) { dropped[d] = true; }); MO.saved.forEach(function (d) { saved[d] = true; });
    for (var b = 0; b < MO.offset; b++) cal.push({ n: '', label: '', bg: 'transparent', ink: 'inherit', ring: 'transparent', op: 1 });
    for (var d = 1; d <= MO.days; d++) {
      var done = !!dropped[d] && !saved[d];
      var save = !!saved[d] || (s.used && d === today && !dropped[d]);
      var bg = done ? 'linear-gradient(135deg,#ff8a2b,#ff3d6e)' : save ? '#3a6bff' : 'var(--card2)';
      cal.push({ n: d, label: MO.name + ' ' + d + (done ? ', dropped' : save ? ', save used' : ''), bg: bg, ink: (done || save) ? '#fff' : 'var(--ink)', ring: d === today ? '#ff8a2b' : 'transparent', op: d > today ? 0.45 : 1 });
    }
    var cur = this.props.current || 0, longest = this.props.longest || 0;
`,
    ),
    [`{ days: 7, reward: 'Flame badge on your profile', got: true },`, `{ days: 7, reward: 'Flame badge on your profile', got: longest >= 7 },`],
    [`{ days: 14, reward: 'Unlock the Neon link theme', got: false },`, `{ days: 14, reward: 'Unlock the Neon link theme', got: longest >= 14 },`],
    [`{ days: 30, reward: '2 extra streak saves', got: false },`, `{ days: 30, reward: '2 extra streak saves', got: longest >= 30 },`],
    [`{ days: 50, reward: 'Custom colour for your word cloud', got: false },`, `{ days: 50, reward: 'Custom colour for your word cloud', got: longest >= 50 },`],
    [`{ days: 100, reward: 'Legend frame for your avatar', got: false }`, `{ days: 100, reward: 'Legend frame for your avatar', got: longest >= 100 }`],
    [`cal: cal, doneCount: 17,`, `cal: cal, doneCount: MO.dropped.length, monthName: MO.name, current: cur, atRisk: !!this.props.atRisk && !s.used,
      streakSub: this.props.atRisk && !s.used ? 'Drop today’s link before 7pm to make it ' + (cur + 1) + '.' : cur ? 'Today is done. Come back after 7pm for the next drop.' : 'Drop today’s link to start your streak.',
      riskTitle: 'Your ' + cur + '-day streak ends at 7pm',`],
    [`state: x.got ? 'Unlocked on Oct 9' : (x.days - 12) + ' more days',`, `state: x.got ? 'Unlocked' : (x.days - cur) + ' more days',`],
    // friends' streaks arrive with crews; for now it's just you
    between(`      friends: [\n`, `\n      risk: s.risk,`, `      friends: [{ rank: 1, name: 'You', days: cur, icon: '/sk/' + (this.props.avatar || 'fox') + '.png', tint: 'linear-gradient(135deg,#d6ff6b,#22c4a0)', bg: 'rgba(255,59,141,.10)' }],`),
    [`useSave: function () { if (!s.used && s.saves > 0) self.setState({ used: true, saves: s.saves - 1 }); }`, `useSave: function () { if (!s.used && s.saves > 0) { self.setState({ used: true, saves: s.saves - 1 }); self.props.spendSave(); } }`],
  ],

  // props: badges (from badgesOf), pinned[], setPins(ids)
  Badges: [
    [`cat: 'All', open: -1, pins: ['flame7', 'detective1'] };`, `cat: 'All', open: -1, pins: props.pinned || [] };`],
    between(`    var B = [\n`, `\n    var cats =`, `    var B = (this.props.badges || []).map(function (b) { return Object.assign({}, b, { bg: G[b.bg] || G.i }); });`),
    [
      `togglePin: function () { var p = s.pins.slice(); var k = p.indexOf(cur.id); if (k >= 0) p.splice(k, 1); else if (p.length < 3) p.push(cur.id); self.setState({ pins: p }); }`,
      `togglePin: function () { var p = s.pins.slice(); var k = p.indexOf(cur.id); if (k >= 0) p.splice(k, 1); else if (p.length < 3) p.push(cur.id); self.setState({ pins: p }); self.props.setPins(p); }`,
    ],
  ],

  // props: wrap (from wrapOf), username
  WeeklyWrap: [
    text("Your week · Oct 16–22", "Your week · {{w.range}}"),
    text("Peach, your week was a lot.", "{{w.title}}"),
    [`letter-spacing: -.05em">41</div>`, `letter-spacing: -.05em">{{w.count}}</div>`],
    text("12 more than last week", "{{w.delta}}"),
    text("Busiest night: Thursday, 9pm. Exam week hits different.", "{{w.busiest}}"),
    text("chaotic", "{{w.word0}}"),
    text("stubborn", "{{w.word1}}"),
    text("unbothered", "{{w.word2}}"),
    text(`"Loyal" is still number one all time. 14 people agree.`, "{{w.allTime}}"),
    text("Drop No. 211", "{{w.topTag}}"),
    text("What would you never guess about me?", "{{w.topTitle}}"),
    text("17 answers · 4 with hints", "{{w.topLine}}"),
    text("You dropped 5 of 7 days. Your status brought in 63% of your messages.", "{{w.dropLine}}"),
    text("Fox", "{{w.bestName}}"),
    text("9 out of 10 on your quiz", "{{w.bestLine}}"),
    text("And you guessed 2 senders right. Detective level 2 unlocked.", "{{w.guessLine}}"),
    // crews come with games; until then this slide is about your streak and badges
    text("With your crews", "Your streak"),
    [`<b style="font-size: 18px">Hostel B gang</b><div style="opacity: .9">Game night · you were "Most likely to cry at a wedding"</div>`, `<b style="font-size: 18px">Daily drops</b><div style="opacity: .9">{{w.dropLine}}</div>`],
    [`<b style="font-size: 18px">Class of 2027</b><div style="opacity: .9">You answered 6 of 7 daily questions</div>`, `<b style="font-size: 18px">Badges</b><div style="opacity: .9">{{w.badgeLine}}</div>`],
    text("12-day streak. 2 badges earned.", "{{w.streakLine}}"),
    text("@peach · week 43", "@{{username}} · {{w.week}}"),
    [`margin-top: 12px">41</div>`, `margin-top: 12px">{{w.count}}</div>`],
    text("chaotic · stubborn · unbothered", "{{w.wordsLine}}"),
    text("sekretly.com/peach", "{{w.url}}"),
    [
      `      bg: BG[s.i],`,
      `      bg: BG[s.i], username: this.props.username,
      w: Object.assign({}, this.props.wrap, { word0: (this.props.wrap || {}).words ? this.props.wrap.words[0] || '' : '', word1: (this.props.wrap || {}).words ? this.props.wrap.words[1] || '' : '', word2: (this.props.wrap || {}).words ? this.props.wrap.words[2] || '' : '', wordsLine: ((this.props.wrap || {}).words || []).join(' · ') }),`,
    ],
  ],
};
