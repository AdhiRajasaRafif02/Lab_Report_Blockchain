import type { AuditTrail } from "../types/api";

export const AuditTimeline = ({ items }: { items: AuditTrail[] }) => {
  return (
    <div className="rounded-xl border bg-white p-5">
      <h3 className="text-lg font-semibold text-slate-900">Audit Trail</h3>
      <div className="mt-4 space-y-3">
        {items.length === 0 ? (
          <p className="text-sm text-slate-500">No audit events yet.</p>
        ) : (
          items.map((item) => (
            <div key={item.id} className="rounded-lg border border-slate-200 p-3">
              <p className="text-sm font-semibold text-slate-800">{item.action}</p>
              <p className="text-xs text-slate-500">{new Date(item.createdAt).toLocaleString()}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
