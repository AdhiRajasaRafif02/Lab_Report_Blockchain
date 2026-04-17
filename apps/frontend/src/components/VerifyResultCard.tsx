import type { VerifyResponse } from "../types/api";
import { StatusBadge } from "./StatusBadge";

export const VerifyResultCard = ({ data }: { data: VerifyResponse }) => {
  return (
    <div className="rounded-xl border bg-white p-5">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-slate-900">Verification Result</h3>
        <StatusBadge status={data.result} />
      </div>
      <div className="mt-4 grid gap-2 text-sm text-slate-700">
        <p>
          <span className="font-medium">Computed Hash:</span> {data.verification.computedHash}
        </p>
        <p>
          <span className="font-medium">Matched Document ID:</span> {data.onChain?.documentId || "-"}
        </p>
        <p>
          <span className="font-medium">On-chain Revoked:</span> {String(data.onChain?.isRevoked ?? false)}
        </p>
      </div>
    </div>
  );
};
