import { redirect } from "next/navigation";

export default async function LegacyQCPage({ params }) {
  const resolvedParams = await params;
  const slug = resolvedParams?.slug?.[0];

  const routeMap = {
    pending: "/production/qc-pending",
    history: "/production/qc-history",
  };

  redirect(routeMap[slug] || "/production/qc-pending");
}
