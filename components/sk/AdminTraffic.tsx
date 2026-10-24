// @ts-nocheck -- ported 1:1 from design/mockup/AdminTraffic.dc.html by scripts/port-mockup.mjs; typed as it gets wired to real data
"use client";

import React, { Fragment } from "react";
import { saveMode, SkLink } from "@/lib/sk/runtime";


export default class AdminTraffic extends React.Component<Record<string, any>, any> {
  static defaultProps = {"mode":"dark"};

  constructor(props) {
    super(props);
    var m = null; // light/dark arrives as props.mode from the sk-mode cookie
    this.state = { mode: m || props.mode || 'dark', range: 'today', filter: 'all', q: '', showIp: false, sel: null, live: 41, extra: 0, blockedIps: Object.assign({}, ((props.traffic || {}).today || {}).blockedIps) };
  }
  pool() {
    var states = [['Lagos', 'Ikeja'], ['Lagos', 'Lekki'], ['FCT', 'Abuja'], ['Oyo', 'Ibadan'], ['Rivers', 'Port Harcourt'], ['Enugu', 'Enugu'], ['Kano', 'Kano'], ['Kaduna', 'Zaria'], ['Ogun', 'Abeokuta'], ['Edo', 'Benin City'], ['Anambra', 'Awka'], ['Osun', 'Ile-Ife']];
    var nets = [['MTN', '102.89'], ['Airtel', '105.112'], ['Glo', '197.211'], ['MTN', '197.210'], ['9mobile', '41.190'], ['Wi-Fi · Spectranet', '41.217']];
    var devs = [['Mobile', 'Android', 'Chrome'], ['Mobile', 'iOS', 'Safari'], ['Mobile', 'Android', 'Opera Mini'], ['Mobile', 'Android', 'Instagram app'], ['Desktop', 'Windows', 'Chrome'], ['Mobile', 'iOS', 'WhatsApp app'], ['Tablet', 'Android', 'Chrome'], ['Desktop', 'macOS', 'Safari']];
    var srcs = ['WhatsApp', 'Instagram', 'Snapchat', 'Direct', 'WhatsApp', 'Google', 'TikTok', 'WhatsApp'];
    var lands = ['/peach/k7x2m9/sunset/describe-3', '/tolu/a81kd2/midnight/rate-me', '/', '/maya/q2n8x1/ocean/ama', '/g/MANGO7', '/peach/k7x2m9/sunset/describe-3', '/about', '/ada/z9p1mm/neon/confess'];
    var accts = ['Visitor', 'Visitor', '@tobi_x', 'Visitor', '@kola', 'Visitor', 'Visitor', '@maya', 'Visitor', '@ada'];
    var out = [];
    for (var i = 0; i < 26; i++) {
      var st = states[(i * 5) % states.length], n = nets[(i * 7) % nets.length], d = devs[(i * 3) % devs.length];
      var mins = i * 3 + (i % 4);
      out.push({
        id: 'v' + i,
        time: (21 - Math.floor(mins / 60)) + ':' + ('0' + (59 - mins % 60)).slice(-2),
        ip: n[1] + '.' + ((i * 37) % 250 + 3) + '.' + ((i * 91) % 250 + 2),
        vid: 'v_' + ((i * 2654435761) >>> 0).toString(16).slice(0, 6),
        visits: 1 + (i * 7) % 9,
        state: st[0], city: st[1], country: i % 13 === 12 ? 'Ghana' : 'Nigeria',
        net: n[0], device: d[0], os: d[1], browser: d[2],
        src: srcs[i % srcs.length], landing: lands[(i * 3) % lands.length],
        pages: 1 + (i * 5) % 7, dur: Math.floor(((i * 47) % 540) / 60) + 'm ' + ('0' + ((i * 47) % 60)).slice(-2) + 's',
        acct: accts[i % accts.length]
      });
    }
    return out;
  }
  componentDidMount() {
    var self = this;
    this.onStore = function (e) { if (e.key === 'sk-mode' && e.newValue) self.setState({ mode: e.newValue }); };
    try { window.addEventListener('storage', this.onStore); } catch (e) {}
  }
  componentWillUnmount() { try { window.removeEventListener('storage', this.onStore); } catch (e) {} clearInterval(this.iv); }
  componentDidUpdate(prev) { if (prev.mode !== this.props.mode && this.props.mode) this.setState({ mode: this.props.mode }); }
  renderVals() {
    var self = this, s = this.state, dark = s.mode !== 'light';
    var D = (this.props.traffic || {})[s.range] || { kpis: [], hours: [], heat: [], breakdowns: [], rows: [], totalCount: '0' };
    var all = D.rows;
    var q = s.q.trim().toLowerCase();
    var rows = all.filter(function (r) {
      if (s.filter === 'visitors' && r.acct !== 'Visitor') return false;
      if (s.filter === 'accounts' && r.acct === 'Visitor') return false;
      if (s.filter === 'mobile' && r.device !== 'Mobile') return false;
      if (s.filter === 'desktop' && r.device === 'Mobile') return false;
      if (s.filter === 'returning' && r.visits < 3) return false;
      if (q && (r.ip + ' ' + r.state + ' ' + r.city + ' ' + r.landing + ' ' + r.acct + ' ' + r.net).toLowerCase().indexOf(q) < 0) return false;
      return true;
    });
    var mask = function (ip) { if (s.showIp) return ip; var p = ip.split('.'); return p[0] + '.' + p[1] + '.•••.•••'; };
    var days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'], heat = [];
    days.forEach(function (d, di) { heat.push({ cls: 'hl', label: d, o: 1, t: d }); for (var hi = 0; hi < 24; hi++) heat.push({ cls: 'hc', label: '', o: (D.heat[di] || [])[hi] || '0.06', t: d + ' ' + hi + ':00' }); });
    var bd = function (b) { var max = (b.rows[0] || ['', 1])[1]; return { title: b.title, rows: b.rows.map(function (r) { return { label: r[0], v: r[1] + '%', w: Math.round(r[1] / max * 100) + '%' }; }) }; };
    var sel = s.sel ? all.filter(function (r) { return r.id === s.sel; })[0] : null;
    var hintTime = sel ? (parseInt(sel.time, 10) >= 21 || sel.time === 'just now' ? 'late at night' : 'in the evening') : '';
    return {
      mode: dark ? 'dark' : 'light', isDark: dark, isLight: !dark, modeWord: dark ? 'Light' : 'Dark',
      toggleMode: function () { var n = dark ? 'light' : 'dark'; saveMode(n); self.setState({ mode: n }); },
      ranges: [['today', 'Today'], ['week', '7 days'], ['month', '30 days']].map(function (r) { return { label: r[1], on: s.range === r[0] ? 'true' : 'false', pick: function () { self.setState({ range: r[0] }); } }; }),
      rangeLabel: { today: 'Today, Lagos time', week: 'Average day, last 7 days', month: 'Average day, last 30 days' }[s.range],
      live: this.props.live || 0, kpis: D.kpis, hours: D.hours, breakdowns: D.breakdowns.map(bd),
      heatHead: D.hours.map(function (h, i) { return i % 3 === 0 ? String(i) : ''; }),
      heat: heat,
      q: s.q, onQ: function (e) { self.setState({ q: e.target.value }); },
      ipStr: s.showIp ? 'true' : 'false', ipShown: s.showIp, toggleIp: function () { self.setState({ showIp: !s.showIp }); },
      filters: [['all', 'All'], ['visitors', 'Visitors'], ['accounts', 'Accounts'], ['mobile', 'Mobile'], ['desktop', 'Desktop & tablet'], ['returning', 'Returning 3+']].map(function (f) { var on = s.filter === f[0]; return { label: f[1], on: on ? 'true' : 'false', cls: on ? 'on' : '', pick: function () { self.setState({ filter: f[0] }); } }; }),
      rows: rows.map(function (r) { return {
        time: r.time, ip: mask(r.ip) + (s.blockedIps[r.ip] ? ' ⛔' : ''), vid: r.vid, visits: r.visits, loc: r.city + ', ' + r.state + (r.country !== 'Nigeria' ? ' · ' + r.country : ''),
        net: r.net, device: r.device, osb: r.os + ' · ' + r.browser, src: r.src, landing: r.landing, pages: r.pages, dur: r.dur,
        acct: r.acct, acctC: r.acct === 'Visitor' ? 'var(--muted)' : 'var(--pink)', cls: r.fresh ? 'fresh' : '',
        open: function () { self.setState({ sel: r.id }); }
      }; }),
      shownCount: rows.length, totalCount: D.totalCount,
      hasSel: !!sel,
      sel: sel ? { ip: mask(sel.ip), time: sel.time, hint: 'Someone in ' + sel.state + ', on ' + (sel.os === 'iOS' ? 'an iPhone' : (sel.device === 'Mobile' ? 'an Android phone' : 'a computer')) + ', ' + hintTime } : { ip: '', time: '', hint: '' },
      selFacts: sel ? [
        { k: 'Visitor ID', v: sel.vid }, { k: 'Visits from this device', v: sel.visits + ' total' },
        { k: 'Location (approx.)', v: sel.city + ', ' + sel.state + ', ' + sel.country }, { k: 'Network', v: sel.net },
        { k: 'Device', v: sel.device }, { k: 'System · browser', v: sel.os + ' · ' + sel.browser },
        { k: 'Came from', v: sel.src }, { k: 'Time on site', v: sel.dur },
        { k: 'Account', v: sel.acct }, { k: 'Local time', v: sel.time === 'just now' ? 'now' : sel.time }
      ] : [],
      selPath: sel ? sel.trail : [],
      selHasAcct: !!(sel && sel.acct !== 'Visitor'),
      blockIpLabel: sel && s.blockedIps[sel.ip] ? 'Unblock this IP' : 'Block this IP (abuse only)',
      toggleBlockIp: function () { if (!sel) return; var b = Object.assign({}, s.blockedIps); b[sel.ip] = !b[sel.ip]; self.setState({ blockedIps: b }); self.props.setIpBlocked(sel.ip, !!b[sel.ip]); },
      closeSel: function () { self.setState({ sel: null }); },
      stop: function (e) { e.stopPropagation(); }
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
            <SkLink href="/admin/traffic" className="nav-i" aria-current="page">
              Traffic manager
            </SkLink>
            {" "}
            <SkLink href="/admin/users" className="nav-i">
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
            <SkLink href="/admin/traffic" className="anav-i" aria-current="page">
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
              <header className="topbar" style={{ flexWrap: "wrap" }}>
                {" "}
                <div className="grow" style={{ flex: "1 1 240px" }}>
                  <h1 style={{ fontSize: "28px" }}>
                    Traffic manager
                  </h1>
                  <div className="muted" style={{ fontSize: "13px" }}>
                    Who visits, from where, on what, and how. No names, ever.
                  </div>
                </div>
                {" "}
                <div className="seg2" role="group" aria-label="Date range">
                  {(v.ranges || []).map((r, i0) => (
                    <Fragment key={i0}>
                    <button aria-pressed={r.on} onClick={r.pick}>
                      {r.label}
                    </button>
                    </Fragment>
                  ))}
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
                <SkLink href="/admin/traffic" className="chip on">
                  Traffic
                </SkLink>
                <SkLink href="/admin/users" className="chip">
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
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: "10px" }}>
                {" "}
                <div className="card kpi" style={{ borderColor: "#5be0a0" }}>
                  <div className="muted row" style={{ fontSize: "12.5px", gap: "6px" }}>
                    <span className="live" style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#5be0a0" }} />
                    Live now
                  </div>
                  <div className="v">
                    {v.live}
                  </div>
                  <div className="muted" style={{ fontSize: "12px" }}>
                    on the site this minute
                  </div>
                </div>
                {" "}
                {(v.kpis || []).map((k, i0) => (
                  <Fragment key={i0}>
                  {" "}
                  <div className="card kpi">
                    <div className="muted" style={{ fontSize: "12.5px" }}>
                      {k.label}
                    </div>
                    <div className="v">
                      {k.value}
                    </div>
                    <div className="muted" style={{ fontSize: "12px" }}>
                      {k.sub}
                    </div>
                  </div>
                  {" "}
                  </Fragment>
                ))}
                {" "}
              </div>
              {" "}
              <section className="card" style={{ padding: "18px", marginTop: "12px" }}>
                {" "}
                <div className="row">
                  <h2 className="grow" style={{ fontSize: "18px" }}>
                    Visits by hour
                  </h2>
                  <span className="muted" style={{ fontSize: "12.5px" }}>
                    {v.rangeLabel}
                  </span>
                </div>
                {" "}
                <div className="hbar" style={{ marginTop: "14px" }}>
                  {(v.hours || []).map((h, i0) => (
                    <Fragment key={i0}>
                    <span style={{ height: h.h }} title={h.t} />
                    </Fragment>
                  ))}
                </div>
                {" "}
                <div className="muted row" style={{ justifyContent: "space-between", fontSize: "11.5px", marginTop: "6px" }}>
                  <span>
                    12am
                  </span>
                  <span>
                    6am
                  </span>
                  <span>
                    12pm
                  </span>
                  <span>
                    6pm
                  </span>
                  <span>
                    11pm
                  </span>
                </div>
                {" "}
              </section>
              {" "}
              <div className="tm-grid" style={{ marginTop: "12px" }}>
                {" "}
                {(v.breakdowns || []).map((b, i0) => (
                  <Fragment key={i0}>
                  {" "}
                  <section className="card" style={{ padding: "18px" }}>
                    {" "}
                    <h2 style={{ fontSize: "16px" }}>
                      {b.title}
                    </h2>
                    {" "}
                    <div style={{ display: "flex", flexDirection: "column", gap: "9px", marginTop: "12px" }}>
                      {" "}
                      {(b.rows || []).map((r, i2) => (
                        <Fragment key={i2}>
                        {" "}
                        <div>
                          <div className="row" style={{ fontSize: "13px" }}>
                            <span className="grow">
                              {r.label}
                            </span>
                            <b>
                              {r.v}
                            </b>
                          </div>
                          <div className="bar" style={{ marginTop: "4px", height: "7px" }}>
                            <span style={{ width: r.w }} />
                          </div>
                        </div>
                        {" "}
                        </Fragment>
                      ))}
                      {" "}
                    </div>
                    {" "}
                  </section>
                  {" "}
                  </Fragment>
                ))}
                {" "}
              </div>
              {" "}
              <section className="card" style={{ padding: "18px", marginTop: "12px", overflowX: "auto" }}>
                {" "}
                <h2 style={{ fontSize: "16px" }}>
                  {"Peak hours "}
                  <span className="muted" style={{ fontWeight: "500", fontSize: "13px" }}>
                    · darker means busier
                  </span>
                </h2>
                {" "}
                <div className="heat" style={{ marginTop: "12px", minWidth: "640px" }}>
                  {" "}
                  <span />
                  {" "}
                  {(v.heatHead || []).map((hh, i0) => (
                    <Fragment key={i0}>
                    <span className="muted" style={{ textAlign: "center" }}>
                      {hh}
                    </span>
                    </Fragment>
                  ))}
                  {" "}
                  {(v.heat || []).map((cell, i0) => (
                    <Fragment key={i0}>
                    <span className={cell.cls} style={{ opacity: cell.o }} title={cell.t}>
                      {cell.label}
                    </span>
                    </Fragment>
                  ))}
                  {" "}
                </div>
                {" "}
              </section>
              {" "}
              <section className="card" style={{ marginTop: "12px", overflow: "hidden" }}>
                {" "}
                <div className="row" style={{ padding: "16px 16px 0", flexWrap: "wrap", gap: "10px" }}>
                  {" "}
                  <h2 className="grow" style={{ fontSize: "18px" }}>
                    {"Visit log "}
                    <span className="pill" style={{ marginLeft: "6px" }}>
                      <span className="live" style={{ width: "7px", height: "7px", borderRadius: "50%", background: "#5be0a0" }} />
                      live
                    </span>
                  </h2>
                  {" "}
                  <label htmlFor="tm-q" className="sr">
                    Search visits
                  </label>
                  {" "}
                  <input id="tm-q" className="field" value={v.q ?? ""} onChange={v.onQ} placeholder="Search IP, state, page, @user" style={{ minHeight: "42px", width: "260px", fontSize: "14px" }} />
                  {" "}
                  <div className="row" style={{ gap: "8px" }}>
                    {" "}
                    <span style={{ fontSize: "13px", fontWeight: "700" }}>
                      Show full IPs
                    </span>
                    {" "}
                    <button className="switch" role="switch" aria-checked={v.ipStr} aria-label="Show full IP addresses" onClick={v.toggleIp} />
                    {" "}
                  </div>
                  {" "}
                </div>
                {" "}
                <div className="rail" style={{ display: "flex", gap: "8px", padding: "12px 16px" }}>
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
                {v.ipShown ? (
                  <>
                  <div style={{ margin: "0 16px 10px", padding: "10px 12px", borderRadius: "12px", background: "rgba(255,176,32,.14)", fontSize: "13px" }}>
                    <b>
                      Full IPs visible.
                    </b>
                    {" This view is logged with your admin name and time."}
                  </div>
                  </>
                ) : null}
                {" "}
                <div className="adm-scroll" style={{ maxHeight: "560px", borderRadius: "0" }}>
                  {" "}
                  <table className="adm-table">
                    <thead>
                      <tr>
                        <th>
                          Time
                        </th>
                        <th>
                          IP address
                        </th>
                        <th>
                          Visitor
                        </th>
                        <th>
                          Visits
                        </th>
                        <th>
                          Location
                        </th>
                        <th>
                          Network
                        </th>
                        <th>
                          Device
                        </th>
                        <th>
                          OS · Browser
                        </th>
                        <th>
                          Came from
                        </th>
                        <th>
                          Landing page
                        </th>
                        <th>
                          Pages
                        </th>
                        <th>
                          Time on site
                        </th>
                        <th>
                          Account
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {(v.rows || []).map((r, i0) => (
                        <Fragment key={i0}>
                        <tr onClick={r.open} className={r.cls}>
                          <td className="muted">
                            {r.time}
                          </td>
                          <td className="mono">
                            {r.ip}
                          </td>
                          <td className="mono muted">
                            {r.vid}
                          </td>
                          <td>
                            <span className="pill" style={{ padding: "3px 8px" }}>
                              {r.visits}×
                            </span>
                          </td>
                          <td>
                            {r.loc}
                          </td>
                          <td>
                            {r.net}
                          </td>
                          <td>
                            {r.device}
                          </td>
                          <td>
                            {r.osb}
                          </td>
                          <td>
                            {r.src}
                          </td>
                          <td className="mono">
                            {r.landing}
                          </td>
                          <td>
                            {r.pages}
                          </td>
                          <td>
                            {r.dur}
                          </td>
                          <td>
                            <span style={{ color: r.acctC, fontWeight: "700" }}>
                              {r.acct}
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
                <div className="muted" style={{ padding: "12px 16px", fontSize: "12.5px", borderTop: "1px solid var(--line)" }}>
                  {"Showing "}{v.shownCount}{" of "}{v.totalCount}{" visits · IP addresses are kept for 30 days, admins only. Location is approximate, from the IP and network."}
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
            <div className="sheet" role="dialog" aria-label="Visit details" onClick={v.stop} style={{ maxWidth: "560px" }}>
              {" "}
              <div className="row">
                {" "}
                <div className="grow">
                  <div className="muted" style={{ fontSize: "12.5px" }}>
                    {"Visit · "}{v.sel.time}{" today"}
                  </div>
                  <div className="mono" style={{ fontSize: "18px", fontWeight: "800", marginTop: "2px" }}>
                    {v.sel.ip}
                  </div>
                </div>
                {" "}
                <button className="icon-btn tap" onClick={v.closeSel} aria-label="Close">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" aria-hidden="true">
                    <path d="M6 6l12 12M18 6 6 18" />
                  </svg>
                </button>
                {" "}
              </div>
              {" "}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: "8px", marginTop: "14px" }}>
                {" "}
                {(v.selFacts || []).map((f, i0) => (
                  <Fragment key={i0}>
                  {" "}
                  <div className="card" style={{ padding: "10px 12px", background: "var(--card2)" }}>
                    <div className="muted" style={{ fontSize: "11.5px", fontWeight: "800", letterSpacing: ".06em", textTransform: "uppercase" }}>
                      {f.k}
                    </div>
                    <div style={{ fontWeight: "700", fontSize: "14px", marginTop: "2px" }}>
                      {f.v}
                    </div>
                  </div>
                  {" "}
                  </Fragment>
                ))}
                {" "}
              </div>
              {" "}
              <h3 style={{ fontSize: "15px", marginTop: "16px" }}>
                Path on this visit
              </h3>
              {" "}
              <ol style={{ listStyle: "none", margin: "8px 0 0", padding: "0", borderLeft: "2px solid var(--line)", marginLeft: "6px" }}>
                {" "}
                {(v.selPath || []).map((p, i0) => (
                  <Fragment key={i0}>
                  {" "}
                  <li style={{ position: "relative", padding: "0 0 12px 16px" }}>
                    <span style={{ position: "absolute", left: "-6px", top: "4px", width: "10px", height: "10px", borderRadius: "50%", background: "#ff3b8d" }} />
                    <span className="mono">
                      {p.page}
                    </span>
                    {" "}
                    <span className="muted" style={{ fontSize: "12.5px" }}>
                      {"· "}{p.t}
                    </span>
                  </li>
                  {" "}
                  </Fragment>
                ))}
                {" "}
              </ol>
              {" "}
              <div className="card" style={{ padding: "12px 14px", marginTop: "6px", background: "var(--card2)" }}>
                {" "}
                <div className="muted" style={{ fontSize: "11.5px", fontWeight: "800", letterSpacing: ".08em", textTransform: "uppercase" }}>
                  Hint preview · later, for receivers
                </div>
                {" "}
                <p style={{ marginTop: "6px", fontSize: "14px", lineHeight: "1.45" }}>
                  “{v.sel.hint}”
                </p>
                {" "}
                <p className="muted" style={{ marginTop: "4px", fontSize: "12px" }}>
                  Only vague fields are ever used in hints. Never the IP, visitor ID or exact place.
                </p>
                {" "}
              </div>
              {" "}
              <div className="row" style={{ gap: "8px", marginTop: "14px" }}>
                {" "}
                <button className="btn btn-danger tap" onClick={v.toggleBlockIp} style={{ flex: "1" }}>
                  {v.blockIpLabel}
                </button>
                {" "}
                {v.selHasAcct ? (
                  <>
                  <SkLink href="/admin/users" className="btn tap" style={{ flex: "1" }}>
                    Open account
                  </SkLink>
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
        ) : null}
        {" "}
      </div>
      {" "}
      </>
    );
  }
}
