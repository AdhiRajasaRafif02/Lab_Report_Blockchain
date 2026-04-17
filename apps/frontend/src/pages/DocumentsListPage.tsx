import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { documentsService } from "../services/documents.service";
import { DocumentsTable } from "../components/DocumentsTable";
import { EmptyState } from "../components/EmptyState";
import { LoadingState } from "../components/LoadingState";
import { PageHeader } from "../components/PageHeader";

export const DocumentsListPage = () => {
  const [status, setStatus] = useState<string>("");
  const [search, setSearch] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["documents", status],
    queryFn: () => documentsService.listDocuments({ status: status || undefined, limit: 100 })
  });

  const filtered = useMemo(() => {
    const items = data?.items ?? [];
    if (!search.trim()) return items;
    const q = search.toLowerCase();
    return items.filter(
      (x) =>
        x.documentCode.toLowerCase().includes(q) ||
        x.fileName.toLowerCase().includes(q) ||
        x.documentType.toLowerCase().includes(q)
    );
  }, [data?.items, search]);

  return (
    <div className="space-y-4">
      <PageHeader title="Documents List" description="Search and filter registered documents." />

      <div className="rounded-xl border bg-white p-4">
        <div className="grid gap-3 md:grid-cols-3">
          <input
            className="rounded-lg border px-3 py-2 text-sm"
            placeholder="Search by code, file, type..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <select
            className="rounded-lg border px-3 py-2 text-sm"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
          >
            <option value="">All status</option>
            <option value="active">Active</option>
            <option value="revoked">Revoked</option>
          </select>
        </div>
      </div>

      {isLoading ? (
        <LoadingState />
      ) : filtered.length === 0 ? (
        <EmptyState title="No documents found." subtitle="Try adjusting search/filter criteria." />
      ) : (
        <DocumentsTable items={filtered} />
      )}
    </div>
  );
};
