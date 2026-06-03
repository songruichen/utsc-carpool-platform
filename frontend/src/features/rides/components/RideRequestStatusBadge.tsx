import type { RideRequestStatus } from '@/types/api';

type RideRequestStatusBadgeProps = {
  status: RideRequestStatus;
};

const styles: Record<RideRequestStatus, string> = {
  PENDING: 'border-amber-200 bg-amber-50 text-amber-700',
  ACCEPTED: 'border-emerald-200 bg-emerald-50 text-emerald-700',
  REJECTED: 'border-red-200 bg-red-50 text-red-700',
  CANCELLED: 'border-slate-200 bg-slate-100 text-slate-700',
};

export function RideRequestStatusBadge({ status }: RideRequestStatusBadgeProps) {
  return (
    <span className={`inline-flex w-fit rounded-full border px-2.5 py-1 text-xs font-semibold ${styles[status]}`}>
      {status}
    </span>
  );
}
