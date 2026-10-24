// @ts-nocheck -- ported 1:1 from design/mockup/AdminAds.dc.html by scripts/port-mockup.mjs; typed as it gets wired to real data
"use client";

import React, { Fragment } from "react";
import { saveMode, SkLink, route } from "@/lib/sk/runtime";


export default class AdminAds extends React.Component<Record<string, any>, any> {
  static defaultProps = {"mode":"dark"};

  constructor(props) {
    super(props);
    var m = null; // light/dark arrives as props.mode from the sk-mode cookie
    this.state = { mode: m || props.mode || 'dark', master: false, slots: { sent: true, paused: true, inbox: true, home: true, rail: true, lobby: true, over: true, list: true, notif: false, settings: true, content: true, quiz: true, hint: true, insights: true, studio: true, notfound: false } };
    Object.assign(this.state, props.config || {});
  }
  componentDidMount() {
    var self = this;
    this.onStore = function (e) { if (e.key === 'sk-mode' && e.newValue) self.setState({ mode: e.newValue }); };
    try { window.addEventListener('storage', this.onStore); } catch (e) {}
  }
  componentWillUnmount() { try { window.removeEventListener('storage', this.onStore); } catch (e) {} }
  componentDidUpdate(prev, ps) {
    if (prev.mode !== this.props.mode && this.props.mode) this.setState({ mode: this.props.mode });
    var s = this.state, changed = ["master","slots"].some(function (k) { return ps[k] !== s[k]; });
    if (changed && this.props.save) { var o = {}; ["master","slots"].forEach(function (k) { o[k] = s[k]; }); this.props.save(o); }
  }
  renderVals() {
    var self = this, s = this.state, dark = s.mode !== 'light';
    var SL = [['sent', '“Sent!” screen', '300 × 250', 'high', 'Main.dc.html'], ['paused', 'Paused / reset link page', '300 × 250', 'high', 'Paused.dc.html'], ['inbox', 'Inbox in-feed', 'native, every 5th message', 'high', 'Inbox.dc.html'], ['home', 'Home feed banner', '320 × 100 / 728 × 90', 'high', 'Home.dc.html'], ['rail', 'Home right rail', '300 × 600, wide screens', 'high', 'HomeDesktop.dc.html'], ['lobby', 'Game lobby', '300 × 250 while waiting', 'high', 'NHIELobbyJoin.dc.html'], ['over', 'Game over', '320 × 100 / 728 × 90', 'medium', 'NHIE.dc.html'], ['list', 'Games listing', 'native, after 3rd game', 'medium', 'GamesHub.dc.html'], ['notif', 'Notifications end', '320 × 100', 'low', 'Notifications.dc.html'], ['settings', 'Settings bottom', '320 × 100', 'low', 'Settings.dc.html'], ['content', 'About & Help pages', 'banner / 300 × 250', 'medium', 'Help.dc.html'], ['quiz', 'Quiz results', '300 × 250', 'high', 'LinkQuiz.dc.html'], ['hint', 'Hint unlock (rewarded video)', 'full screen, opt-in', 'high', 'Inbox.dc.html'], ['insights', 'Link insights', '320 × 100 / 728 × 90', 'medium', 'LinkDetail.dc.html'], ['studio', 'Share studio after posting', '320 × 100', 'medium', 'ShareStudio.dc.html'], ['notfound', 'Page not found', '300 × 250', 'low', 'NotFound.dc.html']];
    var on = SL.filter(function (x) { return s.slots[x[0]]; }).length;
    var CL = [['Privacy policy with cookie and ads section', true, 'Legal.dc.html', 'View'], ['Terms of use', true, 'Legal.dc.html', 'View'], ['About page', true, 'About.dc.html', 'View'], ['Contact page with a form', true, 'Contact.dc.html', 'View'], ['Original help content', true, 'Help.dc.html', 'View'], ['Serious reports handled (review queue clear)', false, 'AdminReports.dc.html', 'Open'], ['Steady traffic for 4+ weeks', false, 'AdminTraffic.dc.html', 'Open'], ['Day-7 retention 20% or more', false, 'Admin.dc.html', 'Open']];
    var done = CL.filter(function (c) { return c[1]; }).length;
    return {
      mode: dark ? 'dark' : 'light', isDark: dark, isLight: !dark, modeWord: dark ? 'Light' : 'Dark',
      toggleMode: function () { var n = dark ? 'light' : 'dark'; saveMode(n); self.setState({ mode: n }); },
      kpis: [
        { label: 'Status', value: s.master ? 'Live' : 'Off', sub: s.master ? 'serving ads' : 'NEXT_PUBLIC_ADS_ENABLED=false' },
        { label: 'Slots on', value: on + ' / ' + SL.length, sub: 'ready when live' },
        { label: 'Est. impressions / day', value: s.master ? '18.4k' : '—', sub: 'from current traffic' },
        { label: 'Est. earnings / day', value: s.master ? '₦[—]' : '—', sub: 'depends on AdSense rates' }
      ],
      masterStr: s.master ? 'true' : 'false', masterHint: s.master ? 'Ads are live for everyone' : 'Off · turn on after AdSense approval',
      toggleMaster: function () { self.setState({ master: !s.master }); },
      slots: SL.map(function (x) { var v = !!s.slots[x[0]]; return { label: x[1], size: x[2], heat: x[3], href: x[4], on: v ? 'true' : 'false', op: s.master ? 1 : 0.6, toggle: function () { var o = Object.assign({}, s.slots); o[x[0]] = !v; self.setState({ slots: o }); } }; }),
      checklist: CL.map(function (c) { return { label: c[0], mark: c[1] ? '✓' : '·', bg: c[1] ? '#0d7f4b' : '#665e74', href: c[2], link: c[3] }; }),
      checkDone: done, checkTotal: CL.length, checkW: Math.round(done / CL.length * 100) + '%'
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
            <SkLink href="/admin/ads" className="nav-i" aria-current="page">
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
              <summary className="anav-i" aria-current="page">
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
                <SkLink href="/admin/ads" className="anav-s" aria-current="page">
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
                    Ads & AdSense
                  </h1>
                  <div className="muted" style={{ fontSize: "13px" }}>
                    Turn slots on without a deploy. Sample numbers.
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
                <SkLink href="/admin/reports" className="chip">
                  Reports
                </SkLink>
                <SkLink href="/admin/categories" className="chip">
                  Categories
                </SkLink>
                <SkLink href="/admin/ads" className="chip on">
                  Ads
                </SkLink>
                {" "}
              </div>
              {" "}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(170px, 1fr))", gap: "10px" }}>
                {" "}
                {(v.kpis || []).map((k, i0) => (
                  <Fragment key={i0}>
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
                  </Fragment>
                ))}
                {" "}
              </div>
              {" "}
              <div style={{ display: "flex", flexWrap: "wrap", gap: "12px", alignItems: "flex-start", marginTop: "12px" }}>
                {" "}
                <section className="card" style={{ flex: "1 1 460px", overflow: "hidden" }}>
                  {" "}
                  <div className="list-row" style={{ background: "var(--card2)" }}>
                    <span style={{ flex: "1" }}>
                      <b>
                        Ads master switch
                      </b>
                      <div className="muted" style={{ fontSize: "12.5px" }}>
                        {v.masterHint}
                      </div>
                    </span>
                    <button className="switch" role="switch" aria-checked={v.masterStr} aria-label="All ads" onClick={v.toggleMaster} />
                  </div>
                  {" "}
                  {(v.slots || []).map((x, i0) => (
                    <Fragment key={i0}>
                    {" "}
                    <div className="list-row" style={{ opacity: x.op }}>
                      <span style={{ flex: "1" }}>
                        <b style={{ fontSize: "14.5px" }}>
                          {x.label}
                        </b>
                        <div className="muted" style={{ fontSize: "12.5px" }}>
                          {x.size}{" · attention "}{x.heat}
                        </div>
                      </span>
                      <SkLink href={route(x.href)} className="pink" style={{ fontSize: "12.5px", marginRight: "10px" }}>
                        see it
                      </SkLink>
                      <button className="switch" role="switch" aria-checked={x.on} aria-label={x.label} onClick={x.toggle} />
                    </div>
                    {" "}
                    </Fragment>
                  ))}
                  {" "}
                </section>
                {" "}
                <section className="card" style={{ flex: "1 1 340px", padding: "18px" }}>
                  {" "}
                  <h2 style={{ fontSize: "18px" }}>
                    AdSense readiness
                  </h2>
                  {" "}
                  <div className="bar" style={{ marginTop: "12px" }}>
                    <span style={{ width: v.checkW }} />
                  </div>
                  {" "}
                  <div className="muted" style={{ fontSize: "13px", marginTop: "6px" }}>
                    {v.checkDone}{" of "}{v.checkTotal}{" done"}
                  </div>
                  {" "}
                  <ul style={{ listStyle: "none", margin: "12px 0 0", padding: "0", display: "flex", flexDirection: "column", gap: "8px" }}>
                    {" "}
                    {(v.checklist || []).map((c, i0) => (
                      <Fragment key={i0}>
                      {" "}
                      <li className="row" style={{ fontSize: "14px" }}>
                        <span style={{ width: "22px", height: "22px", borderRadius: "7px", display: "grid", placeItems: "center", background: c.bg, color: "#ffffff", fontSize: "13px", fontWeight: "800", flex: "none" }}>
                          {c.mark}
                        </span>
                        <span style={{ flex: "1" }}>
                          {c.label}
                        </span>
                        <SkLink href={route(c.href)} className="pink" style={{ fontSize: "13px" }}>
                          {c.link}
                        </SkLink>
                      </li>
                      {" "}
                      </Fragment>
                    ))}
                    {" "}
                  </ul>
                  {" "}
                  <SkLink href="/admin/ads/map" className="btn btn-block tap" style={{ marginTop: "14px" }}>
                    Open the placement map
                  </SkLink>
                  {" "}
                </section>
                {" "}
              </div>
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
