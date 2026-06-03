import type { RideRequest } from '@/types/api';

const STORAGE_KEY = 'passengerRideRequests';

export function getPassengerRideRequest(rideId: string, passengerId: string): RideRequest | null {
  const request = getStoredRequests()[rideId];
  return request?.passengerId === passengerId ? request : null;
}

export function storePassengerRideRequest(request: RideRequest) {
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify({
      ...getStoredRequests(),
      [request.rideId]: request
    })
  );
}

function getStoredRequests(): Record<string, RideRequest> {
  const stored = localStorage.getItem(STORAGE_KEY);

  if (!stored) {
    return {};
  }

  try {
    return JSON.parse(stored) as Record<string, RideRequest>;
  } catch {
    localStorage.removeItem(STORAGE_KEY);
    return {};
  }
}
