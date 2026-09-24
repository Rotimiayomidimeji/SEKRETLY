import type { InputHTMLAttributes } from "react";
export function Input(props: InputHTMLAttributes<HTMLInputElement>) { return <input className="w-full rounded-xl border border-white/10 bg-white/[.06] px-4 py-3 text-sm text-white outline-none placeholder:text-white/35 focus:border-[var(--purple)]" {...props} />; }
