"use client";

// Room voice tips, all in the browser: record from the mic, disguise the voice, and save a small mono WAV.
// The raw recording never leaves the phone; only the disguised file is uploaded (app/api/upload).
//
// Disguises change pitch and timbre together (speed, filters, ring modulation, distortion), so the result
// is hard to turn back into the real voice. The file is 8 kHz mono 16-bit (phone-call quality): about
// 16 KB a second, so even a slowed 3-minute note stays under the 4.5 MB upload limit.

export const DISGUISES = [
  { id: "deep", name: "Deep", sub: "low, slow" },
  { id: "helium", name: "Helium", sub: "high, fast" },
  { id: "robot", name: "Robot", sub: "flat, metal" },
  { id: "radio", name: "Radio", sub: "old call-in" },
  { id: "echo", name: "Echo", sub: "empty hall" },
  { id: "whisper", name: "Whisper", sub: "breathy" },
] as const;
export type DisguiseId = (typeof DISGUISES)[number]["id"];

const OUT_RATE = 8000;

/** Live mic recording with a level meter. */
export class MicRecorder {
  private stream: MediaStream | null = null;
  private rec: MediaRecorder | null = null;
  private chunks: Blob[] = [];
  private ctx: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private buf = new Uint8Array(256);
  started = 0;

  static supported() {
    return typeof window !== "undefined" && !!navigator.mediaDevices?.getUserMedia && typeof MediaRecorder !== "undefined";
  }

  async start() {
    this.stream = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true } });
    this.ctx = new AudioContext();
    const src = this.ctx.createMediaStreamSource(this.stream);
    this.analyser = this.ctx.createAnalyser();
    this.analyser.fftSize = 256;
    src.connect(this.analyser);
    this.chunks = [];
    this.rec = new MediaRecorder(this.stream);
    this.rec.ondataavailable = (e) => {
      if (e.data.size) this.chunks.push(e.data);
    };
    this.rec.start(250);
    this.started = Date.now();
  }

  /** 0–100, how loud the mic is right now. */
  level() {
    if (!this.analyser) return 0;
    this.analyser.getByteTimeDomainData(this.buf);
    let peak = 0;
    for (const v of this.buf) peak = Math.max(peak, Math.abs(v - 128));
    return Math.min(100, Math.round((peak / 128) * 160));
  }

  /** Stops and returns the raw recording (kept on this phone). */
  stop(): Promise<Blob> {
    return new Promise((resolve) => {
      const done = () => {
        this.stream?.getTracks().forEach((t) => t.stop());
        this.ctx?.close().catch(() => {});
        resolve(new Blob(this.chunks, { type: this.rec?.mimeType || "audio/webm" }));
      };
      if (!this.rec || this.rec.state === "inactive") return done();
      this.rec.onstop = done;
      this.rec.stop();
    });
  }

  cancel() {
    try {
      this.rec?.stop();
    } catch {}
    this.stream?.getTracks().forEach((t) => t.stop());
    this.ctx?.close().catch(() => {});
  }
}

/** Decodes a recording into an AudioBuffer. */
export async function decode(blob: Blob) {
  const ctx = new AudioContext();
  try {
    return await ctx.decodeAudioData(await blob.arrayBuffer());
  } finally {
    ctx.close().catch(() => {});
  }
}

function distortionCurve(amount: number) {
  const n = 1024, curve = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    const x = (i * 2) / n - 1;
    curve[i] = ((3 + amount) * x * 20 * (Math.PI / 180)) / (Math.PI + amount * Math.abs(x));
  }
  return curve;
}

const RATES: Record<DisguiseId, number> = { deep: 0.76, helium: 1.42, robot: 0.9, radio: 1.12, echo: 0.86, whisper: 1.08 };

/** Renders the recording through a disguise, mixed down to mono at 8 kHz. */
export async function disguise(input: AudioBuffer, id: DisguiseId): Promise<AudioBuffer> {
  const rate = RATES[id];
  const length = Math.ceil((input.duration / rate) * OUT_RATE) + OUT_RATE;
  const ctx = new OfflineAudioContext(1, length, OUT_RATE);
  const src = ctx.createBufferSource();
  src.buffer = input;
  src.playbackRate.value = rate;
  let node: AudioNode = src;
  const chain = <T extends AudioNode>(n: T) => {
    node.connect(n);
    node = n;
    return n;
  };
  if (id === "deep") {
    const low = chain(ctx.createBiquadFilter());
    low.type = "lowshelf";
    low.frequency.value = 300;
    low.gain.value = 6;
  }
  if (id === "robot") {
    // ring modulation: the voice times a 55 Hz tone, then a little grit
    const ring = ctx.createGain();
    ring.gain.value = 0;
    const osc = ctx.createOscillator();
    osc.frequency.value = 55;
    osc.connect(ring.gain);
    osc.start();
    chain(ring);
    chain(ctx.createWaveShaper()).curve = distortionCurve(30);
  }
  if (id === "radio") {
    const hp = chain(ctx.createBiquadFilter());
    hp.type = "highpass";
    hp.frequency.value = 500;
    const bp = chain(ctx.createBiquadFilter());
    bp.type = "peaking";
    bp.frequency.value = 1800;
    bp.gain.value = 9;
    chain(ctx.createWaveShaper()).curve = distortionCurve(60);
  }
  if (id === "echo") {
    const dry = ctx.createGain(), wet = ctx.createGain(), delay = ctx.createDelay(1), fb = ctx.createGain(), mix = ctx.createGain();
    delay.delayTime.value = 0.19;
    fb.gain.value = 0.42;
    wet.gain.value = 0.6;
    node.connect(dry);
    node.connect(delay);
    delay.connect(fb);
    fb.connect(delay);
    delay.connect(wet);
    dry.connect(mix);
    wet.connect(mix);
    node = mix;
  }
  if (id === "whisper") {
    const hp = chain(ctx.createBiquadFilter());
    hp.type = "highpass";
    hp.frequency.value = 1100;
    // a breathy noise bed under the voice
    const noise = ctx.createBufferSource();
    const nb = ctx.createBuffer(1, OUT_RATE * 2, OUT_RATE);
    const d = nb.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * 0.035;
    noise.buffer = nb;
    noise.loop = true;
    noise.connect(ctx.destination);
    noise.start();
    noise.stop(input.duration / rate);
  }
  const out = ctx.createGain();
  out.gain.value = 0.95;
  node.connect(out);
  out.connect(ctx.destination);
  src.start();
  return trim(await ctx.startRendering());
}

/** Cuts the silent tail the render leaves. */
function trim(b: AudioBuffer) {
  const d = b.getChannelData(0);
  let end = d.length;
  while (end > 0 && Math.abs(d[end - 1]) < 0.002) end--;
  end = Math.min(d.length, end + Math.round(b.sampleRate * 0.15));
  const out = new AudioBuffer({ length: Math.max(1, end), numberOfChannels: 1, sampleRate: b.sampleRate });
  out.copyToChannel(d.slice(0, end), 0);
  return out;
}

/** 48 loudness levels (6–100) for the waveform. */
export function peaksOf(b: AudioBuffer, count = 48) {
  const d = b.getChannelData(0), step = Math.max(1, Math.floor(d.length / count)), raw: number[] = [];
  let max = 0;
  for (let i = 0; i < count; i++) {
    let p = 0;
    for (let j = i * step; j < Math.min(d.length, (i + 1) * step); j++) p = Math.max(p, Math.abs(d[j]));
    raw.push(p);
    max = Math.max(max, p);
  }
  return raw.map((p) => Math.max(6, Math.min(100, Math.round((p / (max || 1)) * 100))));
}

/** 16-bit mono WAV. */
export function toWav(b: AudioBuffer) {
  const d = b.getChannelData(0), n = d.length, buf = new ArrayBuffer(44 + n * 2), v = new DataView(buf);
  const str = (o: number, s: string) => [...s].forEach((c, i) => v.setUint8(o + i, c.charCodeAt(0)));
  str(0, "RIFF");
  v.setUint32(4, 36 + n * 2, true);
  str(8, "WAVE");
  str(12, "fmt ");
  v.setUint32(16, 16, true);
  v.setUint16(20, 1, true);
  v.setUint16(22, 1, true);
  v.setUint32(24, b.sampleRate, true);
  v.setUint32(28, b.sampleRate * 2, true);
  v.setUint16(32, 2, true);
  v.setUint16(34, 16, true);
  str(36, "data");
  v.setUint32(40, n * 2, true);
  for (let i = 0; i < n; i++) v.setInt16(44 + i * 2, Math.max(-1, Math.min(1, d[i])) * 0x7fff, true);
  return new Blob([buf], { type: "audio/wav" });
}

/** Plays an AudioBuffer (the disguised preview). Returns a stop function. */
export function playBuffer(b: AudioBuffer, onEnd: () => void) {
  const ctx = new AudioContext();
  const src = ctx.createBufferSource();
  src.buffer = b;
  src.connect(ctx.destination);
  src.onended = () => {
    ctx.close().catch(() => {});
    onEnd();
  };
  src.start();
  return () => {
    try {
      src.stop();
    } catch {}
  };
}
