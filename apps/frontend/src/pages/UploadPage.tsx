import { useState } from "react";
import axios from "axios";
import { useMutation } from "@tanstack/react-query";
import { documentsService } from "../services/documents.service";
import { PageHeader } from "../components/PageHeader";
import { StatusBadge } from "../components/StatusBadge";

export const UploadPage = () => {
  const [documentCode, setDocumentCode] = useState("");
  const [documentType, setDocumentType] = useState("");
  const [institutionName, setInstitutionName] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [formError, setFormError] = useState("");
  const [serverError, setServerError] = useState("");
  const maxFileSizeMb = 10;

  const uploadMutation = useMutation({
    mutationFn: documentsService.uploadDocument,
    onError: (error) => {
      if (axios.isAxiosError(error)) {
        const data = error.response?.data as
          | {
              message?: string;
              details?: { fieldErrors?: Record<string, string[]> };
            }
          | undefined;
        const fieldErrors = data?.details?.fieldErrors;
        const firstField = fieldErrors ? Object.keys(fieldErrors)[0] : undefined;
        const firstMessage = firstField ? fieldErrors?.[firstField]?.[0] : undefined;
        setServerError(firstMessage || data?.message || "Upload failed. Please try again.");
        return;
      }
      setServerError("Upload failed. Please try again.");
    }
  });

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return setFormError("Please select a PDF file.");
    if (file.type !== "application/pdf") return setFormError("Only PDF files are allowed.");
    if (file.size === 0) return setFormError("Selected file is empty.");
    if (file.size > maxFileSizeMb * 1024 * 1024) {
      return setFormError(`File is too large. Max size is ${maxFileSizeMb}MB.`);
    }
    if (!documentCode || !documentType) return setFormError("Document code and type are required.");
    if (documentCode.trim().length < 2) return setFormError("Document code must be at least 2 characters.");
    if (documentType.trim().length < 2) return setFormError("Document type must be at least 2 characters.");
    if (institutionName && institutionName.trim().length < 2) {
      return setFormError("Institution name must be at least 2 characters.");
    }
    setFormError("");
    setServerError("");
    uploadMutation.mutate({ file, documentCode, documentType, institutionName: institutionName || undefined });
  };

  return (
    <div className="space-y-4">
      <PageHeader title="Upload / Register Document" description="Store file off-chain and hash proof on-chain." />
      <form onSubmit={onSubmit} className="space-y-4 rounded-xl border bg-white p-5">
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-medium">Document Code</label>
            <input className="w-full rounded-lg border px-3 py-2 text-sm" value={documentCode} onChange={(e) => setDocumentCode(e.target.value)} />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Document Type</label>
            <input className="w-full rounded-lg border px-3 py-2 text-sm" value={documentType} onChange={(e) => setDocumentType(e.target.value)} />
          </div>
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">Institution / Lab Name</label>
          <input className="w-full rounded-lg border px-3 py-2 text-sm" value={institutionName} onChange={(e) => setInstitutionName(e.target.value)} />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">PDF File</label>
          <input type="file" accept="application/pdf" onChange={(e) => setFile(e.target.files?.[0] || null)} />
        </div>
        {formError ? <p className="text-sm text-rose-600">{formError}</p> : null}
        {serverError ? <p className="text-sm text-rose-600">{serverError}</p> : null}
        <button className="rounded-lg bg-slate-900 px-4 py-2 text-sm text-white" disabled={uploadMutation.isPending}>
          {uploadMutation.isPending ? "Registering..." : "Register Document"}
        </button>
      </form>

      {uploadMutation.data ? (
        <div className="rounded-xl border bg-white p-5">
          <h3 className="text-lg font-semibold">Registration Success</h3>
          <div className="mt-3 space-y-1 text-sm text-slate-700">
            <p>
              <span className="font-medium">Document ID:</span> {uploadMutation.data.id}
            </p>
            <p>
              <span className="font-medium">Transaction Hash:</span> {uploadMutation.data.txHash || "-"}
            </p>
            <p className="flex items-center gap-2">
              <span className="font-medium">Status:</span> <StatusBadge status={uploadMutation.data.status} />
            </p>
          </div>
        </div>
      ) : null}
    </div>
  );
};
