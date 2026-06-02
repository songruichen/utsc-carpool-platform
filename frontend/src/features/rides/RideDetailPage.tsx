import type { ReactNode } from 'react';
import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { CalendarClock, MapPin, UsersRound } from 'lucide-react';
import { Alert } from '@/components/ui/Alert';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { EmptyState } from '@/components/ui/EmptyState';
import { LoadingState } from '@/components/ui/LoadingState';
import { useAuth } from '@/features/auth/useAuth';
import { formatDateTime, formatMoney } from '@/features/rides/formatters';
import { RideStatusBadge } from '@/features/rides/components/RideStatusBadge';
import { hasRequestedRide } from '@/features/rides/rideStatus';
import { getApiErrorMessage } from '@/lib/api/errors';
import { acceptRideRequest, deleteRide, getRide, getRideRequests, requestRide } from '@/lib/api/rides';
import type { Ride, RideRequest } from '@/types/api';

export function RideDetailPage() {
  const { rideId } = useParams<{ rideId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [ride, setRide] = useState<Ride | null>(null);
  const [requests, setRequests] = useState<RideRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRequesting, setIsRequesting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [requestMessage, setRequestMessage] = useState<string | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [acceptingRequestId, setAcceptingRequestId] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function loadRide() {
      if (!rideId) {
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const rideData = await getRide(rideId);
        if (!isMounted) {
          return;
        }

        setRide(rideData);

        if (rideData.driverId === user?.id) {
          setRequests(await getRideRequests(rideId));
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

    void loadRide();

    return () => {
      isMounted = false;
    };
  }, [rideId, user?.id]);

  async function handleRequestSeat() {
    if (!ride) {
      return;
    }

    setIsRequesting(true);
    setRequestMessage(null);
    setError(null);

    try {
      const request = await requestRide(ride.id);
      setRide((current) => (current ? { ...current, currentUserRequestStatus: request.status } : current));
      setRequestMessage(`Request sent to ${ride.driverName}.`);
    } catch (requestError) {
      setError(getApiErrorMessage(requestError));
    } finally {
      setIsRequesting(false);
    }
  }

  async function handleConfirmDelete() {
    if (!ride || isDeleting) {
      return;
    }

    setIsDeleting(true);
    setError(null);

    try {
      await deleteRide(ride.id);
      navigate('/my-rides', { replace: true, state: { successMessage: 'Ride deleted successfully.' } });
    } catch (deleteError) {
      setError(getApiErrorMessage(deleteError));
    } finally {
      setIsDeleting(false);
    }
  }

  async function handleAcceptRequest(requestId: string) {
    if (acceptingRequestId) {
      return;
    }

    setAcceptingRequestId(requestId);
    setError(null);

    try {
      const acceptedRequest = await acceptRideRequest(requestId);
      setRequests((current) =>
        current.map((request) => (request.id === acceptedRequest.id ? acceptedRequest : request))
      );
      setRide((current) =>
        current ? { ...current, availableSeats: Math.max(0, current.availableSeats - 1) } : current
      );
    } catch (acceptError) {
      setError(getApiErrorMessage(acceptError));
    } finally {
      setAcceptingRequestId(null);
    }
  }

  if (isLoading) {
    return <LoadingState label="Loading ride details" />;
  }

  if (error && !ride) {
    return <Alert message={error} />;
  }

  if (!ride) {
    return <EmptyState title="Ride not found" message="This ride may have been removed." />;
  }

  const isOwnRide = ride.driverId === user?.id;
  const isFull = ride.availableSeats <= 0;
  const hasRequested = hasRequestedRide(ride);

  return (
    <section className="grid gap-6 lg:grid-cols-[1fr_360px]">
      <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <Link to="/rides" className="text-sm font-medium text-utsc-teal hover:text-teal-700">
          Back to rides
        </Link>
        <div className="mt-5 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-sm font-medium text-slate-500">Ride with {ride.driverName}</p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">
              {ride.origin} to {ride.destination}
            </h1>
          </div>
          <div className="text-left sm:text-right">
            <p className="text-2xl font-semibold text-slate-950">{formatMoney(ride.price)}</p>
            <p className="text-sm text-slate-500">per seat</p>
            <div className="mt-3 sm:flex sm:justify-end">
              <RideStatusBadge ride={ride} />
            </div>
          </div>
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          <Detail icon={<MapPin className="h-5 w-5" />} label="Route" value={`${ride.origin} -> ${ride.destination}`} />
          <Detail icon={<CalendarClock className="h-5 w-5" />} label="Departure" value={formatDateTime(ride.departureTime)} />
          <Detail icon={<UsersRound className="h-5 w-5" />} label="Seats" value={`${ride.availableSeats} available`} />
        </div>

        {ride.notes ? (
          <div className="mt-8">
            <h2 className="text-base font-semibold text-slate-950">Driver notes</h2>
            <p className="mt-2 whitespace-pre-line text-sm leading-6 text-slate-600">{ride.notes}</p>
          </div>
        ) : null}
      </div>

      <aside className="space-y-4">
        {error ? <Alert message={error} /> : null}
        {requestMessage ? (
          <div className="rounded-md border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
            {requestMessage}
          </div>
        ) : null}

        <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-base font-semibold text-slate-950">{isOwnRide ? 'Your ride' : 'Request this ride'}</h2>
          <p className="mt-2 text-sm text-slate-600">
            {isOwnRide
              ? 'Passengers can request seats from the ride listing or detail page.'
              : 'Send the driver a request. They can accept or reject it from their request list.'}
          </p>
          {isOwnRide ? (
            <button
              type="button"
              onClick={() => {
                setError(null);
                setIsDeleteDialogOpen(true);
              }}
              className="mt-5 w-full rounded-md border border-red-200 px-4 py-2.5 text-sm font-semibold text-red-700 transition hover:bg-red-50"
            >
              Delete ride
            </button>
          ) : null}
          {!isOwnRide ? (
            <button
              type="button"
              disabled={isFull || hasRequested || isRequesting}
              onClick={() => void handleRequestSeat()}
              className="mt-5 w-full rounded-md bg-utsc-teal px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-teal-700 disabled:cursor-not-allowed disabled:bg-slate-300"
            >
              {isRequesting ? 'Requesting...' : hasRequested ? 'Requested' : isFull ? 'Ride is full' : 'Request seat'}
            </button>
          ) : null}
        </div>

        {isOwnRide ? (
          <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-base font-semibold text-slate-950">Seat requests</h2>
            {requests.length === 0 ? (
              <p className="mt-3 text-sm text-slate-600">No requests yet.</p>
            ) : (
              <div className="mt-4 space-y-3">
                {requests.map((request) => {
                  const isAccepting = acceptingRequestId === request.id;

                  return (
                    <div key={request.id} className="rounded-md border border-slate-200 p-3">
                      <p className="text-sm font-medium text-slate-950">{request.passengerName}</p>
                      <p className="mt-1 text-xs font-medium uppercase tracking-wide text-slate-500">{request.status}</p>
                      {request.status === 'PENDING' ? (
                        <button
                          type="button"
                          disabled={Boolean(acceptingRequestId)}
                          onClick={() => void handleAcceptRequest(request.id)}
                          className="mt-3 rounded-md bg-utsc-teal px-3 py-2 text-sm font-semibold text-white transition hover:bg-teal-700 disabled:cursor-not-allowed disabled:bg-slate-300"
                        >
                          {isAccepting ? 'Accepting...' : 'Accept'}
                        </button>
                      ) : null}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        ) : null}
      </aside>
      <ConfirmDialog
        isOpen={isDeleteDialogOpen}
        title="Delete this ride?"
        description="This action is permanent. The ride and its seat requests will be removed and cannot be recovered."
        confirmLabel="Confirm Delete"
        errorMessage={error}
        isConfirming={isDeleting}
        onCancel={() => setIsDeleteDialogOpen(false)}
        onConfirm={() => void handleConfirmDelete()}
      />
    </section>
  );
}

type DetailProps = {
  icon: ReactNode;
  label: string;
  value: string;
};

function Detail({ icon, label, value }: DetailProps) {
  return (
    <div className="rounded-md border border-slate-200 p-4">
      <div className="text-utsc-teal">{icon}</div>
      <p className="mt-3 text-xs font-medium uppercase tracking-wide text-slate-500">{label}</p>
      <p className="mt-1 text-sm font-medium text-slate-950">{value}</p>
    </div>
  );
}
