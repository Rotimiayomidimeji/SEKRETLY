// @ts-nocheck -- ported 1:1 from design/mockup/AdminCategories.dc.html by scripts/port-mockup.mjs; typed as it gets wired to real data
"use client";

import React, { Fragment } from "react";
import { saveMode, SkLink } from "@/lib/sk/runtime";


export default class AdminCategories extends React.Component<Record<string, any>, any> {
  static defaultProps = {"mode":"dark"};

  constructor(props) {
    super(props);
    var m = null; // light/dark arrives as props.mode from the sk-mode cookie
    this.state = { mode: m || props.mode || 'dark', cur: 'Abusive', q: '', page: 1, minS: 5, maxS: 10, seed: 2, extraCats: [], inactive: {}, seriousOver: {}, added: {}, deleted: {}, newCat: '', newMsg: '', previewIdx: 0 };
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
    var s = this.state, changed = ["minS","maxS","extraCats","inactive","seriousOver","added","deleted"].some(function (k) { return ps[k] !== s[k]; });
    if (changed && this.props.save) { var o = {}; ["minS","maxS","extraCats","inactive","seriousOver","added","deleted"].forEach(function (k) { o[k] = s[k]; }); this.props.save(o); }
  }
  renderVals() {
    var self = this, s = this.state, dark = s.mode !== 'light';
    var CATS = ['Abusive', 'Harassment', 'Bullying', 'Insults', 'Threats', 'Intimidation', 'Hate speech', 'Racism', 'Tribalism', 'Religious hate', 'Sexism', 'Body shaming', 'Disability mockery', 'Sexual content', 'Unwanted nudity', 'Explicit photo', 'Explicit video', 'Non-consensual image', 'Unwanted advances', 'Creepy or inappropriate', 'Grooming concern', 'Underage concern', 'Stalking', 'Doxxing / private info', 'Exposing secrets', 'Blackmail', 'Extortion', 'Impersonation', 'Scam', 'Fraud', 'Phishing link', 'Malware link', 'Spam', 'Flooding', 'Advertising', 'Selling things', 'Gambling promo', 'Drugs', 'Weapons', 'Violence', 'Graphic gore', 'Self-harm', 'Suicide talk', 'Misinformation', 'False rumour', 'Defamation', 'Trolling', 'Mocking', 'Profanity', 'Other harmful'].concat(s.extraCats);
    var SERIOUS = ['Threats', 'Grooming concern', 'Underage concern', 'Non-consensual image', 'Blackmail', 'Extortion', 'Self-harm', 'Suicide talk', 'Weapons'];
    var isSerious = function (c) { return s.seriousOver[c] !== undefined ? s.seriousOver[c] : SERIOUS.indexOf(c) >= 0; };
    var gen = function (c) {
      var T = ['Your message to {receiver} was reported as “' + c + '”.', '{receiver} flagged something you sent as “' + c + '”.', 'Heads up: a message you sent was marked “' + c + '” by the person who got it.', 'A message you sent to {receiver} was reported for “' + c + '”.', '{receiver} didn’t like that one. It was reported as “' + c + '”.', 'Your recent message was reported under “' + c + '”.', 'Someone you messaged reported it as “' + c + '”.', 'Your message to {receiver} crossed a line for them: “' + c + '”.', 'Reported: your message to {receiver} was marked “' + c + '”.', '{receiver} reported your message for “' + c + '”.'];
      var S = [' This is warning {n} of 3.', ' After 3 warnings, the next report blocks you from messaging {receiver}.', ' Keep it respectful.', ' Think before you send next time.', ' Warning {n} of 3. You can still message others as normal.'];
      var out = [];
      T.forEach(function (t) { S.forEach(function (x) { out.push(t + x); }); });
      return out.concat(s.added[c] || []).filter(function (txt) { return !(s.deleted[c] || {})[txt]; });
    };
    var all = gen(s.cur);
    var per = 10, pages = Math.max(1, Math.ceil(all.length / per)), page = Math.min(s.page, pages);
    var fill = function (t) { return t.replace(/\{receiver\}/g, '@peach').replace(/\{n\}/g, '2'); };
    var q = s.q.trim().toLowerCase();
    var sample = (function () { var arr = CATS.filter(function (c) { return !s.inactive[c]; }), out = [], x = s.seed * 9301 + 49297, n = s.minS + (s.seed * 7) % (s.maxS - s.minS + 1); while (out.length < n && arr.length) { x = (x * 9301 + 49297) % 233280; out.push(arr.splice(Math.floor(x / 233280 * arr.length), 1)[0]); } return out; })();
    return {
      mode: dark ? 'dark' : 'light', isDark: dark, isLight: !dark, modeWord: dark ? 'Light' : 'Dark',
      toggleMode: function () { var n = dark ? 'light' : 'dark'; saveMode(n); self.setState({ mode: n }); },
      minShow: s.minS, maxShow: s.maxS,
      minDec: function () { self.setState({ minS: Math.max(3, s.minS - 1) }); }, minInc: function () { self.setState({ minS: Math.min(s.maxS, s.minS + 1) }); },
      maxDec: function () { self.setState({ maxS: Math.max(s.minS, s.maxS - 1) }); }, maxInc: function () { self.setState({ maxS: Math.min(15, s.maxS + 1) }); },
      sample: sample, reshuffle: function () { self.setState({ seed: s.seed + 1 }); },
      q: s.q, onQ: function (e) { self.setState({ q: e.target.value }); }, catCount: CATS.length,
      list: CATS.filter(function (c) { return !q || c.toLowerCase().indexOf(q) >= 0; }).map(function (c) { var on = c === s.cur; return { name: c, cur: on ? 'true' : 'false', serious: isSerious(c), count: gen(c).length, op: s.inactive[c] ? 0.45 : 1, pick: function () { self.setState({ cur: c, page: 1, previewIdx: 0 }); } }; }),
      newCat: s.newCat, onNewCat: function (e) { self.setState({ newCat: e.target.value }); },
      addCat: function () { var c = s.newCat.trim(); if (c && CATS.indexOf(c) < 0) self.setState({ extraCats: s.extraCats.concat([c]), cur: c, newCat: '', page: 1 }); },
      cur: s.cur,
      activeStr: s.inactive[s.cur] ? 'false' : 'true', toggleActive: function () { var o = Object.assign({}, s.inactive); o[s.cur] = !o[s.cur]; self.setState({ inactive: o }); },
      seriousStr: isSerious(s.cur) ? 'true' : 'false', toggleSerious: function () { var o = Object.assign({}, s.seriousOver); o[s.cur] = !isSerious(s.cur); self.setState({ seriousOver: o }); },
      seriousHint: isSerious(s.cur) ? 'Serious: warnings still go out automatically, and every report also lands in the admin review queue.' : 'Normal: warnings and the 4th-report block happen automatically. No admin needed.',
      preview: fill(all[Math.min(s.previewIdx, all.length - 1)] || ''),
      msgCount: all.length,
      msgs: all.slice((page - 1) * per, page * per).map(function (t, i) { var idx = (page - 1) * per + i; return { n: idx + 1, text: t, use: function () { self.setState({ previewIdx: idx }); }, del: function () { var d = Object.assign({}, s.deleted); var dc = Object.assign({}, d[s.cur] || {}); dc[t] = true; d[s.cur] = dc; self.setState({ deleted: d }); } }; }),
      page: page, pages: pages, noPrev: page <= 1, noNext: page >= pages,
      prev: function () { self.setState({ page: Math.max(1, page - 1) }); }, next: function () { self.setState({ page: Math.min(pages, page + 1) }); },
      newMsg: s.newMsg, onNewMsg: function (e) { self.setState({ newMsg: e.target.value }); },
      addMsg: function () { var t = s.newMsg.trim(); if (!t) return; var a = Object.assign({}, s.added); a[s.cur] = (a[s.cur] || []).concat([t]); self.setState({ added: a, newMsg: '', page: Math.ceil((all.length + 1) / per), previewIdx: all.length }); }
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
            <SkLink href="/admin/categories" className="nav-i" aria-current="page">
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
                <SkLink href="/admin/categories" className="anav-s" aria-current="page">
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
                    Report categories
                  </h1>
                  <div className="muted" style={{ fontSize: "13px" }}>
                    No banned words. Reporters pick a category, and the sender gets one of its warning messages at random.
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
                <SkLink href="/admin/categories" className="chip on">
                  Categories
                </SkLink>
                <SkLink href="/admin/ads" className="chip">
                  Ads
                </SkLink>
                {" "}
              </div>
              {" "}
              <section className="card" style={{ padding: "16px", display: "flex", flexWrap: "wrap", gap: "16px 28px", alignItems: "center" }}>
                {" "}
                <div style={{ flex: "1 1 320px" }}>
                  {" "}
                  <b>
                    What reporters see
                  </b>
                  {" "}
                  <div className="muted" style={{ fontSize: "13px", marginTop: "4px" }}>
                    {"Each time someone taps Report, they get "}
                    <b style={{ color: "var(--ink)" }}>
                      {v.minShow}–{v.maxShow}
                    </b>
                    {" random categories, plus “Other reason”."}
                  </div>
                  {" "}
                  <div className="row" style={{ gap: "8px", marginTop: "10px" }}>
                    {" "}
                    <span className="muted" style={{ fontSize: "13px" }}>
                      Min
                    </span>
                    <button className="icon-btn tap" onClick={v.minDec} aria-label="Fewer minimum" style={{ width: "36px", height: "36px" }}>
                      −
                    </button>
                    <b>
                      {v.minShow}
                    </b>
                    <button className="icon-btn tap" onClick={v.minInc} aria-label="More minimum" style={{ width: "36px", height: "36px" }}>
                      +
                    </button>
                    {" "}
                    <span className="muted" style={{ fontSize: "13px", marginLeft: "12px" }}>
                      Max
                    </span>
                    <button className="icon-btn tap" onClick={v.maxDec} aria-label="Fewer maximum" style={{ width: "36px", height: "36px" }}>
                      −
                    </button>
                    <b>
                      {v.maxShow}
                    </b>
                    <button className="icon-btn tap" onClick={v.maxInc} aria-label="More maximum" style={{ width: "36px", height: "36px" }}>
                      +
                    </button>
                    {" "}
                  </div>
                  {" "}
                </div>
                {" "}
                <div style={{ flex: "2 1 420px" }}>
                  {" "}
                  <div className="row">
                    <span className="muted grow" style={{ fontSize: "12px", fontWeight: "800", letterSpacing: ".08em", textTransform: "uppercase" }}>
                      Sample report sheet
                    </span>
                    <button className="btn btn-sm btn-ghost" onClick={v.reshuffle} style={{ border: "0", color: "var(--pink)" }}>
                      Shuffle
                    </button>
                  </div>
                  {" "}
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", marginTop: "8px" }}>
                    {" "}
                    {(v.sample || []).map((c, i0) => (
                      <Fragment key={i0}>
                      <span className="reason" style={{ display: "inline-flex", alignItems: "center", minHeight: "36px", fontSize: "13px" }}>
                        {c}
                      </span>
                      </Fragment>
                    ))}
                    {" "}
                    <span className="reason" style={{ display: "inline-flex", alignItems: "center", minHeight: "36px", fontSize: "13px", borderStyle: "dashed", color: "var(--pink)" }}>
                      Other reason
                    </span>
                    {" "}
                  </div>
                  {" "}
                </div>
                {" "}
              </section>
              {" "}
              <div className="ac-wrap" style={{ marginTop: "12px" }}>
                {" "}
                <section className="card ac-list" style={{ overflow: "hidden" }}>
                  {" "}
                  <div style={{ padding: "12px" }}>
                    {" "}
                    <label htmlFor="ac-q" className="sr">
                      Search categories
                    </label>
                    {" "}
                    <input id="ac-q" className="field" value={v.q ?? ""} onChange={v.onQ} placeholder={`Search ${v.catCount} categories`} style={{ minHeight: "42px", fontSize: "14px" }} />
                    {" "}
                  </div>
                  {" "}
                  <div style={{ maxHeight: "760px", overflowY: "auto", borderTop: "1px solid var(--line)" }}>
                    {" "}
                    {(v.list || []).map((c, i0) => (
                      <Fragment key={i0}>
                      {" "}
                      <button className="ac-item" onClick={c.pick} aria-current={c.cur} style={{ opacity: c.op }}>
                        {" "}
                        <span className="grow">
                          {c.name}
                        </span>
                        {" "}
                        {c.serious ? (
                          <>
                          <span className="pill" style={{ padding: "2px 7px", fontSize: "10.5px", background: "rgba(196,33,58,.18)", color: "var(--bad)" }}>
                            Serious
                          </span>
                          </>
                        ) : null}
                        {" "}
                        <span className="muted" style={{ fontSize: "12px" }}>
                          {c.count}
                        </span>
                        {" "}
                      </button>
                      {" "}
                      </Fragment>
                    ))}
                    {" "}
                  </div>
                  {" "}
                  <div className="row" style={{ gap: "8px", padding: "12px", borderTop: "1px solid var(--line)" }}>
                    {" "}
                    <label htmlFor="ac-new" className="sr">
                      New category name
                    </label>
                    {" "}
                    <input id="ac-new" className="field" value={v.newCat ?? ""} onChange={v.onNewCat} placeholder="New category" style={{ minHeight: "42px", fontSize: "14px" }} />
                    {" "}
                    <button className="btn btn-sm btn-cta tap" onClick={v.addCat}>
                      Add
                    </button>
                    {" "}
                  </div>
                  {" "}
                </section>
                {" "}
                <section className="card ac-detail" style={{ padding: "18px" }}>
                  {" "}
                  <div className="row" style={{ flexWrap: "wrap", gap: "10px" }}>
                    {" "}
                    <h2 className="grow" style={{ fontSize: "24px" }}>
                      {v.cur}
                    </h2>
                    {" "}
                    <span className="row" style={{ gap: "8px", fontSize: "13px", fontWeight: "700" }}>
                      {"Active "}
                      <button className="switch" role="switch" aria-checked={v.activeStr} aria-label="Category active" onClick={v.toggleActive} />
                    </span>
                    {" "}
                    <span className="row" style={{ gap: "8px", fontSize: "13px", fontWeight: "700" }}>
                      {"Serious "}
                      <button className="switch" role="switch" aria-checked={v.seriousStr} aria-label="Send to human review" onClick={v.toggleSerious} />
                    </span>
                    {" "}
                  </div>
                  {" "}
                  <p className="muted" style={{ fontSize: "13px", marginTop: "6px" }}>
                    {v.seriousHint}
                  </p>
                  {" "}
                  <div className="card" style={{ marginTop: "14px", padding: "12px 14px", background: "var(--card2)" }}>
                    {" "}
                    <div className="muted" style={{ fontSize: "11.5px", fontWeight: "800", letterSpacing: ".08em", textTransform: "uppercase" }}>
                      Preview · what the sender gets (warning 2 of 3 to @peach)
                    </div>
                    {" "}
                    <div className="row" style={{ gap: "10px", marginTop: "8px", alignItems: "flex-start" }}>
                      {" "}
                      <span className="av" style={{ width: "36px", height: "36px", borderRadius: "12px", background: "linear-gradient(135deg,#ffb020,#c4213a)" }}>
                        <img src="/sk/bell.png" alt="" />
                      </span>
                      {" "}
                      <p style={{ fontSize: "14.5px", lineHeight: "1.45" }}>
                        {v.preview}
                      </p>
                      {" "}
                    </div>
                    {" "}
                  </div>
                  {" "}
                  <div className="row" style={{ marginTop: "18px" }}>
                    <h3 className="grow" style={{ fontSize: "16px" }}>
                      {"Warning messages "}
                      <span className="muted" style={{ fontWeight: "500" }}>
                        {"· "}{v.msgCount}{" · picked at random"}
                      </span>
                    </h3>
                    <span className="muted" style={{ fontSize: "12.5px" }}>
                      {"Placeholders: "}
                      <span className="ph">
                        {"{"}receiver{"}"}
                      </span>
                      {" "}
                      <span className="ph">
                        {"{"}n{"}"}
                      </span>
                    </span>
                  </div>
                  {" "}
                  <ol style={{ listStyle: "none", margin: "10px 0 0", padding: "0", display: "flex", flexDirection: "column", gap: "6px" }}>
                    {" "}
                    {(v.msgs || []).map((m, i0) => (
                      <Fragment key={i0}>
                      {" "}
                      <li className="row" style={{ gap: "10px", padding: "10px 12px", borderRadius: "14px", border: "1px solid var(--line)", fontSize: "14px" }}>
                        {" "}
                        <span className="muted mono" style={{ width: "26px", flex: "none" }}>
                          {m.n}
                        </span>
                        {" "}
                        <span className="grow" style={{ lineHeight: "1.4" }}>
                          {m.text}
                        </span>
                        {" "}
                        <button className="btn btn-sm btn-ghost tap" onClick={m.use} style={{ border: "0" }}>
                          Preview
                        </button>
                        {" "}
                        <button className="icon-btn tap" onClick={m.del} aria-label="Delete message" style={{ width: "34px", height: "34px", borderRadius: "10px" }}>
                          ×
                        </button>
                        {" "}
                      </li>
                      {" "}
                      </Fragment>
                    ))}
                    {" "}
                  </ol>
                  {" "}
                  <div className="row" style={{ justifyContent: "space-between", marginTop: "10px" }}>
                    {" "}
                    <button className="btn btn-sm tap" onClick={v.prev} disabled={!!(v.noPrev)}>
                      Previous
                    </button>
                    {" "}
                    <span className="muted" style={{ fontSize: "13px" }}>
                      {"Page "}{v.page}{" of "}{v.pages}
                    </span>
                    {" "}
                    <button className="btn btn-sm tap" onClick={v.next} disabled={!!(v.noNext)}>
                      Next
                    </button>
                    {" "}
                  </div>
                  {" "}
                  <div className="row" style={{ gap: "8px", marginTop: "14px" }}>
                    {" "}
                    <label htmlFor="ac-msg" className="sr">
                      New warning message
                    </label>
                    {" "}
                    <input id="ac-msg" className="field" value={v.newMsg ?? ""} onChange={v.onNewMsg} placeholder="e.g. {receiver} reported your message as abusive. Warning {n} of 3." style={{ fontSize: "14px" }} />
                    {" "}
                    <button className="btn btn-cta tap" onClick={v.addMsg}>
                      Add message
                    </button>
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
        </div>
        {" "}
      </div>
      {" "}
      </>
    );
  }
}
