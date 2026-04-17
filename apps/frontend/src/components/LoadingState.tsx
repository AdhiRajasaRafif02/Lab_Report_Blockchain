export const LoadingState = ({ label = "Loading..." }: { label?: string }) => {
  return <div className="rounded-xl border bg-white p-6 text-sm text-slate-600">{label}</div>;
};
