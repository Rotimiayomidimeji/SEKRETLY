// @ts-nocheck -- ported 1:1 from design/mockup/Receipt.dc.html by scripts/port-mockup.mjs; typed as it gets wired to real data
"use client";

import React, { Fragment } from "react";
import { saveMode, SkLink } from "@/lib/sk/runtime";


export default class Receipt extends React.Component<Record<string, any>, any> {
  static defaultProps = {"mode":"dark"};

  constructor(props) {
    super(props);
    var m = null; // light/dark arrives as props.mode from the sk-mode cookie
    var mine = props.receipts || [];
    this.state = { mode: m || props.mode || 'dark', sel: Math.max(0, mine.findIndex(function (r) { return r.id === props.focusId; })), code: '', decide: null, follow: '', followSent: false, R: mine, err: '' };
  }
  componentDidMount() {
    var self = this;
    var codes = []; try { codes = JSON.parse(window.localStorage.getItem('sk-receipts') || '[]'); } catch (e) {}
    if (codes.length && this.props.lookup) this.props.lookup(codes).then(function (list) { self.merge(list || []); });
    this.onStore = function (e) { if (e.key === 'sk-mode' && e.newValue) self.setState({ mode: e.newValue }); };
    try { window.addEventListener('storage', this.onStore); } catch (e) {}
  }
  componentWillUnmount() { try { window.removeEventListener('storage', this.onStore); } catch (e) {} }
  componentDidUpdate(prev) { if (prev.mode !== this.props.mode && this.props.mode) this.setState({ mode: this.props.mode }); }
  merge(list) {
    var have = {}; this.state.R.forEach(function (r) { have[r.code] = true; });
    this.setState({ R: this.state.R.concat(list.filter(function (r) { return !have[r.code]; })) });
  }
  renderVals() {
    var self = this, s = this.state, dark = s.mode !== 'light';
    var ok = '#22b36f', wait = 'var(--card2)';
    var mk = function (labels, n) {
      return labels.map(function (l, i) { var done = i < n; return { label: l[0], when: done ? l[1] : 'not yet', done: done, bg: done ? ok : wait, line: i === labels.length - 1 ? 'transparent' : (i < n - 1 ? ok : 'var(--line)'), ink: done ? 'var(--ink)' : 'var(--muted)' }; });
    };
    var R = s.R.map(function (r) { return Object.assign({}, r, { steps: r.steps.map(function (st) { return { label: st.label, when: st.when, done: st.done, bg: st.done ? ok : wait, line: st.last ? 'transparent' : (st.next ? ok : 'var(--line)'), ink: st.done ? 'var(--ink)' : 'var(--muted)' }; }) }); });
    var EMPTY = { id: '', code: '—', to: 'nobody yet', topic: 'No receipts here yet', msg: 'Send someone an anonymous message and its receipt shows up here. Have a code? Enter it above.', hint: '', icon: '/sk/love_letter.png', tint: 'linear-gradient(135deg,#ff5fa2,#7a3cff)', status: '', dot: '#8f8399', steps: [], reacted: false, reactIcon: '', reactWord: '', replied: false, reply: '', guessed: false, canFollow: false };
    var c = R[Math.min(s.sel, R.length - 1)] || EMPTY;
    return {
      mode: dark ? 'dark' : 'light',
      code: s.code, onCode: function (e) { self.setState({ code: e.target.value.toUpperCase() }); },
      lookup: function (e) {
        if (e && e.preventDefault) e.preventDefault();
        var code = s.code.trim(), i = R.findIndex(function (r) { return r.code === code; });
        if (i >= 0) { self.setState({ sel: i, decide: null, err: '' }); return; }
        self.props.lookup([code]).then(function (list) {
          if (!list || !list.length) { self.setState({ err: 'No receipt with that code.' }); return; }
          try { var saved = JSON.parse(window.localStorage.getItem('sk-receipts') || '[]'); window.localStorage.setItem('sk-receipts', JSON.stringify([code].concat(saved.filter(function (x) { return x !== code; })).slice(0, 30))); } catch (x) {}
          self.merge(list); self.setState({ sel: self.state.R.length - 1, decide: null, err: '' });
        });
      },
      list: R.map(function (r, i) { var on = s.sel === i; return { to: r.to, status: r.status, dot: r.dot, on: on ? 'true' : 'false', cls: on ? 'on' : '', pick: function () { self.setState({ sel: i, decide: null, followSent: false, follow: '' }); } }; }),
      cur: Object.assign({}, c, { hasHint: !!c.hint }),
      undecided: s.decide === null && !c.revealed, revealed: s.decide === 'reveal' || !!c.revealed, hidden: s.decide === 'hide',
      reveal: function () { self.setState({ decide: 'reveal' }); self.props.decideGuess(c.id, true); }, hide: function () { self.setState({ decide: 'hide' }); self.props.decideGuess(c.id, false); },
      follow: s.follow, onFollow: function (e) { self.setState({ follow: e.target.value.slice(0, 200) }); },
      canFollow: !!c.canFollow && !s.followSent, followSent: s.followSent,
      sendFollow: function () { if (!s.follow.trim()) return; self.props.sendFollowUp(c.code, s.follow).then(function (r) { self.setState(r && r.ok ? { followSent: true } : { err: (r && r.error) || 'Couldn’t send. Try again.' }); }); }
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
              <SkLink href="/" className="logo">
                <span className="logo-mark">
                  S
                </span>
                <span className="logo-word">
                  Sekretly
                </span>
              </SkLink>
              {" "}
              <span className="grow" />
              {" "}
              <SkLink href="/signup" className="btn btn-sm btn-cta">
                Get your link
              </SkLink>
              {" "}
            </header>
            {" "}
            <h1 style={{ fontSize: "28px" }}>
              Your receipts
            </h1>
            {" "}
            <p className="muted" style={{ marginTop: "4px", fontSize: "14.5px" }}>
              Messages you sent. Nobody, not even the person you sent them to, can link them to you.
            </p>
            {" "}
            <form onSubmit={v.lookup} style={{ display: "flex", gap: "8px", marginTop: "14px" }}>
              {" "}
              <label htmlFor="rc-code" className="sr">
                Receipt code
              </label>
              {" "}
              <input id="rc-code" className="field" value={v.code ?? ""} onChange={v.onCode} placeholder="Enter a code, e.g. SK-7Q4M-2J" style={{ flex: "1", minWidth: "0", textTransform: "uppercase" }} />
              {" "}
              <button type="submit" className="btn tap" style={{ flex: "none" }}>
                Check
              </button>
              {" "}
            </form>
            {" "}
            <div className="rail" style={{ display: "flex", gap: "8px", margin: "14px -16px 0", padding: "0 16px 4px" }}>
              {" "}
              {(v.list || []).map((r, i0) => (
                <Fragment key={i0}>
                {" "}
                <button className={`chip tap ${r.cls}`} onClick={r.pick} aria-pressed={r.on}>
                  {" "}
                  <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: r.dot }} />
                  {r.to}{" · "}{r.status}{" "}
                </button>
                {" "}
                </Fragment>
              ))}
              {" "}
            </div>
            {" "}
            <section className="card rise" style={{ marginTop: "14px", padding: "16px" }} aria-label={`Receipt ${v.cur.code}`}>
              {" "}
              <div className="row" style={{ justifyContent: "space-between" }}>
                {" "}
                <div className="row" style={{ gap: "10px" }}>
                  {" "}
                  <span className="av" style={{ width: "40px", height: "40px", borderRadius: "13px", background: v.cur.tint }}>
                    <img src={v.cur.icon} alt="" />
                  </span>
                  {" "}
                  <div>
                    <b style={{ fontSize: "15px" }}>
                      {"To "}{v.cur.to}
                    </b>
                    <div className="muted" style={{ fontSize: "12.5px" }}>
                      {v.cur.topic}
                    </div>
                  </div>
                  {" "}
                </div>
                {" "}
                <span className="mono muted" style={{ fontSize: "12px", fontWeight: "700" }}>
                  {v.cur.code}
                </span>
                {" "}
              </div>
              {" "}
              <div style={{ marginTop: "12px", padding: "12px 14px", borderRadius: "16px", background: "var(--card2)", fontSize: "15px", lineHeight: "1.45" }}>
                {v.cur.msg}
              </div>
              {" "}
              {v.cur.hasHint ? (
                <>
                {" "}
                <div className="muted" style={{ fontSize: "12.5px", marginTop: "6px" }}>
                  {"Your hint: "}{v.cur.hint}
                </div>
                {" "}
                </>
              ) : null}
              {" "}
              <ol style={{ listStyle: "none", margin: "16px 0 0", padding: "0", display: "flex", flexDirection: "column", gap: "0" }}>
                {" "}
                {(v.cur.steps || []).map((st, i0) => (
                  <Fragment key={i0}>
                  {" "}
                  <li style={{ display: "flex", gap: "12px" }}>
                    {" "}
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                      {" "}
                      <span style={{ width: "26px", height: "26px", borderRadius: "50%", display: "grid", placeItems: "center", background: st.bg, color: "#fff", flex: "none" }}>
                        {" "}
                        {st.done ? (
                          <>
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                            <path d="m5 12 5 5 9-10" />
                          </svg>
                          </>
                        ) : null}
                        {" "}
                      </span>
                      {" "}
                      <span style={{ width: "2px", flex: "1", minHeight: "18px", background: st.line }} />
                      {" "}
                    </div>
                    {" "}
                    <div style={{ paddingBottom: "14px", flex: "1", minWidth: "0" }}>
                      {" "}
                      <b style={{ fontSize: "14.5px", color: st.ink }}>
                        {st.label}
                      </b>
                      {" "}
                      <div className="muted" style={{ fontSize: "12.5px" }}>
                        {st.when}
                      </div>
                      {" "}
                    </div>
                    {" "}
                  </li>
                  {" "}
                  </Fragment>
                ))}
                {" "}
              </ol>
              {" "}
              {v.cur.reacted ? (
                <>
                {" "}
                <div className="row" style={{ padding: "12px", borderRadius: "16px", background: "rgba(255,176,32,.12)", gap: "12px" }}>
                  {" "}
                  <img className="pop" src={v.cur.reactIcon} alt="" style={{ width: "44px", height: "44px" }} />
                  {" "}
                  <div>
                    <b style={{ fontSize: "15px" }}>
                      {v.cur.to}{" reacted"}
                    </b>
                    <div className="muted" style={{ fontSize: "13px" }}>
                      {v.cur.reactWord}
                    </div>
                  </div>
                  {" "}
                </div>
                {" "}
                </>
              ) : null}
              {" "}
              {v.cur.replied ? (
                <>
                {" "}
                <div style={{ marginTop: "10px", padding: "12px 14px", borderRadius: "16px", background: "var(--cta)", color: "#fff" }}>
                  {" "}
                  <div style={{ fontSize: "12px", fontWeight: "800", letterSpacing: ".06em", textTransform: "uppercase", opacity: ".85" }}>
                    {v.cur.to}{" replied"}
                  </div>
                  {" "}
                  <div style={{ fontSize: "15px", lineHeight: "1.45", marginTop: "4px" }}>
                    {v.cur.reply}
                  </div>
                  {" "}
                </div>
                {" "}
                {v.canFollow ? (
                  <>
                  {" "}
                  <div style={{ marginTop: "10px" }}>
                    {" "}
                    <label htmlFor="rc-follow" className="label" style={{ fontSize: "13.5px" }}>
                      Reply back, still anonymous (1 left)
                    </label>
                    {" "}
                    <div style={{ display: "flex", gap: "8px" }}>
                      {" "}
                      <input id="rc-follow" className="field" value={v.follow ?? ""} onChange={v.onFollow} maxLength="200" placeholder="Not telling. Keep guessing." style={{ flex: "1", minWidth: "0" }} />
                      {" "}
                      <button className="btn btn-cta tap" onClick={v.sendFollow} style={{ flex: "none" }}>
                        Send
                      </button>
                      {" "}
                    </div>
                    {" "}
                  </div>
                  {" "}
                  </>
                ) : null}
                {" "}
                {v.followSent ? (
                  <>
                  {" "}
                  <div className="muted" style={{ fontSize: "13px", marginTop: "10px" }}>
                    Sent. That was your one reply on this message.
                  </div>
                  {" "}
                  </>
                ) : null}
                {" "}
                </>
              ) : null}
              {" "}
              {v.cur.guessed ? (
                <>
                {" "}
                <div style={{ marginTop: "12px", padding: "14px", borderRadius: "18px", border: "2px solid #7a3cff", background: "rgba(122,60,255,.10)" }}>
                  {" "}
                  <b style={{ fontSize: "16px" }}>
                    {v.cur.to}{" thinks it's you"}
                  </b>
                  {" "}
                  <p className="muted" style={{ fontSize: "13.5px", marginTop: "4px" }}>
                    They guessed right. You decide: reveal, or stay a mystery. Staying hidden tells them "wrong guess or not telling" — never which.
                  </p>
                  {" "}
                  {v.undecided ? (
                    <>
                    {" "}
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: "8px", marginTop: "12px" }}>
                      {" "}
                      <button className="btn btn-cta tap" onClick={v.reveal}>
                        Yes, it's me
                      </button>
                      {" "}
                      <button className="btn tap" onClick={v.hide}>
                        Stay hidden
                      </button>
                      {" "}
                    </div>
                    {" "}
                    </>
                  ) : null}
                  {" "}
                  {v.revealed ? (
                    <>
                    <div className="pop" style={{ marginTop: "10px", fontWeight: "800", color: "var(--ok)" }}>
                      Revealed. They can see your name on this message now.
                    </div>
                    </>
                  ) : null}
                  {" "}
                  {v.hidden ? (
                    <>
                    <div className="pop" style={{ marginTop: "10px", fontWeight: "800" }}>
                      Still a mystery. Nice.
                    </div>
                    </>
                  ) : null}
                  {" "}
                </div>
                {" "}
                </>
              ) : null}
              {" "}
            </section>
            {" "}
            <section style={{ marginTop: "16px", padding: "18px", borderRadius: "24px", textAlign: "center", color: "#fff", background: "radial-gradient(130% 110% at 100% 0%,#ffb347 0%,#ff4f6d 40%,#7a1fa2 100%)" }}>
              {" "}
              <h2 style={{ fontSize: "22px" }}>
                You've sent 3. Ready to receive?
              </h2>
              {" "}
              <p style={{ fontSize: "14px", opacity: ".92", marginTop: "4px" }}>
                Make your own link in 20 seconds. Your receipts move into your account.
              </p>
              {" "}
              <SkLink href="/signup" className="tap" style={{ display: "grid", placeItems: "center", marginTop: "12px", minHeight: "52px", borderRadius: "16px", background: "#fff", color: "#3a0b5a", fontWeight: "800", textDecoration: "none" }}>
                Get my own link
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
      </>
    );
  }
}
