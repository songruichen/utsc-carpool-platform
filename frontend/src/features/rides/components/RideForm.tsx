import type { FormEvent, ReactNode } from 'react';
import { TextAreaField } from '@/components/ui/TextAreaField';
import { TextField } from '@/components/ui/TextField';
import type { RideFormValues } from '@/features/rides/rideFormUtils';

type RideFormProps = {
  values: RideFormValues;
  fieldErrors: Partial<Record<keyof RideFormValues, string>>;
  isSubmitting: boolean;
  submitLabel: string;
  submittingLabel: string;
  children?: ReactNode;
  onChange: (field: keyof RideFormValues, value: string) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
};

export function RideForm({
  values,
  fieldErrors,
  isSubmitting,
  submitLabel,
  submittingLabel,
  children,
  onChange,
  onSubmit
}: RideFormProps) {
  return (
    <form onSubmit={onSubmit} className="mt-6 rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
      <div className="grid gap-5">
        {children}

        <div className="grid gap-4 sm:grid-cols-2">
          <TextField
            label="Origin"
            name="origin"
            value={values.origin}
            onChange={(event) => onChange('origin', event.target.value)}
            error={fieldErrors.origin}
          />
          <TextField
            label="Destination"
            name="destination"
            value={values.destination}
            onChange={(event) => onChange('destination', event.target.value)}
            error={fieldErrors.destination}
          />
        </div>

        <TextField
          label="Departure time"
          name="departureTime"
          type="datetime-local"
          value={values.departureTime}
          onChange={(event) => onChange('departureTime', event.target.value)}
          error={fieldErrors.departureTime}
        />

        <div className="grid gap-4 sm:grid-cols-2">
          <TextField
            label="Available seats"
            name="availableSeats"
            type="number"
            min={1}
            max={8}
            value={values.availableSeats}
            onChange={(event) => onChange('availableSeats', event.target.value)}
            error={fieldErrors.availableSeats}
          />
          <TextField
            label="Price per seat"
            name="price"
            type="number"
            min={0}
            step="0.01"
            value={values.price}
            onChange={(event) => onChange('price', event.target.value)}
            error={fieldErrors.price}
          />
        </div>

        <TextAreaField
          label="Notes"
          name="notes"
          value={values.notes}
          maxLength={1000}
          onChange={(event) => onChange('notes', event.target.value)}
          error={fieldErrors.notes}
          placeholder="Pickup details, luggage space, music preferences, or anything passengers should know."
        />

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isSubmitting}
            className="rounded-md bg-utsc-teal px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-teal-700 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isSubmitting ? submittingLabel : submitLabel}
          </button>
        </div>
      </div>
    </form>
  );
}
