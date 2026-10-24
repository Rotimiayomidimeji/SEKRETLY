// @ts-nocheck -- ported 1:1 from design/mockup/Admin.dc.html by scripts/port-mockup.mjs; typed as it gets wired to real data
"use client";

import React, { Fragment } from "react";
import { saveMode, SkLink, route } from "@/lib/sk/runtime";


export default class Admin extends React.Component<Record<string, any>, any> {
  static defaultProps = {"mode":"dark"};

  constructor(props) {
    super(props);
    var m = null; // light/dark arrives as props.mode from the sk-mode cookie
    this.state = { mode: m || props.mode || 'dark', live: 37, tick: 0 };
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
    var D = this.props.dash || {};
    return {
      mode: dark ? 'dark' : 'light', isDark: dark, isLight: !dark, modeWord: dark ? 'Light' : 'Dark',
      toggleMode: function () { var n = dark ? 'light' : 'dark'; saveMode(n); self.setState({ mode: n }); },
      live: D.live || 0, kpis: D.kpis || [], hours: D.hours || [], topCats: D.topCats || [], retention: D.retention || [], funnel: D.funnel || [], feed: D.feed || []
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
            <SkLink href="/admin" className="nav-i" aria-current="page">
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
            <SkLink href="/admin" className="anav-i" aria-current="page">
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
                    Overview
                  </h1>
                  <div className="muted" style={{ fontSize: "13px" }}>
                    Sunday 19 October 2026 · sample data
                  </div>
                </div>
                {" "}
                <span className="pill">
                  <span className="live" style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#5be0a0" }} />
                  {v.live}{" online now"}
                </span>
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
                <SkLink href="/admin" className="chip on">
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
                <SkLink href="/admin/ads" className="chip">
                  Ads
                </SkLink>
                {" "}
              </div>
              {" "}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: "10px" }}>
                {" "}
                {(v.kpis || []).map((k, i0) => (
                  <Fragment key={i0}>
                  {" "}
                  <SkLink href={route(k.href)} className="card kpi tap" style={{ textDecoration: "none" }}>
                    <div className="muted" style={{ fontSize: "12.5px" }}>
                      {k.label}
                    </div>
                    <div className="v">
                      {k.value}
                    </div>
                    <div style={{ fontSize: "12px", color: k.c, fontWeight: "700" }}>
                      {k.delta}
                    </div>
                  </SkLink>
                  {" "}
                  </Fragment>
                ))}
                {" "}
              </div>
              {" "}
              <div style={{ display: "flex", flexWrap: "wrap", gap: "12px", marginTop: "12px" }}>
                {" "}
                <section className="card" style={{ flex: "2 1 520px", padding: "18px", minWidth: "0" }}>
                  {" "}
                  <div className="row">
                    <h2 className="grow" style={{ fontSize: "18px" }}>
                      Visitors, last 24 hours
                    </h2>
                    <SkLink href="/admin/traffic" className="pink" style={{ fontSize: "13px", fontWeight: "700" }}>
                      Open traffic manager
                    </SkLink>
                  </div>
                  {" "}
                  <div className="hbar" style={{ marginTop: "16px" }} aria-label="Hourly visitors chart">
                    {" "}
                    {(v.hours || []).map((h, i0) => (
                      <Fragment key={i0}>
                      <span style={{ height: h.h }} title={h.t} />
                      </Fragment>
                    ))}
                    {" "}
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
                      now
                    </span>
                  </div>
                  {" "}
                </section>
                {" "}
                <section className="card" style={{ flex: "1 1 320px", padding: "18px", minWidth: "0" }}>
                  {" "}
                  <div className="row">
                    <h2 className="grow" style={{ fontSize: "18px" }}>
                      Reports today
                    </h2>
                    <SkLink href="/admin/reports" className="pink" style={{ fontSize: "13px", fontWeight: "700" }}>
                      Review
                    </SkLink>
                  </div>
                  {" "}
                  <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginTop: "14px" }}>
                    {" "}
                    {(v.topCats || []).map((c, i0) => (
                      <Fragment key={i0}>
                      {" "}
                      <div>
                        <div className="row" style={{ fontSize: "13.5px" }}>
                          <b className="grow">
                            {c.label}
                          </b>
                          <span>
                            {c.n}
                          </span>
                        </div>
                        <div className="bar" style={{ marginTop: "5px" }}>
                          <span style={{ width: c.w }} />
                        </div>
                      </div>
                      {" "}
                      </Fragment>
                    ))}
                    {" "}
                  </div>
                  {" "}
                  <div className="card" style={{ marginTop: "14px", padding: "12px", background: "var(--card2)", fontSize: "13px" }}>
                    <b style={{ color: "var(--bad)" }}>
                      4 serious reports
                    </b>
                    {" need a human: 2 threats, 1 underage concern, 1 self-harm."}
                  </div>
                  {" "}
                </section>
                {" "}
              </div>
              {" "}
              <div style={{ display: "flex", flexWrap: "wrap", gap: "12px", marginTop: "12px" }}>
                {" "}
                <section className="card" style={{ flex: "1 1 300px", padding: "18px" }}>
                  {" "}
                  <h2 style={{ fontSize: "18px" }}>
                    Retention vs beta targets
                  </h2>
                  {" "}
                  <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginTop: "14px" }}>
                    {" "}
                    {(v.retention || []).map((r, i0) => (
                      <Fragment key={i0}>
                      {" "}
                      <div>
                        <div className="row" style={{ fontSize: "14px" }}>
                          <b className="grow">
                            {r.label}
                          </b>
                          <span>
                            {r.value}
                          </span>
                          <span className="muted">
                            {"target "}{r.target}
                          </span>
                        </div>
                        <div className="bar" style={{ marginTop: "6px" }}>
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
                <section className="card" style={{ flex: "1 1 300px", padding: "18px" }}>
                  {" "}
                  <h2 style={{ fontSize: "18px" }}>
                    Funnel this week
                  </h2>
                  {" "}
                  <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginTop: "14px" }}>
                    {" "}
                    {(v.funnel || []).map((f, i0) => (
                      <Fragment key={i0}>
                      {" "}
                      <div>
                        <div className="row" style={{ fontSize: "14px" }}>
                          <b className="grow">
                            {f.label}
                          </b>
                          <span>
                            {f.value}
                          </span>
                          <span className="muted">
                            {f.rate}
                          </span>
                        </div>
                        <div className="bar" style={{ marginTop: "6px" }}>
                          <span style={{ width: f.w }} />
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
                <section className="card" style={{ flex: "1.4 1 380px", padding: "18px", minWidth: "0" }}>
                  {" "}
                  <div className="row">
                    <h2 className="grow" style={{ fontSize: "18px" }}>
                      Live activity
                    </h2>
                    <span className="pill">
                      <span className="live" style={{ width: "7px", height: "7px", borderRadius: "50%", background: "#5be0a0" }} />
                      live
                    </span>
                  </div>
                  {" "}
                  <ul style={{ listStyle: "none", margin: "12px 0 0", padding: "0", display: "flex", flexDirection: "column", gap: "2px", maxHeight: "300px", overflow: "hidden" }}>
                    {" "}
                    {(v.feed || []).map((e, i0) => (
                      <Fragment key={i0}>
                      {" "}
                      <li className={`row ${e.cls}`} style={{ gap: "10px", padding: "8px 6px", borderRadius: "12px", fontSize: "13.5px" }}>
                        {" "}
                        <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: e.c, flex: "none" }} />
                        {" "}
                        <span className="grow" style={{ minWidth: "0", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                          {e.text}
                        </span>
                        {" "}
                        <span className="muted" style={{ fontSize: "12px", flex: "none" }}>
                          {e.t}
                        </span>
                        {" "}
                      </li>
                      {" "}
                      </Fragment>
                    ))}
                    {" "}
                  </ul>
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
