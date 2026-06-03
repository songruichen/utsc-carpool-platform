import type { ReactNode } from 'react';
import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { CalendarClock, Copy, MapPin, Pencil, UsersRound } from 'lucide-react';
import { Alert } from '@/components/ui/Alert';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { EmptyState } from '@/components/ui/EmptyState';
import { LoadingState } from '@/components/ui/LoadingState';
import { useAuth } from '@/features/auth/useAuth';
import { formatDateTime, formatMoney } from '@/features/rides/formatters';
import { RequestCountBadge } from '@/features/rides/components/RequestCountBadge';
import { RideStatusBadge } from '@/features/rides/components/RideStatusBadge';
import { getPassengerRideRequest, storePassengerRideRequest } from '@/features/rides/passengerRequestStorage';
import { hasRequestedRide, isRideFull } from '@/features/rides/rideStatus';
import { getApiErrorMessage } from '@/lib/api/errors';
import {
  acceptRideRequest,
  cancelRideRequest,
  deleteRide,
  getRide,
  getRideRequests,
  rejectRideRequest,
  requestRide
} from '@/lib/api/rides';
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
  const [copyMessage, setCopyMessage] = useState<string | null>(null);
  const [isCopyingLink, setIsCopyingLink] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [passengerRequest, setPassengerRequest] = useState<RideRequest | null>(null);
  const [processingRequest, setProcessingRequest] = useState<{ id: string; action: 'accept' | 'reject' | 'cancel' } | null>(
    null
  );
  const copyMessageTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

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
        } else if (user?.id) {
          const storedRequest = getPassengerRideRequest(rideId, user.id);

          if (storedRequest && rideData.currentUserRequestStatus) {
            const currentRequest = { ...storedRequest, status: rideData.currentUserRequestStatus };
            setPassengerRequest(currentRequest);
            storePassengerRideRequest(currentRequest);
          } else {
            setPassengerRequest(null);
          }
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

  useEffect(() => {
    return () => {
      if (copyMessageTimeoutRef.current) {
        clearTimeout(copyMessageTimeoutRef.current);
      }
    };
  }, []);

  async function handleRequestSeat() {
    if (!ride || isRideFull(ride)) {
      return;
    }

    setIsRequesting(true);
    setRequestMessage(null);
    setError(null);

    try {
      const request = await requestRide(ride.id);
      setPassengerRequest(request);
      storePassengerRideRequest(request);
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
    if (processingRequest) {
      return;
    }

    setProcessingRequest({ id: requestId, action: 'accept' });
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
      setProcessingRequest(null);
    }
  }

  async function handleRejectRequest(requestId: string) {
    if (processingRequest) {
      return;
    }

    setProcessingRequest({ id: requestId, action: 'reject' });
    setError(null);

    try {
      const rejectedRequest = await rejectRideRequest(requestId);
      setRequests((current) =>
        current.map((request) => (request.id === rejectedRequest.id ? rejectedRequest : request))
      );
    } catch (rejectError) {
      setError(getApiErrorMessage(rejectError));
    } finally {
      setProcessingRequest(null);
    }
  }

  async function handleCancelRequest() {
    if (!ride || !passengerRequest || processingRequest) {
      return;
    }

    setProcessingRequest({ id: passengerRequest.id, action: 'cancel' });
    setError(null);

    try {
      await cancelRideRequest(passengerRequest.id);
      const cancelledRequest = { ...passengerRequest, status: 'CANCELLED' as const };
      const shouldReleaseSeat = passengerRequest.status === 'ACCEPTED' || ride.currentUserRequestStatus === 'ACCEPTED';

      setPassengerRequest(cancelledRequest);
      storePassengerRideRequest(cancelledRequest);
      setRide((current) =>
        current
          ? {
              ...current,
              availableSeats: shouldReleaseSeat ? current.availableSeats + 1 : current.availableSeats,
              currentUserRequestStatus: cancelledRequest.status
            }
          : current
      );
    } catch (cancelError) {
      setError(getApiErrorMessage(cancelError));
    } finally {
      setProcessingRequest(null);
    }
  }

  async function handleCopyLink() {
    if (isCopyingLink) {
      return;
    }

    setIsCopyingLink(true);
    setError(null);
    setCopyMessage(null);

    if (copyMessageTimeoutRef.current) {
      clearTimeout(copyMessageTimeoutRef.current);
    }

    try {
      if (!navigator.clipboard) {
        throw new Error('Clipboard access is not available in this browser');
      }

      await navigator.clipboard.writeText(window.location.href);
      setCopyMessage('Link copied');
      copyMessageTimeoutRef.current = setTimeout(() => {
        setCopyMessage(null);
        copyMessageTimeoutRef.current = null;
      }, 2500);
    } catch {
      setError('Could not copy ride link');
    } finally {
      setIsCopyingLink(false);
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
  const isFull = isRideFull(ride);
  const hasRequested = hasRequestedRide(ride);
  const canCancelRequest =
    !isOwnRide &&
    passengerRequest !== null &&
    passengerRequest.passengerId === user?.id &&
    (passengerRequest.status === 'PENDING' || passengerRequest.status === 'ACCEPTED');
  const isCancelling = processingRequest?.action === 'cancel';

  return (
    <section className="grid gap-6 lg:grid-cols-[1fr_360px]">
      <div className={`rounded-lg border p-6 shadow-sm ${isFull ? 'border-rose-200 bg-rose-50/40' : 'border-slate-200 bg-white'}`}>
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
            <div className="mt-3 flex flex-wrap gap-2 sm:justify-end">
              <RideStatusBadge ride={ride} />
              <RequestCountBadge count={ride.requestCount} />
            </div>
          </div>
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          <Detail icon={<MapPin className="h-5 w-5" />} label="Route" value={`${ride.origin} -> ${ride.destination}`} />
          <Detail icon={<CalendarClock className="h-5 w-5" />} label="Departure" value={formatDateTime(ride.departureTime)} />
          <Detail icon={<UsersRound className="h-5 w-5" />} label="Seats" value={isFull ? 'Ride is full' : `${ride.availableSeats} available`} />
        </div>

        {isFull ? (
          <p className="mt-6 rounded-md border border-rose-200 bg-white px-4 py-3 text-sm font-medium text-rose-700">
            This ride is full.
          </p>
        ) : null}

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
        {copyMessage ? (
          <div className="rounded-md border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
            {copyMessage}
          </div>
        ) : null}

        <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-base font-semibold text-slate-950">{isOwnRide ? 'Your ride' : 'Request this ride'}</h2>
          <p className="mt-2 text-sm text-slate-600">
            {isOwnRide
              ? 'Passengers can request seats from the ride listing or detail page.'
              : isFull
                ? 'This ride is full and no more seat requests can be submitted.'
              : 'Send the driver a request. They can accept or reject it from their request list.'}
          </p>
          <button
            type="button"
            disabled={isCopyingLink}
            onClick={() => void handleCopyLink()}
            className="mt-5 flex w-full items-center justify-center gap-2 rounded-md border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400"
          >
            <Copy className="h-4 w-4" aria-hidden="true" />
            Copy Link
          </button>
          {isOwnRide ? (
            <>
              <Link
                to={`/rides/${ride.id}/edit`}
                className="mt-5 flex w-full items-center justify-center gap-2 rounded-md bg-utsc-teal px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-teal-700"
              >
                <Pencil className="h-4 w-4" aria-hidden="true" />
                Edit Ride
              </Link>
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
            </>
          ) : null}
          {!isOwnRide ? (
            <>
              {passengerRequest ? (
                <p className="mt-4 text-xs font-medium uppercase tracking-wide text-slate-500">
                  Request status: {passengerRequest.status}
                </p>
              ) : null}
              {canCancelRequest ? (
                <button
                  type="button"
                  disabled={Boolean(processingRequest)}
                  onClick={() => void handleCancelRequest()}
                  className="mt-5 w-full rounded-md border border-red-200 px-4 py-2.5 text-sm font-semibold text-red-700 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:border-slate-200 disabled:bg-slate-100 disabled:text-slate-400"
                >
                  {isCancelling ? 'Cancelling...' : 'Cancel Request'}
                </button>
              ) : isFull ? (
                <p className="mt-5 rounded-md border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">
                  This ride is full.
                </p>
              ) : (
                <button
                  type="button"
                  disabled={hasRequested || isRequesting}
                  onClick={() => void handleRequestSeat()}
                  className="mt-5 w-full rounded-md bg-utsc-teal px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-teal-700 disabled:cursor-not-allowed disabled:bg-slate-300"
                >
                  {isRequesting ? 'Requesting...' : hasRequested ? 'Requested' : 'Request seat'}
                </button>
              )}
            </>
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
                  const isAccepting = processingRequest?.id === request.id && processingRequest.action === 'accept';
                  const isRejecting = processingRequest?.id === request.id && processingRequest.action === 'reject';

                  return (
                    <div key={request.id} className="rounded-md border border-slate-200 p-3">
                      <p className="text-sm font-medium text-slate-950">{request.passengerName}</p>
                      <p className="mt-1 text-xs font-medium uppercase tracking-wide text-slate-500">{request.status}</p>
                      {request.status === 'PENDING' ? (
                        <div className="mt-3 flex gap-2">
                          <button
                            type="button"
                            disabled={Boolean(processingRequest)}
                            onClick={() => void handleAcceptRequest(request.id)}
                            className="rounded-md bg-utsc-teal px-3 py-2 text-sm font-semibold text-white transition hover:bg-teal-700 disabled:cursor-not-allowed disabled:bg-slate-300"
                          >
                            {isAccepting ? 'Accepting...' : 'Accept'}
                          </button>
                          <button
                            type="button"
                            disabled={Boolean(processingRequest)}
                            onClick={() => void handleRejectRequest(request.id)}
                            className="rounded-md border border-red-200 px-3 py-2 text-sm font-semibold text-red-700 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:border-slate-200 disabled:bg-slate-100 disabled:text-slate-400"
                          >
                            {isRejecting ? 'Rejecting...' : 'Reject'}
                          </button>
                        </div>
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
