import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";
export function Button({ className, ...props }: ButtonHTMLAttributes<HTMLButtonElement>) { return <button className={cn("inline-flex items-center justify-center rounded-full bg-white px-5 py-3 text-sm font-bold text-black transition-transform hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-offset-2", className)} {...props} />; }
