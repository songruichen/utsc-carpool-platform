import type { Ride } from '@/types/api';

export type RideStatus = 'available' | 'nearly-full' | 'full' | 'requested';

export function getRideStatus(ride: Pick<Ride, 'availableSeats' | 'currentUserRequestStatus'>): RideStatus {
  if (hasRequestedRide(ride)) {
    return 'requested';
  }

  if (isRideFull(ride)) {
    return 'full';
  }

  if (ride.availableSeats === 1) {
    return 'nearly-full';
  }

  return 'available';
}

export function getRideStatusLabel(status: RideStatus, availableSeats: number) {
  if (status === 'requested') {
    return 'Requested';
  }

  if (status === 'full') {
    return 'FULL';
  }

  return `${availableSeats} ${availableSeats === 1 ? 'seat' : 'seats'} left`;
}

export function hasRequestedRide(ride: Pick<Ride, 'currentUserRequestStatus'>) {
  return Boolean(ride.currentUserRequestStatus);
}

export function isRideFull(ride: Pick<Ride, 'availableSeats'>) {
  return ride.availableSeats <= 0;
}
