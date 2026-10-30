// Polish round (after launch): icon-only sharing that opens each app, live links between screens, loaders,
// back-swipe that returns to the screen you came from, editable link copy, quiz and rating builders, no demo data.
// Same rules as port-fixups.mjs; these run after every other fixups file for the same board.

const between = (start, end, replacement) => (src) => {
  const a = src.indexOf(start), b = src.indexOf(end, a + start.length);
  if (a < 0 || b < 0) throw new Error("polish fixup: can't find " + (a < 0 ? start : end).slice(0, 60));
  return src.slice(0, a) + replacement + src.slice(b);
};
const line = (re, replacement) => (src) => {
  if (!re.test(src)) throw new Error("polish fixup: no match for " + re);
  return src.replace(re, replacement);
};

// ---------- sharing: round brand icons, no labels (components/layout/ShareKit.tsx does the opening) ----------

/** The icon row's markup; `list` names the render value holding [{ name, label, icon, go }]. */
const ICON_ROW = (list, style = "") =>
  `<div class="sk-share"${style ? ` style="${style}"` : ""}><sc-for list="{{${list}}}" as="d" hint-placeholder-count="8"><button class="sk-share-ic tap" onClick="{{d.go}}" aria-label="{{d.label}}" title="{{d.name}}"><img src="{{d.icon}}" alt=""></button></sc-for></div>`;

/** JS (inside renderVals) building that list; `go` is an expression calling the board's share method with `d[0]`. */
const ICONS = (ids, go) =>
  `[${ids.map((i) => `'${i}'`).join(", ")}].map(function (id) { var d = { wa: ['wa', 'WhatsApp', 'whatsapp'], ig: ['ig', 'Instagram', 'instagram'], sc: ['sc', 'Snapchat', 'snapchat'], tt: ['tt', 'TikTok', 'tiktok'], x: ['x', 'X', 'x'], fb: ['fb', 'Facebook', 'facebook'], tg: ['tg', 'Telegram', 'telegram'], sms: ['sms', 'Messages', 'sms'], copy: ['copy', 'Copy link', 'copy'], save: ['save', 'Save', 'save'], more: ['more', 'More', 'more'] }[id]; return { name: d[1], label: (id === 'copy' || id === 'save' || id === 'more' ? d[1] : 'Share on ' + d[1]), icon: '/brand/' + d[2] + '.svg', go: function () { ${go} } }; })`;

const LOBBY = (gid) => [
  [`<div class="lb-code">K7Q2</div>`, `<div class="lb-code">{{roomCode}}</div>`],
  [`sekretly.com/g/K7Q2 · anyone with the link joins with a random nickname`, `{{joinShort}} · anyone with the link joins with a random nickname`],
  [
    `<div style="display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 8px; margin-top: 12px">
                <button class="btn btn-sm tap" onClick="{{invite}}" style="background: #128c4a; color: #ffffff; border: 0">WhatsApp</button>
                <button class="btn btn-sm tap" onClick="{{invite}}">Copy link</button>
                <button class="btn btn-sm tap" onClick="{{toggleQr}}">QR code</button>
              </div>`,
    `${ICON_ROW("inviteIcons", "margin-top: 12px; justify-content: flex-start")}
              <button class="btn btn-sm btn-block tap" onClick="{{toggleQr}}" style="margin-top: 10px">{{qrLabel}}</button>`,
  ],
  line(
    /<div class="pop" style="margin: 12px auto 0; width: 150px; height: 150px; border-radius: 16px; background: repeating-conic-gradient\([^"]*" role="img" aria-label="QR code for K7Q2"><\/div>/,
    `<img class="pop" src="{{qrSrc}}" alt="QR code to join room {{roomCode}}" style="display: block; margin: 12px auto 0; width: 170px; height: 170px; border-radius: 16px; background: #ffffff">`,
  ),
  line(
    /      invite: function \(\) \{ self\.flash\('Invite ready'[^\n]*\n/,
    `      roomCode: self.props.code, joinShort: ((self.props.origin || '') + '/join/' + self.props.code).replace(/^https?:\\/\\//, ''),
      inviteIcons: ${ICONS(["wa", "sc", "tg", "x", "sms", "copy", "more"], "var u = (self.props.origin || '') + '/join/' + self.props.code; if (window.skShare) window.skShare.open(d[0], { url: u, text: 'Join my ' + (gm.name || 'game') + ' room on Sekretly 🎲 code ' + self.props.code }).then(function (r) { if (r === 'copied') { self.setState({ copied: true }); self.flash('Link copied', u.replace(/^https?:\\/\\//, ''), gm.icon); } });")},
      qrLabel: s.qr ? 'Hide QR code' : 'Show QR code',
      qrSrc: s.qrSrc || '',
`,
  ),
  [
    `qr: s.qr, toggleQr: function () { self.setState({ qr: !s.qr }); },`,
    `qr: s.qr && !!s.qrSrc, toggleQr: function () {
        if (s.qr) { self.setState({ qr: false }); return; }
        var u = (self.props.origin || window.location.origin) + '/join/' + self.props.code;
        import('qrcode').then(function (q) { return q.toDataURL(u, { margin: 1, width: 340 }); }).then(function (src) { self.setState({ qr: true, qrSrc: src }); }).catch(function () {});
      },`,
  ],
];

export const POLISH_FIXUPS = {
  Create: [
    [
      `            <button class="btn btn-lg btn-block tap" onClick="{{shareWa}}" style="margin-top: 14px; background: #128c4a; color: #ffffff; border: 0">Share to WhatsApp Status</button>
            <div style="display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 8px; margin-top: 8px">
              <button class="btn tap" onClick="{{shareIg}}" style="background: linear-gradient(135deg,#7a2ff7,#d81b72 55%,#c2410c); color: #ffffff; border: 0">Instagram</button>
              <button class="btn tap" onClick="{{shareSc}}" style="background: #fffc00; color: #111111; border: 0">Snapchat</button>
              <button class="btn tap" onClick="{{saveCard}}">Save card</button>
            </div>`,
      `            ${ICON_ROW("shareIcons", "margin-top: 16px")}`,
    ],
    [
      `      shareWa: function () { self.share('wa'); },
      shareIg: function () { self.share(); },
      shareSc: function () { self.share(); },
      saveCard: function () { self.share(); },`,
      `      shareIcons: ${ICONS(["wa", "ig", "sc", "tt", "x", "fb", "tg", "save", "more"], "self.share(d[0]);")},`,
    ],
    // the story card is drawn as soon as the link exists, so Instagram/Snapchat/TikTok/Save get the image right away
    [
      `if (r && r.ok) self.setState({ saving: false, step: nextStep, url: r.url, path: r.path, copied: false });`,
      `if (r && r.ok) { self.card = null; self.setState({ saving: false, step: nextStep, url: r.url, path: r.path, copied: false }); setTimeout(function () { self.drawCard(); }, 700); }`,
    ],
    between(
      `  // WhatsApp gets the link as a message; elsewhere the phone's share sheet (or the clipboard) does it.`,
      `  flash(t) {`,
      `  // draws the story card (9:16) once, for the apps that take an image
  drawCard() {
    var self = this, node = document.querySelector('.cr-story');
    if (!node || this.card) return Promise.resolve(this.card);
    return import('html-to-image').then(function (h) {
      return h.toBlob(node, { canvasWidth: 1080, canvasHeight: 1920, pixelRatio: 1, style: { borderRadius: '0', boxShadow: 'none', animation: 'none', transform: 'none' } });
    }).then(function (b) { self.card = b ? new File([b], 'sekretly-story.png', { type: 'image/png' }) : null; return self.card; }).catch(function () { return null; });
  }
  // each app opens on its own "send to" screen with the link filled in; story apps also get the card image
  share(dest) {
    var self = this, url = (/^https?:/.test(this.state.url) ? '' : 'https://') + this.state.url;
    if (!window.skShare) return;
    var withCard = dest === 'ig' || dest === 'sc' || dest === 'tt' || dest === 'save';
    var run = function (card) {
      window.skShare.open(dest, { url: url, text: 'Send me an anonymous message 👀', files: withCard && card ? [card] : undefined }).then(function (r) {
        if (r === 'copied') self.flash(dest === 'ig' || dest === 'tt' ? 'Link copied. Paste it on your story.' : 'Link copied');
        else if (r === 'saved') self.flash('Story card saved');
      });
    };
    if (withCard && !this.card) this.drawCard().then(run); else run(this.card);
  }
`,
    ),
  ],

  LinkDetail: [
    [
      `    <div style="display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 8px; margin-top: 10px">
      <button class="btn tap" onClick="{{copy}}">{{copyLabel}}</button>
      <button class="btn tap" onClick="{{share}}">Share card</button>
      <button class="btn tap" onClick="{{togglePause}}">{{pauseLabel}}</button>
    </div>`,
      `    <div style="display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 8px; margin-top: 10px">
      <button class="btn tap" onClick="{{copy}}">{{copyLabel}}</button>
      <button class="btn tap" onClick="{{togglePause}}">{{pauseLabel}}</button>
    </div>
    ${ICON_ROW("shareIcons", "margin-top: 12px")}`,
    ],
    line(
      /      share: function \(\) \{ if \(navigator\.share\)[^\n]*\n/,
      `      shareIcons: ${ICONS(["wa", "ig", "sc", "tt", "x", "fb", "tg", "more"], "if (window.skShare) window.skShare.open(d[0], { url: 'https://' + url, text: 'Send me an anonymous message 👀' }).then(function (r) { if (r === 'copied') self.flash(d[0] === 'ig' || d[0] === 'tt' ? 'Link copied. Paste it on your story.' : 'Link copied'); });")},\n`,
    ),
  ],

  ShareStudio: [
    [
      `<button class="ss-d tap" onClick="{{d.pick}}" role="radio" aria-checked="{{d.on}}" aria-pressed="{{d.on}}"><span style="background: {{d.bg}}; color: {{d.ink}}">{{d.mark}}</span>{{d.name}}</button>`,
      `<button class="ss-d ss-d-ic tap" onClick="{{d.pick}}" role="radio" aria-checked="{{d.on}}" aria-pressed="{{d.on}}" aria-label="{{d.name}}" title="{{d.name}}"><img src="{{d.icon}}" alt=""></button>`,
    ],
    line(
      /    var DEST = \[\['wa', 'WhatsApp'[^\n]*\n/,
      `    var DEST = [['wa', 'WhatsApp', 'WhatsApp Status', 'whatsapp'], ['ig', 'Instagram', 'your Instagram story', 'instagram'], ['sc', 'Snapchat', 'your Snapchat story', 'snapchat'], ['tt', 'TikTok', 'TikTok', 'tiktok'], ['save', 'Save to photos', 'your photos', 'save']];\n`,
    ),
    [
      `dests: DEST.map(function (x) { var on = s.dest === x[0]; return { name: x[1], bg: x[3], ink: x[4], mark: x[5], on: on ? 'true' : 'false', pick: function () { self.setState({ dest: x[0] }); } }; }),`,
      `dests: DEST.map(function (x) { var on = s.dest === x[0]; return { name: x[1], icon: '/brand/' + x[3] + '.svg', on: on ? 'true' : 'false', pick: function () { self.setState({ dest: x[0] }); } }; }),`,
    ],
    // "Select all" takes every message (all their parts), not just the ones already in the tray
    [
      `toggleAll: function () { var o = {}; if (allOn) flat.forEach(function (c) { o[c.key] = true; }); self.setState({ off: o }); },`,
      `toggleAll: function () {
        if (allOn && !pool.length) { var o = {}; flat.forEach(function (c) { o[c.key] = true; }); self.setState({ off: o }); return; }
        self.setState({ off: {}, tray: s.tray.concat(pool) });
      },`,
    ],
    [`var allOn = anySel === total && total > 0;`, `var pool = Object.keys(M).filter(function (id) { return s.tray.indexOf(id) < 0 && !M[id].promo; });\n    var allOn = anySel === total && total > 0 && !pool.length;`],
    [`    var pool = Object.keys(M).filter(function (id) { return s.tray.indexOf(id) < 0 && !M[id].promo; });\n    var promos =`, `    var promos =`],
    // every card goes: all at once where the app takes several images, else one share per card
    between(
      `  finish(files, dest) {`,
      `  renderVals() {`,
      `  finish(files, dest) {
    var self = this;
    var one = files.length && navigator.canShare && navigator.canShare({ files: [files[0]] });
    if (dest === 'save' || !one) {
      files.forEach(function (f, i) { setTimeout(function () { var a = document.createElement('a'); a.href = URL.createObjectURL(f); a.download = f.name; document.body.appendChild(a); a.click(); a.remove(); }, i * 400); });
      self.setState({ posting: null, done: true, files: files, sentN: files.length, needTap: false });
      return;
    }
    var all = navigator.canShare({ files: files });
    self.setState({ posting: null, files: files, batch: all ? files.length : 1, sentN: 0 }, function () { self.shareBatch(0); });
  }
  // shares the next batch of images; when some are left (or the tap expired) the done sheet offers the next tap
  shareBatch(from) {
    var self = this, files = this.state.files || [], size = this.state.batch || files.length, part = files.slice(from, from + size);
    if (!part.length) return;
    navigator.share({ files: part, title: 'Sekretly' }).then(function () {
      var n = from + part.length;
      self.setState({ done: true, sentN: n, needTap: n < files.length });
    }).catch(function (e) {
      self.setState({ done: true, sentN: from, needTap: !(e && e.name === 'AbortError') || from > 0 });
    });
  }
`,
    ),
    [`>Open share sheet</button>`, `>{{tapLabel}}</button>`],
    [
      `shareNow: function () { if (s.files) navigator.share({ files: s.files, title: 'Sekretly' }).then(function () { self.setState({ needTap: false }); }).catch(function () {}); },`,
      `shareNow: function () { if (s.files) self.shareBatch(s.sentN || 0); },
      tapLabel: s.files && s.sentN > 0 && s.sentN < s.files.length ? 'Post card ' + (s.sentN + 1) + ' of ' + s.files.length : 'Open share sheet',`,
    ],
  ],

  // props added: rooms [{ g, name, joined, max, code }] (open public rooms), links[].href (Link insights)
  Home: [
    // tapping your picture opens your profile
    [`<span class="av" style="background: linear-gradient(135deg,#d6ff6b,#22c4a0)"><img src="/sk/{{avatar}}.png" alt=""></span>`, `<a href="Profile.dc.html" class="av tap" aria-label="Your profile" style="background: linear-gradient(135deg,#d6ff6b,#22c4a0)"><img src="/sk/{{avatar}}.png" alt=""></a>`],
    // the three numbers open the screen they count
    [`<div class="card" style="padding: 14px"><div class="d" style="font-size: 26px; font-weight: 800">{{stats.week}}</div><div class="muted" style="font-size: 12.5px">messages this week</div></div>`, `<a href="Inbox.dc.html" class="card tap sk-stat" style="padding: 14px"><div class="d" style="font-size: 26px; font-weight: 800">{{stats.week}}</div><div class="muted" style="font-size: 12.5px">messages this week</div></a>`],
    [`<div class="card" style="padding: 14px"><div class="d" style="font-size: 26px; font-weight: 800">{{stats.visits}}</div><div class="muted" style="font-size: 12.5px">link visits this week</div></div>`, `<a href="MyLinks.dc.html" class="card tap sk-stat" style="padding: 14px"><div class="d" style="font-size: 26px; font-weight: 800">{{stats.visits}}</div><div class="muted" style="font-size: 12.5px">link visits this week</div></a>`],
    [`<div class="card" style="padding: 14px"><div class="d" style="font-size: 26px; font-weight: 800">{{stats.chats}}</div><div class="muted" style="font-size: 12.5px">active chats</div></div>`, `<a href="/inbox?filter=chats" class="card tap sk-stat" style="padding: 14px"><div class="d" style="font-size: 26px; font-weight: 800">{{stats.chats}}</div><div class="muted" style="font-size: 12.5px">active chats</div></a>`],
    // a link card opens its insights; its Pause button still just pauses
    [`<article class="{{l.th}}" style="flex: none; width: 216px; min-height: 230px; border-radius: 24px; padding: 16px; display: flex; flex-direction: column; scroll-snap-align: start">`, `<article class="{{l.th}}" style="position: relative; flex: none; width: 216px; min-height: 230px; border-radius: 24px; padding: 16px; display: flex; flex-direction: column; scroll-snap-align: start">
              <a href="{{l.href}}" class="sk-stretch" aria-label="Insights for {{l.topic}}"></a>`],
    [`<button class="tap" onClick="{{l.toggle}}" style="margin-top: 10px; min-height: 44px;`, `<button class="tap" onClick="{{l.toggle}}" style="position: relative; z-index: 2; margin-top: 10px; min-height: 44px;`],
    // real open rooms (or a nudge to start one) instead of the demo list
    [`<h3 style="font-size: 15px; margin: 18px 0 10px">Open games near you</h3>`, `<sc-if value="{{noGames}}" hint-placeholder-val="{{ false }}"><a href="CreateGame.dc.html" class="card tap" style="display: flex; align-items: center; gap: 12px; padding: 14px; margin-top: 18px"><img src="/sk/sparkles.png" alt="" style="width: 32px; height: 32px"><span style="flex: 1"><b style="display: block; font-size: 15px">No open games right now</b><span class="muted" style="font-size: 13px">Start one and invite your people</span></span><span class="btn btn-sm btn-cta">Start</span></a></sc-if>
        <sc-if value="{{hasGames}}" hint-placeholder-val="{{ true }}"><h3 style="font-size: 15px; margin: 18px 0 10px">Open games near you</h3></sc-if>`],
    [`<div class="muted" style="font-size: 13px">{{g.type}} · {{g.joined}}/{{g.max}} · {{g.left}} left</div>`, `<div class="muted" style="font-size: 13px">{{g.type}} · {{g.joined}}/{{g.max}} joined</div>`],
    between(`      games: [
`, `
      ],
      showDrop:`, `      games: (this.props.rooms || []).slice(0, 3).map(function (r, i) {
        var T = { nhie: ['Never Have I Ever', E.shush], tod: ['Truth or Dare', E.fire], wyr: ['Would You Rather', E.eyes], mlt: ['Most Likely To', E.sparkles], hot: ['Hot Takes', E.fire], poll: ['Anonymous Polls', E.eyes] }[r.g] || ['Game', E.sparkles];
        var tint = ['linear-gradient(135deg,#ff5fa2,#7a3cff)', 'linear-gradient(135deg,#ffb35c,#ff4f6d)', 'linear-gradient(135deg,#22e1ff,#3a6bff)'][i % 3];
        return { name: r.name, type: T[0], joined: r.joined, max: r.max, icon: T[1], tint: tint, href: '/join/' + r.code, join: function () {} };
      }), hasGames: (this.props.rooms || []).length > 0, noGames: !(this.props.rooms || []).length, sampleGames: [`),
  ],

  Main: [
    // no "your message becomes N cards" note: it isn't the sender's concern
    [`cfHint: cards > 1 ? 'Long one: @' + OWNER + ' reads it as ' + cards + ' cards' : 'Write as much as you want',`, `cfHint: 'Write as much as you want',`],
  ],

  // props added: inboxTimerDays, chatTimerDays, timerSet (chose a timer in Settings › Messages)
  Inbox: [
    // the real timer, straight to Settings › Messages; gone once they've picked one there
    [
      `<a href="Settings.dc.html" class="pill" style="margin-top: 10px; text-decoration: none"><img src="/sk/hourglass_not_done.png" alt="" style="width: 16px; height: 16px">Messages disappear after 1 day · change</a>`,
      `<sc-if value="{{showTimer}}" hint-placeholder-val="{{ true }}"><a href="/settings?s=messages" class="pill" style="margin-top: 10px; text-decoration: none"><img src="/sk/hourglass_not_done.png" alt="" style="width: 16px; height: 16px">{{timerLabel}}</a></sc-if>`,
    ],
    [
      `inArchive: inArchive, notArchive: !inArchive,`,
      `showTimer: !this.props.timerSet, timerLabel: 'Messages disappear after ' + (function (d) { d = d || 1; return d % 7 === 0 ? (d / 7) + (d === 7 ? ' week' : ' weeks') : d + (d === 1 ? ' day' : ' days'); })(this.props.inboxTimerDays) + ' · change',
      inArchive: inArchive, notArchive: !inArchive,`,
    ],
    [`Messages disappear 1 day after they are sent.'`, `Messages disappear ' + (function (d) { d = d || 1; return d % 7 === 0 ? (d / 7) + (d === 7 ? ' week' : ' weeks') : d + (d === 1 ? ' day' : ' days'); })(self.props.chatTimerDays) + ' after they are sent.'`],
  ],

  // the buttons that wait on the server show a spinner and a moving shine while they do (see .sk-busy in sk.css)
  Login: [
    [
      `<button class="btn btn-cta btn-lg btn-block tap" onClick="{{attempt}}" disabled="{{locked}}" style="margin-top: 18px">{{btnLabel}}</button>`,
      `<button class="btn btn-cta btn-lg btn-block tap {{busyCls}}" onClick="{{attempt}}" disabled="{{locked}}" aria-busy="{{busyStr}}" style="margin-top: 18px">{{btnLabel}}</button>`,
    ],
    [`btnLabel: locked ?`, `busyCls: s.busy ? 'sk-busy' : '', busyStr: s.busy ? 'true' : 'false', btnLabel: locked ?`],
  ],
  Signup: [
    [
      `<button onClick="{{submit}}" disabled="{{busy}}" class="btn btn-cta btn-lg btn-block tap" style="margin-top: 18px">{{ctaLabel}}</button>`,
      `<button onClick="{{submit}}" disabled="{{busy}}" class="btn btn-cta btn-lg btn-block tap {{busyCls}}" aria-busy="{{busyStr}}" style="margin-top: 18px">{{ctaLabel}}</button>`,
    ],
    [`busy: !!s.busy, ctaLabel:`, `busy: !!s.busy, busyCls: s.busy ? 'sk-busy' : '', busyStr: s.busy ? 'true' : 'false', ctaLabel:`],
  ],

  NHIELobby: LOBBY("nhie"), TruthDareLobby: LOBBY("tod"), WYRLobby: LOBBY("wyr"), MostLikelyLobby: LOBBY("mlt"), HotTakesLobby: LOBBY("hot"), PollsLobby: LOBBY("poll"),
};

// ---------- back stack: inner views (open message, settings section, step, sheet) are history entries ----------
// lib/sk/runtime skStack(): swiping back returns to the view before; closing from the screen steps history back.
const STACK = (keys) => (src) => {
  const at = "  componentDidMount() {\n";
  if (!src.includes(at)) throw new Error("polish: no componentDidMount for back stack");
  return src.replace(at, at + "    skStack(this, " + JSON.stringify(keys) + ");\n");
};
const STACKS = {
  Inbox: ["openId", "share", "report", "guessOpen", "del", "selMode"],
  Settings: ["sec", "delOpen", "edit"],
  Create: ["step"],
  CreateGame: ["step"],
  Onboarding: ["step"],
  Profile: ["editing", "picker"],
  MyLinks: ["resetOpen"],
  LinkDetail: ["delOpen"],
  ShareStudio: ["done"],
};
for (const [board, keys] of Object.entries(STACKS)) POLISH_FIXUPS[board] = (POLISH_FIXUPS[board] || []).concat([STACK(keys)]);

// ---------- no demo data: the Games hub shows the member's real crews ----------
// props added: crews (from features/crews loadCrews)
POLISH_FIXUPS.GamesHub = (POLISH_FIXUPS.GamesHub || []).concat([
  [`<a href="Crews.dc.html" onClick="{{cr.open}}" class="row"`, `<a href="{{cr.href}}" class="row"`],
  between(
    `      crews: [\n`,
    `      code: s.code,`,
    `      crews: (this.props.crews || []).map(function (c) {
        return { name: c.name, href: '/crews?pick=' + c.id, icon: c.icon, tint: c.bg,
          meta: c.who.length + (c.who.length === 1 ? ' member' : ' members') + (c.streak ? ' · ' + c.streak + '-day streak' : ''),
          next: c.nightTitle, play: function () {} };
      }),
`,
  ),
]);

// Share studio with nothing to share yet: say so instead of an empty stage
POLISH_FIXUPS.ShareStudio = (POLISH_FIXUPS.ShareStudio || []).concat([
  [
    `        <div class="ss-glow {{focusTh}}" aria-hidden="true"></div>`,
    `        <div class="ss-glow {{focusTh}}" aria-hidden="true"></div>
        <sc-if value="{{noCards}}" hint-placeholder-val="{{ false }}"><div class="ss-empty"><img src="/sk/sparkles.png" alt="" style="width: 56px; height: 56px"><b>Nothing to share yet</b><span>When people message you, pick their messages here and post them as story cards. Or add a promo card below.</span><a href="/create" class="btn btn-sm btn-cta tap">Make a link</a></div></sc-if>`,
  ],
  [`      summary: total + ' card'`, `      noCards: total === 0,\n      summary: total + ' card'`],
]);

// Join a game: the code box looks the room up for real; open public rooms instead of demo invites/friends/leaderboard
// props added: peek(code) -> room view | null, rooms [{ g, name, joined, max, code }]
const GAME_NAMES = "{ nhie: 'Never Have I Ever', tod: 'Truth or Dare', wyr: 'Would You Rather', mlt: 'Most Likely To', hot: 'Hot Takes', poll: 'Anonymous Polls' }";
POLISH_FIXUPS.JoinApp = (POLISH_FIXUPS.JoinApp || []).concat([
  [`maxlength="4" placeholder="····"`, `maxlength="5" placeholder="·····"`],
  [
    `<b class="d" style="font-size: 18px">Friday Night Never</b><div style="font-size: 13px; opacity: .85">Never Have I Ever · 3 of 6 seated · Mild → Unhinged</div>`,
    `<b class="d" style="font-size: 18px">{{peekName}}</b><div style="font-size: 13px; opacity: .85">{{peekMeta}}</div>`,
  ],
  [`>Try K7Q2</p>`, `>Ask the host for the 5-letter room code</p>`],
  [
    `self.setState({ code: e.target.value.replace(/[^a-z0-9]/gi, '').toUpperCase().slice(0, 5) }); },`,
    `var c = e.target.value.replace(/[^a-z0-9]/gi, '').toUpperCase().slice(0, 5); self.setState({ code: c }); if (c.length === 5 && self.props.peek) self.props.peek(c).then(function (v) { self.setState({ peek: { code: c, room: v } }); }); },`,
  ],
  line(
    /      joinCode: joinAs\('nhie', 'Friday Night Never'\)[^\n]*\n/,
    `      codeHref: '/join/' + code, codeHint: code.length < 5,
      codeOk: (function () { var p = s.peek; return code.length === 5 && !!p && p.code === code && !!p.room && p.room.status === 'LOBBY'; })(),
      codeBad: (function () { var p = s.peek; return code.length === 5 && !!p && p.code === code && (!p.room || p.room.status !== 'LOBBY'); })(),
      peekName: s.peek && s.peek.room ? s.peek.room.name : '',
      peekMeta: s.peek && s.peek.room ? (${GAME_NAMES}[s.peek.room.game] || 'Game') + ' · ' + s.peek.room.players.length + ' of ' + s.peek.room.max + ' seated' : '',
      rooms: (this.props.rooms || []).map(function (r) { return { name: r.name, type: ${GAME_NAMES}[r.g] || 'Game', joined: r.joined, max: r.max, href: '/join/' + r.code }; }),
      noRooms: !(this.props.rooms || []).length,
`,
  ),
  between(
    `      <div class="sec-h"><h2>Invites for you</h2>`,
    `    </div>\n  </div>\n</div>\n  <nav class="bnav"`,
    `      <div class="sec-h"><h2>Open rooms</h2><a href="GamesHub.dc.html" class="pink" style="font-weight: 700; font-size: 14px">All games</a></div>
      <div style="display: flex; flex-direction: column; gap: 10px">
        <sc-for list="{{rooms}}" as="r" hint-placeholder-count="2">
          <div class="card" style="padding: 12px; display: flex; gap: 12px; align-items: center">
            <span style="flex: 1; min-width: 0"><b>{{r.name}}</b><div class="muted" style="font-size: 12.5px">{{r.type}} · {{r.joined}}/{{r.max}} joined</div></span>
            <a href="{{r.href}}" class="btn btn-sm btn-cta tap">Join</a>
          </div>
        </sc-for>
        <sc-if value="{{noRooms}}" hint-placeholder-val="{{ false }}"><p class="muted" style="font-size: 14px">No open rooms right now. <a href="CreateGame.dc.html" class="pink">Start one</a> and invite your people.</p></sc-if>
      </div>
`,
  ),
]);

// Home link cards: "1 message", not "1 messages"
POLISH_FIXUPS.Home = (POLISH_FIXUPS.Home || []).concat([
  [`<span style="font-size: 13px; opacity: .85">messages · {{l.limit}}</span>`, `<span style="font-size: 13px; opacity: .85">{{l.unit}} · {{l.limit}}</span>`],
  [`return Object.assign({}, l, { status: p ? 'Paused' : 'Live',`, `return Object.assign({}, l, { unit: l.count === 1 ? 'message' : 'messages', status: p ? 'Paused' : 'Live',`],
]);

// Profile word cloud with no answers yet: say how to get some, no "said 0 times" row
POLISH_FIXUPS.Profile = (POLISH_FIXUPS.Profile || []).concat([
  [
    `              <sc-for list="{{words}}" as="w" hint-placeholder-count="12">`,
    `              <sc-if value="{{noWords}}" hint-placeholder-val="{{ false }}"><p class="muted" style="text-align: center; max-width: 30ch; font-size: 14px; line-height: 1.45">No words yet. Share a “Describe me in 3 words” link and the words people pick show up here.</p></sc-if>
              <sc-for list="{{words}}" as="w" hint-placeholder-count="12">`,
  ],
  [
    `<div class="row" style="margin-top: 10px; padding: 10px 12px; border-radius: 14px; background: var(--card2); font-size: 13.5px"><b class="d" style="font-size: 16px; flex: 1">{{pickWord}}</b><span class="muted">said {{pickN}} times · {{pickTrend}}</span></div>`,
    `<sc-if value="{{hasWords}}" hint-placeholder-val="{{ true }}"><div class="row" style="margin-top: 10px; padding: 10px 12px; border-radius: 14px; background: var(--card2); font-size: 13.5px"><b class="d" style="font-size: 16px; flex: 1">{{pickWord}}</b><span class="muted">said {{pickN}} times · {{pickTrend}}</span></div></sc-if>`,
  ],
  [`<a href="MyLinks.dc.html" class="btn tap">Get more words</a>`, `<a href="/create?topic=describe-3" class="btn tap">Get more words</a>`],
  [`      answerCount: (this.props.answerCounts || [0, 0, 0])[s.range],`, `      answerCount: (this.props.answerCounts || [0, 0, 0])[s.range], noWords: !(this.props.answerCounts || [0, 0, 0])[s.range], hasWords: !!(this.props.answerCounts || [0, 0, 0])[s.range],`],
]);

// Lobbies: no demo "Invite friends on Sekretly" list (invites go out through the share icons above)
for (const board of ["NHIELobby", "TruthDareLobby", "WYRLobby", "MostLikelyLobby", "HotTakesLobby", "PollsLobby"])
  POLISH_FIXUPS[board] = POLISH_FIXUPS[board].concat([
    between(
      `            <section class="card" style="overflow: hidden">\n              <div class="row" style="padding: 14px 14px 6px"><b style="flex: 1">Invite friends on Sekretly`,
      `            <section class="card" style="padding: 14px">\n              <div class="row"><b style="flex: 1">Room settings`,
      ``,
    ),
  ]);

// the real address, not the mockup's sekretly.com (signup username prefix, install previews)
for (const board of ["Signup", "Home", "Settings"])
  POLISH_FIXUPS[board] = (POLISH_FIXUPS[board] || []).concat([
    (src) => {
      if (!src.includes(">sekretly.com")) throw new Error(board + ": no sekretly.com text");
      return src.split(">sekretly.com").join(">sekretlyy.vercel.app");
    },
  ]);

// nothing to share until there are words
POLISH_FIXUPS.Profile = POLISH_FIXUPS.Profile.concat([
  [`<a href="ShareStudio.dc.html" onClick="{{shareCloud}}" class="btn btn-cta tap">Share my cloud</a>`, `<sc-if value="{{hasWords}}" hint-placeholder-val="{{ true }}"><a href="ShareStudio.dc.html" onClick="{{shareCloud}}" class="btn btn-cta tap">Share my cloud</a></sc-if>`],
]);
