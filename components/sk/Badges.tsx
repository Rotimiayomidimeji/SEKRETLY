// @ts-nocheck -- ported 1:1 from design/mockup/Badges.dc.html by scripts/port-mockup.mjs; typed as it gets wired to real data
"use client";

import React, { Fragment } from "react";
import { saveMode, SkLink, route } from "@/lib/sk/runtime";


export default class Badges extends React.Component<Record<string, any>, any> {
  static defaultProps = {"mode":"dark"};

  constructor(props) {
    super(props);
    var m = null; // light/dark arrives as props.mode from the sk-mode cookie
    this.state = { mode: m || props.mode || 'dark', cat: 'All', open: -1, pins: props.pinned || [] };
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
    var I = { fire: '/sk/fire.png', eyes: '/sk/eyes.png', shush: '/sk/shushing_face.png', spark: '/sk/sparkles.png', letter: '/sk/love_letter.png', moon: '/sk/crescent_moon.png', peach: '/sk/peach.png', uni: '/sk/unicorn.png', octo: '/sk/octopus.png' };
    var G = { s: 'linear-gradient(135deg,#ff8a2b,#ff3d6e)', i: 'linear-gradient(135deg,#ffb35c,#ff4f6d)', g: 'linear-gradient(135deg,#7a3cff,#3a6bff)', c: 'linear-gradient(135deg,#ff5fa2,#7a3cff)', k: 'linear-gradient(135deg,#22b36f,#127a80)' };
    var B = (this.props.badges || []).map(function (b) { return Object.assign({}, b, { bg: G[b.bg] || G.i }); });
    var cats = ['All', 'Streaks', 'Inbox', 'Games', 'Crews', 'Kindness'];
    var dec = function (b, i) {
      var got = b.have >= b.need, pinned = s.pins.indexOf(b.id) >= 0;
      return Object.assign({}, b, { idx: i, got: got, locked: !got, pinned: pinned, prog: Math.round(100 * b.have / b.need), filter: got ? 'none' : 'grayscale(1)', op: got ? 1 : 0.55, stateWord: got ? 'earned' : b.have + ' of ' + b.need,
        open: function () { self.setState({ open: i }); } });
    };
    var all = B.map(dec);
    var cur = s.open >= 0 ? all[s.open] : all[0];
    var earned = all.filter(function (b) { return b.got; }).length;
    var curPinned = s.pins.indexOf(cur.id) >= 0;
    return {
      mode: dark ? 'dark' : 'light',
      earned: earned, total: B.length, pct: Math.round(100 * earned / B.length),
      pinnedNames: all.filter(function (b) { return b.pinned; }).map(function (b) { return b.name; }).join(', ') || 'none',
      cats: cats.map(function (c) { var on = s.cat === c; return { name: c, on: on ? 'true' : 'false', cls: on ? 'on' : '', pick: function () { self.setState({ cat: c }); } }; }),
      items: all.filter(function (b) { return s.cat === 'All' || b.cat === s.cat; }),
      open: s.open >= 0, cur: cur,
      close: function () { self.setState({ open: -1 }); },
      pinFull: !curPinned && s.pins.length >= 3,
      pinLabel: curPinned ? 'Unpin from profile' : (s.pins.length >= 3 ? '3 pinned · unpin one first' : 'Pin to profile'),
      togglePin: function () { var p = s.pins.slice(); var k = p.indexOf(cur.id); if (k >= 0) p.splice(k, 1); else if (p.length < 3) p.push(cur.id); self.setState({ pins: p }); self.props.setPins(p); }
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
          <div className="wrap" style={{ maxWidth: "640px" }}>
            {" "}
            <header className="topbar">
              {" "}
              <SkLink href="/profile" className="icon-btn tap" aria-label="Back to profile">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="m15 18-6-6 6-6" />
                </svg>
              </SkLink>
              {" "}
              <h1 className="grow" style={{ fontSize: "26px" }}>
                Badges
              </h1>
              {" "}
              <span className="pill">
                {v.earned}{" / "}{v.total}
              </span>
              {" "}
            </header>
            {" "}
            <div className="card" style={{ padding: "14px 16px" }}>
              {" "}
              <div className="row" style={{ justifyContent: "space-between", fontSize: "14px" }}>
                <b>
                  Collection
                </b>
                <span className="muted">
                  {v.pct}% complete
                </span>
              </div>
              {" "}
              <div className="bar" style={{ marginTop: "8px" }}>
                <span style={{ width: `${v.pct}%` }} />
              </div>
              {" "}
              <p className="muted" style={{ fontSize: "13px", marginTop: "8px" }}>
                {"Pin up to 3 to show on your profile. Pinned: "}{v.pinnedNames}
              </p>
              {" "}
            </div>
            {" "}
            <div className="rail" role="group" aria-label="Category" style={{ display: "flex", gap: "8px", margin: "14px -16px 0", padding: "0 16px 4px" }}>
              {" "}
              {(v.cats || []).map((c, i0) => (
                <Fragment key={i0}>
                {" "}
                <button className={`chip tap ${c.cls}`} aria-pressed={c.on} onClick={c.pick}>
                  {c.name}
                </button>
                {" "}
                </Fragment>
              ))}
              {" "}
            </div>
            {" "}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: "10px", marginTop: "14px" }}>
              {" "}
              {(v.items || []).map((b, i0) => (
                <Fragment key={i0}>
                {" "}
                <button className="card tap" onClick={b.open} aria-label={`${b.name}, ${b.stateWord}`} style={{ padding: "12px 8px 10px", textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", gap: "6px", minHeight: "150px", position: "relative" }}>
                  {" "}
                  {b.pinned ? (
                    <>
                    <span className="pill" style={{ position: "absolute", top: "6px", right: "6px", padding: "2px 7px", fontSize: "10.5px", background: "var(--pink)", color: "#fff" }}>
                      Pinned
                    </span>
                    </>
                  ) : null}
                  {" "}
                  <span style={{ width: "60px", height: "60px", borderRadius: "20px", display: "grid", placeItems: "center", background: b.bg, filter: b.filter, opacity: b.op }}>
                    <img src={b.icon} alt="" style={{ width: "38px", height: "38px" }} />
                  </span>
                  {" "}
                  <b style={{ fontSize: "12.5px", lineHeight: "1.15" }}>
                    {b.name}
                  </b>
                  {" "}
                  {b.locked ? (
                    <>
                    {" "}
                    <span style={{ width: "100%", marginTop: "auto" }}>
                      <span className="bar" style={{ height: "6px", display: "block" }}>
                        <span style={{ width: `${b.prog}%` }} />
                      </span>
                      <span className="muted" style={{ display: "block", fontSize: "11px", marginTop: "3px" }}>
                        {b.have}/{b.need}
                      </span>
                    </span>
                    {" "}
                    </>
                  ) : null}
                  {" "}
                </button>
                {" "}
                </Fragment>
              ))}
              {" "}
            </div>
            {" "}
          </div>
          {" "}
        </div>
        {" "}
        {v.open ? (
          <>
          {" "}
          <div className="scrim">
            {" "}
            <div className="sheet" role="dialog" aria-label={v.cur.name} style={{ textAlign: "center" }}>
              {" "}
              <span className="pop" style={{ width: "96px", height: "96px", borderRadius: "30px", margin: "0 auto", display: "grid", placeItems: "center", background: v.cur.bg, filter: v.cur.filter }}>
                <img src={v.cur.icon} alt="" style={{ width: "60px", height: "60px" }} />
              </span>
              {" "}
              <h2 style={{ fontSize: "24px", marginTop: "12px" }}>
                {v.cur.name}
              </h2>
              {" "}
              <p className="muted" style={{ marginTop: "4px", fontSize: "14.5px" }}>
                {v.cur.how}
              </p>
              {" "}
              <div className="row" style={{ justifyContent: "center", gap: "18px", marginTop: "12px", fontSize: "13.5px" }}>
                {" "}
                <span>
                  <b>
                    {v.cur.rarity}%
                  </b>
                  {" "}
                  <span className="muted">
                    of people have it
                  </span>
                </span>
                {" "}
                <span className="muted">
                  {v.cur.when}
                </span>
                {" "}
              </div>
              {" "}
              {v.cur.locked ? (
                <>
                {" "}
                <div style={{ marginTop: "14px", textAlign: "left" }}>
                  <div className="row" style={{ justifyContent: "space-between", fontSize: "13.5px" }}>
                    <b>
                      Progress
                    </b>
                    <span className="muted">
                      {v.cur.have}{" / "}{v.cur.need}
                    </span>
                  </div>
                  <div className="bar" style={{ marginTop: "6px" }}>
                    <span style={{ width: `${v.cur.prog}%` }} />
                  </div>
                </div>
                {" "}
                <SkLink href={route(v.cur.go)} className="btn btn-cta btn-lg btn-block tap" style={{ marginTop: "16px" }}>
                  {v.cur.goLabel}
                </SkLink>
                {" "}
                </>
              ) : null}
              {" "}
              {v.cur.got ? (
                <>
                {" "}
                <button className="btn btn-cta btn-lg btn-block tap" onClick={v.togglePin} style={{ marginTop: "16px" }} disabled={!!(v.pinFull)}>
                  {v.pinLabel}
                </button>
                {" "}
                <SkLink href="/share" className="btn btn-block tap" style={{ marginTop: "8px" }}>
                  Share it
                </SkLink>
                {" "}
                </>
              ) : null}
              {" "}
              <button className="btn btn-ghost btn-block tap" onClick={v.close} style={{ marginTop: "6px", border: "0" }}>
                Close
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
