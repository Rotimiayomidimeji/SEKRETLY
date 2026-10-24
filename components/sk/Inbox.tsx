// @ts-nocheck -- ported 1:1 from design/mockup/Inbox.dc.html by scripts/port-mockup.mjs; typed as it gets wired to real data
"use client";

import React, { Fragment } from "react";
import { saveMode, SkLink } from "@/lib/sk/runtime";


export default class Inbox extends React.Component<Record<string, any>, any> {
  static defaultProps = {"mode":"dark","ads":"on"};

  constructor(props) {
    super(props);
    var m = null; // light/dark arrives as props.mode from the sk-mode cookie
    var E = { fox: '/sk/fox.png', moon: '/sk/crescent_moon.png' };
    // other screens (Home, Settings) can open the inbox on a filter, e.g. Held
    var f0 = null;
    f0 = props.startFilter || null;
    this.state = {
      reacts: Inbox.reactsOf(props.items || []), guess: Inbox.guessesOf(props.items || []), guessOpen: false, gq: '', people: [], heldShown: {}, released: {},
      mode: m || props.mode || 'dark', filter: f0 || 'all', openId: props.startOpen || null, share: false, draft: '', typing: false, toast: null,
      shown: {}, page: 0, selMode: false, chosen: {}, archived: (props.items || []).reduce(function (a, x) { if (x.archived) a[x.id] = true; return a; }, {}), menu: null, del: null, quick: null, chatSel: false, chatChosen: {}, deletedBubbles: {}, ama: {}, hints: {}, hint: null, hintT: 0, report: false, result: null, picked: null, other: false, otherText: '', seed: 3,
      items: props.items || []
    };
  }
  static reactsOf(items) { var o = {}; items.forEach(function (x) { if (x.reaction !== undefined && x.reaction !== null) o[x.id] = x.reaction; }); return o; }
  static guessesOf(items) { var o = {}; items.forEach(function (x) { if (x.guess && x.guess.used) o[x.id] = { used: x.guess.used, res: x.guess.res, who: x.guess.who }; }); return o; }
  cats() {
    if (this.props.reportCats && this.props.reportCats.length) return this.props.reportCats;
    return ['Abusive', 'Harassment', 'Bullying', 'Insults', 'Threats', 'Intimidation', 'Hate speech', 'Racism', 'Tribalism', 'Religious hate', 'Sexism', 'Body shaming', 'Disability mockery', 'Sexual content', 'Unwanted nudity', 'Explicit photo', 'Explicit video', 'Non-consensual image', 'Unwanted advances', 'Creepy or inappropriate', 'Grooming concern', 'Underage concern', 'Stalking', 'Doxxing / private info', 'Exposing secrets', 'Blackmail', 'Extortion', 'Impersonation', 'Scam', 'Fraud', 'Phishing link', 'Malware link', 'Spam', 'Flooding', 'Advertising', 'Selling things', 'Gambling promo', 'Drugs', 'Weapons', 'Violence', 'Graphic gore', 'Self-harm', 'Suicide talk', 'Misinformation', 'False rumour', 'Defamation', 'Trolling', 'Mocking', 'Profanity', 'Other harmful'];
  }
  pickRandom(seed) {
    var all = this.cats().slice(), out = [], n = (this.props.reportMin || 5) + (seed * 7) % ((this.props.reportMax || 10) - (this.props.reportMin || 5) + 1), x = seed * 9301 + 49297;
    while (out.length < n && all.length) { x = (x * 9301 + 49297) % 233280; out.push(all.splice(Math.floor(x / 233280 * all.length), 1)[0]); }
    return out;
  }
  warning(cat, n, who) {
    var T = ['Your message to @' + (this.props.username || 'you') + ' was reported as “' + cat + '”.', '@' + (this.props.username || 'you') + ' flagged something you sent as “' + cat + '”.', 'Heads up: a message you sent was marked “' + cat + '” by the person who got it.', 'A message you sent to @' + (this.props.username || 'you') + ' was reported for “' + cat + '”.'];
    var S = n >= 3 ? [' This is your last warning. One more report and you can’t message them again.'] : [' This is warning ' + n + ' of 3.', ' ' + (3 - n) + ' more warnings and the next report blocks you from messaging them.', ' Keep it respectful.'];
    return T[(n + cat.length) % T.length] + S[cat.length % S.length];
  }
  componentDidMount() {
    var self = this;
    this.onStore = function (e) { if (e.key === 'sk-mode' && e.newValue) self.setState({ mode: e.newValue }); };
    try { window.addEventListener('storage', this.onStore); } catch (e) {}
  }
  componentWillUnmount() { try { window.removeEventListener('storage', this.onStore); } catch (e) {} clearInterval(this.ht); clearInterval(this.qt); clearTimeout(this.lp); clearTimeout(this.t1); clearTimeout(this.t2); clearTimeout(this.t3); clearTimeout(this.t4); }
  componentDidUpdate(prev) {
    if (prev.mode !== this.props.mode && this.props.mode) this.setState({ mode: this.props.mode });
    // the page refreshes every few seconds: take the server's items, mark what's new, and say so
    if (prev.items !== this.props.items && this.props.items) {
      var self = this, old = {};
      this.state.items.forEach(function (x) { old[x.id] = true; });
      var fresh = this.props.items.filter(function (x) { return !old[x.id] && x.unread; });
      var items = this.props.items.map(function (x) { return fresh.indexOf(x) >= 0 ? Object.assign({}, x, { fresh: true }) : x; });
      var arch = {}; items.forEach(function (x) { if (x.archived) arch[x.id] = true; });
      var f = fresh[0];
      this.setState({ items: items, archived: arch, reacts: Inbox.reactsOf(items), guess: Inbox.guessesOf(items), toast: f ? { t: f.kind === 'chat' ? 'New reply from ' + f.who : 'Someone sent you a message', s: (f.kind === 'chat' ? 'Anonymous chat' : 'on ' + f.title) + ' · just now', i: '/sk/love_letter.png' } : this.state.toast });
      if (f) { clearTimeout(this.t4); this.t4 = setTimeout(function () { self.setState({ toast: null }); }, 4300); }
    }
  }
  flash(kind) { var self = this; this.setState({ toast: kind }); clearTimeout(this.t4); this.t4 = setTimeout(function () { self.setState({ toast: null }); }, 4300); }
  renderVals() {
    var self = this, s = this.state, dark = s.mode !== 'light';
    var GHOST = '/sk/ghost.png';
    var L = { describe: { title: 'Describe me in 3 words', th: 'th-sunset' }, quiz: { title: 'How well do you know me?', th: 'th-ocean' }, rate: { title: 'Rate me 1–10', th: 'th-midnight' }, confess: { title: 'Confess something', th: 'th-bubblegum' }, ama: { title: 'Ask me anything', th: 'th-neon' }, custom: { title: 'Tell me something', th: 'th-default' } };
    var LL = function (m) { var k = m.link, b = L[k] || L.custom; return { title: m.title || b.title, th: m.th || b.th }; };
    // long text reads as the same cards Share studio posts: each one filled to the brim, carrying on in the next
    var split = function (t, max) {
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
    };
    var shareText = function (m) {
      if (m.quiz) return 'Someone scored ' + m.quiz.score + '/' + m.quiz.of + ' on my quiz' + (m.text ? '. “' + m.text + '”' : '');
      if (m.rate) return m.rate + '/10' + (m.text ? '. ' + m.text : '');
      if (m.link === 'ama' && s.ama[m.id] && s.ama[m.id].trim()) return 'Q: ' + m.text + ' A: ' + s.ama[m.id].trim();
      return m.text;
    };
    var HINTS = ['Lagos · Android · late at night', 'Abuja · iPhone · this afternoon', 'Ibadan · Android · early morning', 'Port Harcourt · iPhone · around midnight', 'Somewhere near you · Android · this evening'];
    var hintOf = function (id) { var h = 0; for (var i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) % 997; return HINTS[h % HINTS.length]; };
    var line = dark ? 'rgba(255,255,255,.11)' : 'rgba(48,34,72,.13)';
    var inArchive = s.filter === 'archived';
    var isHeld = function (m) { return !!m.held && !s.released[m.id]; };
    var heldCount = s.items.filter(isHeld).length;
    var shown = s.items.filter(function (m) {
      if (inArchive) return !!s.archived[m.id];
      if (s.archived[m.id]) return false;
      if (s.filter === 'held') return isHeld(m);
      if (isHeld(m)) return false;
      if (s.filter === 'unread') return m.unread;
      if (s.filter === 'chats') return m.kind === 'chat';
      if (s.filter === 'blocked') return m.warns >= 4;
      return true;
    });
    var counter = 0;
    // hand the chosen message(s) to the Share studio board
    var stashOf = function (list) { return function () { try { window.localStorage.setItem('sk-share', JSON.stringify(list)); window.localStorage.setItem('sk-nav', String(Date.now())); } catch (e) {} }; };
    function decorate(m) {
      var link = LL(m), isOpen = s.openId === m.id, blocked = m.warns >= 4;
      var last = m.kind === 'chat' ? m.thread[m.thread.length - 1] : null;
      var preview = m.kind === 'chat' ? (last.gone ? 'Message disappeared' : last.from ? last.from : (last.media ? (last.me ? 'You sent a ' : '') + (last.media === 'video' ? '▶ Video' : '📷 Photo') : (last.me ? 'You: ' : '') + last.text)) : (m.quiz ? 'Scored ' + m.quiz.score + '/' + m.quiz.of + ' on your quiz' : m.rate ? m.rate + '/10 · ' + (m.text || m.cat) : m.media ? '📷 Photo · ' + m.text : m.text);
      if (isHeld(m)) preview = 'Hidden by Kind mode · ' + m.held;
      return {
        who: m.kind === 'chat' ? m.who : isHeld(m) ? 'Held' : 'Anonymous', kindLabel: m.kind === 'chat' ? '· chat' : (m.senderHint && !isHeld(m) ? '· left a hint' : ''),
        av: m.kind === 'chat' ? m.av : GHOST, avBg: m.kind === 'chat' ? m.avBg : '', avCls: m.kind === 'chat' ? '' : link.th,
        preview: preview, italic: 'normal', weight: m.unread ? 800 : 500,
        ago: m.ago, left: m.left, unread: m.unread,
        blocked: blocked, warned: m.warns > 0 && !blocked, warnLabel: m.warns + '/3 warned', op: blocked ? 0.6 : 1,
        dash: (m.pct * 56.5).toFixed(1), ringC: m.pct < 0.3 ? '#ff8a3d' : '#ff3b8d', ringBg: line,
        bg: s.selMode && s.chosen[m.id] ? (dark ? 'rgba(255,59,141,.14)' : 'rgba(216,27,114,.1)') : isOpen ? (dark ? '#241930' : '#e3deeb') : 'transparent', line: (s.selMode && s.chosen[m.id]) || isOpen ? '#ff3b8d' : 'transparent',
        freshCls: m.fresh ? 'fresh' : '',
        open: function () {
          var items = s.items.map(function (x) { return x.id === m.id ? Object.assign({}, x, { unread: false, fresh: false }) : x; });
          self.setState({ openId: m.id, items: items, share: false, draft: '', page: 0, chatSel: false, chatChosen: {} }); if (m.unread) self.props.markRead([m.id]);
        },
        selMode: s.selMode, chosenStr: s.chosen[m.id] ? 'true' : 'false', chkCls: s.chosen[m.id] ? 'on' : '',
        // hold to select (or right-click); once selecting, a tap adds or removes
        press: function () { clearTimeout(self.lp); self.held = false; self.lp = setTimeout(function () { self.held = true; try { if (navigator.vibrate) navigator.vibrate(18); } catch (e) {} var c = Object.assign({}, self.state.chosen); c[m.id] = true; self.setState({ selMode: true, chosen: c }); }, 450); },
        release: function () { clearTimeout(self.lp); },
        ctx: function (e) { if (e && e.preventDefault) e.preventDefault(); clearTimeout(self.lp); self.held = true; var c = Object.assign({}, s.chosen); c[m.id] = true; self.setState({ selMode: true, chosen: c }); },
        tap: function () {
          if (self.held) { self.held = false; return; }
          if (s.selMode) { var c = Object.assign({}, s.chosen); if (c[m.id]) delete c[m.id]; else c[m.id] = true; self.setState({ chosen: c }); return; }
          var items = s.items.map(function (x) { return x.id === m.id ? Object.assign({}, x, { unread: false, fresh: false }) : x; });
          self.setState({ openId: m.id, items: items, share: false, draft: '', page: 0, chatSel: false, chatChosen: {} }); if (m.unread) self.props.markRead([m.id]);
        },
        topic: link.title, th: link.th, textQuoted: '“' + m.text + '”',
        mediaTag: m.media === 'video' ? '▶ Video' : m.media === 'photo' ? 'Photo' : '',
        sub: m.kind === 'chat' ? 'Anonymous chat · from ' + link.title : 'On ' + link.title,
        canShare: m.kind === 'one',
        stash: stashOf([{ id: m.id, topic: link.title, th: link.th.replace('th-', ''), text: shareText(m) }])
      };
    }
    var groups = ['quiz', 'describe', 'rate', 'confess', 'ama', 'custom'].map(function (k) {
      var its = shown.filter(function (m) { return m.link === k; }).map(function (m) { var d = decorate(m); counter++; d.adAfter = counter % 5 === 0; return d; });
      return { title: L[k].title, th: L[k].th, n: its.length, items: its };
    }).filter(function (g) { return g.n > 0; });
    var selRaw = s.items.filter(function (m) { return m.id === s.openId; })[0];
    var sel = selRaw ? decorate(selRaw) : { stash: function () {}, who: '', sub: '', av: GHOST, avBg: '', avCls: '', th: '', topic: '', textQuoted: '', ago: '', left: '', mediaTag: '' };
    var thread = selRaw && selRaw.kind === 'chat' ? selRaw.thread.map(function (b, i) {
      var key = selRaw.id + ':' + i;
      if (b.media) return { selCls: '', showChk: false, chkCls: '', press: function () {}, release: function () {}, ctx: function () {}, tap: function () {}, canShare: false, inApp: false, isMedia: true, isText: false, align: b.me ? 'flex-end' : 'flex-start', src: b.url || '', isVideo: b.media === 'video', isPhoto: b.media !== 'video', cover: b.media === 'video' ? 'Tap to view video' : 'Tap to view photo', alt: b.media === 'video' ? 'Video sent in chat' : 'Photo sent in chat', tag: b.media === 'video' ? (b.me ? '▶ Your video' : '▶ Video') : 'Photo', mediaCls: b.me || s.shown[key] || self.props.blurMedia === false ? '' : 'blur', hidden: !b.me && !s.shown[key] && self.props.blurMedia !== false, reveal: function () { var o = Object.assign({}, s.shown); o[key] = true; self.setState({ shown: o }); } };
      if (b.from) return { selCls: '', showChk: false, chkCls: '', press: function () {}, release: function () {}, ctx: function () {}, tap: function () {}, canShare: false, inApp: false, isMedia: false, isText: true, text: (b.fromLabel || 'Their message') + ': “' + b.from + '”', align: 'stretch', bg: 'transparent', ink: dark ? '#e9dff0' : '#3a3046', border: 'dashed ' + line, radius: '18px', style: 'italic' };
      if (b.gone) return { selCls: '', showChk: false, chkCls: '', press: function () {}, release: function () {}, ctx: function () {}, tap: function () {}, canShare: false, inApp: false, isMedia: false, isText: true, text: 'Message disappeared', align: 'center', bg: 'transparent', ink: dark ? '#bcaec2' : '#665e74', border: 'dashed ' + line, radius: '99px', style: 'italic' };
      var bsel = s.chatChosen[key], pickB = function () { var c = Object.assign({}, self.state.chatChosen); if (c[key]) delete c[key]; else c[key] = true; self.setState({ chatChosen: c }); };
      var selVals = { selCls: (b.me ? 'mine' : 'theirs') + (bsel ? ' chosen' : ''), showChk: s.chatSel, chkCls: bsel ? 'on' : '',
        press: function () { clearTimeout(self.lp); self.held = false; self.lp = setTimeout(function () { self.held = true; var c = Object.assign({}, self.state.chatChosen); c[key] = true; self.setState({ chatSel: true, chatChosen: c }); }, 450); },
        release: function () { clearTimeout(self.lp); },
        ctx: function (e) { if (e && e.preventDefault) e.preventDefault(); clearTimeout(self.lp); self.held = true; var c = Object.assign({}, s.chatChosen); c[key] = true; self.setState({ chatSel: true, chatChosen: c }); },
        tap: function () { if (self.held) { self.held = false; return; } if (s.chatSel) pickB(); } };
      var bStash = stashOf([{ id: key, topic: b.me ? 'Your reply to ' + selRaw.who : 'Chat · ' + selRaw.who, th: 'default', text: b.text, own: !!b.me }]);
      return Object.assign(selVals, b.me ? { canShare: false, inApp: true, stash: bStash, isMedia: false, isText: true, text: b.text, align: 'flex-end', bg: '#d81b72', ink: '#ffffff', border: 'solid transparent', radius: '20px 20px 6px 20px', style: 'normal' }
        : { canShare: true, inApp: false, stash: bStash, isMedia: false, isText: true, text: b.text, align: 'flex-start', bg: dark ? '#241930' : '#e3deeb', ink: dark ? '#fbf6fa' : '#211a2c', border: 'solid ' + line, radius: '20px 20px 20px 6px', style: 'normal' });
    }).filter(function (x, i) { return !s.deletedBubbles[selRaw.id + ':' + i]; }) : [];
    var open = !!selRaw;
    var chosenIds = shown.filter(function (m) { return !!s.chosen[m.id]; }).map(function (m) { return m.id; });
    var allChosen = shown.length > 0 && chosenIds.length === shown.length;
    var archCount = Object.keys(s.archived).filter(function (id) { return s.archived[id] && s.items.some(function (x) { return x.id === id; }); }).length;
    var delOneChat = !!s.del && s.del.ids.length === 1 && s.items.some(function (x) { return x.id === s.del.ids[0] && x.kind === 'chat'; });
    // what a selection shares: whole messages, and the other person's words from chats (never your own words in public)
    var shareList = [];
    chosenIds.forEach(function (id) {
      var m = s.items.filter(function (x) { return x.id === id; })[0]; if (!m) return;
      if (m.kind === 'one') shareList.push({ id: m.id, topic: LL(m).title, th: LL(m).th.replace('th-', ''), text: shareText(m) });
      else m.thread.forEach(function (b, i) { if (!b.me && b.text) shareList.push({ id: m.id + ':' + i, topic: 'Chat · ' + m.who, th: 'default', text: b.text }); });
    });
    var chatKeys = selRaw && selRaw.kind === 'chat' ? Object.keys(s.chatChosen).filter(function (k) { return s.chatChosen[k] && !s.deletedBubbles[k]; }) : [];
    var chatList = chatKeys.map(function (k) { var b = selRaw.thread[Number(k.split(':').pop())]; return { id: k, topic: b.me ? 'Your reply to ' + selRaw.who : 'Chat · ' + selRaw.who, th: 'default', text: b.text, own: !!b.me }; });
    var chatPublic = chatList.filter(function (x) { return !x.own; });
    var quickCards = [];
    (s.quick ? s.quick.list : []).forEach(function (x) { var p = split(x.text, 390); p.forEach(function (t, i) { quickCards.push((p.length > 1 ? 'Part ' + (i + 1) + '/' + p.length + ' · ' : '') + t); }); });
    var pages = open && selRaw.kind === 'one' && !selRaw.quiz && !selRaw.rate ? split(selRaw.text, 390) : [];
    var pg = Math.min(s.page, Math.max(0, pages.length - 1));
    var w = selRaw ? selRaw.warns : 0;
    var r = s.result;
    var who = selRaw ? (selRaw.kind === 'chat' ? selRaw.who : 'This sender') : '';
    var resultTitle = '', resultBody = '', resultPreview = '', resultIcon = '/sk/sparkles.png';
    if (r) {
      if (r.support) { resultTitle = 'We sent them support'; resultBody = 'Reports about self-harm don’t give warnings. The sender gets a private message with free help-lines instead.'; resultPreview = 'Someone who got your message is worried about you. You are not alone. Free, confidential help: [HELP-LINE NUMBER].'; resultIcon = '/sk/bell.png'; }
      else if (r.n >= 4) { resultTitle = who + ' is blocked from you'; resultBody = 'That was report 4. They can’t send you anything anymore. You can undo this any time in Settings › Safety.'; resultPreview = 'You can no longer message @' + (this.props.username || 'you') + '. Your messages were reported 4 times.'; resultIcon = '/sk/hourglass_not_done.png'; }
      else { resultTitle = 'Warning ' + r.n + ' of 3 sent'; resultBody = (selRaw && selRaw.acct ? who + ' gets a warning notification now.' : 'They don’t have an account, so the warning shows on their device next time they open your link.') + ' ' + (r.n === 3 ? 'One more report blocks them from you.' : (4 - r.n) + ' more reports block them from you.'); resultPreview = self.warning(r.cat, r.n); }
    }
    var reasons = this.pickRandom(s.seed);
    var support = ['Self-harm', 'Suicide talk'];
    return {
      mode: dark ? 'dark' : 'light', isDark: dark, isLight: !dark, modeWord: dark ? 'Light' : 'Dark',
      toggleMode: function () { var n = dark ? 'light' : 'dark'; saveMode(n); self.setState({ mode: n }); },
      ads: this.props.ads === 'off' ? 'off' : 'on',
      unread: s.items.filter(function (m) { return m.unread; }).length,
      navInbox: s.items.filter(function (m) { return m.unread && !s.archived[m.id] && !(m.held && !s.released[m.id]); }).length,
      // bulk selection
      inArchive: inArchive, notArchive: !inArchive, listTitle: inArchive ? 'Archived' : 'Inbox',
      archiveNote: 'Archived messages stay here until they disappear. Hold one to bring it back.',
      leaveArchive: function () { self.setState({ filter: 'all', selMode: false, chosen: {} }); },
      showHoldTip: !s.selMode && !inArchive,
      listEmpty: groups.length === 0, emptyTitle: inArchive ? 'Nothing archived' : 'No messages here', emptyBody: inArchive ? 'Hold messages in your inbox and tap Archive to tuck them away.' : 'Try another filter.',
      selMode: s.selMode, selCount: chosenIds.length + ' selected', noneChosen: chosenIds.length === 0,
      selAllLabel: allChosen ? 'Clear' : 'Select all',
      selectAll: function () { var c = {}; if (!allChosen) shown.forEach(function (m) { c[m.id] = true; }); self.setState({ chosen: c }); },
      cancelSel: function () { self.setState({ selMode: false, chosen: {} }); },
      noShare: shareList.length === 0, noShareStr: shareList.length === 0 ? 'true' : 'false', shareOp: shareList.length ? 1 : 0.4, sharePe: shareList.length ? 'auto' : 'none',
      bulkStash: function () { stashOf(shareList)(); self.setState({ selMode: false, chosen: {} }); },
      bulkStashFromQuick: function () { stashOf(s.quick ? s.quick.list : shareList)(); self.setState({ selMode: false, chosen: {}, quick: null }); },
      archiveWord: inArchive ? 'Unarchive' : 'Archive',
      bulkArchive: function () {
        var a = Object.assign({}, s.archived); chosenIds.forEach(function (id) { if (inArchive) delete a[id]; else a[id] = true; });
        var n = chosenIds.length, open = chosenIds.indexOf(s.openId) >= 0; self.props.setArchived(chosenIds, !inArchive);
        self.setState({ archived: a, selMode: false, chosen: {}, openId: open ? null : s.openId, toast: { t: inArchive ? n + ' back in your inbox' : n + ' archived', s: inArchive ? 'They’re in the inbox again.' : 'Find them in ⋮ › Archived.', i: '/sk/sparkles.png' } });
        clearTimeout(self.t4); self.t4 = setTimeout(function () { self.setState({ toast: null }); }, 3600);
      },
      bulkDelete: function () { self.setState({ del: { ids: chosenIds.slice() } }); },
      // menus
      listMenuOpen: s.menu === 'list', itemMenuOpen: s.menu === 'item',
      openListMenu: function () { self.setState({ menu: 'list' }); }, openItemMenu: function () { self.setState({ menu: 'item' }); },
      closeMenu: function () { self.setState({ menu: null }); },
      listMenuItems: [
        { icon: '☑', label: 'Select messages', cls: '', go: function () { self.setState({ menu: null, selMode: true, chosen: {} }); } },
        { icon: '🗄', label: inArchive ? 'Back to inbox' : 'Archived (' + archCount + ')', cls: '', go: function () { self.setState({ menu: null, filter: inArchive ? 'all' : 'archived', selMode: false, chosen: {} }); } },
        { icon: '✓', label: 'Mark all as read', cls: '', go: function () { self.setState({ menu: null, items: s.items.map(function (x) { return Object.assign({}, x, { unread: false, fresh: false }); }) }); self.props.markAllRead(); } }
      ],
      itemMenuItems: !selRaw ? [] : [].concat(selRaw.kind === 'chat' ? [{ icon: '☑', label: 'Select messages', cls: '', go: function () { self.setState({ menu: null, chatSel: true, chatChosen: {} }); } }] : [], [
        { icon: '🗄', label: s.archived[selRaw.id] ? 'Unarchive' : (selRaw.kind === 'chat' ? 'Archive chat' : 'Archive'), cls: '', go: function () {
          var a = Object.assign({}, s.archived), was = !!a[selRaw.id]; if (was) delete a[selRaw.id]; else a[selRaw.id] = true; self.props.setArchived([selRaw.id], !was);
          self.setState({ menu: null, archived: a, openId: was ? s.openId : null, toast: { t: was ? 'Back in your inbox' : 'Archived', s: was ? '' : 'Find it in ⋮ › Archived.', i: '/sk/sparkles.png' } });
          clearTimeout(self.t4); self.t4 = setTimeout(function () { self.setState({ toast: null }); }, 3200);
        } },
        { icon: '🗑', label: selRaw.kind === 'chat' ? 'Delete chat' : 'Delete', cls: 'bad', go: function () { self.setState({ menu: null, del: { ids: [selRaw.id] } }); } },
        { icon: '⚑', label: 'Report', cls: 'bad', go: function () { self.setState({ menu: null, report: true, result: null, picked: null, other: false, otherText: '', seed: s.seed + 1 }); } }
      ]),
      // delete
      delOpen: !!s.del, delTitle: s.del ? (s.del.ids.length === 1 ? (delOneChat ? 'Delete this chat?' : 'Delete this message?') : 'Delete ' + s.del.ids.length + ' messages?') : '',
      delBody: 'It’s gone for you right away. You can’t undo this. Reports you made still count.',
      cancelDel: function () { self.setState({ del: null }); },
      confirmDel: function () {
        var ids = s.del.ids, n = ids.length; self.props.deleteItems(ids);
        self.setState({ items: s.items.filter(function (x) { return ids.indexOf(x.id) < 0; }), del: null, selMode: false, chosen: {}, openId: ids.indexOf(s.openId) >= 0 ? null : s.openId, toast: { t: n === 1 ? 'Deleted' : n + ' deleted', s: '', i: '/sk/sparkles.png' } });
        clearTimeout(self.t4); self.t4 = setTimeout(function () { self.setState({ toast: null }); }, 2800);
      },
      // quick post (no editing): pick where, then the cards go out in order
      quickOpen: !!s.quick, quickPick: !!s.quick && !s.quick.dest, quickRun: !!s.quick && !!s.quick.dest,
      openQuick: function () { if (shareList.length) self.setState({ quick: { list: shareList } }); },
      closeQuick: function () { clearInterval(self.qt); var done = s.quick && s.quick.dest && s.quick.k >= quickCards.length; self.setState(done ? { quick: null, selMode: false, chosen: {}, chatSel: false, chatChosen: {} } : { quick: null }); },
      quickTitle: s.quick ? 'Post ' + quickCards.length + ' card' + (quickCards.length === 1 ? '' : 's') : '',
      quickSub: s.quick ? 'From ' + s.quick.list.length + ' message' + (s.quick.list.length === 1 ? '' : 's') + ', in order, with their own colours. Long ones become several cards.' : '',
      quickDests: [['WhatsApp Status', '#25d366', '#0b2a1c'], ['Instagram story', 'linear-gradient(135deg,#7a2ff7,#d81b72 55%,#f29b38)', '#ffffff'], ['Snapchat', '#fffc00', '#111111'], ['Save images', 'var(--card)', 'var(--ink)']].map(function (d) {
        return { name: d[0], bg: d[1], ink: d[2], go: function () {
          var n = quickCards.length; self.setState({ quick: Object.assign({}, s.quick, { dest: d[0], k: 0 }) }); clearInterval(self.qt);
          self.qt = setInterval(function () { var q = self.state.quick; if (!q) { clearInterval(self.qt); return; } var k = q.k + 1; self.setState({ quick: Object.assign({}, q, { k: k }) }); if (k >= n) clearInterval(self.qt); }, 700);
        } };
      }),
      quickRunTitle: s.quick && s.quick.dest ? (s.quick.k >= quickCards.length ? 'Posted to ' + s.quick.dest + ' ✓' : 'Posting to ' + s.quick.dest + '…') : '',
      quickSteps: quickCards.map(function (c, i) { var k = s.quick ? s.quick.k || 0 : 0, done = i < k; return { mark: done ? '✓' : i + 1, label: c, bg: done ? '#5be0a0' : 'var(--card2)', ink: done ? '#0b2a1c' : 'var(--ink)' }; }),
      quickDone: !!s.quick && !!s.quick.dest && s.quick.k >= quickCards.length,
      quickBtn: s.quick && s.quick.dest && s.quick.k >= quickCards.length ? 'Done' : 'Stop',
      // chat selection
      chatSelMode: !!selRaw && selRaw.kind === 'chat' && s.chatSel, notChatSel: !(selRaw && selRaw.kind === 'chat' && s.chatSel),
      chatSelCount: chatKeys.length + ' selected', chatNone: chatKeys.length === 0,
      cancelChatSel: function () { self.setState({ chatSel: false, chatChosen: {} }); },
      chatShareOp: chatList.length ? 1 : 0.4, chatSharePe: chatList.length ? 'auto' : 'none',
      chatStash: function () { stashOf(chatList)(); self.setState({ chatSel: false, chatChosen: {} }); },
      chatNoPublic: chatPublic.length === 0,
      chatQuick: function () { if (chatPublic.length) self.setState({ quick: { list: chatPublic } }); },
      chatDelete: function () { var d = Object.assign({}, s.deletedBubbles); chatKeys.forEach(function (k) { d[k] = true; }); self.props.deleteBubbles(selRaw.id, chatKeys.map(function (k) { var b = selRaw.thread[Number(k.split(':').pop())]; return b && b.bid; }).filter(Boolean)); self.setState({ deletedBubbles: d, chatSel: false, chatChosen: {} }); },
      filters: [['all', 'All'], ['unread', 'Unread'], ['chats', 'Chats'], ['held', 'Held · ' + heldCount], ['blocked', 'Blocked']].map(function (f) { var a = s.filter === f[0]; return { label: f[1], on: a ? 'true' : 'false', cls: a ? 'on' : '', pick: function () { self.setState({ filter: f[0] }); } }; }),
      groups: groups,
      listClass: open ? 'ib-list hide' : 'ib-list', detailClass: open ? 'ib-detail open' : 'ib-detail', navClass: open || s.selMode ? 'bnav hide' : 'bnav',
      empty: !open, hasSel: open, sel: sel,
      selOne: open && selRaw.kind === 'one', selChat: open && selRaw.kind === 'chat',
      selPlain: open && !selRaw.quiz && !selRaw.rate, selRate: open && !!selRaw.rate, selQuiz: open && !!selRaw.quiz, selAma: open && selRaw.link === 'ama',
      pageText: pages.length ? (pg === 0 ? '“' : /[.!?]$/.test(pages[pg - 1]) ? '' : '…') + pages[pg] + (pg === pages.length - 1 ? '”' : /[.!?]$/.test(pages[pg]) ? '' : '…') : '',
      pageCls: pages.length && (pages.length > 1 || pages[0].length > 150) ? '' : 'd', pageW: pages.length && (pages.length > 1 || pages[0].length > 150) ? 700 : 800,
      pageLs: pages.length && (pages.length > 1 || pages[0].length > 150) ? '0' : '-.02em', pageLh: pages.length && (pages.length > 1 || pages[0].length > 150) ? 1.45 : 1.16,
      pageFs: pages.length && (pages.length > 1 || pages[0].length > 150) ? 'clamp(16px, 2.6cqi, 19px)' : !pages.length ? '24px' : pages[pg].length > 120 ? 'clamp(18px, 3cqi, 22px)' : pages[pg].length > 60 ? 'clamp(21px, 3.6cqi, 27px)' : 'clamp(24px, 4.4cqi, 34px)',
      selPaged: pages.length > 1, pageCount: pages.length, pageNo: (pg + 1) + ' / ' + pages.length,
      pageDots: pages.map(function (x, i) { return { w: i === pg ? '22px' : '7px', c: i === pg ? 'currentColor' : 'rgba(255,255,255,.45)' }; }),
      atFirst: pg === 0, atLast: pg >= pages.length - 1, prevOp: pg === 0 ? 0.4 : 1, nextOp: pg >= pages.length - 1 ? 0.4 : 1,
      pagePrev: function () { if (pg > 0) self.setState({ page: pg - 1 }); }, pageNext: function () { if (pg < pages.length - 1) self.setState({ page: pg + 1 }); },
      rateN: open && selRaw.rate ? selRaw.rate : '', rateCat: open && selRaw.cat ? selRaw.cat : '', rateWhy: open ? selRaw.text || '' : '', hasRateWhy: open && !!selRaw.text,
      rateEmoji: open && selRaw.rate >= 9 ? '/sk/fire.png' : open && selRaw.rate >= 6 ? '/sk/eyes.png' : '/sk/thinking_face_3d.png',
      quizScore: open && selRaw.quiz ? selRaw.quiz.score + '/' + selRaw.quiz.of : '', quizRankText: open && selRaw.quiz ? '#' + selRaw.quiz.rank + ' on your leaderboard' : '',
      quizVerdict: open && selRaw.quiz ? ['Do they even know you?', 'Basically strangers', 'Casual friend', 'Real friend', 'Close friend', 'Bestie level'][Math.round(selRaw.quiz.score / selRaw.quiz.of * 5)] : '',
      quizRows: open && selRaw.quiz ? selRaw.quiz.rows.map(function (r) { var ok = !r[2]; return { q: r[0], a: r[1], fix: ok ? '' : ' · right answer: ' + r[2], mark: ok ? '✓' : '✗', bg: ok ? '#5be0a0' : '#ff8b98' }; }) : [],
      hasQuizNote: open && !!selRaw.quiz && !!selRaw.text, quizNoteText: open && selRaw.text ? 'Their note: “' + selRaw.text + '”' : '',
      amaAnswer: open ? (s.ama[selRaw.id] || '') : '', onAma: function (e) { var o = Object.assign({}, s.ama); o[selRaw.id] = e.target.value.slice(0, 200); self.setState({ ama: o }); },
      shareStash: open ? stashOf([{ id: selRaw.id, topic: LL(selRaw).title, th: LL(selRaw).th.replace('th-', ''), text: shareText(selRaw) }]) : function () {},
      shareLabel: !open ? '' : pages.length > 1 ? 'Share all ' + pages.length + ' cards to my story' : selRaw.link === 'ama' ? (s.ama[selRaw.id] && s.ama[selRaw.id].trim() ? 'Share question & answer' : 'Share the question') : 'Share to my story',
      canReply: open && !!selRaw.replyOk, noReply: open && selRaw.kind === 'one' && !selRaw.replyOk,
      replyLabel: open && selRaw.chatId ? 'Open your chat' : 'Reply privately',
      replyPrivately: function () {
        if (!selRaw || !selRaw.replyOk || s.starting) return;
        if (selRaw.chatId) { self.setState({ openId: selRaw.chatId, draft: '' }); return; }
        var from = selRaw.id;
        self.setState({ starting: true });
        self.props.startChat(from).then(function (r) {
          if (!r || !r.ok) { self.setState({ starting: false, toast: { t: 'Can’t reply to this one', s: (r && r.error) || 'Try again.', i: GHOST } }); clearTimeout(self.t4); self.t4 = setTimeout(function () { self.setState({ toast: null }); }, 3600); return; }
          var items = self.state.items.filter(function (x) { return x.id !== r.item.id; }).map(function (x) { return x.id === from ? Object.assign({}, x, { chatId: r.item.id }) : x; });
          self.setState({ starting: false, items: [r.item].concat(items), openId: r.item.id, draft: '', toast: { t: 'Private chat started', s: 'You’re both anonymous. Say something first.', i: '/sk/speech_balloon_3d.png' } });
          clearTimeout(self.t4); self.t4 = setTimeout(function () { self.setState({ toast: null }); }, 3600);
        });
      },
      chatIntro: open && selRaw.started ? 'You started this chat from their message. You two are anonymous to each other, forever.' : 'You two are anonymous to each other, forever. Messages disappear 1 day after they are sent.',
      attachChat: function (e) {
        var f = e && e.target && e.target.files && e.target.files[0]; if (!f || !selRaw) return;
        try { e.target.value = ''; } catch (x) {}
        var id = selRaw.id, kind = f.type && f.type.indexOf('video') === 0 ? 'video' : 'photo', local = '';
        try { local = URL.createObjectURL(f); } catch (x) {}
        self.setState({ items: self.state.items.map(function (x) { return x.id === id ? Object.assign({}, x, { thread: x.thread.concat([{ me: true, media: kind, url: local }]) }) : x; }) });
        var undo = function (msg) {
          self.setState({ items: self.state.items.map(function (x) { return x.id === id ? Object.assign({}, x, { thread: x.thread.slice(0, -1) }) : x; }), toast: { t: 'Not sent', s: msg || 'Try again.', i: GHOST } });
          clearTimeout(self.t4); self.t4 = setTimeout(function () { self.setState({ toast: null }); }, 3600);
        };
        var fd = new FormData(); fd.append('file', f); fd.append('chatId', id);
        import('@/lib/upload-client').then(function (m) { return m.uploadMedia(fd); }).then(function (r) {
          if (!r || !r.ok) { undo(r && r.error); return; }
          return self.props.sendChat({ chatId: id, mediaUrl: r.url }).then(function (s2) { if (!s2 || !s2.ok) undo(s2 && s2.error); });
        }).catch(function () { undo(); });
      },
      // Kind mode: held messages
      selHeld: open && isHeld(selRaw), heldReason: open && selRaw.held ? selRaw.held : '',
      selBlur: open && isHeld(selRaw) && !s.heldShown[selRaw.id] ? 'blur(10px)' : 'none',
      heldShowLabel: open && s.heldShown[selRaw.id] ? 'Hide' : 'Show',
      toggleHeldShow: function () { var o = Object.assign({}, s.heldShown); o[selRaw.id] = !o[selRaw.id]; self.setState({ heldShown: o }); },
      releaseHeld: function () { var o = Object.assign({}, s.released); o[selRaw.id] = true; self.props.releaseHeld(selRaw.id); self.setState({ released: o, filter: 'all', toast: { t: 'Moved to your inbox', s: 'Kind mode will learn from that.', i: '/sk/sparkles.png' } }); clearTimeout(self.t4); self.t4 = setTimeout(function () { self.setState({ toast: null }); }, 3200); },
      // sender's own hint, reactions they see on their receipt, guess who
      selHasSenderHint: open && !!selRaw.senderHint && !isHeld(selRaw), senderHint: open ? selRaw.senderHint || '' : '',
      canReact: open && selRaw.kind === 'one' && !isHeld(selRaw),
      reactNote: !open ? '' : s.reacts[selRaw.id] !== undefined ? 'Sent · they’ll see it' : (selRaw.receipt || selRaw.acct ? 'They’ll see it on their receipt' : 'Only you see this one'),
      reacts: [['Love it', '/sk/sparkles.png'], ['Laughing', '/sk/fire.png'], ['Shook', '/sk/eyes.png'], ['Secret safe', '/sk/shushing_face.png'], ['Touched', '/sk/love_letter.png']].map(function (r, k) {
        var on = open && s.reacts[selRaw.id] === k;
        return { name: r[0], icon: r[1], on: on ? 'true' : 'false', ring: on ? '#ff3b8d' : 'transparent', bg: on ? 'rgba(255,59,141,.14)' : 'var(--card2)', pick: function () { var o = Object.assign({}, s.reacts); if (on) delete o[selRaw.id]; else o[selRaw.id] = k; self.setState({ reacts: o }); self.props.react(selRaw.id, on ? null : k); } };
      }),
      canGuess: open && selRaw.kind === 'one' && !isHeld(selRaw) && (!!selRaw.receipt || !!selRaw.acct) && self.props.allowGuess !== false,
      guessSub: !open ? '' : (3 - ((s.guess[selRaw.id] || {}).used || 0)) + ' of 3 guesses left on this message',
      guessIdle: open && !(s.guess[selRaw.id] || {}).res, guessPending: open && (s.guess[selRaw.id] || {}).res === 'wait',
      guessYes: open && (s.guess[selRaw.id] || {}).res === 'yes', guessNo: open && (s.guess[selRaw.id] || {}).res === 'no',
      guessName: open ? (s.guess[selRaw.id] || {}).who || '' : '', guessOut: open && ((s.guess[selRaw.id] || {}).used || 0) >= 3,
      guessAgain: function () { var o = Object.assign({}, s.guess); o[selRaw.id] = Object.assign({}, o[selRaw.id], { res: null }); self.setState({ guess: o }); },
      guessOpen: s.guessOpen, gq: s.gq, onGq: function (e) { var q = e.target.value.toLowerCase(); self.setState({ gq: q }); clearTimeout(self.gt); self.gt = setTimeout(function () { self.props.searchPeople(q).then(function (r) { if (self.state.gq === q) self.setState({ people: r || [] }); }); }, 250); },
      openGuess: function () { self.setState({ guessOpen: true, gq: '' }); }, closeGuess: function () { self.setState({ guessOpen: false }); },
      guessHelp: open && selRaw.senderHint ? 'Their hint: ' + selRaw.senderHint + '. Search their username.' : 'Search the username you think it is. If you’re right, they choose whether to reveal.',
      guessPeople: (s.people || []).map(function (p) {
        return { handle: p.handle, from: 'Sekretly member', icon: p.icon, bg: 'linear-gradient(135deg,#ffb35c,#ff5f8f)', pick: function () {
          var id = selRaw.id, prev = s.guess[id] || {}, o = Object.assign({}, s.guess);
          o[id] = { who: p.handle, res: 'wait', used: (prev.used || 0) + 1 };
          self.setState({ guess: o, guessOpen: false, people: [], gq: '' });
          self.props.guess(id, p.handle).then(function (r) {
            if (r && r.ok) return;
            var g = Object.assign({}, self.state.guess); g[id] = prev.used ? prev : undefined; if (!g[id]) delete g[id];
            self.setState({ guess: g, toast: { t: 'Guess not sent', s: (r && r.error) || 'Try again.', i: GHOST } });
            clearTimeout(self.t4); self.t4 = setTimeout(function () { self.setState({ toast: null }); }, 3600);
          });
        } };
      }),
      hintBtn: open && s.hints[selRaw.id] ? 'Hint ✓' : 'Hint',
      hintLocked: open && !s.hints[selRaw.id], hintUnlocked: open && !!s.hints[selRaw.id], hintText: open ? (selRaw.hint || 'Somewhere near you') : '',
      hintSheet: !!s.hint, hintOffer: s.hint === 'offer', hintWatching: s.hint === 'watching', hintDone: s.hint === 'done',
      hintAdText: 'full screen · ' + s.hintT + 's left', hintPct: ((5 - s.hintT) / 5 * 100) + '%',
      openHint: function () { if (!selRaw) return; self.setState({ hint: s.hints[selRaw.id] ? 'done' : 'offer' }); },
      startHint: function () {
        var id = selRaw.id; self.setState({ hint: 'watching', hintT: 5 }); clearInterval(self.ht);
        self.ht = setInterval(function () { var t = self.state.hintT - 1; if (t <= 0) { clearInterval(self.ht); var h = Object.assign({}, self.state.hints); h[id] = true; self.setState({ hintT: 0, hint: 'done', hints: h }); } else self.setState({ hintT: t }); }, 1000);
      },
      closeHint: function () { clearInterval(self.ht); self.setState({ hint: null, hintT: 0 }); },
      selBlocked: open && w >= 4,
      selHasMedia: open && !!selRaw.media, selMediaSrc: open && selRaw.mediaUrl ? selRaw.mediaUrl : '', selIsVideo: open && selRaw.media === 'video', selIsPhoto: open && selRaw.media !== 'video',
      mediaHidden: open && self.props.blurMedia !== false && !s.shown[s.openId], mediaCls: open && (self.props.blurMedia === false || s.shown[s.openId]) ? '' : 'blur',
      revealMedia: function () { var o = Object.assign({}, s.shown); o[s.openId] = true; self.setState({ shown: o }); },
      undoBlock: function () { self.props.undoBlock(s.openId); self.setState({ items: s.items.map(function (x) { return x.id === s.openId ? Object.assign({}, x, { warns: 3 }) : x; }) }); self.flash('undo'); },
      thread: thread, typing: s.typing, draft: s.draft,
      onDraft: function (e) { self.setState({ draft: e.target.value }); },
      sendReply: function () {
        var t = s.draft.trim(); if (!t || !selRaw || s.sendingReply) return;
        var id = selRaw.id;
        self.setState({ items: s.items.map(function (x) { return x.id === id ? Object.assign({}, x, { thread: x.thread.concat([{ me: true, text: t }]) }) : x; }), draft: '', sendingReply: true });
        self.props.sendChat({ chatId: id, text: t }).then(function (r) {
          if (r && r.ok) { self.setState({ sendingReply: false }); return; }
          self.setState({ sendingReply: false, draft: t, items: self.state.items.map(function (x) { return x.id === id ? Object.assign({}, x, { thread: x.thread.slice(0, -1) }) : x; }), toast: { t: 'Not sent', s: (r && r.error) || 'Try again.', i: GHOST } });
          clearTimeout(self.t4); self.t4 = setTimeout(function () { self.setState({ toast: null }); }, 3600);
        });
      },
      share: s.share, openShare: function () { self.setState({ share: true }); }, closeShare: function () { self.setState({ share: false }); },
      close: function () { self.setState({ openId: null, share: false }); },
      report: s.report, reported: !!r, notReported: !r,
      selWarns: w,
      reportIntro: w >= 4 ? 'This sender is already blocked from you.' : (selRaw && selRaw.acct ? who + ' gets a warning for each report. ' : 'This sender has no account; warnings stay on their device. ') + 'Reports so far: ' + w + ' of 4.',
      steps: [1, 2, 3, 4].map(function (i) { return { c: i <= w ? (i === 4 ? '#c4213a' : '#ffb020') : line }; }),
      reasons: reasons.map(function (c) { var on = s.picked === c && !s.other; return { label: c, on: on ? 'true' : 'false', pick: function () { self.setState({ picked: c, other: false }); } }; }),
      otherOn: s.other, pickOther: function () { self.setState({ other: true, picked: null }); },
      otherText: s.otherText, onOther: function (e) { self.setState({ otherText: e.target.value }); },
      shuffle: function () { self.setState({ seed: s.seed + 1, picked: null }); },
      cantReport: !(s.picked || (s.other && s.otherText.trim().length > 3)),
      submitReport: function () {
        var cat = s.other ? 'Other: ' + s.otherText.trim() : s.picked;
        if (s.reporting) return;
        var oid = s.openId;
        self.setState({ reporting: true });
        self.props.report(oid, cat).then(function (r) {
          if (!r || !r.ok) { self.setState({ reporting: false }); return; }
          if (r.support) { self.setState({ reporting: false, result: { support: true, cat: cat } }); return; }
          self.setState({ reporting: false, items: self.state.items.map(function (x) { return x.id === oid ? Object.assign({}, x, { warns: r.n }) : x; }), result: { n: r.n, cat: cat } });
        });
      },
      resultTitle: resultTitle, resultBody: resultBody, resultPreview: resultPreview, resultIcon: resultIcon,
      justBlocked: !!(r && r.n >= 4),
      undoBlockClose: function () { self.props.undoBlock(s.openId); self.setState({ items: s.items.map(function (x) { return x.id === s.openId ? Object.assign({}, x, { warns: 3 }) : x; }), report: false, result: null }); self.flash('undo'); },
      openReport: function () { self.setState({ report: true, result: null, picked: null, other: false, otherText: '', seed: s.seed + 1 }); },
      closeReport: function () { self.setState({ report: false, result: null }); },
      toast: !!s.toast,
      toastTitle: s.toast && s.toast.t ? s.toast.t : s.toast === 'undo' ? 'Block removed' : 'Someone sent you a message',
      toastSub: s.toast && s.toast.t ? s.toast.s : s.toast === 'undo' ? 'They can message you again. One more report blocks them again.' : 'on Rate me 1–10 · just now',
      toastIcon: s.toast && s.toast.t ? s.toast.i : s.toast === 'undo' ? '/sk/sparkles.png' : '/sk/love_letter.png'
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
        <div className="ib">
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
            <SkLink href="/inbox" className="nav-i" aria-current="page">
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
          <section className={v.listClass} aria-label="Messages">
            {" "}
            <div className="ib-pad" style={{ flex: "1", overflowY: "auto", padding: "16px 16px 110px" }}>
              {" "}
              <header className="topbar" style={{ paddingBottom: "0" }}>
                {" "}
                {v.inArchive ? (
                  <>
                  <button className="icon-btn tap" onClick={v.leaveArchive} aria-label="Back to inbox">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="M15 18 9 12l6-6" />
                    </svg>
                  </button>
                  </>
                ) : null}
                {" "}
                <h1 className="grow" style={{ fontSize: "30px" }}>
                  {v.listTitle}
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
                <button className="icon-btn tap" onClick={v.openListMenu} aria-label="More options" aria-haspopup="menu">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                    <circle cx="12" cy="5" r="2" />
                    <circle cx="12" cy="12" r="2" />
                    <circle cx="12" cy="19" r="2" />
                  </svg>
                </button>
                {" "}
              </header>
              {" "}
              {v.inArchive ? (
                <>
                <p className="muted" style={{ marginTop: "8px", fontSize: "13.5px" }}>
                  {v.archiveNote}
                </p>
                </>
              ) : null}
              {" "}
              {v.notArchive ? (
                <>
                <div>
                  {" "}
                  <SkLink href="/settings" className="pill" style={{ marginTop: "10px", textDecoration: "none" }}>
                    <img src="/sk/hourglass_not_done.png" alt="" style={{ width: "16px", height: "16px" }} />
                    Messages disappear after 1 day · change
                  </SkLink>
                  {" "}
                  <div className="rail" role="tablist" aria-label="Filter" style={{ display: "flex", gap: "8px", marginTop: "12px" }}>
                    {" "}
                    {(v.filters || []).map((f, i0) => (
                      <Fragment key={i0}>
                      <button role="tab" aria-selected={f.on} className={`chip tap ${f.cls}`} onClick={f.pick}>
                        {f.label}
                      </button>
                      </Fragment>
                    ))}
                    {" "}
                  </div>
                  {" "}
                  {v.showHoldTip ? (
                    <>
                    <p className="muted" style={{ marginTop: "10px", fontSize: "12.5px" }}>
                      Tip: hold a message to select a few at once.
                    </p>
                    </>
                  ) : null}
                  {" "}
                </div>
                </>
              ) : null}
              {" "}
              {(v.groups || []).map((g, i0) => (
                <Fragment key={i0}>
                {" "}
                <div style={{ marginTop: "18px" }}>
                  {" "}
                  <div className="row" style={{ gap: "8px", padding: "0 2px 8px" }}>
                    {" "}
                    <span className={g.th} style={{ width: "14px", height: "14px", borderRadius: "5px" }} />
                    {" "}
                    <span style={{ fontSize: "13px", fontWeight: "800" }}>
                      {g.title}
                    </span>
                    <span className="muted" style={{ fontSize: "13px" }}>
                      {"· "}{g.n}
                    </span>
                    {" "}
                  </div>
                  {" "}
                  <ul style={{ listStyle: "none", margin: "0", padding: "0", display: "flex", flexDirection: "column", gap: "6px" }}>
                    {" "}
                    {(g.items || []).map((m, i2) => (
                      <Fragment key={i2}>
                      {" "}
                      <li style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                        {" "}
                        <button className={`ib-row tap ${m.freshCls}`} onClick={m.tap} onPointerDown={m.press} onPointerUp={m.release} onPointerLeave={m.release} onContextMenu={m.ctx} aria-pressed={m.chosenStr} style={{ border: `1px solid ${m.line}`, background: m.bg, opacity: m.op }}>
                          {" "}
                          {m.selMode ? (
                            <>
                            <span className={`ib-check ${m.chkCls}`}>
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                                <path d="M20 6 9 17l-5-5" />
                              </svg>
                            </span>
                            </>
                          ) : null}
                          {" "}
                          <span className={`av ${m.avCls}`} style={{ background: m.avBg }}>
                            <img src={m.av} alt="" />
                          </span>
                          {" "}
                          <span style={{ flex: "1", minWidth: "0" }}>
                            {" "}
                            <span className="muted" style={{ display: "flex", gap: "6px", fontSize: "13px", alignItems: "center" }}>
                              <b style={{ color: "var(--ink)" }}>
                                {m.who}
                              </b>
                              {m.kindLabel}
                              {m.blocked ? (
                                <>
                                <span className="pill" style={{ padding: "2px 7px", fontSize: "10.5px", background: "#c4213a", color: "#ffffff" }}>
                                  Blocked
                                </span>
                                </>
                              ) : null}
                              {m.warned ? (
                                <>
                                <span className="pill" style={{ padding: "2px 7px", fontSize: "10.5px" }}>
                                  {m.warnLabel}
                                </span>
                                </>
                              ) : null}
                            </span>
                            {" "}
                            <span style={{ display: "block", marginTop: "2px", fontSize: "15px", fontWeight: m.weight, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", fontStyle: m.italic }}>
                              {m.preview}
                            </span>
                            {" "}
                          </span>
                          {" "}
                          <span style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "6px", flex: "none" }}>
                            {" "}
                            <span className="muted" style={{ fontSize: "12px" }}>
                              {m.ago}
                            </span>
                            {" "}
                            <span className="row" style={{ gap: "5px" }}>
                              {" "}
                              {m.unread ? (
                                <>
                                <span style={{ width: "9px", height: "9px", borderRadius: "50%", background: "#ff3b8d" }} />
                                </>
                              ) : null}
                              {" "}
                              <svg width="20" height="20" viewBox="0 0 24 24" role="img" aria-label={`Disappears in ${m.left}`}>
                                <circle cx="12" cy="12" r="9" fill="none" stroke={m.ringBg} strokeWidth="3" />
                                <circle cx="12" cy="12" r="9" fill="none" stroke={m.ringC} strokeWidth="3" strokeLinecap="round" strokeDasharray={`${m.dash} 57`} transform="rotate(-90 12 12)" />
                              </svg>
                              {" "}
                            </span>
                            {" "}
                          </span>
                          {" "}
                        </button>
                        {" "}
                      </li>
                      {" "}
                      {m.adAfter ? (
                        <>
                        {" "}
                        <li className="ad ad-feed">
                          <b>
                            In-feed native ad
                          </b>
                          full width × 108 · after every 5th message
                        </li>
                        {" "}
                        </>
                      ) : null}
                      {" "}
                      </Fragment>
                    ))}
                    {" "}
                  </ul>
                  {" "}
                </div>
                {" "}
                </Fragment>
              ))}
              {" "}
              {v.listEmpty ? (
                <>
                {" "}
                <div className="muted" style={{ textAlign: "center", padding: "48px 12px" }}>
                  <img src="/sk/locked_3d.png" alt="" style={{ width: "64px", height: "64px" }} />
                  <div style={{ marginTop: "8px", fontWeight: "800", color: "var(--ink)" }}>
                    {v.emptyTitle}
                  </div>
                  <div style={{ fontSize: "13.5px", marginTop: "4px" }}>
                    {v.emptyBody}
                  </div>
                </div>
                {" "}
                </>
              ) : null}
              {" "}
              {v.selMode ? (
                <>
                {" "}
                <div className="ib-selbar" role="toolbar" aria-label="Selected messages">
                  {" "}
                  <div className="row" style={{ gap: "8px" }}>
                    {" "}
                    <button className="icon-btn tap" onClick={v.cancelSel} aria-label="Cancel selection" style={{ width: "38px", height: "38px" }}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" aria-hidden="true">
                        <path d="M6 6l12 12M18 6 6 18" />
                      </svg>
                    </button>
                    {" "}
                    <b style={{ flex: "1", fontSize: "15px" }}>
                      {v.selCount}
                    </b>
                    {" "}
                    <button className="chip tap" onClick={v.selectAll} style={{ minHeight: "36px" }}>
                      {v.selAllLabel}
                    </button>
                    {" "}
                  </div>
                  {" "}
                  <div className="ib-acts">
                    {" "}
                    <SkLink href="/share" onClick={v.bulkStash} className="ib-act cta tap" aria-disabled={v.noShareStr} style={{ opacity: v.shareOp, pointerEvents: v.sharePe }}>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <path d="M12 20h9" />
                        <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z" />
                      </svg>
                      Edit in studio
                    </SkLink>
                    {" "}
                    <button className="ib-act tap" onClick={v.openQuick} disabled={!!(v.noShare)}>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <path d="M22 2 11 13" />
                        <path d="M22 2 15 22l-4-9-9-4 20-7z" />
                      </svg>
                      Post
                    </button>
                    {" "}
                    <button className="ib-act tap" onClick={v.bulkArchive} disabled={!!(v.noneChosen)}>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <rect x="3" y="4" width="18" height="5" rx="1" />
                        <path d="M5 9v10h14V9M10 13h4" />
                      </svg>
                      {v.archiveWord}
                    </button>
                    {" "}
                    <button className="ib-act bad tap" onClick={v.bulkDelete} disabled={!!(v.noneChosen)}>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <path d="M3 6h18M8 6V4h8v2M6 6l1 14h10l1-14" />
                      </svg>
                      Delete
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
            {v.listMenuOpen ? (
              <>
              {" "}
              <div className="ib-menu-wrap">
                <button className="ib-menu-scrim" onClick={v.closeMenu} aria-label="Close menu" />
                {" "}
                <div className="ib-menu" role="menu">
                  {" "}
                  {(v.listMenuItems || []).map((mi, i0) => (
                    <Fragment key={i0}>
                    <button role="menuitem" className={`tap ${mi.cls}`} onClick={mi.go}>
                      <span aria-hidden="true">
                        {mi.icon}
                      </span>
                      {mi.label}
                    </button>
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
          </section>
          {" "}
          <section className={v.detailClass} aria-label="Message">
            {" "}
            {v.empty ? (
              <>
              {" "}
              <div className="muted" style={{ flex: "1", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "10px", padding: "24px", textAlign: "center" }}>
                {" "}
                <img src="/sk/love_letter.png" alt="" style={{ width: "96px", height: "96px" }} />
                {" "}
                <div className="d" style={{ fontSize: "22px", fontWeight: "800", color: "var(--ink)" }}>
                  Pick a message
                </div>
                {" "}
                <div style={{ maxWidth: "32ch" }}>
                  Read it, reply in a chat, or share it to your story.
                </div>
                {" "}
              </div>
              {" "}
              </>
            ) : null}
            {" "}
            {v.hasSel ? (
              <>
              {" "}
              <div style={{ flex: "1", display: "flex", flexDirection: "column", minHeight: "0" }}>
                {" "}
                <header className="row" style={{ gap: "10px", padding: "12px 14px", borderBottom: "1px solid var(--line)" }}>
                  {" "}
                  <button className="ib-back icon-btn tap" onClick={v.close} aria-label="Back to inbox">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="M15 18 9 12l6-6" />
                    </svg>
                  </button>
                  {" "}
                  <span className={`av ${v.sel.avCls}`} style={{ width: "40px", height: "40px", borderRadius: "14px", background: v.sel.avBg }}>
                    <img src={v.sel.av} alt="" />
                  </span>
                  {" "}
                  <div style={{ flex: "1", minWidth: "0" }}>
                    <b style={{ fontSize: "16px" }}>
                      {v.sel.who}
                    </b>
                    <div className="muted" style={{ fontSize: "12.5px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                      {v.sel.sub}
                    </div>
                  </div>
                  {" "}
                  <button className="btn btn-sm tap" onClick={v.openHint} aria-label="Get a hint about who sent this" style={{ gap: "6px" }}>
                    {" "}
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <rect x="5" y="11" width="14" height="10" rx="2" />
                      <path d="M8 11V7a4 4 0 0 1 8 0v4" />
                    </svg>
                    {v.hintBtn}{" "}
                  </button>
                  {" "}
                  <button className="icon-btn tap" onClick={v.openItemMenu} aria-label="More options for this conversation" aria-haspopup="menu">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                      <circle cx="12" cy="5" r="2" />
                      <circle cx="12" cy="12" r="2" />
                      <circle cx="12" cy="19" r="2" />
                    </svg>
                  </button>
                  {" "}
                </header>
                {" "}
                {v.selBlocked ? (
                  <>
                  {" "}
                  <div className="row" style={{ gap: "10px", padding: "10px 14px", background: "rgba(196,33,58,.12)", borderBottom: "1px solid var(--line)", fontSize: "13.5px" }}>
                    {" "}
                    <span style={{ flex: "1" }}>
                      <b>
                        {v.sel.who}{" can’t message you anymore."}
                      </b>
                      {" Reported 4 times."}
                    </span>
                    {" "}
                    <button className="btn btn-sm tap" onClick={v.undoBlock}>
                      Undo
                    </button>
                    {" "}
                  </div>
                  {" "}
                  </>
                ) : null}
                {" "}
                {v.selOne ? (
                  <>
                  {" "}
                  <div className="rise" style={{ flex: "1", overflowY: "auto", padding: "18px 16px 24px", display: "flex", flexDirection: "column", alignItems: "center" }}>
                    {" "}
                    {v.selHeld ? (
                      <>
                      {" "}
                      <div className="card" style={{ width: "100%", maxWidth: "460px", marginBottom: "12px", padding: "14px", borderColor: "rgba(255,176,32,.45)", background: "rgba(255,176,32,.08)" }}>
                        {" "}
                        <div className="row" style={{ gap: "10px", alignItems: "flex-start" }}>
                          {" "}
                          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={{ color: "var(--warn)", flex: "none", marginTop: "2px" }}>
                            <path d="M12 3 4 6v6c0 5 3.5 8 8 9 4.5-1 8-4 8-9V6z" />
                          </svg>
                          {" "}
                          <span style={{ flex: "1", fontSize: "13.5px", lineHeight: "1.45" }}>
                            <b>
                              {"Kind mode held this · "}{v.heldReason}
                            </b>
                            <br />
                            <span className="muted">
                              It never pinged you. Look only if you want to.
                            </span>
                          </span>
                          {" "}
                        </div>
                        {" "}
                        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: "8px", marginTop: "12px" }}>
                          {" "}
                          <button className="btn btn-sm tap" onClick={v.toggleHeldShow}>
                            {v.heldShowLabel}
                          </button>
                          {" "}
                          <button className="btn btn-sm tap" onClick={v.releaseHeld}>
                            Not mean
                          </button>
                          {" "}
                          <button className="btn btn-sm btn-danger tap" onClick={v.openReport}>
                            Report
                          </button>
                          {" "}
                        </div>
                        {" "}
                      </div>
                      {" "}
                      </>
                    ) : null}
                    {" "}
                    <div className={v.sel.th} style={{ width: "100%", maxWidth: "460px", borderRadius: "30px", padding: "22px", minHeight: "300px", display: "flex", flexDirection: "column", filter: v.selBlur, transition: "filter .3s" }}>
                      {" "}
                      <div style={{ fontSize: "13px", fontWeight: "800", letterSpacing: ".06em", textTransform: "uppercase", opacity: ".85" }}>
                        {v.sel.topic}
                      </div>
                      {" "}
                      {v.selHasMedia ? (
                        <>
                        {" "}
                        <div className={`media ${v.mediaCls}`} style={{ marginTop: "14px", height: "230px" }}>
                          {" "}
                          {v.selIsVideo ? (
                            <>
                            <video src={v.selMediaSrc} controls={true} preload="metadata" />
                            </>
                          ) : null}
                          {" "}
                          {v.selIsPhoto ? (
                            <>
                            <img src={v.selMediaSrc} alt="Photo sent anonymously" />
                            </>
                          ) : null}
                          {" "}
                          <span className="media-tag">
                            {v.sel.mediaTag}
                          </span>
                          {" "}
                          {v.mediaHidden ? (
                            <>
                            {" "}
                            <button className="media-cover" onClick={v.revealMedia}>
                              {" "}
                              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                                <path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12z" />
                                <circle cx="12" cy="12" r="3" />
                              </svg>
                              {" Tap to view "}
                              <span style={{ fontSize: "12px", fontWeight: "600", opacity: ".85" }}>
                                Blurred because it’s from someone anonymous
                              </span>
                              {" "}
                            </button>
                            {" "}
                            </>
                          ) : null}
                          {" "}
                        </div>
                        {" "}
                        </>
                      ) : null}
                      {" "}
                      {v.selPlain ? (
                        <>
                        {" "}
                        <p className={v.pageCls} style={{ marginTop: "16px", fontSize: v.pageFs, fontWeight: v.pageW, letterSpacing: v.pageLs, lineHeight: v.pageLh }}>
                          {v.pageText}
                        </p>
                        {" "}
                        </>
                      ) : null}
                      {" "}
                      {v.selRate ? (
                        <>
                        {" "}
                        <div>
                          {" "}
                          <div style={{ marginTop: "14px", display: "flex", alignItems: "flex-end", gap: "12px" }}>
                            {" "}
                            <span className="d pop" style={{ fontSize: "104px", fontWeight: "800", lineHeight: ".82", letterSpacing: "-.06em" }}>
                              {v.rateN}
                            </span>
                            {" "}
                            <span style={{ paddingBottom: "6px" }}>
                              <b style={{ fontSize: "22px", opacity: ".8" }}>
                                /10
                              </b>
                              <br />
                              <span className="pill" style={{ marginTop: "6px", background: "rgba(0,0,0,.25)", color: "inherit" }}>
                                {v.rateCat}
                              </span>
                            </span>
                            {" "}
                            <img className="float" src={v.rateEmoji} alt="" style={{ marginLeft: "auto", width: "64px", height: "64px" }} />
                            {" "}
                          </div>
                          {" "}
                          {v.hasRateWhy ? (
                            <>
                            <p className="d" style={{ marginTop: "14px", fontSize: "22px", fontWeight: "800", lineHeight: "1.2" }}>
                              “{v.rateWhy}”
                            </p>
                            </>
                          ) : null}
                          {" "}
                        </div>
                        {" "}
                        </>
                      ) : null}
                      {" "}
                      {v.selQuiz ? (
                        <>
                        {" "}
                        <div>
                          {" "}
                          <div style={{ display: "flex", alignItems: "center", gap: "14px", marginTop: "12px" }}>
                            {" "}
                            <span className="d pop" style={{ fontSize: "64px", fontWeight: "800", lineHeight: ".9", letterSpacing: "-.04em" }}>
                              {v.quizScore}
                            </span>
                            {" "}
                            <span>
                              <b style={{ fontSize: "18px" }}>
                                {v.quizVerdict}
                              </b>
                              <br />
                              <span style={{ fontSize: "13px", opacity: ".85" }}>
                                {v.quizRankText}
                              </span>
                            </span>
                            {" "}
                          </div>
                          {" "}
                          <div style={{ marginTop: "12px", display: "flex", flexDirection: "column", gap: "6px" }}>
                            {" "}
                            {(v.quizRows || []).map((qr, i0) => (
                              <Fragment key={i0}>
                              {" "}
                              <div style={{ display: "flex", alignItems: "center", gap: "10px", padding: "8px 10px", borderRadius: "14px", background: "rgba(0,0,0,.2)", fontSize: "13.5px" }}>
                                {" "}
                                <span style={{ width: "24px", height: "24px", borderRadius: "50%", display: "grid", placeItems: "center", flex: "none", fontWeight: "900", background: qr.bg, color: "#10220f" }}>
                                  {qr.mark}
                                </span>
                                {" "}
                                <span style={{ flex: "1", minWidth: "0" }}>
                                  <span style={{ display: "block", opacity: ".8", fontSize: "12px" }}>
                                    {qr.q}
                                  </span>
                                  <b>
                                    {qr.a}
                                  </b>
                                  <span style={{ opacity: ".8" }}>
                                    {qr.fix}
                                  </span>
                                </span>
                                {" "}
                              </div>
                              {" "}
                              </Fragment>
                            ))}
                            {" "}
                          </div>
                          {" "}
                          {v.hasQuizNote ? (
                            <>
                            <p style={{ marginTop: "12px", fontSize: "16px", fontWeight: "700" }}>
                              {v.quizNoteText}
                            </p>
                            </>
                          ) : null}
                          {" "}
                        </div>
                        {" "}
                        </>
                      ) : null}
                      {" "}
                      {v.selPaged ? (
                        <>
                        {" "}
                        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "16px" }}>
                          {" "}
                          <button className="icon-btn tap" onClick={v.pagePrev} disabled={!!(v.atFirst)} aria-label="Previous card" style={{ width: "42px", height: "42px", border: "0", background: "rgba(0,0,0,.24)", color: "inherit", opacity: v.prevOp }}>
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                              <path d="M15 18 9 12l6-6" />
                            </svg>
                          </button>
                          {" "}
                          <div style={{ flex: "1", display: "flex", justifyContent: "center", alignItems: "center", gap: "5px" }}>
                            {(v.pageDots || []).map((pd, i0) => (
                              <Fragment key={i0}>
                              <span style={{ width: pd.w, height: "7px", borderRadius: "7px", background: pd.c, transition: "width .25s" }} />
                              </Fragment>
                            ))}
                          </div>
                          {" "}
                          <span style={{ fontSize: "13px", fontWeight: "800", minWidth: "38px", textAlign: "center" }}>
                            {v.pageNo}
                          </span>
                          {" "}
                          <button className="icon-btn tap" onClick={v.pageNext} disabled={!!(v.atLast)} aria-label="Next card" style={{ width: "42px", height: "42px", border: "0", background: "rgba(255,255,255,.9)", color: "#211a2c", opacity: v.nextOp }}>
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                              <path d="m9 18 6-6-6-6" />
                            </svg>
                          </button>
                          {" "}
                        </div>
                        {" "}
                        </>
                      ) : null}
                      {" "}
                      {v.selHasSenderHint ? (
                        <>
                        {" "}
                        <span style={{ alignSelf: "flex-start", display: "inline-flex", alignItems: "center", gap: "6px", marginTop: "16px", padding: "7px 11px", borderRadius: "99px", background: "rgba(255,255,255,.92)", color: "#2a0a1c", fontSize: "13px", fontWeight: "800" }}>
                          {" "}
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" aria-hidden="true">
                            <circle cx="11" cy="11" r="7" />
                            <path d="m20 20-3.5-3.5" />
                          </svg>
                          {"Their hint: "}{v.senderHint}{" "}
                        </span>
                        {" "}
                        </>
                      ) : null}
                      {" "}
                      <div style={{ marginTop: "auto", paddingTop: "18px", display: "flex", justifyContent: "space-between", fontSize: "13px", opacity: ".9" }}>
                        <span>
                          {"anonymous · "}{v.sel.ago}
                        </span>
                        <span>
                          {"gone in "}{v.sel.left}
                        </span>
                      </div>
                      {" "}
                    </div>
                    {" "}
                    <div style={{ width: "100%", maxWidth: "460px", marginTop: "14px", display: "flex", flexDirection: "column", gap: "8px" }}>
                      {" "}
                      {v.selAma ? (
                        <>
                        {" "}
                        <div>
                          <label htmlFor="ama-ans" className="label">
                            Your answer
                          </label>
                          <textarea id="ama-ans" className="field" value={v.amaAnswer ?? ""} onChange={v.onAma} maxLength="200" placeholder="Answer it, then share both to your story" style={{ minHeight: "84px" }} />
                        </div>
                        {" "}
                        </>
                      ) : null}
                      {" "}
                      {v.selPaged ? (
                        <>
                        <div className="muted" style={{ fontSize: "13px", textAlign: "center" }}>
                          {"Long message · "}{v.pageCount}{" cards · Share sends all "}{v.pageCount}, numbered in order
                        </div>
                        </>
                      ) : null}
                      {" "}
                      <SkLink href="/share" onClick={v.shareStash} className="btn btn-cta btn-lg btn-block tap" style={{ gap: "8px" }}>
                        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                          <path d="M4 12v7a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-7" />
                          <path d="M16 6l-4-4-4 4" />
                          <path d="M12 2v13" />
                        </svg>
                        {v.shareLabel}
                      </SkLink>
                      {" "}
                      {v.canReply ? (
                        <>
                        {" "}
                        <button className="btn btn-lg btn-block tap" onClick={v.replyPrivately} style={{ gap: "8px" }}>
                          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                            <path d="M21 12a8 8 0 0 1-11.6 7.1L4 21l1.9-5.4A8 8 0 1 1 21 12z" />
                          </svg>
                          {v.replyLabel}
                        </button>
                        {" "}
                        </>
                      ) : null}
                      {" "}
                      {v.noReply ? (
                        <>
                        <div className="muted" style={{ fontSize: "13px", textAlign: "center", lineHeight: "1.45" }}>
                          They didn’t turn on replies, so you can’t answer privately.
                          <br />
                          Share it to your story instead.
                        </div>
                        </>
                      ) : null}
                      {" "}
                      {v.canReact ? (
                        <>
                        {" "}
                        <div className="card" style={{ padding: "12px 14px" }}>
                          {" "}
                          <div className="row" style={{ justifyContent: "space-between" }}>
                            <b style={{ fontSize: "14.5px" }}>
                              React
                            </b>
                            <span className="muted" style={{ fontSize: "12.5px" }}>
                              {v.reactNote}
                            </span>
                          </div>
                          {" "}
                          <div style={{ display: "grid", gridTemplateColumns: "repeat(5, minmax(0, 1fr))", gap: "8px", marginTop: "10px" }}>
                            {" "}
                            {(v.reacts || []).map((rx, i0) => (
                              <Fragment key={i0}>
                              {" "}
                              <button className="tap" onClick={rx.pick} aria-pressed={rx.on} aria-label={rx.name} style={{ aspectRatio: "1", borderRadius: "16px", border: `2px solid ${rx.ring}`, background: rx.bg, display: "grid", placeItems: "center", padding: "0" }}>
                                <img src={rx.icon} alt="" style={{ width: "58%", height: "58%" }} />
                              </button>
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
                      {v.canGuess ? (
                        <>
                        {" "}
                        <div className="card" style={{ padding: "12px 14px" }}>
                          {" "}
                          <div className="row" style={{ gap: "10px" }}>
                            {" "}
                            <img src="/sk/eyes.png" alt="" style={{ width: "30px", height: "30px", flex: "none" }} />
                            {" "}
                            <span style={{ flex: "1", fontSize: "13.5px", lineHeight: "1.4" }}>
                              <b>
                                Guess who
                              </b>
                              {" "}
                              <span className="muted">
                                {v.guessSub}
                              </span>
                            </span>
                            {" "}
                            {v.guessIdle ? (
                              <>
                              <button className="btn btn-sm btn-cta tap" onClick={v.openGuess} disabled={!!(v.guessOut)}>
                                Guess
                              </button>
                              </>
                            ) : null}
                            {" "}
                          </div>
                          {" "}
                          {v.guessPending ? (
                            <>
                            <div className="row pop" style={{ marginTop: "10px", gap: "8px", fontSize: "13.5px" }}>
                              <span className="live" style={{ width: "9px", height: "9px", borderRadius: "50%", background: "#ffb020" }} />
                              {"You guessed "}
                              <b>
                                @{v.guessName}
                              </b>
                              . Waiting for them to decide…
                            </div>
                            </>
                          ) : null}
                          {" "}
                          {v.guessYes ? (
                            <>
                            <div className="pop" style={{ marginTop: "10px", padding: "10px 12px", borderRadius: "14px", background: "linear-gradient(135deg,#22b36f,#127a80)", color: "#ffffff", fontSize: "14px" }}>
                              <b>
                                It was @{v.guessName}.
                              </b>
                              {" They chose to reveal."}
                            </div>
                            </>
                          ) : null}
                          {" "}
                          {v.guessNo ? (
                            <>
                            <div className="pop" style={{ marginTop: "10px", fontSize: "13.5px" }}>
                              <b>
                                Not confirmed.
                              </b>
                              {" "}
                              <span className="muted">
                                Wrong guess, or they’re keeping the mystery.
                              </span>
                              {" "}
                              <button className="pink tap" onClick={v.guessAgain} style={{ border: "0", background: "transparent", fontWeight: "800", padding: "0", minHeight: "32px" }}>
                                Guess again
                              </button>
                            </div>
                            </>
                          ) : null}
                          {" "}
                        </div>
                        {" "}
                        </>
                      ) : null}
                      {" "}
                      <div className="card row" style={{ padding: "12px 14px", gap: "10px" }}>
                        {" "}
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={{ color: "var(--pink)", flex: "none" }}>
                          <rect x="5" y="11" width="14" height="10" rx="2" />
                          <path d="M8 11V7a4 4 0 0 1 8 0v4" />
                        </svg>
                        {" "}
                        {v.hintLocked ? (
                          <>
                          <span style={{ flex: "1", fontSize: "13px", lineHeight: "1.4" }}>
                            <b>
                              Curious who sent it?
                            </b>
                            {" "}
                            <span className="muted">
                              Watch a short ad for one vague clue, like “Lagos, late at night”. Never a name.
                            </span>
                          </span>
                          </>
                        ) : null}
                        {" "}
                        {v.hintLocked ? (
                          <>
                          <button className="btn btn-sm tap" onClick={v.openHint}>
                            Get hint
                          </button>
                          </>
                        ) : null}
                        {" "}
                        {v.hintUnlocked ? (
                          <>
                          <span style={{ flex: "1", fontSize: "13.5px", lineHeight: "1.4" }}>
                            <b>
                              Hint:
                            </b>
                            {" "}{v.hintText}
                          </span>
                          </>
                        ) : null}
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
                {v.selChat ? (
                  <>
                  {" "}
                  <div style={{ flex: "1", display: "flex", flexDirection: "column", minHeight: "0" }}>
                    {" "}
                    <div style={{ flex: "1", overflowY: "auto", padding: "16px", display: "flex", flexDirection: "column", gap: "8px" }}>
                      {" "}
                      <div className="muted" style={{ alignSelf: "center", textAlign: "center", fontSize: "12.5px", maxWidth: "34ch", padding: "6px 0 10px" }}>
                        {v.chatIntro}
                      </div>
                      {" "}
                      {(v.thread || []).map((b, i0) => (
                        <Fragment key={i0}>
                        {" "}
                        <div className={`rise ib-bub ${b.selCls}`} style={{ alignSelf: b.align, maxWidth: "78%" }} onClick={b.tap} onPointerDown={b.press} onPointerUp={b.release} onPointerLeave={b.release} onContextMenu={b.ctx}>
                          {" "}
                          {b.showChk ? (
                            <>
                            <span className={`ib-check ${b.chkCls}`}>
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                                <path d="M20 6 9 17l-5-5" />
                              </svg>
                            </span>
                            </>
                          ) : null}
                          {" "}
                          {b.isMedia ? (
                            <>
                            {" "}
                            <div className={`media ${b.mediaCls}`} style={{ width: "220px", height: "150px", borderRadius: "20px" }}>
                              {" "}
                              {b.isVideo ? (
                                <>
                                <video src={b.src} controls={true} preload="metadata" />
                                </>
                              ) : null}
                              {b.isPhoto ? (
                                <>
                                <img src={b.src} alt={b.alt} />
                                </>
                              ) : null}
                              {" "}
                              <span className="media-tag">
                                {b.tag}
                              </span>
                              {" "}
                              {b.hidden ? (
                                <>
                                <button className="media-cover" onClick={b.reveal} style={{ fontSize: "13px" }}>
                                  {b.cover}
                                </button>
                                </>
                              ) : null}
                              {" "}
                            </div>
                            {" "}
                            </>
                          ) : null}
                          {" "}
                          {b.isText ? (
                            <>
                            {" "}
                            <div className="ib-btext" style={{ padding: "11px 14px", borderRadius: b.radius, background: b.bg, color: b.ink, border: `1px ${b.border}`, fontSize: "15px", lineHeight: "1.4", fontStyle: b.style }}>
                              {b.text}
                            </div>
                            {" "}
                            </>
                          ) : null}
                          {" "}
                        </div>
                        {" "}
                        </Fragment>
                      ))}
                      {" "}
                      {v.typing ? (
                        <>
                        {" "}
                        <div aria-label="typing" style={{ alignSelf: "flex-start", padding: "12px 16px", borderRadius: "20px 20px 20px 6px", background: "var(--card2)", display: "flex", gap: "5px" }}>
                          {" "}
                          <span className="blink" style={{ width: "7px", height: "7px", borderRadius: "50%", background: "var(--ink)" }} />
                          <span className="blink2" style={{ width: "7px", height: "7px", borderRadius: "50%", background: "var(--ink)" }} />
                          <span className="blink3" style={{ width: "7px", height: "7px", borderRadius: "50%", background: "var(--ink)" }} />
                          {" "}
                        </div>
                        {" "}
                        </>
                      ) : null}
                      {" "}
                    </div>
                    {" "}
                    {v.chatSelMode ? (
                      <>
                      {" "}
                      <div style={{ padding: "10px 12px 14px", borderTop: "1px solid var(--line)" }}>
                        {" "}
                        <div className="row" style={{ gap: "8px" }}>
                          {" "}
                          <button className="icon-btn tap" onClick={v.cancelChatSel} aria-label="Cancel selection" style={{ width: "38px", height: "38px" }}>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" aria-hidden="true">
                              <path d="M6 6l12 12M18 6 6 18" />
                            </svg>
                          </button>
                          {" "}
                          <b style={{ flex: "1", fontSize: "15px" }}>
                            {v.chatSelCount}
                          </b>
                          {" "}
                        </div>
                        {" "}
                        <div className="ib-acts" style={{ gridTemplateColumns: "repeat(3, minmax(0, 1fr))" }}>
                          {" "}
                          <SkLink href="/share" onClick={v.chatStash} className="ib-act cta tap" style={{ opacity: v.chatShareOp, pointerEvents: v.chatSharePe }}>
                            Edit in studio
                          </SkLink>
                          {" "}
                          <button className="ib-act tap" onClick={v.chatQuick} disabled={!!(v.chatNoPublic)}>
                            Post theirs
                          </button>
                          {" "}
                          <button className="ib-act bad tap" onClick={v.chatDelete} disabled={!!(v.chatNone)}>
                            Delete for me
                          </button>
                          {" "}
                        </div>
                        {" "}
                        <p className="muted" style={{ marginTop: "8px", fontSize: "12px" }}>
                          Your own messages go to friends in the app only, never to public stories.
                        </p>
                        {" "}
                      </div>
                      {" "}
                      </>
                    ) : null}
                    {" "}
                    {v.notChatSel ? (
                      <>
                      {" "}
                      <div className="row" style={{ gap: "8px", padding: "10px 12px 14px", borderTop: "1px solid var(--line)" }}>
                        {" "}
                        <label className="icon-btn tap" aria-label="Attach photo or video" style={{ width: "52px", height: "52px", cursor: "pointer" }}>
                          <input type="file" accept="image/*,video/*" onChange={v.attachChat} className="sr" />
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                            <rect x="3" y="5" width="18" height="14" rx="2" />
                            <circle cx="9" cy="10" r="2" />
                            <path d="m21 16-5-5-9 8" />
                          </svg>
                        </label>
                        {" "}
                        <label htmlFor="chat-input" className="sr">
                          Reply anonymously
                        </label>
                        {" "}
                        <input id="chat-input" className="field" value={v.draft ?? ""} onChange={v.onDraft} placeholder="Reply anonymously…" style={{ flex: "1", minWidth: "0" }} />
                        {" "}
                        <button className="icon-btn tap" onClick={v.sendReply} aria-label="Send" style={{ width: "52px", height: "52px", border: "0", background: "var(--cta)", color: "#ffffff" }}>
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                            <path d="M22 2 11 13" />
                            <path d="M22 2 15 22l-4-9-9-4 20-7z" />
                          </svg>
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
              </>
            ) : null}
            {" "}
            {v.itemMenuOpen ? (
              <>
              {" "}
              <div className="ib-menu-wrap">
                <button className="ib-menu-scrim" onClick={v.closeMenu} aria-label="Close menu" />
                {" "}
                <div className="ib-menu" role="menu">
                  {" "}
                  {(v.itemMenuItems || []).map((mi, i0) => (
                    <Fragment key={i0}>
                    <button role="menuitem" className={`tap ${mi.cls}`} onClick={mi.go}>
                      <span aria-hidden="true">
                        {mi.icon}
                      </span>
                      {mi.label}
                    </button>
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
          </section>
          {" "}
        </div>
        {" "}
        <nav className={v.navClass} aria-label="Main">
          {" "}
          <SkLink href="/home">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M3 11 12 3l9 8" />
              <path d="M5 10v10h14V10" />
            </svg>
            Home
          </SkLink>
          {" "}
          <SkLink href="/inbox" aria-current="page">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
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
        {v.report ? (
          <>
          {" "}
          <div className="scrim">
            {" "}
            <div className="sheet" role="dialog" aria-label="Report this message">
              {" "}
              {v.notReported ? (
                <>
                {" "}
                <div>
                  {" "}
                  <h2 style={{ fontSize: "22px" }}>
                    Why are you reporting this?
                  </h2>
                  {" "}
                  <p className="muted" style={{ marginTop: "6px", fontSize: "14px", lineHeight: "1.45" }}>
                    {v.reportIntro}
                  </p>
                  {" "}
                  <div className="warn-steps" style={{ marginTop: "12px" }} aria-label={`${v.selWarns} of 4 reports`}>
                    {" "}
                    {(v.steps || []).map((st, i0) => (
                      <Fragment key={i0}>
                      <span style={{ background: st.c }} />
                      </Fragment>
                    ))}
                    {" "}
                  </div>
                  {" "}
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginTop: "14px" }}>
                    {" "}
                    {(v.reasons || []).map((r, i0) => (
                      <Fragment key={i0}>
                      <button className="reason tap" onClick={r.pick} aria-pressed={r.on}>
                        {r.label}
                      </button>
                      </Fragment>
                    ))}
                    {" "}
                    <button className="reason tap" onClick={v.pickOther} aria-pressed={v.otherOn} style={{ borderStyle: "dashed", color: "var(--pink)" }}>
                      Other reason
                    </button>
                    {" "}
                  </div>
                  {" "}
                  <button className="btn btn-ghost btn-sm" onClick={v.shuffle} style={{ border: "0", marginTop: "6px", color: "var(--muted)" }}>
                    Show different reasons
                  </button>
                  {" "}
                  {v.otherOn ? (
                    <>
                    {" "}
                    <textarea className="field" value={v.otherText ?? ""} onChange={v.onOther} placeholder="Tell us what happened" aria-label="Other reason" style={{ minHeight: "80px", marginTop: "6px" }} />
                    {" "}
                    </>
                  ) : null}
                  {" "}
                  <button className="btn btn-ink btn-lg btn-block tap" onClick={v.submitReport} disabled={!!(v.cantReport)} style={{ marginTop: "14px" }}>
                    Report
                  </button>
                  {" "}
                  <button className="btn btn-ghost btn-block" onClick={v.closeReport} style={{ marginTop: "6px", border: "0" }}>
                    Cancel
                  </button>
                  {" "}
                </div>
                {" "}
                </>
              ) : null}
              {" "}
              {v.reported ? (
                <>
                {" "}
                <div style={{ textAlign: "center", padding: "6px 0" }}>
                  {" "}
                  <img className="pop" src={v.resultIcon} alt="" style={{ width: "64px", height: "64px" }} />
                  {" "}
                  <h2 style={{ fontSize: "22px", marginTop: "8px" }}>
                    {v.resultTitle}
                  </h2>
                  {" "}
                  <p className="muted" style={{ marginTop: "6px", fontSize: "14.5px", lineHeight: "1.5" }}>
                    {v.resultBody}
                  </p>
                  {" "}
                  <div className="card" style={{ marginTop: "12px", padding: "12px 14px", textAlign: "left", background: "var(--card2)" }}>
                    {" "}
                    <div className="muted" style={{ fontSize: "11.5px", fontWeight: "800", letterSpacing: ".08em", textTransform: "uppercase" }}>
                      What they see
                    </div>
                    {" "}
                    <p style={{ marginTop: "6px", fontSize: "14px", lineHeight: "1.45" }}>
                      {v.resultPreview}
                    </p>
                    {" "}
                  </div>
                  {" "}
                  <div className="row" style={{ gap: "8px", marginTop: "14px" }}>
                    {" "}
                    {v.justBlocked ? (
                      <>
                      <button className="btn btn-lg tap" onClick={v.undoBlockClose} style={{ flex: "1" }}>
                        Undo block
                      </button>
                      </>
                    ) : null}
                    {" "}
                    <button className="btn btn-ink btn-lg tap" onClick={v.closeReport} style={{ flex: "1" }}>
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
            <div className="sheet" role="dialog" aria-label="Delete">
              {" "}
              <h2 style={{ fontSize: "22px" }}>
                {v.delTitle}
              </h2>
              {" "}
              <p className="muted" style={{ marginTop: "6px", fontSize: "14.5px", lineHeight: "1.5" }}>
                {v.delBody}
              </p>
              {" "}
              <button className="btn btn-lg btn-block tap" onClick={v.confirmDel} style={{ marginTop: "14px", background: "#c4213a", color: "#ffffff", border: "0" }}>
                Delete
              </button>
              {" "}
              <button className="btn btn-ghost btn-block" onClick={v.cancelDel} style={{ marginTop: "6px", border: "0" }}>
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
        {v.quickOpen ? (
          <>
          {" "}
          <div className="scrim">
            {" "}
            <div className="sheet" role="dialog" aria-label="Post">
              {" "}
              {v.quickPick ? (
                <>
                {" "}
                <div>
                  {" "}
                  <div className="row">
                    <h2 style={{ flex: "1", fontSize: "21px" }}>
                      {v.quickTitle}
                    </h2>
                    <button className="icon-btn tap" onClick={v.closeQuick} aria-label="Close">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" aria-hidden="true">
                        <path d="M6 6l12 12M18 6 6 18" />
                      </svg>
                    </button>
                  </div>
                  {" "}
                  <p className="muted" style={{ marginTop: "4px", fontSize: "13.5px" }}>
                    {v.quickSub}
                  </p>
                  {" "}
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: "8px", marginTop: "14px" }}>
                    {" "}
                    {(v.quickDests || []).map((qd, i0) => (
                      <Fragment key={i0}>
                      <button className="btn btn-lg tap" onClick={qd.go} style={{ background: qd.bg, color: qd.ink, border: "0" }}>
                        {qd.name}
                      </button>
                      </Fragment>
                    ))}
                    {" "}
                  </div>
                  {" "}
                  <SkLink href="/share" onClick={v.bulkStashFromQuick} className="btn btn-ghost btn-block tap" style={{ marginTop: "10px", border: "0" }}>
                    Edit the cards first
                  </SkLink>
                  {" "}
                </div>
                {" "}
                </>
              ) : null}
              {" "}
              {v.quickRun ? (
                <>
                {" "}
                <div>
                  {" "}
                  <h2 style={{ fontSize: "21px" }}>
                    {v.quickRunTitle}
                  </h2>
                  {" "}
                  <div style={{ marginTop: "10px", maxHeight: "260px", overflowY: "auto" }}>
                    {" "}
                    {(v.quickSteps || []).map((qs, i0) => (
                      <Fragment key={i0}>
                      {" "}
                      <div className="row" style={{ gap: "10px", padding: "7px 0", fontSize: "14px" }}>
                        <span style={{ width: "28px", height: "28px", borderRadius: "10px", display: "grid", placeItems: "center", flex: "none", fontWeight: "800", background: qs.bg, color: qs.ink }}>
                          {qs.mark}
                        </span>
                        <span style={{ flex: "1", minWidth: "0", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                          {qs.label}
                        </span>
                      </div>
                      {" "}
                      </Fragment>
                    ))}
                    {" "}
                  </div>
                  {" "}
                  {v.quickDone ? (
                    <>
                    <div className="ad" style={{ width: "100%", maxWidth: "320px", height: "100px", margin: "12px auto 0" }}>
                      <b>
                        Banner ad
                      </b>
                      320 × 100 · after posting
                    </div>
                    </>
                  ) : null}
                  {" "}
                  <button className="btn btn-ink btn-lg btn-block tap" onClick={v.closeQuick} style={{ marginTop: "12px" }}>
                    {v.quickBtn}
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
        {v.hintSheet ? (
          <>
          {" "}
          <div className="scrim">
            {" "}
            <div className="sheet" role="dialog" aria-label="Unlock a hint">
              {" "}
              {v.hintOffer ? (
                <>
                {" "}
                <div style={{ textAlign: "center" }}>
                  {" "}
                  <img className="pop" src="/sk/locked_3d.png" alt="" style={{ width: "64px", height: "64px" }} />
                  {" "}
                  <h2 style={{ fontSize: "22px", marginTop: "8px" }}>
                    Unlock a hint
                  </h2>
                  {" "}
                  <p className="muted" style={{ marginTop: "6px", fontSize: "14.5px", lineHeight: "1.5" }}>
                    Watch a short ad and we’ll show one vague clue about who sent this. Never a name, number or exact place.
                  </p>
                  {" "}
                  <button className="btn btn-cta btn-lg btn-block tap" onClick={v.startHint} style={{ marginTop: "16px" }}>
                    Watch ad · 5 sec
                  </button>
                  {" "}
                  <button className="btn btn-ghost btn-block" onClick={v.closeHint} style={{ marginTop: "6px", border: "0" }}>
                    Not now
                  </button>
                  {" "}
                </div>
                {" "}
                </>
              ) : null}
              {" "}
              {v.hintWatching ? (
                <>
                {" "}
                <div>
                  {" "}
                  <div className="ad" style={{ height: "210px", margin: "0", borderRadius: "18px" }}>
                    <b>
                      Rewarded video ad
                    </b>
                    {v.hintAdText}
                  </div>
                  {" "}
                  <div style={{ height: "6px", borderRadius: "6px", background: "var(--card2)", marginTop: "12px", overflow: "hidden" }}>
                    <span style={{ display: "block", height: "100%", width: v.hintPct, background: "var(--cta)", transition: "width 1s linear" }} />
                  </div>
                  {" "}
                  <button className="btn btn-ghost btn-block" onClick={v.closeHint} style={{ marginTop: "8px", border: "0" }}>
                    Skip ad and lose the hint
                  </button>
                  {" "}
                </div>
                {" "}
                </>
              ) : null}
              {" "}
              {v.hintDone ? (
                <>
                {" "}
                <div style={{ textAlign: "center" }}>
                  {" "}
                  <img className="pop" src="/sk/sparkles.png" alt="" style={{ width: "64px", height: "64px" }} />
                  {" "}
                  <h2 style={{ fontSize: "22px", marginTop: "8px" }}>
                    Here’s your hint
                  </h2>
                  {" "}
                  <div className="card" style={{ marginTop: "12px", padding: "16px", fontSize: "18px", fontWeight: "800", background: "var(--card2)" }}>
                    {v.hintText}
                  </div>
                  {" "}
                  <p className="muted" style={{ marginTop: "10px", fontSize: "13px", lineHeight: "1.45" }}>
                    Hints are rough on purpose: city, device type and time of day.
                  </p>
                  {" "}
                  <button className="btn btn-ink btn-lg btn-block tap" onClick={v.closeHint} style={{ marginTop: "14px" }}>
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
        {v.guessOpen ? (
          <>
          {" "}
          <div className="scrim">
            {" "}
            <div className="sheet" role="dialog" aria-label="Guess who sent it">
              {" "}
              <div className="row">
                <h2 style={{ flex: "1", fontSize: "22px" }}>
                  Who do you think?
                </h2>
                <button className="icon-btn tap" onClick={v.closeGuess} aria-label="Close">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" aria-hidden="true">
                    <path d="M6 6l12 12M18 6 6 18" />
                  </svg>
                </button>
              </div>
              {" "}
              <p className="muted" style={{ fontSize: "13.5px", marginTop: "4px", lineHeight: "1.45" }}>
                {v.guessHelp}
              </p>
              {" "}
              <label htmlFor="ib-gq" className="sr">
                Search usernames
              </label>
              {" "}
              <input id="ib-gq" className="field" value={v.gq ?? ""} onChange={v.onGq} placeholder="Search a username" style={{ marginTop: "12px" }} />
              {" "}
              <div style={{ marginTop: "6px" }}>
                {" "}
                {(v.guessPeople || []).map((gp, i0) => (
                  <Fragment key={i0}>
                  {" "}
                  <button className="list-row tap" onClick={gp.pick} style={{ width: "100%", border: "0", borderBottom: "1px solid var(--line)", background: "transparent", textAlign: "left", paddingLeft: "0", paddingRight: "0" }}>
                    {" "}
                    <span className="av" style={{ width: "40px", height: "40px", borderRadius: "13px", background: gp.bg }}>
                      <img src={gp.icon} alt="" />
                    </span>
                    {" "}
                    <span style={{ flex: "1" }}>
                      <b style={{ fontSize: "15px" }}>
                        @{gp.handle}
                      </b>
                      <span className="muted" style={{ display: "block", fontSize: "12.5px" }}>
                        {gp.from}
                      </span>
                    </span>
                    {" "}
                  </button>
                  {" "}
                  </Fragment>
                ))}
                {" "}
              </div>
              {" "}
              <p className="muted" style={{ fontSize: "12.5px", marginTop: "10px" }}>
                They get asked privately. Wrong guesses are never shown to anyone.
              </p>
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
            <img src={v.toastIcon} alt="" style={{ width: "34px", height: "34px", flex: "none" }} />
            <span style={{ fontSize: "14px", lineHeight: "1.35" }}>
              <b>
                {v.toastTitle}
              </b>
              <br />
              <span className="muted">
                {v.toastSub}
              </span>
            </span>
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
