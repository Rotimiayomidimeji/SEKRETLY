import { FoundationPage } from "@/components/layout/FoundationPage";
export default async function CreateTypePage({ params }: { params: Promise<{ type: string }> }) { const { type } = await params; return <FoundationPage title={`Create a ${type.replaceAll("-", " ")}.`} description="This route is powered by the shared interaction configuration and will connect to the composer in Phase 2." />; }
