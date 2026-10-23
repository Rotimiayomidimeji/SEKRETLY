// @ts-nocheck -- ported 1:1 from design/mockup/Streak.dc.html by scripts/port-mockup.mjs; typed as it gets wired to real data
"use client";

import React, { Fragment } from "react";
import { saveMode, SkLink } from "@/lib/sk/runtime";


export default class Streak extends React.Component<Record<string, any>, any> {
  static defaultProps = {"mode":"dark"};

  constructor(props) {
    super(props);
    var m = null; // light/dark arrives as props.mode from the sk-mode cookie
    this.state = { mode: m || props.mode || 'dark', risk: false, saves: props.saves || 0, used: !!props.savedToday };
  }
  componentDidMount() {
    var self = this;
    this.onStore = function (e) { if (e.key === 'sk-mode' && e.newValue) self.setState({ mode: e.newValue }); };
    try { window.addEventListener('storage', this.onStore); } catch (e) {}
  }
  componentWillUnmount() { try { window.removeEventListener('storage', this.onStore); } catch (e) {} }
  componentDidUpdate(prev) { if (prev.mode !== this.props.mode && this.props.mode) this.setState({ mode: this.props.mode }); }
  renderVals() {
    var self = this, s = this.state, dark = s.mode !== 'light';
    var MO = this.props.month || { name: '', offset: 0, days: 30, today: 1, dropped: [], saved: [] }, today = MO.today, cal = [];
    var dropped = {}, saved = {}; MO.dropped.forEach(function (d) { dropped[d] = true; }); MO.saved.forEach(function (d) { saved[d] = true; });
    for (var b = 0; b < MO.offset; b++) cal.push({ n: '', label: '', bg: 'transparent', ink: 'inherit', ring: 'transparent', op: 1 });
    for (var d = 1; d <= MO.days; d++) {
      var done = !!dropped[d] && !saved[d];
      var save = !!saved[d] || (s.used && d === today && !dropped[d]);
      var bg = done ? 'linear-gradient(135deg,#ff8a2b,#ff3d6e)' : save ? '#3a6bff' : 'var(--card2)';
      cal.push({ n: d, label: MO.name + ' ' + d + (done ? ', dropped' : save ? ', save used' : ''), bg: bg, ink: (done || save) ? '#fff' : 'var(--ink)', ring: d === today ? '#ff8a2b' : 'transparent', op: d > today ? 0.45 : 1 });
    }
    var cur = this.props.current || 0, longest = this.props.longest || 0;
    var M = [
      { days: 7, reward: 'Flame badge on your profile', got: longest >= 7 },
      { days: 14, reward: 'Unlock the Neon link theme', got: longest >= 14 },
      { days: 30, reward: '2 extra streak saves', got: longest >= 30 },
      { days: 50, reward: 'Custom colour for your word cloud', got: longest >= 50 },
      { days: 100, reward: 'Legend frame for your avatar', got: longest >= 100 }
    ];
    var A = { fox: '/sk/fox.png', panda: '/sk/panda.png', frog: '/sk/frog.png', koala: '/sk/koala.png' };
    return {
      mode: dark ? 'dark' : 'light',
      saves: s.saves,
      saveDots: [0, 1].map(function (i) { var has = i < s.saves; return { bg: has ? '#3a6bff' : 'var(--card2)', ink: has ? '#ffffff' : 'var(--muted)' }; }),
      dow: ['S', 'M', 'T', 'W', 'T', 'F', 'S'],
      cal: cal, doneCount: MO.dropped.length, monthName: MO.name, current: cur, atRisk: !!this.props.atRisk && !s.used,
      streakSub: this.props.atRisk && !s.used ? 'Drop today’s link before 7pm to make it ' + (cur + 1) + '.' : cur ? 'Today is done. Come back after 7pm for the next drop.' : 'Drop today’s link to start your streak.',
      riskTitle: 'Your ' + cur + '-day streak ends at 7pm',
      miles: M.map(function (x) { return { days: x.days, reward: x.reward, got: x.got, state: x.got ? 'Unlocked' : (x.days - cur) + ' more days', bg: x.got ? 'linear-gradient(135deg,#ff8a2b,#ff3d6e)' : 'var(--card2)', ink: x.got ? '#fff' : 'var(--ink)' }; }),
      friends: [{ rank: 1, name: 'You', days: cur, icon: '/sk/' + (this.props.avatar || 'fox') + '.png', tint: 'linear-gradient(135deg,#d6ff6b,#22c4a0)', bg: 'rgba(255,59,141,.10)' }],
      risk: s.risk,
      showRisk: function () { self.setState({ risk: true }); },
      hideRisk: function () { self.setState({ risk: false }); },
      saveLabel: s.used ? 'Save used · streak protected' : 'Use a streak save (' + s.saves + ' left)',
      useSave: function () { if (!s.used && s.saves > 0) { self.setState({ used: true, saves: s.saves - 1 }); self.props.spendSave(); } }
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
              <h1 className="grow" style={{ fontSize: "24px" }}>
                Your streak
              </h1>
              {" "}
            </header>
            {" "}
            <section style={{ textAlign: "center", padding: "26px 18px", borderRadius: "28px", color: "#fff", background: "radial-gradient(120% 100% at 50% 0%,#ffb347 0%,#ff4f6d 45%,#5d1785 100%)" }}>
              {" "}
              <svg className="pop" width="84" height="84" viewBox="0 0 24 24" fill="#fff" aria-hidden="true">
                <path d="M12 2c1 4 5 6 5 11a5 5 0 0 1-10 0c0-2 1-3.5 2-4.5 0 2 1 3 2 3 0-4-1-6 1-9.5z" />
              </svg>
              {" "}
              <div className="d" style={{ fontSize: "64px", fontWeight: "800", lineHeight: ".9", marginTop: "4px" }}>
                {v.current}
              </div>
              {" "}
              <div style={{ fontSize: "16px", fontWeight: "700", marginTop: "4px" }}>
                days in a row
              </div>
              {" "}
              <p style={{ fontSize: "14px", margin: "10px auto 0", maxWidth: "30ch", opacity: ".92" }}>
                {v.streakSub}
              </p>
              {" "}
              <SkLink href="/drop" className="tap" style={{ display: "inline-grid", placeItems: "center", marginTop: "16px", minHeight: "50px", padding: "0 26px", borderRadius: "16px", background: "#fff", color: "#5d1785", fontWeight: "800", textDecoration: "none" }}>
                Drop today's link
              </SkLink>
              {" "}
            </section>
            {" "}
            <div className="card" style={{ marginTop: "12px", padding: "16px" }}>
              {" "}
              <div className="row" style={{ justifyContent: "space-between" }}>
                {" "}
                <div>
                  <b style={{ fontSize: "16px" }}>
                    Streak saves
                  </b>
                  <div className="muted" style={{ fontSize: "13px" }}>
                    Miss a day and a save keeps your streak alive
                  </div>
                </div>
                {" "}
                <div style={{ display: "flex", gap: "6px" }} aria-label={`${v.saves} of 2 saves left`}>
                  {" "}
                  {(v.saveDots || []).map((sd, i0) => (
                    <Fragment key={i0}>
                    {" "}
                    <span style={{ width: "34px", height: "34px", borderRadius: "11px", display: "grid", placeItems: "center", background: sd.bg }}>
                      {" "}
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={sd.ink} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <path d="M12 3 4 6v6c0 5 3.5 8 8 9 4.5-1 8-4 8-9V6z" />
                      </svg>
                      {" "}
                    </span>
                    {" "}
                    </Fragment>
                  ))}
                  {" "}
                </div>
                {" "}
              </div>
              {" "}
              <p className="muted" style={{ fontSize: "13px", marginTop: "10px" }}>
                You get 1 free save every Monday and can hold 2. Earn an extra one by bringing a friend who drops their first link.
              </p>
              {" "}
              {v.atRisk ? (
                <>
                <button className="btn btn-sm tap" onClick={v.showRisk} style={{ marginTop: "12px" }}>
                  Your streak is at risk
                </button>
                </>
              ) : null}
              {" "}
            </div>
            {" "}
            <div className="sec-h">
              <h2>
                {v.monthName}
              </h2>
              <span className="muted" style={{ fontSize: "13px" }}>
                {v.doneCount}{" drops"}
              </span>
            </div>
            {" "}
            <div className="card" style={{ padding: "14px" }}>
              {" "}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(7, minmax(0, 1fr))", gap: "6px", textAlign: "center" }}>
                {" "}
                {(v.dow || []).map((w, i0) => (
                  <Fragment key={i0}>
                  <div className="muted" style={{ fontSize: "11.5px", fontWeight: "800" }}>
                    {w}
                  </div>
                  </Fragment>
                ))}
                {" "}
                {(v.cal || []).map((c, i0) => (
                  <Fragment key={i0}>
                  {" "}
                  <div aria-label={c.label} style={{ aspectRatio: "1", borderRadius: "10px", display: "grid", placeItems: "center", fontSize: "12.5px", fontWeight: "800", background: c.bg, color: c.ink, border: `2px solid ${c.ring}`, opacity: c.op }}>
                    {c.n}
                  </div>
                  {" "}
                  </Fragment>
                ))}
                {" "}
              </div>
              {" "}
              <div className="row" style={{ gap: "14px", marginTop: "12px", flexWrap: "wrap", fontSize: "12.5px" }}>
                {" "}
                <span className="row" style={{ gap: "6px" }}>
                  <span style={{ width: "12px", height: "12px", borderRadius: "4px", background: "linear-gradient(135deg,#ff8a2b,#ff3d6e)" }} />
                  Dropped
                </span>
                {" "}
                <span className="row" style={{ gap: "6px" }}>
                  <span style={{ width: "12px", height: "12px", borderRadius: "4px", background: "#3a6bff" }} />
                  Save used
                </span>
                {" "}
                <span className="row" style={{ gap: "6px" }}>
                  <span style={{ width: "12px", height: "12px", borderRadius: "4px", border: "2px solid #ff8a2b" }} />
                  Today
                </span>
                {" "}
              </div>
              {" "}
            </div>
            {" "}
            <div className="sec-h">
              <h2>
                Milestones
              </h2>
            </div>
            {" "}
            <ul className="card" style={{ listStyle: "none", margin: "0", padding: "0", overflow: "hidden" }}>
              {" "}
              {(v.miles || []).map((ms, i0) => (
                <Fragment key={i0}>
                {" "}
                <li className="list-row">
                  {" "}
                  <span style={{ width: "44px", height: "44px", borderRadius: "14px", display: "grid", placeItems: "center", fontWeight: "800", background: ms.bg, color: ms.ink }}>
                    {ms.days}
                  </span>
                  {" "}
                  <div style={{ flex: "1", minWidth: "0" }}>
                    <b style={{ fontSize: "15px" }}>
                      {ms.reward}
                    </b>
                    <div className="muted" style={{ fontSize: "12.5px" }}>
                      {ms.state}
                    </div>
                  </div>
                  {" "}
                  {ms.got ? (
                    <>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" aria-label="Unlocked" role="img" style={{ color: "var(--ok)" }}>
                      <path d="m5 12 5 5 9-10" />
                    </svg>
                    </>
                  ) : null}
                  {" "}
                </li>
                {" "}
                </Fragment>
              ))}
              {" "}
            </ul>
            {" "}
            <div className="sec-h">
              <h2>
                Friends' streaks
              </h2>
              <span className="muted" style={{ fontSize: "13px" }}>
                only friends see this
              </span>
            </div>
            {" "}
            <ol className="card" style={{ listStyle: "none", margin: "0", padding: "0", overflow: "hidden" }}>
              {" "}
              {(v.friends || []).map((fr, i0) => (
                <Fragment key={i0}>
                {" "}
                <li className="list-row" style={{ background: fr.bg }}>
                  {" "}
                  <span className="d" style={{ width: "20px", fontWeight: "800" }} aria-label={`Rank ${fr.rank}`}>
                    {fr.rank}
                  </span>
                  {" "}
                  <span className="av" style={{ width: "38px", height: "38px", borderRadius: "12px", background: fr.tint }}>
                    <img src={fr.icon} alt="" />
                  </span>
                  {" "}
                  <b style={{ flex: "1", fontSize: "15px" }}>
                    {fr.name}
                  </b>
                  {" "}
                  <span className="row" style={{ gap: "4px", fontWeight: "800" }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="#ff6a3d" aria-hidden="true">
                      <path d="M12 2c1 4 5 6 5 11a5 5 0 0 1-10 0c0-2 1-3.5 2-4.5 0 2 1 3 2 3 0-4-1-6 1-9.5z" />
                    </svg>
                    {fr.days}
                  </span>
                  {" "}
                </li>
                {" "}
                </Fragment>
              ))}
              {" "}
            </ol>
            {" "}
          </div>
          {" "}
        </div>
        {" "}
        {v.risk ? (
          <>
          {" "}
          <div className="scrim">
            {" "}
            <div className="sheet" role="dialog" aria-label="Streak at risk" style={{ textAlign: "center" }}>
              {" "}
              <img className="shake" src="/sk/fire.png" alt="" style={{ width: "64px", height: "64px" }} />
              {" "}
              <h2 style={{ fontSize: "24px", marginTop: "8px" }}>
                {v.riskTitle}
              </h2>
              {" "}
              <p className="muted" style={{ marginTop: "6px", fontSize: "14.5px" }}>
                This is the push we send at 5pm when you haven't dropped yet. One tap keeps it.
              </p>
              {" "}
              <SkLink href="/drop" className="btn btn-cta btn-lg btn-block tap" style={{ marginTop: "16px" }}>
                Drop now
              </SkLink>
              {" "}
              <button className="btn btn-block tap" onClick={v.useSave} style={{ marginTop: "10px" }}>
                {v.saveLabel}
              </button>
              {" "}
              <button className="btn btn-ghost btn-block tap" onClick={v.hideRisk} style={{ marginTop: "6px", border: "0" }}>
                Not now
              </button>
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
      </>
    );
  }
}
