export const StatCard = ({
  title,
  value,
  subtitle
}: {
  title: string;
  value: string | number;
  subtitle?: string;
}) => {
  return (
    <div className="rounded-xl border bg-white p-4">
      <p className="text-sm text-slate-500">{title}</p>
      <p className="mt-1 text-2xl font-semibold text-slate-900">{value}</p>
      {subtitle ? <p className="mt-1 text-xs text-slate-500">{subtitle}</p> : null}
    </div>
  );
};
