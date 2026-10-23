// @ts-nocheck -- ported 1:1 from design/mockup/Landing.dc.html by scripts/port-mockup.mjs; typed as it gets wired to real data
"use client";

import React, { Fragment } from "react";
import { saveMode, SkLink } from "@/lib/sk/runtime";
import Main from "./Main";

export default class Landing extends React.Component<Record<string, any>, any> {
  static defaultProps = {"mode":"dark","consent":"auto"};

  constructor(props) {
    super(props);
    var m = null; // light/dark arrives as props.mode from the sk-mode cookie
    // cookie choices are read after mount (sessionStorage only exists in the browser)
    var ck = 'pending';
    this.state = { consent: !ck, ckMore: false, ckAds: true, ckStats: true, mode: m || props.mode || 'dark', menu: false, topic: 0, theme: 'sunset', word: null, text: '', sent: false };
  }
  componentDidMount() {
    var self = this;
    this.onStore = function (e) { if (e.key === 'sk-mode' && e.newValue) self.setState({ mode: e.newValue }); };
    try { window.addEventListener('storage', this.onStore); } catch (e) {}
    try { this.motionOn(); } catch (e) {}
    var seen = null;
    try { seen = window.sessionStorage.getItem('sk-consent'); } catch (e) {}
    if (!seen || this.props.consent === 'show') this.setState({ consent: true });
    // arriving from another page's "How it works" / "Games" link
    var j = null;
    try { j = window.localStorage.getItem('sk-jump'); window.localStorage.removeItem('sk-jump'); } catch (e) {}
    if (!j) { try { j = (window.location.hash || '').replace('#', ''); } catch (e) {} }
    if (j === 'how' || j === 'games') { this.jt = setTimeout(function () { self.jump(j); }, 450); }
  }
  // smooth-scroll to a section without changing the page address (the canvas stops boards that navigate)
  jump(id) {
    try { var el = document.getElementById(id); if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' }); } catch (e) {}
  }
  componentWillUnmount() {
    clearTimeout(this.jt);
    try { window.removeEventListener('storage', this.onStore); } catch (e) {}
    try { window.removeEventListener('scroll', this.onScroll, true); document.removeEventListener('pointermove', this.onPtr); if (this.io) this.io.disconnect(); } catch (e) {}
  }
  // landing motion that CSS alone can't do: scroll progress, reveal on scroll, pointer-following effects
  motionOn() {
    var doc = document, win = window, tick = 0, lastT = null, lastM = null;
    this.onScroll = function () {
      if (tick) return;
      tick = win.requestAnimationFrame(function () {
        tick = 0;
        doc.querySelectorAll('.lh').forEach(function (h) {
          var r = h.getBoundingClientRect(), p = Math.min(1, Math.max(0, -r.top / (r.height * 0.85)));
          h.style.setProperty('--p', p.toFixed(3));
          var root = h.closest('.sk'), nav = root && root.querySelector('.pub-nav--float');
          if (nav) nav.classList.toggle('is-scrolled', r.top < -40);
          if (root) { var de = doc.documentElement, nearEnd = (win.innerHeight + (win.scrollY || de.scrollTop)) > de.scrollHeight - 700; root.classList.toggle('show-dock', r.bottom < 60 && !nearEnd); }
        });
      });
    };
    win.addEventListener('scroll', this.onScroll, { passive: true, capture: true });
    this.onScroll();
    if ('IntersectionObserver' in win) {
      var io = this.io = new IntersectionObserver(function (es) {
        es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
      }, { rootMargin: '0px 0px -8% 0px', threshold: 0.12 });
      doc.querySelectorAll('.lh').forEach(function (h) {
        var root = h.closest('.sk'); if (!root) return;
        root.setAttribute('data-rv', 'on');
        root.querySelectorAll('.rv, .rv-stag').forEach(function (el) { io.observe(el); });
      });
    }
    this.onPtr = function (e) {
      var t = e.target && e.target.closest ? e.target : null; if (!t) return;
      var sp = t.closest('.spot');
      if (sp) { var q = sp.getBoundingClientRect(); sp.style.setProperty('--mx', Math.round(e.clientX - q.left) + 'px'); sp.style.setProperty('--my', Math.round(e.clientY - q.top) + 'px'); }
      var tl = e.pointerType === 'mouse' ? t.closest('.tilt3d') : null;
      if (lastT && lastT !== tl) lastT.style.transform = '';
      if (tl) { var c = tl.getBoundingClientRect(), x = (e.clientX - c.left) / c.width - 0.5, y = (e.clientY - c.top) / c.height - 0.5; tl.style.transform = 'perspective(900px) translateY(-5px) rotateX(' + (y * -10).toFixed(2) + 'deg) rotateY(' + (x * 12).toFixed(2) + 'deg)'; }
      lastT = tl;
      var mg = e.pointerType === 'mouse' ? t.closest('.mag') : null;
      if (lastM && lastM !== mg) lastM.style.translate = '';
      if (mg) { var m = mg.getBoundingClientRect(); mg.style.translate = ((e.clientX - m.left - m.width / 2) * 0.14).toFixed(1) + 'px ' + ((e.clientY - m.top - m.height / 2) * 0.25).toFixed(1) + 'px'; }
      lastM = mg;
    };
    doc.addEventListener('pointermove', this.onPtr, { passive: true });
  }
  componentDidUpdate(prev) { if (prev.mode !== this.props.mode && this.props.mode) this.setState({ mode: this.props.mode }); }
  renderVals() {
    var self = this, s = this.state;
    var E = {
      shush: '/sk/shushing_face.png', peach: '/sk/peach.png', moon: '/sk/crescent_moon.png',
      unicorn: '/sk/unicorn.png', fire: '/sk/fire.png', octopus: '/sk/octopus.png',
      sparkles: '/sk/sparkles.png', hourglass: '/sk/hourglass_not_done.png', die: '/sk/game_die.png',
      eyes: '/sk/eyes.png', ghost: '/sk/ghost.png', letter: '/sk/love_letter.png', fox: '/sk/fox.png'
    };
    var dark = s.mode !== 'light';
    var TOP = [['Describe me', 'describe'], ['Know-me quiz', 'quiz'], ['Confess', 'confess'], ['Rate me', 'rate'], ['Ask me anything', 'ama']];
    var TH = [['default', 'Default'], ['sunset', 'Sunset'], ['midnight', 'Midnight'], ['bubblegum', 'Bubblegum'], ['neon', 'Neon'], ['ocean', 'Ocean']];
    var marq = ['describe me in 3 words', 'rate me 1–10', 'confess something', 'ask me anything', 'never have I ever', 'how well do you know me?', 'truth or dare', 'hot takes'];
    var colors = ['#ffe27a', '#ffffff', '#ff5fa2', '#7a3cff', '#22e1ff', '#5be0a0'];
    var confetti = [];
    for (var i = 0; i < 12; i++) confetti.push({ k: (i % 6) + 1, color: colors[i % 6], delay: (i * 0.04).toFixed(2) + 's' });
    return {
      mode: dark ? 'dark' : 'light',
      isDark: dark, isLight: !dark,
      modeWord: dark ? 'Light' : 'Dark',
      nextMode: dark ? 'light' : 'dark',
      drawerCls: self.state.drawer ? 'is-open' : '', drawerOpen: self.state.drawer ? 'true' : 'false', drawerHidden: self.state.drawer ? 'false' : 'true',
      consentOpen: s.consent, ckMore: s.ckMore, ckMoreLabel: s.ckMore ? 'Fewer options' : 'Choose what to allow',
      ckAdsStr: s.ckAds ? 'true' : 'false', ckStatsStr: s.ckStats ? 'true' : 'false',
      toggleCkAds: function () { self.setState({ ckAds: !s.ckAds }); }, toggleCkStats: function () { self.setState({ ckStats: !s.ckStats }); },
      ckToggleMore: function () { self.setState({ ckMore: !s.ckMore }); },
      ckSaveLabel: s.ckMore ? 'Save my choices' : 'Essential only',
      ckAccept: function () { try { window.sessionStorage.setItem('sk-consent', 'all'); } catch (e) {} self.setState({ consent: false }); },
      ckSave: function () { var v = s.ckMore ? (s.ckAds ? 'ads' : '') + (s.ckStats ? '+stats' : '') || 'essential' : 'essential'; try { window.sessionStorage.setItem('sk-consent', v); } catch (e) {} self.setState({ consent: false }); },
      openConsent: function () { self.setState({ consent: true, ckMore: true }); },
      toggleDrawer: function () { self.setState({ drawer: !self.state.drawer }); },
      goHow: function (e) { if (e && e.preventDefault) e.preventDefault(); self.setState({ drawer: false }); setTimeout(function () { self.jump('how'); }, 60); },
      goGames: function (e) { if (e && e.preventDefault) e.preventDefault(); self.setState({ drawer: false }); setTimeout(function () { self.jump('games'); }, 60); },
      toggleMode: function () { var n = dark ? 'light' : 'dark'; saveMode(n); self.setState({ mode: n }); },
      // hero art leans toward the pointer; writes CSS vars straight to the header so nothing re-renders
      tilt: function (e) {
        var el = e && e.currentTarget; if (!el || !el.getBoundingClientRect) return;
        var pt = e.touches && e.touches[0] ? e.touches[0] : e; if (pt.clientX == null) return;
        var r = el.getBoundingClientRect(), x = (pt.clientX - r.left) / r.width - 0.5, y = (pt.clientY - r.top) / r.height - 0.5;
        el.style.setProperty('--ry', (x * 9).toFixed(2) + 'deg'); el.style.setProperty('--rx', (y * -6).toFixed(2) + 'deg');
        el.style.setProperty('--hx', (x * -40).toFixed(1) + 'px'); el.style.setProperty('--hy', (y * -30).toFixed(1) + 'px');
        el.style.setProperty('--cx', Math.round(pt.clientX - r.left) + 'px'); el.style.setProperty('--cy', Math.round(pt.clientY - r.top) + 'px');
      },
      untilt: function (e) { var el = e && e.currentTarget; if (!el || !el.style) return; ['--rx', '--ry', '--hx', '--hy'].forEach(function (k) { el.style.removeProperty(k); }); },
      menuOpen: s.menu,
      toggleMenu: function () { self.setState({ menu: !s.menu }); },
      marquee: marq.concat(marq),
      dockOn: !s.consent,
      features: [
        { n: '01', icon: E.sparkles, title: 'Every topic plays different', body: 'Tap 3 words, take a know-me quiz, rate 1–10 or write a long confession. Never a boring text box.' },
        { n: '02', icon: E.fox, title: 'Two-way anonymous chats', body: 'Text, photos and short videos. Friends with an account chat back and forth, and neither side ever learns who.' },
        { n: '03', icon: E.hourglass, title: 'Messages that disappear', body: 'Set a timer from 1 day to 3 weeks. Then poof, gone from our servers too.' },
        { n: '04', icon: E.die, title: 'Live party games', body: 'Never Have I Ever, Truth or Dare and more, with random nicknames.' }
      ],
      topics: TOP.map(function (t, i) { var on = s.topic === i; return { label: t[0], on: on ? 'true' : 'false', cls: on ? 'on' : '', pick: function () { self.setState({ topic: i }); } }; }),
      themes: TH.map(function (t) { var on = s.theme === t[0]; return { name: t[1], cls: 'th-' + t[0], on: on ? 'true' : 'false', ring: on ? '#ff3b8d' : 'transparent', pick: function () { self.setState({ theme: t[0] }); } }; }),
      demoTh: s.theme, demoTopic: TOP[s.topic][1],
      steps: [
        { n: '01', title: 'Create', body: 'Pick a topic, a theme and optional limits. Ten seconds, tops.' },
        { n: '02', title: 'Share', body: 'Drop the link on WhatsApp Status, Instagram or Snapchat.' },
        { n: '03', title: 'Receive', body: 'Anonymous messages land in your inbox with a ping.' },
        { n: '04', title: 'Post the best', body: 'Turn a reply into a story card. Their friends tap, and it starts again.' }
      ],
      fading: [
        { text: 'Funny · Loyal · Chaotic', left: '23h left', op: 1, blur: '0px', th: 'th-sunset', icon: E.ghost },
        { text: '9/10. Minus one for always being late.', left: '8h left', op: 0.8, blur: '0px', th: 'th-midnight', icon: E.ghost },
        { text: 'I still have your hoodie.', left: '1h left', op: 0.5, blur: '0.5px', th: 'th-bubblegum', icon: E.ghost },
        { text: 'Message disappeared', left: 'gone', op: 0.25, blur: '1.5px', th: 'th-default', icon: E.hourglass }
      ],
      games: [
        { name: 'Never Have I Ever', meta: '3–10 players · 3 lives', icon: E.shush, tag: 'Live', tagBg: '#0d7f4b', tagInk: '#ffffff' },
        { name: 'Truth or Dare', meta: '2–4 players · photo dares', icon: E.die, tag: 'Live', tagBg: '#0d7f4b', tagInk: '#ffffff' },
        { name: 'Would You Rather', meta: '2–20 players · quick votes', icon: E.eyes, tag: 'Live', tagBg: '#0d7f4b', tagInk: '#ffffff' },
        { name: 'Most Likely To', meta: '3–15 players · vote a friend', icon: E.fire, tag: 'Live', tagBg: '#0d7f4b', tagInk: '#ffffff' },
        { name: 'Hot Takes', meta: '2–20 players · agree or not', icon: E.sparkles, tag: 'Live', tagBg: '#0d7f4b', tagInk: '#ffffff' },
        { name: 'Anonymous Polls', meta: 'any size · live results', icon: E.letter, tag: 'Live', tagBg: '#0d7f4b', tagInk: '#ffffff' }
      ],
      safety: ['Report in one tap', '50+ report reasons', 'Senders get warned', '4th report blocks them', 'Undo a block anytime', 'Photos blurred until you tap']
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
        <div style={{ overflow: "hidden", borderBottom: "1px solid var(--line)", background: "var(--bg2)" }} aria-hidden="true">
          {" "}
          <div className="marquee" style={{ padding: "9px 0", fontSize: "13px", fontWeight: "700", color: "var(--muted)" }}>
            {" "}
            {(v.marquee || []).map((mq, i0) => (
              <Fragment key={i0}>
              {" "}
              <span style={{ display: "inline-flex", alignItems: "center", gap: "28px", whiteSpace: "nowrap" }}>
                {mq}
                <span style={{ width: "5px", height: "5px", borderRadius: "50%", background: "#ff3b8d" }} />
              </span>
              {" "}
              </Fragment>
            ))}
            {" "}
          </div>
          {" "}
        </div>
        {" "}
        <nav className="pub-nav pub-nav--float" aria-label="Main">
          {" "}
          <SkLink href="/" className="logo" aria-label="Sekretly home">
            <span className="logo-mark">
              S
            </span>
            <span className="logo-word">
              Sekretly
            </span>
          </SkLink>
          {" "}
          <div className="pub-links">
            {" "}
            <SkLink href="#how" onClick={v.goHow}>
              How it works
            </SkLink>
            {" "}
            <SkLink href="#games" onClick={v.goGames}>
              Games
            </SkLink>
            {" "}
            <SkLink href="/safety">
              Safety
            </SkLink>
            {" "}
            <SkLink href="/about">
              About
            </SkLink>
            {" "}
          </div>
          {" "}
          <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: "8px" }}>
            {" "}
            <button className="mode-btn tap" onClick={v.toggleMode} aria-label={`Switch to ${v.nextMode} mode`}>
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
              <span>
                {v.modeWord}
              </span>
              {" "}
            </button>
            {" "}
            <SkLink href="/login" className="nav-signin wide-only">
              Sign in
            </SkLink>
            {" "}
            <SkLink href="/signup" className="btn btn-cta">
              Get your link
            </SkLink>
            {" "}
            <button className="icon-btn pub-menu tap" onClick={v.toggleDrawer} aria-label="Open menu" aria-expanded={v.drawerOpen}>
              {" "}
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden="true">
                <path d="M4 7h16M4 12h16M4 17h16" />
              </svg>
              {" "}
            </button>
            {" "}
          </div>
          {" "}
        </nav>
        {" "}
        <div className={`pdr ${v.drawerCls}`}>
          {" "}
          <div className="pdr-scrim" onClick={v.toggleDrawer} />
          {" "}
          <aside className="pdr-panel" role="dialog" aria-label="Menu" aria-hidden={v.drawerHidden}>
            {" "}
            <div className="pdr-head">
              {" "}
              <SkLink href="/" className="logo" aria-label="Sekretly home">
                <span className="logo-mark">
                  S
                </span>
                <span className="logo-word">
                  Sekretly
                </span>
              </SkLink>
              {" "}
              <button className="icon-btn tap" onClick={v.toggleDrawer} aria-label="Close menu">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" aria-hidden="true">
                  <path d="M6 6l12 12M18 6 6 18" />
                </svg>
              </button>
              {" "}
            </div>
            {" "}
            <nav aria-label="Site" style={{ display: "flex", flexDirection: "column", gap: "3px" }}>
              {" "}
              <SkLink href="/" className="nav-i" aria-current="page" onClick={v.toggleDrawer}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M3 11 12 3l9 8" />
                  <path d="M5 10v10h14V10" />
                </svg>
                Home
              </SkLink>
              {" "}
              <SkLink href="#how" className="nav-i" onClick={v.goHow}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z" />
                </svg>
                How it works
              </SkLink>
              {" "}
              <SkLink href="#games" className="nav-i" onClick={v.goGames}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <rect x="2" y="7" width="20" height="11" rx="5" />
                  <path d="M7 11v3M5.5 12.5h3" />
                </svg>
                Games
              </SkLink>
              {" "}
              <SkLink href="/safety" className="nav-i" onClick={v.toggleDrawer}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M12 3 4 6v6c0 5 3.4 8.3 8 9 4.6-.7 8-4 8-9V6z" />
                </svg>
                Safety
              </SkLink>
              {" "}
              <SkLink href="/about" className="nav-i" onClick={v.toggleDrawer}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <circle cx="12" cy="12" r="9" />
                  <path d="M12 11v5M12 8h.01" />
                </svg>
                About
              </SkLink>
              {" "}
              <SkLink href="/help" className="nav-i" onClick={v.toggleDrawer}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <circle cx="12" cy="12" r="9" />
                  <path d="M9.5 9a2.5 2.5 0 1 1 3.5 2.3c-.7.3-1 .9-1 1.7M12 17h.01" />
                </svg>
                Help & FAQ
              </SkLink>
              {" "}
              <SkLink href="/contact" className="nav-i" onClick={v.toggleDrawer}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <rect x="3" y="5" width="18" height="14" rx="2" />
                  <path d="m3 7 9 6 9-6" />
                </svg>
                Contact
              </SkLink>
              {" "}
            </nav>
            {" "}
            <div className="pdr-foot">
              {" "}
              <button className="mode-btn tap" onClick={v.toggleMode} style={{ justifyContent: "center" }}>
                {"Switch to "}{v.modeWord}{" mode"}
              </button>
              {" "}
              <SkLink href="/login" className="btn btn-block tap">
                Sign in
              </SkLink>
              {" "}
              <SkLink href="/signup" className="btn btn-cta btn-block tap">
                Get your link
              </SkLink>
              {" "}
            </div>
            {" "}
          </aside>
          {" "}
        </div>
        {" "}
        <header className="lh" id="top" onMouseMove={v.tilt} onMouseLeave={v.untilt} onTouchMove={v.tilt} onTouchEnd={v.untilt}>
          {" "}
          <div className="lh-bg" aria-hidden="true">
            {" "}
            <div className="lh-glow lh-glow--pink" />
            {" "}
            <div className="lh-glow lh-glow--purple" />
            {" "}
            <div className="lh-grid" />
            {" "}
            <div className="lh-vig" />
            {" "}
          </div>
          {" "}
          <div className="lh-bg-light" aria-hidden="true" />
          {" "}
          <div className="lh-torch" aria-hidden="true" />
          {" "}
          <div className="lh-copy">
            {" "}
            <div className="lh-eyebrow">
              {" "}
              <span className="lh-dot" />
              <span>
                ANONYMOUS
              </span>
              <i>
                •
              </i>
              <span>
                REAL
              </span>
              <i>
                •
              </i>
              <span>
                NO JUDGMENT
              </span>
              {" "}
            </div>
            {" "}
            <h1 className="lh-title">
              {" "}
              <span className="lh-white">
                Say It.
              </span>
              {" "}
              <span className="lh-pink">
                Stay
                <span className="lh-scribble" aria-hidden="true" />
              </span>
              {" "}
              <span className="lh-white">
                Unknown.
              </span>
              {" "}
            </h1>
            {" "}
            <p className="lh-desc">
              Share honest thoughts, get real answers, explore what people actually think — all anonymously.
            </p>
            {" "}
            <div className="lh-actions">
              {" "}
              <SkLink href="/signup" className="lh-primary mag">
                {" "}
                <span>
                  Create Your Link
                </span>
                {" "}
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M7 17 17 7M9 7h8v8" />
                </svg>
                {" "}
                <span className="lh-shine" aria-hidden="true" />
                {" "}
              </SkLink>
              {" "}
              <SkLink href="#how" onClick={v.goHow} className="lh-secondary mag">
                {" "}
                <span>
                  See How It Works
                </span>
                {" "}
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="m9 18 6-6-6-6" />
                </svg>
                {" "}
              </SkLink>
              {" "}
            </div>
            {" "}
            <div className="lh-proof">
              {" "}
              <div className="lh-avatars" aria-hidden="true">
                <span>
                  J
                </span>
                <span>
                  M
                </span>
                <span>
                  A
                </span>
                <span>
                  +
                </span>
              </div>
              {" "}
              <div className="lh-proof-copy">
                {" "}
                <strong>
                  Built for real reactions.
                </strong>
                {" "}
                <small>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M20 6 9 17l-5-5" />
                  </svg>
                  No account needed to answer
                </small>
                {" "}
              </div>
              {" "}
            </div>
            {" "}
          </div>
          {" "}
          <div className="lh-art">
            {" "}
            <div className="lh-halo" aria-hidden="true" />
            {" "}
            <div className="lh-canvas">
              {" "}
              <div className="lh-tilt">
                {" "}
                <div className="lh-layer lh-layer--dark">
                  {" "}
                  <div className="lh-float">
                    {" "}
                    <img className="lh-img lh-img--dark" src="/sk/hero-dark.png" alt="Sekretly anonymous character holding the interaction phone" />
                    {" "}
                    <img className="lh-img lh-ghost lh-ghost--a" src="/sk/hero-dark.png" alt="" aria-hidden="true" />
                    {" "}
                    <img className="lh-img lh-ghost lh-ghost--b" src="/sk/hero-dark.png" alt="" aria-hidden="true" />
                    {" "}
                  </div>
                  {" "}
                </div>
                {" "}
                <div className="lh-layer lh-layer--light">
                  {" "}
                  <div className="lh-float">
                    {" "}
                    <img className="lh-img lh-img--light" src="/sk/hero-light.png" alt="Sekretly hoodie mascot winking, finger to lips, reaching out beside a phone showing Chat. Play. Keep it Secret." />
                    {" "}
                  </div>
                  {" "}
                  <span className="lh-spark" aria-hidden="true" />
                  <span className="lh-spark" aria-hidden="true" />
                  <span className="lh-spark" aria-hidden="true" />
                  <span className="lh-spark" aria-hidden="true" />
                  <span className="lh-spark" aria-hidden="true" />
                  {" "}
                </div>
                {" "}
                <div className="lh-drift" aria-hidden="true">
                  {" "}
                  <span className="lh-msg" style={{ "--x": "4%", "--y": "46%", "--dl": "0s" }}>
                    <i>
                      👀
                    </i>
                    who is this??
                  </span>
                  {" "}
                  <span className="lh-msg" style={{ "--x": "52%", "--y": "14%", "--dl": "2.5s" }}>
                    <i>
                      🔥
                    </i>
                    <b>
                      10/10
                    </b>
                     no notes
                  </span>
                  {" "}
                  <span className="lh-msg" style={{ "--x": "10%", "--y": "70%", "--dl": "5s" }}>
                    <i>
                      🤫
                    </i>
                    I still have your hoodie
                  </span>
                  {" "}
                  <span className="lh-msg" style={{ "--x": "46%", "--y": "62%", "--dl": "7.5s" }}>
                    <i>
                      👑
                    </i>
                    scored 
                    <b>
                      5/5
                    </b>
                     on your quiz
                  </span>
                  {" "}
                  <span className="lh-msg" style={{ "--x": "18%", "--y": "24%", "--dl": "10s" }}>
                    <i>
                      💌
                    </i>
                    funny · loyal · chaotic
                  </span>
                  {" "}
                </div>
                {" "}
                <span className="lh-portal" aria-hidden="true" />
                {" "}
              </div>
              {" "}
            </div>
            {" "}
            <div className="lh-status">
              <span />
              {"LIVE "}
              <b>
                ANONYMOUS
              </b>
            </div>
            {" "}
            <div className="lh-note">
              {" "}
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z" />
              </svg>
              {" no filters. just truth. "}
            </div>
            {" "}
          </div>
          {" "}
          <SkLink href="#try" className="lh-scroll">
            <span>
              keep scrolling
            </span>
            {" "}
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M7 7l10 10M17 9v8H9" />
            </svg>
            {" "}
          </SkLink>
          {" "}
        </header>
        {" "}
        <section className="pub-wrap" style={{ paddingTop: "36px" }} aria-label="What makes Sekretly different">
          {" "}
          <div className="ln-swipe-hint" aria-hidden="true">
            {"Swipe "}
            <span>
              →
            </span>
          </div>
          {" "}
          <div className="rv-stag ln-feats" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(230px, 1fr))", gap: "12px" }}>
            {" "}
            {(v.features || []).map((f, i0) => (
              <Fragment key={i0}>
              {" "}
              <article className="card lift spot" style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "10px" }}>
                {" "}
                <span className="ln-feat-n" aria-hidden="true">
                  {f.n}
                </span>
                {" "}
                <img src={f.icon} alt="" style={{ width: "48px", height: "48px" }} />
                {" "}
                <h3 style={{ fontSize: "20px" }}>
                  {f.title}
                </h3>
                {" "}
                <p className="muted" style={{ fontSize: "15px", lineHeight: "1.5" }}>
                  {f.body}
                </p>
                {" "}
              </article>
              {" "}
              </Fragment>
            ))}
            {" "}
          </div>
          {" "}
        </section>
        {" "}
        <section id="try" className="ln-sec">
          {" "}
          <div className="pub-wrap" style={{ display: "flex", flexWrap: "wrap", gap: "40px 56px", alignItems: "center" }}>
            {" "}
            <div style={{ flex: "1 1 380px", minWidth: "0" }}>
              {" "}
              <p className="ln-eyebrow rv">
                Feel it first
              </p>
              {" "}
              <h2 className="ln-h2 rv" style={{ marginTop: "12px" }}>
                Try it.
                <br />
                <em>
                  No one’s watching.
                </em>
              </h2>
              {" "}
              <p className="muted rv" style={{ marginTop: "16px", fontSize: "17px", lineHeight: "1.55", maxWidth: "38ch" }}>
                Pick a topic and a theme, then have a go. Every topic plays differently, and this is exactly what your friends see when they open your link.
              </p>
              {" "}
              <div style={{ marginTop: "22px" }}>
                {" "}
                <div style={{ fontSize: "13px", fontWeight: "800", letterSpacing: ".08em", textTransform: "uppercase" }} className="muted">
                  Topic
                </div>
                {" "}
                <div className="rail" style={{ display: "flex", gap: "8px", marginTop: "8px", paddingBottom: "4px" }}>
                  {" "}
                  {(v.topics || []).map((t, i0) => (
                    <Fragment key={i0}>
                    {" "}
                    <button className={`chip tap ${t.cls}`} onClick={t.pick} aria-pressed={t.on}>
                      {t.label}
                    </button>
                    {" "}
                    </Fragment>
                  ))}
                  {" "}
                </div>
                {" "}
                <div style={{ fontSize: "13px", fontWeight: "800", letterSpacing: ".08em", textTransform: "uppercase", marginTop: "16px" }} className="muted">
                  Theme
                </div>
                {" "}
                <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginTop: "8px" }}>
                  {" "}
                  {(v.themes || []).map((t, i0) => (
                    <Fragment key={i0}>
                    {" "}
                    <button className="tap" onClick={t.pick} aria-pressed={t.on} aria-label={`${t.name} theme`} style={{ display: "inline-flex", alignItems: "center", gap: "8px", minHeight: "44px", padding: "0 14px 0 6px", borderRadius: "99px", border: `2px solid ${t.ring}`, background: "var(--card)", color: "var(--ink)", fontWeight: "700", fontSize: "14px" }}>
                      {" "}
                      <span className={t.cls} style={{ width: "30px", height: "30px", borderRadius: "50%" }} />
                      {t.name}{" "}
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
            <div style={{ flex: "1 1 380px", minWidth: "0", display: "flex", justifyContent: "center" }}>
              {" "}
              <div className="tilt3d" style={{ width: "100%", maxWidth: "400px", borderRadius: "36px", overflow: "hidden", boxShadow: "var(--shadow)", transition: "transform .5s cubic-bezier(.16,1,.3,1)" }}>
                {" "}
                <Main theme={v.demoTh} topic={v.demoTopic} embed="yes" />
                {" "}
              </div>
              {" "}
            </div>
            {" "}
          </div>
          {" "}
        </section>
        {" "}
        <section id="how" className="ln-sec" style={{ background: "var(--bg2)", borderTop: "1px solid var(--line)", borderBottom: "1px solid var(--line)" }}>
          {" "}
          <div className="pub-wrap">
            {" "}
            <p className="ln-eyebrow rv">
              How it spreads
            </p>
            {" "}
            <h2 className="ln-h2 rv" style={{ marginTop: "12px" }}>
              Make a link.
              <br />
              <em>
                Drop it. Watch.
              </em>
            </h2>
            {" "}
            <ol className="rv-stag ln-steps" style={{ listStyle: "none", padding: "0", margin: "36px 0 0", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "14px" }}>
              {" "}
              {(v.steps || []).map((st, i0) => (
                <Fragment key={i0}>
                {" "}
                <li className="card lift spot" style={{ padding: "22px", position: "relative" }}>
                  {" "}
                  <span className="d step-n" style={{ fontSize: "48px", fontWeight: "800", color: "var(--pink)", lineHeight: "1" }}>
                    {st.n}
                  </span>
                  {" "}
                  <h3 style={{ marginTop: "12px", fontSize: "22px" }}>
                    {st.title}
                  </h3>
                  {" "}
                  <p className="muted" style={{ marginTop: "6px", fontSize: "15px", lineHeight: "1.5" }}>
                    {st.body}
                  </p>
                  {" "}
                </li>
                {" "}
                </Fragment>
              ))}
              {" "}
            </ol>
            {" "}
          </div>
          {" "}
        </section>
        {" "}
        <section className="ln-sec">
          {" "}
          <div className="pub-wrap" style={{ display: "flex", flexWrap: "wrap", gap: "40px 56px", alignItems: "center" }}>
            {" "}
            <div style={{ flex: "1 1 380px", minWidth: "0" }}>
              {" "}
              <p className="ln-eyebrow rv">
                Here today, gone tomorrow
              </p>
              {" "}
              <h2 className="ln-h2 rv" style={{ marginTop: "12px" }}>
                Messages that
                <br />
                <em>
                  disappear.
                </em>
              </h2>
              {" "}
              <p className="muted rv" style={{ marginTop: "16px", fontSize: "17px", lineHeight: "1.55", maxWidth: "40ch" }}>
                You choose how long things last, from 1 day to 3 weeks. Reply to friends with an account in a two-way chat, and you both stay anonymous forever.
              </p>
              {" "}
              <div className="rv-stag" style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginTop: "18px" }}>
                {" "}
                <span className="pill">
                  1 day
                </span>
                <span className="pill">
                  3 days
                </span>
                <span className="pill">
                  1 week
                </span>
                <span className="pill">
                  3 weeks
                </span>
                {" "}
              </div>
              {" "}
            </div>
            {" "}
            <div className="rv-stag" style={{ flex: "1 1 380px", minWidth: "0", display: "flex", flexDirection: "column", gap: "10px", maxWidth: "460px" }}>
              {" "}
              {(v.fading || []).map((fm, i0) => (
                <Fragment key={i0}>
                {" "}
                <div className="card peek" title="Peek before it fades" style={{ display: "flex", alignItems: "center", gap: "12px", padding: "14px", opacity: fm.op, filter: `blur(${fm.blur})` }}>
                  {" "}
                  <span className={`av ${fm.th}`}>
                    <img src={fm.icon} alt="" />
                  </span>
                  {" "}
                  <span style={{ flex: "1", minWidth: "0", fontWeight: "700", fontSize: "15px" }}>
                    {fm.text}
                  </span>
                  {" "}
                  <span className="muted" style={{ fontSize: "12.5px", flex: "none" }}>
                    {fm.left}
                  </span>
                  {" "}
                </div>
                {" "}
                </Fragment>
              ))}
              {" "}
            </div>
            {" "}
          </div>
          {" "}
        </section>
        {" "}
        <section id="games" className="ln-sec" style={{ background: "var(--bg2)", borderTop: "1px solid var(--line)", borderBottom: "1px solid var(--line)" }}>
          {" "}
          <div className="pub-wrap">
            {" "}
            <p className="ln-eyebrow rv">
              Game night
            </p>
            {" "}
            <h2 className="ln-h2 rv" style={{ marginTop: "12px" }}>
              Party games.
              <br />
              <em>
                Zero names.
              </em>
            </h2>
            {" "}
            <p className="muted rv" style={{ marginTop: "16px", fontSize: "17px", lineHeight: "1.55", maxWidth: "46ch" }}>
              Everyone gets a random nickname like MangoMoon or BlueFox. Play with your class, your hostel, your group chat. Nobody knows who said what.
            </p>
            {" "}
            <div className="rv-stag ln-games" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(170px, 1fr))", gap: "12px", marginTop: "30px" }}>
              {" "}
              {(v.games || []).map((g, i0) => (
                <Fragment key={i0}>
                {" "}
                <div className="card lift spot tilt3d" style={{ padding: "18px", display: "flex", flexDirection: "column", gap: "10px", position: "relative", minHeight: "170px" }}>
                  {" "}
                  <span className="pill" style={{ position: "absolute", top: "14px", right: "14px", background: g.tagBg, color: g.tagInk }}>
                    {g.tag}
                  </span>
                  {" "}
                  <img src={g.icon} alt="" style={{ width: "46px", height: "46px" }} />
                  {" "}
                  <h3 style={{ fontSize: "19px", lineHeight: "1.05" }}>
                    {g.name}
                  </h3>
                  {" "}
                  <p className="muted" style={{ fontSize: "13.5px", marginTop: "auto" }}>
                    {g.meta}
                  </p>
                  {" "}
                </div>
                {" "}
                </Fragment>
              ))}
              {" "}
            </div>
            {" "}
          </div>
          {" "}
        </section>
        {" "}
        <section className="ln-sec">
          {" "}
          <div className="pub-wrap" style={{ display: "flex", flexWrap: "wrap", gap: "32px 56px", alignItems: "center" }}>
            {" "}
            <div style={{ flex: "1 1 420px", minWidth: "0" }}>
              {" "}
              <p className="ln-eyebrow rv">
                The quiet promise
              </p>
              {" "}
              <h2 className="ln-h2 rv" style={{ marginTop: "12px" }}>
                Unknown doesn’t mean
                <br />
                <em>
                  uncontrolled.
                </em>
              </h2>
              {" "}
              <p className="muted rv" style={{ marginTop: "16px", fontSize: "17px", lineHeight: "1.55", maxWidth: "40ch" }}>
                Say what you want. Whoever receives it is in control: one tap reports it, the sender gets a warning, and after three warnings the next report blocks them from you for good. Changed your mind? Undo it.
              </p>
              {" "}
              <SkLink href="/safety" className="btn rv" style={{ marginTop: "20px" }}>
                Read our safety rules
              </SkLink>
              {" "}
            </div>
            {" "}
            <div className="rv-stag" style={{ flex: "1 1 380px", minWidth: "0", display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: "10px" }}>
              {" "}
              {(v.safety || []).map((sf, i0) => (
                <Fragment key={i0}>
                {" "}
                <div className="card lift spot" style={{ padding: "14px", fontWeight: "700", fontSize: "14.5px", display: "flex", gap: "10px", alignItems: "center" }}>
                  {" "}
                  <span className="dot-pulse" style={{ width: "10px", height: "10px", borderRadius: "50%", background: "var(--pink)", flex: "none" }} />
                  {sf}{" "}
                </div>
                {" "}
                </Fragment>
              ))}
              {" "}
            </div>
            {" "}
          </div>
          {" "}
        </section>
        {" "}
        <section style={{ background: "radial-gradient(80% 120% at 50% 0%,#5a1240 0%,#1b0b26 60%,#0c0811 100%)", color: "#ffffff", textAlign: "center", padding: "96px 20px" }}>
          {" "}
          <img className="float" src="/sk/shushing_face.png" alt="" style={{ width: "84px", height: "84px" }} />
          {" "}
          <h2 className="rv" style={{ marginTop: "14px", fontSize: "clamp(42px, 7cqi, 84px)", lineHeight: ".95", fontWeight: "800" }}>
            So… what do they
            <br />
            <span className="shimmer">
              really think?
            </span>
          </h2>
          {" "}
          <div className="rv-stag" style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "10px", marginTop: "28px" }}>
            {" "}
            <SkLink href="/signup" className="btn btn-lg tap" style={{ background: "#ffffff", color: "#211a2c", border: "0", padding: "0 28px" }}>
              Create your link
            </SkLink>
            {" "}
            <SkLink href="/peach/k7x2m9/sunset/describe-3" className="btn btn-lg tap" style={{ background: "transparent", color: "#ffffff", borderColor: "rgba(255,255,255,.3)", padding: "0 24px" }}>
              See a live link
            </SkLink>
            {" "}
          </div>
          {" "}
        </section>
        {" "}
        <footer className="ft">
          {" "}
          <div className="ft-in">
            {" "}
            <div className="ft-top">
              {" "}
              <div className="ft-brand">
                {" "}
                <SkLink href="/" className="logo" aria-label="Sekretly home">
                  <span className="logo-mark">
                    S
                  </span>
                  <span className="logo-word" style={{ color: "var(--ink)" }}>
                    Sekretly
                  </span>
                </SkLink>
                {" "}
                <p>
                  Built for the things you almost said. Anonymous messages and party games, made in Nigeria.
                </p>
                {" "}
                <SkLink href="/signup" className="btn btn-cta btn-sm tap">
                  Get your link
                </SkLink>
                {" "}
              </div>
              {" "}
              <div className="ft-cols">
                {" "}
                <div className="ft-col">
                  <b>
                    Product
                  </b>
                  <SkLink href="/signup">
                    Create a link
                  </SkLink>
                  <SkLink href="#games" onClick={v.goGames}>
                    Games
                  </SkLink>
                  <SkLink href="#how" onClick={v.goHow}>
                    How it works
                  </SkLink>
                </div>
                {" "}
                <div className="ft-col">
                  <b>
                    Company
                  </b>
                  <SkLink href="/about">
                    About
                  </SkLink>
                  <SkLink href="/contact">
                    Contact
                  </SkLink>
                  <SkLink href="/help">
                    Help & FAQ
                  </SkLink>
                </div>
                {" "}
                <div className="ft-col">
                  <b>
                    Safety
                  </b>
                  <SkLink href="/safety">
                    Safety center
                  </SkLink>
                  <SkLink href="/safety">
                    Community rules
                  </SkLink>
                  <SkLink href="/safety">
                    Report a problem
                  </SkLink>
                </div>
                {" "}
                <div className="ft-col">
                  <b>
                    Legal
                  </b>
                  <SkLink href="/legal">
                    Privacy policy
                  </SkLink>
                  <SkLink href="/legal">
                    Terms of use
                  </SkLink>
                  <SkLink href="/legal">
                    Cookies & ads
                  </SkLink>
                  <button onClick={v.openConsent} style={{ all: "unset", cursor: "pointer" }}>
                    Cookie choices
                  </button>
                </div>
                {" "}
              </div>
              {" "}
            </div>
            {" "}
            <div className="ft-bottom">
              {" "}
              <span>
                © 2026 Sekretly · 16+ only
              </span>
              {" "}
              <span>
                Say it. Stay unknown.
              </span>
              {" "}
            </div>
            {" "}
          </div>
          {" "}
        </footer>
        {" "}
        {v.dockOn ? (
          <>
          {" "}
          <div className="ln-dock" aria-label="Get started">
            {" "}
            <span className="ln-dock-ghost" aria-hidden="true">
              <img src="/sk/shushing_face.png" alt="" />
            </span>
            {" "}
            <span style={{ flex: "1", minWidth: "0", lineHeight: "1.2" }}>
              <b style={{ display: "block", fontSize: "14px" }}>
                Your link in 30 seconds
              </b>
              <span style={{ fontSize: "12px", opacity: ".75" }}>
                Free · no real name needed
              </span>
            </span>
            {" "}
            <SkLink href="/signup" className="ln-dock-btn tap">
              Get my link
            </SkLink>
            {" "}
          </div>
          {" "}
          </>
        ) : null}
        {" "}
        {v.consentOpen ? (
          <>
          {" "}
          <div className="ck" role="dialog" aria-label="Cookie choices">
            {" "}
            <div className="row" style={{ gap: "12px", alignItems: "flex-start" }}>
              {" "}
              <img src="/sk/sparkles.png" alt="" style={{ width: "34px", height: "34px", flex: "none" }} />
              {" "}
              <div style={{ flex: "1", minWidth: "0" }}>
                {" "}
                <b style={{ fontSize: "15px" }}>
                  Cookies, quickly
                </b>
                {" "}
                <p className="muted" style={{ margin: "4px 0 0", fontSize: "13.5px", lineHeight: "1.45" }}>
                  {"We use essential cookies to keep you logged in, and ad cookies (Google) to keep Sekretly free. Your messages are never used for ads. "}
                  <SkLink href="/legal" className="pink" style={{ fontWeight: "700" }}>
                    Details
                  </SkLink>
                </p>
                {" "}
                {v.ckMore ? (
                  <>
                  {" "}
                  <div style={{ marginTop: "10px", display: "flex", flexDirection: "column", gap: "8px" }}>
                    {" "}
                    <div className="row" style={{ justifyContent: "space-between", fontSize: "14px" }}>
                      <span>
                        <b>
                          Essential
                        </b>
                        {" "}
                        <span className="muted">
                          · always on
                        </span>
                      </span>
                      <button className="switch" role="switch" aria-checked="true" aria-label="Essential cookies" disabled={!!(true)} />
                    </div>
                    {" "}
                    <div className="row" style={{ justifyContent: "space-between", fontSize: "14px" }}>
                      <span>
                        <b>
                          Personalised ads
                        </b>
                        {" "}
                        <span className="muted">
                          · off shows general ads
                        </span>
                      </span>
                      <button className="switch" role="switch" aria-checked={v.ckAdsStr} aria-label="Personalised ads" onClick={v.toggleCkAds} />
                    </div>
                    {" "}
                    <div className="row" style={{ justifyContent: "space-between", fontSize: "14px" }}>
                      <span>
                        <b>
                          Stats
                        </b>
                        {" "}
                        <span className="muted">
                          · counts, no names
                        </span>
                      </span>
                      <button className="switch" role="switch" aria-checked={v.ckStatsStr} aria-label="Stats cookies" onClick={v.toggleCkStats} />
                    </div>
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
            <div style={{ display: "flex", gap: "8px", marginTop: "12px", flexWrap: "wrap" }}>
              {" "}
              <button className="btn btn-cta tap" onClick={v.ckAccept} style={{ flex: "1 1 140px" }}>
                Accept all
              </button>
              {" "}
              <button className="btn tap" onClick={v.ckSave} style={{ flex: "1 1 140px" }}>
                {v.ckSaveLabel}
              </button>
              {" "}
              <button className="btn btn-ghost tap" onClick={v.ckToggleMore} style={{ flex: "1 1 100%", border: "0", minHeight: "36px" }}>
                {v.ckMoreLabel}
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
