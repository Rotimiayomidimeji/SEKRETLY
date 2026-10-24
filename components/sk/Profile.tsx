// @ts-nocheck -- ported 1:1 from design/mockup/Profile.dc.html by scripts/port-mockup.mjs; typed as it gets wired to real data
"use client";

import React, { Fragment } from "react";
import { saveMode, SkLink, route } from "@/lib/sk/runtime";


export default class Profile extends React.Component<Record<string, any>, any> {
  static defaultProps = {"mode":"dark","view":"own"};

  constructor(props) {
    super(props);
    var m = null; // light/dark arrives as props.mode from the sk-mode cookie
    this.state = { mode: m || props.mode || 'dark', av: Math.max(0, ['fox', 'panda', 'frog', 'octopus', 'unicorn', 'koala'].indexOf(props.avatar)), bio: props.bio || '', editing: false, pub: props.pub !== false, picker: false, reported: false, range: 0, word: '', cloudPub: props.cloudPub !== false };
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
    var own = this.props.view !== 'public', U = this.props.username || '';
    var A = [
      { name: 'fox', src: '/sk/fox.png', bg: 'linear-gradient(135deg,#ffb35c,#ff5f8f)' },
      { name: 'panda', src: '/sk/panda.png', bg: 'linear-gradient(135deg,#7ef0c1,#3aa0ff)' },
      { name: 'frog', src: '/sk/frog.png', bg: 'linear-gradient(135deg,#d6ff6b,#22c4a0)' },
      { name: 'octopus', src: '/sk/octopus.png', bg: 'linear-gradient(135deg,#ffd0f0,#a46bff)' },
      { name: 'unicorn', src: '/sk/unicorn.png', bg: 'linear-gradient(135deg,#9fe7ff,#ff9ad5)' },
      { name: 'koala', src: '/sk/koala.png', bg: 'linear-gradient(135deg,#ffe48a,#ff8a5c)' }
    ];
    var av = A[s.av];
    var L = this.props.links || [];
    // word cloud from "describe me in 3 words" answers
    var WD = this.props.words || { all: [], month: {}, week: {} }, ALL = WD.all, MONTH = WD.month, WEEK = WD.week;
    var map = [null, MONTH, WEEK][s.range];
    var W = ALL.map(function (a) { return { word: a[0], n: map ? (map[a[0]] || 0) : a[1], trend: a[2] }; }).filter(function (a) { return a.n > 0; });
    var mx = W.reduce(function (m, a) { return Math.max(m, a.n); }, 1);
    var PAL = dark ? ['#ff6aa8', '#ffb347', '#8c7bff', '#5be0a0', '#4fc3ff', '#ff8b98'] : ['#b0246a', '#9a5200', '#5b3fd6', '#17734a', '#0b63ad', '#b42340'];
    var cw = W.filter(function (a) { return a.word === s.word; })[0] || W[0];
    var BD = this.props.badges || [];
    return {
      cloudTitle: own ? 'How people describe you' : 'How people describe @' + U, cloudDisplay: own || s.cloudPub ? 'block' : 'none',
      answerCount: (this.props.answerCounts || [0, 0, 0])[s.range],
      ranges: ['All time', 'This month', 'This week'].map(function (n, i) { return { name: n, on: s.range === i ? 'true' : 'false', pick: function () { self.setState({ range: i }); } }; }),
      words: W.map(function (a, i) { var t = a.n / mx, on = cw && cw.word === a.word; return { word: a.word, n: a.n, on: on ? 'true' : 'false', size: Math.round(15 + t * 27) + 'px', color: on ? '#ffffff' : PAL[i % PAL.length], bg: on ? 'var(--pink)' : 'transparent', pick: function () { self.setState({ word: a.word }); } }; }),
      pickWord: cw ? cw.word : '', pickN: cw ? cw.n : 0, pickTrend: cw ? cw.trend : '',
      shareCloud: function () { try { window.localStorage.setItem('sk-share', JSON.stringify(['pk'])); window.localStorage.setItem('sk-nav', String(Date.now())); } catch (e) {} },
      cloudPubStr: s.cloudPub ? 'true' : 'false', toggleCloudPub: function () { self.setState({ cloudPub: !s.cloudPub }); self.props.save({ cloudPublic: !s.cloudPub }); },
      badges: BD.map(function (b) { return { name: b[0], icon: b[1], bg: b[2], filter: b[3] ? 'none' : 'grayscale(1)', op: b[3] ? 1 : 0.7 }; }),
      reportProfile: function () { self.props.reportProfile(U).then(function (r) { if (r && r.login) { window.location.href = '/login?next=' + encodeURIComponent('/u/' + U); return; } self.setState({ reported: true }); }); }, reportedProfile: !!s.reported, reportLabel: s.reported ? 'Reported · our team will take a look' : 'Report this profile',
      mode: dark ? 'dark' : 'light', isDark: dark, isLight: !dark, modeWord: dark ? 'Light' : 'Dark',
      toggleMode: function () { var n = dark ? 'light' : 'dark'; saveMode(n); self.setState({ mode: n }); },
      isOwn: own, isPublic: !own,
      mainPad: own ? '116px' : '40px',
      hiddenPublic: !own && !s.pub, showProfile: own || s.pub,
      avSrc: av.src, avBg: av.bg, avName: av.name,
      bio: s.bio, onBio: function (e) { self.setState({ bio: e.target.value.slice(0, 150) }); }, bioCount: s.bio.length,
      editing: s.editing && own, notEditing: !(s.editing && own),
      editLabel: s.editing ? 'Save' : 'Edit profile',
      toggleEdit: function () { if (s.editing) self.props.save({ bio: s.bio }); self.setState({ editing: !s.editing }); },
      pubStr: s.pub ? 'true' : 'false', pubHint: s.pub ? 'Anyone can see your avatar, bio and active links' : 'Only people with your link can reach you',
      togglePub: function () { self.setState({ pub: !s.pub }); self.props.save({ publicProfile: !s.pub }); },
      linksTitle: own ? 'Active links' : 'Send @' + U + ' something',
      links: L.map(function (l) { return { topic: l.topic, th: l.th, emoji: l.emoji, href: l.href, cta: own ? 'Manage' : 'Send' }; }),
      picker: s.picker,
      openPicker: function () { self.setState({ picker: true }); },
      closePicker: function () { self.setState({ picker: false }); },
      avatars: A.map(function (a, i) { var on = s.av === i; return { name: a.name, src: a.src, bg: a.bg, on: on ? 'true' : 'false', ring: on ? '#ff3b8d' : 'transparent', pick: function () { self.setState({ av: i }); self.props.save({ avatar: a.name }); } }; })
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
          {v.isOwn ? (
            <>
            {" "}
            <nav className="side" aria-label="Main">
              {" "}
              <SkLink href="/" className="logo" aria-label="Sekretly home page" style={{ padding: "0 10px 20px" }}>
                <span className="logo-mark">
                  S
                </span>
                <span className="logo-word">
                  Sekretly
                </span>
              </SkLink>
              {" "}
              <SkLink href="/home" className="nav-i">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M3 11 12 3l9 8" />
                  <path d="M5 10v10h14V10" />
                </svg>
                Home
              </SkLink>
              {" "}
              <SkLink href="/inbox" className="nav-i">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M22 12h-6l-2 3h-4l-2-3H2" />
                  <path d="M5.5 5h13L22 12v7H2v-7z" />
                </svg>
                Inbox
                {v.navInbox ? (
                  <>
                  <span className="count">
                    {v.navInbox}
                  </span>
                  </>
                ) : null}
              </SkLink>
              {" "}
              <SkLink href="/create" className="nav-i">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
                  <path d="M12 5v14M5 12h14" />
                </svg>
                Create link
              </SkLink>
              {" "}
              <SkLink href="/links" className="nav-i">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M10 13a5 5 0 0 0 7 0l3-3a5 5 0 0 0-7-7l-1 1" />
                  <path d="M14 11a5 5 0 0 0-7 0l-3 3a5 5 0 0 0 7 7l1-1" />
                </svg>
                My links
              </SkLink>
              {" "}
              <SkLink href="/games" className="nav-i">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <rect x="2" y="7" width="20" height="11" rx="5" />
                  <path d="M7 11v3M5.5 12.5h3" />
                </svg>
                Games
              </SkLink>
              {" "}
              <SkLink href="/notifications" className="nav-i">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
                  <path d="M10.3 21a1.9 1.9 0 0 0 3.4 0" />
                </svg>
                Notifications
                {v.navNotif ? (
                  <>
                  <span className="count">
                    {v.navNotif}
                  </span>
                  </>
                ) : null}
              </SkLink>
              {" "}
              <SkLink href="/profile" className="nav-i" aria-current="page">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
                  <circle cx="12" cy="8" r="4" />
                  <path d="M4 21a8 8 0 0 1 16 0" />
                </svg>
                Profile
              </SkLink>
              {" "}
              <SkLink href="/settings" className="nav-i">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
                  <circle cx="12" cy="12" r="3" />
                  <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
                </svg>
                Settings
              </SkLink>
              {" "}
            </nav>
            {" "}
            </>
          ) : null}
          {" "}
          <div className="main" style={{ paddingBottom: v.mainPad }}>
            {" "}
            <div className="wrap" style={{ maxWidth: "680px" }}>
              {" "}
              <header className="topbar">
                {" "}
                {v.isPublic ? (
                  <>
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
                  </>
                ) : null}
                {" "}
                {v.isOwn ? (
                  <>
                  <h1 style={{ fontSize: "28px" }}>
                    Profile
                  </h1>
                  </>
                ) : null}
                {" "}
                <span className="grow" />
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
                {v.isOwn ? (
                  <>
                  {" "}
                  <SkLink href="/settings" className="icon-btn tap" aria-label="Settings">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
                      <circle cx="12" cy="12" r="3" />
                      <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
                    </svg>
                  </SkLink>
                  {" "}
                  </>
                ) : null}
                {" "}
                {v.isPublic ? (
                  <>
                  {" "}
                  <SkLink href="/signup" className="btn btn-sm btn-cta">
                    Get your link
                  </SkLink>
                  {" "}
                  </>
                ) : null}
                {" "}
              </header>
              {" "}
              {v.hiddenPublic ? (
                <>
                {" "}
                <div className="card" style={{ padding: "32px 20px", textAlign: "center", marginTop: "20px" }}>
                  {" "}
                  <img src="/sk/shushing_face.png" alt="" style={{ width: "72px", height: "72px" }} />
                  {" "}
                  <h2 style={{ marginTop: "10px", fontSize: "24px" }}>
                    This profile is private
                  </h2>
                  {" "}
                  <p className="muted" style={{ marginTop: "6px" }}>
                    If @{v.username}{" shared a link with you, open that link to send a message."}
                  </p>
                  {" "}
                  <SkLink href="/signup" className="btn btn-cta btn-lg" style={{ marginTop: "16px" }}>
                    Make your own Sekretly
                  </SkLink>
                  {" "}
                </div>
                {" "}
                </>
              ) : null}
              {" "}
              {v.showProfile ? (
                <>
                {" "}
                <div>
                  {" "}
                  <section className="card" style={{ padding: "22px", textAlign: "center", position: "relative", overflow: "hidden" }}>
                    {" "}
                    <div style={{ position: "absolute", inset: "0 0 auto 0", height: "90px", background: "var(--cta)", opacity: ".9" }} />
                    {" "}
                    <span className="pop" style={{ position: "relative", width: "112px", height: "112px", marginTop: "20px", borderRadius: "36px", background: v.avBg, display: "inline-grid", placeItems: "center", border: "4px solid var(--card)" }}>
                      {" "}
                      <img src={v.avSrc} alt={`Avatar, a ${v.avName}`} style={{ width: "80px", height: "80px" }} />
                      {" "}
                    </span>
                    {" "}
                    {v.isOwn ? (
                      <>
                      {" "}
                      <div>
                        <button className="btn btn-sm tap" onClick={v.openPicker} style={{ marginTop: "10px" }}>
                          Change avatar
                        </button>
                      </div>
                      {" "}
                      </>
                    ) : null}
                    {" "}
                    <h2 style={{ marginTop: "12px", fontSize: "26px" }}>
                      @{v.username}
                    </h2>
                    {" "}
                    {v.notEditing ? (
                      <>
                      {" "}
                      <p className="muted" style={{ margin: "8px auto 0", fontSize: "15.5px", lineHeight: "1.5", maxWidth: "36ch" }}>
                        {v.bio}
                      </p>
                      {" "}
                      </>
                    ) : null}
                    {" "}
                    {v.editing ? (
                      <>
                      {" "}
                      <div style={{ textAlign: "left", marginTop: "12px" }}>
                        {" "}
                        <label htmlFor="pf-bio" className="label">
                          Bio
                        </label>
                        {" "}
                        <textarea id="pf-bio" className="field" value={v.bio ?? ""} onChange={v.onBio} maxLength="150" style={{ minHeight: "90px" }} />
                        {" "}
                        <div className="hint" style={{ textAlign: "right" }}>
                          {v.bioCount}/150
                        </div>
                        {" "}
                      </div>
                      {" "}
                      </>
                    ) : null}
                    {" "}
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: "8px", marginTop: "16px" }}>
                      {" "}
                      <div>
                        <div className="d" style={{ fontSize: "22px", fontWeight: "800" }}>
                          {v.stats.links}
                        </div>
                        <div className="muted" style={{ fontSize: "12.5px" }}>
                          links
                        </div>
                      </div>
                      {" "}
                      <div>
                        <div className="d" style={{ fontSize: "22px", fontWeight: "800" }}>
                          {v.stats.messages}
                        </div>
                        <div className="muted" style={{ fontSize: "12.5px" }}>
                          messages
                        </div>
                      </div>
                      {" "}
                      <div>
                        <div className="d" style={{ fontSize: "22px", fontWeight: "800" }}>
                          {v.stats.games}
                        </div>
                        <div className="muted" style={{ fontSize: "12.5px" }}>
                          games
                        </div>
                      </div>
                      {" "}
                    </div>
                    {" "}
                    {v.isOwn ? (
                      <>
                      {" "}
                      <div style={{ display: "flex", gap: "8px", marginTop: "16px" }}>
                        {" "}
                        <button className="btn tap" onClick={v.toggleEdit} style={{ flex: "1" }}>
                          {v.editLabel}
                        </button>
                        {" "}
                        <SkLink href={route(`/u/${v.username}`)} className="btn tap" style={{ flex: "1" }}>
                          View as visitor
                        </SkLink>
                        {" "}
                      </div>
                      {" "}
                      </>
                    ) : null}
                    {" "}
                  </section>
                  {" "}
                  {v.isOwn ? (
                    <>
                    {" "}
                    <div className="card row" style={{ padding: "14px", marginTop: "12px" }}>
                      {" "}
                      <div style={{ flex: "1" }}>
                        <b style={{ fontSize: "15px" }}>
                          Public profile
                        </b>
                        <div className="muted" style={{ fontSize: "13px" }}>
                          {v.pubHint}
                        </div>
                      </div>
                      {" "}
                      <button className="switch" role="switch" aria-checked={v.pubStr} aria-label="Public profile" onClick={v.togglePub} />
                      {" "}
                    </div>
                    {" "}
                    </>
                  ) : null}
                  {" "}
                  <section className="card" style={{ marginTop: "12px", padding: "16px", display: v.cloudDisplay }} aria-labelledby="pf-cloud">
                    {" "}
                    <div className="row" style={{ justifyContent: "space-between", gap: "10px" }}>
                      {" "}
                      <div>
                        <h2 id="pf-cloud" style={{ fontSize: "19px" }}>
                          {v.cloudTitle}
                        </h2>
                        <p className="muted" style={{ fontSize: "12.5px" }}>
                          {"From "}{v.answerCount}{" “describe me in 3 words” answers"}
                        </p>
                      </div>
                      {" "}
                    </div>
                    {" "}
                    <div className="seg" role="group" aria-label="Time range" style={{ marginTop: "10px" }}>
                      {" "}
                      {(v.ranges || []).map((rg, i0) => (
                        <Fragment key={i0}>
                        <button aria-pressed={rg.on} onClick={rg.pick}>
                          {rg.name}
                        </button>
                        </Fragment>
                      ))}
                      {" "}
                    </div>
                    {" "}
                    <div style={{ marginTop: "12px", padding: "14px 8px", borderRadius: "20px", background: "radial-gradient(120% 100% at 50% 0%,rgba(216,27,114,.20),rgba(122,60,255,.08) 60%,transparent)", display: "flex", flexWrap: "wrap", justifyContent: "center", alignItems: "center", gap: "4px 12px", minHeight: "190px" }}>
                      {" "}
                      {(v.words || []).map((w, i0) => (
                        <Fragment key={i0}>
                        {" "}
                        <button className="d tap" onClick={w.pick} aria-pressed={w.on} aria-label={`${w.word}, said ${w.n} times`} style={{ border: "0", background: w.bg, color: w.color, fontSize: w.size, fontWeight: "800", lineHeight: "1", padding: "4px 8px", borderRadius: "12px", minHeight: "34px" }}>
                          {w.word}
                        </button>
                        {" "}
                        </Fragment>
                      ))}
                      {" "}
                    </div>
                    {" "}
                    <div className="row" style={{ marginTop: "10px", padding: "10px 12px", borderRadius: "14px", background: "var(--card2)", fontSize: "13.5px" }}>
                      <b className="d" style={{ fontSize: "16px", flex: "1" }}>
                        {v.pickWord}
                      </b>
                      <span className="muted">
                        {"said "}{v.pickN}{" times · "}{v.pickTrend}
                      </span>
                    </div>
                    {" "}
                    {v.isOwn ? (
                      <>
                      {" "}
                      <div>
                        {" "}
                        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: "8px", marginTop: "10px" }}>
                          {" "}
                          <SkLink href="/share" onClick={v.shareCloud} className="btn btn-cta tap">
                            Share my cloud
                          </SkLink>
                          {" "}
                          <SkLink href="/links" className="btn tap">
                            Get more words
                          </SkLink>
                          {" "}
                        </div>
                        {" "}
                        <div className="row" style={{ marginTop: "10px", paddingTop: "10px", borderTop: "1px solid var(--line)" }}>
                          {" "}
                          <span style={{ flex: "1" }}>
                            <b style={{ fontSize: "14.5px" }}>
                              Show on my public profile
                            </b>
                            <div className="muted" style={{ fontSize: "12.5px" }}>
                              Held or reported words never appear
                            </div>
                          </span>
                          {" "}
                          <button className="switch" role="switch" aria-checked={v.cloudPubStr} aria-label="Show word cloud on public profile" onClick={v.toggleCloudPub} />
                          {" "}
                        </div>
                        {" "}
                      </div>
                      {" "}
                      </>
                    ) : null}
                    {" "}
                  </section>
                  {" "}
                  {v.isOwn ? (
                    <>
                    {" "}
                    <div>
                      {" "}
                      <div className="sec-h">
                        <h2>
                          Badges
                        </h2>
                        <SkLink href="/badges" className="pink" style={{ fontWeight: "700", fontSize: "14px" }}>
                          All 12
                        </SkLink>
                      </div>
                      {" "}
                      <div className="rail" style={{ display: "flex", gap: "10px", margin: "0 -16px", padding: "0 16px 4px" }}>
                        {" "}
                        {(v.badges || []).map((bd, i0) => (
                          <Fragment key={i0}>
                          {" "}
                          <SkLink href="/badges" className="card tap" style={{ flex: "none", width: "104px", padding: "12px 8px", textAlign: "center", textDecoration: "none", opacity: bd.op }}>
                            {" "}
                            <span style={{ width: "54px", height: "54px", borderRadius: "18px", margin: "0 auto", display: "grid", placeItems: "center", background: bd.bg, filter: bd.filter }}>
                              <img src={bd.icon} alt="" style={{ width: "34px", height: "34px" }} />
                            </span>
                            {" "}
                            <b style={{ display: "block", fontSize: "12.5px", marginTop: "8px", lineHeight: "1.15" }}>
                              {bd.name}
                            </b>
                            {" "}
                          </SkLink>
                          {" "}
                          </Fragment>
                        ))}
                        {" "}
                      </div>
                      {" "}
                    </div>
                    {" "}
                    </>
                  ) : null}
                  {" "}
                  <div className="sec-h">
                    <h2>
                      {v.linksTitle}
                    </h2>
                  </div>
                  {" "}
                  <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                    {" "}
                    {(v.links || []).map((l, i0) => (
                      <Fragment key={i0}>
                      {" "}
                      <SkLink href={route(l.href)} className={`${l.th} tap`} style={{ display: "flex", alignItems: "center", gap: "12px", padding: "16px", borderRadius: "22px", textDecoration: "none" }}>
                        {" "}
                        <img src={l.emoji} alt="" style={{ width: "40px", height: "40px" }} />
                        {" "}
                        <span className="d" style={{ flex: "1", fontSize: "19px", fontWeight: "800", lineHeight: "1.1" }}>
                          {l.topic}
                        </span>
                        {" "}
                        <span style={{ fontSize: "13px", fontWeight: "800", padding: "8px 12px", borderRadius: "99px", background: "rgba(255,255,255,.92)", color: "#2a0a1c" }}>
                          {l.cta}
                        </span>
                        {" "}
                      </SkLink>
                      {" "}
                      </Fragment>
                    ))}
                    {" "}
                  </div>
                  {" "}
                  {v.isPublic ? (
                    <>
                    {" "}
                    <div style={{ textAlign: "center", marginTop: "18px" }}>
                      {" "}
                      <p className="muted" style={{ fontSize: "13px" }}>
                        Messages are never shown on profiles.
                      </p>
                      {" "}
                      <button className="btn btn-ghost btn-sm tap" onClick={v.reportProfile} disabled={!!(v.reportedProfile)} style={{ border: "0", color: "var(--muted)", marginTop: "4px" }}>
                        {v.reportLabel}
                      </button>
                      {" "}
                    </div>
                    {" "}
                    </>
                  ) : null}
                  {" "}
                </div>
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
        {v.isOwn ? (
          <>
          {" "}
          <nav className="bnav" aria-label="Main">
            {" "}
            <SkLink href="/home">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M3 11 12 3l9 8" />
                <path d="M5 10v10h14V10" />
              </svg>
              Home
            </SkLink>
            {" "}
            <SkLink href="/inbox">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M22 12h-6l-2 3h-4l-2-3H2" />
                <path d="M5.5 5h13L22 12v7H2v-7z" />
              </svg>
              Inbox
              {v.navInbox ? (
                <>
                <span className="badge">
                  {v.navInbox}
                </span>
                </>
              ) : null}
            </SkLink>
            {" "}
            <SkLink href="/create" className="fab" aria-label="Create link">
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" aria-hidden="true">
                <path d="M12 5v14M5 12h14" />
              </svg>
            </SkLink>
            {" "}
            <SkLink href="/games">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <rect x="2" y="7" width="20" height="11" rx="5" />
                <path d="M7 11v3M5.5 12.5h3" />
              </svg>
              Games
            </SkLink>
            {" "}
            <SkLink href="/profile" aria-current="page">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden="true">
                <circle cx="12" cy="8" r="4" />
                <path d="M4 21a8 8 0 0 1 16 0" />
              </svg>
              Profile
            </SkLink>
            {" "}
          </nav>
          {" "}
          </>
        ) : null}
        {" "}
        {v.picker ? (
          <>
          {" "}
          <div className="scrim">
            {" "}
            <div className="sheet" role="dialog" aria-label="Choose avatar">
              {" "}
              <h2 style={{ fontSize: "22px" }}>
                Pick your animal
              </h2>
              {" "}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: "10px", marginTop: "14px" }}>
                {" "}
                {(v.avatars || []).map((a, i0) => (
                  <Fragment key={i0}>
                  {" "}
                  <button className="tap" onClick={a.pick} aria-pressed={a.on} aria-label={a.name} style={{ aspectRatio: "1", borderRadius: "24px", border: `3px solid ${a.ring}`, background: a.bg, display: "grid", placeItems: "center", padding: "0" }}>
                    {" "}
                    <img src={a.src} alt="" style={{ width: "62%", height: "62%" }} />
                    {" "}
                  </button>
                  {" "}
                  </Fragment>
                ))}
                {" "}
              </div>
              {" "}
              <button className="btn btn-cta btn-lg btn-block tap" onClick={v.closePicker} style={{ marginTop: "16px" }}>
                Done
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
