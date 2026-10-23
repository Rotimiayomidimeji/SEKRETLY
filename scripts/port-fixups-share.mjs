// Phase 3 wiring: the Share studio makes real story images and posts them through the phone's share sheet.
// Same rules as port-fixups.mjs: [exact mockup text, replacement] pairs (the converter stops if one is missing),
// or a function for changes a plain replacement can't express. Images are already /sk/ paths when these run.

const between = (start, end, replacement) => (src) => {
  const a = src.indexOf(start), b = src.indexOf(end, a + start.length);
  if (a < 0 || b < 0) throw new Error("ShareStudio fixup: can't find " + (a < 0 ? start : end).slice(0, 50));
  return src.slice(0, a) + replacement + src.slice(b);
};

export const SHARE_FIXUPS = {
  // props: pool { id: { topic, th, icon, text } } (recent messages), promos { id: { promo, topic, th, icon, text } }, brand, ads
  ShareStudio: [
    [`<div class="sk" data-mode="{{mode}}">`, `<div class="sk" data-mode="{{mode}}" data-ads="{{ads}}">`],
    [`<div class="ss-card {{c.th}}">`, `<div class="ss-card {{c.th}}" data-card="{{c.key}}">`],
    [`<button class="btn btn-cta btn-lg btn-block tap" onClick="{{post}}"`, `<sc-if value="{{drawErr}}" hint-placeholder-val="{{ false }}"><p role="alert" style="margin-top: 10px; font-weight: 800; color: #ff8b98">Couldn’t make the images. Try again.</p></sc-if>
      <button class="btn btn-cta btn-lg btn-block tap" onClick="{{post}}"`],
    [`<div class="ss-brand"><b>SEKRETLY</b><span>sekretly.com/peach</span></div>`, `<div class="ss-brand"><b>SEKRETLY</b><span>{{brand}}</span></div>`],
    // in-app sending to friends comes with crews; until then only public posting and saving
    [
      `<button class="btn btn-block tap" onClick="{{openFriends}}" disabled="{{noAny}}" style="margin-top: 8px; gap: 8px">`,
      `<button class="btn btn-block tap" onClick="{{openFriends}}" disabled="{{noAny}}" style="margin-top: 8px; gap: 8px; display: none">`,
    ],
    [`>🔒 cards are your own words. They can go to friends on Sekretly, but never to public stories.<`, `>🔒 cards are your own words, so they never go to public stories.<`],
    // when the share sheet needs a fresh tap (it does after a long render), the done sheet offers one
    [
      `<button class="btn btn-lg tap" onClick="{{again}}" style="flex: 1">Post elsewhere</button>`,
      `<sc-if value="{{needTap}}" hint-placeholder-val="{{ false }}"><button class="btn btn-cta btn-lg tap" onClick="{{shareNow}}" style="flex: 1">Open share sheet</button></sc-if>
          <button class="btn btn-lg tap" onClick="{{again}}" style="flex: 1">Post elsewhere</button>`,
    ],
    // the tray comes from browser storage, so it is read after the first render (no server/browser mismatch)
    [
      `    this.state = this.arrive(m || props.mode || 'dark');`,
      `    this.extra = {};
    this.state = { mode: m || props.mode || 'dark', tray: [], off: {}, theme: {}, paint: false, focus: 0, dest: 'wa', posting: null, posted: {}, sent: null, done: false, friends: false, sentTo: {}, files: null, needTap: false };`,
    ],
    [`tray: picked.length ? picked : ['m5', 'm0', 'o1'],`, `tray: picked.length ? picked : Object.keys(all).filter(function (id) { return !all[id].promo; }).slice(0, 3),`],
    between(`    return Object.assign({\n`, `    }, this.extra || {});`, `    return Object.assign({}, this.props.pool || {}, this.props.promos || {}, {
`),
    [
      `    this.nt = setInterval(function () { var nv = ''; try { nv = window.localStorage.getItem('sk-nav') || ''; } catch (e) {} if (nv !== self.nav) { clearInterval(self.tk); clearTimeout(self.dt); self.setState(self.arrive(self.state.mode)); } }, 700);`,
      `    this.setState(this.arrive(this.state.mode));
    // load the image maker now so posting starts straight away
    import('html-to-image').catch(function () {});`,
    ],
    [`        d: d, s: d === 0 ? 1 : 0.84,`, `        key: c.key, d: d, s: d === 0 ? 1 : 0.84,`],
    // posting: each card comes to the middle, is drawn as a 1080×1920 image (without the on-screen controls),
    // then the images go to the share sheet in order, or download when saving
    between(
      `  runPost(keys, dest) {`,
      `  renderVals() {`,
      `  runPost(keys, dest) {
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
`,
    ),
    [
      `      again: function () {`,
      `      needTap: s.needTap, drawErr: !!s.drawErr,
      shareNow: function () { if (s.files) navigator.share({ files: s.files, title: 'Sekretly' }).then(function () { self.setState({ needTap: false }); }).catch(function () {}); },
      brand: this.props.brand || '', ads: this.props.ads === 'on' ? 'on' : 'off',
      again: function () {`,
    ],
  ],
};
