import type { FormEvent } from 'react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Alert } from '@/components/ui/Alert';
import { RideForm } from '@/features/rides/components/RideForm';
import { defaultRideFormValues, type RideFormValues, toRidePayload, validateRideForm } from '@/features/rides/rideFormUtils';
import { getApiErrorMessage } from '@/lib/api/errors';
import { createRide } from '@/lib/api/rides';

export function CreateRidePage() {
  const navigate = useNavigate();
  const [form, setForm] = useState<RideFormValues>(defaultRideFormValues);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<keyof RideFormValues, string>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const errors = validateRideForm(form);
    setFieldErrors(errors);
    setError(null);

    if (Object.keys(errors).length > 0) {
      return;
    }

    setIsSubmitting(true);

    try {
      const ride = await createRide(toRidePayload(form));
      navigate(`/rides/${ride.id}`);
    } catch (createError) {
      setError(getApiErrorMessage(createError));
    } finally {
      setIsSubmitting(false);
    }
  }

  function updateField(field: keyof RideFormValues, value: string) {
    setForm((current) => ({ ...current, [field]: value }));
    setFieldErrors((current) => ({ ...current, [field]: undefined }));
  }

  return (
    <section className="mx-auto max-w-3xl">
      <div>
        <p className="text-sm font-medium text-utsc-teal">Post a ride</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">Share your next trip</h1>
        <p className="mt-2 text-sm text-slate-600">Add the route, departure time, seats, and cost so students can request a spot.</p>
      </div>

      <RideForm
        values={form}
        fieldErrors={fieldErrors}
        isSubmitting={isSubmitting}
        submitLabel="Post ride"
        submittingLabel="Posting..."
        onChange={updateField}
        onSubmit={(event) => void handleSubmit(event)}
      >
        {error ? <Alert message={error} /> : null}
      </RideForm>
    </section>
  );
}
