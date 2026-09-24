import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";
export function IconButton({ className, ...props }: ButtonHTMLAttributes<HTMLButtonElement>) { return <button className={cn("grid size-10 place-items-center rounded-full border border-white/15 bg-white/5 text-white transition-colors hover:bg-white/10 focus-visible:outline-2", className)} {...props} />; }
