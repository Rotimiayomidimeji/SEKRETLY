// @ts-nocheck -- ported 1:1 from design/mockup/AdminReports.dc.html by scripts/port-mockup.mjs; typed as it gets wired to real data
"use client";

import React, { Fragment } from "react";
import { saveMode, SkLink } from "@/lib/sk/runtime";


export default class AdminReports extends React.Component<Record<string, any>, any> {
  static defaultProps = {"mode":"dark"};

  constructor(props) {
    super(props);
    var m = null; // light/dark arrives as props.mode from the sk-mode cookie
    this.state = { mode: m || props.mode || 'dark', tab: 'review', done: (props.reports || []).reduce(function (d, r) { if (r.decision) d[r.id] = r.decision; return d; }, {}) };
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
    var line = dark ? 'rgba(255,255,255,.11)' : 'rgba(48,34,72,.13)';
    var R = this.props.reports || [];
    var shown = R.filter(function (r) { return s.tab === 'review' ? r.serious : true; });
    var open = R.filter(function (r) { return r.serious && !s.done[r.id]; }).length;
    var setDone = function (id, v) { var d = Object.assign({}, s.done); d[id] = v; self.setState({ done: d }); self.props.decide(id, v); };
    var catBg = function (c) { return { Threats: '#c4213a', 'Underage concern': '#c4213a', 'Self-harm': '#7a3cff', 'Non-consensual image': '#c4213a' }[c] || '#d81b72'; };
    var L = this.props.log || [];
    var abg = { 'Blocked': '#c4213a', 'Support sent': '#7a3cff', 'Undo': '#665e74' };
    return {
      mode: dark ? 'dark' : 'light', isDark: dark, isLight: !dark, modeWord: dark ? 'Light' : 'Dark',
      toggleMode: function () { var n = dark ? 'light' : 'dark'; saveMode(n); self.setState({ mode: n }); },
      openCount: open, hasOpen: open > 0,
      kpis: [
        { label: 'Reports today', value: String((this.props.kpis || {}).reports || 0), c: 'var(--ink)' },
        { label: 'Warnings sent', value: String((this.props.kpis || {}).warnings || 0), c: 'var(--warn)' },
        { label: 'Blocks (4th report)', value: String((this.props.kpis || {}).blocks || 0), c: 'var(--bad)' },
        { label: 'Blocks undone', value: String((this.props.kpis || {}).undone || 0), c: 'var(--muted)' },
        { label: 'Needs review', value: String(open), c: open ? 'var(--bad)' : 'var(--ok)' }
      ],
      tabs: [['review', 'Needs review'], ['all', 'All reports'], ['log', 'Automatic actions log']].map(function (t) { var on = s.tab === t[0]; return { label: t[1], on: on ? 'true' : 'false', cls: on ? 'on' : '', pick: function () { self.setState({ tab: t[0] }); } }; }),
      showCards: s.tab !== 'log', showLog: s.tab === 'log',
      reports: shown.map(function (r) {
        var d = s.done[r.id];
        return { cat: r.cat, serious: r.serious, receiver: r.receiver, sender: r.sender, ago: r.ago, text: r.text, hasMedia: !!r.media, auto: r.auto,
          catBg: catBg(r.cat), border: r.serious && !d ? 'var(--bad)' : 'var(--line)',
          status: d ? ({ keep: 'Kept', reverse: 'Warning reversed', suspend: 'Sender suspended', escalate: 'Escalated' })[d] : (r.serious ? 'Open' : 'Auto-handled'),
          open: !d,
          steps: [1, 2, 3, 4].map(function (i) { return { c: i <= r.n ? (i === 4 ? '#c4213a' : '#ffb020') : line }; }),
          keep: function () { setDone(r.id, 'keep'); }, reverse: function () { setDone(r.id, 'reverse'); }, suspend: function () { setDone(r.id, 'suspend'); }, escalate: function () { setDone(r.id, 'escalate'); } };
      }),
      log: L.map(function (l) { return { t: l[0], action: l[1], sender: l[2], receiver: l[3], cat: l[4], msg: l[5], bg: abg[l[1]] || '#b26a00' }; })
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
        <div className="shell">
          {" "}
          <nav className="side" aria-label="Admin">
            {" "}
            <SkLink href="/admin" className="logo" style={{ padding: "0 10px 4px" }}>
              <span className="logo-mark">
                S
              </span>
              <span className="logo-word">
                Admin
              </span>
            </SkLink>
            {" "}
            <span className="muted" style={{ fontSize: "12px", padding: "0 12px 16px" }}>
              admin · full access
            </span>
            {" "}
            <SkLink href="/admin" className="nav-i">
              Overview
            </SkLink>
            {" "}
            <SkLink href="/admin/traffic" className="nav-i">
              Traffic manager
            </SkLink>
            {" "}
            <SkLink href="/admin/users" className="nav-i">
              Users
            </SkLink>
            {" "}
            <SkLink href="/admin/reports" className="nav-i" aria-current="page">
              Reports & warnings
              {v.hasOpen ? (
                <>
                <span className="count">
                  {v.openCount}
                </span>
                </>
              ) : null}
            </SkLink>
            {" "}
            <SkLink href="/admin/categories" className="nav-i">
              Report categories
            </SkLink>
            {" "}
            <SkLink href="/admin/ads" className="nav-i">
              Ads & AdSense
            </SkLink>
            {" "}
            <SkLink href="/admin/ads/map" className="nav-i">
              Ad placement map
            </SkLink>
            {" "}
            <SkLink href="/home" className="nav-i" style={{ marginTop: "auto" }}>
              Back to app
            </SkLink>
            {" "}
          </nav>
          {" "}
          <nav className="anav" aria-label="Admin">
            {" "}
            <SkLink href="/admin" className="anav-i">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <rect x="3" y="3" width="7" height="9" rx="2" />
                <rect x="14" y="3" width="7" height="5" rx="2" />
                <rect x="14" y="12" width="7" height="9" rx="2" />
                <rect x="3" y="16" width="7" height="5" rx="2" />
              </svg>
              <span>
                Overview
              </span>
            </SkLink>
            {" "}
            <SkLink href="/admin/traffic" className="anav-i">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M3 17l6-6 4 4 8-8" />
                <path d="M15 7h6v6" />
              </svg>
              <span>
                Traffic
              </span>
            </SkLink>
            {" "}
            <SkLink href="/admin/users" className="anav-i">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
                <circle cx="9" cy="8" r="3.5" />
                <path d="M2.5 20a6.5 6.5 0 0 1 13 0" />
                <path d="M16 4.5a3.5 3.5 0 0 1 0 7M18 14.5a6 6 0 0 1 3.5 5.5" />
              </svg>
              <span>
                Users
              </span>
            </SkLink>
            {" "}
            <SkLink href="/admin/reports" className="anav-i" aria-current="page">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M5 22V4" />
                <path d="M5 4h12l-2 4 2 4H5" />
              </svg>
              <span>
                Reports
              </span>
              <b className="anav-badge">
                4
              </b>
            </SkLink>
            {" "}
            <details className="anav-more">
              {" "}
              <summary className="anav-i">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <circle cx="5" cy="12" r="2" />
                  <circle cx="12" cy="12" r="2" />
                  <circle cx="19" cy="12" r="2" />
                </svg>
                <span>
                  More
                </span>
              </summary>
              {" "}
              <div className="anav-sheet">
                {" "}
                <div className="anav-grab" aria-hidden="true" />
                {" "}
                <SkLink href="/admin/categories" className="anav-s">
                  Report categories
                </SkLink>
                {" "}
                <SkLink href="/admin/ads" className="anav-s">
                  Ads & AdSense
                </SkLink>
                {" "}
                <SkLink href="/admin/ads/map" className="anav-s">
                  Ad placement map
                </SkLink>
                {" "}
                <SkLink href="/home" className="anav-s" style={{ color: "var(--muted)" }}>
                  ← Back to the app
                </SkLink>
                {" "}
              </div>
              {" "}
            </details>
            {" "}
          </nav>
          {" "}
          <div className="main" style={{ paddingBottom: "40px" }}>
            {" "}
            <div className="wrap" style={{ maxWidth: "1180px" }}>
              {" "}
              <header className="topbar">
                {" "}
                <div className="grow">
                  <h1 style={{ fontSize: "28px" }}>
                    Reports & warnings
                  </h1>
                  <div className="muted" style={{ fontSize: "13px" }}>
                    Warnings and blocks happen automatically. You step in for serious ones, or to reverse a mistake.
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
              <div className="rail adm-nav-rail" style={{ gap: "8px", marginBottom: "14px" }}>
                {" "}
                <SkLink href="/admin" className="chip">
                  Overview
                </SkLink>
                <SkLink href="/admin/traffic" className="chip">
                  Traffic
                </SkLink>
                <SkLink href="/admin/users" className="chip">
                  Users
                </SkLink>
                <SkLink href="/admin/reports" className="chip on">
                  Reports
                </SkLink>
                <SkLink href="/admin/categories" className="chip">
                  Categories
                </SkLink>
                <SkLink href="/admin/ads" className="chip">
                  Ads
                </SkLink>
                {" "}
              </div>
              {" "}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: "10px" }}>
                {" "}
                {(v.kpis || []).map((k, i0) => (
                  <Fragment key={i0}>
                  <div className="card kpi">
                    <div className="muted" style={{ fontSize: "12.5px" }}>
                      {k.label}
                    </div>
                    <div className="v" style={{ color: k.c }}>
                      {k.value}
                    </div>
                  </div>
                  </Fragment>
                ))}
                {" "}
              </div>
              {" "}
              <div className="rail" role="tablist" style={{ display: "flex", gap: "8px", marginTop: "16px" }}>
                {" "}
                {(v.tabs || []).map((t, i0) => (
                  <Fragment key={i0}>
                  <button role="tab" aria-selected={t.on} className={`chip tap ${t.cls}`} onClick={t.pick}>
                    {t.label}
                  </button>
                  </Fragment>
                ))}
                {" "}
              </div>
              {" "}
              {v.showCards ? (
                <>
                {" "}
                <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginTop: "12px" }}>
                  {" "}
                  {(v.reports || []).map((r, i0) => (
                    <Fragment key={i0}>
                    {" "}
                    <article className="card" style={{ padding: "16px", borderColor: r.border }}>
                      {" "}
                      <div className="row" style={{ flexWrap: "wrap", gap: "8px" }}>
                        {" "}
                        <span className="pill" style={{ background: r.catBg, color: "#ffffff" }}>
                          {r.cat}
                        </span>
                        {" "}
                        {r.serious ? (
                          <>
                          <span className="pill" style={{ background: "transparent", border: "1px solid var(--bad)", color: "var(--bad)" }}>
                            Serious · needs a human
                          </span>
                          </>
                        ) : null}
                        {" "}
                        <span className="muted" style={{ fontSize: "13px" }}>
                          @{r.receiver}{" reported "}{r.sender}{" · "}{r.ago}
                        </span>
                        {" "}
                        <span className="grow" />
                        {" "}
                        <span className="pill">
                          {r.status}
                        </span>
                        {" "}
                      </div>
                      {" "}
                      <div className="row" style={{ gap: "12px", marginTop: "12px", alignItems: "flex-start" }}>
                        {" "}
                        {r.hasMedia ? (
                          <>
                          <span className="media blur" style={{ width: "84px", height: "84px", flex: "none" }}>
                            <img src="/sk/hero-dark.png" alt="Reported photo, blurred" />
                            <span className="media-tag">
                              Photo
                            </span>
                          </span>
                          </>
                        ) : null}
                        {" "}
                        <p style={{ fontSize: "16px", lineHeight: "1.5", flex: "1" }}>
                          “{r.text}”
                        </p>
                        {" "}
                      </div>
                      {" "}
                      <div className="card" style={{ marginTop: "12px", padding: "10px 12px", background: "var(--card2)", fontSize: "13.5px" }}>
                        {" "}
                        <b>
                          Automatic action:
                        </b>
                        {" "}{r.auto}{" "}
                        <div className="warn-steps" style={{ marginTop: "8px", maxWidth: "260px" }}>
                          {(r.steps || []).map((st, i2) => (
                            <Fragment key={i2}>
                            <span style={{ background: st.c }} />
                            </Fragment>
                          ))}
                        </div>
                        {" "}
                      </div>
                      {" "}
                      {r.open ? (
                        <>
                        {" "}
                        <div className="row" style={{ gap: "8px", marginTop: "12px", flexWrap: "wrap" }}>
                          {" "}
                          <button className="btn btn-sm tap" onClick={r.keep}>
                            Keep action
                          </button>
                          {" "}
                          <button className="btn btn-sm tap" onClick={r.reverse}>
                            Reverse warning
                          </button>
                          {" "}
                          <button className="btn btn-sm btn-danger tap" onClick={r.suspend}>
                            Suspend sender
                          </button>
                          {" "}
                          {r.serious ? (
                            <>
                            <button className="btn btn-sm tap" onClick={r.escalate} style={{ background: "#c4213a", color: "#ffffff", border: "0" }}>
                              Escalate · save evidence
                            </button>
                            </>
                          ) : null}
                          {" "}
                        </div>
                        {" "}
                        </>
                      ) : null}
                      {" "}
                    </article>
                    {" "}
                    </Fragment>
                  ))}
                  {" "}
                </div>
                {" "}
                </>
              ) : null}
              {" "}
              {v.showLog ? (
                <>
                {" "}
                <section className="card" style={{ marginTop: "12px", overflow: "hidden" }}>
                  {" "}
                  <div className="adm-scroll" style={{ borderRadius: "0" }}>
                    {" "}
                    <table className="adm-table">
                      <thead>
                        <tr>
                          <th>
                            Time
                          </th>
                          <th>
                            Action
                          </th>
                          <th>
                            Sender
                          </th>
                          <th>
                            Receiver
                          </th>
                          <th>
                            Category
                          </th>
                          <th>
                            Warning sent
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {(v.log || []).map((l, i0) => (
                          <Fragment key={i0}>
                          <tr>
                            <td className="muted">
                              {l.t}
                            </td>
                            <td>
                              <span className="pill" style={{ background: l.bg, color: "#ffffff" }}>
                                {l.action}
                              </span>
                            </td>
                            <td>
                              {l.sender}
                            </td>
                            <td>
                              @{l.receiver}
                            </td>
                            <td>
                              {l.cat}
                            </td>
                            <td className="muted" style={{ whiteSpace: "normal", minWidth: "320px" }}>
                              {l.msg}
                            </td>
                          </tr>
                          </Fragment>
                        ))}
                      </tbody>
                    </table>
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
