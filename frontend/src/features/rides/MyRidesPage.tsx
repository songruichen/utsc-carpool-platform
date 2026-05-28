import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Alert } from '@/components/ui/Alert';
import { EmptyState } from '@/components/ui/EmptyState';
import { LoadingState } from '@/components/ui/LoadingState';
import { useAuth } from '@/features/auth/useAuth';
import { RideCard } from '@/features/rides/components/RideCard';
import { getApiErrorMessage } from '@/lib/api/errors';
import { getRides } from '@/lib/api/rides';
import type { Ride } from '@/types/api';

export function MyRidesPage() {
  const { user } = useAuth();
  const [rides, setRides] = useState<Ride[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function loadRides() {
      setIsLoading(true);
      setError(null);

      try {
        const response = await getRides(0, 50);
        if (isMounted) {
          setRides(response.content);
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

    void loadRides();

    return () => {
      isMounted = false;
    };
  }, []);

  const myRides = useMemo(() => rides.filter((ride) => ride.driverId === user?.id), [rides, user?.id]);

  return (
    <section>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-medium text-utsc-teal">Driver dashboard</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">My rides</h1>
          <p className="mt-2 text-sm text-slate-600">Review the rides you have posted and open details to see seat requests.</p>
        </div>
        <Link to="/rides/new" className="rounded-md bg-utsc-teal px-4 py-2 text-sm font-semibold text-white transition hover:bg-teal-700">
          Post a ride
        </Link>
      </div>

      <div className="mt-6">
        {isLoading ? <LoadingState label="Loading your rides" /> : null}
        {error ? <Alert message={error} /> : null}
        {!isLoading && !error && myRides.length === 0 ? (
          <EmptyState
            title="You have not posted any rides"
            message="Post a ride when you are driving from campus or heading toward UTSC."
            action={
              <Link to="/rides/new" className="rounded-md bg-utsc-teal px-4 py-2 text-sm font-semibold text-white">
                Post a ride
              </Link>
            }
          />
        ) : null}
        {!isLoading && myRides.length > 0 ? (
          <div className="grid gap-4 lg:grid-cols-2">
            {myRides.map((ride) => (
              <RideCard key={ride.id} ride={ride} />
            ))}
          </div>
        ) : null}
      </div>
    </section>
  );
}
