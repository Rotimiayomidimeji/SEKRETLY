// Link builders: the owner's own title and intro for every link, a quiz that starts ready (option 1 is the answer
// until another is ticked, 1 to 25 questions), and Rate me with the owner's own questions, rated one at a time.
// Same rules as port-fixups.mjs; these run after port-fixups-polish.mjs.

const line = (re, replacement) => (src) => {
  if (!re.test(src)) throw new Error("builders fixup: no match for " + re);
  return src.replace(re, replacement);
};

export const BUILDER_FIXUPS = {
  // props added: initial.copy { [topic]: { title, intro } }, initial.rateQs (edit mode); save() also gets title, intro, rate
  Create: [
    // ---- quiz
    (src) => {
      if (!src.includes("right: -1 }")) throw new Error("builders: no right: -1");
      return src.split("right: -1 }").join("right: 0 }");
    },
    [`var quizValid = ready === Q.length && Q.length >= 3;`, `var quizValid = ready === Q.length && Q.length >= 1;`],
    [`canRemove: Q.length > 3,`, `canRemove: Q.length > 1,`],
    [`canAddQ: Q.length < 10, addLabel: '+ Add a question (' + Q.length + '/10)',`, `canAddQ: Q.length < 25, addLabel: '+ Add a question (' + Q.length + '/25)',`],
    [`(3 to 10 questions).'`, `(1 to 25 questions).'`],
    [
      `Write questions about you, add options, then tap ✓ on the right answer. Friends guess and get a score.`,
      `Write questions about you and their options. Option 1 is the right answer until you tap ✓ on another. Friends get a score out of how many you ask.`,
    ],

    // ---- state: the owner's own words per topic, and what visitors rate
    [
      `      quiz: this.starter(), openQ: 0, swapN: 0, toast: null };`,
      `      quiz: this.starter(), openQ: 0, swapN: 0, toast: null, copy: {}, rateQs: ['Rate my looks', 'Rate my vibe', 'Rate my style', 'Rate me as a friend'], rateOwn: '' };`,
    ],
    [
      `    var STEPS = isQuiz ? ['topic', 'quiz', 'theme', 'limits', 'share'] : ['topic', 'theme', 'limits', 'share'];`,
      `    var isRate = tp.id === 'rate-me';
    var STEPS = isQuiz ? ['topic', 'quiz', 'theme', 'limits', 'share'] : isRate ? ['topic', 'rate', 'theme', 'limits', 'share'] : ['topic', 'theme', 'limits', 'share'];
    // what visitors read at the top of the link page: the topic's words until the owner writes their own
    var INTRO = { 'describe-3': 'Tap three words that sum me up. That’s it.', 'know-me': 'Questions about me. Get your score, see the leaderboard.', confess: 'Say the whole thing. Nobody will know it was you.', 'rate-me': 'Rate me on each one, 1 to 10. Add why if you’re brave.', ama: 'Any question. I answer, you stay unknown.', custom: 'No rules. Just write.' };
    var cp = s.copy[tp.id] || {};
    var titleVal = cp.title !== undefined ? cp.title : tp.title, introVal = cp.intro !== undefined ? cp.intro : INTRO[tp.id];
    var setCopy = function (k, v) { var c = Object.assign({}, s.copy), o = Object.assign({}, c[tp.id] || {}); o[k] = v; c[tp.id] = o; self.setState({ copy: c }); };
    // rating builder: grouped ready-made questions plus the owner's own, in the order picked
    var RS = [
      ['Looks & style', ['Rate my looks', 'Rate my smile', 'Rate my style', 'Rate my hair', 'Rate my pictures', 'Rate my Sunday fit']],
      ['Personality', ['Rate my vibe', 'Rate my sense of humour', 'Rate my energy', 'How kind am I?', 'How honest am I?', 'Rate my confidence']],
      ['As a friend', ['Rate me as a friend', 'How loyal am I?', 'Can I keep a secret?', 'Rate my advice', 'How fast do I reply?']],
      ['Love & dating', ['Rate me as a partner', 'Rate my rizz', 'Rate my texting game', 'How romantic am I?', 'Would you date me?']],
      ['Skills & taste', ['Rate my cooking', 'Rate my dance moves', 'Rate my singing', 'Rate my music taste', 'Rate my fashion sense']],
      ['Life', ['Rate my hustle', 'How organised am I?', 'Am I ever on time?', 'Rate my social media', 'Rate my glow-up']]
    ];
    var preset = [].concat.apply([], RS.map(function (g) { return g[1]; }));
    var ownQs = s.rateQs.filter(function (t) { return preset.indexOf(t) < 0; });`,
    ],
    [`var TITLES = { theme: 'Pick a theme',`, `var TITLES = { rate: 'What they rate', theme: 'Pick a theme',`],
    [
      `var cantNext = (cur === 'topic' && isCustom && !s.custom.trim()) || (cur === 'quiz' && !quizValid);`,
      `var cantNext = (cur === 'topic' && isCustom && !s.custom.trim()) || (cur === 'quiz' && !quizValid) || (cur === 'rate' && !s.rateQs.length);`,
    ],
    [
      `topicTitle: isCustom ? (s.custom.trim() || 'Your question here') : tp.title, topicHint: tp.hint,`,
      `topicTitle: isCustom ? (s.custom.trim() || 'Your question here') : (titleVal.trim() || tp.title), topicHint: introVal.trim() || INTRO[tp.id],`,
    ],
    [
      `<div style="font-size: 11px; font-weight: 800; opacity: .85; margin-bottom: 6px">They’re rating you</div>`,
      `<div style="font-size: 11px; font-weight: 800; opacity: .85; margin-bottom: 6px">{{pvRateQ}}</div>`,
    ],
    [
      `      isCustom: isCustom, custom: s.custom,`,
      `      notCustom: !isCustom, titleVal: titleVal, introVal: introVal, titleDefault: tp.title, introDefault: INTRO[tp.id],
      onTitle: function (e) { setCopy('title', e.target.value.slice(0, 60)); }, onIntro: function (e) { setCopy('intro', e.target.value.slice(0, 120)); },
      resetCopy: function () { var c = Object.assign({}, s.copy); delete c[tp.id]; self.setState({ copy: c }); }, copyEdited: !!s.copy[tp.id],
      sRate: cur === 'rate', pvRateQ: s.rateQs[0] || 'They’re rating you',
      rateGroups: RS.concat(ownQs.length ? [['Your own', ownQs]] : []).map(function (g) {
        return { name: g[0], items: g[1].map(function (t) {
          var idx = s.rateQs.indexOf(t), on = idx >= 0;
          return { label: (on ? (idx + 1) + ' · ' : '') + t, on: on ? 'true' : 'false', cls: on ? 'on' : '', pick: function () {
            var n = s.rateQs.slice();
            if (on) n.splice(idx, 1); else if (n.length < 12) n.push(t); else { self.flash('Up to 12 questions'); return; }
            self.setState({ rateQs: n });
          } };
        }) };
      }),
      rateOwn: s.rateOwn, onRateOwn: function (e) { self.setState({ rateOwn: e.target.value.slice(0, 60) }); },
      addRateOwn: function () {
        var t = s.rateOwn.trim();
        if (t.length < 3) { self.flash('Write your question first'); return; }
        if (s.rateQs.indexOf(t) >= 0) { self.setState({ rateOwn: '' }); return; }
        if (s.rateQs.length >= 12) { self.flash('Up to 12 questions'); return; }
        self.setState({ rateQs: s.rateQs.concat([t]), rateOwn: '' });
      },
      rateNote: s.rateQs.length ? s.rateQs.length + (s.rateQs.length === 1 ? ' question' : ' questions') + ' picked. Friends rate each one from 1 to 10, in this order, and you see the average.' : 'Pick at least one question.',
      isCustom: isCustom, custom: s.custom,`,
    ],
    [
      `: null\n          }, step + 1);`,
      `: null,
            rate: isRate ? s.rateQs : null,
            title: isCustom || titleVal.trim() === tp.title ? '' : titleVal.trim(),
            intro: introVal.trim() === INTRO[tp.id] ? '' : introVal.trim()
          }, step + 1);`,
    ],

    // ---- markup: "Make it yours" under the topics, and the rating step
    [
      `                <p class="hint">{{customLeft}} characters left. Friends answer in a free text box.</p>
              </div>
            </sc-if>`,
      `                <p class="hint">{{customLeft}} characters left. Friends answer in a free text box.</p>
              </div>
            </sc-if>
            <div class="card" style="padding: 14px; margin-top: 12px">
              <div class="row"><b style="flex: 1; font-size: 15px">Make it yours</b><sc-if value="{{copyEdited}}" hint-placeholder-val="{{ false }}"><button class="btn btn-sm btn-ghost tap" onClick="{{resetCopy}}">Use suggestion</button></sc-if></div>
              <p class="muted" style="font-size: 13px; margin-top: 2px">What friends read at the top of your link. Change any word.</p>
              <sc-if value="{{notCustom}}" hint-placeholder-val="{{ true }}">
                <div><label for="cr-title" class="label" style="margin-top: 10px">Title</label>
                <input id="cr-title" class="field" value="{{titleVal}}" onChange="{{onTitle}}" maxlength="60" placeholder="{{titleDefault}}"></div>
              </sc-if>
              <label for="cr-intro" class="label" style="margin-top: 10px">Intro line</label>
              <input id="cr-intro" class="field" value="{{introVal}}" onChange="{{onIntro}}" maxlength="120" placeholder="{{introDefault}}">
            </div>`,
    ],
    [
      `        <sc-if value="{{sLimits}}" hint-placeholder-val="{{ false }}">`,
      `        <sc-if value="{{sRate}}" hint-placeholder-val="{{ false }}">
          <div>
            <p class="muted" style="margin-bottom: 4px; font-size: 15px">Pick what friends rate you on. They see one question at a time and tap 1 to 10.</p>
            <sc-for list="{{rateGroups}}" as="g" hint-placeholder-count="6">
              <div style="margin-top: 14px">
                <b style="font-size: 14px">{{g.name}}</b>
                <div style="display: flex; flex-wrap: wrap; gap: 8px; margin-top: 8px">
                  <sc-for list="{{g.items}}" as="it" hint-placeholder-count="5"><button class="chip tap {{it.cls}}" onClick="{{it.pick}}" aria-pressed="{{it.on}}">{{it.label}}</button></sc-for>
                </div>
              </div>
            </sc-for>
            <label for="cr-rate-own" class="label" style="margin-top: 16px">Write your own</label>
            <div style="display: flex; gap: 8px">
              <input id="cr-rate-own" class="field" value="{{rateOwn}}" onChange="{{onRateOwn}}" maxlength="60" placeholder="e.g. Rate my jollof" style="flex: 1; min-width: 0">
              <button class="btn tap" onClick="{{addRateOwn}}">Add</button>
            </div>
            <p class="hint" style="margin-top: 8px">{{rateNote}}</p>
          </div>
        </sc-if>

        <sc-if value="{{sLimits}}" hint-placeholder-val="{{ false }}">`,
    ],
  ],

  // props added: title, intro (the owner's words, else the topic's), rateQs [question] (Rate me, in order)
  Main: [
    [
      `    var tp = TP[topic];`,
      `    var tp = Object.assign({}, TP[topic]);
    if (this.props.title) tp.title = this.props.title;
    if (this.props.intro) tp.sub = this.props.intro;
    // Rate me: one question at a time (older links without their own questions get one overall question)
    var RQ = this.props.rateQs && this.props.rateQs.length ? this.props.rateQs : ['Rate me overall'];`,
    ],
    [`sub: 'You’re rating @' + OWNER + '. Pick a number, add why if you’re brave.',`, `sub: 'Rate me on each one, 1 to 10. Add why if you’re brave.',`],
    [`return { words: [], deckSeed: 0, ownWord: '', rate: null, rateCat: 'Overall',`, `return { words: [], deckSeed: 0, ownWord: '', rate: null, rates: [], ri: 0, slide: 'a', rateCat: 'Overall',`],
    // the score shown is the current question's pick, or the average once every question is rated
    [
      `    var rv = s.rate || 0;`,
      `    var rates = s.rates || [], ri = Math.min(s.ri || 0, RQ.length - 1);
    var rateDone = RQ.every(function (q, k) { return !!rates[k]; }) && s.ri >= RQ.length;
    var avg = rates.length ? rates.reduce(function (a, b) { return a + (b || 0); }, 0) / RQ.length : 0;
    var rv = rateDone ? Math.round(avg) : (rates[ri] || 0);`,
    ],
    line(/topic === 'rate' \? !!s\.rate :/, `topic === 'rate' ? rateDone :`),
    line(/topic === 'rate' \? 'Tap a number f[^']*'/, `topic === 'rate' ? 'Rate every question first'`),
    [
      `topic === 'rate' ? rv + '/10' + (trimmed ? ' · ' + s.text.trim() : '')`,
      `topic === 'rate' ? (Math.round(avg * 10) / 10) + '/10' + (trimmed ? ' · ' + s.text.trim() : '')`,
    ],
    line(
      /topic === 'rate' \? \{ score: s\.rate \|\| undefined, category: s\.rateCat, text: s\.text \}/,
      `topic === 'rate' ? { scores: RQ.map(function (q, k) { return rates[k] || 0; }), text: s.text }`,
    ),
    [`(s.rate ? 'Send my ' + rv + '/10' : 'Send rating')`, `(rateDone ? 'Send my ' + (Math.round(avg * 10) / 10) + '/10' : 'Send rating')`],
    [`rateShown: rv ? rv : '–',`, `rateShown: rateDone ? Math.round(avg * 10) / 10 : (rv ? rv : '–'),`],
    [`showSendArea: topic !== 'quiz' || quizDone,`, `showSendArea: (topic !== 'quiz' || quizDone) && (topic !== 'rate' || rateDone),`],
    // tapping a number moves to the next question (with a slide); after the last, the summary and the send box
    line(
      /      tiles: \[1, 2, 3, 4, 5, 6, 7, 8, 9, 10\]\.map\(function \(n\) \{ var a = s\.rate === n;[^\n]*\n/,
      `      tiles: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(function (n) { var a = rates[ri] === n; return { n: n, on: a ? 'true' : 'false', bg: a ? hue(n) : th.chipBg, ink: a ? '#120a16' : th.ink, line: a ? hue(n) : th.cardLine, pick: function () {
        var r = rates.slice(); r[ri] = n;
        self.setState({ rates: r, rate: n });
        clearTimeout(self.rt);
        self.rt = setTimeout(function () { self.setState({ ri: ri + 1, slide: self.state.slide === 'a' ? 'b' : 'a' }); }, 380);
      } }; }),
      rateQ: RQ[ri], rateStep: 'Question ' + (ri + 1) + ' of ' + RQ.length, rateSlide: 'lp-slide-' + (s.slide || 'a'),
      rateMany: RQ.length > 1, rateDone: rateDone, rating: !rateDone,
      rateDots: RQ.map(function (q, k) { return k < ri || rateDone ? hue(rates[k] || 5) : k === ri ? th.ink : th.cardLine; }),
      rateBack: ri > 0 && !rateDone, rateBackGo: function () { clearTimeout(self.rt); self.setState({ ri: Math.max(0, ri - 1), slide: self.state.slide === 'a' ? 'b' : 'a' }); },
      rateAvg: Math.round(avg * 10) / 10,
      rateSum: RQ.map(function (q, k) { return { q: q, n: rates[k] || '–', c: hue(rates[k] || 5) }; }),
      rateAgain: function () { self.setState({ ri: 0, slide: self.state.slide === 'a' ? 'b' : 'a' }); },
`,
    ),
    // markup: the question in place of the category chips; the summary when all are rated
    line(
      /                <div class="lp-k" style="color: \{\{th\.muted\}\}; padding: 14px 2px 8px">Rate their…<\/div>\n                <div class="lp-chips"[\s\S]*?<\/sc-for>\n                <\/div>\n/,
      `                <sc-if value="{{rating}}" hint-placeholder-val="{{ true }}">
                  <div class="{{rateSlide}}">
                    <sc-if value="{{rateMany}}" hint-placeholder-val="{{ true }}"><div style="display: flex; gap: 4px; margin-top: 14px"><sc-for list="{{rateDots}}" as="rd" hint-placeholder-count="4"><span style="flex: 1; height: 5px; border-radius: 5px; background: {{rd}}; transition: background .3s"></span></sc-for></div></sc-if>
                    <div class="lp-k" style="color: {{th.muted}}; padding: 12px 2px 4px">{{rateStep}}</div>
                    <div style="font-size: 24px; font-weight: 800; line-height: 1.15; letter-spacing: -.02em; padding: 0 2px 10px">{{rateQ}}</div>
                  </div>
                </sc-if>
                <sc-if value="{{rateDone}}" hint-placeholder-val="{{ false }}">
                  <div class="lp-slide-a" style="margin-top: 14px">
                    <div class="lp-k" style="color: {{th.muted}}; padding: 0 2px 8px">Your ratings</div>
                    <sc-for list="{{rateSum}}" as="rs" hint-placeholder-count="4"><div style="display: flex; align-items: center; gap: 10px; padding: 8px 2px; border-bottom: 1px solid {{th.cardLine}}"><span style="flex: 1; font-weight: 700; font-size: 15px">{{rs.q}}</span><b style="font-size: 18px; color: {{rs.c}}">{{rs.n}}</b></div></sc-for>
                    <button class="lp-chip" onClick="{{rateAgain}}" style="margin-top: 10px; min-height: 36px; padding: 0 14px; border-radius: 999px; border: 1px solid {{th.cardLine}}; background: {{th.chipBg}}; color: {{th.ink}}; font-weight: 800; font-size: 13px">Change my ratings</button>
                  </div>
                </sc-if>
`,
    ),
    line(
      /(                <div class="lp-tiles" role="radiogroup" aria-label="Score from 1 to 10" style="margin-top: 6px">\n[\s\S]*?<\/div>\n)/,
      `                <sc-if value="{{rating}}" hint-placeholder-val="{{ true }}"><div>
$1                <sc-if value="{{rateBack}}" hint-placeholder-val="{{ false }}"><button class="lp-chip" onClick="{{rateBackGo}}" style="margin-top: 10px; min-height: 36px; padding: 0 14px; border-radius: 999px; border: 1px solid {{th.cardLine}}; background: transparent; color: {{th.ink}}; font-weight: 800; font-size: 13px">← Previous question</button></sc-if>
                </div></sc-if>
`,
    ),
  ],
};
