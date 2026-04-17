import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { documentsService } from "../services/documents.service";
import { StatCard } from "../components/StatCard";
import { PageHeader } from "../components/PageHeader";
import { DocumentsTable } from "../components/DocumentsTable";
import { LoadingState } from "../components/LoadingState";

export const DashboardPage = () => {
  const { data, isLoading } = useQuery({
    queryKey: ["dashboard-documents"],
    queryFn: () => documentsService.listDocuments({ limit: 20, page: 1 })
  });

  const stats = useMemo(() => {
    const items = data?.items ?? [];
    return {
      total: items.length,
      active: items.filter((x) => x.status === "active").length,
      revoked: items.filter((x) => x.status === "revoked").length
    };
  }, [data?.items]);

  return (
    <div className="space-y-4">
      <PageHeader title="Dashboard" description="Overview of registered lab reports and integrity status." />

      <div className="grid gap-4 md:grid-cols-3">
        <StatCard title="Total Documents" value={stats.total} />
        <StatCard title="Active Documents" value={stats.active} />
        <StatCard title="Revoked Documents" value={stats.revoked} />
      </div>

      {isLoading ? <LoadingState /> : <DocumentsTable items={data?.items ?? []} />}
    </div>
  );
};
