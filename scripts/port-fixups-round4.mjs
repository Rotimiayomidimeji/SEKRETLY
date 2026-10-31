// Round 4: Mystery receipts switch, push confirmation once, admin without a member account, share cards that hold
// more text, apps opened straight from the Share studio, theme-coloured focus on link pages, real contact details.
// Same rules as port-fixups.mjs; these run last, so they match the text the earlier fixups left.

const all = (a, b) => (src) => {
  if (!src.includes(a)) throw new Error("round4 fixup: can't find " + a.slice(0, 60));
  return src.split(a).join(b);
};

// the free, confidential lines (SURPIN is Nigeria's Lifeline International member; MANI runs a peer line)
const HELP = "SURPIN, free on 0800 078 7746 (24 hours) or 0908 021 7555, or MANI on 0809 111 6264";

// the admin isn't a member, so its menu leads to its own account page (password, log out) instead of the app
const ADMIN_NAV = [
  [`>Back to app</a>`, `>Account &amp; log out</a>`],
  [`>← Back to the app</a>`, `>Account &amp; log out</a>`],
  all(`href="Home.dc.html" class="nav-i" style="margin-top: auto"`, `href="/admin/account" class="nav-i" style="margin-top: auto"`),
  all(`href="Home.dc.html" class="anav-s"`, `href="/admin/account" class="anav-s"`),
];

export const ROUND4_FIXUPS = {
  Admin: ADMIN_NAV,
  AdminAds: ADMIN_NAV,
  AdminCategories: ADMIN_NAV,
  AdminReports: ADMIN_NAV,
  AdminTraffic: ADMIN_NAV,
  AdminUsers: ADMIN_NAV,

  // props: settings.avatar / settings.avatarBg (the Account row shows your own animal), settings.mys.rcpt
  Settings: [
    [`put('allowGuess', !!s.mys.guess); }`, `put('allowGuess', !!s.mys.guess); put('senderReceipts', !!s.mys.rcpt); }`],
    [
      `['guess', 'Guess who', 'Guess senders; they choose whether to reveal']]`,
      `['guess', 'Guess who', 'Guess senders; they choose whether to reveal'], ['rcpt', 'Give senders a receipt', 'After sending, they get a code to check for your reaction and private reply']]`,
    ],
    [`['account', 'Account', 'Username, password, install, delete', I.frog],`, `['account', 'Account', 'Username, password, install, delete', '/sk/' + ((this.props.settings || {}).avatar || 'frog') + '.png'],`],
    [`return { label: x[1], sub: x[2], icon: x[3],`, `return { label: x[1], sub: x[2], icon: x[3], iconBg: x[0] === 'account' ? ((self.props.settings || {}).avatarBg || 'transparent') : 'transparent', iconPad: x[0] === 'account' ? '3px' : '0', iconR: x[0] === 'account' ? '9px' : '0',`],
    [`<img src="{{x.icon}}" alt="" style="width: 28px; height: 28px">`, `<img src="{{x.icon}}" alt="" style="width: 28px; height: 28px; box-sizing: border-box; padding: {{x.iconPad}}; border-radius: {{x.iconR}}; background: {{x.iconBg}}">`],
    // checking whether this phone already has push on isn't the member switching it on: no confirmation push, no save
    [`self.setState({ notif: Object.assign({}, self.state.notif, { push: on }) }); }); }, 300);`, `self.pushSync = true; self.setState({ notif: Object.assign({}, self.state.notif, { push: on }) }); }); }, 300);`],
    [`    if (ps.notif !== s.notif) {`, `    var synced = this.pushSync; this.pushSync = false;\n    if (ps.notif !== s.notif && !synced) {`],
  ],

  // the focus ring on the message box (and everything else) takes the owner's theme colour, not Sekretly pink
  Main: [[`style="background: {{th.bg}}; color: {{th.ink}}; overflow: hidden; min-height: {{minH}}">`, `style="background: {{th.bg}}; color: {{th.ink}}; overflow: hidden; min-height: {{minH}}; --focus: {{th.accent}}">`]],

  // the inbox still pages through small cards, but "Share all N cards" counts the bigger posted ones
  Inbox: [
    [`[HELP-LINE NUMBER]`, HELP],
    [
      `var pages = open && selRaw.kind === 'one' && !selRaw.quiz && !selRaw.rate ? split(selRaw.text, 260) : [];`,
      `var pages = open && selRaw.kind === 'one' && !selRaw.quiz && !selRaw.rate ? split(selRaw.text, 260) : [];\n    var posts = pages.length ? split(selRaw.text, 620).length : 0;`,
    ],
    [`pages.length > 1 ? 'Share all ' + pages.length + ' cards to my story'`, `posts > 1 ? 'Share all ' + posts + ' cards to my story'`],
  ],

  ShareStudio: [
    // posted cards are tall: long text gets smaller type and fills them, so a long message makes far fewer cards
    all(`self.split(m.text, 260)`, `self.split(m.text, 620)`),
    [`// long text fills each card top to bottom (about 390 characters)`, `// long text fills each card top to bottom (about 620 characters, in smaller type)`],
    [`size: parts.length > 1 || len > 150 ? 'ss-t-s'`, `size: parts.length > 1 || len > 300 ? 'ss-t-xs' : len > 150 ? 'ss-t-s'`],
    // tapping an app goes to that app: the images are saved to the phone and the app opens to pick them
    // (iPhones save downloads to Files, not Photos, so there the share sheet takes them to the app)
    [
      `    var can = dest !== 'save' && files.length && navigator.canShare && navigator.canShare({ files: [files[0]] });`,
      `    var ios = /iPhone|iPad|iPod/i.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);\n    var can = ios && dest !== 'save' && files.length && navigator.canShare && navigator.canShare({ files: [files[0]] });`,
    ],
    [
      `      if (dest !== 'save' && WEB[dest]) window.open(WEB[dest], '_blank', 'noopener');`,
      `      var via = dest === 'save' ? '' : window.skShare && window.skShare.app ? window.skShare.app(dest, files.length * 400 + 700) : (window.open(WEB[dest], '_blank', 'noopener'), 'web');`,
    ],
    [
      `needTap: false, posted: p, lastDest: dest, savedOnly: true });`,
      `needTap: via === 'app', posted: p, lastDest: dest, savedOnly: true, via: via });`,
    ],
    [
      `(s.lastDest !== 'save' ? ' · upload them in ' + d[1] + ' (it opened in a new tab)' : '')`,
      `(s.lastDest === 'save' ? '' : s.via === 'app' ? ' · pick them from your gallery in ' + d[1] : ' · upload them in ' + d[1] + ' (it opened in a new tab)')`,
    ],
    [
      `shareNow: function () { if (s.files) self.shareBatch(s.sentN || 0); },`,
      `shareNow: function () { if (s.savedOnly && s.via === 'app' && window.skShare) { window.skShare.app(s.lastDest, 0); return; } if (s.files) self.shareBatch(s.sentN || 0); },`,
    ],
    [`tapLabel: s.files &&`, `tapLabel: s.savedOnly && s.via === 'app' ? 'Open ' + ((DEST.filter(function (x) { return x[0] === s.lastDest; })[0] || DEST[0])[1]) : s.files &&`],
  ],

  // props: email (the contact address, from lib/contact.ts)
  Contact: [
    [`For self-harm support, call [HELP-LINE NUMBER].`, `For self-harm support, call ${HELP}.`],
    [
      `General: [support email]<br>Safety: [safety email]<br>Ads &amp; partnerships: [partners email]<br>Legal &amp; data requests: [legal email]`,
      `<a href="mailto:{{contactEmail}}" style="color: var(--ink); font-weight: 800">{{contactEmail}}</a><br>One inbox for everything for now: general questions, safety, ads &amp; partnerships, legal and data requests. Put the topic in the subject.`,
    ],
    [`      topics: T.map(`, `      contactEmail: this.props.email || '',\n      topics: T.map(`],
  ],
  Legal: [
    [`or contact [legal email] for anything else.`, `or email {{contactEmail}} for anything else.`],
    [`      tabs: [['privacy', 'Privacy policy']`, `      contactEmail: this.props.email || 'us through the Contact page',\n      tabs: [['privacy', 'Privacy policy']`],
  ],
  Help: [[`For self-harm support call [HELP-LINE NUMBER].`, `For self-harm support call ${HELP}.`]],
  Safety: [[`please talk to someone: [HELP-LINE NAME] on [HELP-LINE NUMBER], free and confidential.`, `please talk to someone: ${HELP}. It’s free and confidential.`]],
};
