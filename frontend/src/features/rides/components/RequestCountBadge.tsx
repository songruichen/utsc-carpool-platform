type RequestCountBadgeProps = {
  count?: number;
};

export function RequestCountBadge({ count }: RequestCountBadgeProps) {
  if (!count || count <= 0) {
    return null;
  }

  return (
    <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-medium text-slate-500">
      {count} {count === 1 ? 'request' : 'requests'}
    </span>
  );
}
