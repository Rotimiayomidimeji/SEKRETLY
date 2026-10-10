"use client";
import { useState, type FormEvent } from "react";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { ArrowRight, Eye, EyeOff, LockKeyhole, Sparkles } from "lucide-react";

type Mode = "login" | "signup" | "forgot" | "reset" | "verify";
export function AuthScreen({ mode, token = "" }: { mode: Mode; token?: string }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [visible, setVisible] = useState(false);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  const title = { login: "Back for more?", signup: "Your secret era starts here.", forgot: "Lost the password?", reset: "A fresh start.", verify: "One last thing." }[mode];
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setBusy(true); setError(""); setNotice("");
    try {
      if (mode === "login") {
        const result = await signIn("credentials", { email, password, redirect: false });
        if (result?.error) throw new Error("Invalid credentials or email not verified.");
        window.location.assign("/home"); return;
      }
      const endpoint = { signup: "/api/auth/register", forgot: "/api/auth/forgot-password", reset: "/api/auth/reset-password", verify: "/api/auth/verify" }[mode];
      const payload = mode === "signup" ? { name, email, password } : mode === "forgot" ? { email } : mode === "reset" ? { token, password } : { token };
      const response = await fetch(endpoint, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "Something went wrong.");
      setNotice(mode === "signup" ? "Verification link sent. Check your inbox." : mode === "forgot" ? "If this account exists, you'll receive a reset link." : mode === "reset" ? "Password updated. You can sign in now." : "Email verified! You can sign in now.");
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Something went wrong."); }
    finally { setBusy(false); }
  }
  return <main className="relative flex min-h-svh items-center justify-center overflow-hidden bg-[#09060d] px-5 py-12 text-white">
    <div aria-hidden className="pointer-events-none absolute -top-36 left-1/2 h-[520px] w-[520px] -translate-x-1/2 rounded-full bg-fuchsia-600/20 blur-[110px]" />
    <div aria-hidden className="pointer-events-none absolute -bottom-56 right-[-15%] h-[480px] w-[480px] rounded-full bg-violet-700/20 blur-[120px]" />
    <div className="relative w-full max-w-[450px]">
      <Link href="/" className="mb-12 inline-flex items-center gap-2 text-sm font-black tracking-[.18em]"><span className="text-3xl italic text-[#ff428d]">S</span> SEKRETLY</Link>
      <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-fuchsia-400/20 bg-fuchsia-400/10 px-4 py-2 text-[10px] font-bold tracking-[.2em] text-fuchsia-200"><Sparkles size={13}/> YOUR SPACE. YOUR RULES.</div>
      <h1 className="max-w-[420px] text-[clamp(3rem,12vw,4.8rem)] font-black leading-[.95] tracking-[-.075em]">{title}</h1>
      <p className="mt-5 text-sm leading-6 text-white/55">{mode === "signup" ? "Create your room. Let the real conversations begin." : mode === "login" ? "Your inbox is waiting. Your identity stays yours." : "We'll help you get back in safely."}</p>
      {(mode === "login" || mode === "signup") && <button type="button" disabled={busy} onClick={() => signIn("google", { callbackUrl: "/home" })} className="mt-8 flex w-full items-center justify-center gap-3 rounded-2xl border border-white/20 bg-white px-5 py-4 text-sm font-bold text-[#17101d] transition hover:bg-fuchsia-50 disabled:opacity-60"><span className="text-lg font-black">G</span> Continue with Google</button>}
      {(mode === "login" || mode === "signup") && <div className="my-7 flex items-center gap-4 text-xs text-white/35"><span className="h-px flex-1 bg-white/15"/>or use email<span className="h-px flex-1 bg-white/15"/></div>}
      <form onSubmit={submit} className={mode === "login" || mode === "signup" ? "space-y-4" : "mt-8 space-y-4"}>
        {mode === "signup" && <label className="block text-xs font-semibold text-white/75">Display name<input autoComplete="name" required minLength={2} maxLength={60} value={name} onChange={e=>setName(e.target.value)} placeholder="What should we call you?" className="mt-2 w-full rounded-2xl border border-white/15 bg-white/[.055] px-4 py-4 text-base text-white outline-none placeholder:text-white/30 focus:border-fuchsia-400"/></label>}
        {(["login","signup","forgot"] as Mode[]).includes(mode) && <label className="block text-xs font-semibold text-white/75">Email<input type="email" autoComplete="email" required value={email} onChange={e=>setEmail(e.target.value)} placeholder="you@example.com" className="mt-2 w-full rounded-2xl border border-white/15 bg-white/[.055] px-4 py-4 text-base text-white outline-none placeholder:text-white/30 focus:border-fuchsia-400"/></label>}
        {(["login","signup","reset"] as Mode[]).includes(mode) && <label className="block text-xs font-semibold text-white/75">Password<div className="relative mt-2"><input type={visible?"text":"password"} autoComplete={mode === "login"?"current-password":"new-password"} required minLength={mode === "login"?1:12} maxLength={128} value={password} onChange={e=>setPassword(e.target.value)} placeholder={mode === "login"?"Your password":"At least 12 characters"} className="w-full rounded-2xl border border-white/15 bg-white/[.055] px-4 py-4 pr-14 text-base text-white outline-none placeholder:text-white/30 focus:border-fuchsia-400"/><button type="button" aria-label={visible?"Hide password":"Show password"} onClick={()=>setVisible(!visible)} className="absolute right-4 top-1/2 -translate-y-1/2 text-white/55">{visible?<EyeOff size={19}/>:<Eye size={19}/>}</button></div></label>}
        {mode === "login" && <div className="text-right"><Link href="/forgot-password" className="text-xs text-fuchsia-300">Forgot password?</Link></div>}
        {error && <p role="alert" className="rounded-xl border border-red-400/30 bg-red-500/10 p-3 text-sm text-red-200">{error}</p>}
        {notice && <p role="status" className="rounded-xl border border-green-400/30 bg-green-500/10 p-3 text-sm text-green-200">{notice}</p>}
        <button disabled={busy || ((mode === "verify" || mode === "reset") && !token)} type="submit" className="flex w-full items-center justify-center gap-3 rounded-2xl bg-gradient-to-r from-[#ff487f] via-[#ed2e9d] to-[#a547f5] px-5 py-4 text-sm font-extrabold text-white shadow-[0_12px_40px_rgba(240,48,137,.24)] transition hover:brightness-110 disabled:opacity-50">{busy?"One moment...":{login:"Enter your space",signup:"Create my space",forgot:"Send reset link",reset:"Update password",verify:"Verify email"}[mode]}<ArrowRight size={17}/></button>
      </form>
      <div className="mt-8 flex items-center justify-center gap-2 text-sm text-white/55">{mode === "signup"?"Already have an account?":"Need a SEKRETLY account?"}<Link className="font-bold text-fuchsia-300" href={mode === "signup"?"/login":"/signup"}>{mode === "signup"?"Sign in":"Sign up"}</Link></div>
      <p className="mt-12 flex items-center justify-center gap-2 text-center text-xs text-white/35"><LockKeyhole size={13}/> Anonymous replies don't reveal sender identities.</p>
    </div>
  </main>;
}
