import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { verificationService } from "../services/verification.service";
import { PageHeader } from "../components/PageHeader";
import { VerifyResultCard } from "../components/VerifyResultCard";

const sha256Hex = async (file: File) => {
  const buffer = await file.arrayBuffer();
  const digest = await crypto.subtle.digest("SHA-256", buffer);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
};

export const VerifyPage = () => {
  const [file, setFile] = useState<File | null>(null);
  const [documentId, setDocumentId] = useState("");
  const [error, setError] = useState("");

  const mutation = useMutation({
    mutationFn: verificationService.verifyHash
  });

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      setError("Please choose a PDF file.");
      return;
    }
    if (file.type !== "application/pdf") {
      setError("Only PDF files are supported for verification.");
      return;
    }
    if (file.size === 0) {
      setError("Selected file is empty.");
      return;
    }
    setError("");
    void (async () => {
      try {
        const hash = await sha256Hex(file);
        mutation.mutate({ hash, documentId: documentId || undefined });
      } catch {
        setError("Failed to compute hash. Please try again.");
      }
    })();
  };

  return (
    <div className="space-y-4">
      <PageHeader
        title="Verify Document"
        description="Compute SHA-256 locally and compare with registered on-chain proof."
      />
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
          <p className="mt-1 text-xs text-slate-500">File is hashed locally in your browser and is not uploaded.</p>
        </div>
        {error ? <p className="text-sm text-rose-600">{error}</p> : null}
        {mutation.isError ? (
          <p className="text-sm text-rose-600">Verification failed. Please check file and try again.</p>
        ) : null}
        <button className="rounded-lg bg-slate-900 px-4 py-2 text-sm text-white">
          {mutation.isPending ? "Verifying..." : "Verify"}
        </button>
      </form>

      {mutation.data ? <VerifyResultCard data={mutation.data} /> : null}
    </div>
  );
};
