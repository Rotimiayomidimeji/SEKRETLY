// @ts-nocheck -- ported 1:1 from design/mockup/CrewDaily.dc.html by scripts/port-mockup.mjs; typed as it gets wired to real data
"use client";

import React, { Fragment } from "react";
import { saveMode, SkLink } from "@/lib/sk/runtime";


export default class CrewDaily extends React.Component<Record<string, any>, any> {
  static defaultProps = {"mode":"dark","phase":"answer"};

  constructor(props) {
    super(props);
    var m = null; // light/dark arrives as props.mode from the sk-mode cookie
    var X = props.crew || {};
    this.state = { mode: m || props.mode || 'dark', phase: X.revealed ? 'reveal' : X.myPick ? 'wait' : 'answer', pick: -1, why: '', left: X.secondsLeft || 0, nudged: {} };
  }
  componentDidMount() {
    var self = this;
    this.onStore = function (e) { if (e.key === 'sk-mode' && e.newValue) self.setState({ mode: e.newValue }); };
    try { window.addEventListener('storage', this.onStore); } catch (e) {}
    this.tick = setInterval(function () { self.setState({ left: Math.max(0, self.state.left - 1) }); }, 1000);
  }
  componentWillUnmount() { try { window.removeEventListener('storage', this.onStore); } catch (e) {} clearInterval(this.tick); }
  componentDidUpdate(prev) {
    if (prev.mode !== this.props.mode && this.props.mode) this.setState({ mode: this.props.mode });

  }
  renderVals() {
    var self = this, s = this.state, dark = s.mode !== 'light';
    var p = function (n) { return n < 10 ? '0' + n : String(n); };
    var X = this.props.crew || { members: [], results: [], whys: [] };
    var M = X.members;
    var meDone = s.phase !== 'answer';
    var done = M.filter(function (m) { return m.done || (m.me && meDone); }).length;
    var maxV = Math.max(1, X.results.reduce(function (a, r) { return Math.max(a, r.votes); }, 0));
    return {
      mode: dark ? 'dark' : 'light',
      isAnswer: s.phase === 'answer', isWait: s.phase === 'wait', isReveal: s.phase === 'reveal',
      phaseLabel: s.phase === 'reveal' ? 'revealed' : 'reveals 9pm',
      answered: M.map(function (m) { var d = m.done || (m.me && meDone); return { name: m.name, icon: m.icon, tint: m.tint, op: d ? 1 : 0.35, label: m.name + (d ? ' answered' : ' has not answered') }; }),
      answeredText: done + ' of ' + M.length + ' answered · you see who, never what',
      members: M.filter(function (m) { return !m.me; }).map(function (m, i) { var on = s.pick === i; return { name: m.name, icon: m.icon, tint: m.tint, on: on ? 'true' : 'false', ring: on ? '#ff3b8d' : 'var(--line)', pick: function () { self.setState({ pick: i }); } }; }), crewName: X.name, question: X.question,
      why: s.why, onWhy: function (e) { self.setState({ why: e.target.value.slice(0, 140) }); },
      noPick: s.pick < 0,
      submit: function () { if (s.pick < 0) return; var t = M.filter(function (m) { return !m.me; })[s.pick]; self.setState({ phase: 'wait' }); self.props.vote(X.id, t.id, s.why); },
      myPick: s.pick >= 0 ? M.filter(function (m) { return !m.me; })[s.pick].name : (X.myPick || ''),
      hh: p(Math.floor(s.left / 3600)), mm: p(Math.floor(s.left % 3600 / 60)), ss: p(s.left % 60),
      waiting: M.filter(function (m) { return !m.done && !m.me; }).map(function (m) { var n = !!s.nudged[m.name]; return { name: m.name, icon: m.icon, tint: m.tint, nudged: n, label: n ? 'Nudged' : 'Nudge', nudge: function () { var x = Object.assign({}, s.nudged); x[m.name] = true; self.setState({ nudged: x }); } }; }),
      reveal: function () { self.setState({ phase: 'reveal' }); },
      whys: X.whys || [],
      results: X.results.filter(function (m) { return m.votes > 0; }).sort(function (a, b) { return b.votes - a.votes; }).map(function (m) { return { name: m.name, icon: m.icon, tint: m.tint, votes: m.votes, pct: Math.round(100 * m.votes / maxV) }; })
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
              <SkLink href="/crews" className="icon-btn tap" aria-label="Back to crews">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="m15 18-6-6 6-6" />
                </svg>
              </SkLink>
              {" "}
              <div className="grow">
                {" "}
                <div className="muted" style={{ fontSize: "13px" }}>
                  {v.crewName}
                </div>
                {" "}
                <div className="d" style={{ fontSize: "20px", fontWeight: "800" }}>
                  Crew question
                </div>
                {" "}
              </div>
              {" "}
              <span className="pill" style={{ background: "rgba(255,176,32,.16)", color: "var(--warn)" }}>
                {v.phaseLabel}
              </span>
              {" "}
            </header>
            {" "}
            <section style={{ padding: "20px", borderRadius: "28px", color: "#fff", background: "radial-gradient(130% 110% at 100% 0%,#22e1ff 0%,#3a6bff 50%,#22337d 100%)" }}>
              {" "}
              <span style={{ fontSize: "12px", fontWeight: "800", letterSpacing: ".08em", textTransform: "uppercase", padding: "6px 10px", borderRadius: "99px", background: "rgba(0,0,0,.22)" }}>
                Most likely to
              </span>
              {" "}
              <h1 style={{ fontSize: "30px", lineHeight: "1.02", marginTop: "12px" }}>
                {v.question}
              </h1>
              {" "}
              <div className="row" style={{ gap: "8px", marginTop: "14px" }}>
                {" "}
                {(v.answered || []).map((a, i0) => (
                  <Fragment key={i0}>
                  {" "}
                  <span className="av" title={a.name} style={{ width: "28px", height: "28px", borderRadius: "9px", background: a.tint, opacity: a.op, border: "2px solid rgba(255,255,255,.6)" }}>
                    <img src={a.icon} alt={a.label} />
                  </span>
                  {" "}
                  </Fragment>
                ))}
                {" "}
              </div>
              {" "}
              <div style={{ fontSize: "13.5px", marginTop: "8px", opacity: ".92" }}>
                {v.answeredText}
              </div>
              {" "}
            </section>
            {" "}
            {v.isAnswer ? (
              <>
              {" "}
              <div className="rise">
                {" "}
                <h2 style={{ fontSize: "17px", margin: "18px 0 10px" }}>
                  Your vote is secret
                </h2>
                {" "}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(4, minmax(0, 1fr))", gap: "8px" }}>
                  {" "}
                  {(v.members || []).map((mb, i0) => (
                    <Fragment key={i0}>
                    {" "}
                    <button className="card tap" onClick={mb.pick} aria-pressed={mb.on} style={{ padding: "10px 4px", display: "flex", flexDirection: "column", alignItems: "center", gap: "6px", border: `2px solid ${mb.ring}` }}>
                      {" "}
                      <span className="av" style={{ width: "44px", height: "44px", borderRadius: "14px", background: mb.tint }}>
                        <img src={mb.icon} alt="" />
                      </span>
                      {" "}
                      <b style={{ fontSize: "12.5px" }}>
                        {mb.name}
                      </b>
                      {" "}
                    </button>
                    {" "}
                    </Fragment>
                  ))}
                  {" "}
                </div>
                {" "}
                <label htmlFor="cd-why" className="label" style={{ marginTop: "16px" }}>
                  {"Why? "}
                  <span className="muted" style={{ fontWeight: "500" }}>
                    optional, shown without your name
                  </span>
                </label>
                {" "}
                <textarea id="cd-why" className="field" value={v.why ?? ""} onChange={v.onWhy} maxLength="140" style={{ minHeight: "80px" }} placeholder="Already has 3k followers from one cooking video." />
                {" "}
                <button className="btn btn-cta btn-lg btn-block tap" onClick={v.submit} disabled={!!(v.noPick)} style={{ marginTop: "14px" }}>
                  Lock in my vote
                </button>
                {" "}
                <p className="muted" style={{ fontSize: "13px", textAlign: "center", marginTop: "8px" }}>
                  Answer before 9pm to keep the crew streak. +20 season points.
                </p>
                {" "}
              </div>
              {" "}
              </>
            ) : null}
            {" "}
            {v.isWait ? (
              <>
              {" "}
              <div className="rise">
                {" "}
                <div className="card pop" style={{ marginTop: "16px", padding: "18px", textAlign: "center" }}>
                  {" "}
                  <img src="/sk/shushing_face.png" alt="" style={{ width: "56px", height: "56px" }} />
                  {" "}
                  <h2 style={{ fontSize: "22px", marginTop: "8px" }}>
                    Locked in. Results at 9pm.
                  </h2>
                  {" "}
                  <div className="d" style={{ fontSize: "40px", fontWeight: "800", marginTop: "6px" }} role="timer">
                    {v.hh}:{v.mm}:{v.ss}
                  </div>
                  {" "}
                  <p className="muted" style={{ fontSize: "13.5px", marginTop: "4px" }}>
                    {"You voted for "}
                    <b>
                      {v.myPick}
                    </b>
                    . Nobody will see that, not even the reveal.
                  </p>
                  {" "}
                </div>
                {" "}
                <div className="card" style={{ marginTop: "12px", padding: "14px" }}>
                  {" "}
                  <b style={{ fontSize: "15px" }}>
                    Still waiting on
                  </b>
                  {" "}
                  <ul style={{ listStyle: "none", margin: "8px 0 0", padding: "0" }}>
                    {" "}
                    {(v.waiting || []).map((w, i0) => (
                      <Fragment key={i0}>
                      {" "}
                      <li className="row" style={{ padding: "8px 0" }}>
                        {" "}
                        <span className="av" style={{ width: "36px", height: "36px", borderRadius: "12px", background: w.tint }}>
                          <img src={w.icon} alt="" />
                        </span>
                        {" "}
                        <b style={{ flex: "1" }}>
                          {w.name}
                        </b>
                        {" "}
                        <button className="btn btn-sm tap" onClick={w.nudge} disabled={!!(w.nudged)}>
                          {w.label}
                        </button>
                        {" "}
                      </li>
                      {" "}
                      </Fragment>
                    ))}
                    {" "}
                  </ul>
                  {" "}
                </div>
                {" "}
              </div>
              {" "}
              </>
            ) : null}
            {" "}
            {v.isReveal ? (
              <>
              {" "}
              <div className="rise">
                {" "}
                <div className="sec-h">
                  <h2>
                    The crew has spoken
                  </h2>
                  <span className="muted" style={{ fontSize: "13px" }}>
                    8 votes
                  </span>
                </div>
                {" "}
                <div className="card" style={{ padding: "14px", display: "flex", flexDirection: "column", gap: "12px" }}>
                  {" "}
                  {(v.results || []).map((r, i0) => (
                    <Fragment key={i0}>
                    {" "}
                    <div>
                      {" "}
                      <div className="row" style={{ gap: "10px" }}>
                        {" "}
                        <span className="av" style={{ width: "34px", height: "34px", borderRadius: "11px", background: r.tint }}>
                          <img src={r.icon} alt="" />
                        </span>
                        {" "}
                        <b style={{ flex: "1", fontSize: "15px" }}>
                          {r.name}
                        </b>
                        {" "}
                        <b className="d">
                          {r.votes}
                        </b>
                        {" "}
                      </div>
                      {" "}
                      <div className="bar" style={{ marginTop: "6px" }}>
                        <span style={{ width: `${r.pct}%` }} />
                      </div>
                      {" "}
                    </div>
                    {" "}
                    </Fragment>
                  ))}
                  {" "}
                </div>
                {" "}
                <div className="sec-h">
                  <h2>
                    What people said
                  </h2>
                </div>
                {" "}
                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  {" "}
                  {(v.whys || []).map((wy, i0) => (
                    <Fragment key={i0}>
                    <div className="card" style={{ padding: "12px 14px", fontSize: "14.5px" }}>
                      “{wy}”
                    </div>
                    </Fragment>
                  ))}
                  {" "}
                </div>
                {" "}
                <div className="row" style={{ marginTop: "12px", padding: "12px 14px", borderRadius: "16px", background: "rgba(34,179,111,.14)", fontSize: "14px", gap: "10px" }}>
                  {" "}
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={{ color: "var(--ok)" }}>
                    <path d="m5 12 5 5 9-10" />
                  </svg>
                  {" "}
                  <span>
                    Tomorrow brings a new question at the same time.
                  </span>
                  {" "}
                </div>
                {" "}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: "10px", marginTop: "12px" }}>
                  {" "}
                  <SkLink href="/share" className="btn btn-cta tap">
                    Share result
                  </SkLink>
                  {" "}
                  <SkLink href="/crews" className="btn tap">
                    Back to crew
                  </SkLink>
                  {" "}
                </div>
                {" "}
                <p className="muted" style={{ fontSize: "13px", textAlign: "center", marginTop: "10px" }}>
                  Tomorrow's question drops at noon.
                </p>
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
