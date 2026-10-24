// @ts-nocheck -- ported 1:1 from design/mockup/Create.dc.html by scripts/port-mockup.mjs; typed as it gets wired to real data
"use client";

import React, { Fragment } from "react";
import { saveMode, SkLink, route } from "@/lib/sk/runtime";


export default class Create extends React.Component<Record<string, any>, any> {
  static defaultProps = {"mode":"dark","topic":"describe-3"};

  constructor(props) {
    super(props);
    var m = null; // light/dark arrives as props.mode from the sk-mode cookie
    this.state = { mode: m || props.mode || 'dark', step: 0, theme: 'sunset', topic: props.topic || 'describe-3', custom: '', limMsg: false, msgN: 50, limTime: true, time: '24 hours', copied: false,
      quiz: this.starter(), openQ: 0, swapN: 0, toast: null };
    if (props.initial) Object.assign(this.state, props.initial, { quiz: props.initial.quiz || this.starter() });
  }
  // My links › Edit leaves { id, topic, theme } in sk-linkedit and stamps sk-nav
  editArrive() {
    var e = null;
    try { e = JSON.parse(window.localStorage.getItem('sk-linkedit') || 'null'); window.localStorage.removeItem('sk-linkedit'); this.nav = window.localStorage.getItem('sk-nav') || ''; } catch (x) { this.nav = ''; }
    return e ? { editing: e.id, topic: e.topic, theme: e.theme, step: 0, copied: false } : { editing: null };
  }
  componentDidMount() {
    var self = this;
    this.onStore = function (e) { if (e.key === 'sk-mode' && e.newValue) self.setState({ mode: e.newValue }); };
    try { window.addEventListener('storage', this.onStore); } catch (e) {}
  }
  componentWillUnmount() { clearInterval(this.nt); try { window.removeEventListener('storage', this.onStore); } catch (e) {} clearTimeout(this.tt); }
  componentDidUpdate(prev) {
    if (prev.mode !== this.props.mode && this.props.mode) this.setState({ mode: this.props.mode });
    if (prev.topic !== this.props.topic && this.props.topic) this.setState({ topic: this.props.topic, step: 0 });
  }
  // ready-made questions the owner can drop in (they still write the options and mark the answer)
  ideas() {
    return ['What’s my go-to food?', 'Where am I on a Friday night?', 'What’s my love language?', 'Who’s my celebrity crush?', 'What annoys me the most?', 'What’s my dream country?', 'My worst habit?', 'Which song is always on repeat?', 'What would I never eat?', 'My comfort show?', 'Morning person or night owl?', 'What scares me most?'];
  }
  starter() {
    return [
      { text: 'What’s my go-to food?', opts: ['Jollof rice', 'Suya', 'Amala', 'Indomie'], right: 1 },
      { text: 'Where am I on a Friday night?', opts: ['At an owambe', 'In bed by 10', 'At the club', 'Church vigil'], right: 1 },
      { text: 'What’s my love language?', opts: ['Words', 'Gifts', 'Quality time', 'Acts of service'], right: -1 },
      { text: 'Who’s my celebrity crush?', opts: ['Tems', 'Burna Boy', 'Ayra Starr', 'Rema'], right: -1 },
      { text: 'What annoys me the most?', opts: ['Late replies', 'Loud chewing', 'Liars', ''], right: -1 }
    ];
  }
  // saves through the server; the share step then shows the real address
  submit(input, nextStep) {
    var self = this;
    if (this.state.saving) return;
    this.setState({ saving: true });
    this.props.save(input).then(function (r) {
      if (r && r.ok) self.setState({ saving: false, step: nextStep, url: r.url, path: r.path, copied: false });
      else { self.setState({ saving: false }); self.flash((r && r.error) || 'Couldn’t save. Try again.'); }
    });
  }
  // WhatsApp gets the link as a message; elsewhere the phone's share sheet (or the clipboard) does it.
  // Posting the story card as an image arrives with the Share studio.
  share(kind) {
    var url = 'https://' + this.state.url;
    if (kind === 'wa') { window.open('https://wa.me/?text=' + encodeURIComponent('Send me an anonymous message 👀 ' + url), '_blank', 'noopener'); return; }
    if (navigator.share) { navigator.share({ title: 'Sekretly', text: 'Send me an anonymous message 👀', url: url }).catch(function () {}); return; }
    try { navigator.clipboard.writeText(url); } catch (e) {}
    this.flash('Link copied. Paste it in your story.');
  }
  flash(t) { var self = this; clearTimeout(this.tt); this.setState({ toast: t }); this.tt = setTimeout(function () { self.setState({ toast: null }); }, 1800); }
  renderVals() {
    var self = this, s = this.state, dark = s.mode !== 'light';
    var E = { shush: '/sk/shushing_face.png', peach: '/sk/peach.png', moon: '/sk/crescent_moon.png', unicorn: '/sk/unicorn.png', fire: '/sk/fire.png', octopus: '/sk/octopus.png', sparkles: '/sk/sparkles.png', ghost: '/sk/ghost.png', letter: '/sk/love_letter.png', crown: '/sk/crown_3d.png' };
    var T = [['default', 'Default', E.shush], ['sunset', 'Sunset', E.peach], ['midnight', 'Midnight', E.moon], ['bubblegum', 'Bubblegum', E.unicorn], ['neon', 'Neon', E.fire], ['ocean', 'Ocean', E.octopus]];
    var th = T.filter(function (t) { return t[0] === s.theme; })[0];
    var TP = [
      { id: 'describe-3', title: 'Describe me in 3 words', sub: 'Friends tap 3 words that sum you up', hint: 'Tap 3 words. That’s it.', story: 'sum me up in 3 words', send: 'Send my 3 words', emoji: E.sparkles, pv: 'describe' },
      { id: 'know-me', title: 'How well do you know me?', sub: 'You write a quiz, friends guess and get a score', hint: 'Answer my questions. See your score.', story: 'take my quiz, if you dare', send: 'See my score', emoji: E.crown, pv: 'quiz', isNew: true },
      { id: 'confess', title: 'Confess something', sub: 'A blank page for long, honest messages', hint: 'Say the whole thing. Nobody will know.', story: 'tell me anything, anonymously', send: 'Send confession', emoji: E.shush, pv: 'confess' },
      { id: 'rate-me', title: 'Rate me 1–10', sub: 'Friends tap a number and say why', hint: 'You’re rating me. Be honest.', story: 'rate me, anonymously', send: 'Send my rating', emoji: E.fire, pv: 'rate' },
      { id: 'ama', title: 'Ask me anything', sub: 'Questions you answer on your story', hint: 'Any question. I answer, you stay unknown.', story: 'ask me anything', send: 'Ask anonymously', emoji: E.ghost, pv: 'ask' },
      { id: 'custom', title: 'Custom topic', sub: 'Write your own question', hint: 'Answer anonymously.', story: 'send me anonymous messages', send: 'Send anonymously', emoji: E.letter, pv: 'ask' }
    ];
    var tp = TP.filter(function (t) { return t.id === s.topic; })[0] || TP[0];
    var isCustom = tp.id === 'custom', isQuiz = tp.id === 'know-me';
    var line = dark ? 'rgba(255,255,255,.12)' : 'rgba(48,34,72,.14)';
    // steps depend on the topic: the quiz adds "Write your quiz"
    var STEPS = isQuiz ? ['topic', 'quiz', 'theme', 'limits', 'share'] : ['topic', 'theme', 'limits', 'share'];
    var TITLES = { theme: 'Pick a theme', topic: 'Pick a topic', quiz: 'Write your quiz', limits: 'Set limits', share: 'Share it' };
    var step = Math.min(s.step, STEPS.length - 1), cur = STEPS[step];
    // quiz validity: question text, at least 2 options, a marked answer that has text
    var Q = s.quiz;
    var qOk = function (q) { var filled = q.opts.filter(function (o) { return o.trim(); }).length; return q.text.trim().length > 3 && filled >= 2 && q.right >= 0 && !!q.opts[q.right].trim(); };
    var ready = Q.filter(qOk).length;
    var quizValid = ready === Q.length && Q.length >= 3;
    var setQ = function (i, patch) { var nq = Q.map(function (q, k) { return k === i ? Object.assign({}, q, patch) : q; }); self.setState({ quiz: nq }); };
    var cantNext = (cur === 'topic' && isCustom && !s.custom.trim()) || (cur === 'quiz' && !quizValid);
    var firstBad = Q.map(qOk).indexOf(false);
    var save = function () {
      try { if (isQuiz) window.localStorage.setItem('sk-quiz', JSON.stringify(Q.map(function (q) { return [q.text.trim(), q.opts.filter(function (o) { return o.trim(); }), q.opts.filter(function (o, k) { return k < q.right && o.trim(); }).length]; }))); } catch (e) {}
    };
    var pvQ = Q[0] || { text: '', opts: [], right: -1 };
    function opt(label, active, fn) { return { label: label, on: active ? 'true' : 'false', cls: active ? 'on' : '', pick: fn }; }
    return {
      mode: dark ? 'dark' : 'light', isDark: dark, isLight: !dark, modeWord: dark ? 'Light' : 'Dark',
      toggleMode: function () { var n = dark ? 'light' : 'dark'; saveMode(n); self.setState({ mode: n }); },
      stepNo: step + 1, stepCount: STEPS.length, stepTitle: (s.editing && cur !== 'share' ? 'Edit · ' : '') + TITLES[cur],
      liveTitle: s.editing ? 'Changes saved' : 'Your link is live',
      bars: STEPS.map(function (x, i) { return { c: i <= step ? '#d81b72' : line }; }),
      thCls: 'th-' + th[0], thEmoji: th[2],
      topicTitle: isCustom ? (s.custom.trim() || 'Your question here') : tp.title, topicHint: tp.hint, storyLine: tp.story,
      pvDescribe: tp.pv === 'describe', pvQuiz: tp.pv === 'quiz', pvConfess: tp.pv === 'confess', pvRate: tp.pv === 'rate', pvAsk: tp.pv === 'ask',
      pvAskText: isCustom ? 'Type your answer…' : 'Ask me anything…', pvSend: tp.send,
      pvDots: Q.map(function (q, k) { return k === 0 ? 'rgba(255,255,255,.95)' : 'rgba(255,255,255,.25)'; }),
      pvQ: pvQ.text || 'Your first question', pvOpts: pvQ.opts.filter(function (o) { return o.trim(); }).slice(0, 4).map(function (o) { return { label: o, cls: '' }; }),
      pvTiles: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(function (n) { return { n: n, cls: n === 8 ? 'hi' : '' }; }),
      quizCount: Q.length,
      sTheme: cur === 'theme', sTopic: cur === 'topic', sQuiz: cur === 'quiz', sLimits: cur === 'limits',
      notShare: cur !== 'share', isShare: cur === 'share',
      themes: T.map(function (t) { var a = t[0] === s.theme; return { name: t[1], cls: 'th-' + t[0], emoji: t[2], on: a ? 'true' : 'false', ring: a ? '#ff3b8d' : 'transparent', pick: function () { self.setState({ theme: t[0] }); } }; }),
      topics: TP.map(function (t) { var a = t.id === tp.id; return { title: t.title, sub: t.sub, emoji: t.emoji, isNew: !!t.isNew, on: a ? 'true' : 'false', ring: a ? '#ff3b8d' : line, dot: a ? '#ff3b8d' : 'transparent', pick: function () { self.setState({ topic: t.id }); } }; }),
      isCustom: isCustom, custom: s.custom, onCustom: function (e) { self.setState({ custom: e.target.value.slice(0, 60) }); }, customLeft: 60 - s.custom.length,
      // quiz builder
      qs: Q.map(function (q, i) {
        var open = s.openQ === i, ok = qOk(q);
        var status = ok ? '✓ Answer: ' + q.opts[q.right] : (q.text.trim().length <= 3 ? 'Write the question' : q.opts.filter(function (o) { return o.trim(); }).length < 2 ? 'Add at least 2 options' : 'Tap ✓ on the right answer');
        return {
          n: i + 1, title: q.text.trim() || 'New question', status: status, statusColor: ok ? '#5be0a0' : '#ffb347',
          cls: open ? 'open' : '', open: open, openStr: open ? 'true' : 'false', rot: open ? '180deg' : '0deg',
          nBg: ok ? '#5be0a0' : 'var(--card2)', nInk: ok ? '#0f2a1c' : 'var(--ink)',
          toggle: function () { self.setState({ openQ: open ? -1 : i }); },
          text: q.text, onText: function (e) { setQ(i, { text: e.target.value.slice(0, 70) }); },
          opts: q.opts.map(function (o, k) {
            return { n: k + 1, id: 'qb-' + i + '-' + k, text: o, right: q.right === k ? 'true' : 'false',
              onText: function (e) { var no = q.opts.slice(); no[k] = e.target.value.slice(0, 28); setQ(i, { opts: no }); },
              mark: function () { if (!q.opts[k].trim()) { self.flash('Write option ' + (k + 1) + ' first'); return; } setQ(i, { right: k }); } };
          }),
          swap: function () { var I = self.ideas(), used = Q.map(function (x) { return x.text; }), n = s.swapN, pick = I[n % I.length], g = 0; while (used.indexOf(pick) >= 0 && g++ < I.length) { n++; pick = I[n % I.length]; } setQ(i, { text: pick, opts: ['', '', '', ''], right: -1 }); self.setState({ swapN: n + 1 }); },
          canRemove: Q.length > 3,
          remove: function () { self.setState({ quiz: Q.filter(function (x, k) { return k !== i; }), openQ: -1 }); }
        };
      }),
      canAddQ: Q.length < 10, addLabel: '+ Add a question (' + Q.length + '/10)',
      addQ: function () { self.setState({ quiz: Q.concat([{ text: '', opts: ['', '', '', ''], right: -1 }]), openQ: Q.length }); },
      quizNote: quizValid ? 'All ' + Q.length + ' questions are ready. Friends see them one at a time, in this order.' : ready + ' of ' + Q.length + ' ready. Every question needs at least 2 options and a ✓ answer (3 to 10 questions).',
      // limits
      limMsg: s.limMsg, limTime: s.limTime, limMsgStr: s.limMsg ? 'true' : 'false', limTimeStr: s.limTime ? 'true' : 'false',
      toggleMsg: function () { self.setState({ limMsg: !s.limMsg }); },
      toggleTime: function () { self.setState({ limTime: !s.limTime }); },
      msgSummary: s.limMsg ? 'Naps after ' + s.msgN + ' messages' : 'No limit',
      timeSummary: s.limTime ? 'Naps after ' + s.time : 'Stays open',
      msgOpts: [10, 25, 50, 100].map(function (n) { return opt(String(n), s.msgN === n, function () { self.setState({ msgN: n }); }); }),
      timeOpts: ['1 hour', '6 hours', '24 hours', '3 days', '7 days'].map(function (t) { return opt(t, s.time === t, function () { self.setState({ time: t }); }); }),
      // share
      url: s.url || '',
      copyLabel: s.copied ? 'Copied' : 'Copy', copyBg: s.copied ? '#0d7f4b' : '#d81b72',
      copy: function () { try { navigator.clipboard.writeText('https://' + s.url); } catch (e) {} self.setState({ copied: true }); self.flash('Link copied'); },
      shareWa: function () { self.share('wa'); },
      shareIg: function () { self.share(); },
      shareSc: function () { self.share(); },
      saveCard: function () { self.share(); },
      previewHref: s.path || '/',
      toast: !!s.toast, toastText: s.toast || '',
      canBack: step > 0 && cur !== 'share',
      back: function () { self.setState({ step: Math.max(0, step - 1) }); },
      next: function () {
        if (cantNext) { if (cur === 'quiz' && firstBad >= 0) { self.setState({ openQ: firstBad }); self.flash('Question ' + (firstBad + 1) + ' isn’t finished'); } return; }
        if (STEPS[step + 1] === 'share') {
          self.submit({
            id: s.editing || null, topic: tp.id, theme: s.theme, custom: s.custom,
            maxMessages: s.limMsg ? s.msgN : null, closesIn: s.limTime ? s.time : null,
            quiz: isQuiz ? Q.map(function (q) { return { text: q.text.trim(), options: q.opts.filter(function (o) { return o.trim(); }).map(function (o) { return o.trim(); }), right: q.opts.filter(function (o, k) { return k < q.right && o.trim(); }).length }; }) : null
          }, step + 1);
          return;
        }
        self.setState({ step: Math.min(STEPS.length - 1, step + 1) });
      },
      cantNext: cantNext && cur !== 'quiz', nextOpacity: cantNext ? 0.55 : 1,
      nextLabel: s.saving ? 'Saving…' : STEPS[step + 1] === 'share' ? (s.editing ? 'Save changes' : 'Create link') : cur === 'quiz' ? (quizValid ? 'Next' : ready + '/' + Q.length + ' ready') : 'Next'
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
        <div style={{ maxWidth: "1080px", margin: "0 auto", padding: "14px 18px 32px" }}>
          {" "}
          <header className="topbar" style={{ paddingBottom: "0" }}>
            {" "}
            <SkLink href="/home" aria-label="Close" className="icon-btn tap">
              {" "}
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" aria-hidden="true">
                <path d="M6 6l12 12M18 6 6 18" />
              </svg>
              {" "}
            </SkLink>
            {" "}
            <div className="grow">
              {" "}
              <div className="muted" style={{ fontSize: "13px" }}>
                {"Step "}{v.stepNo}{" of "}{v.stepCount}
              </div>
              {" "}
              <div className="d" style={{ fontSize: "20px", fontWeight: "800", letterSpacing: "-.02em" }}>
                {v.stepTitle}
              </div>
              {" "}
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
          <div style={{ display: "flex", gap: "6px", marginTop: "14px" }} aria-hidden="true">
            {" "}
            {(v.bars || []).map((b, i0) => (
              <Fragment key={i0}>
              <span style={{ flex: "1", height: "6px", borderRadius: "9px", background: b.c, transition: "background .3s" }} />
              </Fragment>
            ))}
            {" "}
          </div>
          {" "}
          <div style={{ display: "flex", flexWrap: "wrap", gap: "20px 40px", marginTop: "18px" }}>
            {" "}
            <aside className="cr-prev" style={{ flex: "1 1 320px", minWidth: "0" }}>
              {" "}
              <div className="cr-prev-in">
                {" "}
                {v.notShare ? (
                  <>
                  {" "}
                  <div className={`cr-mini ${v.thCls} pop`}>
                    {" "}
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "12.5px", fontWeight: "700" }}>
                      {" "}
                      <img src={`/sk/${v.me.avatar}.png`} alt="" style={{ width: "24px", height: "24px", borderRadius: "50%", background: "rgba(255,255,255,.3)" }} />
                      @{v.me.username}{" "}
                      <span style={{ marginLeft: "auto", fontSize: "10.5px", letterSpacing: ".08em", textTransform: "uppercase", opacity: ".8" }}>
                        Live preview
                      </span>
                      {" "}
                    </div>
                    {" "}
                    <div className="cr-ttl" style={{ marginTop: "12px" }}>
                      {v.topicTitle}
                    </div>
                    {" "}
                    <div style={{ fontSize: "12px", opacity: ".85", marginTop: "4px", maxWidth: "30ch" }}>
                      {v.topicHint}
                    </div>
                    {" "}
                    <div className="cr-box">
                      {" "}
                      {v.pvDescribe ? (
                        <>
                        {" "}
                        <div>
                          {" "}
                          <div className="cr-row" style={{ gridTemplateColumns: "repeat(3, 1fr)" }}>
                            <span className="cr-slot">
                              1
                            </span>
                            <span className="cr-slot">
                              2
                            </span>
                            <span className="cr-slot">
                              3
                            </span>
                          </div>
                          {" "}
                          <div style={{ display: "flex", flexWrap: "wrap", gap: "4px", marginTop: "8px" }}>
                            <span className="cr-pill">
                              Funny
                            </span>
                            <span className="cr-pill">
                              Loyal
                            </span>
                            <span className="cr-pill">
                              Chaotic
                            </span>
                            <span className="cr-pill">
                              Smart
                            </span>
                            <span className="cr-pill">
                              + own word
                            </span>
                          </div>
                          {" "}
                        </div>
                        {" "}
                        </>
                      ) : null}
                      {" "}
                      {v.pvQuiz ? (
                        <>
                        {" "}
                        <div>
                          {" "}
                          <div style={{ display: "flex", gap: "3px" }}>
                            {(v.pvDots || []).map((pd, i0) => (
                              <Fragment key={i0}>
                              <span style={{ flex: "1", height: "4px", borderRadius: "4px", background: pd }} />
                              </Fragment>
                            ))}
                          </div>
                          {" "}
                          <div style={{ fontSize: "12.5px", fontWeight: "800", margin: "8px 0 6px" }}>
                            {v.pvQ}
                          </div>
                          {" "}
                          <div className="cr-row">
                            {(v.pvOpts || []).map((po, i0) => (
                              <Fragment key={i0}>
                              <span className={`cr-opt ${po.cls}`}>
                                {po.label}
                              </span>
                              </Fragment>
                            ))}
                          </div>
                          {" "}
                        </div>
                        {" "}
                        </>
                      ) : null}
                      {" "}
                      {v.pvConfess ? (
                        <>
                        {" "}
                        <div>
                          <div className="cr-lines" />
                          <div style={{ display: "flex", justifyContent: "space-between", fontSize: "10.5px", fontWeight: "700", opacity: ".8", marginTop: "6px" }}>
                            <span>
                              Long ones become cards
                            </span>
                            <span>
                              0/2000
                            </span>
                          </div>
                        </div>
                        {" "}
                        </>
                      ) : null}
                      {" "}
                      {v.pvRate ? (
                        <>
                        {" "}
                        <div>
                          {" "}
                          <div style={{ fontSize: "11px", fontWeight: "800", opacity: ".85", marginBottom: "6px" }}>
                            They’re rating you
                          </div>
                          {" "}
                          <div className="cr-row" style={{ gridTemplateColumns: "repeat(5, 1fr)" }}>
                            {(v.pvTiles || []).map((pt, i0) => (
                              <Fragment key={i0}>
                              <span className={`cr-tile ${pt.cls}`}>
                                {pt.n}
                              </span>
                              </Fragment>
                            ))}
                          </div>
                          {" "}
                        </div>
                        {" "}
                        </>
                      ) : null}
                      {" "}
                      {v.pvAsk ? (
                        <>
                        {" "}
                        <div>
                          <div className="cr-bar" style={{ height: "52px", alignItems: "flex-start", paddingTop: "8px" }}>
                            {v.pvAskText}
                          </div>
                        </div>
                        {" "}
                        </>
                      ) : null}
                      {" "}
                      <div className="cr-send">
                        {v.pvSend}
                      </div>
                      {" "}
                    </div>
                    {" "}
                    <img className="float" src={v.thEmoji} alt="" style={{ position: "absolute", right: "12px", top: "40px", width: "46px", height: "46px" }} />
                    {" "}
                  </div>
                  {" "}
                  <p className="muted" style={{ marginTop: "8px", textAlign: "center", fontSize: "12.5px" }}>
                    This is what your friends see when they open your link.
                  </p>
                  {" "}
                  </>
                ) : null}
                {" "}
                {v.isShare ? (
                  <>
                  {" "}
                  <div style={{ display: "flex", justifyContent: "center" }}>
                    {" "}
                    <div className={`cr-story pop ${v.thCls}`}>
                      {" "}
                      <div style={{ display: "flex", alignItems: "center", gap: "7px", fontSize: "11.5px", fontWeight: "800", letterSpacing: ".06em" }}>
                        <span className="logo-mark" style={{ width: "22px", height: "22px", borderRadius: "7px", fontSize: "12px" }}>
                          S
                        </span>
                        SEKRETLY
                      </div>
                      {" "}
                      <img src={v.thEmoji} alt="" style={{ width: "58px", height: "58px", marginTop: "26px" }} />
                      {" "}
                      <div className="cr-ttl" style={{ marginTop: "10px" }}>
                        {v.topicTitle}
                      </div>
                      {" "}
                      <div style={{ marginTop: "6px", fontSize: "12px", opacity: ".85" }}>
                        {v.storyLine}
                      </div>
                      {" "}
                      <div className="cr-box" style={{ marginTop: "14px", padding: "8px" }}>
                        {" "}
                        {v.pvDescribe ? (
                          <>
                          <div className="cr-row" style={{ gridTemplateColumns: "repeat(3, 1fr)" }}>
                            <span className="cr-slot" style={{ height: "28px" }}>
                              ?
                            </span>
                            <span className="cr-slot" style={{ height: "28px" }}>
                              ?
                            </span>
                            <span className="cr-slot" style={{ height: "28px" }}>
                              ?
                            </span>
                          </div>
                          </>
                        ) : null}
                        {" "}
                        {v.pvQuiz ? (
                          <>
                          <div style={{ fontSize: "11.5px", fontWeight: "800", textAlign: "center" }}>
                            {v.quizCount}{" questions · beat my bestie’s score"}
                          </div>
                          </>
                        ) : null}
                        {" "}
                        {v.pvConfess ? (
                          <>
                          <div className="cr-lines" style={{ height: "40px" }} />
                          </>
                        ) : null}
                        {" "}
                        {v.pvRate ? (
                          <>
                          <div className="cr-row" style={{ gridTemplateColumns: "repeat(5, 1fr)" }}>
                            {(v.pvTiles || []).map((pt, i0) => (
                              <Fragment key={i0}>
                              <span className={`cr-tile ${pt.cls}`} style={{ height: "22px", fontSize: "10px" }}>
                                {pt.n}
                              </span>
                              </Fragment>
                            ))}
                          </div>
                          </>
                        ) : null}
                        {" "}
                        {v.pvAsk ? (
                          <>
                          <div className="cr-bar" style={{ height: "28px" }}>
                            {v.pvAskText}
                          </div>
                          </>
                        ) : null}
                        {" "}
                      </div>
                      {" "}
                      <div style={{ marginTop: "auto", padding: "9px 12px", borderRadius: "14px", background: "rgba(0,0,0,.22)", fontSize: "11.5px", fontWeight: "800", textAlign: "center" }}>
                        tap the link sticker ↑
                      </div>
                      {" "}
                    </div>
                    {" "}
                  </div>
                  {" "}
                  <p className="muted" style={{ marginTop: "10px", textAlign: "center", fontSize: "13px" }}>
                    Story card · 9:16 · Status, Stories and Snaps
                  </p>
                  {" "}
                  </>
                ) : null}
                {" "}
              </div>
              {" "}
            </aside>
            {" "}
            <section className="cr-ctrl rise" style={{ flex: "999 1 380px", minWidth: "0" }}>
              {" "}
              {v.sTheme ? (
                <>
                {" "}
                <div>
                  {" "}
                  <p className="muted" style={{ marginBottom: "12px", fontSize: "15px" }}>
                    Now pick the colours people see when they open your link.
                  </p>
                  {" "}
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: "10px" }}>
                    {" "}
                    {(v.themes || []).map((t, i0) => (
                      <Fragment key={i0}>
                      {" "}
                      <button className="tap" onClick={t.pick} aria-pressed={t.on} style={{ padding: "0", border: `3px solid ${t.ring}`, borderRadius: "22px", background: "var(--card)", overflow: "hidden", color: "var(--ink)", textAlign: "left" }}>
                        {" "}
                        <span className={t.cls} style={{ display: "grid", placeItems: "center", height: "84px" }}>
                          <img src={t.emoji} alt="" style={{ width: "44px", height: "44px" }} />
                        </span>
                        {" "}
                        <span style={{ display: "block", padding: "9px 10px", fontWeight: "800", fontSize: "14px" }}>
                          {t.name}
                        </span>
                        {" "}
                      </button>
                      {" "}
                      </Fragment>
                    ))}
                    {" "}
                  </div>
                  {" "}
                </div>
                {" "}
                </>
              ) : null}
              {" "}
              {v.sTopic ? (
                <>
                {" "}
                <div>
                  {" "}
                  <p className="muted" style={{ marginBottom: "12px", fontSize: "15px" }}>
                    What should people send you? Each topic has its own way to answer. Watch the preview change.
                  </p>
                  {" "}
                  <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                    {" "}
                    {(v.topics || []).map((tp, i0) => (
                      <Fragment key={i0}>
                      {" "}
                      <button className="tap" onClick={tp.pick} aria-pressed={tp.on} style={{ display: "flex", alignItems: "center", gap: "12px", minHeight: "64px", padding: "8px 14px", borderRadius: "18px", border: `2px solid ${tp.ring}`, background: "var(--card)", color: "var(--ink)", textAlign: "left" }}>
                        {" "}
                        <img src={tp.emoji} alt="" style={{ width: "36px", height: "36px", flex: "none" }} />
                        {" "}
                        <span style={{ flex: "1", minWidth: "0" }}>
                          <b style={{ display: "block", fontSize: "16px" }}>
                            {tp.title}
                          </b>
                          <span className="muted" style={{ display: "block", fontSize: "13px" }}>
                            {tp.sub}
                          </span>
                        </span>
                        {" "}
                        {tp.isNew ? (
                          <>
                          <span className="pill" style={{ background: "#ffd23d", color: "#1a0b14", fontSize: "11px" }}>
                            NEW
                          </span>
                          </>
                        ) : null}
                        {" "}
                        <span aria-hidden="true" style={{ width: "22px", height: "22px", borderRadius: "50%", border: `2px solid ${tp.ring}`, background: tp.dot, flex: "none" }} />
                        {" "}
                      </button>
                      {" "}
                      </Fragment>
                    ))}
                    {" "}
                  </div>
                  {" "}
                  {v.isCustom ? (
                    <>
                    {" "}
                    <div style={{ marginTop: "10px" }}>
                      {" "}
                      <label htmlFor="cr-custom" className="label">
                        Your question
                      </label>
                      {" "}
                      <input id="cr-custom" className="field" value={v.custom ?? ""} onChange={v.onCustom} maxLength="60" placeholder="e.g. Who is my secret twin?" />
                      {" "}
                      <p className="hint">
                        {v.customLeft}{" characters left. Friends answer in a free text box."}
                      </p>
                      {" "}
                    </div>
                    {" "}
                    </>
                  ) : null}
                  {" "}
                </div>
                {" "}
                </>
              ) : null}
              {" "}
              {v.sQuiz ? (
                <>
                {" "}
                <div>
                  {" "}
                  <p className="muted" style={{ marginBottom: "12px", fontSize: "15px" }}>
                    Write questions about you, add options, then tap ✓ on the right answer. Friends guess and get a score.
                  </p>
                  {" "}
                  <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                    {" "}
                    {(v.qs || []).map((q, i0) => (
                      <Fragment key={i0}>
                      {" "}
                      <div className={`qb ${q.cls}`}>
                        {" "}
                        <button className="qb-head tap" onClick={q.toggle} aria-expanded={q.openStr}>
                          {" "}
                          <span className="qb-n" style={{ background: q.nBg, color: q.nInk }}>
                            {q.n}
                          </span>
                          {" "}
                          <span style={{ flex: "1", minWidth: "0" }}>
                            <b style={{ display: "block", fontSize: "15px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                              {q.title}
                            </b>
                            <span style={{ display: "block", fontSize: "12.5px", color: q.statusColor, fontWeight: "700" }}>
                              {q.status}
                            </span>
                          </span>
                          {" "}
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={{ transform: `rotate(${q.rot})`, transition: "transform .25s" }}>
                            <path d="m6 9 6 6 6-6" />
                          </svg>
                          {" "}
                        </button>
                        {" "}
                        {q.open ? (
                          <>
                          {" "}
                          <div className="qb-body">
                            {" "}
                            <label className="sr" htmlFor={`qb-q${q.n}`}>
                              {"Question "}{q.n}
                            </label>
                            {" "}
                            <input id={`qb-q${q.n}`} className="field" value={q.text ?? ""} onChange={q.onText} maxLength="70" placeholder="Ask something about you" />
                            {" "}
                            {(q.opts || []).map((o, i2) => (
                              <Fragment key={i2}>
                              {" "}
                              <div className="qb-opt">
                                {" "}
                                <button className="qb-mark tap" onClick={o.mark} aria-pressed={o.right} aria-label={`Mark option ${o.n} as the right answer`}>
                                  ✓
                                </button>
                                {" "}
                                <label className="sr" htmlFor={o.id}>
                                  {"Option "}{o.n}
                                </label>
                                {" "}
                                <input id={o.id} className="field" value={o.text ?? ""} onChange={o.onText} maxLength="28" placeholder={`Option ${o.n}`} style={{ flex: "1", minWidth: "0", minHeight: "44px" }} />
                                {" "}
                              </div>
                              {" "}
                              </Fragment>
                            ))}
                            {" "}
                            <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginTop: "2px" }}>
                              {" "}
                              <button className="btn btn-sm tap" onClick={q.swap}>
                                Use a ready-made question
                              </button>
                              {" "}
                              {q.canRemove ? (
                                <>
                                <button className="btn btn-sm btn-ghost tap" onClick={q.remove} style={{ color: "#ff8b98" }}>
                                  Remove
                                </button>
                                </>
                              ) : null}
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
                      </Fragment>
                    ))}
                    {" "}
                  </div>
                  {" "}
                  {v.canAddQ ? (
                    <>
                    {" "}
                    <button className="btn btn-block tap" onClick={v.addQ} style={{ marginTop: "10px", borderStyle: "dashed" }}>
                      {v.addLabel}
                    </button>
                    {" "}
                    </>
                  ) : null}
                  {" "}
                  <p className="hint" style={{ marginTop: "8px" }}>
                    {v.quizNote}
                  </p>
                  {" "}
                </div>
                {" "}
                </>
              ) : null}
              {" "}
              {v.sLimits ? (
                <>
                {" "}
                <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                  {" "}
                  <p className="muted" style={{ fontSize: "15px" }}>
                    Optional. When a limit is hit your link takes a nap. Resume it anytime from My links.
                  </p>
                  {" "}
                  <div className="card" style={{ padding: "14px" }}>
                    {" "}
                    <div className="row">
                      {" "}
                      <img src="/sk/love_letter.png" alt="" style={{ width: "34px", height: "34px" }} />
                      {" "}
                      <div style={{ flex: "1" }}>
                        <b style={{ fontSize: "15px" }}>
                          Stop after a number of messages
                        </b>
                        <div className="muted" style={{ fontSize: "13px" }}>
                          {v.msgSummary}
                        </div>
                      </div>
                      {" "}
                      <button className="switch" role="switch" aria-checked={v.limMsgStr} aria-label="Message limit" onClick={v.toggleMsg} />
                      {" "}
                    </div>
                    {" "}
                    {v.limMsg ? (
                      <>
                      {" "}
                      <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginTop: "12px" }}>
                        {" "}
                        {(v.msgOpts || []).map((o, i0) => (
                          <Fragment key={i0}>
                          <button className={`chip tap ${o.cls}`} onClick={o.pick} aria-pressed={o.on}>
                            {o.label}
                          </button>
                          </Fragment>
                        ))}
                        {" "}
                      </div>
                      {" "}
                      </>
                    ) : null}
                    {" "}
                  </div>
                  {" "}
                  <div className="card" style={{ padding: "14px" }}>
                    {" "}
                    <div className="row">
                      {" "}
                      <img src="/sk/hourglass_not_done.png" alt="" style={{ width: "34px", height: "34px" }} />
                      {" "}
                      <div style={{ flex: "1" }}>
                        <b style={{ fontSize: "15px" }}>
                          Stop after a time
                        </b>
                        <div className="muted" style={{ fontSize: "13px" }}>
                          {v.timeSummary}
                        </div>
                      </div>
                      {" "}
                      <button className="switch" role="switch" aria-checked={v.limTimeStr} aria-label="Time limit" onClick={v.toggleTime} />
                      {" "}
                    </div>
                    {" "}
                    {v.limTime ? (
                      <>
                      {" "}
                      <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginTop: "12px" }}>
                        {" "}
                        {(v.timeOpts || []).map((o, i0) => (
                          <Fragment key={i0}>
                          <button className={`chip tap ${o.cls}`} onClick={o.pick} aria-pressed={o.on}>
                            {o.label}
                          </button>
                          </Fragment>
                        ))}
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
                </>
              ) : null}
              {" "}
              {v.isShare ? (
                <>
                {" "}
                <div>
                  {" "}
                  <div className="row">
                    {" "}
                    <img className="pop" src="/sk/sparkles.png" alt="" style={{ width: "48px", height: "48px" }} />
                    {" "}
                    <div>
                      <div className="d" style={{ fontSize: "24px", fontWeight: "800", letterSpacing: "-.02em", lineHeight: "1" }}>
                        {v.liveTitle}
                      </div>
                      <div className="muted" style={{ fontSize: "14px", marginTop: "4px" }}>
                        Drop it where your people are.
                      </div>
                    </div>
                    {" "}
                  </div>
                  {" "}
                  <div style={{ marginTop: "16px", display: "flex", alignItems: "center", gap: "8px", padding: "6px 6px 6px 14px", borderRadius: "18px", background: "var(--field)", border: "1px solid var(--line)" }}>
                    {" "}
                    <span style={{ flex: "1", minWidth: "0", fontSize: "14px", fontWeight: "700", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                      {v.url}
                    </span>
                    {" "}
                    <button className="btn btn-sm tap" onClick={v.copy} style={{ background: v.copyBg, color: "#ffffff", border: "0" }}>
                      {v.copyLabel}
                    </button>
                    {" "}
                  </div>
                  {" "}
                  <button className="btn btn-lg btn-block tap" onClick={v.shareWa} style={{ marginTop: "14px", background: "#128c4a", color: "#ffffff", border: "0" }}>
                    Share to WhatsApp Status
                  </button>
                  {" "}
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: "8px", marginTop: "8px" }}>
                    {" "}
                    <button className="btn tap" onClick={v.shareIg} style={{ background: "linear-gradient(135deg,#7a2ff7,#d81b72 55%,#c2410c)", color: "#ffffff", border: "0" }}>
                      Instagram
                    </button>
                    {" "}
                    <button className="btn tap" onClick={v.shareSc} style={{ background: "#fffc00", color: "#111111", border: "0" }}>
                      Snapchat
                    </button>
                    {" "}
                    <button className="btn tap" onClick={v.saveCard}>
                      Save card
                    </button>
                    {" "}
                  </div>
                  {" "}
                  <SkLink href={route(v.previewHref)} className="btn btn-block btn-ghost tap" style={{ marginTop: "10px" }}>
                    See my link page as a friend →
                  </SkLink>
                  {" "}
                </div>
                {" "}
                </>
              ) : null}
              {" "}
              <div style={{ display: "flex", gap: "10px", marginTop: "20px" }}>
                {" "}
                {v.canBack ? (
                  <>
                  <button className="btn btn-lg tap" onClick={v.back}>
                    Back
                  </button>
                  </>
                ) : null}
                {" "}
                {v.notShare ? (
                  <>
                  <button className="btn btn-cta btn-lg tap" onClick={v.next} disabled={!!(v.cantNext)} style={{ flex: "1", opacity: v.nextOpacity }}>
                    {v.nextLabel}
                  </button>
                  </>
                ) : null}
                {" "}
                {v.isShare ? (
                  <>
                  <SkLink href="/links" className="btn btn-cta btn-lg tap" style={{ flex: "1" }}>
                    Done
                  </SkLink>
                  </>
                ) : null}
                {" "}
              </div>
              {" "}
            </section>
            {" "}
          </div>
          {" "}
        </div>
        {" "}
        {v.toast ? (
          <>
          <div className="cr-toast" role="status">
            {v.toastText}
          </div>
          </>
        ) : null}
        {" "}
      </div>
      {" "}
      </>
    );
  }
}
