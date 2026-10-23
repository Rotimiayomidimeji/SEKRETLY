import { z } from "zod";

// The same rules the sign-up screen shows while typing.
export const AVATARS = ["fox", "panda", "frog", "octopus", "unicorn", "koala"] as const;
export const MIN_AGE = 16;

export const usernameSchema = z
  .string()
  .trim()
  .regex(/^[A-Za-z0-9_]{3,20}$/, "Use 3–20 letters, numbers or _ only")
  .transform((u) => u.toLowerCase());

export const passwordSchema = z.string().min(8, "At least 8 characters").max(128, "At most 128 characters");

/** Whole years between a YYYY-MM-DD birth date and today. */
export function ageOn(birth: string, today = new Date()) {
  const b = new Date(birth + "T00:00:00Z");
  let age = today.getUTCFullYear() - b.getUTCFullYear();
  const m = today.getUTCMonth() - b.getUTCMonth();
  if (m < 0 || (m === 0 && today.getUTCDate() < b.getUTCDate())) age--;
  return age;
}

export const signupSchema = z.object({
  username: usernameSchema,
  password: passwordSchema,
  birthDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Enter your date of birth")
    .refine((d) => !Number.isNaN(Date.parse(d)) && ageOn(d) < 120, "Enter your date of birth")
    .refine((d) => ageOn(d) >= MIN_AGE, "Sekretly is for people 16 and older."),
  avatar: z.enum(AVATARS).catch("fox"),
  email: z
    .string()
    .trim()
    .max(254)
    .optional()
    .transform((e) => (e ? e.toLowerCase() : undefined))
    .refine((e) => !e || z.email().safeParse(e).success, "Enter a valid email"),
  acceptedTerms: z.literal(true, { error: "Accept the Terms to continue" }),
});

export type SignupInput = z.input<typeof signupSchema>;

/** "peach@gmail.com" -> "p•••••@gmail.com" */
export function maskEmail(email: string) {
  const at = email.indexOf("@");
  return at > 0 ? email[0] + "•••••" + email.slice(at) : email;
}
