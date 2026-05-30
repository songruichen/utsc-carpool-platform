import { useEffect, useMemo, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Alert } from '@/components/ui/Alert';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { EmptyState } from '@/components/ui/EmptyState';
import { LoadingState } from '@/components/ui/LoadingState';
import { useAuth } from '@/features/auth/useAuth';
import { RideCard } from '@/features/rides/components/RideCard';
import { getApiErrorMessage } from '@/lib/api/errors';
import { deleteRide, getRides } from '@/lib/api/rides';
import type { Ride } from '@/types/api';

export function MyRidesPage() {
  const { user } = useAuth();
  const location = useLocation();
  const [rides, setRides] = useState<Ride[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(
    (location.state as { successMessage?: string } | null)?.successMessage ?? null
  );
  const [rideToDelete, setRideToDelete] = useState<Ride | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

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

  async function handleConfirmDelete() {
    if (!rideToDelete || isDeleting) {
      return;
    }

    setIsDeleting(true);
    setError(null);
    setSuccessMessage(null);

    try {
      await deleteRide(rideToDelete.id);
      setRides((current) => current.filter((ride) => ride.id !== rideToDelete.id));
      setSuccessMessage('Ride deleted successfully.');
      setRideToDelete(null);
    } catch (deleteError) {
      setError(getApiErrorMessage(deleteError));
    } finally {
      setIsDeleting(false);
    }
  }

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
        {successMessage ? (
          <div className="mb-4 rounded-md border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
            {successMessage}
          </div>
        ) : null}
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
              <RideCard
                key={ride.id}
                ride={ride}
                action={
                  <button
                    type="button"
                    onClick={() => {
                      setError(null);
                      setRideToDelete(ride);
                    }}
                    className="rounded-md border border-red-200 px-3 py-2 text-sm font-medium text-red-700 transition hover:bg-red-50"
                  >
                    Delete ride
                  </button>
                }
              />
            ))}
          </div>
        ) : null}
      </div>
      <ConfirmDialog
        isOpen={Boolean(rideToDelete)}
        title="Delete this ride?"
        description="This action is permanent. The ride and its seat requests will be removed and cannot be recovered."
        confirmLabel="Confirm Delete"
        errorMessage={error}
        isConfirming={isDeleting}
        onCancel={() => setRideToDelete(null)}
        onConfirm={() => void handleConfirmDelete()}
      />
    </section>
  );
}
