// Phase 2 wiring: the link page, Create link, My links and Link insights read real data and call server actions.
// Same rules as port-fixups.mjs: [exact mockup text, replacement] pairs (the converter stops if one is missing),
// or a function for changes a plain replacement can't express.

/** The mockup's link owner is "@peach" with the peach emoji; real pages show the owner's username and avatar. */
function personaliseLinkPage(src) {
  const start = src.indexOf("<x-dc>"), end = src.indexOf("</x-dc>"), script = src.indexOf('<script type="text/x-dc"');
  const tpl = src.slice(start, end).replace(/@peach/g, "@{{owner}}").replace(/src="\/sk\/peach\.png"/g, 'src="/sk/{{ownerAvatar}}.png"');
  const logic = src
    .slice(script)
    .split("\n")
    .map((line) => (line.trim().startsWith("//") ? line.replace(/@peach/g, "the owner") : line.replace(/@peach/g, "@' + OWNER + '")))
    .join("\n");
  return src.slice(0, start) + tpl + src.slice(end, script) + logic;
}

export const LINK_FIXUPS = {
  // props: linkId, owner, ownerAvatar, theme, topic, customQuestion, quiz, board, linkState, visitor, ads,
  //        send(input), joinAndSend(input), checkUsername(name). Without `send` (the landing demo) it stays a demo.
  Main: [
    personaliseLinkPage,
    // the mockup starts over when its tweak props change; a real page only starts over for a different link
    // (logging in from the popup refreshes the page with visitor="member" and must not wipe the "account made" step)
    [
      `    if (prev.topic !== p.topic || prev.theme !== p.theme || prev.visitor !== p.visitor || prev.linkState !== p.linkState || prev.senderWarnings !== p.senderWarnings) this.setState(this.blank());`,
      `    if (p.send ? prev.linkId !== p.linkId : prev.topic !== p.topic || prev.theme !== p.theme || prev.visitor !== p.visitor || prev.linkState !== p.linkState || prev.senderWarnings !== p.senderWarnings) this.setState(this.blank());`,
    ],
    [`  renderVals() {\n    var E = {`, `  renderVals() {\n    var OWNER = this.props.owner || 'peach';\n    var E = {`],
    [`      th: th, tp: tp, ads:`, `      owner: OWNER, ownerAvatar: this.props.ownerAvatar || 'peach', onbHref: '/onboarding?from=link&to=' + encodeURIComponent(OWNER),\n      th: th, tp: tp, ads:`],
    [
      `    try { var q = JSON.parse(window.localStorage.getItem('sk-quiz') || 'null'); if (q && q.length >= 3) return q; } catch (e) {}`,
      `    if (this.props.quiz && this.props.quiz.length) return this.props.quiz;`,
    ],
    [
      `var board = [['SuyaStar', QN], ['BlueFox', QN - 1], ['KolaNut', QN - 2], ['PixelOwl', 2]].map(function (x) { return { name: x[0], score: x[1] }; });`,
      `var board = (this.props.send ? this.props.board || [] : [['SuyaStar', QN], ['BlueFox', QN - 1], ['KolaNut', QN - 2], ['PixelOwl', 2]]).map(function (x) { return { name: x[0], score: x[1] }; });`,
    ],
    [`custom: { title: 'Tell me something you’ve never said',`, `custom: { title: this.props.customQuestion || 'Tell me something you’ve never said',`],
    [
      `    var doSend = function (replies) { self.setState({ sent: true, popup: false, wantReply: replies }); };`,
      `    // what goes to the server for each topic (it re-checks everything, and scores the quiz itself)
    var body = topic === 'describe' ? { words: s.words } : topic === 'quiz' ? { picks: s.picks, note: s.text } : topic === 'rate' ? { score: s.rate || undefined, category: s.rateCat, text: s.text } : { text: s.text };
    var doSend = function (replies) {
      if (!self.props.send) { self.setState({ sent: true, popup: false, wantReply: replies }); return; }
      if (s.sending) return;
      self.setState({ sending: true, sendErr: null });
      self.props.send({ linkId: self.props.linkId, wantsReply: !!replies, payload: body }).then(function (r) {
        if (r && r.ok) {
          self.setState({ sent: true, popup: false, wantReply: replies, sending: false, receipt: r.receipt || null });
          try { var saved = JSON.parse(window.localStorage.getItem('sk-receipts') || '[]'); if (r.receipt) window.localStorage.setItem('sk-receipts', JSON.stringify([r.receipt].concat(saved).slice(0, 30))); } catch (e) {}
        }
        else self.setState({ sending: false, popup: false, sendErr: (r && r.error) || 'Couldn’t send. Try again.' });
      });
    };`,
    ],
    [
      `userTaken = !s.popLogin && (s.popUser === 'maya' || s.popUser === 'peach');`,
      `userTaken = !s.popLogin && !!(s.taken || {})[s.popUser];`,
    ],
    [
      `onPopUser: function (e) { self.setState({ popUser: e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, '').slice(0, 20) }); },`,
      `onPopUser: function (e) { var v = e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, '').slice(0, 20); self.setState({ popUser: v, popErr: null }); self.lookUp(v); },`,
    ],
    [
      `      popDone: function () { if (!joinOk) return; self.setState({ popStep: 'made', wantReply: true }); },`,
      `      popDone: function () {
        if (!joinOk || s.joining) return;
        if (!self.props.joinAndSend) { self.setState({ popStep: 'made', wantReply: true }); return; }
        self.setState({ joining: true, popErr: null });
        self.props.joinAndSend({ username: s.popUser, password: s.popPass, login: !!s.popLogin, message: { linkId: self.props.linkId, payload: body } }).then(function (r) {
          if (r && r.ok) { self.setState({ joining: false, popStep: 'made', wantReply: true }); return; }
          var t = Object.assign({}, self.state.taken); if (r && r.taken) t[s.popUser] = true;
          self.setState({ joining: false, popErr: (r && r.error) || 'Something went wrong. Try again.', taken: t });
        });
      },
      hasPopErr: !!s.popErr, popErr: s.popErr || '',`,
    ],
    [`joinCta: s.popLogin ? 'Log in & send' : 'Create account & send',`, `joinCta: s.joining ? (s.popLogin ? 'Logging in…' : 'Creating your account…') : s.popLogin ? 'Log in & send' : 'Create account & send',`],
    [`<a href="Onboarding.dc.html" onClick="{{toOnboarding}}" class="lp-opt tap"`, `<a href="{{onbHref}}" class="lp-opt tap"`],
    [
      `            <button class="lp-opt tap" onClick="{{popDone}}"`,
      `            <sc-if value="{{hasPopErr}}" hint-placeholder-val="{{ false }}"><p role="alert" style="margin-top: 10px; font-size: 13.5px; font-weight: 700; color: #c4213a">{{popErr}}</p></sc-if>
            <button class="lp-opt tap" onClick="{{popDone}}"`,
    ],
    [`cantSend: !can, sendOpacity: can ? 1 : 0.55,`, `cantSend: !can || !!s.sending, sendOpacity: can && !s.sending ? 1 : 0.55, hasSendErr: !!s.sendErr, sendErr: s.sendErr || '',`],
    [
      `<sc-if value="{{needHint}}" hint-placeholder-val="{{ false }}"><div style="margin-top: 8px; text-align: center; font-size: 12.5px; font-weight: 700; color: {{th.muted}}">{{needText}}</div></sc-if>`,
      `<sc-if value="{{needHint}}" hint-placeholder-val="{{ false }}"><div style="margin-top: 8px; text-align: center; font-size: 12.5px; font-weight: 700; color: {{th.muted}}">{{needText}}</div></sc-if>
                <sc-if value="{{hasSendErr}}" hint-placeholder-val="{{ false }}"><div role="alert" style="margin-top: 8px; text-align: center; font-size: 13px; font-weight: 800; color: #ff8b98">{{sendErr}}</div></sc-if>`,
    ],
    // photo/video attachments arrive with uploads (next phase); until then the buttons stay hidden
    [`showTools: topic === 'confess' || topic === 'ama' || topic === 'custom',`, `showTools: false,`],
    // the sender's optional hint goes with the message (only where the owner allows hints)
    [`    var hintTxt = s.sHint === 5 ? s.sHintCustom.trim() : s.sHint > 0 ? SH[s.sHint].toLowerCase() : '';`, `    var hintTxt = s.sHint === 5 ? s.sHintCustom.trim() : s.sHint > 0 ? SH[s.sHint].toLowerCase() : '';
    body.hint = hintTxt || undefined;`],
    [
      `<div style="margin-top: 14px; padding: 10px 12px; border-radius: 16px; background: {{th.chipBg}}">
                  <button class="tap" onClick="{{toggleHintBox}}"`,
      `<div style="margin-top: 14px; padding: 10px 12px; border-radius: 16px; background: {{th.chipBg}}; display: {{hintDisplay}}">
                  <button class="tap" onClick="{{toggleHintBox}}"`,
    ],
    [`      hintBox: s.sHintBox,`, `      hintDisplay: this.props.send && this.props.allowHints === false ? 'none' : 'block',
      hintBox: s.sHintBox,`],
    // the receipt card shows the real code from the send
    [`>SK-7Q4M-2J</div>`, `>{{receiptCode}}</div>`],
    [
      `      showReceipt: !member && !s.wantReply && !embed,
      copyReceipt: function () { try { navigator.clipboard.writeText('SK-7Q4M-2J'); } catch (e) {} self.setState({ rcCopied: true }); },`,
      `      showReceipt: !member && !s.wantReply && !embed && !!s.receipt, receiptCode: s.receipt || '',
      copyReceipt: function () { try { navigator.clipboard.writeText(s.receipt || ''); } catch (e) {} self.setState({ rcCopied: true }); },`,
    ],
    [
      `  quiz() {`,
      `  // asks the server whether a popup username is free (debounced) and remembers each answer
  lookUp(v) {
    var self = this;
    clearTimeout(this.lt);
    if (!this.props.checkUsername || this.state.popLogin || !/^[a-z0-9_]{3,20}$/.test(v) || (this.state.taken || {})[v] !== undefined) return;
    this.lt = setTimeout(function () {
      self.props.checkUsername(v).then(function (r) { var t = Object.assign({}, self.state.taken); t[v] = !r.available; self.setState({ taken: t }); });
    }, 300);
  }
  quiz() {`,
    ],
  ],

  // props: username, initial (edit mode: the link's current settings), save(input) -> { ok, url, path } | { ok:false, error }
  Create: [
    [`      quiz: this.starter(), openQ: 0, swapN: 0, toast: null };`, `      quiz: this.starter(), openQ: 0, swapN: 0, toast: null };\n    if (props.initial) Object.assign(this.state, props.initial, { quiz: props.initial.quiz || this.starter() });`],
    [
      `    this.setState(this.editArrive());\n    this.nt = setInterval(function () { var nv = ''; try { nv = window.localStorage.getItem('sk-nav') || ''; } catch (x) {} if (nv !== self.nav) self.setState(self.editArrive()); }, 700);\n`,
      ``,
    ],
    [`url: 'sekretly.com/peach/k7x2m9/' + s.theme + '/' + tp.id,`, `url: s.url || '',`],
    [`copy: function () { self.setState({ copied: true }); self.flash('Link copied'); },`, `copy: function () { try { navigator.clipboard.writeText('https://' + s.url); } catch (e) {} self.setState({ copied: true }); self.flash('Link copied'); },`],
    [`shareWa: function () { self.flash('Opening WhatsApp with your card…'); },`, `shareWa: function () { self.share('wa'); },`],
    [`shareIg: function () { self.flash('Opening Instagram Stories…'); },`, `shareIg: function () { self.share(); },`],
    [`shareSc: function () { self.flash('Opening Snapchat…'); },`, `shareSc: function () { self.share(); },`],
    [`saveCard: function () { self.flash('Card saved to your photos'); },`, `saveCard: function () { self.share(); },`],
    [`previewHref: isQuiz ? 'LinkQuiz.dc.html' : tp.id === 'confess' ? 'LinkConfess.dc.html' : tp.id === 'rate-me' ? 'LinkRate.dc.html' : tp.id === 'ama' ? 'LinkAMA.dc.html' : 'Main.dc.html',`, `previewHref: s.path || '/',`],
    [
      `        if (STEPS[step + 1] === 'share') save();\n        self.setState({ step: Math.min(STEPS.length - 1, step + 1) });`,
      `        if (STEPS[step + 1] === 'share') {
          self.submit({
            id: s.editing || null, topic: tp.id, theme: s.theme, custom: s.custom,
            maxMessages: s.limMsg ? s.msgN : null, closesIn: s.limTime ? s.time : null,
            quiz: isQuiz ? Q.map(function (q) { return { text: q.text.trim(), options: q.opts.filter(function (o) { return o.trim(); }).map(function (o) { return o.trim(); }), right: q.opts.filter(function (o, k) { return k < q.right && o.trim(); }).length }; }) : null
          }, step + 1);
          return;
        }
        self.setState({ step: Math.min(STEPS.length - 1, step + 1) });`,
    ],
    [`nextLabel: STEPS[step + 1] === 'share' ?`, `nextLabel: s.saving ? 'Saving…' : STEPS[step + 1] === 'share' ?`],
    [
      `  flash(t) {`,
      `  // saves through the server; the share step then shows the real address
  submit(input, nextStep) {
    var self = this;
    if (this.state.saving) return;
    this.setState({ saving: true });
    this.props.save(input).then(function (r) {
      if (r && r.ok) self.setState({ saving: false, step: nextStep, url: r.url, path: r.path, copied: false });
      else { self.setState({ saving: false }); self.flash((r && r.error) || 'Couldn’t save. Try again.'); }
    });
  }
  // WhatsApp gets the link as a message; elsewhere the phone's share sheet (or the clipboard) does it.
  // Posting the story card as an image arrives with the Share studio.
  share(kind) {
    var url = 'https://' + this.state.url;
    if (kind === 'wa') { window.open('https://wa.me/?text=' + encodeURIComponent('Send me an anonymous message 👀 ' + url), '_blank', 'noopener'); return; }
    if (navigator.share) { navigator.share({ title: 'Sekretly', text: 'Send me an anonymous message 👀', url: url }).catch(function () {}); return; }
    try { navigator.clipboard.writeText(url); } catch (e) {}
    this.flash('Link copied. Paste it in your story.');
  }
  flash(t) {`,
    ],
  ],

  // props: username, origin, linkKey, links[], setPaused(id, paused), deleteLink(id), setAllPaused(paused), resetLinks()
  MyLinks: [
    [
      `paused: { confess: true }, deleted: {}, copied: null, key: 'k7x2m9',`,
      `paused: (props.links || []).reduce(function (p, l) { if (l.paused) p[l.id] = true; return p; }, {}), deleted: {}, copied: null, key: props.linkKey || '',`,
    ],
    (src) => src.replace(/    var base = \[\n[\s\S]*?\n    \];/, "    var base = this.props.links || [];"),
    [`url: 'sekretly.com/peach/' + s.key + '/' + l.theme + '/' + l.slug,`, `url: (self.props.origin || '') + '/' + self.props.username + '/' + s.key + '/' + l.theme + '/' + l.slug, detailHref: '/links/' + l.id, editHref: '/create?edit=' + l.id,`],
    [
      `toggle: function () { var n = Object.assign({}, s.paused); n[l.id] = !p; self.setState({ paused: n }); self.flash(p ? 'Link resumed' : 'Link paused'); },`,
      `toggle: function () { var n = Object.assign({}, s.paused); n[l.id] = !p; self.setState({ paused: n }); self.flash(p ? 'Link resumed' : 'Link paused'); self.props.setPaused(l.id, !p); },`,
    ],
    [`copy: function () { self.setState({ copied: l.id }); },`, `copy: function () { try { navigator.clipboard.writeText('https://' + (self.props.origin || '') + '/' + self.props.username + '/' + s.key + '/' + l.theme + '/' + l.slug); } catch (e) {} self.setState({ copied: l.id }); },`],
    [
      `del: function () { var d = Object.assign({}, s.deleted); d[l.id] = true; self.setState({ deleted: d }); self.flash('Link deleted'); }`,
      `del: function () { var d = Object.assign({}, s.deleted); d[l.id] = true; self.setState({ deleted: d }); self.flash('Link deleted'); self.props.deleteLink(l.id); }`,
    ],
    (src) => src.split(`href="LinkDetail.dc.html" onClick="{{l.open}}"`).join(`href="{{l.detailHref}}"`),
    [`<a href="Create.dc.html" onClick="{{l.edit}}" class="btn btn-sm tap">Edit</a>`, `<a href="{{l.editHref}}" class="btn btn-sm tap">Edit</a>`],
    [
      `pauseAll: function () { self.setState({ paused: { know: true, describe: true, rate: true, confess: true, ama: true } }); self.flash('All links paused'); },`,
      `pauseAll: function () { var p = {}; (self.props.links || []).forEach(function (l) { p[l.id] = true; }); self.setState({ paused: p }); self.flash('All links paused'); self.props.setAllPaused(true); },`,
    ],
    [`resumeAll: function () { self.setState({ paused: {} }); self.flash('All links live again'); },`, `resumeAll: function () { self.setState({ paused: {} }); self.flash('All links live again'); self.props.setAllPaused(false); },`],
    [
      `doReset: function () { self.setState({ resetOpen: false, key: 'p3q9za', paused: {} }); self.flash('New key made. Old links no longer work.'); },`,
      `doReset: function () { self.props.resetLinks().then(function (r) { if (r && r.ok) { self.setState({ resetOpen: false, key: r.key, paused: {} }); self.flash('New key made. Old links no longer work.'); } }); },
      noLinks: links.length === 0,`,
    ],
    [
      `      </ul>\n      <a href="Create.dc.html" class="btn btn-cta btn-lg btn-block tap" style="margin-top: 16px">New link</a>`,
      `      </ul>
      <sc-if value="{{noLinks}}" hint-placeholder-val="{{ false }}"><div class="card" style="padding: 22px; text-align: center"><img src="/sk/shushing_face.png" alt="" style="width: 56px; height: 56px"><div style="margin-top: 8px; font-weight: 800; font-size: 17px">No links yet</div><div class="muted" style="margin-top: 4px; font-size: 14px">Make one, share it on your story, and see what people really think.</div></div></sc-if>
      <a href="Create.dc.html" class="btn btn-cta btn-lg btn-block tap" style="margin-top: 16px">New link</a>`,
    ],
  ],

  // props: data (from loadLinkInsights), setPaused(id, paused), deleteLink(id) which returns to My links
  LinkDetail: [
    [
      `try { id = window.localStorage.getItem('sk-link'); this.nav = window.localStorage.getItem('sk-nav') || ''; } catch (e) { this.nav = ''; }
    return { id: id || this.props.link || 'know', paused: false,`,
      `this.nav = '';
    return { id: null, paused: !!(this.props.data && this.props.data.paused),`,
    ],
    [`    this.nt = setInterval(function () { var nv = ''; try { nv = window.localStorage.getItem('sk-nav') || ''; } catch (e) {} if (nv !== self.nav) self.setState(self.arrive()); }, 700);\n`, ``],
    (src) =>
      src.replace(
        /    var LINKS = \{[\s\S]*?    var url = 'sekretly\.com\/peach\/k7x2m9\/' \+ l\.theme \+ '\/' \+ l\.slug;/,
        `    var D = this.props.data;
    var id = D.kind, l = D.l;
    var max = Math.max.apply(null, l.week.concat([1]));
    var DAYS = D.days;
    var stats = D.stats;
    var qStats = D.qStats;
    var board = D.board;
    var WORDS = D.words;
    var COL = ['#ff5fa2', '#ffd23d', '#22e1ff', '#7ef0c1', '#b78bff'];
    var DIST = D.dist;
    var dmax = Math.max.apply(null, DIST.concat([1]));
    var hue = function (k) { return 'hsl(' + (220 - k * 19) + ',90%,62%)'; };
    var url = D.url;`,
      ),
    [`togglePause: function () { self.setState({ paused: !s.paused }); self.flash(s.paused ? 'Link resumed' : 'Link paused'); },`, `togglePause: function () { self.setState({ paused: !s.paused }); self.flash(s.paused ? 'Link resumed' : 'Link paused'); self.props.setPaused(D.linkId, !s.paused); },`],
    [`copy: function () { self.setState({ copied: true }); self.flash('Link copied'); },`, `copy: function () { try { navigator.clipboard.writeText('https://' + url); } catch (e) {} self.setState({ copied: true }); self.flash('Link copied'); },`],
    [
      `share: function () { self.flash('Story card ready to share'); },`,
      `share: function () { if (navigator.share) { navigator.share({ title: 'Sekretly', text: 'Send me an anonymous message 👀', url: 'https://' + url }).catch(function () {}); return; } try { navigator.clipboard.writeText('https://' + url); } catch (e) {} self.flash('Link copied. Paste it in your story.'); },`,
    ],
    [`hardest: hard.q + ' Only ' + hard.pct + ' got it.',`, `hardest: D.hardest,`],
    [`avgRate: '8.2', topCat: 'Vibe',`, `avgRate: D.avgRate, topCat: D.topCat,`],
    (src) => src.replace(/      textTitle: [^\n]*\n      textBody: [^\n]*\n/, `      textTitle: D.textTitle,\n      textBody: D.textBody,\n`),
    (src) => src.replace(/sources: \[\['WhatsApp Status', 62, '#25d366'\][^\n]*?\]\.map\(/, "sources: D.sources.map("),
    [`delOpen: s.delOpen,`, `doDelete: function () { self.props.deleteLink(D.linkId); }, delOpen: s.delOpen,`],
    [`<a href="MyLinks.dc.html" class="btn btn-lg btn-block tap" style="margin-top: 14px; background: #c4213a; color: #ffffff; border: 0">Delete link</a>`, `<button onClick="{{doDelete}}" class="btn btn-lg btn-block tap" style="margin-top: 14px; background: #c4213a; color: #ffffff; border: 0">Delete link</button>`],
  ],
};
