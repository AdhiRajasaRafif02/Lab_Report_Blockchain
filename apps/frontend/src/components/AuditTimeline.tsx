import type { AuditTrail } from "../types/api";

const labelMap: Record<AuditTrail["action"], string> = {
  DOCUMENT_UPLOADED: "Document Uploaded",
  DOCUMENT_REGISTERED_ON_CHAIN: "Registered On-chain",
  DOCUMENT_VIEWED: "Document Viewed",
  DOCUMENT_VERIFICATION_ATTEMPTED: "Verification Attempted",
  DOCUMENT_REVOKED: "Document Revoked"
};

export const AuditTimeline = ({ items }: { items: AuditTrail[] }) => {
  return (
    <div className="rounded-xl border bg-white p-5">
      <h3 className="text-lg font-semibold text-slate-900">Audit Trail (Provenance & Traceability)</h3>
      <div className="mt-4 space-y-3">
        {items.length === 0 ? (
          <p className="text-sm text-slate-500">No audit events yet.</p>
        ) : (
          items.map((item) => (
            <div key={item.id} className="rounded-lg border border-slate-200 p-3">
              <p className="text-sm font-semibold text-slate-800">{labelMap[item.action]}</p>
              <p className="text-xs text-slate-600">
                Actor: {item.actor?.fullName || item.actor?.email || item.actorUserId || "system"}
              </p>
              {item.metadataSnapshot ? (
                <pre className="mt-2 overflow-x-auto rounded bg-slate-50 p-2 text-xs text-slate-600">
                  {JSON.stringify(item.metadataSnapshot, null, 2)}
                </pre>
              ) : null}
              <p className="text-xs text-slate-500">{new Date(item.createdAt).toLocaleString()}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
