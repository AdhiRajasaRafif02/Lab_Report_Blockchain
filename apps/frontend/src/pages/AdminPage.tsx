import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { documentsService } from "../services/documents.service";
import { revocationService } from "../services/revocation.service";
import { PageHeader } from "../components/PageHeader";
import { StatusBadge } from "../components/StatusBadge";

export const AdminPage = () => {
  const qc = useQueryClient();
  const [selectedDocumentId, setSelectedDocumentId] = useState("");
  const [reason, setReason] = useState("");
  const [error, setError] = useState("");

  const activeDocumentsQuery = useQuery({
    queryKey: ["admin-active-docs"],
    queryFn: () => documentsService.listDocuments({ status: "active", limit: 100 })
  });

  const revokedDocumentsQuery = useQuery({
    queryKey: ["admin-revoked-docs"],
    queryFn: () => documentsService.listDocuments({ status: "revoked", limit: 100 })
  });

  const revokeMutation = useMutation({
    mutationFn: ({ documentId, reasonText }: { documentId: string; reasonText: string }) =>
      revocationService.revokeDocument(documentId, reasonText),
    onSuccess: async () => {
      setReason("");
      await qc.invalidateQueries({ queryKey: ["admin-active-docs"] });
      await qc.invalidateQueries({ queryKey: ["admin-revoked-docs"] });
    }
  });

  const onRevoke = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDocumentId) return setError("Select a document.");
    if (reason.trim().length < 5) return setError("Revocation reason must be at least 5 characters.");
    setError("");
    revokeMutation.mutate({ documentId: selectedDocumentId, reasonText: reason.trim() });
  };

  return (
    <div className="space-y-4">
      <PageHeader title="Admin / Revocation" description="Revoke documents and review revoked records." />

      <form onSubmit={onRevoke} className="space-y-4 rounded-xl border bg-white p-5">
        <div>
          <label className="mb-1 block text-sm font-medium">Select Active Document</label>
          <select
            className="w-full rounded-lg border px-3 py-2 text-sm"
            value={selectedDocumentId}
            onChange={(e) => setSelectedDocumentId(e.target.value)}
          >
            <option value="">-- Select --</option>
            {(activeDocumentsQuery.data?.items || []).map((doc) => (
              <option key={doc.id} value={doc.id}>
                {doc.documentCode} - {doc.fileName}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium">Revocation Reason</label>
          <textarea
            className="w-full rounded-lg border px-3 py-2 text-sm"
            rows={4}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
          />
        </div>
        {error ? <p className="text-sm text-rose-600">{error}</p> : null}
        <button className="rounded-lg bg-rose-600 px-4 py-2 text-sm text-white">
          {revokeMutation.isPending ? "Revoking..." : "Revoke Document"}
        </button>
      </form>

      <div className="rounded-xl border bg-white p-5">
        <h3 className="text-lg font-semibold">Revoked Records</h3>
        <div className="mt-3 space-y-2">
          {(revokedDocumentsQuery.data?.items || []).map((doc) => (
            <div key={doc.id} className="rounded-lg border border-slate-200 p-3 text-sm">
              <div className="flex items-center justify-between">
                <span className="font-medium">{doc.documentCode}</span>
                <StatusBadge status={doc.status} />
              </div>
              <p className="text-slate-600">{doc.fileName}</p>
              <p className="text-xs text-slate-500">Tx Hash: {doc.txHash || "-"}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
