// @ts-nocheck -- ported 1:1 from design/mockup/LinkDetail.dc.html by scripts/port-mockup.mjs; typed as it gets wired to real data
"use client";

import React, { Fragment } from "react";
import { saveMode, SkLink } from "@/lib/sk/runtime";


export default class LinkDetail extends React.Component<Record<string, any>, any> {
  static defaultProps = {"mode":"dark","link":"know"};

  constructor(props) {
    super(props);
    var m = null; // light/dark arrives as props.mode from the sk-mode cookie
    this.state = Object.assign({ mode: m || props.mode || 'dark' }, this.arrive());
  }
  // MyLinks hands over which link to show (sk-link) and stamps sk-nav
  arrive() {
    var id = null;
    this.nav = '';
    return { id: null, paused: !!(this.props.data && this.props.data.paused), copied: false, delOpen: false, toast: '' };
  }
  componentDidMount() {
    var self = this;
    this.onStore = function (e) { if (e.key === 'sk-mode' && e.newValue) self.setState({ mode: e.newValue }); };
    try { window.addEventListener('storage', this.onStore); } catch (e) {}
  }
  componentWillUnmount() { try { window.removeEventListener('storage', this.onStore); } catch (e) {} clearInterval(this.nt); clearTimeout(this.t); }
  componentDidUpdate(prev) {
    if (prev.mode !== this.props.mode && this.props.mode) this.setState({ mode: this.props.mode });
    if (prev.link !== this.props.link && this.props.link) this.setState({ id: this.props.link });
  }
  flash(msg) { var self = this; this.setState({ toast: msg }); clearTimeout(this.t); this.t = setTimeout(function () { self.setState({ toast: '' }); }, 2400); }
  renderVals() {
    var self = this, s = this.state, dark = s.mode !== 'light';
    var E = { peach: '/sk/peach.png', moon: '/sk/crescent_moon.png', unicorn: '/sk/unicorn.png', octopus: '/sk/octopus.png', crown: '/sk/crown_3d.png' };
    var D = this.props.data;
    var id = D.kind, l = D.l;
    var max = Math.max.apply(null, l.week.concat([1]));
    var DAYS = D.days;
    var stats = D.stats;
    var qStats = D.qStats;
    var board = D.board;
    var WORDS = D.words;
    var COL = ['#ff5fa2', '#ffd23d', '#22e1ff', '#7ef0c1', '#b78bff'];
    var DIST = D.dist;
    var dmax = Math.max.apply(null, DIST.concat([1]));
    var hue = function (k) { return 'hsl(' + (220 - k * 19) + ',90%,62%)'; };
    var url = D.url;
    return {
      mode: dark ? 'dark' : 'light', isDark: dark, isLight: !dark, modeWord: dark ? 'Light' : 'Dark',
      toggleMode: function () { var nm = dark ? 'light' : 'dark'; saveMode(nm); self.setState({ mode: nm }); },
      l: l, url: url, status: s.paused ? 'Paused' : 'Live', pauseLabel: s.paused ? 'Resume' : 'Pause',
      togglePause: function () { self.setState({ paused: !s.paused }); self.flash(s.paused ? 'Link resumed' : 'Link paused'); self.props.setPaused(D.linkId, !s.paused); },
      copyLabel: s.copied ? 'Copied' : 'Copy link', copy: function () { try { navigator.clipboard.writeText('https://' + url); } catch (e) {} self.setState({ copied: true }); self.flash('Link copied'); },
      share: function () { if (navigator.share) { navigator.share({ title: 'Sekretly', text: 'Send me an anonymous message 👀', url: 'https://' + url }).catch(function () {}); return; } try { navigator.clipboard.writeText('https://' + url); } catch (e) {} self.flash('Link copied. Paste it in your story.'); },
      stats: stats.map(function (x) { return { v: x[0], k: x[1] }; }),
      weekTotal: l.week.reduce(function (a, b) { return a + b; }, 0) + ' this week',
      week: l.week.map(function (v, i) { return { h: Math.max(4, Math.round(v / max * 100)) + '%', day: DAYS[i], d: (i * 0.05).toFixed(2) + 's' }; }),
      isQuiz: id === 'know', isDescribe: id === 'describe', isRate: id === 'rate', isText: id === 'confess' || id === 'ama',
      takers: l.msgs, board: board, qStats: qStats, hardest: D.hardest,
      cloud: WORDS.map(function (w, i) { return { w: w[0], n: w[1], fs: (14 + w[1] * 2) + 'px', col: COL[i % COL.length] }; }),
      avgRate: D.avgRate, topCat: D.topCat,
      dist: DIST.map(function (v, i) { return { n: i + 1, h: Math.max(4, Math.round(v / dmax * 100)) + '%', c: hue(i + 1), dl: (i * 0.04).toFixed(2) + 's' }; }),
      textTitle: D.textTitle,
      textBody: D.textBody,
      sources: D.sources.map(function (x) { return { name: x[0], pct: x[1] + '%', c: x[2] }; }),
      doDelete: function () { self.props.deleteLink(D.linkId); }, delOpen: s.delOpen, askDelete: function () { self.setState({ delOpen: true }); }, closeDelete: function () { self.setState({ delOpen: false }); },
      toast: !!s.toast, toastText: s.toast
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
        <div className="wrap" style={{ maxWidth: "860px", padding: "14px 16px 40px" }}>
          {" "}
          <header className="topbar">
            {" "}
            <SkLink href="/links" className="icon-btn tap" aria-label="Back to My links">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M15 18 9 12l6-6" />
              </svg>
            </SkLink>
            {" "}
            <h1 className="grow" style={{ fontSize: "24px" }}>
              Link insights
            </h1>
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
          <div className={`${v.l.th} rise`} style={{ borderRadius: "28px", padding: "18px", display: "flex", alignItems: "center", gap: "14px" }}>
            {" "}
            <img className="float" src={v.l.emoji} alt="" style={{ width: "58px", height: "58px" }} />
            {" "}
            <div style={{ flex: "1", minWidth: "0" }}>
              {" "}
              <div className="d" style={{ fontSize: "22px", fontWeight: "800", lineHeight: "1.05", letterSpacing: "-.02em" }}>
                {v.l.topic}
              </div>
              {" "}
              <div style={{ fontSize: "12.5px", opacity: ".88", marginTop: "4px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                {v.url}
              </div>
              {" "}
            </div>
            {" "}
            <span style={{ fontSize: "12px", fontWeight: "800", letterSpacing: ".06em", textTransform: "uppercase", padding: "6px 10px", borderRadius: "99px", background: "rgba(0,0,0,.26)" }}>
              {v.status}
            </span>
            {" "}
          </div>
          {" "}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: "8px", marginTop: "10px" }}>
            {" "}
            <button className="btn tap" onClick={v.copy}>
              {v.copyLabel}
            </button>
            {" "}
            <button className="btn tap" onClick={v.share}>
              Share card
            </button>
            {" "}
            <button className="btn tap" onClick={v.togglePause}>
              {v.pauseLabel}
            </button>
            {" "}
          </div>
          {" "}
          <div className="ld-stats rise" style={{ marginTop: "16px", animationDelay: ".05s" }}>
            {" "}
            {(v.stats || []).map((st, i0) => (
              <Fragment key={i0}>
              <div className="ld-stat">
                <b>
                  {st.v}
                </b>
                <span>
                  {st.k}
                </span>
              </div>
              </Fragment>
            ))}
            {" "}
          </div>
          {" "}
          <section className="card rise" style={{ marginTop: "12px", padding: "16px", animationDelay: ".1s" }}>
            {" "}
            <div className="row" style={{ justifyContent: "space-between" }}>
              <b style={{ fontSize: "16px" }}>
                Messages this week
              </b>
              <span className="muted" style={{ fontSize: "13px" }}>
                {v.weekTotal}
              </span>
            </div>
            {" "}
            <div className="ld-week" aria-label="Messages per day this week">
              {" "}
              {(v.week || []).map((w, i0) => (
                <Fragment key={i0}>
                <div style={{ height: "100%", display: "flex", flexDirection: "column", justifyContent: "flex-end" }}>
                  <i style={{ height: w.h, animationDelay: w.d }} />
                  <small>
                    {w.day}
                  </small>
                </div>
                </Fragment>
              ))}
              {" "}
            </div>
            {" "}
          </section>
          {" "}
          {v.isQuiz ? (
            <>
            {" "}
            <div>
              {" "}
              <section className="card rise" style={{ marginTop: "12px", padding: "16px" }}>
                {" "}
                <div className="row" style={{ justifyContent: "space-between" }}>
                  <b style={{ fontSize: "16px" }}>
                    Leaderboard
                  </b>
                  <span className="muted" style={{ fontSize: "13px" }}>
                    {v.takers}{" took your quiz"}
                  </span>
                </div>
                {" "}
                <div style={{ marginTop: "6px" }}>
                  {" "}
                  {(v.board || []).map((b, i0) => (
                    <Fragment key={i0}>
                    {" "}
                    <div className="ld-row">
                      <span style={{ width: "28px", textAlign: "center", fontSize: "18px" }}>
                        {b.medal}
                      </span>
                      <b style={{ flex: "1" }}>
                        {b.name}
                      </b>
                      <span className="muted" style={{ fontSize: "12.5px" }}>
                        {b.when}
                      </span>
                      <b style={{ minWidth: "36px", textAlign: "right" }}>
                        {b.score}
                      </b>
                    </div>
                    {" "}
                    </Fragment>
                  ))}
                  {" "}
                </div>
                {" "}
                <p className="muted" style={{ marginTop: "8px", fontSize: "12.5px", lineHeight: "1.45" }}>
                  Names are the random nicknames friends picked. You never see who they really are.
                </p>
                {" "}
              </section>
              {" "}
              <section className="card rise" style={{ marginTop: "12px", padding: "16px" }}>
                {" "}
                <b style={{ fontSize: "16px" }}>
                  How many got each question right
                </b>
                {" "}
                <div style={{ marginTop: "10px", display: "flex", flexDirection: "column", gap: "12px" }}>
                  {" "}
                  {(v.qStats || []).map((q, i0) => (
                    <Fragment key={i0}>
                    {" "}
                    <div>
                      <div className="row" style={{ justifyContent: "space-between", fontSize: "13.5px", gap: "10px" }}>
                        <span style={{ minWidth: "0" }}>
                          {q.q}
                        </span>
                        <b style={{ flex: "none", color: q.c }}>
                          {q.pct}
                        </b>
                      </div>
                      <div className="ld-bar" style={{ marginTop: "6px" }}>
                        <i style={{ width: q.pct, background: q.c }} />
                      </div>
                    </div>
                    {" "}
                    </Fragment>
                  ))}
                  {" "}
                </div>
                {" "}
                <div className="card row" style={{ marginTop: "12px", padding: "12px", gap: "10px", background: "var(--card2)" }}>
                  <img src="/sk/face_screaming_in_fear_3d.png" alt="" style={{ width: "34px", height: "34px" }} />
                  <span style={{ fontSize: "13.5px", lineHeight: "1.4" }}>
                    <b>
                      Hardest question:
                    </b>
                    {" "}{v.hardest}
                  </span>
                </div>
                {" "}
                <SkLink href="/create" className="btn btn-block tap" style={{ marginTop: "10px" }}>
                  Make a new quiz
                </SkLink>
                {" "}
              </section>
              {" "}
            </div>
            {" "}
            </>
          ) : null}
          {" "}
          {v.isDescribe ? (
            <>
            {" "}
            <section className="card rise" style={{ marginTop: "12px", padding: "16px" }}>
              {" "}
              <b style={{ fontSize: "16px" }}>
                Words people picked most
              </b>
              {" "}
              <div className="ld-cloud" style={{ marginTop: "12px" }}>
                {" "}
                {(v.cloud || []).map((c, i0) => (
                  <Fragment key={i0}>
                  <span style={{ fontSize: c.fs, color: c.col }}>
                    {c.w}{" "}
                    <small style={{ fontSize: "12px", opacity: ".7" }}>
                      ×{c.n}
                    </small>
                  </span>
                  </Fragment>
                ))}
                {" "}
              </div>
              {" "}
            </section>
            {" "}
            </>
          ) : null}
          {" "}
          {v.isRate ? (
            <>
            {" "}
            <section className="card rise" style={{ marginTop: "12px", padding: "16px" }}>
              {" "}
              <div className="row" style={{ justifyContent: "space-between" }}>
                <b style={{ fontSize: "16px" }}>
                  Your ratings
                </b>
                <span className="pill">
                  {"Average "}{v.avgRate}
                </span>
              </div>
              {" "}
              <div className="ld-dist" style={{ marginTop: "14px" }}>
                {" "}
                {(v.dist || []).map((d, i0) => (
                  <Fragment key={i0}>
                  <div style={{ height: "100%", display: "flex", flexDirection: "column", justifyContent: "flex-end" }}>
                    <i style={{ height: d.h, background: d.c, animationDelay: d.dl }} />
                    <small>
                      {d.n}
                    </small>
                  </div>
                  </Fragment>
                ))}
                {" "}
              </div>
              {" "}
              <p className="muted" style={{ marginTop: "10px", fontSize: "13px" }}>
                {"Most said "}
                <b style={{ color: "var(--ink)" }}>
                  “{v.topCat}”
                </b>
                {" when they picked what they were rating."}
              </p>
              {" "}
            </section>
            {" "}
            </>
          ) : null}
          {" "}
          {v.isText ? (
            <>
            {" "}
            <section className="card rise" style={{ marginTop: "12px", padding: "16px" }}>
              {" "}
              <b style={{ fontSize: "16px" }}>
                {v.textTitle}
              </b>
              {" "}
              <p className="muted" style={{ marginTop: "6px", fontSize: "14px", lineHeight: "1.5" }}>
                {v.textBody}
              </p>
              {" "}
              <SkLink href="/inbox" className="btn btn-cta btn-block tap" style={{ marginTop: "12px" }}>
                Read them in your inbox
              </SkLink>
              {" "}
            </section>
            {" "}
            </>
          ) : null}
          {" "}
          <section className="card rise" style={{ marginTop: "12px", padding: "16px" }}>
            {" "}
            <b style={{ fontSize: "16px" }}>
              Where visitors came from
            </b>
            {" "}
            <div style={{ marginTop: "10px", display: "flex", flexDirection: "column", gap: "10px" }}>
              {" "}
              {(v.sources || []).map((so, i0) => (
                <Fragment key={i0}>
                {" "}
                <div>
                  <div className="row" style={{ justifyContent: "space-between", fontSize: "13.5px" }}>
                    <span>
                      {so.name}
                    </span>
                    <b>
                      {so.pct}
                    </b>
                  </div>
                  <div className="ld-bar" style={{ marginTop: "6px" }}>
                    <i style={{ width: so.pct, background: so.c }} />
                  </div>
                </div>
                {" "}
                </Fragment>
              ))}
              {" "}
            </div>
            {" "}
            <p className="muted" style={{ marginTop: "10px", fontSize: "12.5px" }}>
              Counts only. We never show you who visited.
            </p>
            {" "}
          </section>
          {" "}
          <div className="ad ad-banner" style={{ marginTop: "16px" }}>
            <b>
              Banner ad
            </b>
            link insights · bottom
          </div>
          {" "}
          <button className="btn btn-ghost btn-block tap" onClick={v.askDelete} style={{ marginTop: "14px", color: "var(--bad)", border: "0" }}>
            Delete this link
          </button>
          {" "}
        </div>
        {" "}
        {v.delOpen ? (
          <>
          {" "}
          <div className="scrim">
            {" "}
            <div className="sheet" role="dialog" aria-label="Delete this link">
              {" "}
              <h2 style={{ fontSize: "22px" }}>
                Delete this link?
              </h2>
              {" "}
              <p className="muted" style={{ marginTop: "6px", fontSize: "14.5px", lineHeight: "1.5" }}>
                It stops working right away and visitors see “This link no longer exists”. Messages you already got stay in your inbox.
              </p>
              {" "}
              <button onClick={v.doDelete} className="btn btn-lg btn-block tap" style={{ marginTop: "14px", background: "#c4213a", color: "#ffffff", border: "0" }}>
                Delete link
              </button>
              {" "}
              <button className="btn btn-ghost btn-block" onClick={v.closeDelete} style={{ marginTop: "6px", border: "0" }}>
                Cancel
              </button>
              {" "}
            </div>
            {" "}
          </div>
          {" "}
          </>
        ) : null}
        {" "}
        {v.toast ? (
          <>
          {" "}
          <div className="toast" role="status">
            <img src="/sk/sparkles.png" alt="" style={{ width: "30px", height: "30px", flex: "none" }} />
            <b style={{ fontSize: "14px" }}>
              {v.toastText}
            </b>
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
