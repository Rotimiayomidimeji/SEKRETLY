// @ts-nocheck -- ported 1:1 from design/mockup/DropAnswer.dc.html by scripts/port-mockup.mjs; typed as it gets wired to real data
"use client";

import React, { Fragment } from "react";
import { saveMode, SkLink } from "@/lib/sk/runtime";


export default class DropAnswer extends React.Component<Record<string, any>, any> {
  static defaultProps = {"mode":"dark","step":"pick"};

  constructor(props) {
    super(props);
    var m = null; // light/dark arrives as props.mode from the sk-mode cookie
    this.state = { mode: m || props.mode || 'dark', step: props.drop ? 'live' : 'pick', theme: props.drop ? Math.max(0, ['default', 'sunset', 'midnight', 'bubblegum', 'neon', 'ocean'].indexOf(props.drop.theme)) : 1,
      self: props.drop ? !!props.drop.self : true, selfText: props.drop ? props.drop.self || '' : '', kind: props.drop ? props.drop.kind : true, hint: props.drop ? props.drop.hints : true,
      copied: false, left: props.secondsLeft || 0, answers: props.answers || 0, taps: props.taps || 0, extra: 0, url: props.drop ? props.drop.url : '', saving: false };
  }
  componentDidMount() {
    var self = this;
    this.onStore = function (e) { if (e.key === 'sk-mode' && e.newValue) self.setState({ mode: e.newValue }); };
    try { window.addEventListener('storage', this.onStore); } catch (e) {}
    this.tick = setInterval(function () {
      var s = self.state, n = { left: Math.max(0, s.left - 1) };
      self.setState(n);
    }, 1000);
  }
  componentWillUnmount() { try { window.removeEventListener('storage', this.onStore); } catch (e) {} clearInterval(this.tick); }
  componentDidUpdate(prev) {
    if (prev.mode !== this.props.mode && this.props.mode) this.setState({ mode: this.props.mode });
    if (prev.answers !== this.props.answers || prev.taps !== this.props.taps) this.setState({ answers: this.props.answers || 0, taps: this.props.taps || 0 });
  }
  renderVals() {
    var self = this, s = this.state, dark = s.mode !== 'light';
    var p = function (n) { return n < 10 ? '0' + n : String(n); };
    var T = [{ name: 'Default', cls: 'th-default' }, { name: 'Sunset', cls: 'th-sunset' }, { name: 'Midnight', cls: 'th-midnight' }, { name: 'Bubblegum', cls: 'th-bubblegum' }, { name: 'Neon', cls: 'th-neon' }, { name: 'Ocean', cls: 'th-ocean' }];
    var on = '#ff3b8d', off = 'var(--line)';
    var idx = { pick: 1, share: 2, live: 3 }[s.step];
    var feed = (this.props.feed || []).map(function (f, k) { return { text: f.text, when: f.when, hint: f.hint, hasHint: !!f.hint, cls: k === 0 && f.when === 'just now' ? 'fresh' : '' }; });
    return {
      mode: dark ? 'dark' : 'light',
      hh: p(Math.floor(s.left / 3600)), mm: p(Math.floor(s.left % 3600 / 60)), ss: p(s.left % 60),
      isPick: s.step === 'pick', isShare: s.step === 'share', isLive: s.step === 'live',
      stepNo: idx, s1: idx >= 1 ? on : off, s2: idx >= 2 ? on : off, s3: idx >= 3 ? on : off,
      stepTitle: { pick: 'Make it yours', share: 'Share your drop', live: 'Answers coming in' }[s.step],
      theme: T[s.theme].cls,
      themes: T.map(function (t, i) { var o = s.theme === i; return { name: t.name, cls: t.cls, on: o ? 'true' : 'false', ring: o ? '#ff3b8d' : 'transparent', pick: function () { self.setState({ theme: i }); } }; }),
      self: s.self, selfStr: s.self ? 'true' : 'false', toggleSelf: function () { self.setState({ self: !s.self }); },
      selfText: s.selfText, onSelf: function (e) { self.setState({ selfText: e.target.value.slice(0, 140) }); },
      kindStr: s.kind ? 'true' : 'false', toggleKind: function () { self.setState({ kind: !s.kind }); },
      hintStr: s.hint ? 'true' : 'false', toggleHint: function () { self.setState({ hint: !s.hint }); },
      stashDrop: function () { try { window.localStorage.setItem('sk-share', JSON.stringify(['pd', 'pc', 'pt'])); window.localStorage.setItem('sk-nav', String(Date.now())); } catch (e) {} },
      goShare: function () {
        if (s.saving) return;
        self.setState({ saving: true });
        self.props.makeDrop({ theme: T[s.theme].name.toLowerCase(), self: s.self ? s.selfText : '', kind: s.kind, hints: s.hint }).then(function (r) {
          self.setState(r && r.ok ? { saving: false, step: 'share', url: r.url } : { saving: false });
        });
      },
      number: this.props.number, username: this.props.username, question: this.props.question, closesLabel: this.props.closesLabel,
      streakLine: this.props.drop ? 'Today’s drop is in. Your streak is safe.' : (this.props.streak ? 'Dropping keeps your ' + this.props.streak + '-day streak going.' : 'Drop today to start a streak.'),
      streakAfter: (this.props.drop ? this.props.streak : this.props.streak + 1) + '-day streak',
      dropUrl: s.url, withHints: this.props.withHints || 0,
      goLive: function () { self.setState({ step: 'live' }); },
      copy: function () { try { navigator.clipboard.writeText('https://' + s.url); } catch (e) {} self.setState({ copied: true }); },
      copyLabel: s.copied ? 'Copied' : 'Copy',
      answers: s.answers, taps: s.taps, feed: feed
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
        <div className="main" style={{ paddingBottom: "40px" }}>
          {" "}
          <div className="wrap" style={{ maxWidth: "560px" }}>
            {" "}
            <header className="topbar">
              {" "}
              <SkLink href="/home" className="icon-btn tap" aria-label="Back to home">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="m15 18-6-6 6-6" />
                </svg>
              </SkLink>
              {" "}
              <div className="grow">
                {" "}
                <div className="muted" style={{ fontSize: "13px" }}>
                  {"Daily drop · No. "}{v.number}
                </div>
                {" "}
                <div className="d" style={{ fontSize: "20px", fontWeight: "800" }}>
                  {v.stepTitle}
                </div>
                {" "}
              </div>
              {" "}
              <span className="pill" style={{ background: "rgba(255,138,43,.16)", color: "var(--warn)" }}>
                {v.hh}:{v.mm}:{v.ss}{" left"}
              </span>
              {" "}
            </header>
            {" "}
            <div className="stepper" aria-label={`Step ${v.stepNo} of 3`}>
              {" "}
              <span style={{ background: v.s1 }} />
              <span style={{ background: v.s2 }} />
              <span style={{ background: v.s3 }} />
              {" "}
            </div>
            {" "}
            {v.isPick ? (
              <>
              {" "}
              <div className="rise">
                {" "}
                <article className={v.theme} style={{ marginTop: "16px", borderRadius: "28px", padding: "22px", minHeight: "260px", display: "flex", flexDirection: "column", position: "relative", overflow: "hidden" }}>
                  {" "}
                  <span style={{ alignSelf: "flex-start", fontSize: "12px", fontWeight: "800", letterSpacing: ".08em", textTransform: "uppercase", padding: "6px 10px", borderRadius: "99px", background: "rgba(0,0,0,.22)" }}>
                    @{v.username}{" · today's drop"}
                  </span>
                  {" "}
                  <h1 style={{ marginTop: "16px", fontSize: "32px", lineHeight: "1.02" }}>
                    {v.question}
                  </h1>
                  {" "}
                  <div style={{ marginTop: "auto", paddingTop: "16px", fontSize: "14px", opacity: ".9" }}>
                    {"Answer anonymously · "}{v.closesLabel}
                  </div>
                  {" "}
                  <img src="/sk/peach.png" alt="" style={{ position: "absolute", right: "14px", bottom: "14px", width: "56px", height: "56px" }} />
                  {" "}
                </article>
                {" "}
                <h2 style={{ fontSize: "17px", margin: "20px 0 10px" }}>
                  Pick a look
                </h2>
                {" "}
                <div className="rail" style={{ display: "flex", gap: "10px", margin: "0 -16px", padding: "0 16px 4px" }}>
                  {" "}
                  {(v.themes || []).map((t, i0) => (
                    <Fragment key={i0}>
                    {" "}
                    <button className={`${t.cls} tap`} onClick={t.pick} aria-pressed={t.on} aria-label={`${t.name} theme`} style={{ flex: "none", width: "64px", height: "64px", borderRadius: "20px", border: `3px solid ${t.ring}`, padding: "0" }} />
                    {" "}
                    </Fragment>
                  ))}
                  {" "}
                </div>
                {" "}
                <div className="card" style={{ marginTop: "18px", overflow: "hidden" }}>
                  {" "}
                  <div className="list-row">
                    {" "}
                    <div style={{ flex: "1" }}>
                      <b style={{ fontSize: "15px" }}>
                        Answer it yourself too
                      </b>
                      <div className="muted" style={{ fontSize: "13px" }}>
                        Your answer unlocks for people after they reply
                      </div>
                    </div>
                    {" "}
                    <button className="switch" role="switch" aria-checked={v.selfStr} aria-label="Answer it yourself too" onClick={v.toggleSelf} />
                    {" "}
                  </div>
                  {" "}
                  {v.self ? (
                    <>
                    {" "}
                    <div style={{ padding: "0 14px 14px" }}>
                      {" "}
                      <label htmlFor="dr-self" className="sr">
                        Your own answer
                      </label>
                      {" "}
                      <textarea id="dr-self" className="field" value={v.selfText ?? ""} onChange={v.onSelf} maxLength="140" style={{ minHeight: "80px" }} placeholder="People think I'm shy. I'm just choosing who gets the gist." />
                      {" "}
                    </div>
                    {" "}
                    </>
                  ) : null}
                  {" "}
                  <div className="list-row">
                    {" "}
                    <div style={{ flex: "1" }}>
                      <b style={{ fontSize: "15px" }}>
                        Kind only
                      </b>
                      <div className="muted" style={{ fontSize: "13px" }}>
                        Hold anything mean for review
                      </div>
                    </div>
                    {" "}
                    <button className="switch" role="switch" aria-checked={v.kindStr} aria-label="Kind only" onClick={v.toggleKind} />
                    {" "}
                  </div>
                  {" "}
                  <div className="list-row">
                    {" "}
                    <div style={{ flex: "1" }}>
                      <b style={{ fontSize: "15px" }}>
                        Let senders leave a hint
                      </b>
                      <div className="muted" style={{ fontSize: "13px" }}>
                        Optional clues · never their name
                      </div>
                    </div>
                    {" "}
                    <button className="switch" role="switch" aria-checked={v.hintStr} aria-label="Let senders leave a hint" onClick={v.toggleHint} />
                    {" "}
                  </div>
                  {" "}
                </div>
                {" "}
                <button className="btn btn-cta btn-lg btn-block tap" onClick={v.goShare} style={{ marginTop: "18px" }}>
                  Drop it
                </button>
                {" "}
                <p className="muted" style={{ fontSize: "13px", textAlign: "center", marginTop: "10px" }}>
                  {v.streakLine}
                </p>
                {" "}
              </div>
              {" "}
              </>
            ) : null}
            {" "}
            {v.isShare ? (
              <>
              {" "}
              <div className="rise">
                {" "}
                <div className="card pop" style={{ marginTop: "16px", padding: "18px", textAlign: "center" }}>
                  {" "}
                  <img src="/sk/fire.png" alt="" style={{ width: "56px", height: "56px" }} />
                  {" "}
                  <h2 style={{ fontSize: "24px", marginTop: "8px" }}>
                    {v.streakAfter}
                  </h2>
                  {" "}
                  <p className="muted" style={{ marginTop: "4px", fontSize: "14.5px" }}>
                    Your drop is live. Now get it in front of people.
                  </p>
                  {" "}
                </div>
                {" "}
                <label className="label" htmlFor="dr-link" style={{ marginTop: "18px" }}>
                  Your link
                </label>
                {" "}
                <div style={{ display: "flex", gap: "8px" }}>
                  {" "}
                  <div id="dr-link" className="field" style={{ flex: "1", minWidth: "0", display: "flex", alignItems: "center", overflow: "hidden", whiteSpace: "nowrap" }}>
                    {v.dropUrl}
                  </div>
                  {" "}
                  <button className="btn tap" onClick={v.copy} style={{ flex: "none" }}>
                    {v.copyLabel}
                  </button>
                  {" "}
                </div>
                {" "}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: "10px", marginTop: "14px" }}>
                  {" "}
                  <SkLink href="/share" onClick={v.stashDrop} className="btn btn-lg tap" style={{ background: "#1fa855", border: "0", color: "#fff" }}>
                    {" "}
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <circle cx="12" cy="12" r="9" strokeDasharray="4 2.6" />
                      <circle cx="12" cy="12" r="4" />
                    </svg>
                    {"Status "}
                  </SkLink>
                  {" "}
                  <SkLink href="/share" onClick={v.stashDrop} className="btn btn-lg tap" style={{ background: "linear-gradient(135deg,#f9a03c,#e4405f 50%,#8a3ab9)", border: "0", color: "#fff" }}>
                    {" "}
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
                      <rect x="3" y="3" width="18" height="18" rx="5" />
                      <circle cx="12" cy="12" r="4" />
                    </svg>
                    {"Story "}
                  </SkLink>
                  {" "}
                </div>
                {" "}
                <button className="btn btn-block tap" onClick={v.goLive} style={{ marginTop: "10px" }}>
                  I've shared it · watch answers
                </button>
                {" "}
                <div className="card" style={{ marginTop: "18px", padding: "14px", display: "flex", gap: "12px", alignItems: "flex-start" }}>
                  {" "}
                  <img src="/sk/sparkles.png" alt="" style={{ width: "34px", height: "34px", flex: "none" }} />
                  {" "}
                  <p style={{ fontSize: "14px", lineHeight: "1.45" }}>
                    <b>
                      Tip:
                    </b>
                    {" statuses posted between 7 and 9pm get the most taps. We'll nudge you once if nobody has answered by 9."}
                  </p>
                  {" "}
                </div>
                {" "}
              </div>
              {" "}
              </>
            ) : null}
            {" "}
            {v.isLive ? (
              <>
              {" "}
              <div className="rise">
                {" "}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: "10px", marginTop: "16px" }}>
                  {" "}
                  <div className="card kpi">
                    <div className="muted" style={{ fontSize: "12.5px" }}>
                      answers
                    </div>
                    <div className="v">
                      {v.answers}
                    </div>
                  </div>
                  {" "}
                  <div className="card kpi">
                    <div className="muted" style={{ fontSize: "12.5px" }}>
                      link taps
                    </div>
                    <div className="v">
                      {v.taps}
                    </div>
                  </div>
                  {" "}
                  <div className="card kpi">
                    <div className="muted" style={{ fontSize: "12.5px" }}>
                      with hints
                    </div>
                    <div className="v">
                      {v.withHints}
                    </div>
                  </div>
                  {" "}
                </div>
                {" "}
                <div className="sec-h">
                  <h2>
                    Coming in
                  </h2>
                  <span className="muted" style={{ fontSize: "13px" }}>
                    live
                  </span>
                </div>
                {" "}
                <ul style={{ listStyle: "none", margin: "0", padding: "0", display: "flex", flexDirection: "column", gap: "10px" }}>
                  {" "}
                  {(v.feed || []).map((f, i0) => (
                    <Fragment key={i0}>
                    {" "}
                    <li className={`card ${f.cls}`} style={{ padding: "14px" }}>
                      {" "}
                      <p style={{ fontSize: "15.5px", lineHeight: "1.45" }}>
                        {f.text}
                      </p>
                      {" "}
                      <div className="row" style={{ marginTop: "10px", gap: "8px", flexWrap: "wrap" }}>
                        {" "}
                        <span className="muted" style={{ fontSize: "12.5px" }}>
                          {f.when}
                        </span>
                        {" "}
                        {f.hasHint ? (
                          <>
                          <span className="pill" style={{ background: "rgba(122,60,255,.18)" }}>
                            {"Hint: "}{f.hint}
                          </span>
                          </>
                        ) : null}
                        {" "}
                        <span className="grow" style={{ flex: "1" }} />
                        {" "}
                        <SkLink href="/inbox" className="btn btn-sm tap">
                          Guess
                        </SkLink>
                        {" "}
                      </div>
                      {" "}
                    </li>
                    {" "}
                    </Fragment>
                  ))}
                  {" "}
                </ul>
                {" "}
                <SkLink href="/home" className="btn btn-block tap" style={{ marginTop: "16px" }}>
                  Back home
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
    );
  }
}
