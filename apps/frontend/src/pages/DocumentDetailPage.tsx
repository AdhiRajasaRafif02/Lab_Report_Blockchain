import { useQuery } from "@tanstack/react-query";
import { useParams } from "react-router-dom";
import axios from "axios";
import { useState } from "react";
import { documentsService } from "../services/documents.service";
import { auditService } from "../services/audit.service";
import { LoadingState } from "../components/LoadingState";
import { EmptyState } from "../components/EmptyState";
import { StatusBadge } from "../components/StatusBadge";
import { AuditTimeline } from "../components/AuditTimeline";
import { PageHeader } from "../components/PageHeader";
import { useAuth } from "../hooks/useAuth";

export const DocumentDetailPage = () => {
  const { id } = useParams();
  const [fileError, setFileError] = useState("");
  const [isOpeningFile, setIsOpeningFile] = useState(false);
  const { hasRole } = useAuth();

  const documentQuery = useQuery({
    queryKey: ["document-detail", id],
    queryFn: () => documentsService.getDocumentById(id || ""),
    enabled: !!id,
    retry: false,
    refetchOnWindowFocus: false
  });
  const auditQuery = useQuery({
    queryKey: ["document-audit", id],
    queryFn: () => auditService.getDocumentAuditHistory(id || ""),
    enabled: !!id
  });

  const getErrorMessage = (error: unknown) => {
    if (axios.isAxiosError(error)) {
      const data = error.response?.data as
        | { message?: string; details?: { cause?: string } | null }
        | undefined;
      return data?.details?.cause || data?.message || error.message;
    }
    if (error instanceof Error) return error.message;
    return "Unknown error";
  };

  if (documentQuery.isLoading) return <LoadingState label="Loading document detail..." />;

  if (documentQuery.isError) {
    return <EmptyState title="Failed to load document." subtitle={getErrorMessage(documentQuery.error)} />;
  }

  if (!documentQuery.data) {
    return <EmptyState title="Document not found." />;
  }

  const data = documentQuery.data;

  const onOpenPdf = async () => {
    if (!id) return;
    setFileError("");
    setIsOpeningFile(true);
    try {
      const blob = await documentsService.getDocumentFile(id);
      const url = URL.createObjectURL(blob);
      window.open(url, "_blank", "noopener,noreferrer");
      window.setTimeout(() => URL.revokeObjectURL(url), 60_000);
    } catch (error) {
      setFileError(getErrorMessage(error));
    } finally {
      setIsOpeningFile(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <PageHeader title={`Document ${data.documentCode}`} description="Off-chain metadata + on-chain integrity proof." />
        {hasRole(["admin", "lab_staff"]) ? (
          <div className="flex flex-col items-start gap-2">
            <button
              className="rounded-lg bg-slate-900 px-4 py-2 text-sm text-white disabled:opacity-60"
              onClick={onOpenPdf}
              disabled={isOpeningFile}
            >
              {isOpeningFile ? "Opening..." : "View PDF"}
            </button>
            {fileError ? <p className="text-sm text-rose-600">{fileError}</p> : null}
          </div>
        ) : null}
      </div>

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
