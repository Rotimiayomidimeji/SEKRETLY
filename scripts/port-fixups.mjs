// Board-specific changes applied by scripts/port-mockup.mjs before converting a board.
// Each entry is [exact text in the mockup board, replacement]. The converter stops if a text is not found,
// so a mockup edit can never silently skip a fix.
//
// Two kinds of fixes live here:
//  - things that would render differently on the server than in the browser (storage reads in constructors)
//  - wiring: the mockup fakes its data; real screens call the server actions their page passes in as props.

const AVATARS = "['fox', 'panda', 'frog', 'octopus', 'unicorn', 'koala']";

export const FIXUPS = {
  Landing: [
    [
      `var ck = null;
    try { ck = window.sessionStorage.getItem('sk-consent'); } catch (e) {}
    if (props.consent === 'show') ck = null;`,
      `// cookie choices are read after mount (sessionStorage only exists in the browser)
    var ck = 'pending';`,
    ],
    [
      `    try { this.motionOn(); } catch (e) {}`,
      `    try { this.motionOn(); } catch (e) {}
    var seen = null;
    try { seen = window.sessionStorage.getItem('sk-consent'); } catch (e) {}
    if (!seen || this.props.consent === 'show') this.setState({ consent: true });`,
    ],
  ],

  // /privacy, /terms and /cookies open the matching tab
  Legal: [[`tab: 'privacy' };`, `tab: props.tab || 'privacy' };`]],

  // props: checkUsername(name) -> { available }, signup(input) -> { error, taken } or redirects
  Signup: [
    [
      `var taken = ['peach', 'maya', 'admin', 'sekretly'];
    var u = s.user, us = 'empty';
    if (u.length) us = !/^[A-Za-z0-9_]{3,20}$/.test(u) ? 'invalid' : (taken.indexOf(u.toLowerCase()) >= 0 ? 'taken' : 'ok');`,
      `var known = (s.taken || {})[s.user.toLowerCase()];
    var u = s.user, us = 'empty';
    if (u.length) us = !/^[A-Za-z0-9_]{3,20}$/.test(u) ? 'invalid' : (known === undefined ? 'checking' : (known ? 'taken' : 'ok'));`,
    ],
    [`var userMsg = { empty: '3–20 letters, numbers or _',`, `var userMsg = { checking: 'Checking @' + u + '…', empty: '3–20 letters, numbers or _',`],
    [`userLine: us === 'ok' ? ok : (us === 'empty' ? line : bad),`, `userLine: us === 'ok' ? ok : (us === 'empty' || us === 'checking' ? line : bad),`],
    [`userMsgColor: us === 'ok' ? ok : (us === 'empty' ? muted : bad),`, `userMsgColor: us === 'ok' ? ok : (us === 'empty' || us === 'checking' ? muted : bad),`],
    [
      `user: u, onUser: function (e) { self.setState({ user: e.target.value.replace(/\\s/g, '') }); },`,
      `user: u, onUser: function (e) { var v = e.target.value.replace(/\\s/g, ''); self.setState({ user: v, error: null }); self.lookUp(v); },`,
    ],
    [`var b = new Date(s.dob), now = new Date(2026, 9, 19);`, `var b = new Date(s.dob), now = new Date();`],
    [
      `        <sc-if value="{{canGo}}" hint-placeholder-val="{{ false }}">
          <a href="{{nextHref}}" onClick="{{saveEmail}}" class="btn btn-cta btn-lg btn-block tap" style="margin-top: 18px">Create my account</a>`,
      `        <sc-if value="{{hasError}}" hint-placeholder-val="{{ false }}"><p role="alert" style="margin-top: 14px; font-size: 14px; font-weight: 700; color: var(--bad)">{{error}}</p></sc-if>
        <sc-if value="{{canGo}}" hint-placeholder-val="{{ false }}">
          <button onClick="{{submit}}" disabled="{{busy}}" class="btn btn-cta btn-lg btn-block tap" style="margin-top: 18px">{{ctaLabel}}</button>`,
    ],
    [
      `      saveEmail: function () { try { window.localStorage.setItem('sk-email', s.email.trim()); window.localStorage.setItem('sk-nav', String(Date.now())); } catch (e) {} },`,
      `      submit: function () { self.submit(); }, busy: !!s.busy, ctaLabel: s.busy ? 'Creating your account…' : 'Create my account',
      hasError: !!s.error, error: s.error || '',`,
    ],
    [
      `  renderVals() {`,
      `  // asks the server whether a username is free (debounced) and remembers each answer
  lookUp(v) {
    var self = this, key = v.toLowerCase();
    clearTimeout(this.lt);
    if (!/^[A-Za-z0-9_]{3,20}$/.test(v) || (this.state.taken || {})[key] !== undefined) return;
    this.lt = setTimeout(function () {
      self.props.checkUsername(key).then(function (r) {
        var t = Object.assign({}, self.state.taken); t[key] = !r.available; self.setState({ taken: t });
      });
    }, 300);
  }
  // creates the account; the server logs the person in and moves them on (verify email, or onboarding)
  submit() {
    var self = this, s = this.state;
    if (s.busy) return;
    this.setState({ busy: true, error: null });
    this.props.signup({ username: s.user, password: s.pass, birthDate: s.dob, avatar: ${AVATARS}[s.av % 6], email: s.emailOpen ? s.email : '', acceptedTerms: s.terms })
      .then(function (r) {
        if (!r) return;
        var t = Object.assign({}, self.state.taken);
        if (r.taken) t[s.user.toLowerCase()] = true;
        self.setState({ busy: false, error: r.error || null, taken: t });
      });
  }
  renderVals() {`,
    ],
  ],

  // props: login({ username, password, next }) -> { left, locked } or redirects
  Login: [
    [
      `var correct = s.user.trim().toLowerCase() === 'peach' && s.pass === 'sekret123';
    var locked = s.tries >= 5;`,
      `var correct = false; // the server decides
    var locked = !!s.locked;`,
    ],
    [
      `'That username and password do not match. ' + (5 - s.tries) + ' tries left.'`,
      `'That username and password do not match. ' + (s.left == null ? 5 - s.tries : s.left) + (s.left === 1 ? ' try left.' : ' tries left.')`,
    ],
    [`btnLabel: locked ? 'Locked for 15 minutes' : 'Log in',`, `btnLabel: locked ? 'Locked for 15 minutes' : s.busy ? 'Logging in…' : 'Log in',`],
    [`\n      <p class="muted" style="margin-top: 10px; font-size: 12.5px; text-align: center">Demo: log in as <b>peach</b> / <b>sekret123</b></p>`, ``],
    [
      `attempt: function () { if (!locked) self.setState({ tries: s.tries + 1, shake: s.shake + 1 }); }`,
      `attempt: function () {
        if (locked || s.busy) return;
        self.setState({ busy: true });
        self.props.login({ username: s.user, password: s.pass, next: self.props.next || '' }).then(function (r) {
          if (!r) return;
          self.setState({ busy: false, tries: self.state.tries + 1, shake: self.state.shake + 1, left: r.left, locked: !!r.locked });
        });
      }`,
    ],
  ],

  // props: email (masked or full), verified, verify(code) -> { ok, reason }, resend()
  Verify: [
    [
      `try { em = window.localStorage.getItem('sk-email') || ''; this.nav = window.localStorage.getItem('sk-nav') || ''; } catch (e) { this.nav = ''; }
    return { email: em || 'peach@gmail.com', code: '', wrong: false, done: false, wait: 30 };`,
      `em = this.props.email || ''; this.nav = '';
    return { email: em, code: '', wrong: false, done: !!this.props.verified, wait: 30 };`,
    ],
    [
      `      var nv = ''; try { nv = window.localStorage.getItem('sk-nav') || ''; } catch (e) {}
      if (nv !== self.nav) { self.setState(self.arrive()); return; }
`,
      ``,
    ],
    [
      `      verify: function () { if (s.code === '000000') self.setState({ wrong: true }); else self.setState({ done: true }); },`,
      `      verify: function () {
        if (s.busy) return;
        self.setState({ busy: true });
        self.props.verify(s.code).then(function (r) { self.setState(r && r.ok ? { busy: false, done: true } : { busy: false, wrong: true, why: r && r.reason }); });
      },`,
    ],
    [
      `codeShort: s.code.length < 6, wrong: s.wrong,`,
      `codeShort: s.code.length < 6 || !!s.busy, wrong: s.wrong,
      wrongText: s.why === 'expired' ? 'That code has expired or was tried too many times. Tap Resend for a new one.' : 'That code doesn’t match. Check the newest email and try again.',`,
    ],
    [`That code doesn’t match. Check the newest email and try again.</p>`, `{{wrongText}}</p>`],
    [
      `      resend: function () { if (s.wait === 0) self.setState({ wait: 30, code: '', wrong: false }); }`,
      `      resend: function () { if (s.wait === 0) { self.setState({ wait: 30, code: '', wrong: false }); self.props.resend(); } }`,
    ],
    [`\n          <p class="muted" style="margin-top: 12px; font-size: 12.5px; text-align: center">Demo: any 6 digits work except 000000.</p>`, ``],
  ],

  // props: startReset(username) -> { ok, masked } | { noEmail } | { error }, checkReset(username, code), finishReset(username, code, password)
  Forgot: [
    [`var hasEmail = s.user.trim().toLowerCase() !== 'maya';`, `var hasEmail = s.hasEmail !== false;`],
    [`onUser: function (e) { self.setState({ user: e.target.value.trim(), tried: false }); },`, `onUser: function (e) { self.setState({ user: e.target.value.trim(), tried: false, hasEmail: null, err: null }); },`],
    [`noUser: s.user.length < 3,`, `noUser: s.user.length < 3 || !!s.busy,`],
    [
      `      sendCode: function () { if (hasEmail) self.setState({ step: 1 }); else self.setState({ tried: true }); },`,
      `      sendCode: function () {
        if (s.busy) return;
        self.setState({ busy: true, err: null });
        self.props.startReset(s.user).then(function (r) {
          if (r.ok) self.setState({ busy: false, step: 1, masked: r.masked });
          else if (r.noEmail) self.setState({ busy: false, tried: true, hasEmail: false });
          else self.setState({ busy: false, err: r.error });
        });
      },`,
    ],
    [
      `      verify: function () { self.setState({ step: 2 }); },`,
      `      verify: function () {
        if (s.busy) return;
        self.setState({ busy: true, err: null });
        self.props.checkReset(s.user, s.code).then(function (r) { self.setState(r.ok ? { busy: false, step: 2 } : { busy: false, err: r.error }); });
      },`,
    ],
    [`      resend: function () { self.setState({ resent: true }); },`, `      resend: function () { self.setState({ resent: true, err: null }); self.props.startReset(s.user); },`],
    [
      `      finish: function () { self.setState({ step: 3 }); }`,
      `      finish: function () {
        if (s.busy) return;
        self.setState({ busy: true, err: null });
        self.props.finishReset(s.user, s.code, s.np).then(function (r) { self.setState(r.ok ? { busy: false, step: 3 } : { busy: false, err: r.error }); });
      },
      hasErr: !!s.err, err: s.err || '', masked: s.masked || ''`,
    ],
    [`<b style="color: var(--ink)">p•••••@gmail.com</b>`, `<b style="color: var(--ink)">{{masked}}</b>`],
    [`\n          <p class="muted" style="margin-top: 10px; font-size: 12.5px; text-align: center">Demo: “peach” has an email, “maya” does not.</p>`, ``],
    [
      `      <sc-if value="{{s0}}" hint-placeholder-val="{{ true }}">`,
      `      <sc-if value="{{hasErr}}" hint-placeholder-val="{{ false }}"><p role="alert" style="margin-top: 14px; font-size: 14px; font-weight: 700; color: var(--bad)">{{err}}</p></sc-if>
      <sc-if value="{{s0}}" hint-placeholder-val="{{ true }}">`,
    ],
  ],

  // props: username, from ('link' when they joined from someone's link), to, complete()
  Onboarding: [
    [
      `try { o = JSON.parse(window.localStorage.getItem('sk-onb') || 'null'); this.nav = window.localStorage.getItem('sk-nav') || ''; } catch (e) { this.nav = ''; }`,
      `o = this.props.from === 'link' ? { from: 'link', user: this.props.username, to: this.props.to } : null; this.nav = '';`,
    ],
    [
      `    this.nt = setInterval(function () { var nv = ''; try { nv = window.localStorage.getItem('sk-nav') || ''; } catch (e) {} if (nv !== self.nav) self.setState(self.arrive()); }, 700);\n`,
      `    // the browser offers "install" once the app qualifies; keep the event so the button can show it
    try { window.addEventListener('beforeinstallprompt', this.onBip = function (e) { e.preventDefault(); self.bip = e; }); } catch (e) {}\n`,
    ],
    [`who: s.onb && s.onb.user ? s.onb.user : 'peach'`, `who: s.onb && s.onb.user ? s.onb.user : (self.props.username || 'you')`],
    [
      `      askPush: function () { self.setState({ pushPrompt: true }); },`,
      `      askPush: function () {
        // subscribes this phone for push (see components/layout/PushBridge); iPhone needs the app installed first
        if (!window.skPush || !window.skPush.supported) { self.setState({ push: false }); return; }
        window.skPush.enable().then(function (r) { self.setState({ push: r === 'on' }); });
      },`,
    ],
    [
      `      askInstall: function () { self.setState({ installPrompt: true }); },`,
      `      askInstall: function () {
        if (self.bip) { self.bip.prompt(); self.bip.userChoice.then(function (c) { if (c.outcome === 'accepted') self.setState({ installed: true }); }); }
        else self.setState({ manual: true });
      },
      manual: !!s.manual,`,
    ],
    [
      `              <button class="btn btn-cta btn-lg btn-block tap" onClick="{{askInstall}}" style="margin-top: 18px">Install Sekretly</button>`,
      `              <button class="btn btn-cta btn-lg btn-block tap" onClick="{{askInstall}}" style="margin-top: 18px">Install Sekretly</button>
              <sc-if value="{{manual}}" hint-placeholder-val="{{ false }}"><p class="muted" style="margin-top: 10px; font-size: 13.5px; line-height: 1.5">Open your browser menu (⋮) and tap <b>Install app</b> or <b>Add to Home screen</b>.</p></sc-if>`,
    ],
    [`      finishHref: s.onb`, `      finish: function () { if (self.props.complete) self.props.complete(); },\n      finishHref: s.onb`],
    [`<a href="{{finishHref}}" class="btn btn-lg btn-block tap"`, `<a href="{{finishHref}}" onClick="{{finish}}" class="btn btn-lg btn-block tap"`],
    [`<a href="Create.dc.html" class="btn btn-ghost btn-block tap" style="margin-top: 6px; border: 0">Make my own link too</a>`, `<a href="Create.dc.html" onClick="{{finish}}" class="btn btn-ghost btn-block tap" style="margin-top: 6px; border: 0">Make my own link too</a>`],
    [`<a href="Home.dc.html" class="muted" style="display: inline-flex;`, `<a href="Home.dc.html" onClick="{{finish}}" class="muted" style="display: inline-flex;`],
  ],
};
