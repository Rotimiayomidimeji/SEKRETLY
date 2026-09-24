import type { TextareaHTMLAttributes } from "react";
export function Textarea(props: TextareaHTMLAttributes<HTMLTextAreaElement>) { return <textarea className="min-h-32 w-full resize-y rounded-xl border border-white/10 bg-white/[.06] px-4 py-3 text-sm text-white outline-none placeholder:text-white/35 focus:border-[var(--purple)]" {...props} />; }
