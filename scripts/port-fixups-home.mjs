// Phase 3 wiring: Home and Notifications read real data.
// Same rules as port-fixups.mjs: [exact mockup text, replacement] pairs (the converter stops if one is missing),
// or a function for changes a plain replacement can't express. Images are already /sk/ paths when these run.

const between = (start, end, replacement) => (src) => {
  const a = src.indexOf(start), b = src.indexOf(end, a + start.length);
  if (a < 0 || b < 0) throw new Error("fixup: can't find " + (a < 0 ? start : end).slice(0, 50));
  return src.slice(0, a) + replacement + src.slice(b);
};

export const HOME_FIXUPS = {
  // props: username, avatar, greeting, unread (inbox), notifUnread, links (from loadMyLinks, newest 3), setPaused(id, paused),
  //        streak, hintCount, drop { question, secondsLeft, sub }, spots[{ title, sub, icon, href, bg, ink, line }]
  Home: [
    // the install drop-down already offers this; the card only crowded the right rail
    [`        <div class="card" style="padding: 16px">
          <b>Get Sekretly as an app</b>
          <p class="muted" style="font-size: 13.5px; margin-top: 4px">One tap, no app store.</p>
          <button class="btn btn-sm btn-block tap" onClick="{{askInstall}}" style="margin-top: 10px">Install</button>
        </div>
`, ``],
    [`<span class="av" style="background: linear-gradient(135deg,#d6ff6b,#22c4a0)"><img src="/sk/frog.png" alt=""></span>`, `<span class="av" style="background: linear-gradient(135deg,#d6ff6b,#22c4a0)"><img src="/sk/{{avatar}}.png" alt=""></span>`],
    [`<div class="muted" style="font-size: 13px">Good evening</div>`, `<div class="muted" style="font-size: 13px">{{greeting}}</div>`],
    [`>Hey, peach</div>`, `>Hey, {{username}}</div>`],
    [
      `<a href="Notifications.dc.html" class="icon-btn tap" aria-label="Notifications, 3 unread">
            <img class="wave" src="/sk/bell.png" alt="" style="width: 26px; height: 26px">
            <span class="badge">3</span>`,
      `<a href="Notifications.dc.html" class="icon-btn tap" aria-label="Notifications, {{notifUnread}} unread">
            <img class="wave" src="/sk/bell.png" alt="" style="width: 26px; height: 26px">
            <sc-if value="{{hasNotif}}" hint-placeholder-val="{{ true }}"><span class="badge">{{notifUnread}}</span></sc-if>`,
    ],
    [`>{{count}} new messages</div>`, `>{{countLabel}}</div>`],
    [`<div style="margin-top: 6px; font-size: 15px; color: rgba(255,255,255,.88)">since you last checked · 2 left a hint</div>`, `<div style="margin-top: 6px; font-size: 15px; color: rgba(255,255,255,.88)">{{countSub}}</div>`],
    [`aria-label="Your streak, 12 days"`, `aria-label="Your streak, {{streakLabel}}"`],
    [`</svg>12
`, `</svg>{{streak}}
`],
    [`>What’s one thing people get wrong about me?</div>`, `>{{dropQ}}</div>`],
    [`>Fox, KolaNut and 9 others dropped · tap to drop yours</div>`, `>{{dropSub}}</div>`],
    [`if (t % 5 === 0) n.spot = (s.spot + 1) % 5;`, `if (t % 5 === 0) n.spot = (s.spot + 1) % Math.max(1, (self.props.spots || []).length);`],
    between(`    var SP = [
`, `
    var sp = SP[s.spot];`, `    var SP = this.props.spots && this.props.spots.length ? this.props.spots : [{ title: 'Your week, wrapped', sub: 'See what people said this week', icon: E.sparkles, href: 'WeeklyWrap.dc.html', bg: 'linear-gradient(135deg,#22337d,#7a3cff 70%,#d81b72)', ink: '#ffffff', line: 'transparent' }];`),
    [`    var sp = SP[s.spot];`, `    var sp = SP[s.spot % SP.length];`],
    [
      `count: 4, drop: false, installPrompt: false, installed: false, toast: null, paused: { confess: true }, hero: 0, spot: 0, left: 5 * 3600 + 42 * 60, tick: 0 };`,
      `count: props.unread || 0, drop: false, installPrompt: false, installed: false, toast: null, paused: (props.links || []).reduce(function (p, l) { if (l.paused) p[l.id] = true; return p; }, {}), hero: 0, spot: 0, left: props.drop ? props.drop.secondsLeft : 0, tick: 0 };`,
    ],
    // a real install prompt (the browser's), shown only when the browser offers one; no demo message after 9 seconds
    between(
      `    this.t1 = setTimeout(function () { if (!self.state.installed) self.setState({ drop: true }); }, 2500);`,
      `  }\n  componentWillUnmount()`,
      `    try { window.addEventListener('beforeinstallprompt', this.onBip = function (e) { e.preventDefault(); self.bip = e; self.t1 = setTimeout(function () { if (!self.state.installed) self.setState({ drop: true }); }, 2500); }); } catch (e) {}
`,
    ),
    [
      `  componentDidUpdate(prev) { if (prev.mode !== this.props.mode && this.props.mode) this.setState({ mode: this.props.mode }); }`,
      `  componentDidUpdate(prev) {
    var self = this;
    if (prev.mode !== this.props.mode && this.props.mode) this.setState({ mode: this.props.mode });
    // the page refreshes every few seconds; a bigger unread count means something new arrived
    if (prev.unread !== this.props.unread) {
      var more = (this.props.unread || 0) > this.state.count;
      this.setState({ count: this.props.unread || 0, toast: more ? 'msg' : this.state.toast });
      if (more) { clearTimeout(this.t3); this.t3 = setTimeout(function () { if (self.state.toast === 'msg') self.setState({ toast: null }); }, 4400); }
    }
  }`,
    ],
    [`try { window.removeEventListener('storage', this.onStore); } catch (e) {} clearInterval(this.rot);`, `try { window.removeEventListener('storage', this.onStore); window.removeEventListener('beforeinstallprompt', this.onBip); } catch (e) {} clearInterval(this.rot);`],
    between(`    var base = [\n`, `\n    var toasts = {`, `    var base = this.props.links || [];`),
    [`msg: { title: 'Someone sent you a message', sub: 'on Rate me 1–10 · just now',`, `msg: { title: 'Someone sent you a message', sub: 'Tap to read · just now',`],
    [
      `      count: s.count,`,
      `      count: s.count, navInbox: s.count, countLabel: s.count === 0 ? 'No new messages' : s.count + (s.count === 1 ? ' new message' : ' new messages'),
      countSub: s.count === 0 ? 'share a link to get some · tap to open' : 'since you last checked' + (this.props.hintCount ? ' · ' + this.props.hintCount + ' left a hint' : ' · tap to read'),
      streak: this.props.streak || 0, streakLabel: (this.props.streak || 0) + ((this.props.streak || 0) === 1 ? ' day' : ' days'), dropQ: this.props.drop ? this.props.drop.question : '', dropSub: this.props.drop ? this.props.drop.sub : '',
      notifUnread: this.props.notifUnread || 0, hasNotif: (this.props.notifUnread || 0) > 0,`,
    ],
    [
      `toggle: function () { var n = Object.assign({}, s.paused); n[l.id] = !p; self.setState({ paused: n }); } });`,
      `toggle: function () { var n = Object.assign({}, s.paused); n[l.id] = !p; self.setState({ paused: n }); self.props.setPaused(l.id, !p); } });`,
    ],
    [
      `      askInstall: function () { self.setState({ installPrompt: true }); },`,
      `      askInstall: function () {
        if (self.bip) {
          self.bip.prompt();
          self.bip.userChoice.then(function (c) { if (c && c.outcome === 'accepted') { self.setState({ installed: true, drop: false, toast: 'installed' }); } self.bip = null; });
          return;
        }
        self.setState({ toast: 'manual' });
        clearTimeout(self.t4); self.t4 = setTimeout(function () { if (self.state.toast === 'manual') self.setState({ toast: null }); }, 5200);
      },`,
    ],
    [
      `      installed: { title: 'Sekretly is on your home screen', sub: 'Open it like any other app', icon: E.sparkles, href: 'Home.dc.html' }`,
      `      installed: { title: 'Sekretly is on your home screen', sub: 'Open it like any other app', icon: E.sparkles, href: 'Home.dc.html' },
      manual: { title: 'Add Sekretly to your home screen', sub: 'Open your browser menu (⋮ or Share) and tap “Add to Home screen”', icon: E.sparkles, href: 'Home.dc.html' }`,
    ],
  ],

  // props: items (from loadNotifications), unread, markRead(ids), markAllRead()
  Notifications: [
    // this is the notifications page: its own menu entry needs no count
    [`unread: unread, hasUnread: unread > 0,`, `unread: unread, hasUnread: false,`],
    between(`    var N = [\n`, `\n    var shown =`, `    var N = this.props.items || [];`),
    [
      `read: function () { var r = Object.assign({}, s.read); r[n.id] = true; self.setState({ read: r });`,
      `read: function () { var r = Object.assign({}, s.read); r[n.id] = true; self.setState({ read: r }); if (n.unread) self.props.markRead([n.id]);`,
    ],
    [
      `markAll: function () { var r = {}; N.forEach(function (n) { r[n.id] = true; }); self.setState({ read: r }); },`,
      `markAll: function () { var r = {}; N.forEach(function (n) { r[n.id] = true; }); self.setState({ read: r }); self.props.markAllRead(); },`,
    ],
  ],
};
