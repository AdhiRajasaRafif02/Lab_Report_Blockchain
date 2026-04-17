import { Link } from "react-router-dom";
import type { DocumentItem } from "../types/api";
import { StatusBadge } from "./StatusBadge";

export const DocumentsTable = ({ items }: { items: DocumentItem[] }) => {
  return (
    <div className="overflow-hidden rounded-xl border bg-white">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50">
            <tr>
              {["Code", "File", "Type", "Uploader", "Status", "Actions"].map((head) => (
                <th key={head} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                  {head}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {items.map((doc) => (
              <tr key={doc.id} className="text-sm">
                <td className="px-4 py-3 font-medium text-slate-800">{doc.documentCode}</td>
                <td className="px-4 py-3 text-slate-700">{doc.fileName}</td>
                <td className="px-4 py-3 text-slate-700">{doc.documentType}</td>
                <td className="px-4 py-3 text-slate-700">{doc.uploadedBy.fullName}</td>
                <td className="px-4 py-3">
                  <StatusBadge status={doc.status} />
                </td>
                <td className="px-4 py-3">
                  <Link className="text-indigo-600 hover:underline" to={`/documents/${doc.id}`}>
                    View
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
