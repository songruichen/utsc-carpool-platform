import type { Ride } from '@/types/api';

export type RideStatus = 'available' | 'nearly-full' | 'full' | 'requested';

export function getRideStatus(ride: Pick<Ride, 'availableSeats' | 'currentUserRequestStatus'>): RideStatus {
  if (hasRequestedRide(ride)) {
    return 'requested';
  }

  if (ride.availableSeats <= 0) {
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
    return 'Full';
  }

  return `${availableSeats} ${availableSeats === 1 ? 'seat' : 'seats'} left`;
}

export function hasRequestedRide(ride: Pick<Ride, 'currentUserRequestStatus'>) {
  return Boolean(ride.currentUserRequestStatus);
}
