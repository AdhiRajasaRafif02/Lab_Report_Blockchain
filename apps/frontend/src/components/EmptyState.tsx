export const EmptyState = ({ title, subtitle }: { title: string; subtitle?: string }) => {
  return (
    <div className="rounded-xl border bg-white p-8 text-center">
      <p className="text-base font-semibold text-slate-700">{title}</p>
      {subtitle ? <p className="mt-2 text-sm text-slate-500">{subtitle}</p> : null}
    </div>
  );
};
