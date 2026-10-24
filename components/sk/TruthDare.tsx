// @ts-nocheck -- ported 1:1 from design/mockup/TruthDare.dc.html by scripts/port-mockup.mjs; typed as it gets wired to real data
"use client";

import React, { Fragment } from "react";
import { saveMode, SkLink } from "@/lib/sk/runtime";


export default class TruthDare extends React.Component<Record<string, any>, any> {
  static defaultProps = {"mode":"dark","role":"player","demo":"none","ads":"on"};

  constructor(props) {
    super(props);
    var m = null; // light/dark arrives as props.mode from the sk-mode cookie
    this.load();
    this.state = this.fresh(m || props.mode || 'dark');
    var base = this.setState.bind(this), self = this;
    this.setState = function (p, cb) { if (!self.syncing && p && typeof p === 'object') self.forward(p); return base(p, cb); };
    var d = props.demo;
    if (d === 'dare' || d === 'truth') Object.assign(this.state, { k: 1, phase: 'act', t: 0, choice: d, proofing: true, hold: true });
    if (d === 'theirs') Object.assign(this.state, { k: 2, phase: 'answer', t: 0, choice: 'dare', didIt: 'done', proof: { kind: 'photo' }, hold: true });
  }
  // read what the lobby handed over: table size, turns, timer, spice, rules, and who you are
  load() {
    var v = this.props.view || {}, st = v.settings || {}, me = v.me || {};
    this.myNick = me.nick || 'You'; this.nick = this.myNick; this.nickColor = me.color || '#ffd23d';
    this.seats = (v.state && v.state.seats) || (v.players || []).map(function (p) { return { nick: p.nick, color: p.color }; });
    this.n = this.seats.length || 2;
    this.laps = st.laps || 1; this.timer = st.timer || 15;
    this.spiceStart = { mild: 0, spicy: 1, unhinged: 2 }[st.spice] || 0; this.esc = st.esc !== false;
    this.special = st.special || {}; this.packs = st.packs || [];
    this.guest = false; this.late = false; this.room = v.name || '';
  }
  toNick(v) { return v === 'MangoMoon' ? this.myNick : v; }
  forward(p) {
    var code = this.props.code, s = this.state, self = this;
    var send = function (type, value) { self.props.move(code, type, value).then(function (r) { if (r && !r.ok && r.error) self.flash(r.error, '', ''); self.poll(); }); };
    if (p.card !== undefined && p.card !== null && p.phase === 'answer') send('pick', { card: p.card, own: s.own });
    if (p.mine !== undefined && p.mine !== null) send('answer', this.toNick(p.mine));
    if (p.guessPick !== undefined && p.guessPick !== null) send('guess', this.toNick(p.guessPick));
    if (p.choice && p.phase === 'act') send('choose', p.choice);
    if (p.didIt && p.phase === 'answer') send('did', p.didIt);
    if (p.kicked && p.kicked.length > s.kicked.length) this.props.host(code, 'kick', this.toNick(p.kicked[p.kicked.length - 1]));
    if (p.phase === 'over') this.props.host(code, 'end');
    if (p.paused !== undefined && p.paused !== s.paused) this.props.host(code, 'pause', p.paused);
  }
  poll() {
    var self = this;
    if (this.polling) return;
    this.polling = true;
    this.props.load(this.props.code).then(function (v) { self.polling = false; if (v) self.apply(v); }).catch(function () { self.polling = false; });
  }
  apply(v) {
    var self = this, st = v.state, me = this.myNick;
    this.skew = Date.now() - v.now;
    if (!st || v.version === this.version) return;
    this.version = v.version; this.table = st; this.seats = st.seats; this.n = st.seats.length;
    var toInt = function (n) { return n === me ? 'MangoMoon' : n; };
    var keys = function (o) { var r = {}; Object.keys(o || {}).forEach(function (k) { r[toInt(k)] = typeof o[k] === 'string' ? toInt(o[k]) : o[k]; }); return r; };
    var tallies = { scores: keys(st.scores), lives: keys(st.lives), catches: keys(st.catches), crowns: keys(st.crowns), chickens: keys(st.chickens) };
    var patch = { k: st.k, phase: st.phase, card: st.card, own: st.own || '', choice: st.choice, didIt: st.didIt, paused: st.paused, kicked: st.kicked.map(toInt) };
    if (st.k !== this.state.k) Object.assign(patch, { mine: null, guessPick: null, answers: null, last: null });
    var mine = st.answers[me], guess = st.guesses[me];
    if (mine !== undefined) patch.mine = toInt(mine);
    if (guess !== undefined) patch.guessPick = toInt(guess);
    var reveal = st.phase === 'reveal' && this.resolvedK !== st.k;
    if (!reveal) Object.assign(patch, tallies);
    this.syncing = true;
    this.setState(patch, function () {
      if (reveal) {
        // the reveal uses everyone's real answers; the totals are the server's
        self.resolvedK = st.k; self.serverOthers = keys(st.answers);
        self.syncing = true; self.resolve(); self.setState(tallies); self.syncing = false;
      }
    });
    this.syncing = false;
  }
  cups() { return this.special.lives5 ? 5 : 3; }
  proofOn() { return this.special.proof !== false; }
  truthAnswer(k) {
    var A = {
      'What’s the last lie you told?': 'Told my mum I was at the library. I was at an owambe.',
      'Who in here would you call at 2am?': 'KolaNut. They always pick up, even at 2am.',
      'What’s your most-used emoji and why?': '💀 because everything is killing me.',
      'Who here would you let read your chats for a day?': 'CocoaRay. They already know everything anyway.',
      'What’s the most embarrassing thing on your phone?': 'A screenshot of my ex’s new status. Yes, I know.',
      'Who was your last crush?': 'Someone in this room. Not saying who.',
      'Who at this table would you date?': 'Honestly? ZoboQueen. Don’t make it weird.',
      'What’s your biggest red flag?': 'I reply to everyone except the person I like.',
      'What’s the worst thing you’ve done and never told anyone?': 'I copied an assignment and got a better grade than the owner.'
    };
    return A[this.prompt(k).truth] || 'Pass… okay fine. Yes. It was me.';
  }
  fresh(mode) {
    var lives = {}, cups = this.cups(); this.P().forEach(function (p) { lives[p[0]] = cups; });
    return { mode: mode, k: 0, phase: 'intro', t: 0, card: null, own: '', mine: null, guessPick: null, choice: null, didIt: null, answers: null, paused: false, kicked: [],
      scores: {}, lives: lives, catches: {}, crowns: {}, chickens: {}, combo: 0, last: null, sheet: null, reported: {}, fx: [], fxId: 0, toast: null, passUsed: false, proofing: false, proof: null, proofShown: false, answer: '' };
  }
  game() { return 'tod'; }
  P() { var me = this.myNick; return (this.seats || []).map(function (p) { return [p.nick === me ? 'MangoMoon' : p.nick, p.color]; }); }
  // turn order: starts at the seat to your right, so you go second; repeats once per lap
  turns() {
    var n = this.P().length, one = [n - 1]; for (var i = 0; i < n - 1; i++) one.push(i);
    var names = this.P().map(function (p) { return p[0]; }), out = [];
    for (var l = 0; l < this.laps; l++) one.forEach(function (i) { out.push(names[i]); });
    return out;
  }
  E() {
    return { shush: '/sk/shushing_face.png', eyes: '/sk/eyes.png', fire: '/sk/fire.png',
      crown: '/sk/crown_3d.png', chart: '/sk/bar_chart_3d.png', pepper: '/sk/hot_pepper_3d.png',
      bottle: '/sk/bottle_with_popping_cork_3d.png', thinking: '/sk/thinking_face_3d.png', horns: '/sk/smiling_face_with_horns_3d.png',
      star: '/sk/star-struck_3d.png', ballot: '/sk/ballot_box_with_ballot_3d.png', mic: '/sk/microphone_3d.png', chicken: '/sk/chicken_3d.png',
      cup: '/sk/tropical_drink_3d.png', thermo: '/sk/thermometer_3d.png', ice: '/sk/ice_3d.png', cold: '/sk/cold_face_3d.png',
      coin: '/sk/coin_3d.png', swords: '/sk/crossed_swords_3d.png', joy: '/sk/face_with_tears_of_joy_3d.png',
      skull: '/sk/skull_3d.png', scream: '/sk/face_screaming_in_fear_3d.png', heart: '/sk/red_heart_3d.png', devil: '/sk/angry_face_with_horns_3d.png', angel: '/sk/sparkles.png' };
  }
  // scene and three decks (mild, spicy, unhinged) per game
  G(id) {
    var E = this.E();
    var D = {
      nhie: { name: 'Never Have I Ever', icon: E.shush, room: 'Friday Night Never', write: 'Never have I ever…',
        sc: { name: 'Neon lounge', sky: 'radial-gradient(120% 90% at 50% 0%,#4a1263 0%,#160a22 55%,#08050c 100%)', glow: '#ff3b8d', floor: 'linear-gradient(rgba(255,59,141,.55) 2px,transparent 2px),linear-gradient(90deg,rgba(255,59,141,.55) 2px,transparent 2px)', table: 'radial-gradient(circle at 50% 38%,#8a2a7a,#3a0f3a 70%)' },
        deck: [['lied to get out of class.', 'pretended to be on a call to avoid someone.', 'eaten someone else’s food from the fridge.', 'fallen asleep in a lecture.', 'sent a message to the wrong group chat.'],
          ['stalked an ex’s story at 3am.', 'had a crush on a friend’s partner.', 'left someone on read for days on purpose.', 'lied about my age.', 'been caught sneaking out.'],
          ['had a crush on someone at this table.', 'kissed someone I just met.', 'sent a risky text and deleted it.', 'talked to two people at the same time.', 'screenshot a chat to gossip about it.']] },
      tod: { name: 'Truth or Dare', icon: E.bottle, room: 'Dare Club 300L',
        sc: { name: 'Bonfire night', sky: 'radial-gradient(90% 80% at 50% 80%,#7a2d0b 0%,#2a0d05 50%,#0b0503 100%)', glow: '#ff7a1a', floor: 'linear-gradient(rgba(255,160,70,.35) 2px,transparent 2px),linear-gradient(90deg,rgba(255,160,70,.35) 2px,transparent 2px)', table: 'radial-gradient(circle at 50% 40%,#b0703a,#5a2b14 70%)' },
        deck: [[['What’s the last lie you told?', 'Show the last photo in your gallery.'], ['Who in here would you call at 2am?', 'Talk in a fake accent until your next turn.'], ['What’s your most-used emoji and why?', 'Do your best impression of your HOD for 20 seconds.']],
          [['Who here would you let read your chats for a day?', 'Send “I miss us” to the 5th person in your chats.'], ['What’s the most embarrassing thing on your phone?', 'Let the table pick your next status update.'], ['Who was your last crush?', 'Read your last sent message out loud.']],
          [['Who at this table would you date?', 'Text your crush “I had a dream about you”.'], ['What’s your biggest red flag?', 'Let someone here send one message from your phone.'], ['What’s the worst thing you’ve done and never told anyone?', 'Post “I’m in love” on your status for 10 minutes.']]] },
      wyr: { name: 'Would You Rather', icon: E.swords, room: 'Class of 2027 chaos',
        sc: { name: 'Split arena', sky: 'radial-gradient(120% 90% at 50% 0%,#0d2a5a 0%,#071229 55%,#04060d 100%)', glow: '#22e1ff', floor: 'linear-gradient(rgba(34,225,255,.4) 2px,transparent 2px),linear-gradient(90deg,rgba(34,225,255,.4) 2px,transparent 2px)', table: 'radial-gradient(circle at 50% 40%,#2a2f4a,#11142a 70%)' },
        deck: [[['Lose your phone for a week', 'Lose your voice for a week'], ['Only eat jollof forever', 'Never eat jollof again'], ['Always be 10 minutes late', 'Always be 2 hours early'], ['Have no data for a month', 'Have no light for a month']],
          [['Read your crush’s chats', 'Let your crush read yours'], ['Get exposed in the group chat', 'Get exposed in class'], ['Date someone who snores', 'Date someone who never texts back'], ['Know your future salary', 'Know your future partner']],
          [['Know who sent every anonymous message', 'Never be able to send one again'], ['Kiss your ex', 'Kiss your best friend’s ex'], ['Have your search history leaked', 'Have your DMs leaked'], ['Date someone at this table', 'Never date again']]] },
      mlt: { name: 'Most Likely To', icon: E.crown, room: 'Hostel B awards', write: 'Who’s most likely to…',
        sc: { name: 'Award show', sky: 'radial-gradient(120% 90% at 50% 0%,#3a2a08 0%,#150d22 55%,#07050b 100%)', glow: '#ffd23d', floor: 'linear-gradient(rgba(255,210,61,.35) 2px,transparent 2px),linear-gradient(90deg,rgba(255,210,61,.35) 2px,transparent 2px)', table: 'radial-gradient(circle at 50% 38%,#2b2333,#0d0a12 70%)' },
        deck: [['become famous first', 'be late to their own wedding', 'cry at a movie', 'become a lecturer', 'win a dance battle'],
          ['text their ex tonight', 'have a secret crush in this room', 'go viral for the wrong reason', 'ghost someone', 'start a fight at an owambe'],
          ['have a secret second account', 'date two people at once', 'get caught sneaking out', 'confess something wild tonight', 'marry someone they met online']] },
      hot: { name: 'Hot Takes', icon: E.pepper, room: 'Sunday vibes only', write: 'Your hot take…',
        sc: { name: 'Hot seat', sky: 'linear-gradient(110deg,#0b2a4a 0%,#170a18 50%,#4a0b12 100%)', glow: '#ff4f6d', floor: 'linear-gradient(rgba(255,120,120,.35) 2px,transparent 2px),linear-gradient(90deg,rgba(120,200,255,.35) 2px,transparent 2px)', table: 'radial-gradient(circle at 50% 40%,#45404f,#17141d 70%)' },
        deck: [['Pineapple belongs on pizza.', 'Group projects should be illegal.', 'Morning classes are a scam.', 'Tea is better than coffee.', 'Lagos traffic builds character.'],
          ['Amapiano is better than Afrobeats.', 'Texting first is not desperate.', 'Situationships are worse than breakups.', 'Your ex is always your ex for a reason.', 'Love at first sight is real.'],
          ['Cheating is forgivable once.', 'You should check your partner’s phone.', 'Best friends can’t date.', 'Money matters more than love.', 'Everyone here has a secret account.']] },
      poll: { name: 'Anonymous Polls', icon: E.ballot, room: 'Group chat polls',
        sc: { name: 'Live studio', sky: 'radial-gradient(120% 90% at 50% 0%,#0b3a3a 0%,#081a1f 55%,#04090b 100%)', glow: '#5be0a0', floor: 'linear-gradient(rgba(91,224,160,.35) 2px,transparent 2px),linear-gradient(90deg,rgba(91,224,160,.35) 2px,transparent 2px)', table: 'radial-gradient(circle at 50% 40%,#1d3a3a,#0a1719 70%)' },
        deck: [[['Best place to hang out after exams?', ['Beach', 'Mall', 'Someone’s room', 'Owambe']], ['Best Nigerian snack?', ['Puff-puff', 'Chin chin', 'Suya', 'Meat pie']], ['Worst lecture time?', ['7am', '12pm', '4pm']]],
          [['Who’s the biggest flirt here?', ['@1', '@2', '@3']], ['Who should plan the next hangout?', ['@2', '@3', '@4', 'Nobody, chaos']], ['Red flag or green flag: double texting?', ['Red', 'Green', 'Depends']]],
          [['Who here would survive a breakup best?', ['@1', '@3', '@4']], ['Who has the most secrets?', ['@2', '@4', '@1']], ['Should exes stay friends?', ['Yes', 'No', 'Only if one is fine']]]] }
    };
    return D[id] || D.nhie;
  }
  componentDidMount() {
    var self = this;
    this.onStore = function (e) { if (e.key === 'sk-mode' && e.newValue) self.setState({ mode: e.newValue }); };
    try { window.addEventListener('storage', this.onStore); } catch (e) {}
    this.tk = setInterval(function () { self.tick(); }, 500);
    this.pl = setInterval(function () { self.poll(); }, 1000);
    this.apply(this.props.view || {});
  }
  componentWillUnmount() { try { window.removeEventListener('storage', this.onStore); } catch (e) {} clearInterval(this.tk); clearInterval(this.pl); clearTimeout(this.tt); }
  componentDidUpdate(prev) {
    if (prev.mode !== this.props.mode && this.props.mode) this.setState({ mode: this.props.mode });
    if (prev.role !== this.props.role) { this.load(); this.setState(this.fresh(this.state.mode)); }
  }
  h(k, i, salt) { return ((k + 3) * 73 + (i + 1) * 151 + salt * 37 + (k * i) * 11) % 100; }
  total() { return this.turns().length; }
  level(k) { if (!this.esc) return this.spiceStart; return Math.min(2, this.spiceStart + Math.floor(k / this.total() * (3 - this.spiceStart))); }
  tp(k) { return this.turns()[k]; }
  alive(name) { return this.state.kicked.indexOf(name) < 0; }
  inGame() { var self = this; return this.P().map(function (p) { return p[0]; }).filter(function (n) { return self.alive(n); }); }
  // three cards offered to whoever's turn it is
  offered(k) {
    var G = this.G(this.game()), deck = G.deck[this.level(k)], out = [];
    for (var i = 0; i < 3; i++) out.push(deck[(k * 2 + i) % deck.length]);
    return out;
  }
  pollOpts(card, k) {
    var me = this.myNick, names = this.inGame().map(function (n) { return n === 'MangoMoon' ? me : n; });
    return card[1].map(function (o) { return o.charAt(0) === '@' ? names[(Number(o.slice(1)) + k) % names.length] : o; });
  }
  answerers(k) {
    var id = this.game(), tp = this.tp(k), s = this.state;
    return this.inGame().filter(function (n) {
      if ((id === 'nhie' || id === 'tod') && n === tp) return false;
      if (id === 'nhie' && s.lives[n] === 0) return false;
      return true;
    });
  }
  // what the other players do on a turn (fixed per turn so the demo is repeatable)
  others(k) { return this.serverOthers || {}; }
  prompt(k) {
    var s = this.state, id = this.game(), cards = this.offered(k);
    if (id === 'tod') { var c = cards[0]; return { truth: c[0], dare: c[1] }; }
    var c2 = s.card === 'own' ? null : cards[s.card || 0];
    if (id === 'nhie') return { q: s.card === 'own' ? s.own : 'Never have I ever ' + c2 };
    if (id === 'wyr') return { a: c2[0], b: c2[1] };
    if (id === 'mlt') return { q: 'Who’s most likely to ' + (s.card === 'own' ? s.own.replace(/^who.?s most likely to\s*/i, '') : c2) + '?' };
    if (id === 'hot') return { q: s.card === 'own' ? s.own : c2 };
    return { q: c2[0], opts: this.pollOpts(c2, k) };
  }
  begin(k) {
    var tl = this.turns();
    while (k < tl.length && !this.alive(tl[k])) k++;
    if (k >= tl.length) { this.setState({ phase: 'over', t: 0 }); return; }
    this.setState({ k: k, phase: this.game() === 'tod' ? 'spin' : 'pick', t: 0, card: null, own: '', mine: null, guessPick: null, choice: null, didIt: null, answers: null, last: null, proofing: false, proof: null, proofShown: false, answer: '' });
  }
  toAnswer() { this.setState({ phase: 'answer', t: 0 }); }
  tick() {
    var st = this.table;
    if (!st) return;
    var now = Date.now() - (this.skew || 0);
    this.syncing = true; this.setState({ t: st.paused ? this.state.t : Math.max(0, (now - st.phaseAt) / 1000) }); this.syncing = false;
    if (!st.paused && st.phase !== 'over' && now >= st.deadline && this.asked !== this.version) { this.asked = this.version; this.props.tick(this.props.code); }
  }
  resolve() {
    var s = this.state, self = this, id = this.game(), E = this.E(), k = s.k, tp = this.tp(k), meTurn = tp === 'MangoMoon';
    var o = this.others(k), ans = this.answerers(k), a = {};
    ans.forEach(function (n) { a[n] = n === 'MangoMoon' ? s.mine : o[n]; });
    var scores = Object.assign({}, s.scores), lives = Object.assign({}, s.lives), catches = Object.assign({}, s.catches), crowns = Object.assign({}, s.crowns), chickens = Object.assign({}, s.chickens);
    var add = function (n, v) { scores[n] = (scores[n] || 0) + v; };
    var before = scores.MangoMoon || 0, title = '', sub = '', icon = this.G(id).icon, good = true, extra = {};
    if (id === 'nhie') {
      if (a.MangoMoon === null && ans.indexOf('MangoMoon') >= 0) a.MangoMoon = 'never';
      var caught = ans.filter(function (n) { return a[n] === 'have'; });
      caught.forEach(function (n) { lives[n] = Math.max(0, lives[n] - 1); });
      catches[tp] = (catches[tp] || 0) + caught.length; add(tp, caught.length);
      if (meTurn) { title = 'You caught ' + caught.length; sub = caught.length ? caught.join(', ') + ' tipped a cup.' : 'Nobody had. Clean table.'; icon = E.cup; good = caught.length > 0; }
      else if (a.MangoMoon === 'have') { title = 'You tipped a cup'; sub = lives.MangoMoon ? lives.MangoMoon + ' cups left. Honesty counts.' : 'Out of cups. You can still lead turns.'; icon = E.cup; good = false; }
      else { title = 'Cup safe'; sub = caught.length + ' of ' + ans.length + ' had. Not you.'; icon = E.angel; }
      extra.caught = caught;
    } else if (id === 'tod') {
      if (!meTurn && s.mine === null) a.MangoMoon = 'legit';
      var lg = 0, ck = 0; ans.forEach(function (n) { if ((n === 'MangoMoon' ? (s.mine || 'legit') : a[n]) === 'legit') lg++; else ck++; });
      var legit = lg > ck;
      if (legit) add(tp, 3); else { add(tp, -1); chickens[tp] = (chickens[tp] || 0) + 1; }
      ans.forEach(function (n) { var v = n === 'MangoMoon' ? (s.mine || 'legit') : a[n]; if ((v === 'legit') === legit) add(n, 1); });
      if (meTurn) { title = legit ? 'Legend. +3' : 'Chicken!'; sub = legit ? lg + ' of ' + ans.length + ' said legit.' : 'The table called it. You wear the 🐔.'; good = legit; }
      else { title = legit ? tp + ' did it' : tp + ' chickened out'; sub = ((s.mine || 'legit') === 'legit') === legit ? 'You voted with the table. +1' : 'The table voted the other way.'; good = ((s.mine || 'legit') === 'legit') === legit; }
      icon = legit ? E.fire : E.chicken; extra.lg = lg; extra.ck = ck;
    } else if (id === 'wyr') {
      if (s.mine === null) a.MangoMoon = 'a';
      var ca = 0, cb = 0; ans.forEach(function (n) { if (a[n] === 'a') ca++; else cb++; });
      var maj = ca >= cb ? 'a' : 'b';
      ans.forEach(function (n) { if (a[n] === maj) add(n, 1); });
      if (s.guessPick === maj) add('MangoMoon', 2);
      if (Math.abs(ca - cb) <= 1) add(tp, 2);
      title = a.MangoMoon === maj ? 'You’re with the crowd' : 'Rebel side'; sub = (meTurn && Math.abs(ca - cb) <= 1 ? 'Close split: +2 for a great question. ' : '') + (s.guessPick ? (s.guessPick === maj ? 'Called the winner. +2' : 'Wrong call on the winner.') : '');
      icon = a.MangoMoon === maj ? E.swords : E.devil; extra.ca = ca; extra.cb = cb;
    } else if (id === 'mlt') {
      if (s.mine === null) a.MangoMoon = this.inGame().filter(function (n) { return n !== 'MangoMoon'; })[0];
      var tally = {}; ans.forEach(function (n) { tally[a[n]] = (tally[a[n]] || 0) + 1; });
      var win = Object.keys(tally).sort(function (x, y) { return tally[y] - tally[x]; })[0];
      crowns[win] = (crowns[win] || 0) + 1; add(win, 2);
      ans.forEach(function (n) { if (a[n] === win && n !== win) add(n, 1); });
      title = win === 'MangoMoon' ? 'The crown is yours' : 'Crowned: ' + win; sub = a.MangoMoon === win ? 'You read the room. +1' : 'You voted ' + a.MangoMoon + '.'; icon = E.crown; good = a.MangoMoon === win || win === 'MangoMoon';
      extra.tally = tally; extra.win = win;
    } else if (id === 'hot') {
      if (s.mine === null) a.MangoMoon = 3;
      var raters = ans.filter(function (n) { return n !== tp; }), sum = 0;
      raters.forEach(function (n) { sum += a[n]; });
      var avg = Math.round(sum / Math.max(1, raters.length));
      raters.forEach(function (n) { var d = Math.abs(a[n] - avg); if (d === 0) add(n, 2); else if (d === 1) add(n, 1); });
      var gd = Math.abs(a[tp] - avg); if (gd === 0) add(tp, 3); else if (gd === 1) add(tp, 1);
      var LBL = ['', 'Hard no', 'Nah', 'Meh', 'Yeah', 'Facts'];
      var dm = Math.abs(a.MangoMoon - avg);
      title = meTurn ? (gd === 0 ? 'You read the room. +3' : 'You guessed ' + LBL[a.MangoMoon]) : (dm === 0 ? 'You read the room' : dm === 1 ? 'Close enough' : 'Spicy outlier');
      sub = 'The room landed on ' + LBL[avg] + '.'; icon = dm === 0 ? E.thermo : E.pepper; good = dm <= 1;
      extra.avg = avg; extra.raters = raters;
    } else {
      if (s.mine === null) a.MangoMoon = 0;
      var pr = this.prompt(k), pc = pr.opts.map(function () { return 0; });
      ans.forEach(function (n) { pc[a[n]]++; });
      var top = pc.indexOf(Math.max.apply(null, pc));
      ans.forEach(function (n) { if (a[n] === top) add(n, 1); });
      if (s.guessPick === top) add('MangoMoon', 2);
      title = 'Winner: ' + pr.opts[top]; sub = s.guessPick === top ? 'You called it. +2' : (s.guessPick === null ? 'No guess this time.' : 'Not this time.'); icon = E.chart; good = a.MangoMoon === top || s.guessPick === top;
      extra.pc = pc; extra.top = top;
    }
    var mine = (scores.MangoMoon || 0) - before;
    var combo = good ? s.combo + 1 : 0;
    if (combo >= 2 && mine > 0) { add('MangoMoon', 1); mine += 1; }
    this.setState({ phase: 'reveal', t: 0, answers: a, scores: scores, lives: lives, catches: catches, crowns: crowns, chickens: chickens, combo: combo, last: { mine: mine, title: title, sub: sub, icon: icon, good: good, extra: extra } });
  }
  react(src) {
    var self = this, id = this.state.fxId + 1, left = (12 + (id * 37) % 72) + '%';
    this.setState({ fx: this.state.fx.concat([{ id: id, src: src, left: left }]).slice(-8), fxId: id });
    setTimeout(function () { self.setState({ fx: self.state.fx.filter(function (f) { return f.id !== id; }) }); }, 2400);
  }
  flash(title, sub, icon) { var self = this; this.setState({ toast: { title: title, sub: sub, icon: icon } }); clearTimeout(this.tt); this.tt = setTimeout(function () { self.setState({ toast: null }); }, 3200); }
  standing() {
    var s = this.state, id = this.game(), myNick = this.myNick;
    return this.P().filter(function (p) { return s.kicked.indexOf(p[0]) < 0; }).map(function (p) {
      var nm = p[0], sc = s.scores[nm] || 0;
      var score = id === 'nhie' ? s.lives[nm] * 10 + (s.catches[nm] || 0) : id === 'mlt' ? (s.crowns[nm] || 0) * 10 + sc : sc;
      var label = id === 'nhie' ? s.lives[nm] + ' cups · ' + (s.catches[nm] || 0) + ' caught' : id === 'mlt' ? (s.crowns[nm] || 0) + ' crowns · ' + sc + ' pts' : sc + ' pts';
      return { name: nm === 'MangoMoon' ? myNick : nm, color: p[1], score: score, label: label };
    }).sort(function (a, b) { return b.score - a.score; });
  }
  renderVals() {
    var self = this, s = this.state, dark = s.mode !== 'light', id = this.game(), G = this.G(id), E = this.E();
    var role = this.props.role === 'host' && !s.handed ? 'host' : (this.props.role === 'guest' || this.guest ? 'guest' : 'player'), host = role === 'host';
    var P = this.P().filter(function (p) { return s.kicked.indexOf(p[0]) < 0; });
    var C = {}; this.P().forEach(function (p) { C[p[0]] = p[1]; });
    var TL = this.turns(), total = TL.length, k = s.k, tp = TL[k], meTurn = tp === 'MangoMoon', ph = s.phase;
    var lv = this.level(k), SP = ['Mild', 'Spicy', 'Unhinged'], SPC = ['#0d7f4b', '#d9480f', '#c2185b'];
    var started = ph !== 'intro';
    var ans = started ? this.answerers(k) : [];
    var needMe = ans.indexOf('MangoMoon') >= 0;
    var otherAns = ans.filter(function (n) { return n !== 'MangoMoon'; });
    var inCount = ph === 'answer' ? Math.min(otherAns.length, Math.floor(s.t / 0.7)) : 0;
    var revealing = ph === 'reveal', A = s.answers || {};
    var pr = started && (ph !== 'pick' || s.card !== null) && ph !== 'spin' ? this.prompt(k) : null;
    var nextIdx = k + 1; while (nextIdx < total && s.kicked.indexOf(TL[nextIdx]) >= 0) nextIdx++;
    var nextName = TL[nextIdx];
    var myPos = TL.indexOf('MangoMoon') + 1;

    // whose turn it is: banner, panel glow, strip and 3D marker all agree
    var banner;
    var who = function (n) { return { color: C[n], initial: n === 'MangoMoon' ? self.nick.charAt(0) : n.charAt(0) }; };
    if (ph === 'intro') banner = Object.assign({ title: this.late ? 'You’re in' : 'Game starting', sub: this.late ? 'Joined mid-game · you play from turn ' + Math.min(3, total) : P.length + ' players · ' + total + ' turns · you go #' + myPos, bg: 'linear-gradient(135deg,#d81b72,#7a3cff)', ink: '#ffffff' }, who(TL[0]));
    else if (ph === 'over') banner = Object.assign({ title: 'Game over', sub: '', bg: '#211a2c', ink: '#ffffff' }, who('MangoMoon'));
    else if (ph === 'answer' && needMe && s.mine === null) banner = Object.assign({ title: 'Answer now', sub: (meTurn ? 'Your card is out · ' : tp + ' asked · ') + 'tap below', bg: '#ffd23d', ink: '#1a0b14' }, who('MangoMoon'));
    else if (meTurn && ['pick', 'spin', 'choose', 'act'].indexOf(ph) >= 0) banner = Object.assign({ title: 'Your turn', sub: { pick: 'Pick a card for the table', spin: 'The bottle is spinning to you…', choose: 'Truth or dare?', act: 'Do it, then tap below' }[ph], bg: 'linear-gradient(135deg,#ff3b8d,#7a3cff)', ink: '#ffffff' }, who('MangoMoon'));
    else if (ph === 'answer') banner = Object.assign({ title: meTurn ? { nhie: 'Your card is out', tod: 'The table is judging you', wyr: 'Your question is out', mlt: 'Your question is out', hot: 'Your take is out', poll: 'Your poll is out' }[id] : (needMe ? 'Answer locked ✓' : tp + '’s turn'), sub: 'Waiting for ' + (otherAns.length - inCount) + ' more', bg: dark ? '#2a1f36' : '#e3deeb', ink: 'var(--ink)' }, who(tp));
    else if (revealing) banner = Object.assign({ title: 'Results', sub: tp === 'MangoMoon' ? 'Your turn is done' : tp + '’s turn is done', bg: dark ? '#2a1f36' : '#e3deeb', ink: 'var(--ink)' }, who(tp));
    else banner = Object.assign({ title: tp + '’s turn', sub: { pick: 'Picking a card…', spin: 'Spinning the bottle…', choose: 'Choosing truth or dare…', act: 'Doing their ' + (s.choice || 'truth') + '…' }[ph] || '', bg: C[tp], ink: '#1a0b14' }, who(tp));
    var myMoment = (meTurn && ['pick', 'choose', 'act'].indexOf(ph) >= 0) || (ph === 'answer' && needMe && s.mine === null);

    // turn order strip
    var strip = TL.map(function (n, i) {
      var st = i < k || ph === 'over' ? 'done' : i === k && started ? 'now' : i === nextIdx || (!started && i === 0) ? 'next' : '';
      if (s.kicked.indexOf(n) >= 0) st = 'out';
      return { initial: n === 'MangoMoon' ? self.nick.charAt(0) : n.charAt(0), color: C[n], label: n === 'MangoMoon' ? 'You' : (st === 'now' ? 'now' : st === 'next' ? 'next' : n.slice(0, 6)), cls: st };
    });

    // 3D seats
    var n = P.length, R = n > 6 ? 196 : 182, sideIdx = { a: 0, b: 0 };
    var seats = P.map(function (p, i) {
      var name = p[0], ang = (90 + i * 360 / n) * Math.PI / 180, x = R * Math.cos(ang), y = R * Math.sin(ang), me = name === 'MangoMoon';
      var pick = me ? s.mine : (revealing ? A[name] : null);
      if (id === 'wyr' && (pick === 'a' || pick === 'b')) { var q = sideIdx[pick]++, a2 = ((pick === 'a' ? 180 : 0) + (q - 1.5) * 26) * Math.PI / 180; x = 92 * Math.cos(a2) + (pick === 'a' ? -34 : 34); y = 92 * Math.sin(a2); }
      var isTurn = started && ph !== 'over' && name === tp;
      var o = { x: Math.round(x), y: Math.round(y), label: me ? 'You' : name, initial: me ? self.nick.charAt(0) : name.charAt(0), color: p[1], turn: isTurn, spot: isTurn && (id === 'tod' ? ph !== 'spin' : true),
        cls: (me ? 'g3-me ' : '') + (isTurn ? 'g3-hop ' : '') + (id === 'nhie' && s.lives[name] === 0 ? 'g3-out' : ''), tagBg: isTurn ? '#ff3b8d' : 'rgba(8,5,12,.66)',
        crown: false, hasToken: false, token: '', hasPop: false, pop: '', popColor: '#ffffff', hasBadge: false, badge: '', badgeBg: '#ffd23d' };
      var sc = s.scores[name] || 0;
      if (id === 'mlt' && s.crowns[name]) { o.hasBadge = true; o.badge = '👑' + s.crowns[name]; }
      else if (id === 'tod' && s.chickens[name]) { o.hasBadge = true; o.badge = '🐔' + s.chickens[name]; o.badgeBg = '#ffffff'; }
      else if (id !== 'nhie' && sc) { o.hasBadge = true; o.badge = sc; }
      if (id === 'nhie' && (s.catches[name] || 0)) { o.hasBadge = true; o.badge = '🎯' + s.catches[name]; }
      if (id === 'mlt' && revealing && s.last && s.last.extra.win === name) { o.crown = true; o.spot = true; o.turn = false; }
      if (id === 'hot' && (revealing || me) && (me ? s.mine : A[name])) { var hv = me ? s.mine : A[name]; o.hasToken = true; o.token = [E.ice, E.cold, E.thinking, E.fire, E.pepper][hv - 1]; o.turn = o.turn && !revealing; }
      if (id === 'nhie' && revealing && A[name] === 'have') { o.hasPop = true; o.pop = '−1'; o.popColor = '#ff8b98'; }
      if (revealing && me && s.last && s.last.mine) { o.hasPop = true; o.pop = (s.last.mine > 0 ? '+' : '') + s.last.mine; o.popColor = s.last.mine > 0 ? '#5be0a0' : '#ff8b98'; }
      return o;
    });
    var cupsets = id === 'nhie' ? P.map(function (p, i) {
      var name = p[0], ang = (90 + i * 360 / n) * Math.PI / 180, lvs = s.lives[name], lost = revealing && A[name] === 'have';
      var cups = []; for (var c = 0; c < lvs + (lost ? 1 : 0); c++) cups.push({ cls: lost && c === lvs ? 'g3-tip' : '' });
      return { x: Math.round((R - 62) * Math.cos(ang)), y: Math.round((R - 62) * Math.sin(ang)), cups: cups };
    }) : [];
    var ti = Math.max(0, P.map(function (p) { return p[0]; }).indexOf(tp));
    var spinDeg = (k + 1) * 1080 + (ph === 'spin' && s.t < 0.6 ? 0 : (90 + ti * 360 / n) + 135);

    // centerpiece
    var countNum = ph === 'intro' ? (s.t < 1 ? '3' : s.t < 2 ? '2' : s.t < 3 ? '1' : 'GO!') : '';
    var holoTitle = G.name, holoSub = SP[lv] + ' deck', holoIcon = G.icon, showHolo = ph !== 'intro', showThermo = false, showCols = false, mercury = '8%', thermoLabel = 'How hot?', cols = [];
    if (ph === 'pick') { holoTitle = meTurn ? 'Your pick' : tp + ' picks'; holoSub = 'a card'; }
    if (id === 'tod') { showHolo = ph !== 'spin'; var ch = s.choice; holoTitle = ch ? ch.toUpperCase() : (ph === 'choose' ? 'Truth or dare?' : 'Spin!'); holoSub = s.proof && (ph === 'answer' || ph === 'reveal') ? 'proof sent 📸' : (meTurn ? 'it’s you!' : tp); holoIcon = ch === 'dare' ? E.horns : ch === 'truth' ? E.mic : E.bottle; }
    if (id === 'hot' && pr) { showHolo = false; showThermo = true; if (revealing) { mercury = Math.round(s.last.extra.avg / 5 * 100) + '%'; thermoLabel = 'Room: ' + ['', 'Hard no', 'Nah', 'Meh', 'Yeah', 'Facts'][s.last.extra.avg]; } else if (s.mine) mercury = (s.mine * 20) + '%'; }
    var PC = ['#5be0a0', '#22e1ff', '#ffd23d', '#ff5fa2'];
    if (id === 'poll' && pr) { showHolo = false; showCols = true; var pcs = revealing ? s.last.extra.pc : null, mx = pcs ? Math.max.apply(null, pcs.concat([1])) : 1;
      cols = pr.opts.map(function (o, j) { return { label: o, cap: pcs ? pcs[j] : '?', h: pcs ? Math.round(18 + pcs[j] / mx * 110) + 'px' : '14px', color: PC[j % 4] }; }); }

    // picking a card (your turn) or waiting for someone else to pick
    var offered = started ? this.offered(k) : [];
    var showPicker = ph === 'pick' && meTurn;
    var cards = showPicker ? offered.map(function (c, j) {
      var text = id === 'nhie' ? 'Never have I ever ' + c : id === 'wyr' ? c[0] + '  vs  ' + c[1] : id === 'mlt' ? 'Who’s most likely to ' + c + '?' : id === 'poll' ? c[0] : c;
      return { text: text, play: function () { self.setState({ card: j, phase: 'answer', t: 0 }); } };
    }) : [];
    var canWrite = showPicker && !!G.write;
    var own = s.own.trim();
    var waitPick = !meTurn && ['pick', 'spin', 'choose', 'act'].indexOf(ph) >= 0;
    var waitPickText = { pick: tp + ' is picking a card…', spin: 'The bottle is spinning…', choose: tp + ' is choosing truth or dare…', act: tp + ' is doing their ' + (s.choice || 'truth') + '…' }[ph] || '';
    var getReady = needMe ? 'Get ready. You’ll answer next.' : 'Sit tight.';

    // answer phase options
    var opt = function (label, sub, img, color, on, pick, off) { return { label: label, sub: sub || '', hasSub: !!sub, img: img || '', hasImg: !!img, bg: on ? color : (dark ? 'rgba(255,255,255,.04)' : '#ffffff'), ink: on ? '#120a16' : 'var(--ink)', line: color, on: on ? 'true' : 'false', pick: pick, off: !!off, op: off && !on ? 0.5 : 1 }; };
    var choose = function (v) { return function () { if (self.state.mine === null) self.setState({ mine: v }); }; };
    var guessFor = function (list) { return list.map(function (x) { return { label: x[1], cls: s.guessPick === x[0] ? 'on' : '', on: s.guessPick === x[0] ? 'true' : 'false', pick: function () { if (self.state.guessPick === null) self.setState({ guessPick: x[0] }); } }; }); };
    var opts = [], optCls = 'gr-opts--two', askKicker = '', askText = '', hasGuess = false, guess = [];
    var locked = s.mine !== null, phAsk = false;
    if (ph === 'answer' && pr) {
      phAsk = true;
      if (id === 'nhie') { askKicker = meTurn ? 'Your card' : tp + '’s card'; askText = pr.q; if (needMe) opts = [opt('I have', 'tip a cup', E.cup, '#ff4f6d', s.mine === 'have', choose('have'), locked), opt('Never', 'keep it', E.angel, '#7ef0c1', s.mine === 'never', choose('never'), locked)]; }
      if (id === 'wyr') { askKicker = (meTurn ? 'Your question' : tp + ' asks') + ' · would you rather'; askText = 'Pick a side'; opts = [opt(pr.a, 'side A', '', '#ff5fa2', s.mine === 'a', choose('a'), locked), opt(pr.b, 'side B', '', '#22e1ff', s.mine === 'b', choose('b'), locked)]; hasGuess = locked && this.special.bonus !== false; guess = guessFor([['a', 'Side A wins'], ['b', 'Side B wins']]); }
      if (id === 'mlt') { askKicker = (meTurn ? 'Your question' : tp + ' asks') + ' · vote a nickname'; askText = pr.q; optCls = 'gr-opts--grid'; opts = P.filter(function (p) { return p[0] !== 'MangoMoon'; }).map(function (p) { return opt(p[0], '', '', p[1], s.mine === p[0], choose(p[0]), locked); }); }
      if (id === 'hot') { askKicker = meTurn ? 'You’re in the hot seat · guess the room' : tp + '’s hot take · rate it'; askText = '“' + pr.q + '”'; optCls = 'gr-opts--scale'; opts = [['Hard no', E.ice, '#22e1ff'], ['Nah', E.cold, '#7fb2ff'], ['Meh', E.thinking, '#ffd23d'], ['Yeah', E.fire, '#ff9a4a'], ['Facts', E.pepper, '#ff4f6d']].map(function (x, j) { return opt(x[0], '', x[1], x[2], s.mine === j + 1, choose(j + 1), locked); }); }
      if (id === 'poll') { askKicker = (meTurn ? 'Your poll' : tp + '’s poll') + ' · vote'; askText = pr.q; optCls = 'gr-opts--list'; opts = pr.opts.map(function (o, j) { return opt(o, '', '', PC[j % 4], s.mine === j, choose(j), locked); }); hasGuess = locked && this.special.bonus !== false; guess = guessFor(pr.opts.map(function (o, j) { return [j, o]; })); }
      if (id === 'tod') { var ch2 = s.choice || 'truth'; askKicker = meTurn ? 'The table is judging you' : (ch2 === 'dare' ? 'Did ' + tp + ' really do it?' : 'Is ' + tp + ' telling the truth?'); askText = ch2 === 'dare' ? pr.dare : pr.truth; if (needMe) opts = [opt('Legit', ch2 === 'dare' ? '+1 if you match the table' : 'I believe it · +1 if you match', E.fire, '#5be0a0', s.mine === 'legit', choose('legit'), locked), opt('Chicken', ch2 === 'dare' ? 'call them out' : 'that’s cap', E.chicken, '#ffd23d', s.mine === 'chicken', choose('chicken'), locked)]; }
    }
    if (id === 'tod' && meTurn && (ph === 'choose' || ph === 'act')) {
      phAsk = true;
      if (ph === 'choose') { askKicker = 'The bottle picked you'; askText = 'Truth or dare?'; opts = [opt('Truth', 'answer honestly', E.mic, '#7fb2ff', false, function () { self.setState({ choice: 'truth', phase: 'act', t: 0 }); }), opt('Dare', 'prove it', E.horns, '#ff4f6d', false, function () { self.setState({ choice: 'dare', phase: 'act', t: 0 }); })];
        if (this.special.pass && !s.passUsed) opts.push(opt('Pass', 'once per game', E.angel, '#b78bff', false, function () { self.setState({ passUsed: true }); self.flash('You passed', 'No chicken badge. That was your one pass.', E.angel); self.begin(s.k + 1); })); }
      else { var pr2 = this.prompt(k); askKicker = (s.choice || 'truth').toUpperCase() + ' · your turn'; askText = s.choice === 'dare' ? pr2.dare : pr2.truth; var needsProof = this.proofOn();
        if (!s.proofing) opts = [opt(s.choice === 'dare' ? 'I did it' : 'I’ll answer', needsProof ? (s.choice === 'dare' ? 'next: photo or video proof' : 'type it, add a photo if you want') : 'answer out loud', E.fire, '#5be0a0', false, function () { if (needsProof) self.setState({ proofing: true }); else self.setState({ didIt: 'done', phase: 'answer', t: 0 }); }), opt('Chicken out', '−1 point', E.chicken, '#ffd23d', false, function () { self.setState({ didIt: 'chicken', phase: 'answer', t: 0, proofing: false }); })];
        else { askKicker = (s.choice === 'dare' ? 'Dare' : 'Truth') + ' · ' + (s.choice === 'dare' ? pr2.dare : pr2.truth); askText = s.choice === 'dare' ? 'Show the table you did it' : 'Your answer'; } }
    }
    // proof: capturing yours, or reviewing theirs before you vote
    var proofOwner = meTurn ? 'Your' : tp + '’s';
    var proofing = id === 'tod' && meTurn && ph === 'act' && s.proofing;
    var hasProof = id === 'tod' && !!s.proof && (ph === 'answer' || revealing);
    var hasAnyProof = id === 'tod' && (ph === 'answer' || revealing) && (!!s.proof || !!(s.answer && s.answer.trim()));
    var proofHidden = hasProof && !meTurn && !s.proofShown;
    var proofVals = {
      proofing: proofing, proofEmpty: proofing && !s.proof, proofReady: proofing && !!s.proof,
      hasProof: hasAnyProof, proofHidden: proofHidden, proofOpen: hasProof && !proofHidden,
      proofCls: proofHidden ? 'blur' : '', proofTag: s.proof ? (s.proof.kind === 'video' ? '▶ Video · ' + (s.proof.dur ? Math.floor(Math.min(15, s.proof.dur) / 60) + ':' + ('0' + Math.round(Math.min(15, s.proof.dur) % 60)).slice(-2) : '0:12') : 'Photo') : '',
      proofTitle: proofOwner + (s.choice === 'dare' ? ' proof' : ' answer'), proofNote: meTurn ? 'Only this table sees it. It disappears when the game ends.' : 'Blurred until you tap. Only this table sees it.',
      noProofNote: false,
      proofTruth: proofing && s.choice !== 'dare', proofDare: proofing && s.choice === 'dare',
      captureTitle: s.choice === 'dare' ? 'Photo or video proof · required' : 'Add a photo or video · optional',
      answer: s.answer, onAnswer: function (e) { self.setState({ answer: e.target.value.slice(0, 280) }); },
      cantSend: s.choice === 'dare' ? !s.proof : s.answer.trim().length < 2,
      sendLabel: s.choice === 'dare' ? (s.proof ? 'Send ' + s.proof.kind + ' to the table' : 'Add a photo or video first') : 'Send my answer',
      chickenOut: function () { self.setState({ didIt: 'chicken', phase: 'answer', t: 0, proofing: false, proof: null }); },
      hasAnswer: id === 'tod' && !!(s.answer && s.answer.trim()) && (ph === 'answer' || revealing), answerShown: '“' + (s.answer || '').trim() + '”',
      hasMedia: hasProof,
      takePhoto: function () { self.setState({ proof: { kind: 'photo' } }); }, takeVideo: function () { self.setState({ proof: { kind: 'video' } }); },
      onFile: function (e) {
        var f = e && e.target && e.target.files && e.target.files[0]; if (!f) return;
        var url = ''; try { url = URL.createObjectURL(f); } catch (x) {}
        self.setState({ proof: { kind: f.type && f.type.indexOf('video') === 0 ? 'video' : 'photo', url: url, name: f.name } });
        try { e.target.value = ''; } catch (x) {}
      },
      onMeta: function (e) { var d = e && e.target ? e.target.duration : 0; if (d && self.state.proof && !self.state.proof.dur) self.setState({ proof: Object.assign({}, self.state.proof, { dur: d }) }); },
      proofUrl: s.proof && s.proof.url ? s.proof.url : '/sk/hero-dark.png',
      proofIsVideo: !!(s.proof && s.proof.kind === 'video' && s.proof.url), proofIsPhoto: !(s.proof && s.proof.kind === 'video' && s.proof.url),
      proofLong: !!(s.proof && s.proof.dur > 15),
      retake: function () { try { if (s.proof && s.proof.url) URL.revokeObjectURL(s.proof.url); } catch (x) {} self.setState({ proof: null }); },
      sendProof: function () { self.setState({ didIt: 'done', phase: 'answer', t: 0, proofing: false }); },
      skipProof: function () { self.setState({ didIt: 'done', phase: 'answer', t: 0, proofing: false, proof: null }); },
      showProof: function () { self.setState({ proofShown: true }); }
    };
    this.proofVals = proofVals;
    var dots = otherAns.map(function (nm, j) { var on = j < inCount; return { color: C[nm], op: on ? 1 : 0.28, mark: on ? '✓' : nm.charAt(0) }; });
    var waitText = ph === 'answer' ? inCount + ' of ' + otherAns.length + ' answered' : '';

    // reveal
    var bars = [], hasBars = false, hasTug = false, tugA = '50%', tugB = '50%', revKicker = '', revTitle = s.last ? s.last.title : '';
    var bar = function (label, count, tot, color, mine) { return { label: label, count: count, pct: Math.round(count / Math.max(1, tot) * 100) + '%', color: color, ring: mine ? '2px solid currentColor' : 'none' }; };
    if (revealing && s.last && pr) {
      var X = s.last.extra;
      if (id === 'nhie') { var hv2 = X.caught.length, tot2 = ans.length; hasBars = true; revKicker = pr.q; revTitle = hv2 + ' of ' + tot2 + ' have'; bars = [bar('I have' + (hv2 ? ' · ' + X.caught.map(function (x) { return x === 'MangoMoon' ? 'You' : x; }).join(', ') : ''), hv2, tot2, '#ff4f6d', A.MangoMoon === 'have'), bar('Never', tot2 - hv2, tot2, '#7ef0c1', A.MangoMoon === 'never')]; }
      if (id === 'wyr') { hasTug = true; tugA = Math.round(X.ca / (X.ca + X.cb) * 100) + '%'; tugB = Math.round(X.cb / (X.ca + X.cb) * 100) + '%'; revKicker = pr.a + ' vs ' + pr.b; }
      if (id === 'mlt') { var tt = 0; Object.keys(X.tally).forEach(function (q) { tt += X.tally[q]; }); hasBars = true; revKicker = pr.q; bars = Object.keys(X.tally).sort(function (x, y) { return X.tally[y] - X.tally[x]; }).slice(0, this.special.full === false ? 1 : 9).map(function (q, j) { return bar((j === 0 ? '👑 ' : '') + (q === 'MangoMoon' ? 'You' : q), X.tally[q], tt, C[q], q === A.MangoMoon); }); }
      if (id === 'hot') { revKicker = '“' + pr.q + '”'; hasBars = true; var dist = [0, 0, 0, 0, 0]; X.raters.forEach(function (q) { dist[A[q] - 1]++; }); bars = ['Hard no', 'Nah', 'Meh', 'Yeah', 'Facts'].map(function (l, j) { return bar(l, dist[j], X.raters.length, ['#22e1ff', '#7fb2ff', '#ffd23d', '#ff9a4a', '#ff4f6d'][j], A.MangoMoon === j + 1 && !meTurn); }); }
      if (id === 'poll') { hasBars = true; revKicker = pr.q; bars = pr.opts.map(function (o, j) { return bar(o, X.pc[j], ans.length, PC[j % 4], A.MangoMoon === j); }); }
      if (id === 'tod') { hasBars = true; revKicker = (s.choice || 'truth').toUpperCase() + ' · ' + (meTurn ? 'you' : tp) + (s.proof ? ' · with a ' + s.proof.kind : ''); bars = [bar('Legit', X.lg, X.lg + X.ck, '#5be0a0', s.mine === 'legit'), bar('🐔 Chicken', X.ck, X.lg + X.ck, '#ffd23d', s.mine === 'chicken')]; }
    }
    var last = s.last || { mine: 0, title: '', sub: '', icon: G.icon, good: true };
    var standing = this.standing();
    var myRank = standing.map(function (x) { return x.name; }).indexOf('MangoMoon') + 1;
    var top3 = [standing[1], standing[0], standing[2]].filter(Boolean);
    var colors = ['#ffd23d', '#ff5fa2', '#7a3cff', '#22e1ff', '#5be0a0', '#ffffff'];
    var confetti = []; if (ph === 'over') for (var c = 0; c < 18; c++) confetti.push({ k: (c % 6) + 1, color: colors[c % 6], delay: (0.8 + c * 0.04).toFixed(2) + 's', shift: ((c * 37) % 90 - 45) + 'px' });
    var AW = {
      nhie: [[E.angel, 'Cleanest hands', 'Kept the most cups'], [E.cup, 'Best catcher', 'Caught the most people'], [E.skull, 'Living dangerously', 'Tipped the most cups']],
      tod: [[E.fire, 'Fearless', 'Most dares done'], [E.chicken, 'Biggest chicken', 'Most chicken votes'], [E.mic, 'Truth teller', 'Best truth answers']],
      wyr: [[E.swords, 'Crowd reader', 'With the majority most'], [E.devil, 'Lone rebel', 'Picked the minority most'], [E.coin, 'Question master', 'Asked the closest splits']],
      mlt: [[E.crown, 'Most crowned', 'Won the most turns'], [E.eyes, 'Room reader', 'Voted with the table most'], [E.star, 'Main character', 'Got votes every turn']],
      hot: [[E.thermo, 'Room reader', 'Closest to the room'], [E.pepper, 'Spiciest takes', 'Furthest from the room'], [E.ice, 'Coolest head', 'Most “Meh” answers']],
      poll: [[E.chart, 'Trend setter', 'Voted with the winner most'], [E.coin, 'Oracle', 'Best winner guesses'], [E.ballot, 'Swing vote', 'Decided a close poll']]
    }[id];
    var awardWho = [standing[0], standing[standing.length - 1], standing[1]];
    var roster = [];
    if (s.sheet === 'table') roster = standing.map(function (x, j) { return { rank: j + 1, name: x.name === 'MangoMoon' ? 'You' : x.name, initial: x.name.charAt(0), color: x.color, sub: x.label + (x.name === tp && started && ph !== 'over' ? ' · their turn now' : ''), canAct: false }; });
    if (s.sheet === 'players') roster = standing.map(function (x, j) { var me = x.name === 'MangoMoon'; return { rank: j + 1, name: me ? 'You (host)' : x.name, initial: x.name.charAt(0), color: x.color, sub: x.label, canAct: !me, actLabel: 'Kick', btnCls: 'btn-danger', act: function () { self.setState({ kicked: s.kicked.concat([x.name]), sheet: null }); self.flash(x.name + ' was removed', 'Their turns are skipped. They can’t rejoin.', E.devil); if (x.name === tp && started) self.begin(s.k + 1); } }; });
    if (s.sheet === 'report') roster = standing.filter(function (x) { return x.name !== 'MangoMoon'; }).map(function (x, j) { var done = !!s.reported[x.name]; return { rank: j + 1, name: x.name, initial: x.name.charAt(0), color: x.color, sub: done ? 'Reported · they get a warning' : 'Report what they said or did', canAct: true, actLabel: done ? 'Reported' : 'Report', btnCls: done ? '' : 'btn-ink', act: function () { var o = Object.assign({}, s.reported); o[x.name] = true; self.setState({ reported: o }); } }; });
    var limit = ph === 'act' || ph === 'pick' ? this.timer + 5 : this.timer;
    var timed = ['pick', 'choose', 'act', 'answer'].indexOf(ph) >= 0;
    var secs = timed ? Math.max(0, limit - Math.floor(s.t)) : 0;
    var RE = [['Haha', E.joy], ['Dead', E.skull], ['Shook', E.scream], ['Fire', E.fire], ['Love', E.heart]];
    return Object.assign({
      mode: dark ? 'dark' : 'light', isDark: dark, isLight: !dark,
      ads: this.props.ads === 'off' ? 'off' : 'on',
      g: G, sc: G.sc, isTod: id === 'tod', isWyr: id === 'wyr',
      turnLine: (this.room || G.room) + ' · ' + P.length + ' players · code K7Q2', totalTurns: total,
      turnChip: ph === 'over' ? 'Final' : started ? 'Turn ' + (k + 1) + ' of ' + total : total + ' turns', spiceChip: SP[lv] + (lv === 2 ? ' 🔥' : ''), spiceBg: SPC[lv],
      strip: strip, banner: banner, bannerPulse: myMoment ? 'gr-pulse' : '', panelCls: myMoment ? 'is-me' : '',
      seats: seats, cupsets: cupsets, spin: spinDeg + 'deg',
      showHolo: showHolo, holoTitle: holoTitle, holoSub: holoSub, holoIcon: holoIcon, showThermo: showThermo, mercury: mercury, thermoLabel: thermoLabel, showCols: showCols, cols: cols,
      phIntro: ph === 'intro', introTitle: total + ' turns, everyone leads once' + (this.laps > 1 ? ' per lap' : ''),
      introBody: 'On your turn you ' + { nhie: 'pick a “Never have I ever” card. Anyone who has tips a cup and you catch them.', tod: 'face the bottle: truth or dare, and the table judges it.', wyr: 'pick the dilemma and everyone walks to a side.', mlt: 'pick the question and everyone votes a nickname.', hot: 'drop a hot take and guess how the room rates it.', poll: 'post a poll; everyone votes and guesses the winner.' }[id] + ' On everyone else’s turn, you answer. ' + (this.esc ? 'Decks get spicier as you go.' : 'Deck: ' + SP[this.spiceStart] + ' all game.') + ' Packs: ' + this.packs.join(', ') + '.' + (this.late ? ' You joined mid-game, so you play from turn ' + Math.min(3, total) + '.' : ''),
      showPicker: showPicker, pickKicker: 'Pick a card · ' + SP[lv] + ' deck', cards: cards, canWrite: canWrite, own: s.own, ownHint: G.write || '',
      onOwn: function (e) { self.setState({ own: e.target.value }); }, cantOwn: own.length < 8,
      playOwn: function () { if (own.length >= 8) self.setState({ card: 'own', phase: 'answer', t: 0 }); },
      showWaitPick: waitPick, waitPickText: waitPickText, getReady: getReady,
      phAsk: phAsk, askKicker: askKicker, askText: askText, opts: opts, hasOpts: opts.length > 0, optCls: optCls,
      hasGuess: hasGuess, guess: guess, hasWait: ph === 'answer', dots: dots, waitText: waitText,
      phReveal: revealing, revKicker: revKicker, revTitle: revTitle, bars: bars, hasBars: hasBars, hasTug: hasTug, tugA: tugA, tugB: tugB,
      resTitle: last.title, resSub: last.sub, resIcon: last.icon, resPts: (last.mine > 0 ? '+' : '') + last.mine,
      resBg: last.good ? 'rgba(91,224,160,.16)' : 'rgba(255,79,109,.14)',
      nextColor: nextName ? C[nextName] : '#ffd23d', nextInitial: nextName ? nextName.charAt(0) : '★',
      nextText: nextName ? (nextName === 'MangoMoon' ? 'Next up: YOU. Get ready to lead.' : 'Next up: ' + nextName + (nextIdx + 1 === myPos ? ' · you’re after them' : '')) : 'That was the last turn. Final results next.',
      reacts: RE.map(function (x) { return { name: x[0], src: x[1], send: function () { self.react(x[1]); } }; }), fx: s.fx,
      myRank: myRank || 1, myScore: id === 'nhie' ? s.lives.MangoMoon + ' cups' : (s.scores.MangoMoon || 0) + ' pts',
      comboLabel: s.combo >= 2 ? 'Combo ×' + s.combo + ' 🔥' : 'No combo', comboBg: s.combo >= 2 ? '#ff3b8d' : 'var(--card2)',
      secs: secs, secsShown: timed ? secs : '–', ringDash: timed ? (secs / limit * 119).toFixed(1) : '0', ringColor: secs <= 5 ? '#ff4f6d' : (myMoment ? '#ff3b8d' : '#ffd23d'),
      paused: s.paused, pauseText: host ? 'Paused' : 'The host paused the game',
      nick: this.nick, isHost: host, notHost: !host, isGuest: role === 'guest', isMember: role !== 'guest',
      meLabel: role === 'guest' ? 'Guest · ' + this.nick : 'You are ' + this.nick, playerCount: P.length,
      togglePause: function () { self.setState({ paused: !s.paused }); }, pauseLabel: s.paused ? 'Resume' : 'Pause',
      skip: function () { if (ph === 'answer') self.resolve(); else if (ph === 'reveal' || ph === 'intro') self.begin(ph === 'intro' ? 0 : s.k + 1); else self.setState({ t: 30 }); },
      openTable: function () { self.setState({ sheet: 'table' }); }, openPlayers: function () { self.setState({ sheet: 'players' }); }, openReport: function () { self.setState({ sheet: 'report' }); },
      openEnd: function () { self.setState({ sheet: 'end' }); }, closeSheet: function () { self.setState({ sheet: null }); },
      endNow: function () { self.setState({ sheet: null, phase: 'over' }); },
      showCount: ph === 'intro', countNum: countNum,
      openLeave: function () { self.setState({ sheet: 'leave' }); }, sheetLeave: s.sheet === 'leave',
      leaveTitle: host ? 'Leave your own game?' : 'Leave the game?',
      leaveSub: host ? 'You’re the host. Hand hosting to someone, or end it for everyone.' : 'You’ll lose your seat and your ' + (id === 'nhie' ? s.lives.MangoMoon + ' cups' : (s.scores.MangoMoon || 0) + ' points') + '. The game carries on without you.',
      handTo: (P.filter(function (p) { return p[0] !== 'MangoMoon'; })[0] || ['someone'])[0],
      handOver: function () { self.setState({ handed: true, sheet: null }); self.flash((P.filter(function (p) { return p[0] !== 'MangoMoon'; })[0] || ['They'])[0] + ' is the host now', 'You’re still at the table as a player. Use Leave to go.', E.crown); },
      newGame: function () { try { window.localStorage.removeItem('sk-pick'); window.localStorage.removeItem('sk-wiz'); window.localStorage.setItem('sk-nav', String(Date.now())); } catch (e) {} }, endSub: (total - k) + ' turns left. Scores so far count and everyone sees the results.',
      sheetList: ['table', 'players', 'report'].indexOf(s.sheet) >= 0, sheetEnd: s.sheet === 'end',
      sheetTitle: { table: 'Standings', players: 'Players in the room', report: 'Report a player' }[s.sheet] || '',
      sheetSub: { table: 'Turn ' + (k + 1) + ' of ' + total + '. Updated after every turn.', players: 'Kicked players lose their turns and can’t rejoin.', report: 'They get a warning, same as on links. After 3, the 4th report blocks them from your games.' }[s.sheet] || '',
      roster: roster,
      orbStart: function (e) { self.drag = { x: e.clientX, o: self.orb || 0 }; try { e.currentTarget.setPointerCapture(e.pointerId); } catch (x) {} },
      orbMove: function (e) { if (!self.drag) return; var o = Math.max(-40, Math.min(40, self.drag.o + (e.clientX - self.drag.x) * 0.35)); e.currentTarget.style.setProperty('--orb', o.toFixed(1) + 'deg'); self.drag.cur = o; },
      orbEnd: function () { if (!self.drag) return; if (self.drag.cur !== undefined) self.orb = self.drag.cur; self.drag = null; },
      phOver: ph === 'over',
      podium: top3.map(function (x) { var place = x === standing[0] ? 1 : x === standing[1] ? 2 : 3; return { name: x.name === 'MangoMoon' ? 'You' : x.name, initial: x.name.charAt(0), color: x.color, place: place, first: place === 1, h: [0, 96, 70, 52][place] + 'px', block: ['', 'linear-gradient(180deg,#ffd23d,#c99a12)', 'linear-gradient(180deg,#e6e6f0,#a9a9bd)', 'linear-gradient(180deg,#ffb37a,#b8642f)'][place], delay: (0.2 + (3 - place) * 0.25) + 's' }; }),
      confetti: confetti,
      finalRanks: standing.map(function (x, j) { return { rank: j + 1, name: x.name === 'MangoMoon' ? 'You' : x.name, initial: x.name.charAt(0), color: x.color, score: x.label, w: x.name === 'MangoMoon' ? 800 : 600 }; }),
      placeTitle: '#' + (myRank || 1) + (myRank === 1 ? ' · Winner!' : ' of ' + standing.length), placeSub: standing[0].name === 'MangoMoon' ? 'Everyone else wants a rematch.' : standing[0].name + ' took it after ' + total + ' turns. Run it back?',
      xp: 40 + Math.max(0, s.scores.MangoMoon || 0) * 5,
      awards: AW.map(function (a, j) { var w = awardWho[j] || standing[0]; return { icon: a[0], title: a[1], who: (w.name === 'MangoMoon' ? 'You' : w.name) + ' · ' + a[2], delay: (0.3 + j * 0.12) + 's' }; }),
      saveCrew: function () { try { window.localStorage.setItem('sk-crew-new', JSON.stringify({ game: document.title, players: ['Fox', 'KolaNut', 'PixelOwl', 'Zobo'] })); } catch (e) {} },
      rematch: function () { self.setState(self.fresh(s.mode)); self.flash('Rematch!', 'Same table. Unhinged deck unlocked.', E.devil); },
      toast: !!s.toast, toastTitle: s.toast ? s.toast.title : '', toastSub: s.toast ? s.toast.sub : '', toastIcon: s.toast ? s.toast.icon : ''
    }, proofVals);
  }

  render() {
    // like the mockup runtime: the template sees the props merged with renderVals()
    const v = { ...this.props, ...(this.renderVals() || {}) };
    return (
      <>
      {" "}
      <div className="sk" data-mode={v.mode} data-ads={v.ads}>
        {" "}
        <div className="gr-wrap">
          {" "}
          <header className="gr-top">
            {" "}
            <button className="icon-btn tap" onClick={v.openLeave} aria-label="Leave game">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M15 18 9 12l6-6" />
              </svg>
            </button>
            {" "}
            <img src={v.g.icon} alt="" style={{ width: "34px", height: "34px", flex: "none" }} />
            {" "}
            <div style={{ flex: "1", minWidth: "0" }}>
              <b className="d" style={{ fontSize: "17px", display: "block", lineHeight: "1.1" }}>
                {v.g.name}
              </b>
              <span className="muted" style={{ fontSize: "12.5px" }}>
                {v.turnLine}
              </span>
            </div>
            {" "}
            <button className="btn btn-sm tap" onClick={v.openTable} style={{ padding: "0 12px" }}>
              Table
            </button>
            {" "}
            <svg width="44" height="44" viewBox="0 0 46 46" role="img" aria-label={`${v.secs} seconds left`} style={{ flex: "none" }}>
              <circle cx="23" cy="23" r="19" fill="none" stroke="var(--line)" strokeWidth="4" />
              <circle cx="23" cy="23" r="19" fill="none" stroke={v.ringColor} strokeWidth="4" strokeLinecap="round" strokeDasharray={`${v.ringDash} 120`} transform="rotate(-90 23 23)" />
              <text x="23" y="28" textAnchor="middle" fontSize="14" fontWeight="800" fill="currentColor">
                {v.secsShown}
              </text>
            </svg>
            {" "}
          </header>
          {" "}
          <div className="gr-strip" aria-label="Turn order">
            {" "}
            {(v.strip || []).map((st, i0) => (
              <Fragment key={i0}>
              <span className={`gr-tk ${st.cls}`}>
                <i style={{ background: st.color }}>
                  {st.initial}
                </i>
                {st.label}
              </span>
              </Fragment>
            ))}
            {" "}
          </div>
          {" "}
          <div className="gr-grid">
            {" "}
            <section className="g3" aria-label="Game table" onPointerDown={v.orbStart} onPointerMove={v.orbMove} onPointerUp={v.orbEnd} onPointerLeave={v.orbEnd}>
              {" "}
              <div className="g3-sky" style={{ background: v.sc.sky }} />
              {" "}
              <div className="g3-glow" style={{ background: v.sc.glow }} />
              {" "}
              <div className="g3-hud">
                <span className="g3-chip">
                  {v.turnChip}
                </span>
                <span className="g3-chip" style={{ background: v.spiceBg }}>
                  {v.spiceChip}
                </span>
              </div>
              {" "}
              <div className="g3-cam">
                {" "}
                <div className="g3-floor" style={{ backgroundImage: v.sc.floor }} />
                {" "}
                <div className="g3-table" style={{ background: v.sc.table }}>
                  {" "}
                  {v.isWyr ? (
                    <>
                    {" "}
                    <div>
                      {" "}
                      <div className="g3-half" style={{ background: "linear-gradient(90deg,rgba(255,59,141,.75),rgba(255,59,141,.2) 50%,transparent 50%)" }}>
                        <b style={{ left: "18%" }}>
                          A
                        </b>
                      </div>
                      {" "}
                      <div className="g3-half" style={{ background: "linear-gradient(270deg,rgba(34,225,255,.75),rgba(34,225,255,.2) 50%,transparent 50%)" }}>
                        <b style={{ right: "18%" }}>
                          B
                        </b>
                      </div>
                      {" "}
                    </div>
                    {" "}
                    </>
                  ) : null}
                  {" "}
                </div>
                {" "}
                {v.isTod ? (
                  <>
                  <img className="g3-bottle" src="/sk/bottle_with_popping_cork_3d.png" alt="" style={{ "--spin": v.spin }} />
                  </>
                ) : null}
                {" "}
                <div className="g3-at" style={{ transform: "translate3d(0, 40px, 0)" }}>
                  {" "}
                  <div className="g3-bb">
                    {" "}
                    {v.showCount ? (
                      <>
                      <div className="gr-count" style={{ marginBottom: "18px" }}>
                        {v.countNum}
                      </div>
                      </>
                    ) : null}
                    {" "}
                    {v.showHolo ? (
                      <>
                      {" "}
                      <div className="g3-holo g3-flip" style={{ marginBottom: "14px" }}>
                        <img src={v.holoIcon} alt="" style={{ width: "26px", height: "26px" }} />
                        <b>
                          {v.holoTitle}
                        </b>
                        <span style={{ fontSize: "11px", fontWeight: "700", opacity: ".85" }}>
                          {v.holoSub}
                        </span>
                      </div>
                      {" "}
                      </>
                    ) : null}
                    {" "}
                    {v.showThermo ? (
                      <>
                      {" "}
                      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "4px", marginBottom: "26px" }}>
                        <span className="g3-chip">
                          {v.thermoLabel}
                        </span>
                        <div className="g3-thermo">
                          <div className="g3-merc" style={{ height: v.mercury }} />
                        </div>
                      </div>
                      {" "}
                      </>
                    ) : null}
                    {" "}
                    {v.showCols ? (
                      <>
                      {" "}
                      <div style={{ display: "flex", alignItems: "flex-end", gap: "10px", marginBottom: "18px" }}>
                        {" "}
                        {(v.cols || []).map((cl, i0) => (
                          <Fragment key={i0}>
                          {" "}
                          <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                            <span className="g3-colcap">
                              {cl.cap}
                            </span>
                            <div className="g3-col" style={{ height: cl.h, background: cl.color }} />
                            <span className="g3-colcap" style={{ margin: "4px 0 0", maxWidth: "60px", overflow: "hidden", textOverflow: "ellipsis" }}>
                              {cl.label}
                            </span>
                          </div>
                          {" "}
                          </Fragment>
                        ))}
                        {" "}
                      </div>
                      {" "}
                      </>
                    ) : null}
                    {" "}
                  </div>
                  {" "}
                </div>
                {" "}
                {(v.cupsets || []).map((cs, i0) => (
                  <Fragment key={i0}>
                  {" "}
                  <div className="g3-at" style={{ transform: `translate3d(${cs.x}px, ${cs.y}px, 0)` }}>
                    <div className="g3-bb">
                      <div className="g3-cups">
                        {(cs.cups || []).map((cu, i2) => (
                          <Fragment key={i2}>
                          <img className={cu.cls} src="/sk/tropical_drink_3d.png" alt="" />
                          </Fragment>
                        ))}
                      </div>
                    </div>
                  </div>
                  {" "}
                  </Fragment>
                ))}
                {" "}
                {(v.seats || []).map((p, i0) => (
                  <Fragment key={i0}>
                  {" "}
                  <div className="g3-at" style={{ transform: `translate3d(${p.x}px, ${p.y}px, 0)` }}>
                    {" "}
                    <div className="g3-shadow" />
                    {" "}
                    <div className="g3-bb">
                      {" "}
                      {p.spot ? (
                        <>
                        <div className="g3-spot" style={{ position: "absolute", left: "50%", bottom: "-10px", translate: "-50% 0" }} />
                        </>
                      ) : null}
                      {" "}
                      <div className={`g3-fig ${p.cls}`}>
                        {" "}
                        {p.turn ? (
                          <>
                          <span className="gr-mark">
                            ▼ TURN
                          </span>
                          </>
                        ) : null}
                        {" "}
                        {p.crown ? (
                          <>
                          <img className="g3-crown" src="/sk/crown_3d.png" alt="Crown" />
                          </>
                        ) : null}
                        {" "}
                        {p.hasToken ? (
                          <>
                          <img className="pop" src={p.token} alt="" style={{ width: "32px", height: "32px", marginBottom: "2px" }} />
                          </>
                        ) : null}
                        {" "}
                        {p.hasPop ? (
                          <>
                          <span className="g3-pop" style={{ fontWeight: "800", fontSize: "15px", color: p.popColor, textShadow: "0 2px 6px rgba(0,0,0,.6)" }}>
                            {p.pop}
                          </span>
                          </>
                        ) : null}
                        {" "}
                        <span className="g3-name" style={{ background: p.tagBg }}>
                          {p.label}
                        </span>
                        {" "}
                        <div className="g3-head" style={{ background: p.color }}>
                          {p.initial}
                          {p.hasBadge ? (
                            <>
                            <span className="g3-badge" style={{ background: p.badgeBg }}>
                              {p.badge}
                            </span>
                            </>
                          ) : null}
                        </div>
                        {" "}
                        <div className="g3-body" style={{ background: p.color }} />
                        {" "}
                      </div>
                      {" "}
                    </div>
                    {" "}
                  </div>
                  {" "}
                  </Fragment>
                ))}
                {" "}
              </div>
              {" "}
              <div className="g3-fx" aria-hidden="true">
                {(v.fx || []).map((f, i0) => (
                  <Fragment key={i0}>
                  <img src={f.src} alt="" style={{ left: f.left }} />
                  </Fragment>
                ))}
              </div>
              {" "}
              {v.paused ? (
                <>
                <div className="gr-pause">
                  {v.pauseText}
                </div>
                </>
              ) : null}
              {" "}
              <div className="g3-hint">
                {v.sc.name}{" · drag to look around"}
              </div>
              {" "}
            </section>
            {" "}
            <section className={`gr-panel ${v.panelCls}`} aria-live="polite">
              {" "}
              <div className={`gr-banner ${v.bannerPulse}`} style={{ background: v.banner.bg, color: v.banner.ink }}>
                {" "}
                <span className="av" style={{ background: v.banner.color }}>
                  {v.banner.initial}
                </span>
                {" "}
                <span style={{ flex: "1", minWidth: "0" }}>
                  <b>
                    {v.banner.title}
                  </b>
                  <span>
                    {v.banner.sub}
                  </span>
                </span>
                {" "}
              </div>
              {" "}
              {v.phIntro ? (
                <>
                {" "}
                <div style={{ textAlign: "center", padding: "6px 0 4px" }}>
                  {" "}
                  <div className="gr-q">
                    {v.introTitle}
                  </div>
                  {" "}
                  <p className="muted" style={{ marginTop: "8px", fontSize: "14.5px", lineHeight: "1.5" }}>
                    {v.introBody}
                  </p>
                  {" "}
                </div>
                {" "}
                </>
              ) : null}
              {" "}
              {v.showPicker ? (
                <>
                {" "}
                <div>
                  {" "}
                  <div className="gr-k">
                    {v.pickKicker}
                  </div>
                  {" "}
                  <div className="gr-cards">
                    {" "}
                    {(v.cards || []).map((cd, i0) => (
                      <Fragment key={i0}>
                      <button className="gr-card" onClick={cd.play} style={{ "--sp": v.spiceBg }}>
                        {cd.text}
                      </button>
                      </Fragment>
                    ))}
                    {" "}
                  </div>
                  {" "}
                  {v.canWrite ? (
                    <>
                    {" "}
                    <div style={{ display: "flex", gap: "8px", marginTop: "10px" }}>
                      {" "}
                      <label htmlFor="gr-own" className="sr">
                        Write your own
                      </label>
                      {" "}
                      <input id="gr-own" className="field" value={v.own ?? ""} onChange={v.onOwn} maxLength="120" placeholder={v.ownHint} style={{ flex: "1", minWidth: "0", minHeight: "48px", fontSize: "15px" }} />
                      {" "}
                      <button className="btn btn-cta tap" onClick={v.playOwn} disabled={!!(v.cantOwn)}>
                        Play
                      </button>
                      {" "}
                    </div>
                    {" "}
                    </>
                  ) : null}
                  {" "}
                </div>
                {" "}
                </>
              ) : null}
              {" "}
              {v.showWaitPick ? (
                <>
                {" "}
                <div style={{ textAlign: "center" }}>
                  {" "}
                  <div className="gr-q" style={{ fontSize: "20px" }}>
                    {v.waitPickText}
                  </div>
                  {" "}
                  <div className="gr-backs" aria-hidden="true">
                    <span />
                    <span />
                    <span />
                  </div>
                  {" "}
                  <p className="muted" style={{ marginTop: "12px", fontSize: "13.5px" }}>
                    {v.getReady}
                  </p>
                  {" "}
                </div>
                {" "}
                </>
              ) : null}
              {" "}
              {v.phAsk ? (
                <>
                {" "}
                <div>
                  {" "}
                  <div className="gr-k">
                    {v.askKicker}
                  </div>
                  {" "}
                  <div className="gr-q rise">
                    {v.askText}
                  </div>
                  {" "}
                  {v.proofing ? (
                    <>
                    {" "}
                    <div className="rise" style={{ marginTop: "12px", display: "flex", flexDirection: "column", gap: "10px" }}>
                      {" "}
                      {v.proofTruth ? (
                        <>
                        {" "}
                        <div>
                          <label htmlFor="tod-answer" className="sr">
                            Your answer
                          </label>
                          <textarea id="tod-answer" className="field" value={v.answer ?? ""} onChange={v.onAnswer} maxLength="280" placeholder="Be honest. The table is waiting…" style={{ minHeight: "96px", fontSize: "16px" }} />
                        </div>
                        {" "}
                        </>
                      ) : null}
                      {" "}
                      {v.proofEmpty ? (
                        <>
                        {" "}
                        <div style={{ border: "2px dashed var(--line)", borderRadius: "20px", padding: "14px", textAlign: "center" }}>
                          {" "}
                          <div style={{ fontWeight: "800" }}>
                            {v.captureTitle}
                          </div>
                          {" "}
                          <div className="muted" style={{ fontSize: "13px", marginTop: "4px" }}>
                            {v.proofNote}
                          </div>
                          {" "}
                          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px", marginTop: "12px" }}>
                            {" "}
                            <label className="gr-opt tap" style={{ minHeight: "86px", borderColor: "#ff5fa2", background: "transparent", color: "var(--ink)", cursor: "pointer" }}>
                              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                                <path d="M4 8h3l2-3h6l2 3h3v11H4z" />
                                <circle cx="12" cy="13" r="3.5" />
                              </svg>
                              <span>
                                Photo
                              </span>
                              <small>
                                camera or gallery
                              </small>
                              <input type="file" accept="image/*" capture="environment" onChange={v.onFile} className="sr" />
                            </label>
                            {" "}
                            <label className="gr-opt tap" style={{ minHeight: "86px", borderColor: "#22e1ff", background: "transparent", color: "var(--ink)", cursor: "pointer" }}>
                              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                                <rect x="3" y="6" width="13" height="12" rx="2" />
                                <path d="m16 10 5-3v10l-5-3" />
                              </svg>
                              <span>
                                15s video
                              </span>
                              <small>
                                record or pick
                              </small>
                              <input type="file" accept="video/*" capture="environment" onChange={v.onFile} className="sr" />
                            </label>
                            {" "}
                          </div>
                          {" "}
                          <button className="btn btn-ghost btn-sm" onClick={v.takePhoto} style={{ border: "0", marginTop: "6px", color: "var(--muted)" }}>
                            No camera handy? Use a sample photo
                          </button>
                          {" "}
                        </div>
                        {" "}
                        </>
                      ) : null}
                      {" "}
                      {v.proofReady ? (
                        <>
                        {" "}
                        <div style={{ position: "relative" }}>
                          {" "}
                          <div className="media pop" style={{ height: "220px" }}>
                            {v.proofIsVideo ? (
                              <>
                              <video src={v.proofUrl} controls playsInline muted onLoadedMetadata={v.onMeta} style={{ display: "block", width: "100%", height: "100%", objectFit: "cover" }} />
                              </>
                            ) : null}
                            {v.proofIsPhoto ? (
                              <>
                              <img src={v.proofUrl} alt="Your photo" />
                              </>
                            ) : null}
                            <span className="media-tag">
                              {v.proofTag}
                            </span>
                          </div>
                          {" "}
                          {v.proofLong ? (
                            <>
                            <div className="pill" style={{ marginTop: "8px", background: "#ffd23d", color: "#1a0b14" }}>
                              Over 15s · only the first 15 seconds are shared
                            </div>
                            </>
                          ) : null}
                          {" "}
                          <button className="btn btn-sm tap" onClick={v.retake} style={{ position: "absolute", right: "10px", bottom: "10px" }}>
                            Retake
                          </button>
                          {" "}
                        </div>
                        {" "}
                        </>
                      ) : null}
                      {" "}
                      <button className="btn btn-cta btn-lg btn-block tap" onClick={v.sendProof} disabled={!!(v.cantSend)}>
                        {v.sendLabel}
                      </button>
                      {" "}
                      {v.proofDare ? (
                        <>
                        <button className="btn btn-ghost btn-sm" onClick={v.chickenOut} style={{ border: "0", color: "var(--muted)" }}>
                          Chicken out instead · −1 point
                        </button>
                        </>
                      ) : null}
                      {" "}
                    </div>
                    {" "}
                    </>
                  ) : null}
                  {" "}
                  {v.hasProof ? (
                    <>
                    {" "}
                    <div style={{ marginTop: "12px" }}>
                      {" "}
                      <div className="gr-k" style={{ marginBottom: "6px" }}>
                        {v.proofTitle}
                      </div>
                      {" "}
                      {v.hasAnswer ? (
                        <>
                        <div className="card" style={{ padding: "12px 14px", marginBottom: "8px", fontSize: "16px", fontWeight: "700", lineHeight: "1.4" }}>
                          {v.answerShown}
                        </div>
                        </>
                      ) : null}
                      {" "}
                      {v.hasMedia ? (
                        <>
                        {" "}
                        <div className={`media ${v.proofCls}`} style={{ height: "200px" }}>
                          {" "}
                          {v.proofIsVideo ? (
                            <>
                            <video src={v.proofUrl} controls playsInline muted onLoadedMetadata={v.onMeta} style={{ display: "block", width: "100%", height: "100%", objectFit: "cover" }} />
                            </>
                          ) : null}
                          {v.proofIsPhoto ? (
                            <>
                            <img src={v.proofUrl} alt="Dare proof" />
                            </>
                          ) : null}
                          {" "}
                          <span className="media-tag">
                            {v.proofTag}
                          </span>
                          {" "}
                          {v.proofHidden ? (
                            <>
                            <button className="media-cover" onClick={v.showProof}>
                              Tap to view
                              <span style={{ fontSize: "12px", fontWeight: "600", opacity: ".85" }}>
                                Blurred until you choose to look
                              </span>
                            </button>
                            </>
                          ) : null}
                          {" "}
                        </div>
                        {" "}
                        </>
                      ) : null}
                      {" "}
                    </div>
                    {" "}
                    </>
                  ) : null}
                  {" "}
                  {v.noProofNote ? (
                    <>
                    <div className="pill" style={{ marginTop: "10px" }}>
                      No proof sent
                    </div>
                    </>
                  ) : null}
                  {" "}
                  {v.hasOpts ? (
                    <>
                    {" "}
                    <div className={`gr-opts ${v.optCls}`}>
                      {" "}
                      {(v.opts || []).map((o, i0) => (
                        <Fragment key={i0}>
                        {" "}
                        <button className="gr-opt" onClick={o.pick} aria-pressed={o.on} disabled={!!(o.off)} style={{ background: o.bg, color: o.ink, borderColor: o.line, opacity: o.op }}>
                          {" "}
                          {o.hasImg ? (
                            <>
                            <img src={o.img} alt="" />
                            </>
                          ) : null}
                          {" "}
                          <span>
                            {o.label}
                          </span>
                          {" "}
                          {o.hasSub ? (
                            <>
                            <small>
                              {o.sub}
                            </small>
                            </>
                          ) : null}
                          {" "}
                        </button>
                        {" "}
                        </Fragment>
                      ))}
                      {" "}
                    </div>
                    {" "}
                    </>
                  ) : null}
                  {" "}
                  {v.hasGuess ? (
                    <>
                    {" "}
                    <div className="rise" style={{ marginTop: "12px", padding: "12px", borderRadius: "18px", background: "var(--card2)" }}>
                      {" "}
                      <div style={{ display: "flex", alignItems: "center", gap: "8px", fontWeight: "800", fontSize: "14px" }}>
                        <img src="/sk/coin_3d.png" alt="" style={{ width: "24px", height: "24px" }} />
                        {"Bonus: which wins? "}
                        <span className="muted" style={{ fontWeight: "700" }}>
                          +2
                        </span>
                      </div>
                      {" "}
                      <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", marginTop: "8px" }}>
                        {(v.guess || []).map((gs, i0) => (
                          <Fragment key={i0}>
                          <button className={`chip tap ${gs.cls}`} onClick={gs.pick} aria-pressed={gs.on} style={{ minHeight: "38px" }}>
                            {gs.label}
                          </button>
                          </Fragment>
                        ))}
                      </div>
                      {" "}
                    </div>
                    {" "}
                    </>
                  ) : null}
                  {" "}
                  {v.hasWait ? (
                    <>
                    {" "}
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "10px", marginTop: "14px" }}>
                      {" "}
                      <div className="gr-dots" aria-hidden="true">
                        {(v.dots || []).map((d, i0) => (
                          <Fragment key={i0}>
                          <span style={{ background: d.color, opacity: d.op }}>
                            {d.mark}
                          </span>
                          </Fragment>
                        ))}
                      </div>
                      {" "}
                      <span className="muted" style={{ fontSize: "13px", fontWeight: "700" }}>
                        {v.waitText}
                      </span>
                      {" "}
                    </div>
                    {" "}
                    </>
                  ) : null}
                  {" "}
                </div>
                {" "}
                </>
              ) : null}
              {" "}
              {v.phReveal ? (
                <>
                {" "}
                <div>
                  {" "}
                  <div className="gr-k">
                    {v.revKicker}
                  </div>
                  {" "}
                  <div className="gr-q pop">
                    {v.revTitle}
                  </div>
                  {" "}
                  {v.hasTug ? (
                    <>
                    <div className="gr-tug">
                      <span style={{ width: v.tugA, background: "#ff5fa2" }}>
                        {"A · "}{v.tugA}
                      </span>
                      <span style={{ width: v.tugB, background: "#22e1ff" }}>
                        {"B · "}{v.tugB}
                      </span>
                    </div>
                    </>
                  ) : null}
                  {" "}
                  {v.hasMedia ? (
                    <>
                    {" "}
                    <div className={`media ${v.proofCls}`} style={{ height: "120px", marginTop: "10px" }}>
                      {v.proofIsVideo ? (
                        <>
                        <video src={v.proofUrl} controls playsInline muted onLoadedMetadata={v.onMeta} style={{ display: "block", width: "100%", height: "100%", objectFit: "cover" }} />
                        </>
                      ) : null}
                      {v.proofIsPhoto ? (
                        <>
                        <img src={v.proofUrl} alt="Dare proof" />
                        </>
                      ) : null}
                      <span className="media-tag">
                        {v.proofTag}
                      </span>
                      {v.proofHidden ? (
                        <>
                        <button className="media-cover" onClick={v.showProof} style={{ fontSize: "13px" }}>
                          Tap to view proof
                        </button>
                        </>
                      ) : null}
                    </div>
                    {" "}
                    </>
                  ) : null}
                  {" "}
                  {v.hasBars ? (
                    <>
                    {" "}
                    <div className="gr-bars">
                      {(v.bars || []).map((br, i0) => (
                        <Fragment key={i0}>
                        <div className="gr-bar" style={{ outline: br.ring }}>
                          <i style={{ width: br.pct, background: br.color }} />
                          <span>
                            {br.label}
                          </span>
                          <b>
                            {br.count}
                          </b>
                        </div>
                        </Fragment>
                      ))}
                    </div>
                    {" "}
                    </>
                  ) : null}
                  {" "}
                  <div className="gr-res pop" style={{ background: v.resBg, animationDelay: ".5s" }}>
                    {" "}
                    <img src={v.resIcon} alt="" style={{ width: "36px", height: "36px", flex: "none" }} />
                    {" "}
                    <span style={{ flex: "1", fontSize: "14.5px", lineHeight: "1.35" }}>
                      <b>
                        {v.resTitle}
                      </b>
                      <br />
                      {v.resSub}
                    </span>
                    {" "}
                    <b className="d" style={{ fontSize: "22px" }}>
                      {v.resPts}
                    </b>
                    {" "}
                  </div>
                  {" "}
                  <div className="gr-next">
                    <span className="av" style={{ background: v.nextColor }}>
                      {v.nextInitial}
                    </span>
                    <span style={{ flex: "1" }}>
                      {v.nextText}
                    </span>
                  </div>
                  {" "}
                </div>
                {" "}
                </>
              ) : null}
              {" "}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "8px", marginTop: "14px", paddingTop: "12px", borderTop: "1px solid var(--line)" }}>
                {" "}
                <div className="gr-react" aria-label="Reactions">
                  {(v.reacts || []).map((rc, i0) => (
                    <Fragment key={i0}>
                    <button className="tap" onClick={rc.send} aria-label={rc.name}>
                      <img src={rc.src} alt="" />
                    </button>
                    </Fragment>
                  ))}
                </div>
                {" "}
                <div style={{ textAlign: "right" }}>
                  <div className="gr-k" style={{ fontSize: "10.5px" }}>
                    You · #{v.myRank}
                  </div>
                  <b className="d" style={{ fontSize: "19px" }}>
                    {v.myScore}
                  </b>
                  {" "}
                  <span className="pill" style={{ padding: "3px 8px", fontSize: "11px", background: v.comboBg }}>
                    {v.comboLabel}
                  </span>
                </div>
                {" "}
              </div>
              {" "}
            </section>
            {" "}
          </div>
          {" "}
        </div>
        {" "}
        <div className="gr-dock">
          {" "}
          {v.isHost ? (
            <>
            {" "}
            <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", justifyContent: "center" }}>
              {" "}
              <span className="pill" style={{ alignSelf: "center", background: "#ffd23d", color: "#1a0b14" }}>
                <img src="/sk/crown_3d.png" alt="" style={{ width: "16px", height: "16px" }} />
                Host
              </span>
              {" "}
              <button className="btn btn-sm tap" onClick={v.togglePause}>
                {v.pauseLabel}
              </button>
              {" "}
              <button className="btn btn-sm tap" onClick={v.skip}>
                Skip
              </button>
              {" "}
              <button className="btn btn-sm tap" onClick={v.openPlayers}>
                {"Players · "}{v.playerCount}
              </button>
              {" "}
              <button className="btn btn-sm btn-danger tap" onClick={v.openEnd}>
                End
              </button>
              {" "}
            </div>
            {" "}
            </>
          ) : null}
          {" "}
          {v.notHost ? (
            <>
            {" "}
            <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", justifyContent: "center" }}>
              {" "}
              <span className="pill" style={{ alignSelf: "center" }}>
                {v.meLabel}
              </span>
              {" "}
              <button className="btn btn-sm tap" onClick={v.openReport}>
                Report a player
              </button>
              {" "}
              <button className="btn btn-sm tap" onClick={v.openLeave}>
                Leave
              </button>
              {" "}
            </div>
            {" "}
            </>
          ) : null}
          {" "}
        </div>
        {" "}
        {v.sheetList ? (
          <>
          {" "}
          <div className="scrim">
            <div className="sheet" role="dialog" aria-label={v.sheetTitle}>
              {" "}
              <div className="row">
                <h2 style={{ flex: "1", fontSize: "21px" }}>
                  {v.sheetTitle}
                </h2>
                <button className="icon-btn tap" onClick={v.closeSheet} aria-label="Close">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" aria-hidden="true">
                    <path d="M6 6l12 12M18 6 6 18" />
                  </svg>
                </button>
              </div>
              {" "}
              <p className="muted" style={{ marginTop: "4px", fontSize: "13.5px" }}>
                {v.sheetSub}
              </p>
              {" "}
              <div style={{ marginTop: "8px" }}>
                {" "}
                {(v.roster || []).map((ro, i0) => (
                  <Fragment key={i0}>
                  {" "}
                  <div className="gr-rank">
                    {" "}
                    <b className="d" style={{ width: "22px", textAlign: "center" }}>
                      {ro.rank}
                    </b>
                    {" "}
                    <span className="av" style={{ background: ro.color, width: "38px", height: "38px", borderRadius: "50%", color: "#1a0b14", fontWeight: "800" }}>
                      {ro.initial}
                    </span>
                    {" "}
                    <span style={{ flex: "1" }}>
                      <b>
                        {ro.name}
                      </b>
                      <div className="muted" style={{ fontSize: "12.5px" }}>
                        {ro.sub}
                      </div>
                    </span>
                    {" "}
                    {ro.canAct ? (
                      <>
                      <button className={`btn btn-sm tap ${ro.btnCls}`} onClick={ro.act}>
                        {ro.actLabel}
                      </button>
                      </>
                    ) : null}
                    {" "}
                  </div>
                  {" "}
                  </Fragment>
                ))}
                {" "}
              </div>
              {" "}
            </div>
          </div>
          {" "}
          </>
        ) : null}
        {" "}
        {v.sheetEnd ? (
          <>
          {" "}
          <div className="scrim">
            <div className="sheet" role="dialog" aria-label="End game">
              {" "}
              <h2 style={{ fontSize: "22px" }}>
                End the game for everyone?
              </h2>
              {" "}
              <p className="muted" style={{ marginTop: "6px", fontSize: "14px" }}>
                {v.endSub}
              </p>
              {" "}
              <div className="row" style={{ gap: "8px", marginTop: "16px" }}>
                <button className="btn btn-lg tap" onClick={v.closeSheet} style={{ flex: "1" }}>
                  Keep playing
                </button>
                <button className="btn btn-lg btn-ink tap" onClick={v.endNow} style={{ flex: "1" }}>
                  End game
                </button>
              </div>
              {" "}
            </div>
          </div>
          {" "}
          </>
        ) : null}
        {" "}
        {v.sheetLeave ? (
          <>
          {" "}
          <div className="scrim">
            <div className="sheet" role="dialog" aria-label={v.leaveTitle}>
              {" "}
              <h2 style={{ fontSize: "22px" }}>
                {v.leaveTitle}
              </h2>
              {" "}
              <p className="muted" style={{ marginTop: "6px", fontSize: "14px", lineHeight: "1.5" }}>
                {v.leaveSub}
              </p>
              {" "}
              <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginTop: "16px" }}>
                {" "}
                {v.isHost ? (
                  <>
                  <button className="btn btn-lg btn-block tap" onClick={v.handOver}>
                    {"Make "}{v.handTo}{" the host"}
                  </button>
                  </>
                ) : null}
                {" "}
                {v.isHost ? (
                  <>
                  <button className="btn btn-lg btn-block btn-danger tap" onClick={v.endNow}>
                    End the game for everyone
                  </button>
                  </>
                ) : null}
                {" "}
                {v.notHost ? (
                  <>
                  <SkLink href="/games" className="btn btn-lg btn-block btn-danger tap">
                    Leave the game
                  </SkLink>
                  </>
                ) : null}
                {" "}
                <button className="btn btn-ink btn-lg btn-block tap" onClick={v.closeSheet}>
                  Stay
                </button>
                {" "}
              </div>
              {" "}
            </div>
          </div>
          {" "}
          </>
        ) : null}
        {" "}
        {v.phOver ? (
          <>
          {" "}
          <div className="gr-over">
            {" "}
            <div className="gr-wrap" style={{ maxWidth: "760px", paddingBottom: "40px" }}>
              {" "}
              <section className="g3" aria-label="Podium" style={{ height: "330px" }} onPointerDown={v.orbStart} onPointerMove={v.orbMove} onPointerUp={v.orbEnd} onPointerLeave={v.orbEnd}>
                {" "}
                <div className="g3-sky" style={{ background: v.sc.sky }} />
                {" "}
                <div className="g3-glow" style={{ background: "#ffd23d" }} />
                {" "}
                <div className="g3-hud">
                  <span className="g3-chip">
                    {v.g.name}{" · final"}
                  </span>
                  <span className="g3-chip">
                    {v.totalTurns}{" turns played"}
                  </span>
                </div>
                {" "}
                <div className="g3-cam" style={{ top: "66%" }}>
                  {" "}
                  <div className="g3-floor" style={{ backgroundImage: v.sc.floor }} />
                  {" "}
                  <div className="g3-table" style={{ background: v.sc.table }} />
                  {" "}
                  <div className="g3-at" style={{ transform: "translate3d(0, 20px, 0)" }}>
                    <div className="g3-bb">
                      {" "}
                      <div style={{ display: "flex", alignItems: "flex-end", gap: "6px" }}>
                        {" "}
                        {(v.podium || []).map((pd, i0) => (
                          <Fragment key={i0}>
                          {" "}
                          <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                            {" "}
                            {pd.first ? (
                              <>
                              <img className="g3-crown" src="/sk/crown_3d.png" alt="" style={{ animationDelay: ".9s" }} />
                              </>
                            ) : null}
                            {" "}
                            <div className="g3-fig g3-hop" style={{ animationDelay: pd.delay }}>
                              <span className="g3-name">
                                {pd.name}
                              </span>
                              <div className="g3-head" style={{ background: pd.color }}>
                                {pd.initial}
                              </div>
                              <div className="g3-body" style={{ background: pd.color }} />
                            </div>
                            {" "}
                            <div className="g3-pod" style={{ height: pd.h, background: pd.block, animationDelay: pd.delay }}>
                              {pd.place}
                            </div>
                            {" "}
                          </div>
                          {" "}
                          </Fragment>
                        ))}
                        {" "}
                      </div>
                      {" "}
                    </div>
                  </div>
                  {" "}
                </div>
                {" "}
                <div className="g3-fx" aria-hidden="true">
                  {(v.confetti || []).map((cf, i0) => (
                    <Fragment key={i0}>
                    <span className={`cf cf${cf.k}`} style={{ top: "20%", background: cf.color, animationDelay: cf.delay, marginLeft: cf.shift }} />
                    </Fragment>
                  ))}
                </div>
                {" "}
              </section>
              {" "}
              <div style={{ textAlign: "center", marginTop: "18px" }}>
                {" "}
                <div className="gr-k">
                  You placed
                </div>
                {" "}
                <h1 className="d pop" style={{ fontSize: "44px", lineHeight: "1", marginTop: "6px" }}>
                  {v.placeTitle}
                </h1>
                {" "}
                <p className="muted" style={{ marginTop: "8px", fontSize: "15px" }}>
                  {v.placeSub}
                </p>
                {" "}
              </div>
              {" "}
              <div className="card" style={{ marginTop: "14px", padding: "4px 16px" }}>
                {" "}
                {(v.finalRanks || []).map((fr, i0) => (
                  <Fragment key={i0}>
                  {" "}
                  <div className="gr-rank">
                    <b className="d" style={{ width: "22px", textAlign: "center" }}>
                      {fr.rank}
                    </b>
                    <span className="av" style={{ background: fr.color, width: "34px", height: "34px", borderRadius: "50%", color: "#1a0b14", fontWeight: "800", fontSize: "14px" }}>
                      {fr.initial}
                    </span>
                    <span style={{ flex: "1", fontWeight: fr.w }}>
                      {fr.name}
                    </span>
                    <span className="muted" style={{ fontWeight: "800" }}>
                      {fr.score}
                    </span>
                  </div>
                  {" "}
                  </Fragment>
                ))}
                {" "}
              </div>
              {" "}
              {v.isMember ? (
                <>
                {" "}
                <div className="card" style={{ marginTop: "12px", padding: "16px" }}>
                  {" "}
                  <div className="row" style={{ gap: "10px" }}>
                    <img src="/sk/gem_stone_3d.png" alt="" style={{ width: "34px", height: "34px" }} />
                    <b style={{ flex: "1" }}>
                      Level 7 · Night Owl
                    </b>
                    <span className="pill" style={{ background: "#ff3b8d", color: "#ffffff" }}>
                      +{v.xp}{" XP"}
                    </span>
                  </div>
                  {" "}
                  <div className="gr-xp" style={{ marginTop: "10px" }}>
                    <span style={{ width: "74%" }} />
                  </div>
                  {" "}
                  <div className="row" style={{ gap: "10px", marginTop: "12px", fontSize: "14px" }}>
                    <img src="/sk/fire.png" alt="" style={{ width: "28px", height: "28px" }} />
                    <span style={{ flex: "1" }}>
                      <b>
                        5-day game streak.
                      </b>
                      {" "}
                      <span className="muted">
                        Play tomorrow to keep it.
                      </span>
                    </span>
                  </div>
                  {" "}
                </div>
                {" "}
                </>
              ) : null}
              {" "}
              {v.isGuest ? (
                <>
                {" "}
                <div className="card" style={{ marginTop: "12px", padding: "16px", display: "flex", gap: "12px", alignItems: "center" }}>
                  {" "}
                  <img src="/sk/wrapped_gift_3d.png" alt="" style={{ width: "44px", height: "44px", flex: "none" }} />
                  {" "}
                  <span style={{ flex: "1", fontSize: "14px", lineHeight: "1.4" }}>
                    <b>
                      {"Keep "}{v.nick}{" and your "}{v.myScore}.
                    </b>
                    {" "}
                    <span className="muted">
                      Free account, 20 seconds. Your nickname, XP and streak stay yours.
                    </span>
                  </span>
                  {" "}
                </div>
                {" "}
                </>
              ) : null}
              {" "}
              <div className="sec-h">
                <h2>
                  Awards
                </h2>
              </div>
              {" "}
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                {" "}
                {(v.awards || []).map((aw, i0) => (
                  <Fragment key={i0}>
                  <div className="gr-award" style={{ animationDelay: aw.delay }}>
                    <img src={aw.icon} alt="" />
                    <span style={{ flex: "1" }}>
                      <b>
                        {aw.title}
                      </b>
                      <div className="muted" style={{ fontSize: "13px" }}>
                        {aw.who}
                      </div>
                    </span>
                  </div>
                  </Fragment>
                ))}
                {" "}
              </div>
              {" "}
              {v.isMember ? (
                <>
                {" "}
                <div className="card" style={{ marginTop: "12px", padding: "14px" }}>
                  {" "}
                  <div className="row" style={{ gap: "12px" }}>
                    <img src="/sk/shushing_face.png" alt="" style={{ width: "40px", height: "40px", flex: "none" }} />
                    <span style={{ flex: "1", fontSize: "14px", lineHeight: "1.4" }}>
                      <b>
                        Save this table as a crew
                      </b>
                      {" "}
                      <span className="muted">
                        Same nicknames, one tap to play again, and a shared history of tonight.
                      </span>
                    </span>
                  </div>
                  {" "}
                  <SkLink href="/crews" onClick={v.saveCrew} className="btn btn-block tap" style={{ marginTop: "12px" }}>
                    Save as a crew
                  </SkLink>
                  {" "}
                </div>
                {" "}
                </>
              ) : null}
              {" "}
              <div className="card" style={{ marginTop: "12px", padding: "14px", display: "flex", gap: "12px", alignItems: "center", background: "linear-gradient(135deg,rgba(216,27,114,.18),rgba(122,60,255,.18))" }}>
                {" "}
                <img src="/sk/angry_face_with_horns_3d.png" alt="" style={{ width: "40px", height: "40px", flex: "none" }} />
                {" "}
                <span style={{ flex: "1", fontSize: "14px", lineHeight: "1.4" }}>
                  <b>
                    Unhinged deck unlocked.
                  </b>
                  {" "}
                  <span className="muted">
                    Your table finished a full game. The rematch starts spicier.
                  </span>
                </span>
                {" "}
              </div>
              {" "}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: "8px", marginTop: "16px" }}>
                {" "}
                {v.isHost ? (
                  <>
                  <button className="btn btn-cta btn-lg tap" onClick={v.rematch} style={{ width: "100%" }}>
                    Rematch
                  </button>
                  </>
                ) : null}
                {" "}
                {v.isHost ? (
                  <>
                  <SkLink href="/games/new" onClick={v.newGame} className="btn btn-lg tap" style={{ width: "100%" }}>
                    New game
                  </SkLink>
                  </>
                ) : null}
                {" "}
                {v.notHost ? (
                  <>
                  <button className="btn btn-cta btn-lg tap" onClick={v.rematch} style={{ width: "100%" }}>
                    Play again
                  </button>
                  </>
                ) : null}
                {" "}
                {v.notHost ? (
                  <>
                  <SkLink href="/games" className="btn btn-lg tap" style={{ width: "100%" }}>
                    Back to games
                  </SkLink>
                  </>
                ) : null}
                {" "}
                {v.isGuest ? (
                  <>
                  <SkLink href="/signup" className="btn btn-ink btn-lg tap" style={{ width: "100%" }}>
                    Save my stats
                  </SkLink>
                  </>
                ) : null}
                {" "}
                <SkLink href="/share" className="btn btn-lg tap" style={{ width: "100%" }}>
                  Share results
                </SkLink>
                {" "}
              </div>
              {" "}
              <div className="ad-wrap">
                <div className="ad ad-banner">
                  <b>
                    Game over banner
                  </b>
                  <span className="ad-m">
                    320 × 100
                  </span>
                  <span className="ad-d">
                    728 × 90
                  </span>
                </div>
              </div>
              {" "}
            </div>
            {" "}
          </div>
          {" "}
          </>
        ) : null}
        {" "}
        {v.toast ? (
          <>
          {" "}
          <div className="toast" role="status">
            <img src={v.toastIcon} alt="" style={{ width: "32px", height: "32px", flex: "none" }} />
            <span style={{ fontSize: "14px", lineHeight: "1.35" }}>
              <b>
                {v.toastTitle}
              </b>
              <br />
              <span className="muted">
                {v.toastSub}
              </span>
            </span>
          </div>
          {" "}
          </>
        ) : null}
        {" "}
      </div>
      {" "}
      </>
    );
  }
}
