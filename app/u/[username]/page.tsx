import { FoundationPage } from "@/components/layout/FoundationPage";
export default async function PublicProfilePage({ params }: { params: Promise<{ username: string }> }) { const { username } = await params; return <FoundationPage title={`@${username}`} description="Public profile interactions will render here." />; }
