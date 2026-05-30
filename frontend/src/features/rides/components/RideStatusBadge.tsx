import type { Ride } from '@/types/api';
import { getRideStatus, getRideStatusLabel, type RideStatus } from '@/features/rides/rideStatus';

type RideStatusBadgeProps = {
  ride: Pick<Ride, 'availableSeats' | 'currentUserRequestStatus'>;
};

const styles: Record<RideStatus, string> = {
  available: 'border-emerald-200 bg-emerald-50 text-emerald-700',
  'nearly-full': 'border-amber-200 bg-amber-50 text-amber-700',
  full: 'border-rose-200 bg-rose-50 text-rose-700',
  requested: 'border-sky-200 bg-sky-50 text-sky-700'
};

export function RideStatusBadge({ ride }: RideStatusBadgeProps) {
  const status = getRideStatus(ride);

  return (
    <span className={`inline-flex w-fit rounded-full border px-2.5 py-1 text-xs font-semibold ${styles[status]}`}>
      {getRideStatusLabel(status, ride.availableSeats)}
    </span>
  );
}
