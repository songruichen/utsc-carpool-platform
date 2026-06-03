import type { FormEvent } from 'react';
import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Alert } from '@/components/ui/Alert';
import { EmptyState } from '@/components/ui/EmptyState';
import { LoadingState } from '@/components/ui/LoadingState';
import { useAuth } from '@/features/auth/useAuth';
import { RideForm } from '@/features/rides/components/RideForm';
import { type RideFormValues, toRidePayload, validateRideForm } from '@/features/rides/rideFormUtils';
import { getApiErrorMessage } from '@/lib/api/errors';
import { getRide, updateRide } from '@/lib/api/rides';
import type { Ride } from '@/types/api';

export function EditRidePage() {
  const { rideId } = useParams<{ rideId: string }>();
  const { user } = useAuth();
  const [ride, setRide] = useState<Ride | null>(null);
  const [form, setForm] = useState<RideFormValues | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<keyof RideFormValues, string>>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

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
        setForm(toRideFormValues(rideData));
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
  }, [rideId]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!ride || !form) {
      return;
    }

    const errors = validateRideForm(form);
    setFieldErrors(errors);
    setError(null);
    setSuccessMessage(null);

    if (Object.keys(errors).length > 0) {
      return;
    }

    setIsSubmitting(true);

    try {
      const updatedRide = await updateRide(ride.id, toRidePayload(form));
      setRide(updatedRide);
      setForm(toRideFormValues(updatedRide));
      setSuccessMessage('Ride updated successfully.');
    } catch (updateError) {
      setError(getApiErrorMessage(updateError));
    } finally {
      setIsSubmitting(false);
    }
  }

  function updateField(field: keyof RideFormValues, value: string) {
    setForm((current) => (current ? { ...current, [field]: value } : current));
    setFieldErrors((current) => ({ ...current, [field]: undefined }));
    setSuccessMessage(null);
  }

  if (isLoading) {
    return <LoadingState label="Loading ride" />;
  }

  if (error && !ride) {
    return <Alert message={error} />;
  }

  if (!ride || !form) {
    return <EmptyState title="Ride not found" message="This ride may have been removed." />;
  }

  if (ride.driverId !== user?.id) {
    return <Alert message="Only ride owners can edit rides." />;
  }

  return (
    <section className="mx-auto max-w-3xl">
      <div>
        <Link to={`/rides/${ride.id}`} className="text-sm font-medium text-utsc-teal hover:text-teal-700">
          Back to ride
        </Link>
        <p className="mt-4 text-sm font-medium text-utsc-teal">Edit ride</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">Update your trip</h1>
        <p className="mt-2 text-sm text-slate-600">Keep route, timing, seats, price, and ride details accurate for passengers.</p>
      </div>

      <RideForm
        values={form}
        fieldErrors={fieldErrors}
        isSubmitting={isSubmitting}
        submitLabel="Save changes"
        submittingLabel="Saving..."
        onChange={updateField}
        onSubmit={(event) => void handleSubmit(event)}
      >
        {error ? <Alert message={error} /> : null}
        {successMessage ? (
          <div className="rounded-md border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
            {successMessage}
          </div>
        ) : null}
      </RideForm>
    </section>
  );
}

function toRideFormValues(ride: Ride): RideFormValues {
  return {
    origin: ride.origin,
    destination: ride.destination,
    departureTime: toDateTimeLocalValue(ride.departureTime),
    availableSeats: String(ride.availableSeats),
    price: Number(ride.price).toFixed(2),
    notes: ride.notes ?? ''
  };
}

function toDateTimeLocalValue(value: string) {
  const date = new Date(value);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');

  return `${year}-${month}-${day}T${hours}:${minutes}`;
}
