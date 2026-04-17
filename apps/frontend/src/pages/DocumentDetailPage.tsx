import { useQuery } from "@tanstack/react-query";
import { useParams } from "react-router-dom";
import { documentsService } from "../services/documents.service";
import { auditService } from "../services/audit.service";
import { LoadingState } from "../components/LoadingState";
import { StatusBadge } from "../components/StatusBadge";
import { AuditTimeline } from "../components/AuditTimeline";
import { PageHeader } from "../components/PageHeader";

export const DocumentDetailPage = () => {
  const { id } = useParams();
  const { data, isLoading } = useQuery({
    queryKey: ["document-detail", id],
    queryFn: () => documentsService.getDocumentById(id || ""),
    enabled: !!id
  });
  const auditQuery = useQuery({
    queryKey: ["document-audit", id],
    queryFn: () => auditService.getDocumentAuditHistory(id || ""),
    enabled: !!id
  });

  if (isLoading || !data) return <LoadingState label="Loading document detail..." />;

  return (
    <div className="space-y-4">
      <PageHeader title={`Document ${data.documentCode}`} description="Off-chain metadata + on-chain integrity proof." />

      <div className="rounded-xl border bg-white p-5">
        <div className="grid gap-2 text-sm text-slate-700">
          <p>
            <span className="font-medium">File Name:</span> {data.fileName}
          </p>
          <p>
            <span className="font-medium">Document Type:</span> {data.documentType}
          </p>
          <p>
            <span className="font-medium">Institution:</span> {data.institutionName || "-"}
          </p>
          <p>
            <span className="font-medium">Hash:</span> {data.fileHash}
          </p>
          <p>
            <span className="font-medium">Blockchain Tx Hash:</span> {data.txHash || "-"}
          </p>
          <p className="flex items-center gap-2">
            <span className="font-medium">Status:</span> <StatusBadge status={data.status} />
          </p>
        </div>
      </div>

      <AuditTimeline items={auditQuery.data || data.auditTrails || []} />
    </div>
  );
};
