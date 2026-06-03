import { useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { CalendarClock, MapPin, UsersRound } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Alert } from '@/components/ui/Alert';
import { EmptyState } from '@/components/ui/EmptyState';
import { LoadingState } from '@/components/ui/LoadingState';
import { RideRequestStatusBadge } from '@/features/rides/components/RideRequestStatusBadge';
import { formatDateTime } from '@/features/rides/formatters';
import { getApiErrorMessage } from '@/lib/api/errors';
import { getMyRideRequests } from '@/lib/api/rides';
import type { PassengerRideRequest } from '@/types/api';

export function MyRequestsPage() {
  const [requests, setRequests] = useState<PassengerRideRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function loadRequests() {
      setIsLoading(true);
      setError(null);

      try {
        const response = await getMyRideRequests();
        if (isMounted) {
          setRequests(response);
        }
      } catch (loadError) {
        if (isMounted) {
          setError(getApiErrorMessage(loadError));
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    void loadRequests();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <section>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-medium text-utsc-teal">Passenger dashboard</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">My requests</h1>
          <p className="mt-2 text-sm text-slate-600">Track the rides you have requested and open details for each trip.</p>
        </div>
        <Link to="/rides" className="rounded-md bg-utsc-teal px-4 py-2 text-sm font-semibold text-white transition hover:bg-teal-700">
          Find rides
        </Link>
      </div>

      <div className="mt-6 grid gap-4">
        {isLoading ? <LoadingState label="Loading your requests" /> : null}
        {error ? <Alert message={error} /> : null}
        {!isLoading && !error && requests.length === 0 ? (
          <EmptyState
            title="You have not requested any rides"
            message="Browse available rides and request a seat when a trip works for you."
            action={
              <Link to="/rides" className="rounded-md bg-utsc-teal px-4 py-2 text-sm font-semibold text-white">
                Find rides
              </Link>
            }
          />
        ) : null}
        {!isLoading && requests.length > 0 ? (
          <div className="grid gap-4 lg:grid-cols-2">
            {requests.map((request) => (
              <article key={request.id} className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <p className="text-sm font-medium text-utsc-teal">Ride request</p>
                    <h2 className="mt-2 text-lg font-semibold text-slate-950">
                      {request.rideOrigin} to {request.rideDestination}
                    </h2>
                  </div>
                  <RideRequestStatusBadge status={request.status} />
                </div>

                <div className="mt-5 grid gap-3 text-sm text-slate-600 sm:grid-cols-3">
                  <Info icon={<MapPin className="h-4 w-4" />} label={`${request.rideOrigin} -> ${request.rideDestination}`} />
                  <Info icon={<CalendarClock className="h-4 w-4" />} label={formatDateTime(request.rideDepartureTime)} />
                  <Info icon={<UsersRound className="h-4 w-4" />} label={`${request.rideAvailableSeats} seats available`} />
                </div>

                <div className="mt-5">
                  <Link
                    to={`/rides/${request.rideId}`}
                    className="inline-flex rounded-md border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                  >
                    View ride details
                  </Link>
                </div>
              </article>
            ))}
          </div>
        ) : null}
      </div>
    </section>
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
