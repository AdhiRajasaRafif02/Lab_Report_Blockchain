import type { DocumentStatus, VerifyResult } from "../types/api";

type Props = {
  status: DocumentStatus | VerifyResult;
};

const classes: Record<string, string> = {
  active: "bg-emerald-50 text-emerald-700 border-emerald-200",
  revoked: "bg-rose-50 text-rose-700 border-rose-200",
  authentic: "bg-emerald-50 text-emerald-700 border-emerald-200",
  tampered: "bg-amber-50 text-amber-700 border-amber-200",
  not_found: "bg-slate-100 text-slate-700 border-slate-300"
};

export const StatusBadge = ({ status }: Props) => {
  return (
    <span className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold ${classes[status]}`}>
      {status.replace("_", " ").toUpperCase()}
    </span>
  );
};
