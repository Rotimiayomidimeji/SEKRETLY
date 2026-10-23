// @ts-nocheck -- ported 1:1 from design/mockup/ShareStudio.dc.html by scripts/port-mockup.mjs; typed as it gets wired to real data
"use client";

import React, { Fragment } from "react";
import { saveMode, SkLink } from "@/lib/sk/runtime";


export default class ShareStudio extends React.Component<Record<string, any>, any> {
  static defaultProps = {"mode":"dark"};

  constructor(props) {
    super(props);
    var m = null; // light/dark arrives as props.mode from the sk-mode cookie
    this.extra = {};
    this.state = { mode: m || props.mode || 'dark', tray: [], off: {}, theme: {}, paint: false, focus: 0, dest: 'wa', posting: null, posted: {}, sent: null, done: false, friends: false, sentTo: {}, files: null, needTap: false };
  }
  // the inbox hands over the message(s) in sk-share and stamps sk-nav
  arrive(mode) {
    var ids = null;
    try { ids = JSON.parse(window.localStorage.getItem('sk-share') || 'null'); this.nav = window.localStorage.getItem('sk-nav') || ''; } catch (e) { this.nav = ''; }
    this.extra = {};
    var base = this.msgs(), extra = {};
    (ids || []).forEach(function (x) { if (x && typeof x === 'object') extra[x.id] = { topic: x.topic, th: x.th, text: x.text, own: !!x.own, icon: x.own ? '/sk/locked_3d.png' : (x.icon || (base[x.id] && base[x.id].icon) || '/sk/ghost.png') }; });
    this.extra = extra;
    var all = this.msgs();
    var picked = (ids || []).map(function (x) { return x && typeof x === 'object' ? x.id : x; }).filter(function (id) { return !!all[id]; });
    return { mode: mode, tray: picked.length ? picked : Object.keys(all).filter(function (id) { return !all[id].promo; }).slice(0, 3), off: {}, theme: {}, paint: false, focus: 0, dest: 'wa', posting: null, posted: {}, sent: null, done: false, friends: false, sentTo: {} };
  }
  msgs() {
    return Object.assign({}, this.props.pool || {}, this.props.promos || {}, {
    }, this.extra || {});
  }
  componentDidMount() {
    var self = this;
    this.onStore = function (e) { if (e.key === 'sk-mode' && e.newValue) self.setState({ mode: e.newValue }); };
    try { window.addEventListener('storage', this.onStore); } catch (e) {}
    this.setState(this.arrive(this.state.mode));
    // load the image maker now so posting starts straight away
    import('html-to-image').catch(function () {});
  }
  componentWillUnmount() { try { window.removeEventListener('storage', this.onStore); } catch (e) {} clearInterval(this.tk); clearInterval(this.nt); clearTimeout(this.dt); }
  componentDidUpdate(prev) { if (prev.mode !== this.props.mode && this.props.mode) this.setState({ mode: this.props.mode }); }
  // long text fills each card top to bottom (about 390 characters) and carries on in the next one.
  // The inbox pages through the same cards.
  split(t, max) {
    var out = [], rest = (t || '').trim();
    while (rest.length > max) {
      var cut = -1;
      for (var i = max; i >= Math.floor(max * 0.92); i--) { if (/[.!?]/.test(rest.charAt(i - 1)) && rest.charAt(i) === ' ') { cut = i; break; } }
      if (cut < 0) cut = rest.lastIndexOf(' ', max);
      if (cut <= 0) cut = max;
      out.push(rest.slice(0, cut).trim()); rest = rest.slice(cut).trim();
    }
    if (rest) out.push(rest);
    if (out.length > 1 && out[out.length - 1].length < max * 0.3) {
      var both = out.splice(out.length - 2, 2).join(' '), mid = both.indexOf(' ', Math.floor(both.length / 2));
      if (mid < 0) mid = Math.floor(both.length / 2);
      out.push(both.slice(0, mid).trim(), both.slice(mid).trim());
    }
    return out;
  }
  // posting plays out on the stage: each card comes to the middle, lifts, and its circle turns into a green tick
  runPost(keys, dest) {
    var self = this, files = [], k = 0;
    clearInterval(this.tk); clearTimeout(this.dt);
    var next = function () {
      if (!self.state.posting) return;
      if (k >= keys.length) { self.finish(files, dest); return; }
      var key = keys[k], idx = self.keyIndex[key];
      self.setState({ focus: idx === undefined ? self.state.focus : idx });
      self.dt = setTimeout(function () {
        var node = document.querySelector('[data-card="' + key + '"]');
        import('html-to-image').then(function (h) {
          return h.toBlob(node, { canvasWidth: 1080, canvasHeight: 1920, pixelRatio: 1, style: { borderRadius: '0', boxShadow: 'none' }, filter: function (n) { return !(n.classList && n.classList.contains('ss-ctl')); } });
        }).then(function (blob) {
          if (blob) files.push(new File([blob], 'sekretly-' + (k + 1) + '.png', { type: 'image/png' }));
          var s = self.state, posted = Object.assign({}, s.posted); posted[key] = true; k++;
          self.setState({ posted: posted, posting: Object.assign({}, s.posting, { k: k }), sent: key });
          next();
        }).catch(function (e) { console.error('Share studio could not draw a card', e); self.setState({ posting: null, posted: {}, drawErr: true }); });
      }, 450);
    };
    // start once React has applied the posting state (next() checks it to know it wasn't cancelled)
    this.setState({ posting: { dest: dest, keys: keys, k: 0 }, posted: {}, done: false, paint: false, files: null, needTap: false, drawErr: false }, next);
  }
  // hands the images over: the share sheet where the phone has one (WhatsApp Status, Instagram, Snapchat…), else downloads
  finish(files, dest) {
    var self = this;
    var canShare = dest !== 'save' && navigator.canShare && navigator.canShare({ files: files });
    if (!canShare) {
      files.forEach(function (f, i) { setTimeout(function () { var a = document.createElement('a'); a.href = URL.createObjectURL(f); a.download = f.name; document.body.appendChild(a); a.click(); a.remove(); }, i * 400); });
      self.setState({ posting: null, done: true, files: files });
      return;
    }
    self.setState({ posting: null, files: files });
    navigator.share({ files: files, title: 'Sekretly' }).then(function () { self.setState({ done: true }); }).catch(function (e) {
      // the tap that started posting expired while the images were drawn: ask for one more tap
      self.setState({ done: true, needTap: !(e && e.name === 'AbortError') });
    });
  }
  renderVals() {
    var self = this, s = this.state, dark = s.mode !== 'light';
    var M = this.msgs();
    var TH = [['default', 'Default'], ['sunset', 'Sunset'], ['midnight', 'Midnight'], ['bubblegum', 'Bubblegum'], ['neon', 'Neon'], ['ocean', 'Ocean']];
    var flat = [], groups = [], order = 0, pubSel = 0, anySel = 0;
    var ends = function (x) { return /[.!?”"]$/.test(x); };
    s.tray.forEach(function (id) {
      var m = M[id]; if (!m) return;
      var parts = self.split(m.text, 390);
      groups.push({ id: id, icon: m.icon, label: (m.topic.length > 18 ? m.topic.slice(0, 17) + '…' : m.topic) + (parts.length > 1 ? ' · ' + parts.length : ''), thumbs: [] });
      parts.forEach(function (txt, pi) {
        var key = id + ':' + pi, on = !s.off[key];
        if (on) { order++; anySel++; if (!m.own) pubSel++; }
        var text = (pi > 0 && !ends(parts[pi - 1]) ? '…' : '') + txt + (pi < parts.length - 1 && !ends(txt) ? '…' : '');
        var len = text.length;
        flat.push({ key: key, id: id, m: m, pi: pi, parts: parts, on: on, num: on ? order : null, th: s.theme[key] || m.th, text: text,
          size: parts.length > 1 || len > 150 ? 'ss-t-s' : len <= 42 ? 'ss-t-xl' : len <= 90 ? 'ss-t-l' : 'ss-t-m', top: parts.length > 1 || len > 150 });
      });
    });
    var total = flat.length, focus = Math.max(0, Math.min(s.focus, total - 1)), fc = flat[focus] || null;
    this.keyIndex = {}; flat.forEach(function (c, i) { self.keyIndex[c.key] = i; });
    var go = function (i) { self.setState({ focus: Math.max(0, Math.min(total - 1, i)) }); };
    var nth = function (n) { return ['first', 'second', 'third', 'fourth', 'fifth', 'sixth', 'seventh', 'eighth', 'ninth', 'tenth'][n - 1] || ('number ' + n); };
    var cards = flat.map(function (c, i) {
      var d = i - focus, ad = Math.abs(d), posted = !!s.posted[c.key];
      return {
        key: c.key, d: d, s: d === 0 ? 1 : 0.84, z: 20 - ad, op: ad > 2 ? 0 : ad === 2 ? 0.5 : 1, hidden: d === 0 ? 'false' : 'true',
        slotCls: (d === 0 ? 'is-focus' : '') + (ad > 2 ? ' is-far' : '') + (c.on ? '' : ' ss-off') + (s.sent === c.key && posted ? ' ss-sent' : ''),
        focusMe: function () { if (self.swiped) { self.swiped = false; return; } if (d !== 0) go(i); },
        th: 'th-' + c.th, icon: c.m.icon, topic: c.m.topic, text: c.text, size: c.size, faceCls: c.top ? 'ss-top' : '',
        own: !!c.m.own, isPublic: !c.m.own, selStr: c.on ? 'true' : 'false',
        circleCls: posted ? 'posted' : c.m.own ? 'lock' : (c.on ? 'on' : ''), showTick: posted || (c.on && !c.m.own),
        circleAria: posted ? 'Posted' : c.on ? 'Included, tap to skip this card' : 'Skipped, tap to include this card',
        toggle: function (e) { if (e && e.stopPropagation) e.stopPropagation(); if (s.posting) return; var o = Object.assign({}, s.off); o[c.key] = c.on; self.setState({ off: o, focus: i }); },
        num: c.on ? c.num : '–', numWord: c.on ? nth(c.num) : 'never, skipped',
        paint: function (e) { if (e && e.stopPropagation) e.stopPropagation(); self.setState({ focus: i, paint: !(s.paint && i === focus) }); },
        paintStr: s.paint && i === focus ? 'true' : 'false',
        multi: c.parts.length > 1, partNo: (c.pi + 1) + '/' + c.parts.length, more: c.pi < c.parts.length - 1 ? 'next →' : '',
        dots: c.parts.map(function (x, k) { return k === c.pi ? 'on' : ''; })
      };
    });
    flat.forEach(function (c, i) {
      var g = groups.filter(function (x) { return x.id === c.id; })[0];
      g.thumbs.push({ num: c.on ? c.num : '–', cls: 'th-' + c.th + (i === focus ? ' focus' : '') + (c.on ? '' : ' off'), posted: !!s.posted[c.key],
        aria: (c.on ? 'Card ' + c.num : 'Skipped card') + ', ' + c.m.topic, go: function () { go(i); } });
    });
    var DEST = [['wa', 'WhatsApp', 'WhatsApp Status', '#25d366', '#0b2a1c', 'W'], ['ig', 'Instagram', 'your Instagram story', 'linear-gradient(135deg,#7a2ff7,#d81b72 55%,#f29b38)', '#ffffff', 'IG'], ['sc', 'Snapchat', 'your Snapchat story', '#fffc00', '#111111', 'S'], ['save', 'Save', 'your photos', 'var(--card2)', 'var(--ink)', '↓']];
    var dest = DEST.filter(function (x) { return x[0] === s.dest; })[0] || DEST[0];
    var pubKeys = flat.filter(function (c) { return c.on && !c.m.own; }).map(function (c) { return c.key; });
    var allOn = anySel === total && total > 0;
    var pool = Object.keys(M).filter(function (id) { return s.tray.indexOf(id) < 0 && !M[id].promo; });
    var promos = Object.keys(M).filter(function (id) { return !!M[id].promo; });
    var FR = [['Fox', '#ffb35c', 'chatting now'], ['Moon', '#9db8ff', 'active 2h ago'], ['KolaNut', '#ff9ad5', 'from Friday Night Never'], ['PixelOwl', '#7ef0c1', 'from Hostel B confessions']];
    var postedList = flat.filter(function (c) { return !!s.posted[c.key]; });
    var fParts = fc ? fc.parts.length : 0;
    return {
      mode: dark ? 'dark' : 'light', isDark: dark, isLight: !dark, modeWord: dark ? 'Light' : 'Dark',
      toggleMode: function () { var n = dark ? 'light' : 'dark'; saveMode(n); self.setState({ mode: n }); },
      summary: total + ' card' + (total === 1 ? '' : 's') + ' from ' + s.tray.length + ' message' + (s.tray.length === 1 ? '' : 's') + ' · swipe to check each one',
      cards: cards, focusTh: fc ? 'th-' + fc.th : '',
      down: function (e) { self.px = e ? e.clientX : null; self.swiped = false; },
      up: function (e) { if (self.px == null || !e) return; var dx = e.clientX - self.px; self.px = null; if (Math.abs(dx) > 40) { self.swiped = true; go(focus + (dx < 0 ? 1 : -1)); } },
      prev: function () { go(focus - 1); }, next: function () { go(focus + 1); },
      atFirst: focus <= 0, atLast: focus >= total - 1, prevOp: focus <= 0 ? 0.4 : 1, nextOp: focus >= total - 1 ? 0.4 : 1,
      capTitle: !fc ? '' : !fc.on ? 'Skipped' : fc.m.own ? 'Card ' + fc.num + ' · friends only' : 'Card ' + fc.num + ' of ' + anySel,
      capSub: !fc ? '' : (fParts > 1 ? 'Part ' + (fc.pi + 1) + ' of ' + fParts + ' · ' : '') + fc.m.topic + (fc.on ? '' : ' · tap the circle to add it back'),
      isPosting: !!s.posting, progressText: s.posting ? 'Posting ' + Math.max(1, s.posting.k) + ' of ' + s.posting.keys.length + ' to ' + dest[1] + '…' : '',
      paintOpen: !!s.paint && !!fc, paintTitle: fc && fc.on ? 'Colour for card ' + fc.num : 'Colour for this card',
      swatches: TH.map(function (t) { var on = !!fc && fc.th === t[0]; return { cls: 'th-' + t[0], name: t[1], on: on ? 'true' : 'false', ring: on ? 'var(--ink)' : 'transparent', pick: function () { var o = Object.assign({}, s.theme); o[fc.key] = t[0]; self.setState({ theme: o }); } }; }),
      canApplyAll: fParts > 1, applyAllLabel: 'Use on all ' + fParts + ' parts',
      applyAll: function () { var o = Object.assign({}, s.theme); fc.parts.forEach(function (x, k) { o[fc.id + ':' + k] = fc.th; }); self.setState({ theme: o, paint: false }); },
      groups: groups,
      orderHint: anySel + ' of ' + total + ' cards will post, in this order. Tap a number to jump to that card.',
      allStr: allOn ? 'true' : 'false', allCls: allOn ? 'on' : '', allLabel: allOn ? '✓ All selected' : 'Select all',
      toggleAll: function () { var o = {}; if (allOn) flat.forEach(function (c) { o[c.key] = true; }); self.setState({ off: o }); },
      dests: DEST.map(function (x) { var on = s.dest === x[0]; return { name: x[1], bg: x[3], ink: x[4], mark: x[5], on: on ? 'true' : 'false', pick: function () { self.setState({ dest: x[0] }); } }; }),
      cantPost: pubSel === 0 || !!s.posting, postOp: pubSel === 0 || s.posting ? 0.55 : 1,
      postLabel: s.posting ? 'Posting…' : pubSel === 0 ? 'Select a card to post' : s.dest === 'save' ? 'Save ' + pubSel + ' image' + (pubSel === 1 ? '' : 's') + ' in order' : 'Post ' + pubSel + ' card' + (pubSel === 1 ? '' : 's') + ' to ' + dest[2],
      post: function () { if (pubSel && !s.posting) self.runPost(pubKeys, s.dest); },
      doneOpen: s.done, doneTitle: postedList.length + ' card' + (postedList.length === 1 ? '' : 's') + (s.dest === 'save' ? ' saved to ' : ' posted to ') + dest[2],
      steps: postedList.map(function (c) { return { num: c.num, label: (c.parts.length > 1 ? 'Part ' + (c.pi + 1) + ' · ' : '') + c.text }; }),
      needTap: s.needTap, drawErr: !!s.drawErr,
      shareNow: function () { if (s.files) navigator.share({ files: s.files, title: 'Sekretly' }).then(function () { self.setState({ needTap: false }); }).catch(function () {}); },
      brand: this.props.brand || '', ads: this.props.ads === 'on' ? 'on' : 'off',
      again: function () { self.setState({ done: false, posted: {}, sent: null }); },
      noAny: anySel === 0, hasOwn: flat.some(function (c) { return !!c.m.own; }),
      friendsLabel: anySel ? 'Send ' + anySel + ' card' + (anySel === 1 ? '' : 's') + ' to friends in the app' : 'Send in app',
      friends: s.friends, openFriends: function () { self.setState({ friends: true }); }, closeFriends: function () { self.setState({ friends: false }); },
      friendsSub: anySel + ' card' + (anySel === 1 ? '' : 's') + ', in order. Your own messages are fine here: only friends you pick will see them.',
      friendList: FR.map(function (f) { var done = !!s.sentTo[f[0]]; return { name: f[0], initial: f[0].charAt(0), bg: f[1], sub: f[2], label: done ? 'Sent ✓' : 'Send', cls: done ? '' : 'btn-cta', send: function () { var o = Object.assign({}, s.sentTo); o[f[0]] = true; self.setState({ sentTo: o }); } }; }),
      promos: promos.map(function (id) { var m = M[id], inTray = s.tray.indexOf(id) >= 0; return { th: 'th-' + m.th, tag: m.promo, title: m.topic, inTray: inTray, label: inTray ? 'Added ✓' : '+ Add card', add: function () { if (!inTray) self.setState({ tray: s.tray.concat([id]), focus: total }); } }; }),
      poolCount: pool.length,
      pool: pool.map(function (id) { var m = M[id], n = self.split(m.text, 390).length; return { th: 'th-' + m.th, icon: m.icon, meta: m.topic + ' · ' + n + ' card' + (n === 1 ? '' : 's'), text: m.text, own: !!m.own, add: function () { self.setState({ tray: s.tray.concat([id]), focus: total }); } }; })
    };
  }

  render() {
    // like the mockup runtime: the template sees the props merged with renderVals()
    const v = { ...this.props, ...(this.renderVals() || {}) };
    return (
      <>
      {" "}
      <div className="sk" data-mode={v.mode} data-ads={v.ads}>
        {" "}
        <div className="main" style={{ paddingBottom: "40px" }}>
          {" "}
          <div className="wrap" style={{ maxWidth: "980px", padding: "0 16px" }}>
            {" "}
            <header className="topbar">
              {" "}
              <SkLink href="/inbox" className="icon-btn tap" aria-label="Back to inbox">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M15 18 9 12l6-6" />
                </svg>
              </SkLink>
              {" "}
              <div className="grow">
                <h1 style={{ fontSize: "22px" }}>
                  Share studio
                </h1>
                <div className="muted" style={{ fontSize: "13px" }}>
                  {v.summary}
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
            <section className="ss-stage" aria-label="Cards to share" aria-roledescription="carousel" onPointerDown={v.down} onPointerUp={v.up}>
              {" "}
              <div className={`ss-glow ${v.focusTh}`} aria-hidden="true" />
              {" "}
              {v.isPosting ? (
                <>
                <div className="ss-progress" role="status">
                  <i />
                  {v.progressText}
                </div>
                </>
              ) : null}
              {" "}
              {(v.cards || []).map((c, i0) => (
                <Fragment key={i0}>
                {" "}
                <div className={`ss-slot ${c.slotCls}`} style={{ "--d": c.d, "--s": c.s, zIndex: c.z, opacity: c.op }} onClick={c.focusMe} aria-hidden={c.hidden}>
                  {" "}
                  <div className={`ss-card ${c.th}`} data-card={c.key}>
                    {" "}
                    <div className="ss-ctl">
                      {" "}
                      {c.isPublic ? (
                        <>
                        {" "}
                        <button className={`ss-circle ${c.circleCls}`} onClick={c.toggle} role="checkbox" aria-checked={c.selStr} aria-label={c.circleAria}>
                          {" "}
                          {c.showTick ? (
                            <>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                              <path d="M20 6 9 17l-5-5" />
                            </svg>
                            </>
                          ) : null}
                          {" "}
                        </button>
                        {" "}
                        </>
                      ) : null}
                      {" "}
                      {c.own ? (
                        <>
                        {" "}
                        <button className={`ss-circle ${c.circleCls}`} onClick={c.toggle} role="checkbox" aria-checked={c.selStr} aria-label={`Your own message, in-app only. ${c.circleAria}`}>
                          <img src="/sk/locked_3d.png" alt="" style={{ width: "19px", height: "19px" }} />
                        </button>
                        {" "}
                        </>
                      ) : null}
                      {" "}
                      <span className="ss-num" aria-label={`Posts ${c.numWord}`}>
                        {c.num}
                      </span>
                      {" "}
                      <button className="ss-paint tap" onClick={c.paint} aria-label="Change colour of this card" aria-expanded={c.paintStr}>
                        <img src="/sk/artist_palette_3d.png" alt="" />
                      </button>
                      {" "}
                    </div>
                    {" "}
                    <div className={`ss-face ${c.faceCls}`}>
                      {" "}
                      <span className="ss-wm" aria-hidden="true">
                        SEKRETLY
                      </span>
                      {" "}
                      <span className="ss-quote" aria-hidden="true">
                        “
                      </span>
                      {" "}
                      <div className="ss-topic">
                        <img src={c.icon} alt="" />
                        {c.topic}
                      </div>
                      {" "}
                      <p className={`ss-text ${c.size}`}>
                        {c.text}
                      </p>
                      {" "}
                      <div className="ss-foot">
                        {" "}
                        {c.own ? (
                          <>
                          <span className="ss-lock">
                            🔒 In-app only
                          </span>
                          </>
                        ) : null}
                        {" "}
                        {c.multi ? (
                          <>
                          {" "}
                          <div className="ss-pages">
                            {(c.dots || []).map((dt, i2) => (
                              <Fragment key={i2}>
                              <i className={dt} />
                              </Fragment>
                            ))}
                            <span style={{ marginLeft: "4px" }}>
                              {c.partNo}
                            </span>
                            <span style={{ marginLeft: "auto" }}>
                              {c.more}
                            </span>
                          </div>
                          {" "}
                          </>
                        ) : null}
                        {" "}
                        <div className="ss-brand">
                          <b>
                            SEKRETLY
                          </b>
                          <span>
                            {v.brand}
                          </span>
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
                </Fragment>
              ))}
              {" "}
              <button className="ss-arrow ss-arrow--l tap" onClick={v.prev} aria-label="Previous card">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M15 18 9 12l6-6" />
                </svg>
              </button>
              {" "}
              <button className="ss-arrow ss-arrow--r tap" onClick={v.next} aria-label="Next card">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="m9 18 6-6-6-6" />
                </svg>
              </button>
              {" "}
            </section>
            {" "}
            <div className="ss-cap">
              {" "}
              <button className="icon-btn ss-nav tap" onClick={v.prev} disabled={!!(v.atFirst)} aria-label="Previous card" style={{ opacity: v.prevOp }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M15 18 9 12l6-6" />
                </svg>
              </button>
              {" "}
              <div style={{ flex: "1", minWidth: "0", textAlign: "center" }}>
                {" "}
                <b style={{ fontSize: "15px" }}>
                  {v.capTitle}
                </b>
                {" "}
                <div className="muted" style={{ fontSize: "12.5px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                  {v.capSub}
                </div>
                {" "}
              </div>
              {" "}
              <button className="icon-btn ss-nav tap" onClick={v.next} disabled={!!(v.atLast)} aria-label="Next card" style={{ opacity: v.nextOp }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="m9 18 6-6-6-6" />
                </svg>
              </button>
              {" "}
            </div>
            {" "}
            {v.paintOpen ? (
              <>
              {" "}
              <div className="ss-swrow" role="group" aria-label="Card colour">
                {" "}
                <b style={{ fontSize: "13px", width: "100%" }}>
                  {v.paintTitle}
                </b>
                {" "}
                {(v.swatches || []).map((sw, i0) => (
                  <Fragment key={i0}>
                  <button className={`ss-sw tap ${sw.cls}`} onClick={sw.pick} aria-label={sw.name} aria-pressed={sw.on} style={{ borderColor: sw.ring }} />
                  </Fragment>
                ))}
                {" "}
                {v.canApplyAll ? (
                  <>
                  <button className="btn btn-sm tap" onClick={v.applyAll} style={{ marginLeft: "auto" }}>
                    {v.applyAllLabel}
                  </button>
                  </>
                ) : null}
                {" "}
              </div>
              {" "}
              </>
            ) : null}
            {" "}
            <div className="row" style={{ justifyContent: "space-between", marginTop: "18px" }}>
              {" "}
              <b style={{ fontSize: "15px" }}>
                Posting order
              </b>
              {" "}
              <button className={`chip tap ${v.allCls}`} onClick={v.toggleAll} aria-pressed={v.allStr} style={{ minHeight: "36px" }}>
                {v.allLabel}
              </button>
              {" "}
            </div>
            {" "}
            <div className="ss-film" style={{ marginTop: "8px" }} aria-label="All cards in posting order">
              {" "}
              {(v.groups || []).map((g, i0) => (
                <Fragment key={i0}>
                {" "}
                <div className="ss-grp">
                  {" "}
                  <div className="ss-grp-h">
                    <img src={g.icon} alt="" />
                    {g.label}
                  </div>
                  {" "}
                  <div className="ss-thumbs">
                    {" "}
                    {(g.thumbs || []).map((t, i2) => (
                      <Fragment key={i2}>
                      {" "}
                      <button className={`ss-thumb ${t.cls}`} onClick={t.go} aria-label={t.aria}>
                        {t.num}
                        {t.posted ? (
                          <>
                          <span className="ok">
                            ✓
                          </span>
                          </>
                        ) : null}
                      </button>
                      {" "}
                      </Fragment>
                    ))}
                    {" "}
                  </div>
                  {" "}
                </div>
                {" "}
                </Fragment>
              ))}
              {" "}
            </div>
            {" "}
            <p className="muted" style={{ fontSize: "12.5px", marginTop: "2px" }}>
              {v.orderHint}
            </p>
            {" "}
            <b style={{ display: "block", fontSize: "15px", marginTop: "16px" }}>
              Post to
            </b>
            {" "}
            <div className="ss-dest" role="radiogroup" aria-label="Where to post" style={{ marginTop: "8px" }}>
              {" "}
              {(v.dests || []).map((d, i0) => (
                <Fragment key={i0}>
                {" "}
                <button className="ss-d tap" onClick={d.pick} role="radio" aria-checked={d.on} aria-pressed={d.on}>
                  <span style={{ background: d.bg, color: d.ink }}>
                    {d.mark}
                  </span>
                  {d.name}
                </button>
                {" "}
                </Fragment>
              ))}
              {" "}
            </div>
            {" "}
            {v.drawErr ? (
              <>
              <p role="alert" style={{ marginTop: "10px", fontWeight: "800", color: "#ff8b98" }}>
                Couldn’t make the images. Try again.
              </p>
              </>
            ) : null}
            {" "}
            <button className="btn btn-cta btn-lg btn-block tap" onClick={v.post} disabled={!!(v.cantPost)} style={{ marginTop: "12px", opacity: v.postOp }}>
              {v.postLabel}
            </button>
            {" "}
            <button className="btn btn-block tap" onClick={v.openFriends} disabled={!!(v.noAny)} style={{ marginTop: "8px", gap: "8px", display: "none" }}>
              <img src="/sk/busts_in_silhouette_3d.png" alt="" style={{ width: "22px", height: "22px" }} />
              {v.friendsLabel}
            </button>
            {" "}
            {v.hasOwn ? (
              <>
              {" "}
              <p className="muted" style={{ marginTop: "10px", fontSize: "13px", lineHeight: "1.45" }}>
                🔒 cards are your own words, so they never go to public stories.
              </p>
              {" "}
              </>
            ) : null}
            {" "}
            <div className="sec-h">
              <h2>
                Promote your link
              </h2>
              <span className="muted" style={{ fontSize: "13px" }}>
                cards that bring people in
              </span>
            </div>
            {" "}
            <div className="rail" style={{ display: "flex", gap: "10px", margin: "0 -16px", padding: "0 16px 4px" }}>
              {" "}
              {(v.promos || []).map((pr, i0) => (
                <Fragment key={i0}>
                {" "}
                <div className={pr.th} style={{ flex: "none", width: "150px", aspectRatio: "9 / 14", borderRadius: "20px", padding: "12px", display: "flex", flexDirection: "column", position: "relative", overflow: "hidden" }}>
                  {" "}
                  <span style={{ fontSize: "10.5px", fontWeight: "800", letterSpacing: ".06em", textTransform: "uppercase", opacity: ".9" }}>
                    {pr.tag}
                  </span>
                  {" "}
                  <b className="d" style={{ fontSize: "15px", lineHeight: "1.1", marginTop: "8px" }}>
                    {pr.title}
                  </b>
                  {" "}
                  <button className="tap" onClick={pr.add} disabled={!!(pr.inTray)} style={{ marginTop: "auto", minHeight: "40px", borderRadius: "12px", border: "0", background: "rgba(255,255,255,.92)", color: "#2a0a1c", fontWeight: "800", fontSize: "13px" }}>
                    {pr.label}
                  </button>
                  {" "}
                </div>
                {" "}
                </Fragment>
              ))}
              {" "}
            </div>
            {" "}
            <div className="sec-h">
              <h2>
                Add more to this share
              </h2>
              <span className="muted" style={{ fontSize: "13px" }}>
                {v.poolCount}{" available"}
              </span>
            </div>
            {" "}
            <div className="card" style={{ overflow: "hidden" }}>
              {" "}
              {(v.pool || []).map((pm, i0) => (
                <Fragment key={i0}>
                {" "}
                <div className="list-row">
                  {" "}
                  <span className={`av ${pm.th}`} style={{ width: "40px", height: "40px", borderRadius: "13px" }}>
                    <img src={pm.icon} alt="" />
                  </span>
                  {" "}
                  <span style={{ flex: "1", minWidth: "0" }}>
                    <span className="muted" style={{ fontSize: "12px", fontWeight: "700" }}>
                      {pm.meta}
                    </span>
                    <span style={{ display: "block", fontSize: "14.5px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                      {pm.text}
                    </span>
                  </span>
                  {" "}
                  {pm.own ? (
                    <>
                    <span className="pill" style={{ fontSize: "11px" }}>
                      🔒
                    </span>
                    </>
                  ) : null}
                  {" "}
                  <button className="btn btn-sm tap" onClick={pm.add}>
                    + Add
                  </button>
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
        </div>
        {" "}
        {v.doneOpen ? (
          <>
          {" "}
          <div className="scrim">
            {" "}
            <div className="sheet" role="dialog" aria-label="Posted">
              {" "}
              <div style={{ textAlign: "center" }}>
                {" "}
                <img className="pop" src="/sk/party_popper.png" alt="" style={{ width: "64px", height: "64px" }} />
                {" "}
                <h2 style={{ fontSize: "22px", marginTop: "6px" }}>
                  {v.doneTitle}
                </h2>
                {" "}
                <p className="muted" style={{ marginTop: "4px", fontSize: "14px" }}>
                  One after another, so friends read them in the right order.
                </p>
                {" "}
              </div>
              {" "}
              <div style={{ marginTop: "10px", maxHeight: "200px", overflowY: "auto" }}>
                {" "}
                {(v.steps || []).map((st, i0) => (
                  <Fragment key={i0}>
                  {" "}
                  <div className="ss-step">
                    <span className="ss-num" style={{ marginLeft: "0", background: "#5be0a0", color: "#0b2a1c", minWidth: "30px", height: "30px", fontSize: "14px" }}>
                      {st.num}
                    </span>
                    <span style={{ flex: "1", minWidth: "0", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                      {st.label}
                    </span>
                    <span style={{ color: "#5be0a0", fontWeight: "800" }}>
                      ✓
                    </span>
                  </div>
                  {" "}
                  </Fragment>
                ))}
                {" "}
              </div>
              {" "}
              <div className="ad" style={{ width: "100%", maxWidth: "320px", height: "100px", margin: "12px auto 0" }}>
                <b>
                  Banner ad
                </b>
                320 × 100 · after posting
              </div>
              {" "}
              <div className="row" style={{ gap: "8px", marginTop: "12px" }}>
                {" "}
                {v.needTap ? (
                  <>
                  <button className="btn btn-cta btn-lg tap" onClick={v.shareNow} style={{ flex: "1" }}>
                    Open share sheet
                  </button>
                  </>
                ) : null}
                {" "}
                <button className="btn btn-lg tap" onClick={v.again} style={{ flex: "1" }}>
                  Post elsewhere
                </button>
                {" "}
                <SkLink href="/inbox" className="btn btn-ink btn-lg tap" style={{ flex: "1" }}>
                  Done
                </SkLink>
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
        {v.friends ? (
          <>
          {" "}
          <div className="scrim">
            {" "}
            <div className="sheet" role="dialog" aria-label="Send in app">
              {" "}
              <div className="row">
                <h2 style={{ flex: "1", fontSize: "21px" }}>
                  Send to friends on Sekretly
                </h2>
                <button className="icon-btn tap" onClick={v.closeFriends} aria-label="Close">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" aria-hidden="true">
                    <path d="M6 6l12 12M18 6 6 18" />
                  </svg>
                </button>
              </div>
              {" "}
              <p className="muted" style={{ marginTop: "4px", fontSize: "13.5px" }}>
                {v.friendsSub}
              </p>
              {" "}
              <div style={{ marginTop: "10px" }}>
                {" "}
                {(v.friendList || []).map((fr, i0) => (
                  <Fragment key={i0}>
                  {" "}
                  <div className="list-row" style={{ paddingLeft: "0", paddingRight: "0" }}>
                    {" "}
                    <span className="av" style={{ background: fr.bg, width: "42px", height: "42px", borderRadius: "14px", color: "#1a0b14", fontWeight: "800" }}>
                      {fr.initial}
                    </span>
                    {" "}
                    <span style={{ flex: "1" }}>
                      <b>
                        {fr.name}
                      </b>
                      <div className="muted" style={{ fontSize: "12.5px" }}>
                        {fr.sub}
                      </div>
                    </span>
                    {" "}
                    <button className={`btn btn-sm tap ${fr.cls}`} onClick={fr.send}>
                      {fr.label}
                    </button>
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
