// Round 5: images that really reach the app, a working "Edit in studio" for many messages, the inbox's quick post
// making real cards, and downloads that never clash with an earlier one.
// Same rules as port-fixups.mjs; these run last, so they match the text the earlier fixups left.

// A website can't drop a picture into one chosen app. The phone's share list can: the images go in attached and you
// tap the app (WhatsApp then asks chat or My status; Instagram asks story or feed). So tapping an app shares the
// images through that list; saving to the gallery is for computers, and for "Save images".
const QUICK = [
  ["wa", "WhatsApp Status", "#25d366", "#0b2a1c"],
  ["ig", "Instagram story", "linear-gradient(135deg,#7a2ff7,#d81b72 55%,#f29b38)", "#ffffff"],
  ["sc", "Snapchat", "#fffc00", "#111111"],
  ["tt", "TikTok", "#111111", "#ffffff"],
  ["save", "Save images", "var(--card)", "var(--ink)"],
];

const swap = (a, b) => (src) => {
  if (!src.includes(a)) throw new Error("round5 fixup: can't find " + a.slice(0, 60));
  return src.split(a).join(b);
};

// the confession button: "Spill it" says what it is without sounding like a form (and fits a long or a short one)
const SPILL = [swap(`'Send confession'`, `'Spill it'`)];

export const ROUND5_FIXUPS = {
  // the username box holds just the username (the site address in front of it read as part of the box)
  Signup: [swap(`<span class="muted" style="font-size: 15px">sekretlyy.vercel.app/</span>`, ``)],
  Main: SPILL,
  Create: SPILL,

  Inbox: [
    // the share button unmounted under the finger (the selection cleared as it was tapped), so the page never changed;
    // leaving the inbox resets the selection anyway
    [`bulkStash: function () { stashOf(shareList)(); self.setState({ selMode: false, chosen: {} }); },`, `bulkStash: function () { stashOf(shareList)(); },`],
    [`bulkStashFromQuick: function () { stashOf(s.quick ? s.quick.list : shareList)(); self.setState({ selMode: false, chosen: {}, quick: null }); },`, `bulkStashFromQuick: function () { stashOf(s.quick ? s.quick.list : shareList)(); },`],
    [`chatStash: function () { stashOf(chatList)(); self.setState({ chatSel: false, chatChosen: {} }); },`, `chatStash: function () { stashOf(chatList)(); },`],
    // quick post used to only play an animation; now it opens the studio, which draws the cards and posts them
    (src) => {
      const re = /      quickDests: \[\['WhatsApp Status'[\s\S]*?\n      \}\),\n/;
      if (!re.test(src)) throw new Error("round5 fixup: can't find quickDests");
      return src.replace(
        re,
        `      quickDests: ${JSON.stringify(QUICK).replace(/"/g, "'")}.map(function (d) {
        return { name: d[1], bg: d[2], ink: d[3], span: d[0] === 'save' ? '1 / -1' : 'auto', go: function () { stashOf(s.quick ? s.quick.list : shareList)(); try { window.localStorage.setItem('sk-post', d[0]); } catch (e) {} } };
      }),
`,
      );
    },
    // count the cards the studio will post (the big ones), not the inbox's small pages
    [`(s.quick ? s.quick.list : []).forEach(function (x) { var p = split(x.text, 260);`, `(s.quick ? s.quick.list : []).forEach(function (x) { var p = split(x.text, 620);`],
    [
      `<button class="btn btn-lg tap" onClick="{{qd.go}}" style="background: {{qd.bg}}; color: {{qd.ink}}; border: 0">{{qd.name}}</button>`,
      `<a href="ShareStudio.dc.html" onClick="{{qd.go}}" class="btn btn-lg tap" style="background: {{qd.bg}}; color: {{qd.ink}}; border: 0; grid-column: {{qd.span}}">{{qd.name}}</a>`,
    ],
  ],

  ShareStudio: [
    // the inbox's quick post names the app in sk-post: the studio draws the cards and goes straight to posting
    [
      `dest: 'wa', posting: null, posted: {}, sent: null, done: false, friends: false, sentTo: {} };`,
      `dest: this.autoPost || 'wa', posting: null, posted: {}, sent: null, done: false, friends: false, sentTo: {}, ready: false };`,
    ],
    [`    this.extra = extra;\n`, `    this.extra = extra;\n    this.autoPost = ''; try { this.autoPost = window.localStorage.getItem('sk-post') || ''; window.localStorage.removeItem('sk-post'); } catch (e) {}\n`],
    [
      `    this.setState(this.arrive(this.state.mode));`,
      `    var start = this.arrive(this.state.mode), d = this.autoPost || this.queued || '';\n    this.queued = d; // dev mounts twice and the second arrive finds sk-post already used\n    this.setState(start, function () { if (d && self.queued) { self.queued = ''; setTimeout(function () { self.runPost(self.pubKeys || [], d); }, 50); } });`,
    ],
    // every download gets its own name, so the phone never asks to "download the file again"
    [`    var files = [], k = 0;`, `    var files = [], k = 0, stamp = new Date().toISOString().slice(0, 19).replace(/[-:T]/g, '');`],
    [`files.push(new File([f], 'sekretly-' + (k + 1) + '.png'`, `files.push(new File([f], 'sekretly-' + stamp + '-' + (k + 1) + '.png'`],
    // the images go to the app through the share list (Android too, not just iPhones). Drawing can outlast the tap;
    // then the cards wait, ready, for one more tap
    [
      `    var can = ios && dest !== 'save' && files.length`,
      `    if (files.length && navigator.userActivation && !navigator.userActivation.isActive) { self.setState({ posting: null, files: files, pendingKeys: keys, lastDest: dest, sentN: 0, done: true, needTap: true, ready: true }); return; }\n    var can = dest !== 'save' && files.length`,
    ],
    [
      `shareNow: function () {`,
      `shareNow: function () { if (s.ready) { self.setState({ ready: false, done: false }); self.finish(s.files || [], s.lastDest, s.pendingKeys || []); return; }`,
    ],
    [
      `doneOpen: s.done, doneTitle: (function () {`,
      `doneOpen: s.done, doneTitle: s.ready ? (s.files || []).length + ((s.files || []).length === 1 ? ' card is ready' : ' cards are ready') : (function () {`,
    ],
    [
      `tapLabel: s.savedOnly && s.via === 'app'`,
      `tapLabel: s.ready ? (s.lastDest === 'save' ? 'Save the images' : 'Post to ' + ((DEST.filter(function (x) { return x[0] === s.lastDest; })[0] || DEST[0])[1])) : s.savedOnly && s.via === 'app'`,
    ],
    // drawing a card is heavy on a phone: a breather between cards keeps scrolling and taps smooth meanwhile
    [
      `var next = function () { if (!keys.length || self.state.posting) return; self.draw(keys.shift()).then(next, next); };`,
      `var gap = function () { setTimeout(function () { (window.requestIdleCallback || setTimeout)(next); }, 150); };\n      var next = function () { if (!keys.length || self.state.posting) return; self.draw(keys.shift()).then(gap, gap); };`,
    ],
    [`again: function () { self.setState({ done: false, posted: {}, sent: null }); },`, `again: function () { self.setState({ done: false, posted: {}, sent: null, ready: false }); },`],
  ],
};
