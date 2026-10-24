// Phase 3 wiring: the Inbox reads real messages and chats and calls the inbox server actions.
// Same rules as port-fixups.mjs: [exact mockup text, replacement] pairs (the converter stops if one is missing),
// or a function for changes a plain replacement can't express.

/** Replaces everything from `start` up to (not including) `end`, failing loudly if either is missing. */
const between = (start, end, replacement) => (src) => {
  const a = src.indexOf(start), b = src.indexOf(end, a + start.length);
  if (a < 0 || b < 0) throw new Error("Inbox fixup: can't find " + (a < 0 ? start : end).slice(0, 50));
  return src.slice(0, a) + replacement + src.slice(b);
};
/** Replaces every occurrence (the plain pairs replace only the first). */
const all = (a, b) => (src) => {
  if (!src.includes(a)) throw new Error("Inbox fixup: can't find " + a.slice(0, 50));
  return src.split(a).join(b);
};

const TOAST_OUT = "clearTimeout(self.t4); self.t4 = setTimeout(function () { self.setState({ toast: null }); }, 3600);";

export const INBOX_FIXUPS = {
  // props: username, items (from loadInbox), startOpen, markRead(ids), markAllRead(), setArchived(ids, on), deleteItems(ids),
  //        startChat(id), sendChat({ chatId, text }), deleteBubbles(chatId, ids), report(id, category), undoBlock(id),
//        startFilter, allowGuess, react(id, k|null), releaseHeld(id), searchPeople(q), guess(id, username)
  Inbox: [
    // real items; archived ones come flagged from the server
    between(`      items: [\n`, `\n    };\n  }\n  cats() {`, `      items: props.items || []`),
    [`archived: {},`, `archived: (props.items || []).reduce(function (a, x) { if (x.archived) a[x.id] = true; return a; }, {}),`],
    // no demo message arriving after 3 seconds; new ones arrive with the page refresh instead
    between(`    this.t1 = setTimeout(function () {\n      var fresh =`, `  }\n  componentWillUnmount()`, ``),
    [
      `  componentDidUpdate(prev) { if (prev.mode !== this.props.mode && this.props.mode) this.setState({ mode: this.props.mode }); }`,
      `  componentDidUpdate(prev) {
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
  }`,
    ],
    // each item carries its link's own theme and title (a custom link shows its question)
    [
      `    // long text reads as the same cards`,
      `    var LL = function (m) { var k = m.link, b = L[k] || L.custom; return { title: m.title || b.title, th: m.th || b.th }; };\n    // long text reads as the same cards`,
    ],
    all(`L[m.link]`, `LL(m)`),
    all(`L[selRaw.link]`, `LL(selRaw)`),
    // quizzes can have 3–10 questions
    [`'Someone scored ' + m.quiz.score + '/5 on my quiz'`, `'Someone scored ' + m.quiz.score + '/' + m.quiz.of + ' on my quiz'`],
    [`(m.quiz ? 'Scored ' + m.quiz.score + '/5 on your quiz'`, `(m.quiz ? 'Scored ' + m.quiz.score + '/' + m.quiz.of + ' on your quiz'`],
    [`quizScore: open && selRaw.quiz ? selRaw.quiz.score + '/5' : '',`, `quizScore: open && selRaw.quiz ? selRaw.quiz.score + '/' + selRaw.quiz.of : '',`],
    [`'Close friend', 'Bestie level'][selRaw.quiz.score] : '',`, `'Close friend', 'Bestie level'][Math.round(selRaw.quiz.score / selRaw.quiz.of * 5)] : '',`],
    // what the reported sender is told names the real account
    (src) => {
      const at = src.indexOf('<script type="text/x-dc"');
      return src.slice(0, at) + src.slice(at).replace(/@peach/g, "@' + (this.props.username || 'you') + '");
    },
    // opening an unread item tells the server
    all(
      `self.setState({ openId: m.id, items: items, share: false, draft: '', page: 0, chatSel: false, chatChosen: {} });`,
      `self.setState({ openId: m.id, items: items, share: false, draft: '', page: 0, chatSel: false, chatChosen: {} }); if (m.unread) self.props.markRead([m.id]);`,
    ),
    [`var n = chosenIds.length, open = chosenIds.indexOf(s.openId) >= 0;`, `var n = chosenIds.length, open = chosenIds.indexOf(s.openId) >= 0; self.props.setArchived(chosenIds, !inArchive);`],
    [
      `go: function () { self.setState({ menu: null, items: s.items.map(function (x) { return Object.assign({}, x, { unread: false, fresh: false }); }) }); } }`,
      `go: function () { self.setState({ menu: null, items: s.items.map(function (x) { return Object.assign({}, x, { unread: false, fresh: false }); }) }); self.props.markAllRead(); } }`,
    ],
    [
      `var a = Object.assign({}, s.archived), was = !!a[selRaw.id]; if (was) delete a[selRaw.id]; else a[selRaw.id] = true;`,
      `var a = Object.assign({}, s.archived), was = !!a[selRaw.id]; if (was) delete a[selRaw.id]; else a[selRaw.id] = true; self.props.setArchived([selRaw.id], !was);`,
    ],
    [`var ids = s.del.ids, n = ids.length;`, `var ids = s.del.ids, n = ids.length; self.props.deleteItems(ids);`],
    [
      `chatDelete: function () { var d = Object.assign({}, s.deletedBubbles); chatKeys.forEach(function (k) { d[k] = true; });`,
      `chatDelete: function () { var d = Object.assign({}, s.deletedBubbles); chatKeys.forEach(function (k) { d[k] = true; }); self.props.deleteBubbles(selRaw.id, chatKeys.map(function (k) { var b = selRaw.thread[Number(k.split(':').pop())]; return b && b.bid; }).filter(Boolean));`,
    ],
    // the sender's first message heads the chat; the guest sees it as their own
    [`text: 'Their message: “' + b.from + '”'`, `text: (b.fromLabel || 'Their message') + ': “' + b.from + '”'`],
    // the hint is recorded when the message is sent (city · device · time of day)
    [`hintText: open ? hintOf(selRaw.id) : '',`, `hintText: open ? (selRaw.hint || 'Somewhere near you') : '',`],
    // the photo or video that came with a message (blurred until tapped, if Settings › Safety says so)
    [
      `<img src="/sk/hero-dark.png" alt="Photo sent anonymously">`,
      `<sc-if value="{{selIsVideo}}" hint-placeholder-val="{{ false }}"><video src="{{selMediaSrc}}" controls="controls" preload="metadata"></video></sc-if>
                  <sc-if value="{{selIsPhoto}}" hint-placeholder-val="{{ true }}"><img src="{{selMediaSrc}}" alt="Photo sent anonymously"></sc-if>`,
    ],
    [`selHasMedia: open && !!selRaw.media,`, `selHasMedia: open && !!selRaw.media, selMediaSrc: open && selRaw.mediaUrl ? selRaw.mediaUrl : '', selIsVideo: open && selRaw.media === 'video', selIsPhoto: open && selRaw.media !== 'video',`],
    [`mediaTag: m.media === 'photo' ? 'Photo' : '',`, `mediaTag: m.media === 'video' ? '▶ Video' : m.media === 'photo' ? 'Photo' : '',`],
    [
      `mediaHidden: open && !s.shown[s.openId], mediaCls: open && s.shown[s.openId] ? '' : 'blur',`,
      `mediaHidden: open && self.props.blurMedia !== false && !s.shown[s.openId], mediaCls: open && (self.props.blurMedia === false || s.shown[s.openId]) ? '' : 'blur',`,
    ],
    // chat bubbles: the real file, video or photo; the other person's media blurs until tapped (if the setting is on)
    [`<img src="{{b.src}}" alt="{{b.alt}}">`, `<sc-if value="{{b.isVideo}}" hint-placeholder-val="{{ false }}"><video src="{{b.src}}" controls="controls" preload="metadata"></video></sc-if><sc-if value="{{b.isPhoto}}" hint-placeholder-val="{{ true }}"><img src="{{b.src}}" alt="{{b.alt}}"></sc-if>`],
    [`<button class="media-cover" onClick="{{b.reveal}}" style="font-size: 13px">Tap to view video</button>`, `<button class="media-cover" onClick="{{b.reveal}}" style="font-size: 13px">{{b.cover}}</button>`],
    (src) => src.replace(
      /src: b\.url && b\.media === 'photo' \? b\.url : '\/sk\/hero-dark\.png', alt: (b\.media === 'video' \? 'Video sent in chat' : 'Photo sent in chat'), tag: b\.media === 'video' \? \(b\.me \? '▶ Your video' : '▶ 0:12'\) : 'Photo', mediaCls: b\.me \|\| s\.shown\[key\] \? '' : 'blur', hidden: !b\.me && !s\.shown\[key\],/,
      "src: b.url || '', isVideo: b.media === 'video', isPhoto: b.media !== 'video', cover: b.media === 'video' ? 'Tap to view video' : 'Tap to view photo', alt: $1, tag: b.media === 'video' ? (b.me ? '▶ Your video' : '▶ Video') : 'Photo', mediaCls: b.me || s.shown[key] || self.props.blurMedia === false ? '' : 'blur', hidden: !b.me && !s.shown[key] && self.props.blurMedia !== false,",
    ),
    between(
      `      replyPrivately: function () {`,
      `      chatIntro:`,
      `      replyPrivately: function () {
        if (!selRaw || !selRaw.replyOk || s.starting) return;
        if (selRaw.chatId) { self.setState({ openId: selRaw.chatId, draft: '' }); return; }
        var from = selRaw.id;
        self.setState({ starting: true });
        self.props.startChat(from).then(function (r) {
          if (!r || !r.ok) { self.setState({ starting: false, toast: { t: 'Can’t reply to this one', s: (r && r.error) || 'Try again.', i: GHOST } }); ${TOAST_OUT} return; }
          var items = self.state.items.filter(function (x) { return x.id !== r.item.id; }).map(function (x) { return x.id === from ? Object.assign({}, x, { chatId: r.item.id }) : x; });
          self.setState({ starting: false, items: [r.item].concat(items), openId: r.item.id, draft: '', toast: { t: 'Private chat started', s: 'You’re both anonymous. Say something first.', i: '/sk/speech_balloon_3d.png' } });
          ${TOAST_OUT}
        });
      },
`,
    ),
    between(
      `      sendReply: function () {`,
      `      share: s.share,`,
      `      sendReply: function () {
        var t = s.draft.trim(); if (!t || !selRaw || s.sendingReply) return;
        var id = selRaw.id;
        self.setState({ items: s.items.map(function (x) { return x.id === id ? Object.assign({}, x, { thread: x.thread.concat([{ me: true, text: t }]) }) : x; }), draft: '', sendingReply: true });
        self.props.sendChat({ chatId: id, text: t }).then(function (r) {
          if (r && r.ok) { self.setState({ sendingReply: false }); return; }
          self.setState({ sendingReply: false, draft: t, items: self.state.items.map(function (x) { return x.id === id ? Object.assign({}, x, { thread: x.thread.slice(0, -1) }) : x; }), toast: { t: 'Not sent', s: (r && r.error) || 'Try again.', i: GHOST } });
          ${TOAST_OUT}
        });
      },
`,
    ),
    // a photo or video in a chat uploads first (app/api/upload), then goes out as its own bubble
    between(
      `      attachChat: function (e) {`,
      `      // Kind mode: held messages`,
      `      attachChat: function (e) {
        var f = e && e.target && e.target.files && e.target.files[0]; if (!f || !selRaw) return;
        try { e.target.value = ''; } catch (x) {}
        var id = selRaw.id, kind = f.type && f.type.indexOf('video') === 0 ? 'video' : 'photo', local = '';
        try { local = URL.createObjectURL(f); } catch (x) {}
        self.setState({ items: self.state.items.map(function (x) { return x.id === id ? Object.assign({}, x, { thread: x.thread.concat([{ me: true, media: kind, url: local }]) }) : x; }) });
        var undo = function (msg) {
          self.setState({ items: self.state.items.map(function (x) { return x.id === id ? Object.assign({}, x, { thread: x.thread.slice(0, -1) }) : x; }), toast: { t: 'Not sent', s: msg || 'Try again.', i: GHOST } });
          ${TOAST_OUT}
        };
        var fd = new FormData(); fd.append('file', f); fd.append('chatId', id);
        fetch('/api/upload', { method: 'POST', body: fd }).then(function (r) { return r.json(); }).then(function (r) {
          if (!r || !r.ok) { undo(r && r.error); return; }
          return self.props.sendChat({ chatId: id, mediaUrl: r.url }).then(function (s2) { if (!s2 || !s2.ok) undo(s2 && s2.error); });
        }).catch(function () { undo(); });
      },
`,
    ),
    between(
      `      submitReport: function () {`,
      `      resultTitle:`,
      `      submitReport: function () {
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
`,
    ),
    // the menu count drops the moment a message is opened (archived and held ones never count)
    [`      unread: s.items.filter(function (m) { return m.unread; }).length,`, `      unread: s.items.filter(function (m) { return m.unread; }).length,
      navInbox: s.items.filter(function (m) { return m.unread && !s.archived[m.id] && !(m.held && !s.released[m.id]); }).length,`],
    // report reasons come from Admin › Categories (active ones, shown 5–10 at a time by default)
    [`  cats() {
    return [`, `  cats() {
    if (this.props.reportCats && this.props.reportCats.length) return this.props.reportCats;
    return [`],
    [`n = 5 + (seed * 7) % 6`, `n = (this.props.reportMin || 5) + (seed * 7) % ((this.props.reportMax || 10) - (this.props.reportMin || 5) + 1)`],
    [`undoBlock: function () { self.setState(`, `undoBlock: function () { self.props.undoBlock(s.openId); self.setState(`],
    [`undoBlockClose: function () { self.setState(`, `undoBlockClose: function () { self.props.undoBlock(s.openId); self.setState(`],
    // other screens open the inbox on a filter with ?filter=held (not browser storage, so the first render matches)
    [`    try { f0 = window.localStorage.getItem('sk-ibf'); window.localStorage.removeItem('sk-ibf'); } catch (e) {}`, `    f0 = props.startFilter || null;`],
    [`      reacts: {}, guess: {}, guessOpen: false, gq: '', heldShown: {}, released: {},`, `      reacts: Inbox.reactsOf(props.items || []), guess: Inbox.guessesOf(props.items || []), guessOpen: false, gq: '', people: [], heldShown: {}, released: {},`],
    [
      `  cats() {`,
      `  static reactsOf(items) { var o = {}; items.forEach(function (x) { if (x.reaction !== undefined && x.reaction !== null) o[x.id] = x.reaction; }); return o; }
  static guessesOf(items) { var o = {}; items.forEach(function (x) { if (x.guess && x.guess.used) o[x.id] = { used: x.guess.used, res: x.guess.res, who: x.guess.who }; }); return o; }
  cats() {`,
    ],
    [
      `pick: function () { var o = Object.assign({}, s.reacts); if (on) delete o[selRaw.id]; else o[selRaw.id] = k; self.setState({ reacts: o }); } };`,
      `pick: function () { var o = Object.assign({}, s.reacts); if (on) delete o[selRaw.id]; else o[selRaw.id] = k; self.setState({ reacts: o }); self.props.react(selRaw.id, on ? null : k); } };`,
    ],
    [`releaseHeld: function () { var o = Object.assign({}, s.released); o[selRaw.id] = true;`, `releaseHeld: function () { var o = Object.assign({}, s.released); o[selRaw.id] = true; self.props.releaseHeld(selRaw.id);`],
    [`canGuess: open && selRaw.kind === 'one' && !isHeld(selRaw) && (!!selRaw.receipt || !!selRaw.acct),`, `canGuess: open && selRaw.kind === 'one' && !isHeld(selRaw) && (!!selRaw.receipt || !!selRaw.acct) && self.props.allowGuess !== false,`],
    // guess from usernames found by search; the server checks the guess and asks the sender
    [
      `onGq: function (e) { self.setState({ gq: e.target.value.toLowerCase() }); },`,
      `onGq: function (e) { var q = e.target.value.toLowerCase(); self.setState({ gq: q }); clearTimeout(self.gt); self.gt = setTimeout(function () { self.props.searchPeople(q).then(function (r) { if (self.state.gq === q) self.setState({ people: r || [] }); }); }, 250); },`,
    ],
    between(
      `      guessPeople: [`,
      `      hintBtn:`,
      `      guessPeople: (s.people || []).map(function (p) {
        return { handle: p.handle, from: 'Sekretly member', icon: p.icon, bg: 'linear-gradient(135deg,#ffb35c,#ff5f8f)', pick: function () {
          var id = selRaw.id, prev = s.guess[id] || {}, o = Object.assign({}, s.guess);
          o[id] = { who: p.handle, res: 'wait', used: (prev.used || 0) + 1 };
          self.setState({ guess: o, guessOpen: false, people: [], gq: '' });
          self.props.guess(id, p.handle).then(function (r) {
            if (r && r.ok) return;
            var g = Object.assign({}, self.state.guess); g[id] = prev.used ? prev : undefined; if (!g[id]) delete g[id];
            self.setState({ guess: g, toast: { t: 'Guess not sent', s: (r && r.error) || 'Try again.', i: GHOST } });
            ${TOAST_OUT}
          });
        } };
      }),
`,
    ),
    [`guessHelp: open && selRaw.senderHint ? 'Their hint: ' + selRaw.senderHint + '. Pick from people in your crews and chats.' : 'Pick from people in your crews and chats. If you’re right, they choose whether to reveal.',`,
     `guessHelp: open && selRaw.senderHint ? 'Their hint: ' + selRaw.senderHint + '. Search their username.' : 'Search the username you think it is. If you’re right, they choose whether to reveal.',`],
  ],
};
