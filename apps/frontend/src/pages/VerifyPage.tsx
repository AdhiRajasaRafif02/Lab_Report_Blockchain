import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { verificationService } from "../services/verification.service";
import { PageHeader } from "../components/PageHeader";
import { VerifyResultCard } from "../components/VerifyResultCard";

export const VerifyPage = () => {
  const [file, setFile] = useState<File | null>(null);
  const [documentId, setDocumentId] = useState("");
  const [error, setError] = useState("");

  const mutation = useMutation({
    mutationFn: verificationService.verifyDocument
  });

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      setError("Please choose a PDF file.");
      return;
    }
    setError("");
    mutation.mutate({ file, documentId: documentId || undefined });
  };

  return (
    <div className="space-y-4">
      <PageHeader title="Verify Document" description="Check whether uploaded file hash matches registered on-chain proof." />
      <form onSubmit={onSubmit} className="space-y-4 rounded-xl border bg-white p-5">
        <div>
          <label className="mb-1 block text-sm font-medium">Optional Expected Document ID</label>
          <input
            className="w-full rounded-lg border px-3 py-2 text-sm"
            value={documentId}
            onChange={(e) => setDocumentId(e.target.value)}
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">PDF File</label>
          <input type="file" accept="application/pdf" onChange={(e) => setFile(e.target.files?.[0] || null)} />
        </div>
        {error ? <p className="text-sm text-rose-600">{error}</p> : null}
        <button className="rounded-lg bg-slate-900 px-4 py-2 text-sm text-white">
          {mutation.isPending ? "Verifying..." : "Verify"}
        </button>
      </form>

      {mutation.data ? <VerifyResultCard data={mutation.data} /> : null}
    </div>
  );
};
