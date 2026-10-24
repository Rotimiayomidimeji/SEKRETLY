// Phase 4 wiring: the admin screens read real data and act through features/admin/actions.
// Same rules as port-fixups.mjs: [exact mockup text, replacement] pairs (the converter stops if one is missing),
// or a function for changes a plain replacement can't express. Images are already /sk/ paths when these run.

const between = (start, end, replacement) => (src) => {
  const a = src.indexOf(start), b = src.indexOf(end, a + start.length);
  if (a < 0 || b < 0) throw new Error("admin fixup: can't find " + (a < 0 ? start : end).slice(0, 50));
  return src.slice(0, a) + replacement + src.slice(b);
};
const line = (re, replacement) => (src) => {
  if (!re.test(src)) throw new Error("admin fixup: no line matches " + re);
  return src.replace(re, replacement);
};
const NO_DEMO_LIVE = (iv) => [iv, ``];
/** Saves the listed state keys through props.save whenever any of them changes. */
const saveOnChange = (keys) => [
  `  componentDidUpdate(prev) { if (prev.mode !== this.props.mode && this.props.mode) this.setState({ mode: this.props.mode }); }`,
  `  componentDidUpdate(prev, ps) {
    if (prev.mode !== this.props.mode && this.props.mode) this.setState({ mode: this.props.mode });
    var s = this.state, changed = ${JSON.stringify(keys)}.some(function (k) { return ps[k] !== s[k]; });
    if (changed && this.props.save) { var o = {}; ${JSON.stringify(keys)}.forEach(function (k) { o[k] = s[k]; }); this.props.save(o); }
  }`,
];

export const ADMIN_FIXUPS = {
  // props: dash (from loadDashboard)
  Admin: [
    NO_DEMO_LIVE(`    this.iv = setInterval(function () { var t = self.state.tick + 1; self.setState({ tick: t, live: 33 + (t * 7) % 11 }); }, 2500);\n`),
    between(`    var H = [`, `    return {`, `    var D = this.props.dash || {};\n`),
    between(`      live: s.live,`, `\n    };\n  }\n}`, `      live: D.live || 0, kpis: D.kpis || [], hours: D.hours || [], topCats: D.topCats || [], retention: D.retention || [], funnel: D.funnel || [], feed: D.feed || []`),
  ],

  // props: reports[], log[], kpis { reports, warnings, blocks, undone }, decide(id, decision)
  AdminReports: [
    [`tab: 'review', done: {} };`, `tab: 'review', done: (props.reports || []).reduce(function (d, r) { if (r.decision) d[r.id] = r.decision; return d; }, {}) };`],
    between(`    var R = [`, `\n    var shown =`, `    var R = this.props.reports || [];`),
    [`var setDone = function (id, v) { var d = Object.assign({}, s.done); d[id] = v; self.setState({ done: d }); };`, `var setDone = function (id, v) { var d = Object.assign({}, s.done); d[id] = v; self.setState({ done: d }); self.props.decide(id, v); };`],
    between(`    var L = [`, `\n    var abg =`, `    var L = this.props.log || [];`),
    [`{ label: 'Reports today', value: '58', c: 'var(--ink)' },`, `{ label: 'Reports today', value: String((this.props.kpis || {}).reports || 0), c: 'var(--ink)' },`],
    [`{ label: 'Warnings sent', value: '51', c: 'var(--warn)' },`, `{ label: 'Warnings sent', value: String((this.props.kpis || {}).warnings || 0), c: 'var(--warn)' },`],
    [`{ label: 'Blocks (4th report)', value: '6', c: 'var(--bad)' },`, `{ label: 'Blocks (4th report)', value: String((this.props.kpis || {}).blocks || 0), c: 'var(--bad)' },`],
    [`{ label: 'Blocks undone', value: '2', c: 'var(--muted)' },`, `{ label: 'Blocks undone', value: String((this.props.kpis || {}).undone || 0), c: 'var(--muted)' },`],
  ],

  // props: users[], warnUser(name), clearWarnings(name), setSuspended(name, on), deleteUser(name)
  AdminUsers: [
    [`sel: null, over: {} };`, `sel: null, over: (props.users || []).reduce(function (o, u) { if (u.status) o[u.name] = u.status; return o; }, {}) };`],
    between(`    var U = [`, `\n    var line = dark`, `    var U = this.props.users || [];`),
    [`if (s.filter === 'new') return u.joined === '19 Oct' || u.joined === '18 Oct';`, `if (s.filter === 'new') return !!u.raw.isNew;`],
    line(/raw: u, ips: '102\.89[^,]*, open:/, `raw: u, ips: u.ips, open:`),
    [`act: function () { if (!sel) return; var o = Object.assign({}, s.warned); o[sel.name] = true; self.setState({ warned: o }); },`, `act: function () { if (!sel) return; var o = Object.assign({}, s.warned); o[sel.name] = true; self.setState({ warned: o }); self.props.warnUser(sel.name); },`],
    [`clear: function () { if (!sel) return; var o = Object.assign({}, s.cleared); o[sel.name] = true; self.setState({ cleared: o }); },`, `clear: function () { if (!sel) return; var o = Object.assign({}, s.cleared); o[sel.name] = true; self.setState({ cleared: o }); self.props.clearWarnings(sel.name); },`],
    [`var o = Object.assign({}, s.over); o[sel.name] = 'Deleted'; self.setState({ over: o, delAsk: null }); },`, `var o = Object.assign({}, s.over); o[sel.name] = 'Deleted'; self.setState({ over: o, delAsk: null }); self.props.deleteUser(sel.name); },`],
    [`suspend: function () { if (!sel) return; var o = Object.assign({}, s.over); o[sel.name] = sel.status === 'Suspended' ? '' : 'Suspended'; self.setState({ over: o }); }`, `suspend: function () { if (!sel) return; var o = Object.assign({}, s.over); o[sel.name] = sel.status === 'Suspended' ? '' : 'Suspended'; self.setState({ over: o }); self.props.setSuspended(sel.name, sel.status !== 'Suspended'); }`],
  ],

  // props: traffic { today, week, month } (from trafficFor), live, setIpBlocked(ip, on)
  AdminTraffic: [
    NO_DEMO_LIVE(`    this.iv = setInterval(function () { var x = self.state.extra + 1; self.setState({ extra: x, live: 36 + (x * 5) % 13 }); }, 3500);\n`),
    [`extra: 0, blockedIps: {} };`, `extra: 0, blockedIps: Object.assign({}, ((props.traffic || {}).today || {}).blockedIps) };`],
    between(
      `    var mult = `,
      `    var q = s.q.trim().toLowerCase();`,
      `    var D = (this.props.traffic || {})[s.range] || { kpis: [], hours: [], heat: [], breakdowns: [], rows: [], totalCount: '0' };
    var all = D.rows;
`,
    ),
    between(
      `    var H = [12,`,
      `    var sel = s.sel ?`,
      `    var days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'], heat = [];
    days.forEach(function (d, di) { heat.push({ cls: 'hl', label: d, o: 1, t: d }); for (var hi = 0; hi < 24; hi++) heat.push({ cls: 'hc', label: '', o: (D.heat[di] || [])[hi] || '0.06', t: d + ' ' + hi + ':00' }); });
    var bd = function (b) { var max = (b.rows[0] || ['', 1])[1]; return { title: b.title, rows: b.rows.map(function (r) { return { label: r[0], v: r[1] + '%', w: Math.round(r[1] / max * 100) + '%' }; }) }; };
`,
    ),
    between(`      live: s.live,\n      kpis: [`, `      heatHead:`, `      live: this.props.live || 0, kpis: D.kpis, hours: D.hours, breakdowns: D.breakdowns.map(bd),\n`),
    [`heatHead: H.map(function (h, i)`, `heatHead: D.hours.map(function (h, i)`],
    [`shownCount: rows.length, totalCount: fmt(4812 * mult),`, `shownCount: rows.length, totalCount: D.totalCount,`],
    line(/      selPath: [^\n]*\n/, `      selPath: sel ? sel.trail : [],\n`),
    [`toggleBlockIp: function () { if (!sel) return; var b = Object.assign({}, s.blockedIps); b[sel.ip] = !b[sel.ip]; self.setState({ blockedIps: b }); },`, `toggleBlockIp: function () { if (!sel) return; var b = Object.assign({}, s.blockedIps); b[sel.ip] = !b[sel.ip]; self.setState({ blockedIps: b }); self.props.setIpBlocked(sel.ip, !!b[sel.ip]); },`],
  ],

  // props: config (saved category settings), save(config)
  AdminCategories: [
    [`newCat: '', newMsg: '', previewIdx: 0 };`, `newCat: '', newMsg: '', previewIdx: 0 };\n    Object.assign(this.state, props.config || {});`],
    saveOnChange(["minS", "maxS", "extraCats", "inactive", "seriousOver", "added", "deleted"]),
  ],

  // props: config (master switch and slots), save(config)
  AdminAds: [
    [`studio: true, notfound: false } };`, `studio: true, notfound: false } };\n    Object.assign(this.state, props.config || {});`],
    saveOnChange(["master", "slots"]),
  ],
};
