import type { Metadata } from "next";

import Receipt from "@/components/sk/Receipt";
import { decideGuess, lookupReceipts, sendFollowUp } from "@/features/mystery/actions";
import { RECEIPT_INCLUDE, receiptView } from "@/features/mystery/queries";
import { getCurrentUser } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { getMode } from "@/lib/sk/mode";

export const metadata: Metadata = { title: "Sekretly · Your receipts" };

// Open to everyone: anonymous senders check codes saved on their phone; members also see what they sent from their account.
export default async function ReceiptPage({ searchParams }: PageProps<"/receipt">) {
  const { m } = await searchParams;
  const user = await getCurrentUser();
  const mine = user
    ? (await db.message.findMany({ where: { senderId: user.id }, orderBy: { createdAt: "desc" }, take: 30, include: RECEIPT_INCLUDE })).map(receiptView)
    : [];
  return (
    <Receipt
      mode={await getMode()}
      receipts={mine}
      focusId={typeof m === "string" ? m : null}
      lookup={lookupReceipts}
      decideGuess={decideGuess}
      sendFollowUp={sendFollowUp}
    />
  );
}
