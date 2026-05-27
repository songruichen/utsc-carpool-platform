import type { ReactNode } from 'react';
import { CalendarClock, MapPin, UsersRound } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { Ride } from '@/types/api';
import { formatDateTime, formatMoney } from '@/features/rides/formatters';

type RideCardProps = {
  ride: Ride;
  action?: ReactNode;
};

export function RideCard({ ride, action }: RideCardProps) {
  return (
    <article className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm transition hover:border-slate-300">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-sm font-medium text-utsc-teal">{ride.driverName}</p>
          <h2 className="mt-2 text-lg font-semibold text-slate-950">
            <Link to={`/rides/${ride.id}`} className="hover:text-utsc-teal">
              {ride.origin} to {ride.destination}
            </Link>
          </h2>
        </div>
        <div className="text-left sm:text-right">
          <p className="text-xl font-semibold text-slate-950">{formatMoney(ride.price)}</p>
          <p className="text-xs text-slate-500">per seat</p>
        </div>
      </div>

      <div className="mt-5 grid gap-3 text-sm text-slate-600 sm:grid-cols-3">
        <Info icon={<MapPin className="h-4 w-4" />} label={`${ride.origin} -> ${ride.destination}`} />
        <Info icon={<CalendarClock className="h-4 w-4" />} label={formatDateTime(ride.departureTime)} />
        <Info icon={<UsersRound className="h-4 w-4" />} label={`${ride.availableSeats} seats open`} />
      </div>

      {ride.notes ? <p className="mt-4 line-clamp-2 text-sm text-slate-600">{ride.notes}</p> : null}

      <div className="mt-5 flex flex-wrap gap-3">
        <Link
          to={`/rides/${ride.id}`}
          className="rounded-md border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
        >
          View details
        </Link>
        {action}
      </div>
    </article>
  );
}

type InfoProps = {
  icon: ReactNode;
  label: string;
};

function Info({ icon, label }: InfoProps) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-slate-400">{icon}</span>
      <span>{label}</span>
    </div>
  );
}
