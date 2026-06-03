export type RideFormValues = {
  origin: string;
  destination: string;
  departureTime: string;
  availableSeats: string;
  price: string;
  notes: string;
};

export type RideFormPayload = {
  origin: string;
  destination: string;
  departureTime: string;
  availableSeats: number;
  price: number;
  notes?: string;
};

export const defaultRideFormValues: RideFormValues = {
  origin: 'UTSC Student Centre',
  destination: '',
  departureTime: '',
  availableSeats: '3',
  price: '5.00',
  notes: ''
};

export function validateRideForm(values: RideFormValues): Partial<Record<keyof RideFormValues, string>> {
  const errors: Partial<Record<keyof RideFormValues, string>> = {};
  const seats = Number(values.availableSeats);
  const price = Number(values.price);

  if (!values.origin.trim()) {
    errors.origin = 'Origin is required.';
  }

  if (!values.destination.trim()) {
    errors.destination = 'Destination is required.';
  }

  if (!values.departureTime) {
    errors.departureTime = 'Departure time is required.';
  } else if (new Date(values.departureTime).getTime() <= Date.now()) {
    errors.departureTime = 'Departure time must be in the future.';
  }

  if (!Number.isInteger(seats) || seats < 1 || seats > 8) {
    errors.availableSeats = 'Seats must be between 1 and 8.';
  }

  if (Number.isNaN(price) || price < 0) {
    errors.price = 'Price cannot be negative.';
  }

  if (values.notes.length > 1000) {
    errors.notes = 'Notes must be 1000 characters or less.';
  }

  return errors;
}

export function toRidePayload(values: RideFormValues): RideFormPayload {
  return {
    origin: values.origin.trim(),
    destination: values.destination.trim(),
    departureTime: new Date(values.departureTime).toISOString(),
    availableSeats: Number(values.availableSeats),
    price: Number(values.price),
    notes: values.notes.trim() || undefined
  };
}
