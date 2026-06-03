import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Alert } from '@/components/ui/Alert';
import { EmptyState } from '@/components/ui/EmptyState';
import { LoadingState } from '@/components/ui/LoadingState';
import { RideCard } from '@/features/rides/components/RideCard';
import { hasRequestedRide } from '@/features/rides/rideStatus';
import { useAuth } from '@/features/auth/useAuth';
import { getApiErrorMessage } from '@/lib/api/errors';
import { getRides, requestRide } from '@/lib/api/rides';
import type { Ride } from '@/types/api';

type RideSortOption = 'newest' | 'price-asc' | 'price-desc' | 'departure-time' | 'available-seats';

const rideSortOptions: Array<{ value: RideSortOption; label: string }> = [
  { value: 'newest', label: 'Newest' },
  { value: 'price-asc', label: 'Price (Low to High)' },
  { value: 'price-desc', label: 'Price (High to Low)' },
  { value: 'departure-time', label: 'Departure Time' },
  { value: 'available-seats', label: 'Available Seats' },
];

export function RideListPage() {
  const { user } = useAuth();
  const [rides, setRides] = useState<Ride[]>([]);
  const [sortOption, setSortOption] = useState<RideSortOption>('newest');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [requestingRideId, setRequestingRideId] = useState<string | null>(null);
  const [requestMessage, setRequestMessage] = useState<string | null>(null);
  const sortedRides = useMemo(() => sortRides(rides, sortOption), [rides, sortOption]);

  useEffect(() => {
    let isMounted = true;

    async function loadRides() {
      setIsLoading(true);
      setError(null);

      try {
        const response = await getRides(0, 30);
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

  async function handleRequestRide(ride: Ride) {
    setRequestingRideId(ride.id);
    setRequestMessage(null);
    setError(null);

    try {
      const request = await requestRide(ride.id);
      setRides((current) =>
        current.map((currentRide) =>
          currentRide.id === ride.id ? { ...currentRide, currentUserRequestStatus: request.status } : currentRide
        )
      );
      setRequestMessage(`Request sent to ${ride.driverName}.`);
    } catch (requestError) {
      setError(getApiErrorMessage(requestError));
    } finally {
      setRequestingRideId(null);
    }
  }

  return (
    <section>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-medium text-utsc-teal">Available rides</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">Find a ride from UTSC</h1>
          <p className="mt-2 text-sm text-slate-600">Browse student-posted trips and request a seat from the driver.</p>
        </div>
        <Link to="/rides/new" className="rounded-md bg-utsc-teal px-4 py-2 text-sm font-semibold text-white transition hover:bg-teal-700">
          Post a ride
        </Link>
      </div>

      <div className="mt-6 grid gap-4">
        {error ? <Alert message={error} /> : null}
        {requestMessage ? (
          <div className="rounded-md border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
            {requestMessage}
          </div>
        ) : null}

        {isLoading ? <LoadingState label="Loading rides" /> : null}

        {!isLoading && !error && rides.length === 0 ? (
          <EmptyState
            title="No rides posted yet"
            message="Be the first student to post a trip and help someone get across Scarborough."
            action={
              <Link to="/rides/new" className="rounded-md bg-utsc-teal px-4 py-2 text-sm font-semibold text-white">
                Post a ride
              </Link>
            }
          />
        ) : null}

        {!isLoading && rides.length > 0 ? (
          <>
            <div className="flex flex-col gap-2 rounded-lg border border-slate-200 bg-white p-3 shadow-sm sm:flex-row sm:items-center sm:justify-between">
              <label htmlFor="ride-sort" className="text-sm font-medium text-slate-700">
                Sort by
              </label>
              <select
                id="ride-sort"
                value={sortOption}
                onChange={(event) => setSortOption(event.target.value as RideSortOption)}
                className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-900 shadow-sm outline-none transition focus:border-utsc-teal focus:ring-2 focus:ring-utsc-teal/20 sm:w-60"
              >
                {rideSortOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid gap-4 lg:grid-cols-2">
              {sortedRides.map((ride) => {
                const isOwnRide = ride.driverId === user?.id;
                const isFull = ride.availableSeats <= 0;
                const hasRequested = hasRequestedRide(ride);

                return (
                  <RideCard
                    key={ride.id}
                    ride={ride}
                    action={
                      <button
                        type="button"
                        disabled={isOwnRide || isFull || hasRequested || requestingRideId === ride.id}
                        onClick={() => void handleRequestRide(ride)}
                        className="rounded-md bg-slate-950 px-3 py-2 text-sm font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-300"
                      >
                        {requestingRideId === ride.id
                          ? 'Requesting...'
                          : isOwnRide
                            ? 'Your ride'
                            : hasRequested
                              ? 'Requested'
                              : isFull
                                ? 'Full'
                                : 'Request seat'}
                      </button>
                    }
                  />
                );
              })}
            </div>
          </>
        ) : null}
      </div>
    </section>
  );
}

function sortRides(rides: Ride[], sortOption: RideSortOption) {
  return [...rides].sort((firstRide, secondRide) => {
    switch (sortOption) {
      case 'price-asc':
        return firstRide.price - secondRide.price;
      case 'price-desc':
        return secondRide.price - firstRide.price;
      case 'departure-time':
        return new Date(firstRide.departureTime).getTime() - new Date(secondRide.departureTime).getTime();
      case 'available-seats':
        return secondRide.availableSeats - firstRide.availableSeats;
      case 'newest':
      default:
        return new Date(secondRide.createdAt).getTime() - new Date(firstRide.createdAt).getTime();
    }
  });
}
