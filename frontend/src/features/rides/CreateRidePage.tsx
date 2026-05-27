import { FormEvent, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Alert } from '@/components/ui/Alert';
import { TextAreaField } from '@/components/ui/TextAreaField';
import { TextField } from '@/components/ui/TextField';
import { getApiErrorMessage } from '@/lib/api/errors';
import { createRide } from '@/lib/api/rides';

type RideForm = {
  origin: string;
  destination: string;
  departureTime: string;
  availableSeats: string;
  price: string;
  notes: string;
};

const initialForm: RideForm = {
  origin: 'UTSC Student Centre',
  destination: '',
  departureTime: '',
  availableSeats: '3',
  price: '5.00',
  notes: ''
};

export function CreateRidePage() {
  const navigate = useNavigate();
  const [form, setForm] = useState<RideForm>(initialForm);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<keyof RideForm, string>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const errors = validateForm(form);
    setFieldErrors(errors);
    setError(null);

    if (Object.keys(errors).length > 0) {
      return;
    }

    setIsSubmitting(true);

    try {
      const ride = await createRide({
        origin: form.origin.trim(),
        destination: form.destination.trim(),
        departureTime: new Date(form.departureTime).toISOString(),
        availableSeats: Number(form.availableSeats),
        price: Number(form.price),
        notes: form.notes.trim() || undefined
      });
      navigate(`/rides/${ride.id}`);
    } catch (createError) {
      setError(getApiErrorMessage(createError));
    } finally {
      setIsSubmitting(false);
    }
  }

  function updateField(field: keyof RideForm, value: string) {
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

      <form onSubmit={handleSubmit} className="mt-6 rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <div className="grid gap-5">
          {error ? <Alert message={error} /> : null}

          <div className="grid gap-4 sm:grid-cols-2">
            <TextField
              label="Origin"
              name="origin"
              value={form.origin}
              onChange={(event) => updateField('origin', event.target.value)}
              error={fieldErrors.origin}
            />
            <TextField
              label="Destination"
              name="destination"
              value={form.destination}
              onChange={(event) => updateField('destination', event.target.value)}
              error={fieldErrors.destination}
            />
          </div>

          <TextField
            label="Departure time"
            name="departureTime"
            type="datetime-local"
            value={form.departureTime}
            onChange={(event) => updateField('departureTime', event.target.value)}
            error={fieldErrors.departureTime}
          />

          <div className="grid gap-4 sm:grid-cols-2">
            <TextField
              label="Available seats"
              name="availableSeats"
              type="number"
              min={1}
              max={8}
              value={form.availableSeats}
              onChange={(event) => updateField('availableSeats', event.target.value)}
              error={fieldErrors.availableSeats}
            />
            <TextField
              label="Price per seat"
              name="price"
              type="number"
              min={0}
              step="0.01"
              value={form.price}
              onChange={(event) => updateField('price', event.target.value)}
              error={fieldErrors.price}
            />
          </div>

          <TextAreaField
            label="Notes"
            name="notes"
            value={form.notes}
            maxLength={1000}
            onChange={(event) => updateField('notes', event.target.value)}
            error={fieldErrors.notes}
            placeholder="Pickup details, luggage space, music preferences, or anything passengers should know."
          />

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded-md bg-utsc-teal px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-teal-700 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isSubmitting ? 'Posting...' : 'Post ride'}
            </button>
          </div>
        </div>
      </form>
    </section>
  );
}

function validateForm(form: RideForm): Partial<Record<keyof RideForm, string>> {
  const errors: Partial<Record<keyof RideForm, string>> = {};
  const seats = Number(form.availableSeats);
  const price = Number(form.price);

  if (!form.origin.trim()) {
    errors.origin = 'Origin is required.';
  }

  if (!form.destination.trim()) {
    errors.destination = 'Destination is required.';
  }

  if (!form.departureTime) {
    errors.departureTime = 'Departure time is required.';
  } else if (new Date(form.departureTime).getTime() <= Date.now()) {
    errors.departureTime = 'Departure time must be in the future.';
  }

  if (!Number.isInteger(seats) || seats < 1 || seats > 8) {
    errors.availableSeats = 'Seats must be between 1 and 8.';
  }

  if (Number.isNaN(price) || price < 0) {
    errors.price = 'Price cannot be negative.';
  }

  if (form.notes.length > 1000) {
    errors.notes = 'Notes must be 1000 characters or less.';
  }

  return errors;
}
