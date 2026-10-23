// @ts-nocheck -- ported 1:1 from design/mockup/MyLinks.dc.html by scripts/port-mockup.mjs; typed as it gets wired to real data
"use client";

import React, { Fragment } from "react";
import { saveMode, SkLink, route } from "@/lib/sk/runtime";


export default class MyLinks extends React.Component<Record<string, any>, any> {
  static defaultProps = {"mode":"dark"};

  constructor(props) {
    super(props);
    var m = null; // light/dark arrives as props.mode from the sk-mode cookie
    this.state = { mode: m || props.mode || 'dark', paused: (props.links || []).reduce(function (p, l) { if (l.paused) p[l.id] = true; return p; }, {}), deleted: {}, copied: null, key: props.linkKey || '', resetOpen: false, resetText: '', toast: '' };
  }
  componentDidMount() {
    var self = this;
    this.onStore = function (e) { if (e.key === 'sk-mode' && e.newValue) self.setState({ mode: e.newValue }); };
    try { window.addEventListener('storage', this.onStore); } catch (e) {}
  }
  componentWillUnmount() { try { window.removeEventListener('storage', this.onStore); } catch (e) {} clearTimeout(this.t); }
  componentDidUpdate(prev) { if (prev.mode !== this.props.mode && this.props.mode) this.setState({ mode: this.props.mode }); }
  flash(msg) { var self = this; this.setState({ toast: msg }); clearTimeout(this.t); this.t = setTimeout(function () { self.setState({ toast: '' }); }, 4300); }
  renderVals() {
    var self = this, s = this.state, dark = s.mode !== 'light';
    var E = { crown: '/sk/crown_3d.png', peach: '/sk/peach.png', moon: '/sk/crescent_moon.png', unicorn: '/sk/unicorn.png', octopus: '/sk/octopus.png' };
    var base = this.props.links || [];
    var links = base.filter(function (l) { return !s.deleted[l.id]; }).map(function (l) {
      var p = !!s.paused[l.id];
      return Object.assign({}, l, {
        unitLabel: l.unit || 'messages', status: p ? 'Paused' : 'Live', action: p ? 'Resume' : 'Pause',
        url: (self.props.origin || '') + '/' + self.props.username + '/' + s.key + '/' + l.theme + '/' + l.slug, detailHref: '/links/' + l.id, editHref: '/create?edit=' + l.id,
        copyLabel: s.copied === l.id ? 'Copied' : 'Copy link',
        toggle: function () { var n = Object.assign({}, s.paused); n[l.id] = !p; self.setState({ paused: n }); self.flash(p ? 'Link resumed' : 'Link paused'); self.props.setPaused(l.id, !p); },
        copy: function () { try { navigator.clipboard.writeText('https://' + (self.props.origin || '') + '/' + self.props.username + '/' + s.key + '/' + l.theme + '/' + l.slug); } catch (e) {} self.setState({ copied: l.id }); },
        edit: function () { try { window.localStorage.setItem('sk-linkedit', JSON.stringify({ id: l.id, topic: l.slug, theme: l.theme })); window.localStorage.setItem('sk-nav', String(Date.now())); } catch (e) {} },
        open: function () { try { window.localStorage.setItem('sk-link', l.id); window.localStorage.setItem('sk-nav', String(Date.now())); } catch (e) {} },
        del: function () { var d = Object.assign({}, s.deleted); d[l.id] = true; self.setState({ deleted: d }); self.flash('Link deleted'); self.props.deleteLink(l.id); }
      });
    });
    return {
      mode: dark ? 'dark' : 'light', isDark: dark, isLight: !dark, modeWord: dark ? 'Light' : 'Dark',
      toggleMode: function () { var n = dark ? 'light' : 'dark'; saveMode(n); self.setState({ mode: n }); },
      links: links,
      pauseAll: function () { var p = {}; (self.props.links || []).forEach(function (l) { p[l.id] = true; }); self.setState({ paused: p }); self.flash('All links paused'); self.props.setAllPaused(true); },
      resumeAll: function () { self.setState({ paused: {} }); self.flash('All links live again'); self.props.setAllPaused(false); },
      askReset: function () { self.setState({ resetOpen: true, resetText: '' }); },
      resetOpen: s.resetOpen,
      resetText: s.resetText,
      onResetText: function (e) { self.setState({ resetText: e.target.value }); },
      cantReset: s.resetText.trim().toUpperCase() !== 'RESET',
      doReset: function () { self.props.resetLinks().then(function (r) { if (r && r.ok) { self.setState({ resetOpen: false, key: r.key, paused: {} }); self.flash('New key made. Old links no longer work.'); } }); },
      noLinks: links.length === 0,
      closeReset: function () { self.setState({ resetOpen: false }); },
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
            <SkLink href="/links" className="nav-i" aria-current="page">
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
          <div className="main">
            {" "}
            <div className="wrap" style={{ maxWidth: "860px" }}>
              {" "}
              <header className="topbar">
                {" "}
                <SkLink href="/home" className="icon-btn tap narrow-only" aria-label="Back">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M15 18 9 12l6-6" />
                  </svg>
                </SkLink>
                {" "}
                <h1 className="grow" style={{ fontSize: "28px" }}>
                  My links
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
                <SkLink href="/notifications" className="icon-btn tap" aria-label="Notifications">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
                    <path d="M10.3 21a1.9 1.9 0 0 0 3.4 0" />
                  </svg>
                  {v.navNotif ? (
                    <>
                    <span className="badge">
                      {v.navNotif}
                    </span>
                    </>
                  ) : null}
                </SkLink>
                {" "}
              </header>
              {" "}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: "8px" }}>
                {" "}
                <button className="btn tap" onClick={v.pauseAll}>
                  Pause all
                </button>
                {" "}
                <button className="btn tap" onClick={v.resumeAll}>
                  Resume all
                </button>
                {" "}
                <button className="btn btn-danger tap" onClick={v.askReset}>
                  Reset all
                </button>
                {" "}
              </div>
              {" "}
              <ul style={{ listStyle: "none", margin: "16px 0 0", padding: "0", display: "flex", flexDirection: "column", gap: "12px" }}>
                {" "}
                {(v.links || []).map((l, i0) => (
                  <Fragment key={i0}>
                  {" "}
                  <li className="card rise" style={{ overflow: "hidden" }}>
                    {" "}
                    <div className={l.th} style={{ padding: "14px 16px", display: "flex", alignItems: "center", gap: "12px" }}>
                      {" "}
                      <img src={l.emoji} alt="" style={{ width: "40px", height: "40px" }} />
                      {" "}
                      <div style={{ flex: "1", minWidth: "0" }}>
                        {" "}
                        <SkLink href={route(l.detailHref)} className="d" style={{ display: "block", fontSize: "19px", fontWeight: "800", lineHeight: "1.1", color: "inherit", textDecoration: "none" }}>
                          {l.topic}
                        </SkLink>
                        {" "}
                        <div style={{ fontSize: "12.5px", opacity: ".85", marginTop: "2px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                          {l.url}
                        </div>
                        {" "}
                      </div>
                      {" "}
                      <span style={{ fontSize: "12px", fontWeight: "800", letterSpacing: ".06em", textTransform: "uppercase", padding: "5px 9px", borderRadius: "99px", background: "rgba(0,0,0,.26)" }}>
                        {l.status}
                      </span>
                      {" "}
                    </div>
                    {" "}
                    <div style={{ padding: "12px 16px", display: "flex", flexWrap: "wrap", gap: "6px 16px", fontSize: "13.5px" }} className="muted">
                      {" "}
                      <span>
                        <b style={{ color: "var(--ink)" }}>
                          {l.count}
                        </b>
                        {" "}{l.unitLabel}
                      </span>
                      <span>
                        <b style={{ color: "var(--ink)" }}>
                          {l.visits}
                        </b>
                        {" visits"}
                      </span>
                      <span>
                        {l.limit}
                      </span>
                      {" "}
                    </div>
                    {" "}
                    <div style={{ display: "flex", gap: "8px", padding: "0 16px 14px", flexWrap: "wrap" }}>
                      {" "}
                      <button className="btn btn-sm tap" onClick={l.toggle}>
                        {l.action}
                      </button>
                      {" "}
                      <button className="btn btn-sm tap" onClick={l.copy}>
                        {l.copyLabel}
                      </button>
                      {" "}
                      <SkLink href={route(l.detailHref)} className="btn btn-sm tap">
                        Insights
                      </SkLink>
                      {" "}
                      <SkLink href={route(l.editHref)} className="btn btn-sm tap">
                        Edit
                      </SkLink>
                      {" "}
                      <button className="btn btn-sm btn-ghost tap" onClick={l.del} style={{ color: "var(--bad)", border: "0", marginLeft: "auto" }}>
                        Delete
                      </button>
                      {" "}
                    </div>
                    {" "}
                  </li>
                  {" "}
                  </Fragment>
                ))}
                {" "}
              </ul>
              {" "}
              {v.noLinks ? (
                <>
                <div className="card" style={{ padding: "22px", textAlign: "center" }}>
                  <img src="/sk/shushing_face.png" alt="" style={{ width: "56px", height: "56px" }} />
                  <div style={{ marginTop: "8px", fontWeight: "800", fontSize: "17px" }}>
                    No links yet
                  </div>
                  <div className="muted" style={{ marginTop: "4px", fontSize: "14px" }}>
                    Make one, share it on your story, and see what people really think.
                  </div>
                </div>
                </>
              ) : null}
              {" "}
              <SkLink href="/create" className="btn btn-cta btn-lg btn-block tap" style={{ marginTop: "16px" }}>
                New link
              </SkLink>
              {" "}
              <p className="muted" style={{ marginTop: "14px", fontSize: "13px", lineHeight: "1.5" }}>
                Paused links show visitors a “taking a nap” page and work again at the same address when you resume. Reset makes a new key, and every old link stops forever.
              </p>
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
          <SkLink href="/profile">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
              <circle cx="12" cy="8" r="4" />
              <path d="M4 21a8 8 0 0 1 16 0" />
            </svg>
            Profile
          </SkLink>
          {" "}
        </nav>
        {" "}
        {v.resetOpen ? (
          <>
          {" "}
          <div className="scrim">
            {" "}
            <div className="sheet" role="dialog" aria-label="Reset all links">
              {" "}
              <img src="/sk/fire.png" alt="" style={{ width: "52px", height: "52px" }} />
              {" "}
              <h2 style={{ marginTop: "8px", fontSize: "24px" }}>
                Reset all links?
              </h2>
              {" "}
              <p className="muted" style={{ marginTop: "6px", fontSize: "15px", lineHeight: "1.5" }}>
                Every link you have shared stops working forever. Visitors will see “This link no longer exists”. Your messages stay in your inbox.
              </p>
              {" "}
              <label htmlFor="rs-confirm" className="label" style={{ marginTop: "14px" }}>
                Type RESET to confirm
              </label>
              {" "}
              <input id="rs-confirm" className="field" value={v.resetText ?? ""} onChange={v.onResetText} placeholder="RESET" style={{ textTransform: "uppercase" }} />
              {" "}
              <button className="btn btn-lg btn-block tap" onClick={v.doReset} disabled={!!(v.cantReset)} style={{ marginTop: "14px", background: "#c4213a", color: "#ffffff", border: "0" }}>
                Reset everything
              </button>
              {" "}
              <button className="btn btn-ghost btn-block" onClick={v.closeReset} style={{ marginTop: "6px", border: "0" }}>
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
