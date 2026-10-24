// @ts-nocheck -- ported 1:1 from design/mockup/AdminUsers.dc.html by scripts/port-mockup.mjs; typed as it gets wired to real data
"use client";

import React, { Fragment } from "react";
import { saveMode, SkLink } from "@/lib/sk/runtime";


export default class AdminUsers extends React.Component<Record<string, any>, any> {
  static defaultProps = {"mode":"dark"};

  constructor(props) {
    super(props);
    var m = null; // light/dark arrives as props.mode from the sk-mode cookie
    this.state = { mode: m || props.mode || 'dark', q: '', filter: 'all', sel: null, over: (props.users || []).reduce(function (o, u) { if (u.status) o[u.name] = u.status; return o; }, {}) };
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
    var A = { fox: ['/sk/fox.png', 'linear-gradient(135deg,#ffb35c,#ff5f8f)'], panda: ['/sk/panda.png', 'linear-gradient(135deg,#7ef0c1,#3aa0ff)'], frog: ['/sk/frog.png', 'linear-gradient(135deg,#d6ff6b,#22c4a0)'], octopus: ['/sk/octopus.png', 'linear-gradient(135deg,#ffd0f0,#a46bff)'], unicorn: ['/sk/unicorn.png', 'linear-gradient(135deg,#9fe7ff,#ff9ad5)'], koala: ['/sk/koala.png', 'linear-gradient(135deg,#ffe48a,#ff8a5c)'] };
    var U = this.props.users || [];
    var line = dark ? 'rgba(255,255,255,.11)' : 'rgba(48,34,72,.13)';
    var deco = function (u) {
      if ((s.cleared || {})[u.name]) u = Object.assign({}, u, { pairs: u.pairs.filter(function (p) { return p[1] >= 4; }) });
      var warns = u.pairs.reduce(function (a, p) { return a + Math.min(3, p[1]); }, 0);
      var blockedBy = u.pairs.filter(function (p) { return p[1] >= 4; }).length;
      var status = s.over[u.name] || (blockedBy >= 3 ? 'Review' : (warns > 0 ? 'Warned' : 'Good'));
      var st = { Good: ['rgba(13,127,75,.18)', 'var(--ok)'], Warned: ['rgba(255,176,32,.18)', 'var(--warn)'], Review: ['rgba(196,33,58,.18)', 'var(--bad)'], Suspended: ['#c4213a', '#ffffff'], Deleted: ['var(--card2)', 'var(--muted)'] }[status];
      return { name: u.name, av: A[u.av][0], bg: A[u.av][1], joined: u.joined, state: u.state, device: u.device, links: u.links, sent: u.sent, warns: warns, blockedBy: blockedBy, status: status, stBg: st[0], stInk: st[1], warnC: warns ? 'var(--warn)' : 'var(--muted)', raw: u, ips: u.ips, open: function () { self.setState({ sel: u.name }); } };
    };
    var q = s.q.trim().toLowerCase().replace('@', '');
    var rows = U.map(deco).filter(function (u) {
      if (q && (u.name + ' ' + u.state).toLowerCase().indexOf(q) < 0) return false;
      if (s.filter === 'warned') return u.warns > 0;
      if (s.filter === 'blocked') return u.blockedBy > 0;
      if (s.filter === 'review') return u.status === 'Review' || u.status === 'Suspended';
      if (s.filter === 'new') return !!u.raw.isNew;
      return true;
    });
    var sel = s.sel ? deco(U.filter(function (u) { return u.name === s.sel; })[0]) : null;
    return {
      mode: dark ? 'dark' : 'light', isDark: dark, isLight: !dark, modeWord: dark ? 'Light' : 'Dark',
      toggleMode: function () { var n = dark ? 'light' : 'dark'; saveMode(n); self.setState({ mode: n }); },
      q: s.q, onQ: function (e) { self.setState({ q: e.target.value }); },
      filters: [['all', 'All'], ['warned', 'Has warnings'], ['blocked', 'Blocked by someone'], ['review', 'Needs review'], ['new', 'New this week']].map(function (f) { var on = s.filter === f[0]; return { label: f[1], on: on ? 'true' : 'false', cls: on ? 'on' : '', pick: function () { self.setState({ filter: f[0] }); } }; }),
      rows: rows,
      hasSel: !!sel,
      sel: sel || { name: '', av: '', bg: '', joined: '', state: '', device: '', links: 0, sent: 0, warns: 0, blockedBy: 0, status: '', stBg: '', stInk: '', ips: '' },
      selPairs: sel ? sel.raw.pairs.map(function (p) { return { to: p[0], label: p[1] >= 4 ? 'Blocked by them' : p[1] + ' of 3 warnings', cats: p[2], steps: [1, 2, 3, 4].map(function (i) { return { c: i <= p[1] ? (i === 4 ? '#c4213a' : '#ffb020') : line }; }) }; }) : [],
      noPairs: !!sel && sel.raw.pairs.length === 0,
      closeSel: function () { self.setState({ sel: null }); },
      stop: function (e) { e.stopPropagation(); },
      act: function () { if (!sel) return; var o = Object.assign({}, s.warned); o[sel.name] = true; self.setState({ warned: o }); self.props.warnUser(sel.name); },
      actDone: !!sel && !!(s.warned || {})[sel.name], actLabel: sel && (s.warned || {})[sel.name] ? 'Warning sent ✓' : 'Send admin warning',
      clear: function () { if (!sel) return; var o = Object.assign({}, s.cleared); o[sel.name] = true; self.setState({ cleared: o }); self.props.clearWarnings(sel.name); },
      clearDone: !!sel && !!(s.cleared || {})[sel.name], clearLabel: sel && (s.cleared || {})[sel.name] ? 'Warnings cleared ✓' : 'Clear all warnings',
      suspendLabel: sel && sel.status === 'Suspended' ? 'Lift suspension' : 'Suspend 7 days',
      delLabel: sel && sel.status === 'Deleted' ? 'Deleted' : s.delAsk === (sel && sel.name) ? 'Tap again to delete' : 'Delete account',
      delAccount: function () { if (!sel || sel.status === 'Deleted') return; if (s.delAsk !== sel.name) { self.setState({ delAsk: sel.name }); return; } var o = Object.assign({}, s.over); o[sel.name] = 'Deleted'; self.setState({ over: o, delAsk: null }); self.props.deleteUser(sel.name); },
      suspend: function () { if (!sel) return; var o = Object.assign({}, s.over); o[sel.name] = sel.status === 'Suspended' ? '' : 'Suspended'; self.setState({ over: o }); self.props.setSuspended(sel.name, sel.status !== 'Suspended'); }
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
            <SkLink href="/admin/users" className="nav-i" aria-current="page">
              Users
            </SkLink>
            {" "}
            <SkLink href="/admin/reports" className="nav-i">
              Reports & warnings
              <span className="count">
                4
              </span>
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
            <SkLink href="/admin/users" className="anav-i" aria-current="page">
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
            <SkLink href="/admin/reports" className="anav-i">
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
                    Users
                  </h1>
                  <div className="muted" style={{ fontSize: "13px" }}>
                    1,284 accounts · sample data
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
                <SkLink href="/admin/users" className="chip on">
                  Users
                </SkLink>
                <SkLink href="/admin/reports" className="chip">
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
              <section className="card" style={{ overflow: "hidden" }}>
                {" "}
                <div className="row" style={{ padding: "14px 16px", flexWrap: "wrap", gap: "10px" }}>
                  {" "}
                  <label htmlFor="au-q" className="sr">
                    Search users
                  </label>
                  {" "}
                  <input id="au-q" className="field" value={v.q ?? ""} onChange={v.onQ} placeholder="Search @username or state" style={{ minHeight: "42px", maxWidth: "320px", fontSize: "14px" }} />
                  {" "}
                  <div className="rail" style={{ display: "flex", gap: "8px" }}>
                    {" "}
                    {(v.filters || []).map((f, i0) => (
                      <Fragment key={i0}>
                      <button className={`chip tap ${f.cls}`} onClick={f.pick} aria-pressed={f.on}>
                        {f.label}
                      </button>
                      </Fragment>
                    ))}
                    {" "}
                  </div>
                  {" "}
                </div>
                {" "}
                <div className="adm-scroll" style={{ borderRadius: "0" }}>
                  {" "}
                  <table className="adm-table">
                    <thead>
                      <tr>
                        <th>
                          User
                        </th>
                        <th>
                          Joined
                        </th>
                        <th>
                          State
                        </th>
                        <th>
                          Device
                        </th>
                        <th>
                          Links
                        </th>
                        <th>
                          Msgs sent
                        </th>
                        <th>
                          Warnings got
                        </th>
                        <th>
                          Blocked by
                        </th>
                        <th>
                          Status
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {(v.rows || []).map((u, i0) => (
                        <Fragment key={i0}>
                        <tr onClick={u.open}>
                          <td>
                            <span className="row" style={{ gap: "10px" }}>
                              <span className="av" style={{ width: "32px", height: "32px", borderRadius: "10px", background: u.bg }}>
                                <img src={u.av} alt="" />
                              </span>
                              <b>
                                @{u.name}
                              </b>
                            </span>
                          </td>
                          <td className="muted">
                            {u.joined}
                          </td>
                          <td>
                            {u.state}
                          </td>
                          <td>
                            {u.device}
                          </td>
                          <td>
                            {u.links}
                          </td>
                          <td>
                            {u.sent}
                          </td>
                          <td>
                            <span style={{ color: u.warnC, fontWeight: "800" }}>
                              {u.warns}
                            </span>
                          </td>
                          <td>
                            {u.blockedBy}
                          </td>
                          <td>
                            <span className="pill" style={{ background: u.stBg, color: u.stInk }}>
                              {u.status}
                            </span>
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
            </div>
            {" "}
          </div>
          {" "}
        </div>
        {" "}
        {v.hasSel ? (
          <>
          {" "}
          <div className="scrim" onClick={v.closeSel}>
            {" "}
            <div className="sheet" role="dialog" aria-label="User details" onClick={v.stop} style={{ maxWidth: "580px" }}>
              {" "}
              <div className="row">
                {" "}
                <span className="av" style={{ width: "52px", height: "52px", borderRadius: "16px", background: v.sel.bg }}>
                  <img src={v.sel.av} alt="" />
                </span>
                {" "}
                <div className="grow">
                  <b style={{ fontSize: "20px" }}>
                    @{v.sel.name}
                  </b>
                  <div className="muted" style={{ fontSize: "13px" }}>
                    {"Joined "}{v.sel.joined}{" · "}{v.sel.state}{" · "}{v.sel.device}
                  </div>
                </div>
                {" "}
                <span className="pill" style={{ background: v.sel.stBg, color: v.sel.stInk }}>
                  {v.sel.status}
                </span>
                {" "}
              </div>
              {" "}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4, minmax(0, 1fr))", gap: "8px", marginTop: "14px" }}>
                {" "}
                <div className="card kpi" style={{ padding: "10px", background: "var(--card2)" }}>
                  <div className="muted" style={{ fontSize: "11.5px" }}>
                    Links
                  </div>
                  <div className="v" style={{ fontSize: "22px" }}>
                    {v.sel.links}
                  </div>
                </div>
                {" "}
                <div className="card kpi" style={{ padding: "10px", background: "var(--card2)" }}>
                  <div className="muted" style={{ fontSize: "11.5px" }}>
                    Sent
                  </div>
                  <div className="v" style={{ fontSize: "22px" }}>
                    {v.sel.sent}
                  </div>
                </div>
                {" "}
                <div className="card kpi" style={{ padding: "10px", background: "var(--card2)" }}>
                  <div className="muted" style={{ fontSize: "11.5px" }}>
                    Warnings
                  </div>
                  <div className="v" style={{ fontSize: "22px" }}>
                    {v.sel.warns}
                  </div>
                </div>
                {" "}
                <div className="card kpi" style={{ padding: "10px", background: "var(--card2)" }}>
                  <div className="muted" style={{ fontSize: "11.5px" }}>
                    Blocked by
                  </div>
                  <div className="v" style={{ fontSize: "22px" }}>
                    {v.sel.blockedBy}
                  </div>
                </div>
                {" "}
              </div>
              {" "}
              <h3 style={{ fontSize: "15px", marginTop: "16px" }}>
                Warnings by receiver
              </h3>
              {" "}
              <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginTop: "8px" }}>
                {" "}
                {(v.selPairs || []).map((p, i0) => (
                  <Fragment key={i0}>
                  {" "}
                  <div className="card" style={{ padding: "10px 12px" }}>
                    {" "}
                    <div className="row" style={{ fontSize: "14px" }}>
                      <b className="grow">
                        to @{p.to}
                      </b>
                      <span className="muted">
                        {p.label}
                      </span>
                    </div>
                    {" "}
                    <div className="warn-steps" style={{ marginTop: "6px" }}>
                      {(p.steps || []).map((st, i2) => (
                        <Fragment key={i2}>
                        <span style={{ background: st.c }} />
                        </Fragment>
                      ))}
                    </div>
                    {" "}
                    <div className="muted" style={{ fontSize: "12.5px", marginTop: "6px" }}>
                      {p.cats}
                    </div>
                    {" "}
                  </div>
                  {" "}
                  </Fragment>
                ))}
                {" "}
                {v.noPairs ? (
                  <>
                  <p className="muted" style={{ fontSize: "14px" }}>
                    No warnings. Clean record.
                  </p>
                  </>
                ) : null}
                {" "}
              </div>
              {" "}
              <h3 style={{ fontSize: "15px", marginTop: "14px" }}>
                Recent devices
              </h3>
              {" "}
              <div className="mono muted" style={{ marginTop: "6px", lineHeight: "1.8" }}>
                {v.sel.ips}
              </div>
              {" "}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: "8px", marginTop: "16px" }}>
                {" "}
                <button className="btn tap" onClick={v.act} disabled={!!(v.actDone)}>
                  {v.actLabel}
                </button>
                {" "}
                <button className="btn tap" onClick={v.clear} disabled={!!(v.clearDone)}>
                  {v.clearLabel}
                </button>
                {" "}
                <button className="btn btn-danger tap" onClick={v.suspend}>
                  {v.suspendLabel}
                </button>
                {" "}
                <button className="btn btn-danger tap" onClick={v.delAccount}>
                  {v.delLabel}
                </button>
                {" "}
              </div>
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
