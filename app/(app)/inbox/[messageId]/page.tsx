import { FoundationPage } from "@/components/layout/FoundationPage";
export default async function MessagePage({ params }: { params: Promise<{ messageId: string }> }) { const { messageId } = await params; return <FoundationPage title="A secret message." description={`Message ${messageId} will render with private reply and moderation actions in Phase 2.`} />; }
