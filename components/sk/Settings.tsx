// @ts-nocheck -- ported 1:1 from design/mockup/Settings.dc.html by scripts/port-mockup.mjs; typed as it gets wired to real data
"use client";

import React, { Fragment } from "react";
import { saveMode, SkLink } from "@/lib/sk/runtime";


export default class Settings extends React.Component<Record<string, any>, any> {
  static defaultProps = {"mode":"dark","ads":"on"};

  constructor(props) {
    super(props);
    var m = null;
    var sec0 = null;
    this.state = Object.assign({ mode: m || props.mode || 'dark', look: props.mode || 'system', sec: props.startSection || null, newWord: '', delOpen: false, installPrompt: false, installed: false, edit: null }, props.settings, { notif: Object.assign({ push: false }, (props.settings || {}).notif) });
  }
  componentDidMount() {
    var self = this;
    this.onStore = function (e) { if (e.key === 'sk-mode' && e.newValue) self.setState({ mode: e.newValue }); };
    try { window.addEventListener('storage', this.onStore); } catch (e) {}
    // the browser's own install prompt, when it offers one
    try { window.addEventListener('beforeinstallprompt', this.onBip = function (e) { e.preventDefault(); self.bip = e; }); } catch (e) {}
    try { if (window.matchMedia('(display-mode: standalone)').matches) self.setState({ installed: true }); } catch (e) {}
    setTimeout(function () { if (window.skPush) window.skPush.isOn().then(function (on) { self.setState({ notif: Object.assign({}, self.state.notif, { push: on }) }); }); }, 300);
  }
  componentWillUnmount() { try { window.removeEventListener('storage', this.onStore); } catch (e) {} }
  componentDidUpdate(prev, ps) {
    if (prev.mode !== this.props.mode && this.props.mode) this.setState({ mode: this.props.mode });
    var s = this.state, patch = {}, changed = false;
    var put = function (k, v) { patch[k] = v; changed = true; };
    if (ps.kind !== s.kind) put('kindMode', s.kind);
    if (ps.mys !== s.mys) { put('allowHints', !!s.mys.hints); put('receiptReactions', !!s.mys.receipts); put('allowGuess', !!s.mys.guess); }
    if (ps.chats !== s.chats) put('chatsFrom', s.chats);
    if (ps.visitors !== s.visitors) put('allowVisitors', s.visitors);
    if (ps.pub !== s.pub) put('publicProfile', s.pub);
    if (ps.inbox !== s.inbox) put('inboxTimer', s.inbox);
    if (ps.chat !== s.chat) put('chatTimer', s.chat);
    if (ps.words !== s.words) put('hiddenWords', s.words);
    if (ps.blur !== s.blur) put('blurMedia', s.blur);
    if (ps.invites !== s.invites) put('gameInvites', s.invites);
    if (ps.listing !== s.listing) put('gameListing', s.listing);
    if (ps.notif !== s.notif) {
      var n = Object.assign({}, s.notif); delete n.push; put('notifPrefs', n);
      // "Push on this device" subscribes or unsubscribes this phone
      if (!!ps.notif.push !== !!s.notif.push && window.skPush) {
        var self = this;
        if (s.notif.push) window.skPush.enable().then(function (r) { if (r !== 'on') self.setState({ notif: Object.assign({}, self.state.notif, { push: false }), pushNote: r }); });
        else window.skPush.disable();
      }
    }
    if (changed) this.props.save(patch);
  }
  setMode(n) { saveMode(n); this.setState({ mode: n }); }
  renderVals() {
    var self = this, s = this.state, dark = s.mode !== 'light';
    var I = { lock: '/sk/shushing_face.png', eyes: '/sk/eyes.png', hg: '/sk/hourglass_not_done.png', ghost: '/sk/ghost.png', letter: '/sk/love_letter.png', bell: '/sk/bell.png', moon: '/sk/crescent_moon.png', die: '/sk/game_die.png', sparkles: '/sk/sparkles.png', frog: '/sk/frog.png' };
    var T = ['1 day', '2 days', '3 days', '1 week', '2 weeks', '3 weeks'];
    var S = [
      ['account', 'Account', 'Username, password, install, delete', I.frog],
      ['privacy', 'Privacy', 'Who can reach you', I.eyes],
      ['messages', 'Messages', 'Disappearing timers', I.hg],
      ['safety', 'Safety', 'Kind mode, hidden words, blocked senders', I.lock],
      ['links', 'Links', 'Pause, resume, reset', I.letter],
      ['notif', 'Notifications', 'Push and in-app', I.bell],
      ['look', 'Appearance', 'Light, dark or system', I.moon],
      ['games', 'Games', 'Invites and listing', I.die],
      ['help', 'Legal and help', 'Rules, privacy, contact', I.sparkles]
    ];
    var cur = s.sec || 'account';
    var curRow = S.filter(function (x) { return x[0] === cur; })[0];
    var N = [['msg', 'New anonymous message', 'Someone answers your link'], ['reply', 'Chat replies', 'In two-way chats'], ['join', 'Someone joins your game', ''], ['turn', 'Your turn in a game', ''], ['paused', 'Link paused', 'When a limit is hit'], ['warn', 'Account warnings', 'Always recommended'], ['drop', 'Daily drop', 'A new question every evening at 7pm'], ['streak', 'Streak reminders', 'Turn off for no streak pressure'], ['wrap', 'Weekly wrap', 'Sundays at 6pm'], ['quiet', 'Quiet hours', 'Nothing between 11pm and 7am'], ['push', 'Push on this device', 'Needs browser permission']];
    var BL = {
      b1: { name: 'Fox (chat) · reported 4 times', icon: '/sk/fox.png', bg: 'linear-gradient(135deg,#ffb35c,#ff5f8f)' },
      b2: { name: 'Visitor on Rate me 1–10 · reported 4 times', icon: I.ghost, bg: 'linear-gradient(135deg,#7f8cff,#2b2f7a)' }
    };
    var lineC = dark ? 'rgba(255,255,255,.11)' : 'rgba(48,34,72,.13)';
    var MW = s.myWarnings || [];
    var v = (s.editVal || '').trim();
    var editOk = s.edit === 'user' ? /^[a-z0-9_]{3,20}$/.test(v) : s.edit === 'pass' ? v.length >= 8 : /.+@.+\..+/.test(v);
    return {
      mode: dark ? 'dark' : 'light', isDark: dark, isLight: !dark, modeWord: dark ? 'Light' : 'Dark',
      toggleMode: function () { self.setMode(dark ? 'light' : 'dark'); self.setState({ look: dark ? 'light' : 'dark' }); },
      ads: this.props.ads === 'off' ? 'off' : 'on',
      listCls: s.sec ? 'st-list hide' : 'st-list', detailCls: s.sec ? 'st-detail open' : 'st-detail',
      back: function () { self.setState({ sec: null }); },
      sections: S.map(function (x) { var on = x[0] === cur; return { label: x[1], sub: x[2], icon: x[3], cur: on ? 'true' : 'false', bg: on ? 'var(--card2)' : 'transparent', pick: function () { self.setState({ sec: x[0] }); } }; }),
      secTitle: curRow[1],
      secAccount: cur === 'account', secPrivacy: cur === 'privacy', secMessages: cur === 'messages', secSafety: cur === 'safety', secLinks: cur === 'links', secNotif: cur === 'notif', secLook: cur === 'look', secGames: cur === 'games', secHelp: cur === 'help',
      installed: s.installed, installBtn: s.installed ? 'Installed' : 'Install', installHint: s.installed ? 'On your home screen' : s.manualInstall ? 'Open your browser menu (⋮ or Share) and tap “Add to Home screen”' : 'Opens like an app',
      askInstall: function () { if (self.bip) { self.bip.prompt(); self.bip.userChoice.then(function (c) { if (c && c.outcome === 'accepted') self.setState({ installed: true }); }); } else self.setState({ manualInstall: true }); }, installPrompt: s.installPrompt,
      cancelInstall: function () { self.setState({ installPrompt: false }); }, doInstall: function () { self.setState({ installPrompt: false, installed: true }); },
      askDelete: function () { self.setState({ delOpen: true, delText: '', gone: false }); }, delOpen: s.delOpen, closeDelete: function () { self.setState({ delOpen: false }); },
      delText: s.delText || '', onDelText: function (e) { self.setState({ delText: e.target.value }); },
      cantDelete: (s.delText || '').trim().toUpperCase() !== 'DELETE', delOp: (s.delText || '').trim().toUpperCase() === 'DELETE' ? 1 : 0.45,
      deleteForever: function () { if ((s.delText || '').trim().toUpperCase() === 'DELETE') { self.setState({ gone: true }); self.props.deleteAccount(s.delText); } },
      gone: !!s.gone, notGone: !s.gone,
      username: s.username, emailShown: s.email ? s.email.charAt(0) + '•••••' + s.email.slice(s.email.indexOf('@')) + (s.emailVerified ? '' : ' · not checked yet') : 'Not set',
      editUser: function () { self.setState({ edit: 'user', editVal: s.username, saved: false, editErr: '' }); },
      editPass: function () { self.setState({ edit: 'pass', editVal: '', saved: false, editErr: '' }); },
      editEmail: function () { self.setState({ edit: 'email', editVal: '', saved: false, editErr: '' }); },
      editOpen: !!s.edit, editing: !!s.edit && !s.saved, editSaved: !!s.edit && !!s.saved,
      editTitle: s.edit === 'user' ? 'Change username' : s.edit === 'pass' ? 'Change password' : 'Recovery email',
      editHint: s.edit === 'user' ? 'Your links move to the new name. Links you shared with the old name stop working.' : s.edit === 'pass' ? 'At least 8 characters. Other devices get logged out.' : 'Only used to reset your password. We send a 6-digit code to check it.',
      editLabel: s.edit === 'user' ? 'New username' : s.edit === 'pass' ? 'New password' : 'Email',
      editType: s.edit === 'pass' ? 'password' : s.edit === 'email' ? 'email' : 'text',
      editPh: s.edit === 'user' ? s.username : s.edit === 'pass' ? 'At least 8 characters' : 'you@example.com',
      editVal: s.editVal || '', onEditVal: function (e) { self.setState({ editErr: '', editVal: s.edit === 'user' ? e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, '').slice(0, 20) : e.target.value }); },
      editCheck: s.editErr ? s.editErr : editOk ? 'Looks good' : (s.edit === 'user' ? '3–20 letters, numbers or _' : s.edit === 'pass' ? (8 - v.length) + ' more characters' : 'Enter a valid email'),
      cantSave: !editOk, saveOp: editOk ? 1 : 0.45,
      saveEdit: function () {
        if (!editOk || s.savingEdit) return;
        var run = s.edit === 'user' ? self.props.changeUsername : s.edit === 'pass' ? self.props.changePassword : self.props.setRecoveryEmail;
        self.setState({ savingEdit: true });
        run(v).then(function (r) {
          if (!r || !r.ok) { self.setState({ savingEdit: false, editErr: (r && r.error) || 'Couldn’t save. Try again.' }); return; }
          var o = { saved: true, savingEdit: false }; if (s.edit === 'user') o.username = r.username || v; if (s.edit === 'email') { o.email = v; o.emailVerified = false; } self.setState(o);
        });
      },
      savedNote: s.edit === 'user' ? 'You are @' + s.username + ' now.' : s.edit === 'pass' ? 'New password set. Other devices were logged out.' : 'We sent a code to your new email.',
      closeEdit: function () { self.setState({ edit: null, saved: false }); },
      chatOpts: [['everyone', 'Everyone'], ['nobody', 'Nobody']].map(function (o) { return { label: o[1], on: s.chats === o[0] ? 'true' : 'false', pick: function () { self.setState({ chats: o[0] }); } }; }),
      visitorsStr: s.visitors ? 'true' : 'false', toggleVisitors: function () { self.setState({ visitors: !s.visitors }); },
      publicStr: s.pub ? 'true' : 'false', togglePublic: function () { self.setState({ pub: !s.pub }); },
      inboxIdx: s.inbox, chatIdx: s.chat, inboxLabel: T[s.inbox], chatLabel: T[s.chat],
      onInbox: function (e) { self.setState({ inbox: Number(e.target.value) }); },
      onChat: function (e) { self.setState({ chat: Number(e.target.value) }); },
      words: s.words.map(function (w) { return { label: w, remove: function () { self.setState({ words: s.words.filter(function (x) { return x !== w; }) }); } }; }),
      newWord: s.newWord, onWord: function (e) { self.setState({ newWord: e.target.value }); },
      addWord: function () { var w = s.newWord.trim().toLowerCase(); if (w && s.words.indexOf(w) < 0) self.setState({ words: s.words.concat([w]), newWord: '' }); },
      blocked: s.blocked.map(function (b) { return { name: b.name, icon: b.icon, bg: b.bg, unblock: function () { self.setState({ blocked: s.blocked.filter(function (x) { return x.key !== b.key; }) }); self.props.unblock(b.key); } }; }),
      logout: function () { self.props.logout(); }, heldCount: this.props.heldCount || 0,
      noBlocked: s.blocked.length === 0,
      blurStr: s.blur ? 'true' : 'false', toggleBlur: function () { self.setState({ blur: !s.blur }); },
      myWarnings: MW.map(function (w) { return { to: w[0], label: w[1] >= 4 ? 'Blocked by them' : w[1] + ' of 3 warnings', steps: [1, 2, 3, 4].map(function (i) { return { c: i <= w[1] ? (i === 4 ? '#c4213a' : '#ffb020') : lineC }; }) }; }),
      kindOpts: [['Off', 0], ['Standard', 1], ['Kind only', 2]].map(function (k) { return { label: k[0], on: s.kind === k[1] ? 'true' : 'false', pick: function () { self.setState({ kind: k[1] }); } }; }),
      kindTitle: ['Everything comes straight in', 'Insults and harassment are held', 'Only kind things get through'][s.kind],
      kindText: ['Only threats and illegal content are blocked. Not recommended for public links.', 'Clear insults, slurs, body shaming and spam wait in Inbox › Held. Jokes and honest opinions still come through.', 'Anything negative or unclear is held, even teasing. Best for big public links.'][s.kind],
      openHeld: function () { try { window.localStorage.setItem('sk-ibf', 'held'); } catch (e) {} },
      mystery: [['hints', 'Let senders leave a hint', 'An optional clue on their message, never a name'], ['receipts', 'Show my reactions on receipts', 'Senders see your reaction and private reply'], ['guess', 'Guess who', 'Guess senders; they choose whether to reveal']].map(function (x) { var on = !!s.mys[x[0]]; return { label: x[1], sub: x[2], on: on ? 'true' : 'false', toggle: function () { var o = Object.assign({}, s.mys); o[x[0]] = !on; self.setState({ mys: o }); } }; }),
      notifs: N.map(function (n) { var on = !!s.notif[n[0]]; return { label: n[1], sub: n[2], on: on ? 'true' : 'false', toggle: function () { var o = Object.assign({}, s.notif); o[n[0]] = !on; self.setState({ notif: o }); } }; }),
      lookOpts: [['light', 'Light'], ['dark', 'Dark'], ['system', 'System']].map(function (o) { return { label: o[1], on: s.look === o[0] ? 'true' : 'false', pick: function () {
        var n = o[0] === 'system' ? 'dark' : o[0];
        try { if (o[0] === 'system' && window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches) n = 'light'; } catch (e) {}
        self.setMode(n); self.setState({ look: o[0] });
      } }; }),
      invitesStr: s.invites ? 'true' : 'false', toggleInvites: function () { self.setState({ invites: !s.invites }); },
      listingStr: s.listing ? 'true' : 'false', toggleListing: function () { self.setState({ listing: !s.listing }); }
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
        <div className="shell">
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
            <SkLink href="/profile" className="nav-i">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
                <circle cx="12" cy="8" r="4" />
                <path d="M4 21a8 8 0 0 1 16 0" />
              </svg>
              Profile
            </SkLink>
            {" "}
            <SkLink href="/settings" className="nav-i" aria-current="page">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
                <circle cx="12" cy="12" r="3" />
                <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
              </svg>
              Settings
            </SkLink>
            {" "}
          </nav>
          {" "}
          <div className="main">
            {" "}
            <div className="wrap">
              {" "}
              <div className="st-wrap">
                {" "}
                <section className={v.listCls} aria-label="Settings sections">
                  {" "}
                  <header className="topbar">
                    {" "}
                    <SkLink href="/profile" className="icon-btn tap narrow-only" aria-label="Back">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <path d="M15 18 9 12l6-6" />
                      </svg>
                    </SkLink>
                    {" "}
                    <h1 className="grow" style={{ fontSize: "28px" }}>
                      Settings
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
                  <ul className="card" style={{ listStyle: "none", margin: "0", padding: "4px 0", overflow: "hidden" }}>
                    {" "}
                    {(v.sections || []).map((x, i0) => (
                      <Fragment key={i0}>
                      {" "}
                      <li>
                        {" "}
                        <button className="list-row tap" onClick={x.pick} aria-current={x.cur} style={{ width: "100%", border: "0", borderBottom: "1px solid var(--line)", background: x.bg, textAlign: "left" }}>
                          {" "}
                          <img src={x.icon} alt="" style={{ width: "28px", height: "28px" }} />
                          {" "}
                          <span style={{ flex: "1", minWidth: "0" }}>
                            <b style={{ display: "block", fontSize: "15px" }}>
                              {x.label}
                            </b>
                            <span className="muted" style={{ fontSize: "12.5px" }}>
                              {x.sub}
                            </span>
                          </span>
                          {" "}
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={{ color: "var(--muted)" }}>
                            <path d="m9 18 6-6-6-6" />
                          </svg>
                          {" "}
                        </button>
                        {" "}
                      </li>
                      {" "}
                      </Fragment>
                    ))}
                    {" "}
                  </ul>
                  {" "}
                  <button className="btn btn-block tap" onClick={v.logout} style={{ marginTop: "12px" }}>
                    Log out
                  </button>
                  {" "}
                  <div className="ad-wrap">
                    <div className="ad ad-banner" style={{ width: "320px", height: "100px" }}>
                      <b>
                        Banner · settings bottom
                      </b>
                      320 × 100
                    </div>
                  </div>
                  {" "}
                </section>
                {" "}
                <section className={v.detailCls} aria-label={v.secTitle}>
                  {" "}
                  <header className="topbar">
                    {" "}
                    <button className="st-back icon-btn tap" onClick={v.back} aria-label="Back to settings">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <path d="M15 18 9 12l6-6" />
                      </svg>
                    </button>
                    {" "}
                    <h2 className="grow" style={{ fontSize: "26px" }}>
                      {v.secTitle}
                    </h2>
                    {" "}
                  </header>
                  {" "}
                  {v.secAccount ? (
                    <>
                    {" "}
                    <div className="card" style={{ overflow: "hidden" }}>
                      {" "}
                      <div className="list-row">
                        <span style={{ flex: "1" }}>
                          <b>
                            Username
                          </b>
                          <div className="muted" style={{ fontSize: "13px" }}>
                            @{v.username}
                          </div>
                        </span>
                        <button className="btn btn-sm tap" onClick={v.editUser}>
                          Change
                        </button>
                      </div>
                      {" "}
                      <div className="list-row">
                        <span style={{ flex: "1" }}>
                          <b>
                            Password
                          </b>
                          <div className="muted" style={{ fontSize: "13px" }}>
                            Changed 12 days ago
                          </div>
                        </span>
                        <button className="btn btn-sm tap" onClick={v.editPass}>
                          Change
                        </button>
                      </div>
                      {" "}
                      <div className="list-row">
                        <span style={{ flex: "1" }}>
                          <b>
                            Recovery email
                          </b>
                          <div className="muted" style={{ fontSize: "13px" }}>
                            {v.emailShown}
                          </div>
                        </span>
                        <button className="btn btn-sm tap" onClick={v.editEmail}>
                          Edit
                        </button>
                      </div>
                      {" "}
                      <div className="list-row">
                        <span style={{ flex: "1" }}>
                          <b>
                            Install Sekretly
                          </b>
                          <div className="muted" style={{ fontSize: "13px" }}>
                            {v.installHint}
                          </div>
                        </span>
                        <button className="btn btn-sm btn-cta" onClick={v.askInstall} disabled={!!(v.installed)}>
                          {v.installBtn}
                        </button>
                      </div>
                      {" "}
                    </div>
                    {" "}
                    <button className="btn btn-danger btn-block tap" onClick={v.askDelete} style={{ marginTop: "14px" }}>
                      Delete account
                    </button>
                    {" "}
                    </>
                  ) : null}
                  {" "}
                  {v.secPrivacy ? (
                    <>
                    {" "}
                    <div className="card" style={{ padding: "16px" }}>
                      {" "}
                      <b>
                        Who can start two-way chats with me
                      </b>
                      {" "}
                      <div className="seg" style={{ marginTop: "10px" }}>
                        {(v.chatOpts || []).map((o, i0) => (
                          <Fragment key={i0}>
                          <button aria-pressed={o.on} onClick={o.pick}>
                            {o.label}
                          </button>
                          </Fragment>
                        ))}
                      </div>
                      {" "}
                    </div>
                    {" "}
                    <div className="card row" style={{ padding: "16px", marginTop: "10px" }}>
                      {" "}
                      <span style={{ flex: "1" }}>
                        <b>
                          Visitors without an account can message me
                        </b>
                        <div className="muted" style={{ fontSize: "13px" }}>
                          Turn off to only hear from Sekretly users
                        </div>
                      </span>
                      {" "}
                      <button className="switch" role="switch" aria-checked={v.visitorsStr} aria-label="Allow visitors" onClick={v.toggleVisitors} />
                      {" "}
                    </div>
                    {" "}
                    <div className="card row" style={{ padding: "16px", marginTop: "10px" }}>
                      {" "}
                      <span style={{ flex: "1" }}>
                        <b>
                          Public profile
                        </b>
                        <div className="muted" style={{ fontSize: "13px" }}>
                          Show avatar, bio and active links
                        </div>
                      </span>
                      {" "}
                      <button className="switch" role="switch" aria-checked={v.publicStr} aria-label="Public profile" onClick={v.togglePublic} />
                      {" "}
                    </div>
                    {" "}
                    <div className="card" style={{ marginTop: "10px", overflow: "hidden" }}>
                      {" "}
                      <div style={{ padding: "14px 16px 4px" }}>
                        <b>
                          Mystery features
                        </b>
                      </div>
                      {" "}
                      {(v.mystery || []).map((my, i0) => (
                        <Fragment key={i0}>
                        {" "}
                        <div className="list-row">
                          <span style={{ flex: "1" }}>
                            <b style={{ fontSize: "15px" }}>
                              {my.label}
                            </b>
                            <div className="muted" style={{ fontSize: "12.5px" }}>
                              {my.sub}
                            </div>
                          </span>
                          <button className="switch" role="switch" aria-checked={my.on} aria-label={my.label} onClick={my.toggle} />
                        </div>
                        {" "}
                        </Fragment>
                      ))}
                      {" "}
                    </div>
                    {" "}
                    </>
                  ) : null}
                  {" "}
                  {v.secMessages ? (
                    <>
                    {" "}
                    <div className="card" style={{ padding: "16px" }}>
                      {" "}
                      <div className="row">
                        <b style={{ flex: "1" }}>
                          Inbox messages disappear after
                        </b>
                        <span className="pill">
                          {v.inboxLabel}
                        </span>
                      </div>
                      {" "}
                      <label htmlFor="st-inbox" className="sr">
                        Inbox timer
                      </label>
                      {" "}
                      <input id="st-inbox" className="st-range" type="range" min="0" max="5" step="1" value={v.inboxIdx ?? ""} onChange={v.onInbox} />
                      {" "}
                      <div className="muted" style={{ display: "flex", justifyContent: "space-between", fontSize: "12px" }}>
                        <span>
                          1 day
                        </span>
                        <span>
                          3 weeks
                        </span>
                      </div>
                      {" "}
                    </div>
                    {" "}
                    <div className="card" style={{ padding: "16px", marginTop: "10px" }}>
                      {" "}
                      <div className="row">
                        <b style={{ flex: "1" }}>
                          Chat messages disappear after
                        </b>
                        <span className="pill">
                          {v.chatLabel}
                        </span>
                      </div>
                      {" "}
                      <label htmlFor="st-chat" className="sr">
                        Chat timer
                      </label>
                      {" "}
                      <input id="st-chat" className="st-range" type="range" min="0" max="5" step="1" value={v.chatIdx ?? ""} onChange={v.onChat} />
                      {" "}
                      <div className="muted" style={{ display: "flex", justifyContent: "space-between", fontSize: "12px" }}>
                        <span>
                          1 day
                        </span>
                        <span>
                          3 weeks
                        </span>
                      </div>
                      {" "}
                    </div>
                    {" "}
                    <p className="muted" style={{ marginTop: "10px", fontSize: "13px", lineHeight: "1.5" }}>
                      Expired messages are deleted from our servers. Reported messages are kept for 30 days for review.
                    </p>
                    {" "}
                    </>
                  ) : null}
                  {" "}
                  {v.secSafety ? (
                    <>
                    {" "}
                    <div className="card" style={{ padding: "16px", marginBottom: "10px" }}>
                      {" "}
                      <b>
                        Kind mode
                      </b>
                      {" "}
                      <p className="muted" style={{ fontSize: "13px", marginTop: "4px", lineHeight: "1.45" }}>
                        Decides what lands in your inbox and what gets held for you to review first.
                      </p>
                      {" "}
                      <div className="seg" style={{ marginTop: "10px" }}>
                        {(v.kindOpts || []).map((ko, i0) => (
                          <Fragment key={i0}>
                          <button aria-pressed={ko.on} onClick={ko.pick}>
                            {ko.label}
                          </button>
                          </Fragment>
                        ))}
                      </div>
                      {" "}
                      <div style={{ marginTop: "10px", padding: "10px 12px", borderRadius: "14px", background: "var(--card2)", fontSize: "13.5px", lineHeight: "1.45" }}>
                        <b>
                          {v.kindTitle}
                        </b>
                        <br />
                        <span className="muted">
                          {v.kindText}
                        </span>
                      </div>
                      {" "}
                      <SkLink href="/inbox?filter=held" className="btn btn-sm btn-block tap" style={{ marginTop: "10px" }}>
                        See held messages ({v.heldCount})
                      </SkLink>
                      {" "}
                    </div>
                    {" "}
                    <div className="card row" style={{ padding: "16px", marginBottom: "10px" }}>
                      {" "}
                      <span style={{ flex: "1" }}>
                        <b>
                          Blur photos and videos until I tap
                        </b>
                        <div className="muted" style={{ fontSize: "12.5px" }}>
                          Anything sent to you anonymously starts blurred
                        </div>
                      </span>
                      {" "}
                      <button className="switch" role="switch" aria-checked={v.blurStr} aria-label="Blur media" onClick={v.toggleBlur} />
                      {" "}
                    </div>
                    {" "}
                    <div className="card" style={{ padding: "16px", marginBottom: "10px" }}>
                      {" "}
                      <b>
                        Warnings on my account
                      </b>
                      {" "}
                      <p className="muted" style={{ fontSize: "13px", marginTop: "4px", lineHeight: "1.45" }}>
                        When someone reports a message you sent them, you get a warning. After 3 warnings with the same person, their next report blocks you from messaging them.
                      </p>
                      {" "}
                      <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginTop: "12px" }}>
                        {" "}
                        {(v.myWarnings || []).map((mw, i0) => (
                          <Fragment key={i0}>
                          {" "}
                          <div>
                            {" "}
                            <div className="row" style={{ fontSize: "14px" }}>
                              <b style={{ flex: "1" }}>
                                {mw.to}
                              </b>
                              <span className="muted">
                                {mw.label}
                              </span>
                            </div>
                            {" "}
                            <div className="warn-steps" style={{ marginTop: "6px" }}>
                              {(mw.steps || []).map((st, i2) => (
                                <Fragment key={i2}>
                                <span style={{ background: st.c }} />
                                </Fragment>
                              ))}
                            </div>
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
                    <div className="card" style={{ padding: "16px" }}>
                      {" "}
                      <b>
                        My hidden words
                      </b>
                      {" "}
                      <p className="muted" style={{ fontSize: "13px", marginTop: "4px" }}>
                        Messages with these words arrive covered.
                      </p>
                      {" "}
                      <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginTop: "12px" }}>
                        {" "}
                        {(v.words || []).map((w, i0) => (
                          <Fragment key={i0}>
                          {" "}
                          <span className="pill" style={{ padding: "6px 6px 6px 12px", fontSize: "13px" }}>
                            {w.label}
                            <button onClick={w.remove} aria-label={`Remove ${w.label}`} style={{ width: "24px", height: "24px", borderRadius: "50%", border: "0", background: "var(--line)", display: "grid", placeItems: "center", padding: "0" }}>
                              ×
                            </button>
                          </span>
                          {" "}
                          </Fragment>
                        ))}
                        {" "}
                      </div>
                      {" "}
                      <div className="row" style={{ gap: "8px", marginTop: "12px" }}>
                        {" "}
                        <label htmlFor="st-word" className="sr">
                          Add a hidden word
                        </label>
                        {" "}
                        <input id="st-word" className="field" value={v.newWord ?? ""} onChange={v.onWord} placeholder="Add a word" style={{ flex: "1" }} />
                        {" "}
                        <button className="btn tap" onClick={v.addWord}>
                          Add
                        </button>
                        {" "}
                      </div>
                      {" "}
                    </div>
                    {" "}
                    <div className="card" style={{ marginTop: "10px", overflow: "hidden" }}>
                      {" "}
                      <div style={{ padding: "14px 16px 4px" }}>
                        <b>
                          Blocked senders
                        </b>
                        <div className="muted" style={{ fontSize: "12.5px", marginTop: "2px" }}>
                          Blocked automatically after your 4th report. Undo to let them message you again.
                        </div>
                      </div>
                      {" "}
                      {(v.blocked || []).map((bl, i0) => (
                        <Fragment key={i0}>
                        {" "}
                        <div className="list-row">
                          <span className="av" style={{ background: bl.bg, width: "38px", height: "38px", borderRadius: "12px" }}>
                            <img src={bl.icon} alt="" />
                          </span>
                          <span style={{ flex: "1", fontSize: "14px" }}>
                            {bl.name}
                          </span>
                          <button className="btn btn-sm tap" onClick={bl.unblock}>
                            Undo
                          </button>
                        </div>
                        {" "}
                        </Fragment>
                      ))}
                      {" "}
                      {v.noBlocked ? (
                        <>
                        <p className="muted" style={{ padding: "8px 16px 16px", fontSize: "14px" }}>
                          Nobody blocked.
                        </p>
                        </>
                      ) : null}
                      {" "}
                    </div>
                    {" "}
                    </>
                  ) : null}
                  {" "}
                  {v.secLinks ? (
                    <>
                    {" "}
                    <div className="card" style={{ padding: "16px" }}>
                      {" "}
                      <p className="muted" style={{ fontSize: "14px", lineHeight: "1.5" }}>
                        Pause, resume or reset every link at once. Reset makes a new key and old links stop forever.
                      </p>
                      {" "}
                      <SkLink href="/links" className="btn btn-block tap" style={{ marginTop: "12px" }}>
                        Open My links
                      </SkLink>
                      {" "}
                    </div>
                    {" "}
                    </>
                  ) : null}
                  {" "}
                  {v.secNotif ? (
                    <>
                    {" "}
                    <div className="card" style={{ overflow: "hidden" }}>
                      {" "}
                      {(v.notifs || []).map((n, i0) => (
                        <Fragment key={i0}>
                        {" "}
                        <div className="list-row">
                          <span style={{ flex: "1" }}>
                            <b style={{ fontSize: "15px" }}>
                              {n.label}
                            </b>
                            <div className="muted" style={{ fontSize: "12.5px" }}>
                              {n.sub}
                            </div>
                          </span>
                          <button className="switch" role="switch" aria-checked={n.on} aria-label={n.label} onClick={n.toggle} />
                        </div>
                        {" "}
                        </Fragment>
                      ))}
                      {" "}
                    </div>
                    {" "}
                    </>
                  ) : null}
                  {" "}
                  {v.secLook ? (
                    <>
                    {" "}
                    <div className="card" style={{ padding: "16px" }}>
                      {" "}
                      <b>
                        Appearance
                      </b>
                      {" "}
                      <div className="seg" style={{ marginTop: "10px" }}>
                        {(v.lookOpts || []).map((o, i0) => (
                          <Fragment key={i0}>
                          <button aria-pressed={o.on} onClick={o.pick}>
                            {o.label}
                          </button>
                          </Fragment>
                        ))}
                      </div>
                      {" "}
                      <p className="muted" style={{ fontSize: "13px", marginTop: "10px" }}>
                        System follows your phone’s setting.
                      </p>
                      {" "}
                    </div>
                    {" "}
                    </>
                  ) : null}
                  {" "}
                  {v.secGames ? (
                    <>
                    {" "}
                    <div className="card" style={{ overflow: "hidden" }}>
                      {" "}
                      <div className="list-row">
                        <span style={{ flex: "1" }}>
                          <b>
                            Allow game invites
                          </b>
                        </span>
                        <button className="switch" role="switch" aria-checked={v.invitesStr} aria-label="Allow game invites" onClick={v.toggleInvites} />
                      </div>
                      {" "}
                      <div className="list-row">
                        <span style={{ flex: "1" }}>
                          <b>
                            Show my games in the listing
                          </b>
                          <div className="muted" style={{ fontSize: "12.5px" }}>
                            Others can find and join
                          </div>
                        </span>
                        <button className="switch" role="switch" aria-checked={v.listingStr} aria-label="Show in listing" onClick={v.toggleListing} />
                      </div>
                      {" "}
                    </div>
                    {" "}
                    </>
                  ) : null}
                  {" "}
                  {v.secHelp ? (
                    <>
                    {" "}
                    <div className="card" style={{ overflow: "hidden" }}>
                      {" "}
                      <SkLink href="/help" className="list-row">
                        Help & FAQ
                      </SkLink>
                      {" "}
                      <SkLink href="/contact" className="list-row">
                        Contact us
                      </SkLink>
                      {" "}
                      <SkLink href="/safety" className="list-row">
                        Community rules
                      </SkLink>
                      {" "}
                      <SkLink href="/privacy" className="list-row">
                        Privacy policy
                      </SkLink>
                      {" "}
                      <SkLink href="/terms" className="list-row">
                        Terms of use
                      </SkLink>
                      {" "}
                    </div>
                    {" "}
                    <p className="muted" style={{ marginTop: "12px", fontSize: "12.5px" }}>
                      Sekretly v0.1 beta
                    </p>
                    {" "}
                    </>
                  ) : null}
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
        {v.editOpen ? (
          <>
          {" "}
          <div className="scrim">
            {" "}
            <div className="sheet" role="dialog" aria-label={v.editTitle}>
              {" "}
              {v.editing ? (
                <>
                {" "}
                <div>
                  {" "}
                  <h2 style={{ fontSize: "22px" }}>
                    {v.editTitle}
                  </h2>
                  {" "}
                  <p className="muted" style={{ marginTop: "6px", fontSize: "14px", lineHeight: "1.5" }}>
                    {v.editHint}
                  </p>
                  {" "}
                  <label htmlFor="ed-field" className="label" style={{ marginTop: "12px" }}>
                    {v.editLabel}
                  </label>
                  {" "}
                  <input id="ed-field" className="field" type={v.editType} value={v.editVal ?? ""} onChange={v.onEditVal} placeholder={v.editPh} />
                  {" "}
                  <div className="hint">
                    {v.editCheck}
                  </div>
                  {" "}
                  <button className="btn btn-cta btn-lg btn-block tap" onClick={v.saveEdit} disabled={!!(v.cantSave)} style={{ marginTop: "12px", opacity: v.saveOp }}>
                    Save
                  </button>
                  {" "}
                  <button className="btn btn-ghost btn-block" onClick={v.closeEdit} style={{ marginTop: "6px", border: "0" }}>
                    Cancel
                  </button>
                  {" "}
                </div>
                {" "}
                </>
              ) : null}
              {" "}
              {v.editSaved ? (
                <>
                {" "}
                <div style={{ textAlign: "center", padding: "6px 0" }}>
                  {" "}
                  <img className="pop" src="/sk/sparkles.png" alt="" style={{ width: "60px", height: "60px" }} />
                  {" "}
                  <h2 style={{ fontSize: "22px", marginTop: "6px" }}>
                    Saved
                  </h2>
                  {" "}
                  <p className="muted" style={{ marginTop: "4px", fontSize: "14px" }}>
                    {v.savedNote}
                  </p>
                  {" "}
                  <button className="btn btn-ink btn-lg btn-block tap" onClick={v.closeEdit} style={{ marginTop: "14px" }}>
                    Done
                  </button>
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
          </>
        ) : null}
        {" "}
        {v.delOpen ? (
          <>
          {" "}
          <div className="scrim">
            {" "}
            <div className="sheet" role="dialog" aria-label="Delete account">
              {" "}
              {v.notGone ? (
                <>
                {" "}
                <div>
                  {" "}
                  <h2 style={{ fontSize: "24px" }}>
                    Delete your account?
                  </h2>
                  {" "}
                  <p className="muted" style={{ marginTop: "6px", fontSize: "15px", lineHeight: "1.5" }}>
                    Your links stop working, your messages and chats are deleted, and @{v.username}{" becomes free for someone else. This cannot be undone."}
                  </p>
                  {" "}
                  <label htmlFor="del-confirm" className="label" style={{ marginTop: "14px" }}>
                    Type DELETE to confirm
                  </label>
                  {" "}
                  <input id="del-confirm" className="field" value={v.delText ?? ""} onChange={v.onDelText} placeholder="DELETE" style={{ textTransform: "uppercase" }} />
                  {" "}
                  <button className="btn btn-lg btn-block tap" onClick={v.deleteForever} disabled={!!(v.cantDelete)} style={{ marginTop: "14px", background: "#c4213a", color: "#ffffff", border: "0", opacity: v.delOp }}>
                    Delete forever
                  </button>
                  {" "}
                  <button className="btn btn-ghost btn-block" onClick={v.closeDelete} style={{ marginTop: "6px", border: "0" }}>
                    Keep my account
                  </button>
                  {" "}
                </div>
                {" "}
                </>
              ) : null}
              {" "}
              {v.gone ? (
                <>
                {" "}
                <div style={{ textAlign: "center", padding: "8px 0" }}>
                  {" "}
                  <img className="pop" src="/sk/ghost.png" alt="" style={{ width: "72px", height: "72px" }} />
                  {" "}
                  <h2 style={{ fontSize: "24px", marginTop: "8px" }}>
                    Your account is gone
                  </h2>
                  {" "}
                  <p className="muted" style={{ marginTop: "6px", fontSize: "15px", lineHeight: "1.5" }}>
                    Everything was deleted. Thanks for being here. You can start fresh any time.
                  </p>
                  {" "}
                  <SkLink href="/" className="btn btn-cta btn-lg btn-block tap" style={{ marginTop: "16px" }}>
                    Back to Sekretly
                  </SkLink>
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
          </>
        ) : null}
        {" "}
        {v.installPrompt ? (
          <>
          {" "}
          <div style={{ position: "fixed", inset: "0", zIndex: "60", background: "rgba(0,0,0,.45)", display: "flex", alignItems: "center", justifyContent: "center", padding: "20px" }}>
            {" "}
            <div role="dialog" aria-label="Install app" className="pop" style={{ width: "min(100%, 340px)", background: "#ffffff", color: "#202124", borderRadius: "16px", boxShadow: "0 10px 40px rgba(0,0,0,.4)", padding: "20px", fontFamily: "Roboto, system-ui, sans-serif" }}>
              {" "}
              <div style={{ fontSize: "18px", fontWeight: "500" }}>
                Install app?
              </div>
              {" "}
              <div style={{ display: "flex", alignItems: "center", gap: "12px", marginTop: "16px" }}>
                <span className="logo-mark" style={{ width: "44px", height: "44px", borderRadius: "12px", fontSize: "22px" }}>
                  S
                </span>
                <div>
                  <div style={{ fontWeight: "600" }}>
                    Sekretly
                  </div>
                  <div style={{ fontSize: "13px", color: "#5f6368" }}>
                    sekretly.com
                  </div>
                </div>
              </div>
              {" "}
              <div style={{ display: "flex", justifyContent: "flex-end", gap: "8px", marginTop: "20px" }}>
                {" "}
                <button onClick={v.cancelInstall} style={{ minHeight: "40px", padding: "0 16px", borderRadius: "20px", border: "0", background: "transparent", color: "#1a73e8", fontWeight: "600" }}>
                  Cancel
                </button>
                {" "}
                <button onClick={v.doInstall} style={{ minHeight: "40px", padding: "0 18px", borderRadius: "20px", border: "0", background: "#1a73e8", color: "#ffffff", fontWeight: "600" }}>
                  Install
                </button>
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
