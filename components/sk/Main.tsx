// @ts-nocheck -- ported 1:1 from design/mockup/Main.dc.html by scripts/port-mockup.mjs; typed as it gets wired to real data
"use client";

import React, { Fragment } from "react";
import { saveMode, SkLink, route } from "@/lib/sk/runtime";


export default class Main extends React.Component<Record<string, any>, any> {
  static defaultProps = {"theme":"sunset","topic":"describe","visitor":"first","linkState":"live","senderWarnings":"0","embed":"no","ads":"on"};

  constructor(props) {
    super(props);
    this.state = this.blank();
  }
  componentDidUpdate(prev) {
    var p = this.props;
    if (p.send ? prev.linkId !== p.linkId : prev.topic !== p.topic || prev.theme !== p.theme || prev.visitor !== p.visitor || prev.linkState !== p.linkState || prev.senderWarnings !== p.senderWarnings) this.setState(this.blank());
  }
  componentWillUnmount() { clearTimeout(this.qt); }
  blank() {
    return { words: [], deckSeed: 0, ownWord: '', rate: null, rateCat: 'Overall', qi: 0, picks: [], qLocked: false,
      text: '', media: null, sent: false, popup: false, popStep: 'ask', popUser: '', popPass: '', popAgree: false, popShow: false, popLogin: false, wantReply: false, report: false, reported: false, picked: null, other: false, otherText: '', seed: 1, sHint: 0, sHintBox: false, sHintCustom: '', rcCopied: false };
  }
  cats() {
    return ['Abusive', 'Harassment', 'Bullying', 'Insults', 'Threats', 'Intimidation', 'Hate speech', 'Racism', 'Tribalism', 'Religious hate', 'Sexism', 'Body shaming', 'Disability mockery', 'Sexual content', 'Unwanted nudity', 'Explicit photo', 'Explicit video', 'Non-consensual image', 'Unwanted advances', 'Creepy or inappropriate', 'Grooming concern', 'Underage concern', 'Stalking', 'Doxxing / private info', 'Exposing secrets', 'Blackmail', 'Extortion', 'Impersonation', 'Scam', 'Fraud', 'Phishing link', 'Malware link', 'Spam', 'Flooding', 'Advertising', 'Selling things', 'Gambling promo', 'Drugs', 'Weapons', 'Violence', 'Graphic gore', 'Self-harm', 'Suicide talk', 'Misinformation', 'False rumour', 'Defamation', 'Trolling', 'Mocking', 'Profanity', 'Other harmful'];
  }
  pickRandom(seed) {
    var all = this.cats().slice(), out = [], n = 5 + (seed * 7) % 6, x = seed * 9301 + 49297;
    while (out.length < n && all.length) { x = (x * 9301 + 49297) % 233280; out.push(all.splice(Math.floor(x / 233280 * all.length), 1)[0]); }
    return out;
  }
  // the owner's quiz: [question, options, index of the right answer]
  // picks a photo or video and uploads it right away; the message carries its address
  pickMedia(accept) {
    var self = this, inp = document.createElement('input');
    inp.type = 'file'; inp.accept = accept;
    inp.onchange = function () {
      var f = inp.files && inp.files[0]; if (!f) return;
      var fd = new FormData(); fd.append('file', f); fd.append('linkId', self.props.linkId);
      var preview = ''; try { preview = URL.createObjectURL(f); } catch (x) {}
      self.setState({ uploading: true, media: f.type.indexOf('video') === 0 ? 'video' : 'photo', mediaUrl: null, mediaInfo: null, mediaPreview: preview, sendErr: null });
      import('@/lib/upload-client').then(function (m) { return m.uploadMedia(fd); }).then(function (r) {
        if (!r || !r.ok) { self.setState({ uploading: false, media: null, sendErr: (r && r.error) || 'Couldn’t attach that. Try again.' }); return; }
        self.setState({ uploading: false, media: r.kind, mediaUrl: r.url, mediaInfo: { name: f.name, size: r.size } });
      }).catch(function () { self.setState({ uploading: false, media: null, sendErr: 'Couldn’t attach that. Try again.' }); });
    };
    inp.click();
  }
  // asks the server whether a popup username is free (debounced) and remembers each answer
  lookUp(v) {
    var self = this;
    clearTimeout(this.lt);
    if (!this.props.checkUsername || this.state.popLogin || !/^[a-z0-9_]{3,20}$/.test(v) || (this.state.taken || {})[v] !== undefined) return;
    this.lt = setTimeout(function () {
      self.props.checkUsername(v).then(function (r) { var t = Object.assign({}, self.state.taken); t[v] = !r.available; self.setState({ taken: t }); });
    }, 300);
  }
  quiz() {
    if (this.props.quiz && this.props.quiz.length) return this.props.quiz;
    return [
      ['What’s my go-to food?', ['Jollof rice', 'Suya', 'Amala', 'Indomie'], 1],
      ['Where am I on a Friday night?', ['At an owambe', 'In bed by 10', 'At the club', 'Church vigil'], 1],
      ['What’s my love language?', ['Words', 'Gifts', 'Quality time', 'Acts of service'], 2],
      ['Who’s my celebrity crush?', ['Tems', 'Burna Boy', 'Ayra Starr', 'Rema'], 3],
      ['What annoys me the most?', ['Late replies', 'Loud chewing', 'Liars', 'Bad Wi-Fi'], 0]
    ];
  }
  renderVals() {
    var OWNER = this.props.owner || 'peach';
    var E = {
      shush: '/sk/shushing_face.png', peach: '/sk/peach.png', moon: '/sk/crescent_moon.png',
      unicorn: '/sk/unicorn.png', fire: '/sk/fire.png', octopus: '/sk/octopus.png',
      ghost: '/sk/ghost.png', lock: '/sk/hourglass_not_done.png', eyes: '/sk/eyes.png',
      sparkles: '/sk/sparkles.png', frog: '/sk/frog.png', thinking: '/sk/thinking_face_3d.png',
      star: '/sk/star-struck_3d.png', party: '/sk/party_popper.png', letter: '/sk/love_letter.png', trophy: '/sk/trophy_3d.png', crown: '/sk/crown_3d.png'
    };
    var T = {
      'default': { bg: 'radial-gradient(120% 70% at 85% 0%,#5a1240 0%,#1b0b26 50%,#0c0811 100%)', card: 'rgba(255,255,255,.07)', cardLine: 'rgba(255,255,255,.14)', field: 'rgba(0,0,0,.25)', ink: '#ffffff', muted: 'rgba(255,255,255,.74)', accent: '#ff5fa2', chipBg: 'rgba(255,255,255,.08)', chipOn: '#ff5fa2', chipOnInk: '#1a0712', btnBg: 'linear-gradient(135deg,#d81b72,#7a3cff)', btnInk: '#ffffff', emoji: E.shush },
      sunset: { bg: 'linear-gradient(165deg,#ff9a4a 0%,#ff4f6d 42%,#6d2187 100%)', card: 'rgba(52,8,34,.42)', cardLine: 'rgba(255,255,255,.24)', field: 'rgba(40,5,25,.35)', ink: '#ffffff', muted: 'rgba(255,255,255,.86)', accent: '#ffe27a', chipBg: 'rgba(52,8,34,.34)', chipOn: '#ffe27a', chipOnInk: '#3a0b1d', btnBg: '#ffffff', btnInk: '#4a0d2a', emoji: E.peach },
      midnight: { bg: 'linear-gradient(170deg,#22337d 0%,#0c1236 55%,#05060f 100%)', card: 'rgba(255,255,255,.06)', cardLine: 'rgba(157,184,255,.26)', field: 'rgba(0,0,0,.28)', ink: '#eef1ff', muted: 'rgba(232,236,255,.76)', accent: '#9db8ff', chipBg: 'rgba(255,255,255,.07)', chipOn: '#9db8ff', chipOnInk: '#0b1030', btnBg: '#9db8ff', btnInk: '#0b1030', emoji: E.moon },
      bubblegum: { bg: 'linear-gradient(165deg,#ffe3f2 0%,#ffbadd 50%,#efaaff 100%)', card: 'rgba(255,255,255,.62)', cardLine: 'rgba(120,20,80,.16)', field: 'rgba(255,255,255,.7)', ink: '#3b0b2c', muted: 'rgba(59,11,44,.78)', accent: '#c2185b', chipBg: 'rgba(255,255,255,.6)', chipOn: '#3b0b2c', chipOnInk: '#ffe3f2', btnBg: '#3b0b2c', btnInk: '#ffffff', emoji: E.unicorn },
      neon: { bg: 'radial-gradient(120% 80% at 80% 0%,#284d00 0%,#0b0d06 55%,#050505 100%)', card: 'rgba(199,255,56,.06)', cardLine: 'rgba(199,255,56,.36)', field: 'rgba(0,0,0,.4)', ink: '#f4ffe0', muted: 'rgba(244,255,224,.74)', accent: '#c7ff38', chipBg: 'rgba(199,255,56,.07)', chipOn: '#c7ff38', chipOnInk: '#0b0d06', btnBg: '#c7ff38', btnInk: '#0b0d06', emoji: E.fire },
      ocean: { bg: 'linear-gradient(165deg,#12b5cf 0%,#0b63ad 48%,#0a2457 100%)', card: 'rgba(3,26,58,.4)', cardLine: 'rgba(127,243,255,.32)', field: 'rgba(3,20,45,.36)', ink: '#ffffff', muted: 'rgba(255,255,255,.84)', accent: '#7ff3ff', chipBg: 'rgba(3,26,58,.32)', chipOn: '#7ff3ff', chipOnInk: '#062040', btnBg: '#7ff3ff', btnInk: '#062040', emoji: E.octopus }
    };
    var th = T[this.props.theme] || T.sunset;
    var TP = {
      describe: { title: 'Describe me in 3 words', sub: 'Tap three words that sum me up. That’s it.', who: 'wants 3 words from you', emoji: E.sparkles, max: 60 },
      quiz: { title: 'How well do you know me?', sub: 'Questions about me. Get your score, see the leaderboard.', who: 'made a quiz about themselves', emoji: E.crown, max: 140 },
      confess: { title: 'Confess something', sub: 'Say the whole thing. Nobody will know it was you.', who: 'is listening', emoji: E.shush, max: 2000 },
      rate: { title: 'Rate me 1–10', sub: 'You’re rating @' + OWNER + '. Pick a number, add why if you’re brave.', who: 'wants your honest rating', emoji: E.fire, max: 140 },
      ama: { title: 'Ask me anything', sub: 'Any question. They answer, you stay unknown.', who: 'is taking questions', emoji: E.ghost, max: 300 },
      custom: { title: this.props.customQuestion || 'Tell me something you’ve never said', sub: 'No rules. Just write.', who: 'wants to hear from you', emoji: E.letter, max: 1000 }
    };
    var topic = TP[this.props.topic] ? this.props.topic : (this.props.topic === 'opinion' ? 'quiz' : 'describe');
    var tp = TP[topic];
    var self = this, s = this.state, embed = this.props.embed === 'yes';
    var len = s.text.length, trimmed = s.text.trim().length;
    var on = function (v) { return { bg: v ? th.chipOn : th.chipBg, ink: v ? th.chipOnInk : th.ink, line: v ? th.chipOn : th.cardLine }; };

    // describe: three words, 60 characters in total
    var WORDS = ['Funny', 'Loyal', 'Chaotic', 'Smart', 'Calm', 'Bold', 'Sweet', 'Moody', 'Kind', 'Petty', 'Iconic', 'Shy', 'Real', 'Extra', 'Cute', 'Lazy', 'Brave', 'Weird', 'Soft', 'Savage', 'Genius', 'Dramatic', 'Gentle', 'Wild'];
    var deck = []; for (var i = 0; i < 12; i++) deck.push(WORDS[(s.deckSeed * 12 + i) % WORDS.length]);
    var full = s.words.length >= 3, chars = s.words.join(' ').length;
    var fits = function (w) { return (chars + (s.words.length ? 1 : 0) + w.length) <= 60; };
    var addWord = function (w) { if (full || s.words.indexOf(w) >= 0 || !fits(w)) return; self.setState({ words: s.words.concat([w]) }); };
    var slots = [0, 1, 2].map(function (k) {
      var w = s.words[k];
      return { n: k + 1, word: w || '?', filled: !!w, anim: w ? 'pop' : '', style: w ? 'solid' : 'dashed', line: w ? th.chipOn : th.cardLine, bg: w ? th.chipOn : 'transparent', ink: w ? th.chipOnInk : th.muted,
        remove: function () { self.setState({ words: s.words.filter(function (x) { return x !== w; }) }); } };
    });
    var own = s.ownWord.trim();

    // quiz
    var Q = this.quiz(), QN = Q.length, qi = Math.min(s.qi, QN - 1), score = 0;
    s.picks.forEach(function (p, k) { if (Q[k] && p === Q[k][2]) score++; });
    var quizDone = s.picks.length >= QN && !s.qLocked;
    var qPick = s.picks[qi];
    var answer = function (k) { return function () {
      if (s.qLocked || s.picks.length > qi) return;
      self.setState({ picks: s.picks.concat([k]), qLocked: true });
      clearTimeout(self.qt); self.qt = setTimeout(function () { self.setState({ qi: Math.min(QN - 1, self.state.qi + 1), qLocked: false }); }, 900);
    }; };
    var VERDICT = [['Do you even know @' + OWNER + '?', 'Time to hang out more.'], ['Basically strangers', 'You know their name, at least.'], ['Casual friend', 'You know the basics.'], ['Real friend', 'You pay attention.'], ['Close friend', 'One away from perfect.'], ['Bestie level', 'You know @' + OWNER + ' better than they know themselves.']][Math.round(score / QN * 5)];
    var board = (this.props.send ? this.props.board || [] : [['SuyaStar', QN], ['BlueFox', QN - 1], ['KolaNut', QN - 2], ['PixelOwl', 2]]).map(function (x) { return { name: x[0], score: x[1] }; });
    board.push({ name: 'You', score: score, me: true });
    board.sort(function (a, b) { return b.score - a.score; });

    // rate
    var rv = s.rate || 0;
    var rateEmoji = !rv ? E.thinking : rv <= 3 ? E.frog : rv <= 5 ? E.thinking : rv <= 7 ? E.eyes : rv <= 9 ? E.fire : E.star;
    var rateWord = !rv ? 'Tap a number' : ['', 'Ouch.', 'Not your day.', 'Room to grow.', 'Meh, honestly.', 'Right in the middle.', 'Solid.', 'Pretty great.', 'Seriously good.', 'Nearly perfect.', 'No notes. 10/10.'][rv];
    var hue = function (n) { return 'hsl(' + (220 - n * 19) + ',90%,66%)'; };

    var can = topic === 'describe' ? full : topic === 'quiz' ? quizDone : topic === 'confess' ? trimmed >= 2 : topic === 'rate' ? !!s.rate : topic === 'ama' ? trimmed >= 5 : (trimmed >= 1 || !!s.media);
    var need = topic === 'describe' ? (3 - s.words.length) + ' more word' + (3 - s.words.length === 1 ? '' : 's') + ' to go' : topic === 'quiz' ? 'Answer all ' + QN + ' first' : topic === 'confess' ? 'Write your confession' : topic === 'rate' ? 'Tap a number from 1 to 10' : topic === 'ama' ? 'Type your question' : 'Write something';
    var visitor = this.props.visitor || 'first';
    var member = visitor === 'member';
    var payload = topic === 'describe' ? s.words.join(' · ') : topic === 'rate' ? rv + '/10' + (trimmed ? ' · ' + s.text.trim() : '') : topic === 'quiz' ? 'I scored ' + score + '/' + QN + ' on your quiz' : s.text.trim();
    // what goes to the server for each topic (it re-checks everything, and scores the quiz itself)
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
    };

    var colors = [th.accent, '#ffffff', '#ff5fa2', '#7a3cff', '#22e1ff', '#ffd23d'];
    var confetti = [];
    for (var c = 0; c < 18; c++) confetti.push({ k: (c % 6) + 1, color: colors[c % colors.length], delay: (c * 0.035).toFixed(2) + 's', shift: ((c * 37) % 80 - 40) + 'px' });
    var st = this.props.linkState || 'live';
    var w = Number(this.props.senderWarnings || 0);
    var nap = {
      paused: { e: E.moon, t: 'This link is taking a nap', b: 'Make your own Sekretly link while you wait. Your friends have things to say too.', c: 'Make my own Sekretly link', a: 'paused link page' },
      reset: { e: E.ghost, t: 'This link no longer exists', b: 'The owner reset their links. Start your own and see what people really think.', c: 'Make my own Sekretly link', a: 'reset link page' },
      blocked: { e: E.lock, t: 'You can’t message @' + OWNER + ' anymore', b: '@' + OWNER + ' reported your messages 4 times, so you are blocked from sending to them. They can undo this if they choose. Your other conversations are not affected.', c: 'Start your own link instead', a: 'blocked sender page' }
    }[st] || {};
    var reasons = this.pickRandom(s.seed);
    var replies = member || s.wantReply;
    var userOk = /^[a-z0-9_]{3,20}$/.test(s.popUser), userTaken = !s.popLogin && !!(s.taken || {})[s.popUser];
    var passOk = s.popPass.length >= 8, joinOk = userOk && !userTaken && passOk && (s.popLogin || s.popAgree);
    var cards = Math.ceil(trimmed / 110);
    var SH = ['No hint', 'Same school', 'We met this year', 'We talked today', 'We’re close', 'Write my own'];
    var hintTxt = s.sHint === 5 ? s.sHintCustom.trim() : s.sHint > 0 ? SH[s.sHint].toLowerCase() : '';
    body.hint = hintTxt || undefined;
    body.mediaUrl = s.mediaUrl || undefined;
    return {
      // optional sender hint, same on every link type
      hintDisplay: this.props.send && this.props.allowHints === false ? 'none' : 'block',
      hintBox: s.sHintBox, hintBoxStr: s.sHintBox ? 'true' : 'false', hintChev: s.sHintBox ? '180deg' : '0deg',
      toggleHintBox: function () { self.setState({ sHintBox: !s.sHintBox }); },
      hintHead: hintTxt ? 'Your hint: ' + hintTxt : 'Leave a hint?',
      senderHints: SH.map(function (h, k) { var o = on(s.sHint === k); return { label: h, on: s.sHint === k ? 'true' : 'false', bg: o.bg, ink: o.ink, line: o.line, pick: function () { self.setState({ sHint: k }); } }; }),
      hintIsCustom: s.sHint === 5, hintCustom: s.sHintCustom,
      onHintCustom: function (e) { self.setState({ sHintCustom: e.target.value.replace(/@\S+/g, '').replace(/\d{4,}/g, '').slice(0, 40) }); },
      showReceipt: !member && !s.wantReply && !embed && !!s.receipt, receiptCode: s.receipt || '',
      copyReceipt: function () { try { navigator.clipboard.writeText(s.receipt || ''); } catch (e) {} self.setState({ rcCopied: true }); },
      copyReceiptLabel: s.rcCopied ? 'Copied' : 'Copy code',
      owner: OWNER, ownerAvatar: this.props.ownerAvatar || 'peach', onbHref: '/onboarding?from=link&to=' + encodeURIComponent(OWNER),
      th: th, tp: tp, ads: this.props.ads === 'off' ? 'off' : 'on',
      showChrome: !embed, pad: embed ? '16px 16px 18px' : '14px 20px 26px', minH: embed ? '0' : '100vh',
      isDescribe: topic === 'describe', isQuiz: topic === 'quiz', isConfess: topic === 'confess', isRate: topic === 'rate', isAma: topic === 'ama', isCustom: topic === 'custom',
      isMember: member && !embed, notMember: !member, isReturning: visitor === 'returning' && !embed,
      // describe
      slots: slots, wordCount: s.words.length, charCount: chars,
      deck: deck.map(function (d) { var used = s.words.indexOf(d) >= 0 || full || !fits(d); return { word: d, used: used, op: used ? 0.35 : 1, pick: function () { addWord(d); } }; }),
      shuffleDeck: function () { self.setState({ deckSeed: s.deckSeed + 1 }); },
      ownWord: s.ownWord, onOwnWord: function (e) { self.setState({ ownWord: e.target.value.replace(/\s/g, '').slice(0, 20) }); },
      cantAddOwn: !own || full || !fits(own), ownOpacity: !own || full || !fits(own) ? 0.45 : 1,
      addOwnWord: function () { if (!own || full || !fits(own)) return; var cap = own.charAt(0).toUpperCase() + own.slice(1); if (s.words.indexOf(cap) >= 0) return; self.setState({ words: s.words.concat([cap]), ownWord: '' }); },
      // quiz
      quizAsking: !quizDone, quizDone: quizDone, qNo: qi + 1, qLen: QN, qText: Q[qi][0], qScore: score,
      qDots: Q.map(function (q, k) { var p = s.picks[k]; return { c: p === undefined ? th.chipBg : (p === q[2] ? '#5be0a0' : '#ff8b98') }; }),
      qOpts: Q[qi][1].map(function (o, k) {
        var picked = qPick === k, right = k === Q[qi][2], reveal = qPick !== undefined;
        return { label: o, off: reveal, mark: reveal && right ? '✓' : (picked && !right ? '✗' : ''),
          bg: reveal && right ? '#5be0a0' : picked ? '#ff8b98' : th.chipBg, ink: reveal && (right || picked) ? '#1a0b14' : th.ink, line: reveal && right ? '#5be0a0' : picked ? '#ff8b98' : th.cardLine, pick: answer(k) };
      }),
      ringDash: (score / QN * 352).toFixed(1), verdict: VERDICT[0], verdictSub: VERDICT[1],
      board: board.map(function (b, k) { return { n: k + 1, name: b.name, score: b.score + '/' + QN, w: b.me ? 800 : 600 }; }),
      retake: function () { clearTimeout(self.qt); self.setState({ qi: 0, picks: [], qLocked: false }); },
      showQuizAd: topic === 'quiz' && quizDone && !embed,
      // confess
      cfHint: cards > 1 ? 'Long one: @' + OWNER + ' reads it as ' + cards + ' cards' : 'Write as much as you want',
      // rate
      rateCats: ['Overall', 'Vibe', 'Style', 'Friendship', 'Humour'].map(function (r) { var o = on(s.rateCat === r); return { label: r, on: s.rateCat === r ? 'true' : 'false', bg: o.bg, ink: o.ink, line: o.line, pick: function () { self.setState({ rateCat: r }); } }; }),
      tiles: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(function (n) { var a = s.rate === n; return { n: n, on: a ? 'true' : 'false', bg: a ? hue(n) : th.chipBg, ink: a ? '#120a16' : th.ink, line: a ? hue(n) : th.cardLine, pick: function () { self.setState({ rate: n }); } }; }),
      rateShown: rv ? rv : '–', rateEmoji: rateEmoji, rateWord: rateWord, rateColor: rv ? hue(rv) : th.muted,
      // shared
      text: s.text, count: len, maxLen: tp.max,
      showTools: (topic === 'confess' || topic === 'ama' || topic === 'custom') && !!this.props.send, showCount: topic !== 'confess',
      showSendArea: topic !== 'quiz' || quizDone,
      onText: function (e) { self.setState({ text: e.target.value.slice(0, tp.max) }); },
      hasMedia: !!s.media, mediaIsVideo: s.media === 'video', mediaIsPhoto: s.media !== 'video', mediaPreview: s.mediaPreview || s.mediaUrl || '', mediaName: s.uploading ? 'Uploading…' : s.mediaInfo ? s.mediaInfo.name : '', mediaMeta: s.mediaInfo ? (s.mediaInfo.size < 1048576 ? Math.max(1, Math.round(s.mediaInfo.size / 1024)) + ' KB' : (s.mediaInfo.size / 1048576).toFixed(1) + ' MB') + ' · blurred until @' + OWNER + ' taps' : '',
      attachPhoto: function () { self.pickMedia('image/*'); },
      attachVideo: function () { self.pickMedia('video/*'); },
      removeMedia: function () { self.setState({ media: null, mediaUrl: null, mediaInfo: null }); },
      hasWarnings: w > 0,
      warnTitle: w >= 3 ? 'Last warning with @' + OWNER + '' : 'You have ' + w + (w === 1 ? ' warning' : ' warnings') + ' with @' + OWNER + '',
      warnBody: w >= 3 ? 'One more report and you will be blocked from messaging them.' : (3 - w) + ' more and the next report blocks you from messaging them.',
      cantSend: !can || !!s.sending || !!s.uploading, sendOpacity: can && !s.sending && !s.uploading ? 1 : 0.55, hasSendErr: !!s.sendErr, sendErr: s.sendErr || '', needHint: !can, needText: need,
      sendLabel: topic === 'confess' ? 'Send confession' : topic === 'rate' ? (s.rate ? 'Send my ' + rv + '/10' : 'Send rating') : topic === 'quiz' ? 'Send my score to @' + OWNER + '' : topic === 'describe' ? 'Send my 3 words' : 'Send anonymously',
      replyStr: s.wantReply ? 'true' : 'false', toggleReply: function () { self.setState({ wantReply: !s.wantReply }); },
      send: function () {
        if (!can) return;
        if (embed) { doSend(false); return; }
        if (visitor === 'first') { self.setState({ popup: true, popStep: 'ask' }); return; }
        if (visitor === 'returning' && s.wantReply) { self.setState({ popup: true, popStep: 'join', popLogin: false }); return; }
        doSend(member);
      },
      popup: s.popup, popAsk: s.popStep === 'ask', popJoin: s.popStep === 'join',
      popMine: payload.length > 70 ? payload.slice(0, 68) + '…' : payload || 'your message',
      popYes: function () { self.setState({ popStep: 'join' }); }, popNo: function () { doSend(false); }, popBack: function () { self.setState({ popStep: 'ask' }); },
      // make an account (or log in) right inside the popup; the message sends either way
      popMade: s.popStep === 'made', isNewAcct: !s.popLogin,
      joinTitle: s.popLogin ? 'Log in to get replies' : 'Make your free account',
      joinSub: s.popLogin ? 'Replies from @' + OWNER + ' land in your inbox. They still never see who you are.' : 'Just a username and password. No name, no phone number, no email. @' + OWNER + ' never sees it.',
      popUser: s.popUser, onPopUser: function (e) { var v = e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, '').slice(0, 20); self.setState({ popUser: v, popErr: null }); self.lookUp(v); },
      popPass: s.popPass, onPopPass: function (e) { self.setState({ popPass: e.target.value }); },
      passType: s.popShow ? 'text' : 'password', passBtn: s.popShow ? 'Hide' : 'Show', togglePass: function () { self.setState({ popShow: !s.popShow }); },
      passAuto: s.popLogin ? 'current-password' : 'new-password',
      userHint: !s.popUser ? '3–20 letters, numbers or _' : s.popLogin ? (userOk ? '' : 'Usernames are 3–20 characters') : (userTaken ? '@' + s.popUser + ' is taken. Try ' + s.popUser + '_' + (s.popUser.length % 9 + 1) : userOk ? '@' + s.popUser + ' is free ✓' : 'At least 3 characters'),
      userHintC: userTaken ? '#c4213a' : (userOk && !s.popLogin ? '#0d7f4b' : '#8a8197'), userLine: userTaken ? '#c4213a' : (userOk && !s.popLogin ? '#0d7f4b' : 'rgba(48,34,72,.18)'),
      passHint: !s.popPass ? (s.popLogin ? '' : 'At least 8 characters') : passOk ? (s.popLogin ? '' : 'Strong enough ✓') : (8 - s.popPass.length) + ' more characters',
      passHintC: passOk && !s.popLogin ? '#0d7f4b' : '#8a8197',
      popAgree: s.popAgree, onPopAgree: function (e) { self.setState({ popAgree: !!e.target.checked }); },
      joinCta: s.joining ? (s.popLogin ? 'Logging in…' : 'Creating your account…') : s.popLogin ? 'Log in & send' : 'Create account & send',
      switchLabel: s.popLogin ? 'New here? Make an account instead' : 'Already have an account? Log in',
      switchAcct: function () { self.setState({ popLogin: !s.popLogin }); },
      popCant: !joinOk, popOpacity: joinOk ? 1 : 0.45,
      popDone: function () {
        if (!joinOk || s.joining) return;
        if (!self.props.joinAndSend) { self.setState({ popStep: 'made', wantReply: true }); return; }
        self.setState({ joining: true, popErr: null });
        self.props.joinAndSend({ username: s.popUser, password: s.popPass, login: !!s.popLogin, message: { linkId: self.props.linkId, payload: body } }).then(function (r) {
          if (r && r.ok) { self.setState({ joining: false, popStep: 'made', wantReply: true }); return; }
          var t = Object.assign({}, self.state.taken); if (r && r.taken) t[s.popUser] = true;
          self.setState({ joining: false, popErr: (r && r.error) || 'Something went wrong. Try again.', taken: t });
        });
      },
      hasPopErr: !!s.popErr, popErr: s.popErr || '',
      madeUser: s.popUser || 'you', madeInitial: (s.popUser || 'y').charAt(0).toUpperCase(), madeTag: s.popLogin ? 'logged in' : 'account created',
      madeBody: 'Your message is in their inbox. When they reply, it comes straight to you. You stay anonymous.',
      madeCta: 'Turn on notifications', madeNote: 'Takes 20 seconds, so you don’t miss their reply.',
      toOnboarding: function () { try { window.localStorage.setItem('sk-onb', JSON.stringify({ from: 'link', user: s.popUser || 'you', to: 'peach', login: !!s.popLogin })); window.localStorage.setItem('sk-nav', String(Date.now())); } catch (e) {} },
      showCompose: st === 'live' && !s.sent, showSent: st === 'live' && s.sent, showNap: st !== 'live',
      repliesOn: replies && !embed, repliesOff: !replies || embed,
      ownTitle: embed ? 'That’s your link page' : 'Want your own link?', ownSub: embed ? 'This is exactly what your friends see. Make yours in 30 seconds.' : 'See what your people really think. Takes 30 seconds.', ownCta: embed ? 'Make my link' : 'Get my own link',
      sentEmoji: topic === 'confess' ? E.letter : topic === 'quiz' ? E.trophy : E.party,
      sentTitle: topic === 'confess' ? 'Confession sent' : topic === 'quiz' ? 'Score sent!' : 'Sent!',
      sentBody: topic === 'quiz' ? '@' + OWNER + ' sees you scored ' + score + '/' + QN + ', never your name.' : replies ? '@' + OWNER + ' will see it soon. If they reply, you’ll hear back here.' : '@' + OWNER + ' will see it soon. They will never know it was you' + (hintTxt ? ', only your hint: ' + hintTxt + '.' : '.'),
      againLabel: topic === 'quiz' ? 'Take it again' : 'Send another',
      napEmoji: nap.e, napTitle: nap.t, napBody: nap.b, napCta: nap.c, napAdLabel: nap.a,
      confetti: s.sent ? confetti : [],
      again: function () { clearTimeout(self.qt); self.setState(self.blank()); },
      report: s.report, reported: s.reported, notReported: !s.reported,
      reasons: reasons.map(function (r) { var o = s.picked === r && !s.other; return { label: r, on: o ? 'true' : 'false', bg: o ? '#ffe3f2' : '#ffffff', line: o ? '#c2185b' : 'rgba(48,34,72,.16)', pick: function () { self.setState({ picked: r, other: false }); } }; }),
      otherOn: s.other, otherBg: s.other ? '#ffe3f2' : '#ffffff',
      pickOther: function () { self.setState({ other: true, picked: null }); },
      otherText: s.otherText, onOther: function (e) { self.setState({ otherText: e.target.value }); },
      shuffle: function () { self.setState({ seed: s.seed + 1, picked: null }); },
      cantReport: !(s.picked || (s.other && s.otherText.trim().length > 3)),
      reportOpacity: (s.picked || (s.other && s.otherText.trim().length > 3)) ? 1 : 0.45,
      submitReport: function () { self.setState({ reported: true }); },
      openReport: function () { self.setState({ report: true, reported: false, picked: null, other: false, otherText: '', seed: s.seed + 1 }); },
      closeReport: function () { self.setState({ report: false }); }
    };
  }

  render() {
    // like the mockup runtime: the template sees the props merged with renderVals()
    const v = { ...this.props, ...(this.renderVals() || {}) };
    return (
      <>
      {" "}
      <div className="sk" data-ads={v.ads} style={{ background: v.th.bg, color: v.th.ink, overflow: "hidden", minHeight: v.minH }}>
        {" "}
        <div style={{ maxWidth: "1120px", margin: "0 auto", padding: v.pad, display: "flex", flexDirection: "column", minHeight: v.minH }}>
          {" "}
          {v.showChrome ? (
            <>
            {" "}
            <header style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px", padding: "4px 0 18px" }}>
              {" "}
              <SkLink href="/" className="logo" aria-label="Sekretly home">
                <span className="logo-mark">
                  S
                </span>
                <span className="logo-word">
                  Sekretly
                </span>
              </SkLink>
              {" "}
              {v.isMember ? (
                <>
                {" "}
                <SkLink href="/inbox" className="tap" style={{ display: "inline-flex", alignItems: "center", gap: "8px", minHeight: "44px", padding: "0 14px 0 6px", borderRadius: "999px", background: v.th.card, border: `1px solid ${v.th.cardLine}`, color: "inherit", textDecoration: "none", fontWeight: "700", fontSize: "13.5px", backdropFilter: "blur(14px)" }}>
                  <img src="/sk/fox.png" alt="" style={{ width: "32px", height: "32px" }} />
                  My inbox
                </SkLink>
                {" "}
                </>
              ) : null}
              {" "}
              {v.notMember ? (
                <>
                {" "}
                <SkLink href="/signup" className="tap" style={{ display: "inline-flex", alignItems: "center", minHeight: "44px", padding: "0 16px", borderRadius: "999px", background: v.th.card, border: `1px solid ${v.th.cardLine}`, color: "inherit", textDecoration: "none", fontWeight: "700", fontSize: "14px", backdropFilter: "blur(14px)" }}>
                  Get your own link
                </SkLink>
                {" "}
                </>
              ) : null}
              {" "}
            </header>
            {" "}
            </>
          ) : null}
          {" "}
          {v.showCompose ? (
            <>
            {" "}
            <main style={{ flex: "1", display: "flex", flexWrap: "wrap", alignItems: "center", gap: "22px 56px" }}>
              {" "}
              <section className="rise" style={{ flex: "1 1 340px", minWidth: "0", position: "relative" }}>
                {" "}
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  {" "}
                  <span style={{ width: "52px", height: "52px", borderRadius: "50%", padding: "3px", background: `conic-gradient(from 200deg,${v.th.accent},#ffffff,${v.th.accent})`, display: "block", flex: "none" }}>
                    {" "}
                    <img src={`/sk/${v.ownerAvatar}.png`} alt="" style={{ width: "100%", height: "100%", borderRadius: "50%", background: v.th.card, display: "block", padding: "6px", boxSizing: "border-box" }} />
                    {" "}
                  </span>
                  {" "}
                  <div>
                    {" "}
                    <div style={{ fontWeight: "700", fontSize: "16px" }}>
                      @{v.owner}
                    </div>
                    {" "}
                    <div style={{ fontSize: "14px", color: v.th.muted }}>
                      {v.tp.who}
                    </div>
                    {" "}
                  </div>
                  {" "}
                </div>
                {" "}
                <h1 style={{ marginTop: "18px", fontWeight: "800", lineHeight: "1", letterSpacing: "-.03em", fontSize: "clamp(34px, 6.4cqi, 64px)" }}>
                  {v.tp.title}
                </h1>
                {" "}
                <p style={{ marginTop: "10px", fontSize: "15.5px", lineHeight: "1.5", color: v.th.muted, maxWidth: "34ch" }}>
                  {v.tp.sub}
                </p>
                {" "}
                <img className="lp-deco float" src={v.tp.emoji} alt="" style={{ position: "absolute", right: "4%", top: "-18px", width: "96px", height: "96px" }} />
                {" "}
              </section>
              {" "}
              <section className="rise" style={{ flex: "1 1 380px", minWidth: "0", animationDelay: ".08s" }}>
                {" "}
                {v.hasWarnings ? (
                  <>
                  {" "}
                  <div role="status" style={{ marginBottom: "12px", padding: "12px 14px", borderRadius: "18px", background: "rgba(20,4,10,.55)", color: "#ffffff", display: "flex", gap: "10px", alignItems: "flex-start", border: "1px solid rgba(255,139,152,.5)" }}>
                    {" "}
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#ff8b98" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={{ flex: "none", marginTop: "1px" }}>
                      <path d="M12 3 2 21h20L12 3z" />
                      <path d="M12 10v5M12 18h.01" />
                    </svg>
                    {" "}
                    <span style={{ fontSize: "13.5px", lineHeight: "1.45" }}>
                      <b>
                        {v.warnTitle}
                      </b>
                      <br />
                      {v.warnBody}
                    </span>
                    {" "}
                  </div>
                  {" "}
                  </>
                ) : null}
                {" "}
                <div style={{ background: v.th.card, border: `1px solid ${v.th.cardLine}`, borderRadius: "28px", padding: "18px", backdropFilter: "blur(18px)", boxShadow: "0 30px 80px rgba(0,0,0,.25)" }}>
                  {" "}
                  {/* describe me in 3 words: tap exactly three words (60 characters in total) */}
                  {" "}
                  {v.isDescribe ? (
                    <>
                    {" "}
                    <div>
                      {" "}
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", padding: "0 2px 10px" }}>
                        <span className="lp-k" style={{ color: v.th.muted }}>
                          Your 3 words
                        </span>
                        <span style={{ fontSize: "13px", fontWeight: "700", color: v.th.muted }}>
                          {v.wordCount}{" of 3 · "}{v.charCount}/60
                        </span>
                      </div>
                      {" "}
                      <div className="lp-slots">
                        {" "}
                        {(v.slots || []).map((sl, i0) => (
                          <Fragment key={i0}>
                          {" "}
                          <div className={`lp-slot ${sl.anim}`} style={{ borderColor: sl.line, borderStyle: sl.style, background: sl.bg, color: sl.ink }}>
                            <b>
                              {sl.n}
                            </b>
                            {sl.word}
                            {sl.filled ? (
                              <>
                              <button onClick={sl.remove} aria-label={`Remove ${sl.word}`} />
                              </>
                            ) : null}
                          </div>
                          {" "}
                          </Fragment>
                        ))}
                        {" "}
                      </div>
                      {" "}
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", margin: "16px 2px 8px" }}>
                        <span className="lp-k" style={{ color: v.th.muted }}>
                          Tap 3 words
                        </span>
                        {" "}
                        <button className="tap" onClick={v.shuffleDeck} style={{ display: "inline-flex", alignItems: "center", gap: "6px", minHeight: "36px", padding: "0 12px", borderRadius: "99px", border: `1px solid ${v.th.cardLine}`, background: "transparent", color: "inherit", fontWeight: "700", fontSize: "13px" }}>
                          More words
                        </button>
                      </div>
                      {" "}
                      <div className="lp-deck">
                        {" "}
                        {(v.deck || []).map((d, i0) => (
                          <Fragment key={i0}>
                          {" "}
                          <button className="lp-chip" onClick={d.pick} disabled={!!(d.used)} style={{ minHeight: "42px", padding: "0 15px", borderRadius: "999px", border: `1px solid ${v.th.cardLine}`, background: v.th.chipBg, color: v.th.ink, fontWeight: "700", fontSize: "15px", opacity: d.op }}>
                            {d.word}
                          </button>
                          {" "}
                          </Fragment>
                        ))}
                        {" "}
                      </div>
                      {" "}
                      <div style={{ display: "flex", gap: "8px", marginTop: "12px" }}>
                        {" "}
                        <label htmlFor="own-word" className="sr">
                          Your own word
                        </label>
                        {" "}
                        <input id="own-word" value={v.ownWord ?? ""} onChange={v.onOwnWord} maxLength="20" placeholder="Or add your own word" style={{ flex: "1", minWidth: "0", minHeight: "46px", borderRadius: "14px", border: `1px solid ${v.th.cardLine}`, background: v.th.field, color: v.th.ink, padding: "0 14px", fontSize: "16px" }} />
                        {" "}
                        <button className="tap" onClick={v.addOwnWord} disabled={!!(v.cantAddOwn)} style={{ minHeight: "46px", padding: "0 16px", borderRadius: "14px", border: "0", background: v.th.chipOn, color: v.th.chipOnInk, fontWeight: "800", opacity: v.ownOpacity }}>
                          Add
                        </button>
                        {" "}
                      </div>
                      {" "}
                    </div>
                    {" "}
                    </>
                  ) : null}
                  {" "}
                  {/* how well do you know me: the owner's quiz, one question at a time */}
                  {" "}
                  {v.isQuiz ? (
                    <>
                    {" "}
                    <div>
                      {" "}
                      {v.quizAsking ? (
                        <>
                        {" "}
                        <div>
                          {" "}
                          <div className="lp-dots" aria-hidden="true">
                            {(v.qDots || []).map((qd, i0) => (
                              <Fragment key={i0}>
                              <span style={{ background: qd.c }} />
                              </Fragment>
                            ))}
                          </div>
                          {" "}
                          <div style={{ display: "flex", justifyContent: "space-between", marginTop: "12px" }}>
                            <span className="lp-k" style={{ color: v.th.muted }}>
                              {"Question "}{v.qNo}{" of "}{v.qLen}
                            </span>
                            <span style={{ fontSize: "13px", fontWeight: "800", color: v.th.muted }}>
                              {v.qScore}{" right so far"}
                            </span>
                          </div>
                          {" "}
                          <div className="d rise" style={{ marginTop: "8px", fontSize: "24px", fontWeight: "800", lineHeight: "1.15", letterSpacing: "-.02em" }}>
                            {v.qText}
                          </div>
                          {" "}
                          <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginTop: "14px" }}>
                            {" "}
                            {(v.qOpts || []).map((qo, i0) => (
                              <Fragment key={i0}>
                              <button className="lp-qopt" onClick={qo.pick} disabled={!!(qo.off)} style={{ background: qo.bg, color: qo.ink, borderColor: qo.line }}>
                                {qo.label}
                                <i>
                                  {qo.mark}
                                </i>
                              </button>
                              </Fragment>
                            ))}
                            {" "}
                          </div>
                          {" "}
                        </div>
                        {" "}
                        </>
                      ) : null}
                      {" "}
                      {v.quizDone ? (
                        <>
                        {" "}
                        <div style={{ textAlign: "center" }}>
                          {" "}
                          <div className="lp-ring pop">
                            <svg width="132" height="132" viewBox="0 0 132 132" aria-hidden="true">
                              <circle cx="66" cy="66" r="56" fill="none" stroke={v.th.chipBg} strokeWidth="12" />
                              <circle cx="66" cy="66" r="56" fill="none" stroke={v.th.accent} strokeWidth="12" strokeLinecap="round" strokeDasharray={`${v.ringDash} 352`} transform="rotate(-90 66 66)" />
                            </svg>
                            <b>
                              {v.qScore}/{v.qLen}
                            </b>
                          </div>
                          {" "}
                          <div className="d" style={{ marginTop: "10px", fontSize: "26px", fontWeight: "800" }}>
                            {v.verdict}
                          </div>
                          {" "}
                          <p style={{ marginTop: "4px", fontSize: "14px", color: v.th.muted }}>
                            {v.verdictSub}
                          </p>
                          {" "}
                          <div style={{ marginTop: "14px", textAlign: "left", padding: "6px 14px", borderRadius: "18px", background: v.th.field }}>
                            {" "}
                            <div className="lp-k" style={{ color: v.th.muted, padding: "8px 0 4px" }}>
                              Leaderboard · this link
                            </div>
                            {" "}
                            {(v.board || []).map((lb, i0) => (
                              <Fragment key={i0}>
                              <div className="lp-lb" style={{ fontWeight: lb.w }}>
                                <b style={{ width: "20px" }}>
                                  {lb.n}
                                </b>
                                <span style={{ flex: "1" }}>
                                  {lb.name}
                                </span>
                                <span>
                                  {lb.score}
                                </span>
                              </div>
                              </Fragment>
                            ))}
                            {" "}
                          </div>
                          {" "}
                          <label htmlFor="quiz-note" className="sr">
                            A note for @{v.owner}
                          </label>
                          {" "}
                          <input id="quiz-note" value={v.text ?? ""} onChange={v.onText} maxLength="140" placeholder={`Leave @${v.owner} a note (optional)`} style={{ display: "block", width: "100%", marginTop: "12px", minHeight: "48px", borderRadius: "14px", border: `1px solid ${v.th.cardLine}`, background: v.th.field, color: v.th.ink, padding: "0 14px", fontSize: "16px" }} />
                          {" "}
                          <button className="tap" onClick={v.retake} style={{ marginTop: "10px", background: "none", border: "0", color: v.th.muted, fontWeight: "700", fontSize: "13px", textDecoration: "underline" }}>
                            Retake the quiz
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
                  {/* confess: just write */}
                  {" "}
                  {v.isConfess ? (
                    <>
                    {" "}
                    <div>
                      {" "}
                      <label htmlFor="msg-cf" className="sr">
                        Your confession
                      </label>
                      {" "}
                      <textarea id="msg-cf" className="lp-paper" value={v.text ?? ""} onChange={v.onText} maxLength="2000" placeholder="Start typing. It’s just you and the page…" style={{ border: `1px solid ${v.th.cardLine}`, backgroundColor: v.th.field, color: v.th.ink }} />
                      {" "}
                      <div style={{ display: "flex", justifyContent: "space-between", gap: "8px", marginTop: "8px", fontSize: "12.5px", fontWeight: "700", color: v.th.muted }}>
                        <span>
                          {v.cfHint}
                        </span>
                        <span>
                          {v.count}/2000
                        </span>
                      </div>
                      {" "}
                    </div>
                    {" "}
                    </>
                  ) : null}
                  {" "}
                  {/* rate me: the visitor rates @{{owner}} by tapping a number */}
                  {" "}
                  {v.isRate ? (
                    <>
                    {" "}
                    <div>
                      {" "}
                      <div style={{ display: "flex", alignItems: "center", gap: "10px", padding: "10px 12px", borderRadius: "16px", background: v.th.chipBg, fontSize: "13.5px", lineHeight: "1.35" }}>
                        <img src={`/sk/${v.ownerAvatar}.png`} alt="" style={{ width: "30px", height: "30px", flex: "none" }} />
                        <span>
                          <b>
                            You’re rating @{v.owner}.
                          </b>
                          {" They see the score, never your name."}
                        </span>
                      </div>
                      {" "}
                      <div className="lp-k" style={{ color: v.th.muted, padding: "14px 2px 8px" }}>
                        Rate their…
                      </div>
                      {" "}
                      <div className="lp-chips" style={{ display: "flex", gap: "7px", overflowX: "auto", margin: "0 -18px", padding: "2px 18px 8px" }}>
                        {" "}
                        {(v.rateCats || []).map((rc, i0) => (
                          <Fragment key={i0}>
                          {" "}
                          <button className="lp-chip" onClick={rc.pick} aria-pressed={rc.on} style={{ flex: "none", minHeight: "40px", padding: "0 15px", borderRadius: "999px", border: `1px solid ${rc.line}`, background: rc.bg, color: rc.ink, fontWeight: "800", fontSize: "14px" }}>
                            {rc.label}
                          </button>
                          {" "}
                          </Fragment>
                        ))}
                        {" "}
                      </div>
                      {" "}
                      <div className="lp-tiles" role="radiogroup" aria-label="Score from 1 to 10" style={{ marginTop: "6px" }}>
                        {" "}
                        {(v.tiles || []).map((tl, i0) => (
                          <Fragment key={i0}>
                          <button className="lp-tile" role="radio" aria-checked={tl.on} aria-pressed={tl.on} onClick={tl.pick} style={{ background: tl.bg, color: tl.ink, borderColor: tl.line }}>
                            {tl.n}
                          </button>
                          </Fragment>
                        ))}
                        {" "}
                      </div>
                      {" "}
                      <div style={{ display: "flex", alignItems: "center", gap: "14px", marginTop: "14px" }}>
                        {" "}
                        <span className="lp-big" style={{ color: v.rateColor }}>
                          {v.rateShown}
                        </span>
                        {" "}
                        <img src={v.rateEmoji} alt="" style={{ width: "60px", height: "60px" }} />
                        {" "}
                        <span style={{ flex: "1", fontWeight: "800", fontSize: "15px", lineHeight: "1.3" }}>
                          {v.rateWord}
                        </span>
                        {" "}
                      </div>
                      {" "}
                      <label htmlFor="rate-why" className="sr">
                        Why that number
                      </label>
                      {" "}
                      <input id="rate-why" value={v.text ?? ""} onChange={v.onText} maxLength="140" placeholder="Why that number? (optional)" style={{ display: "block", width: "100%", marginTop: "12px", minHeight: "48px", borderRadius: "14px", border: `1px solid ${v.th.cardLine}`, background: v.th.field, color: v.th.ink, padding: "0 14px", fontSize: "16px" }} />
                      {" "}
                    </div>
                    {" "}
                    </>
                  ) : null}
                  {" "}
                  {/* ask me anything: just the question */}
                  {" "}
                  {v.isAma ? (
                    <>
                    {" "}
                    <div>
                      {" "}
                      <label htmlFor="msg-ama" className="sr">
                        Your question
                      </label>
                      {" "}
                      <textarea id="msg-ama" value={v.text ?? ""} onChange={v.onText} maxLength="300" placeholder={`Ask @${v.owner} anything…`} style={{ display: "block", width: "100%", minHeight: "130px", resize: "none", borderRadius: "20px", border: `1px solid ${v.th.cardLine}`, background: v.th.field, color: v.th.ink, padding: "16px", fontSize: "18px", lineHeight: "1.45" }} />
                      {" "}
                      <div style={{ marginTop: "8px", fontSize: "12.5px", color: v.th.muted }}>
                        @{v.owner}{" can answer it publicly on their story. Your name never shows."}
                      </div>
                      {" "}
                    </div>
                    {" "}
                    </>
                  ) : null}
                  {" "}
                  {/* custom topic: just write */}
                  {" "}
                  {v.isCustom ? (
                    <>
                    {" "}
                    <div>
                      {" "}
                      <label htmlFor="msg-cu" className="sr">
                        Your anonymous message
                      </label>
                      {" "}
                      <textarea id="msg-cu" value={v.text ?? ""} onChange={v.onText} maxLength="1000" placeholder="Write anything…" style={{ display: "block", width: "100%", minHeight: "150px", resize: "none", borderRadius: "20px", border: `1px solid ${v.th.cardLine}`, background: v.th.field, color: v.th.ink, padding: "16px", fontSize: "18px", lineHeight: "1.45" }} />
                      {" "}
                    </div>
                    {" "}
                    </>
                  ) : null}
                  {" "}
                  {v.hasMedia ? (
                    <>
                    {" "}
                    <div className="pop" style={{ display: "flex", alignItems: "center", gap: "10px", marginTop: "10px", padding: "8px", borderRadius: "16px", background: v.th.field }}>
                      {" "}
                      <span className="media" style={{ width: "56px", height: "56px", flex: "none" }}>
                        {v.mediaIsVideo ? (
                          <>
                          <video src={v.mediaPreview} preload="metadata" />
                          </>
                        ) : null}
                        {v.mediaIsPhoto ? (
                          <>
                          <img src={v.mediaPreview} alt="Attached photo preview" />
                          </>
                        ) : null}
                      </span>
                      {" "}
                      <span style={{ flex: "1", fontSize: "13.5px" }}>
                        <b>
                          {v.mediaName}
                        </b>
                        <br />
                        <span style={{ color: v.th.muted }}>
                          {v.mediaMeta}
                        </span>
                      </span>
                      {" "}
                      <button onClick={v.removeMedia} aria-label="Remove attachment" style={{ width: "40px", height: "40px", borderRadius: "12px", border: "0", background: v.th.chipBg, color: "inherit", fontSize: "18px" }}>
                        ×
                      </button>
                      {" "}
                    </div>
                    {" "}
                    </>
                  ) : null}
                  {" "}
                  {v.showTools ? (
                    <>
                    {" "}
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "10px", gap: "8px" }}>
                      {" "}
                      <div style={{ display: "flex", gap: "6px" }}>
                        {" "}
                        <button className="tap" onClick={v.attachPhoto} aria-label="Add a photo" style={{ minHeight: "40px", padding: "0 12px", borderRadius: "12px", border: `1px solid ${v.th.cardLine}`, background: "transparent", color: "inherit", fontWeight: "700", fontSize: "13px", display: "inline-flex", alignItems: "center", gap: "6px" }}>
                          {" "}
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                            <rect x="3" y="5" width="18" height="14" rx="2" />
                            <circle cx="9" cy="10" r="2" />
                            <path d="m21 16-5-5-9 8" />
                          </svg>
                          Photo
                        </button>
                        {" "}
                        <button className="tap" onClick={v.attachVideo} aria-label="Add a video" style={{ minHeight: "40px", padding: "0 12px", borderRadius: "12px", border: `1px solid ${v.th.cardLine}`, background: "transparent", color: "inherit", fontWeight: "700", fontSize: "13px", display: "inline-flex", alignItems: "center", gap: "6px" }}>
                          {" "}
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                            <rect x="3" y="6" width="13" height="12" rx="2" />
                            <path d="m16 10 5-3v10l-5-3" />
                          </svg>
                          Video
                        </button>
                        {" "}
                      </div>
                      {" "}
                      {v.showCount ? (
                        <>
                        <span style={{ fontSize: "13px", color: v.th.muted }}>
                          {v.count}/{v.maxLen}
                        </span>
                        </>
                      ) : null}
                      {" "}
                    </div>
                    {" "}
                    </>
                  ) : null}
                  {" "}
                  {v.showSendArea ? (
                    <>
                    {" "}
                    <div>
                      {" "}
                      {v.isReturning ? (
                        <>
                        {" "}
                        <div style={{ display: "flex", alignItems: "center", gap: "12px", marginTop: "14px", padding: "10px 12px", borderRadius: "16px", background: v.th.chipBg }}>
                          {" "}
                          <span style={{ flex: "1", fontSize: "13.5px", lineHeight: "1.35" }}>
                            <b>
                              Let @{v.owner}{" reply"}
                            </b>
                            <br />
                            <span style={{ color: v.th.muted }}>
                              Needs a free account. You stay anonymous.
                            </span>
                          </span>
                          {" "}
                          <button className="switch" role="switch" aria-checked={v.replyStr} aria-label={`Let @${v.owner} reply`} onClick={v.toggleReply} />
                          {" "}
                        </div>
                        {" "}
                        </>
                      ) : null}
                      {" "}
                      {v.isMember ? (
                        <>
                        {" "}
                        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginTop: "14px", padding: "10px 12px", borderRadius: "16px", background: v.th.chipBg, fontSize: "13.5px", lineHeight: "1.35" }}>
                          {" "}
                          <img src="/sk/speech_balloon_3d.png" alt="" style={{ width: "30px", height: "30px", flex: "none" }} />
                          {" "}
                          <span>
                            <b>
                              Replies come to your inbox.
                            </b>
                            {" "}
                            <span style={{ color: v.th.muted }}>
                              @{v.owner}{" never sees your name."}
                            </span>
                          </span>
                          {" "}
                        </div>
                        {" "}
                        </>
                      ) : null}
                      {" "}
                      <div style={{ marginTop: "14px", padding: "10px 12px", borderRadius: "16px", background: v.th.chipBg, display: v.hintDisplay }}>
                        {" "}
                        <button className="tap" onClick={v.toggleHintBox} aria-expanded={v.hintBoxStr} style={{ width: "100%", display: "flex", alignItems: "center", gap: "10px", border: "0", background: "transparent", color: "inherit", padding: "0", minHeight: "40px", textAlign: "left" }}>
                          {" "}
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden="true" style={{ flex: "none" }}>
                            <circle cx="11" cy="11" r="7" />
                            <path d="m20 20-3.5-3.5" />
                          </svg>
                          {" "}
                          <span style={{ flex: "1", fontSize: "13.5px", lineHeight: "1.35" }}>
                            <b>
                              {v.hintHead}
                            </b>
                            <br />
                            <span style={{ color: v.th.muted }}>
                              Optional clue for @{v.owner}{" to guess with. Never your name."}
                            </span>
                          </span>
                          {" "}
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={{ flex: "none", transform: `rotate(${v.hintChev})` }}>
                            <path d="m6 9 6 6 6-6" />
                          </svg>
                          {" "}
                        </button>
                        {" "}
                        {v.hintBox ? (
                          <>
                          {" "}
                          <div>
                            {" "}
                            <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginTop: "10px" }}>
                              {" "}
                              {(v.senderHints || []).map((sh, i0) => (
                                <Fragment key={i0}>
                                {" "}
                                <button className="tap" onClick={sh.pick} aria-pressed={sh.on} style={{ minHeight: "40px", padding: "0 14px", borderRadius: "99px", border: `1px solid ${sh.line}`, background: sh.bg, color: sh.ink, fontWeight: "700", fontSize: "13.5px" }}>
                                  {sh.label}
                                </button>
                                {" "}
                                </Fragment>
                              ))}
                              {" "}
                            </div>
                            {" "}
                            {v.hintIsCustom ? (
                              <>
                              {" "}
                              <div>
                                {" "}
                                <label htmlFor="lp-hint" className="sr">
                                  Your own hint
                                </label>
                                {" "}
                                <input id="lp-hint" value={v.hintCustom ?? ""} onChange={v.onHintCustom} maxLength="40" placeholder="e.g. I sit behind you in GST" style={{ display: "block", width: "100%", marginTop: "10px", minHeight: "46px", borderRadius: "14px", border: `1px solid ${v.th.cardLine}`, background: v.th.field, color: "inherit", font: "inherit", fontSize: "15px", padding: "0 14px" }} />
                                {" "}
                                <div style={{ marginTop: "4px", fontSize: "12px", color: v.th.muted }}>
                                  Names, phone numbers and @handles are removed.
                                </div>
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
                      </div>
                      {" "}
                      <button className="tap" onClick={v.send} disabled={!!(v.cantSend)} style={{ marginTop: "14px", width: "100%", minHeight: "56px", border: "0", borderRadius: "18px", background: v.th.btnBg, color: v.th.btnInk, fontWeight: "800", fontSize: "17px", display: "flex", alignItems: "center", justifyContent: "center", gap: "10px", opacity: v.sendOpacity }}>
                        {" "}{v.sendLabel}{" "}
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                          <path d="M22 2 11 13" />
                          <path d="M22 2 15 22l-4-9-9-4 20-7z" />
                        </svg>
                        {" "}
                      </button>
                      {" "}
                      {v.needHint ? (
                        <>
                        <div style={{ marginTop: "8px", textAlign: "center", fontSize: "12.5px", fontWeight: "700", color: v.th.muted }}>
                          {v.needText}
                        </div>
                        </>
                      ) : null}
                      {" "}
                      {v.hasSendErr ? (
                        <>
                        <div role="alert" style={{ marginTop: "8px", textAlign: "center", fontSize: "13px", fontWeight: "800", color: "#ff8b98" }}>
                          {v.sendErr}
                        </div>
                        </>
                      ) : null}
                      {" "}
                      {v.showChrome ? (
                        <>
                        <p style={{ margin: "12px 4px 0", fontSize: "12.5px", lineHeight: "1.5", color: v.th.muted }}>
                          Your message is anonymous. @{v.owner}{" can report it: you get a warning each time, and after 3 warnings the next report blocks you from messaging them. Approximate info (like country and device type) may be used for stats and hints."}
                        </p>
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
                {v.showQuizAd ? (
                  <>
                  <div className="ad ad-mrec" style={{ marginTop: "16px", backgroundColor: "rgba(255,255,255,.88)", color: "#4b4358", borderColor: "rgba(0,0,0,.18)" }}>
                    <b>
                      Medium rectangle · quiz results
                    </b>
                    300 × 250
                  </div>
                  </>
                ) : null}
                {" "}
              </section>
              {" "}
            </main>
            {" "}
            </>
          ) : null}
          {" "}
          {v.showSent ? (
            <>
            {" "}
            <main style={{ flex: "1", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center", position: "relative", padding: "16px 0" }}>
              {" "}
              {(v.confetti || []).map((p, i0) => (
                <Fragment key={i0}>
                {" "}
                <span className={`cf cf${p.k}`} aria-hidden="true" style={{ background: p.color, animationDelay: p.delay, marginLeft: p.shift }} />
                {" "}
                </Fragment>
              ))}
              {" "}
              <img className="pop" src={v.sentEmoji} alt="" style={{ width: "110px", height: "110px" }} />
              {" "}
              <h1 className="rise" style={{ marginTop: "14px", fontSize: "clamp(40px, 8cqi, 72px)", fontWeight: "800", letterSpacing: "-.04em", lineHeight: "1" }}>
                {v.sentTitle}
              </h1>
              {" "}
              <p className="rise" style={{ marginTop: "10px", fontSize: "17px", lineHeight: "1.5", maxWidth: "32ch", color: v.th.muted, animationDelay: ".1s" }}>
                {v.sentBody}
              </p>
              {" "}
              <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", alignItems: "flex-start", gap: "18px", marginTop: "24px", width: "100%" }}>
                {" "}
                <div className="rise" style={{ flex: "0 1 380px", background: v.th.card, border: `1px solid ${v.th.cardLine}`, borderRadius: "26px", padding: "20px", backdropFilter: "blur(18px)", animationDelay: ".2s" }}>
                  {" "}
                  {v.showReceipt ? (
                    <>
                    {" "}
                    <div style={{ marginBottom: "16px", padding: "16px", borderRadius: "20px", background: "#ffffff", color: "#2a0a1c", textAlign: "left" }}>
                      {" "}
                      <div style={{ fontSize: "12px", fontWeight: "800", letterSpacing: ".08em", textTransform: "uppercase", color: "#b0246a" }}>
                        Your receipt
                      </div>
                      {" "}
                      <div className="d" style={{ fontSize: "28px", fontWeight: "800", letterSpacing: ".04em", marginTop: "4px" }}>
                        {v.receiptCode}
                      </div>
                      {" "}
                      <p style={{ margin: "4px 0 0", fontSize: "13.5px", color: "#5b4b55", lineHeight: "1.45" }}>
                        See if @{v.owner}{" reacts, replies or guesses it’s you. No account needed, and only this code links back to you."}
                      </p>
                      {" "}
                      <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: "8px", marginTop: "12px" }}>
                        {" "}
                        <button className="tap" onClick={v.copyReceipt} style={{ minHeight: "46px", borderRadius: "14px", border: "1px solid #e3d7de", background: "#ffffff", color: "#2a0a1c", fontWeight: "800", fontSize: "14px" }}>
                          {v.copyReceiptLabel}
                        </button>
                        {" "}
                        <SkLink href="/receipt" className="tap" style={{ minHeight: "46px", borderRadius: "14px", background: "#2a0a1c", color: "#ffffff", fontWeight: "800", fontSize: "14px", display: "grid", placeItems: "center", textDecoration: "none" }}>
                          Check receipt
                        </SkLink>
                        {" "}
                      </div>
                      {" "}
                    </div>
                    {" "}
                    </>
                  ) : null}
                  {" "}
                  {v.repliesOn ? (
                    <>
                    {" "}
                    <div>
                      {" "}
                      <div className="d" style={{ fontSize: "22px", fontWeight: "800", letterSpacing: "-.02em" }}>
                        Replies are on
                      </div>
                      {" "}
                      <p style={{ margin: "6px 0 16px", fontSize: "15px", color: v.th.muted }}>
                        If @{v.owner}{" answers, it lands in your inbox. You’ll get a notification."}
                      </p>
                      {" "}
                      <SkLink href="/inbox" className="tap" style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "56px", borderRadius: "18px", background: v.th.btnBg, color: v.th.btnInk, fontWeight: "800", fontSize: "17px", textDecoration: "none" }}>
                        Open my inbox
                      </SkLink>
                      {" "}
                    </div>
                    {" "}
                    </>
                  ) : null}
                  {" "}
                  {v.repliesOff ? (
                    <>
                    {" "}
                    <div>
                      {" "}
                      <div className="d" style={{ fontSize: "22px", fontWeight: "800", letterSpacing: "-.02em" }}>
                        {v.ownTitle}
                      </div>
                      {" "}
                      <p style={{ margin: "6px 0 16px", fontSize: "15px", color: v.th.muted }}>
                        {v.ownSub}
                      </p>
                      {" "}
                      <SkLink href="/signup" className="tap" style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "56px", borderRadius: "18px", background: v.th.btnBg, color: v.th.btnInk, fontWeight: "800", fontSize: "17px", textDecoration: "none" }}>
                        {v.ownCta}
                      </SkLink>
                      {" "}
                    </div>
                    {" "}
                    </>
                  ) : null}
                  {" "}
                  <button className="tap" onClick={v.again} style={{ marginTop: "10px", width: "100%", minHeight: "48px", borderRadius: "16px", border: `1px solid ${v.th.cardLine}`, background: "transparent", color: "inherit", fontWeight: "700", fontSize: "15px" }}>
                    {v.againLabel}
                  </button>
                  {" "}
                </div>
                {" "}
                {v.showChrome ? (
                  <>
                  <div className="ad ad-mrec" style={{ backgroundColor: "rgba(255,255,255,.88)", color: "#4b4358", borderColor: "rgba(0,0,0,.18)" }}>
                    <b>
                      Medium rectangle
                    </b>
                    300 × 250 · after send
                  </div>
                  </>
                ) : null}
                {" "}
              </div>
              {" "}
            </main>
            {" "}
            </>
          ) : null}
          {" "}
          {v.showNap ? (
            <>
            {" "}
            <main style={{ flex: "1", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center", padding: "16px 0" }}>
              {" "}
              <img className="float" src={v.napEmoji} alt="" style={{ width: "120px", height: "120px" }} />
              {" "}
              <h1 style={{ marginTop: "16px", fontSize: "clamp(34px, 7cqi, 60px)", fontWeight: "800", letterSpacing: "-.03em", lineHeight: "1.02", maxWidth: "14ch" }}>
                {v.napTitle}
              </h1>
              {" "}
              <p style={{ marginTop: "10px", fontSize: "16.5px", lineHeight: "1.5", color: v.th.muted, maxWidth: "34ch" }}>
                {v.napBody}
              </p>
              {" "}
              <SkLink href="/signup" className="tap" style={{ marginTop: "22px", display: "inline-flex", alignItems: "center", justifyContent: "center", minHeight: "56px", padding: "0 28px", borderRadius: "18px", background: v.th.btnBg, color: v.th.btnInk, fontWeight: "800", fontSize: "17px", textDecoration: "none" }}>
                {v.napCta}
              </SkLink>
              {" "}
              <div className="ad ad-mrec" style={{ marginTop: "26px", backgroundColor: "rgba(255,255,255,.88)", color: "#4b4358", borderColor: "rgba(0,0,0,.18)" }}>
                <b>
                  Medium rectangle
                </b>
                {"300 × 250 · "}{v.napAdLabel}
              </div>
              {" "}
            </main>
            {" "}
            </>
          ) : null}
          {" "}
          {v.showChrome ? (
            <>
            {" "}
            <footer style={{ display: "flex", justifyContent: "center", flexWrap: "wrap", gap: "6px 18px", paddingTop: "22px", fontSize: "13px" }}>
              {" "}
              <SkLink href="/safety" style={{ color: v.th.muted, minHeight: "32px", display: "inline-flex", alignItems: "center" }}>
                How reporting works
              </SkLink>
              {" "}
              <button onClick={v.openReport} style={{ background: "none", border: "0", padding: "0", color: v.th.muted, textDecoration: "underline", fontSize: "13px", minHeight: "32px" }}>
                Report this link
              </button>
              {" "}
              <SkLink href="/legal" style={{ color: v.th.muted, minHeight: "32px", display: "inline-flex", alignItems: "center" }}>
                Privacy
              </SkLink>
              {" "}
            </footer>
            {" "}
            </>
          ) : null}
          {" "}
        </div>
        {" "}
        {v.popup ? (
          <>
          {" "}
          <div className="scrim">
            {" "}
            <div className="lp-pop" role="dialog" aria-label={`Get replies from @${v.owner}`} style={{ background: "#f5f3f8", color: "#211a2c" }}>
              {" "}
              {v.popAsk ? (
                <>
                {" "}
                <div>
                  {" "}
                  <div style={{ display: "flex", flexDirection: "column", gap: "6px", padding: "14px", borderRadius: "22px", background: v.th.bg }}>
                    {" "}
                    <div className="lp-bubble" style={{ alignSelf: "flex-end", background: "rgba(255,255,255,.92)", color: "#211a2c", borderRadius: "18px 18px 6px 18px" }}>
                      {v.popMine}
                    </div>
                    {" "}
                    <div className="lp-bubble pop" style={{ background: "#211a2c", color: "#ffffff", animationDelay: ".5s" }}>
                      <b style={{ fontSize: "12px", opacity: ".8" }}>
                        @{v.owner}{" replied"}
                      </b>
                      <br />
                      haha okay who is this 👀
                    </div>
                    {" "}
                  </div>
                  {" "}
                  <h2 style={{ marginTop: "16px", fontSize: "24px", lineHeight: "1.1" }}>
                    Want @{v.owner}{" to reply to you?"}
                  </h2>
                  {" "}
                  <p style={{ marginTop: "8px", fontSize: "14.5px", lineHeight: "1.5", color: "#665e74" }}>
                    They can answer you privately, and you can keep talking. You stay anonymous to them, forever.
                  </p>
                  {" "}
                  <button className="lp-opt tap" onClick={v.popYes} style={{ marginTop: "16px", border: "0", background: "linear-gradient(135deg,#d81b72,#7a3cff)", color: "#ffffff" }}>
                    <img src="/sk/speech_balloon_3d.png" alt="" style={{ width: "30px", height: "30px" }} />
                    Yes, get replies
                    <span style={{ marginLeft: "auto", fontSize: "12.5px", opacity: ".85" }}>
                      free · 20 sec
                    </span>
                  </button>
                  {" "}
                  <button className="lp-opt tap" onClick={v.popNo} style={{ marginTop: "8px", border: "1px solid rgba(48,34,72,.16)", background: "#ffffff", color: "#211a2c" }}>
                    No thanks, just send
                  </button>
                  {" "}
                  <p style={{ marginTop: "14px", fontSize: "12px", lineHeight: "1.5", color: "#665e74" }}>
                    Free, takes 20 seconds: a username and password, nothing else. First time here, so we asked. We remember this device’s approximate network (IP) so we don’t ask again. @{v.owner}{" never sees it."}
                  </p>
                  {" "}
                </div>
                {" "}
                </>
              ) : null}
              {" "}
              {v.popJoin ? (
                <>
                {" "}
                <div>
                  {" "}
                  <button onClick={v.popBack} style={{ border: "0", background: "none", padding: "0", minHeight: "36px", fontWeight: "700", color: "#665e74" }}>
                    ← Back
                  </button>
                  {" "}
                  <div style={{ display: "flex", alignItems: "center", gap: "10px", marginTop: "4px", padding: "10px 12px", borderRadius: "16px", background: "#ece8f2" }}>
                    {" "}
                    <span style={{ width: "30px", height: "30px", borderRadius: "50%", display: "grid", placeItems: "center", background: "#211a2c", color: "#ffffff", fontSize: "14px", flex: "none" }}>
                      ✉
                    </span>
                    {" "}
                    <span style={{ fontSize: "13px", lineHeight: "1.35", minWidth: "0" }}>
                      <b>
                        Your message is ready.
                      </b>
                      {" It sends to @"}{v.owner}{" the moment you continue."}
                    </span>
                    {" "}
                  </div>
                  {" "}
                  <h2 style={{ marginTop: "14px", fontSize: "24px", lineHeight: "1.1" }}>
                    {v.joinTitle}
                  </h2>
                  {" "}
                  <p style={{ marginTop: "6px", fontSize: "14px", lineHeight: "1.5", color: "#665e74" }}>
                    {v.joinSub}
                  </p>
                  {" "}
                  <label htmlFor="pop-user" style={{ display: "block", marginTop: "14px", fontSize: "13px", fontWeight: "800" }}>
                    Username
                  </label>
                  {" "}
                  <div style={{ position: "relative", marginTop: "6px" }}>
                    {" "}
                    <span style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", color: "#8a8197", fontWeight: "800" }}>
                      @
                    </span>
                    {" "}
                    <input id="pop-user" value={v.popUser ?? ""} onChange={v.onPopUser} autoComplete="username" placeholder="pick a username" style={{ display: "block", width: "100%", minHeight: "52px", borderRadius: "16px", border: `1.5px solid ${v.userLine}`, background: "#ffffff", color: "#211a2c", padding: "0 16px 0 32px", fontSize: "16px" }} />
                    {" "}
                  </div>
                  {" "}
                  <div style={{ marginTop: "5px", fontSize: "12.5px", fontWeight: "700", color: v.userHintC }}>
                    {v.userHint}
                  </div>
                  {" "}
                  <label htmlFor="pop-pass" style={{ display: "block", marginTop: "10px", fontSize: "13px", fontWeight: "800" }}>
                    Password
                  </label>
                  {" "}
                  <div style={{ position: "relative", marginTop: "6px" }}>
                    {" "}
                    <input id="pop-pass" type={v.passType} value={v.popPass ?? ""} onChange={v.onPopPass} autoComplete={v.passAuto} placeholder="At least 8 characters" style={{ display: "block", width: "100%", minHeight: "52px", borderRadius: "16px", border: "1.5px solid rgba(48,34,72,.18)", background: "#ffffff", color: "#211a2c", padding: "0 70px 0 16px", fontSize: "16px" }} />
                    {" "}
                    <button onClick={v.togglePass} style={{ position: "absolute", right: "6px", top: "50%", transform: "translateY(-50%)", minHeight: "40px", padding: "0 12px", border: "0", background: "none", color: "#b0246a", fontWeight: "800", fontSize: "13px" }}>
                      {v.passBtn}
                    </button>
                    {" "}
                  </div>
                  {" "}
                  <div style={{ marginTop: "5px", fontSize: "12.5px", fontWeight: "700", color: v.passHintC }}>
                    {v.passHint}
                  </div>
                  {" "}
                  {v.isNewAcct ? (
                    <>
                    {" "}
                    <label style={{ display: "flex", gap: "10px", alignItems: "flex-start", marginTop: "12px", fontSize: "13.5px", lineHeight: "1.45", cursor: "pointer" }}>
                      {" "}
                      <input type="checkbox" checked={!!(v.popAgree)} onChange={v.onPopAgree} style={{ width: "20px", height: "20px", margin: "1px 0 0", accentColor: "#d81b72", flex: "none" }} />
                      {" "}
                      <span>
                        {"I’m 16 or older and accept the "}
                        <SkLink href="/legal" style={{ color: "#b0246a", fontWeight: "700" }}>
                          Terms
                        </SkLink>
                        {" and "}
                        <SkLink href="/safety" style={{ color: "#b0246a", fontWeight: "700" }}>
                          Community rules
                        </SkLink>
                        .
                      </span>
                      {" "}
                    </label>
                    {" "}
                    </>
                  ) : null}
                  {" "}
                  {v.hasPopErr ? (
                    <>
                    <p role="alert" style={{ marginTop: "10px", fontSize: "13.5px", fontWeight: "700", color: "#c4213a" }}>
                      {v.popErr}
                    </p>
                    </>
                  ) : null}
                  {" "}
                  <button className="lp-opt tap" onClick={v.popDone} disabled={!!(v.popCant)} style={{ marginTop: "14px", justifyContent: "center", border: "0", background: "linear-gradient(135deg,#d81b72,#7a3cff)", color: "#ffffff", opacity: v.popOpacity }}>
                    {v.joinCta}
                  </button>
                  {" "}
                  <button onClick={v.switchAcct} style={{ display: "block", width: "100%", marginTop: "8px", minHeight: "40px", border: "0", background: "none", color: "#211a2c", fontWeight: "700", fontSize: "14px" }}>
                    {v.switchLabel}
                  </button>
                  {" "}
                  <button onClick={v.popNo} style={{ display: "block", width: "100%", minHeight: "36px", border: "0", background: "none", color: "#665e74", fontSize: "13px", textDecoration: "underline" }}>
                    Send without replies
                  </button>
                  {" "}
                </div>
                {" "}
                </>
              ) : null}
              {" "}
              {v.popMade ? (
                <>
                {" "}
                <div style={{ textAlign: "center", padding: "6px 0 2px" }}>
                  {" "}
                  <div style={{ position: "relative", width: "92px", height: "92px", margin: "0 auto" }}>
                    {" "}
                    <svg width="92" height="92" viewBox="0 0 92 92" aria-hidden="true">
                      <circle cx="46" cy="46" r="40" fill="none" stroke="#ece8f2" strokeWidth="7" />
                      <circle className="lp-ring-go" cx="46" cy="46" r="40" fill="none" stroke="#d81b72" strokeWidth="7" strokeLinecap="round" strokeDasharray="252" transform="rotate(-90 46 46)" />
                    </svg>
                    {" "}
                    <span className="pop" style={{ position: "absolute", inset: "0", display: "grid", placeItems: "center", fontSize: "34px" }}>
                      ✓
                    </span>
                    {" "}
                  </div>
                  {" "}
                  <h2 style={{ marginTop: "12px", fontSize: "24px", lineHeight: "1.1" }}>
                    Sent to @{v.owner}
                  </h2>
                  {" "}
                  <p style={{ marginTop: "6px", fontSize: "14.5px", lineHeight: "1.5", color: "#665e74" }}>
                    {v.madeBody}
                  </p>
                  {" "}
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", marginTop: "12px", padding: "10px 12px", borderRadius: "16px", background: "#ece8f2", fontSize: "13.5px" }}>
                    <span style={{ width: "26px", height: "26px", borderRadius: "50%", background: "linear-gradient(135deg,#ffb35c,#ff5f8f)", display: "grid", placeItems: "center", color: "#ffffff", fontWeight: "800", fontSize: "12px" }}>
                      {v.madeInitial}
                    </span>
                    <b>
                      @{v.madeUser}
                    </b>
                    <span style={{ color: "#665e74" }}>
                      {v.madeTag}
                    </span>
                  </div>
                  {" "}
                  <SkLink href={route(v.onbHref)} className="lp-opt tap" style={{ marginTop: "16px", justifyContent: "center", border: "0", background: "#211a2c", color: "#ffffff", textDecoration: "none" }}>
                    {v.madeCta}{" →"}
                  </SkLink>
                  {" "}
                  <p style={{ marginTop: "8px", fontSize: "12px", color: "#665e74" }}>
                    {v.madeNote}
                  </p>
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
          </>
        ) : null}
        {" "}
        {v.report ? (
          <>
          {" "}
          <div className="scrim">
            {" "}
            <div className="sheet" role="dialog" aria-label="Report this link" style={{ background: "#ffffff", color: "#211a2c", borderColor: "rgba(0,0,0,.08)" }}>
              {" "}
              {v.notReported ? (
                <>
                {" "}
                <div>
                  {" "}
                  <h2 style={{ fontSize: "22px" }}>
                    What’s wrong with this link?
                  </h2>
                  {" "}
                  <p style={{ marginTop: "6px", fontSize: "14px", color: "#665e74" }}>
                    Pick a reason. Reports are anonymous.
                  </p>
                  {" "}
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginTop: "14px" }}>
                    {" "}
                    {(v.reasons || []).map((r, i0) => (
                      <Fragment key={i0}>
                      {" "}
                      <button className="tap" onClick={r.pick} aria-pressed={r.on} style={{ minHeight: "42px", padding: "0 14px", borderRadius: "99px", border: `1.5px solid ${r.line}`, background: r.bg, color: "#211a2c", fontWeight: "700", fontSize: "14px" }}>
                        {r.label}
                      </button>
                      {" "}
                      </Fragment>
                    ))}
                    {" "}
                    <button className="tap" onClick={v.pickOther} aria-pressed={v.otherOn} style={{ minHeight: "42px", padding: "0 14px", borderRadius: "99px", border: "1.5px dashed #c2185b", background: v.otherBg, color: "#c2185b", fontWeight: "800", fontSize: "14px" }}>
                      Other reason
                    </button>
                    {" "}
                  </div>
                  {" "}
                  <button onClick={v.shuffle} style={{ marginTop: "10px", background: "none", border: "0", color: "#665e74", fontWeight: "700", fontSize: "13px", textDecoration: "underline", minHeight: "36px" }}>
                    Show different reasons
                  </button>
                  {" "}
                  {v.otherOn ? (
                    <>
                    {" "}
                    <textarea value={v.otherText ?? ""} onChange={v.onOther} placeholder="Tell us what happened" aria-label="Other reason" style={{ display: "block", width: "100%", marginTop: "8px", minHeight: "80px", borderRadius: "14px", border: "1px solid rgba(48,34,72,.2)", padding: "12px", fontSize: "15px" }} />
                    {" "}
                    </>
                  ) : null}
                  {" "}
                  <button onClick={v.submitReport} disabled={!!(v.cantReport)} style={{ marginTop: "14px", width: "100%", minHeight: "52px", borderRadius: "16px", border: "0", background: "#211a2c", color: "#ffffff", fontWeight: "800", opacity: v.reportOpacity }}>
                    Send report
                  </button>
                  {" "}
                  <button onClick={v.closeReport} style={{ marginTop: "6px", width: "100%", minHeight: "44px", border: "0", background: "none", color: "#665e74", fontWeight: "700" }}>
                    Cancel
                  </button>
                  {" "}
                </div>
                {" "}
                </>
              ) : null}
              {" "}
              {v.reported ? (
                <>
                {" "}
                <div style={{ textAlign: "center", padding: "10px 0" }}>
                  {" "}
                  <img className="pop" src="/sk/sparkles.png" alt="" style={{ width: "64px", height: "64px" }} />
                  {" "}
                  <h2 style={{ fontSize: "22px", marginTop: "8px" }}>
                    Thanks for telling us
                  </h2>
                  {" "}
                  <p style={{ marginTop: "6px", fontSize: "14.5px", color: "#665e74" }}>
                    The owner of this link has been notified. If you are in danger, call 112.
                  </p>
                  {" "}
                  <button onClick={v.closeReport} style={{ marginTop: "16px", width: "100%", minHeight: "52px", borderRadius: "16px", border: "0", background: "#211a2c", color: "#ffffff", fontWeight: "800" }}>
                    Done
                  </button>
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
          </>
        ) : null}
        {" "}
      </div>
      {" "}
      </>
    );
  }
}
