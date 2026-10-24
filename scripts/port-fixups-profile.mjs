// Phase 3 wiring: Profile (own and public) and Settings read and save real data.
// Same rules as port-fixups.mjs: [exact mockup text, replacement] pairs (the converter stops if one is missing),
// or a function for changes a plain replacement can't express. Images are already /sk/ paths when these run.

const between = (start, end, replacement) => (src) => {
  const a = src.indexOf(start), b = src.indexOf(end, a + start.length);
  if (a < 0 || b < 0) throw new Error("fixup: can't find " + (a < 0 ? start : end).slice(0, 50));
  return src.slice(0, a) + replacement + src.slice(b);
};
const text = (from, to) => [`>${from}<`, `>${to}<`];

export const PROFILE_FIXUPS = {
  // props: view ("own" | "public"), username, avatar, bio, pub, cloudPub, stats, links[], words { all, month, week },
  //        answerCounts[3], badges[], save(patch) (own), reportProfile(username) (public)
  Profile: [
    [`href="PublicProfile.dc.html"`, `href="/u/{{username}}"`],
    text("If @peach shared a link with you, open that link to send a message.", "If @{{username}} shared a link with you, open that link to send a message."),
    [`<h2 style="margin-top: 12px; font-size: 26px">@peach</h2>`, `<h2 style="margin-top: 12px; font-size: 26px">@{{username}}</h2>`],
    [`<div class="d" style="font-size: 22px; font-weight: 800">4</div><div class="muted" style="font-size: 12.5px">links</div>`, `<div class="d" style="font-size: 22px; font-weight: 800">{{stats.links}}</div><div class="muted" style="font-size: 12.5px">links</div>`],
    [`<div class="d" style="font-size: 22px; font-weight: 800">43</div><div class="muted" style="font-size: 12.5px">messages</div>`, `<div class="d" style="font-size: 22px; font-weight: 800">{{stats.messages}}</div><div class="muted" style="font-size: 12.5px">messages</div>`],
    [`<div class="d" style="font-size: 22px; font-weight: 800">5</div><div class="muted" style="font-size: 12.5px">games</div>`, `<div class="d" style="font-size: 22px; font-weight: 800">{{stats.games}}</div><div class="muted" style="font-size: 12.5px">games</div>`],
    // a visitor only sees the word cloud when the owner shows it on their profile
    [`<section class="card" style="margin-top: 12px; padding: 16px" aria-labelledby="pf-cloud">`, `<section class="card" style="margin-top: 12px; padding: 16px; display: {{cloudDisplay}}" aria-labelledby="pf-cloud">`],
    (src) => src.replace(/av: 2, bio: '[^']*', editing: false, pub: true, picker: false, reported: false, range: 0, word: 'loyal', cloudPub: true \};/,
      "av: Math.max(0, ['fox', 'panda', 'frog', 'octopus', 'unicorn', 'koala'].indexOf(props.avatar)), bio: props.bio || '', editing: false, pub: props.pub !== false, picker: false, reported: false, range: 0, word: '', cloudPub: props.cloudPub !== false };"),
    [`    var own = this.props.view !== 'public';`, `    var own = this.props.view !== 'public', U = this.props.username || '';`],
    between(`    var L = [\n`, `\n    // word cloud`, `    var L = this.props.links || [];`),
    between(`    var ALL = [`, `    var map = [null, MONTH, WEEK][s.range];`, `    var WD = this.props.words || { all: [], month: {}, week: {} }, ALL = WD.all, MONTH = WD.month, WEEK = WD.week;\n`),
    between(`    var BD = [`, `\n    return {`, `    var BD = this.props.badges || [];`),
    [`cloudTitle: own ? 'How people describe you' : 'How people describe @peach',`, `cloudTitle: own ? 'How people describe you' : 'How people describe @' + U, cloudDisplay: own || s.cloudPub ? 'block' : 'none',`],
    [`answerCount: [43, 18, 6][s.range],`, `answerCount: (this.props.answerCounts || [0, 0, 0])[s.range],`],
    [`linksTitle: own ? 'Active links' : 'Send @peach something',`, `linksTitle: own ? 'Active links' : 'Send @' + U + ' something',`],
    [`href: own ? 'MyLinks.dc.html' : 'Main.dc.html', cta: own ? 'Manage' : 'Send'`, `href: l.href, cta: own ? 'Manage' : 'Send'`],
    // every change is saved as it happens
    [`toggleCloudPub: function () { self.setState({ cloudPub: !s.cloudPub }); },`, `toggleCloudPub: function () { self.setState({ cloudPub: !s.cloudPub }); self.props.save({ cloudPublic: !s.cloudPub }); },`],
    [`togglePub: function () { self.setState({ pub: !s.pub }); },`, `togglePub: function () { self.setState({ pub: !s.pub }); self.props.save({ publicProfile: !s.pub }); },`],
    [`toggleEdit: function () { self.setState({ editing: !s.editing }); },`, `toggleEdit: function () { if (s.editing) self.props.save({ bio: s.bio }); self.setState({ editing: !s.editing }); },`],
    [`pick: function () { self.setState({ av: i }); } };`, `pick: function () { self.setState({ av: i }); self.props.save({ avatar: a.name }); } };`],
    [
      `reportProfile: function () { self.setState({ reported: true }); },`,
      `reportProfile: function () { self.props.reportProfile(U).then(function (r) { if (r && r.login) { window.location.href = '/login?next=' + encodeURIComponent('/u/' + U); return; } self.setState({ reported: true }); }); },`,
    ],
  ],

  // props: settings (from loadSettings), heldCount, save(patch), changeUsername, changePassword, setRecoveryEmail,
  //        unblock(key), deleteAccount(confirm), logout()
  Settings: [
    [`<a href="Landing.dc.html" class="btn btn-block tap" style="margin-top: 12px">Log out</a>`, `<button class="btn btn-block tap" onClick="{{logout}}" style="margin-top: 12px">Log out</button>`],
    [`<a href="Inbox.dc.html" onClick="{{openHeld}}" class="btn btn-sm btn-block tap" style="margin-top: 10px">See held messages (2)</a>`, `<a href="/inbox?filter=held" class="btn btn-sm btn-block tap" style="margin-top: 10px">See held messages ({{heldCount}})</a>`],
    [`<a href="Legal.dc.html" class="list-row">Privacy policy</a>`, `<a href="/privacy" class="list-row">Privacy policy</a>`],
    [`<a href="Legal.dc.html" class="list-row">Terms of use</a>`, `<a href="/terms" class="list-row">Terms of use</a>`],
    text("Your links stop working, your messages and chats are deleted, and @peach becomes free for someone else. This cannot be undone.", "Your links stop working, your messages and chats are deleted, and @{{username}} becomes free for someone else. This cannot be undone."),
    // saved settings, and the section to open from the address (?s=safety), not browser storage
    (src) => src.replace(/    this\.state = \{ kind: 1,[^\n]*installed: false \};/, `    this.state = Object.assign({ mode: m || props.mode || 'dark', look: props.mode || 'system', sec: props.startSection || null, newWord: '', delOpen: false, installPrompt: false, installed: false, edit: null }, props.settings, { notif: Object.assign({ push: false }, (props.settings || {}).notif) });`),
    (src) => src.replace(/ sec0 = window\.localStorage\.getItem\('sk-set-sec'\); window\.localStorage\.removeItem\('sk-set-sec'\);/, ""),
    // light/dark comes from the sk-mode cookie (props.mode), so the first render matches the server's
    (src) => src.replace("    try { m = window.localStorage.getItem('sk-mode'); } catch (e) {}\n    this.state = Object.assign(", "    this.state = Object.assign("),
    // each switch saves itself: compare with the previous state after every change
    [
      `  componentDidUpdate(prev) { if (prev.mode !== this.props.mode && this.props.mode) this.setState({ mode: this.props.mode }); }`,
      `  componentDidUpdate(prev, ps) {
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
  }`,
    ],
    [
      `    try { window.addEventListener('storage', this.onStore); } catch (e) {}\n  }`,
      `    try { window.addEventListener('storage', this.onStore); } catch (e) {}
    // the browser's own install prompt, when it offers one
    try { window.addEventListener('beforeinstallprompt', this.onBip = function (e) { e.preventDefault(); self.bip = e; }); } catch (e) {}
    try { if (window.matchMedia('(display-mode: standalone)').matches) self.setState({ installed: true }); } catch (e) {}
    setTimeout(function () { if (window.skPush) window.skPush.isOn().then(function (on) { self.setState({ notif: Object.assign({}, self.state.notif, { push: on }) }); }); }, 300);
  }`,
    ],
    [`askInstall: function () { self.setState({ installPrompt: true }); },`, `askInstall: function () { if (self.bip) { self.bip.prompt(); self.bip.userChoice.then(function (c) { if (c && c.outcome === 'accepted') self.setState({ installed: true }); }); } else self.setState({ manualInstall: true }); },`],
    // no pretend browser dialog: explain how to add it instead
    [`installHint: s.installed ? 'On your home screen' : 'Opens like an app',`, `installHint: s.installed ? 'On your home screen' : s.manualInstall ? 'Open your browser menu (⋮ or Share) and tap “Add to Home screen”' : 'Opens like an app',`],
    [`deleteForever: function () { if ((s.delText || '').trim().toUpperCase() === 'DELETE') self.setState({ gone: true }); },`, `deleteForever: function () { if ((s.delText || '').trim().toUpperCase() === 'DELETE') { self.setState({ gone: true }); self.props.deleteAccount(s.delText); } },`],
    // the account fields save through the server; its answer (taken username, bad email…) shows under the field
    [`var editOk = s.edit === 'user' ? (/^[a-z0-9_]{3,20}$/.test(v) && v !== 'maya') :`, `var editOk = s.edit === 'user' ? /^[a-z0-9_]{3,20}$/.test(v) :`],
    [`username: s.username || 'peach', emailShown: s.email ? s.email.charAt(0) + '•••••' + s.email.slice(s.email.indexOf('@')) : 'p•••••@gmail.com',`, `username: s.username, emailShown: s.email ? s.email.charAt(0) + '•••••' + s.email.slice(s.email.indexOf('@')) + (s.emailVerified ? '' : ' · not checked yet') : 'Not set',`],
    [`editUser: function () { self.setState({ edit: 'user', editVal: s.username || 'peach', saved: false }); },`, `editUser: function () { self.setState({ edit: 'user', editVal: s.username, saved: false, editErr: '' }); },`],
    [`editPass: function () { self.setState({ edit: 'pass', editVal: '', saved: false }); },`, `editPass: function () { self.setState({ edit: 'pass', editVal: '', saved: false, editErr: '' }); },`],
    [`editEmail: function () { self.setState({ edit: 'email', editVal: '', saved: false }); },`, `editEmail: function () { self.setState({ edit: 'email', editVal: '', saved: false, editErr: '' }); },`],
    [`editHint: s.edit === 'user' ? 'Your links move to the new name. Old links keep working for 7 days.' :`, `editHint: s.edit === 'user' ? 'Your links move to the new name. Links you shared with the old name stop working.' :`],
    [`editPh: s.edit === 'user' ? 'peach' :`, `editPh: s.edit === 'user' ? s.username :`],
    [`self.setState({ editVal: s.edit === 'user' ?`, `self.setState({ editErr: '', editVal: s.edit === 'user' ?`],
    [`editCheck: editOk ? (s.edit === 'user' ? '@' + v + ' is free' : 'Looks good') : (s.edit === 'user' ? '3–20 letters, numbers or _' + (v === 'maya' ? ' · @maya is taken' : '') :`, `editCheck: s.editErr ? s.editErr : editOk ? 'Looks good' : (s.edit === 'user' ? '3–20 letters, numbers or _' :`],
    [
      `saveEdit: function () { if (!editOk) return; var o = { saved: true }; if (s.edit === 'user') o.username = v; if (s.edit === 'email') o.email = v; self.setState(o); },`,
      `saveEdit: function () {
        if (!editOk || s.savingEdit) return;
        var run = s.edit === 'user' ? self.props.changeUsername : s.edit === 'pass' ? self.props.changePassword : self.props.setRecoveryEmail;
        self.setState({ savingEdit: true });
        run(v).then(function (r) {
          if (!r || !r.ok) { self.setState({ savingEdit: false, editErr: (r && r.error) || 'Couldn’t save. Try again.' }); return; }
          var o = { saved: true, savingEdit: false }; if (s.edit === 'user') o.username = r.username || v; if (s.edit === 'email') { o.email = v; o.emailVerified = false; } self.setState(o);
        });
      },`,
    ],
    [`savedNote: s.edit === 'user' ? 'You are @' + (s.username || 'peach') + ' now.' :`, `savedNote: s.edit === 'user' ? 'You are @' + s.username + ' now.' :`],
    // blocked senders and the warnings you've had come from the server
    [`    var MW = [['To @tolu', 2], ['To @ada', 4]];`, `    var MW = s.myWarnings || [];`],
    [
      `blocked: s.blocked.map(function (id) { var b = BL[id]; return { name: b.name, icon: b.icon, bg: b.bg, unblock: function () { self.setState({ blocked: s.blocked.filter(function (x) { return x !== id; }) }); } }; }),`,
      `blocked: s.blocked.map(function (b) { return { name: b.name, icon: b.icon, bg: b.bg, unblock: function () { self.setState({ blocked: s.blocked.filter(function (x) { return x.key !== b.key; }) }); self.props.unblock(b.key); } }; }),
      logout: function () { self.props.logout(); }, heldCount: this.props.heldCount || 0,`,
    ],
  ],
};
