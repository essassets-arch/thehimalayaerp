import { redirect } from "next/navigation";

export default async function LegacyQCPage({ params }: { params: Promise<{ slug?: string[] }> }) {
  const resolvedParams = await params;
  const slug = resolvedParams?.slug?.[0] || 'pending';

  const routeMap: Record<string, string> = {
    pending: "/production/qc-pending",
    history: "/production/completed",
  };

  redirect(routeMap[slug] || "/production/qc-pending");
}
