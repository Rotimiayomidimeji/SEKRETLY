// @ts-nocheck -- ported 1:1 from design/mockup/WeeklyWrap.dc.html by scripts/port-mockup.mjs; typed as it gets wired to real data
"use client";

import React, { Fragment } from "react";
import { saveMode, SkLink } from "@/lib/sk/runtime";


export default class WeeklyWrap extends React.Component<Record<string, any>, any> {
  static defaultProps = {};

  constructor(props) {
    super(props);
    this.state = { i: 0, playing: true, key: 0 };
  }
  componentDidMount() { this.arm(); }
  componentWillUnmount() { clearTimeout(this.t); }
  arm() {
    var self = this;
    clearTimeout(this.t);
    if (!this.state.playing) return;
    this.t = setTimeout(function () { if (self.state.i < 6) { self.setState({ i: self.state.i + 1 }, function () { self.arm(); }); } }, 5000);
  }
  go(i) { var self = this; this.setState({ i: Math.max(0, Math.min(6, i)), key: this.state.key + 1 }, function () { self.arm(); }); }
  renderVals() {
    var self = this, s = this.state;
    var BG = [
      'radial-gradient(120% 90% at 80% 0%,#7a3cff 0%,#22337d 55%,#0c1236 100%)',
      'radial-gradient(120% 90% at 20% 0%,#ff4f9a 0%,#b0166a 50%,#3a0b5a 100%)',
      'radial-gradient(120% 90% at 80% 10%,#ffb347 0%,#ff4f6d 45%,#5d1785 100%)',
      'radial-gradient(120% 90% at 50% 0%,#2a1b55 0%,#130a2a 60%,#05030a 100%)',
      'radial-gradient(120% 90% at 50% 0%,#12b5cf 0%,#0b63ad 50%,#0a2457 100%)',
      'radial-gradient(120% 90% at 20% 0%,#2c8f5a 0%,#127a80 45%,#0a2b3a 100%)',
      'radial-gradient(120% 90% at 50% 0%,#d81b72 0%,#7a3cff 60%,#22337d 100%)'
    ];
    var o = {};
    for (var k = 0; k < 7; k++) o['s' + k] = s.i === k;
    return Object.assign(o, {
      bg: BG[s.i], username: this.props.username,
      w: Object.assign({}, this.props.wrap, { word0: (this.props.wrap || {}).words ? this.props.wrap.words[0] || '' : '', word1: (this.props.wrap || {}).words ? this.props.wrap.words[1] || '' : '', word2: (this.props.wrap || {}).words ? this.props.wrap.words[2] || '' : '', wordsLine: ((this.props.wrap || {}).words || []).join(' · ') }),
      bars: BG.map(function (b, k) { return { w: k < s.i ? '100%' : (k === s.i ? (s.playing ? '' : '50%') : '0'), cls: (k === s.i && s.playing) ? 'ww-fill' : '' }; }),
      stashWrap: function () { try { window.localStorage.setItem('sk-share', JSON.stringify(['pw', 'pk'])); window.localStorage.setItem('sk-nav', String(Date.now())); } catch (e) {} },
      prev: function () { self.go(s.i - 1); },
      next: function () { self.go(s.i + 1); },
      replay: function () { self.setState({ playing: true }); self.go(0); },
      playing: s.playing, paused: !s.playing, pauseWord: s.playing ? 'Pause' : 'Play',
      togglePause: function () { self.setState({ playing: !s.playing }, function () { self.arm(); }); }
    });
  }

  render() {
    // like the mockup runtime: the template sees the props merged with renderVals()
    const v = { ...this.props, ...(this.renderVals() || {}) };
    return (
      <>
      {" "}
      <div className="sk" style={{ minHeight: "100vh", background: "#05030a", display: "flex", justifyContent: "center" }}>
        {" "}
        <div style={{ position: "relative", width: "100%", maxWidth: "480px", minHeight: "100vh", overflow: "hidden", color: "#fff", background: v.bg, transition: "background .5s" }}>
          {" "}
          <div style={{ position: "absolute", top: "12px", left: "12px", right: "12px", display: "flex", gap: "4px", zIndex: "3" }} aria-hidden="true">
            {" "}
            {(v.bars || []).map((b, i0) => (
              <Fragment key={i0}>
              {" "}
              <span style={{ flex: "1", height: "4px", borderRadius: "9px", background: "rgba(255,255,255,.3)", overflow: "hidden" }}>
                <span className={b.cls} style={{ display: "block", height: "100%", width: b.w, background: "#fff" }} />
              </span>
              {" "}
              </Fragment>
            ))}
            {" "}
          </div>
          {" "}
          <div className="row" style={{ position: "absolute", top: "26px", left: "16px", right: "16px", zIndex: "3" }}>
            {" "}
            <span className="logo-mark" style={{ width: "30px", height: "30px", borderRadius: "10px", fontSize: "16px", background: "rgba(255,255,255,.2)" }}>
              S
            </span>
            {" "}
            <span style={{ flex: "1", fontSize: "13px", fontWeight: "700" }}>
              {"Your week · "}{v.w.range}
            </span>
            {" "}
            <button className="tap" onClick={v.togglePause} aria-label={v.pauseWord} style={{ width: "44px", height: "44px", border: "0", borderRadius: "14px", background: "rgba(0,0,0,.2)", color: "#fff", display: "grid", placeItems: "center" }}>
              {" "}
              {v.playing ? (
                <>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <rect x="6" y="5" width="4" height="14" rx="1" />
                  <rect x="14" y="5" width="4" height="14" rx="1" />
                </svg>
                </>
              ) : null}
              {" "}
              {v.paused ? (
                <>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M7 4v16l13-8z" />
                </svg>
                </>
              ) : null}
              {" "}
            </button>
            {" "}
            <SkLink href="/home" className="tap" aria-label="Close" style={{ width: "44px", height: "44px", borderRadius: "14px", background: "rgba(0,0,0,.2)", color: "#fff", display: "grid", placeItems: "center" }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" aria-hidden="true">
                <path d="M6 6l12 12M18 6 6 18" />
              </svg>
            </SkLink>
            {" "}
          </div>
          {" "}
          <button onClick={v.prev} aria-label="Previous slide" style={{ position: "absolute", left: "0", top: "80px", bottom: "120px", width: "35%", border: "0", background: "transparent", zIndex: "2" }} />
          {" "}
          <button onClick={v.next} aria-label="Next slide" style={{ position: "absolute", right: "0", top: "80px", bottom: "120px", width: "65%", border: "0", background: "transparent", zIndex: "2" }} />
          {" "}
          <div style={{ position: "relative", zIndex: "1", minHeight: "100vh", padding: "110px 26px 130px", display: "flex", flexDirection: "column", justifyContent: "center" }}>
            {" "}
            {v.s0 ? (
              <>
              {" "}
              <div className="rise">
                {" "}
                <img className="float" src="/sk/crescent_moon.png" alt="" style={{ width: "96px", height: "96px" }} />
                {" "}
                <h1 style={{ fontSize: "48px", lineHeight: ".95", marginTop: "18px" }}>
                  {v.w.title}
                </h1>
                {" "}
                <p style={{ fontSize: "18px", opacity: ".9", marginTop: "14px" }}>
                  Here's what people said, guessed and played. Tap to keep going.
                </p>
                {" "}
              </div>
              {" "}
              </>
            ) : null}
            {" "}
            {v.s1 ? (
              <>
              {" "}
              <div className="rise">
                {" "}
                <p style={{ fontSize: "18px", fontWeight: "700", opacity: ".9" }}>
                  You got
                </p>
                {" "}
                <div className="d pop" style={{ fontSize: "132px", fontWeight: "800", lineHeight: ".9", letterSpacing: "-.05em" }}>
                  {v.w.count}
                </div>
                {" "}
                <p className="d" style={{ fontSize: "30px", fontWeight: "800", lineHeight: "1" }}>
                  anonymous messages
                </p>
                {" "}
                <span style={{ display: "inline-block", marginTop: "16px", padding: "8px 12px", borderRadius: "99px", background: "rgba(255,255,255,.2)", fontWeight: "800" }}>
                  {v.w.delta}
                </span>
                {" "}
                <p style={{ fontSize: "16px", opacity: ".9", marginTop: "14px" }}>
                  {v.w.busiest}
                </p>
                {" "}
              </div>
              {" "}
              </>
            ) : null}
            {" "}
            {v.s2 ? (
              <>
              {" "}
              <div className="rise">
                {" "}
                <p style={{ fontSize: "18px", fontWeight: "700", opacity: ".9" }}>
                  This week people called you
                </p>
                {" "}
                <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginTop: "16px" }}>
                  {" "}
                  <span className="d pop" style={{ fontSize: "64px", fontWeight: "800", lineHeight: ".9" }}>
                    {v.w.word0}
                  </span>
                  {" "}
                  <span className="d pop" style={{ fontSize: "46px", fontWeight: "800", lineHeight: ".9", opacity: ".85", animationDelay: ".15s" }}>
                    {v.w.word1}
                  </span>
                  {" "}
                  <span className="d pop" style={{ fontSize: "34px", fontWeight: "800", lineHeight: ".9", opacity: ".7", animationDelay: ".3s" }}>
                    {v.w.word2}
                  </span>
                  {" "}
                </div>
                {" "}
                <p style={{ fontSize: "16px", opacity: ".9", marginTop: "18px" }}>
                  {v.w.allTime}
                </p>
                {" "}
              </div>
              {" "}
              </>
            ) : null}
            {" "}
            {v.s3 ? (
              <>
              {" "}
              <div className="rise">
                {" "}
                <p style={{ fontSize: "18px", fontWeight: "700", opacity: ".9" }}>
                  Your most loved link
                </p>
                {" "}
                <div style={{ marginTop: "14px", padding: "20px", borderRadius: "26px", background: "linear-gradient(165deg,#ff9a4a,#ff4f6d 42%,#6d2187)" }}>
                  {" "}
                  <span style={{ fontSize: "12px", fontWeight: "800", letterSpacing: ".08em", textTransform: "uppercase", opacity: ".9" }}>
                    {v.w.topTag}
                  </span>
                  {" "}
                  <div className="d" style={{ fontSize: "28px", fontWeight: "800", lineHeight: "1", marginTop: "8px" }}>
                    {v.w.topTitle}
                  </div>
                  {" "}
                  <div style={{ marginTop: "14px", fontWeight: "800" }}>
                    {v.w.topLine}
                  </div>
                  {" "}
                </div>
                {" "}
                <p style={{ fontSize: "16px", opacity: ".9", marginTop: "16px" }}>
                  {v.w.dropLine}
                </p>
                {" "}
              </div>
              {" "}
              </>
            ) : null}
            {" "}
            {v.s4 ? (
              <>
              {" "}
              <div className="rise">
                {" "}
                <p style={{ fontSize: "18px", fontWeight: "700", opacity: ".9" }}>
                  Knows you best
                </p>
                {" "}
                <span className="av pop" style={{ width: "110px", height: "110px", borderRadius: "36px", marginTop: "16px", background: "linear-gradient(135deg,#ffb35c,#ff5f8f)", border: "4px solid rgba(255,255,255,.6)" }}>
                  <img src="/sk/fox.png" alt="Fox's avatar" />
                </span>
                {" "}
                <h2 className="d" style={{ fontSize: "52px", marginTop: "14px" }}>
                  {v.w.bestName}
                </h2>
                {" "}
                <p style={{ fontSize: "20px", fontWeight: "700", marginTop: "4px" }}>
                  {v.w.bestLine}
                </p>
                {" "}
                <p style={{ fontSize: "16px", opacity: ".9", marginTop: "12px" }}>
                  {v.w.guessLine}
                </p>
                {" "}
              </div>
              {" "}
              </>
            ) : null}
            {" "}
            {v.s5 ? (
              <>
              {" "}
              <div className="rise">
                {" "}
                <p style={{ fontSize: "18px", fontWeight: "700", opacity: ".9" }}>
                  Your streak
                </p>
                {" "}
                <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginTop: "16px" }}>
                  {" "}
                  <div style={{ padding: "14px 16px", borderRadius: "20px", background: "rgba(255,255,255,.14)" }}>
                    <b style={{ fontSize: "18px" }}>
                      Daily drops
                    </b>
                    <div style={{ opacity: ".9" }}>
                      {v.w.dropLine}
                    </div>
                  </div>
                  {" "}
                  <div style={{ padding: "14px 16px", borderRadius: "20px", background: "rgba(255,255,255,.14)" }}>
                    <b style={{ fontSize: "18px" }}>
                      Badges
                    </b>
                    <div style={{ opacity: ".9" }}>
                      {v.w.badgeLine}
                    </div>
                  </div>
                  {" "}
                </div>
                {" "}
                <p className="d" style={{ fontSize: "28px", fontWeight: "800", marginTop: "18px" }}>
                  {v.w.streakLine}
                </p>
                {" "}
              </div>
              {" "}
              </>
            ) : null}
            {" "}
            {v.s6 ? (
              <>
              {" "}
              <div className="rise" style={{ textAlign: "center" }}>
                {" "}
                <div style={{ margin: "0 auto", width: "240px", padding: "18px", borderRadius: "26px", background: "rgba(255,255,255,.95)", color: "#2a0a1c", textAlign: "left" }}>
                  {" "}
                  <div className="row" style={{ gap: "8px" }}>
                    <span className="logo-mark" style={{ width: "26px", height: "26px", borderRadius: "8px", fontSize: "14px" }}>
                      S
                    </span>
                    <b style={{ fontSize: "13px" }}>
                      @{v.username}{" · "}{v.w.week}
                    </b>
                  </div>
                  {" "}
                  <div className="d" style={{ fontSize: "44px", fontWeight: "800", lineHeight: ".9", marginTop: "12px" }}>
                    {v.w.count}
                  </div>
                  {" "}
                  <div style={{ fontWeight: "700" }}>
                    messages
                  </div>
                  {" "}
                  <div className="d" style={{ fontSize: "24px", fontWeight: "800", marginTop: "10px", color: "#b0246a" }}>
                    {v.w.wordsLine}
                  </div>
                  {" "}
                  <div style={{ fontSize: "13px", marginTop: "10px", color: "#5b4b55" }}>
                    {v.w.url}
                  </div>
                  {" "}
                </div>
                {" "}
                <h2 style={{ fontSize: "30px", marginTop: "18px" }}>
                  That's your week.
                </h2>
                {" "}
                <p style={{ opacity: ".9", marginTop: "4px" }}>
                  Next wrap drops Sunday at 6pm.
                </p>
                {" "}
              </div>
              {" "}
              </>
            ) : null}
            {" "}
          </div>
          {" "}
          <div style={{ position: "absolute", left: "16px", right: "16px", bottom: "22px", zIndex: "3", display: "flex", gap: "8px" }}>
            {" "}
            <SkLink href="/share" onClick={v.stashWrap} className="tap" style={{ flex: "1", minHeight: "54px", borderRadius: "18px", background: "#fff", color: "#2a0a1c", fontWeight: "800", display: "grid", placeItems: "center", textDecoration: "none" }}>
              Share my wrap
            </SkLink>
            {" "}
            <button className="tap" onClick={v.replay} style={{ flex: "none", minHeight: "54px", padding: "0 18px", borderRadius: "18px", border: "0", background: "rgba(0,0,0,.28)", color: "#fff", fontWeight: "800" }}>
              Replay
            </button>
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
