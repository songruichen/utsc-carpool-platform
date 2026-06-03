import { apiClient } from '@/lib/api/client';
import type { ApiResponse, CreateRideRequest, PageResponse, Ride, RideRequest } from '@/types/api';

export async function getRides(page = 0, size = 20): Promise<PageResponse<Ride>> {
  const response = await apiClient.get<ApiResponse<PageResponse<Ride>>>('/rides', {
    params: { page, size }
  });
  return response.data.data;
}

export async function getRide(rideId: string): Promise<Ride> {
  const response = await apiClient.get<ApiResponse<Ride>>(`/rides/${rideId}`);
  return response.data.data;
}

export async function createRide(request: CreateRideRequest): Promise<Ride> {
  const response = await apiClient.post<ApiResponse<Ride>>('/rides', request);
  return response.data.data;
}

export async function deleteRide(rideId: string): Promise<void> {
  await apiClient.delete(`/rides/${rideId}`);
}

export async function requestRide(rideId: string): Promise<RideRequest> {
  const response = await apiClient.post<ApiResponse<RideRequest>>(`/rides/${rideId}/requests`);
  return response.data.data;
}

export async function getRideRequests(rideId: string): Promise<RideRequest[]> {
  const response = await apiClient.get<ApiResponse<RideRequest[]>>(`/rides/${rideId}/requests`);
  return response.data.data;
}

export async function acceptRideRequest(requestId: string): Promise<RideRequest> {
  const response = await apiClient.patch<ApiResponse<RideRequest>>(`/requests/${requestId}/accept`);
  return response.data.data;
}

export async function rejectRideRequest(requestId: string): Promise<RideRequest> {
  const response = await apiClient.patch<ApiResponse<RideRequest>>(`/requests/${requestId}/reject`);
  return response.data.data;
}

export async function cancelRideRequest(requestId: string): Promise<void> {
  await apiClient.delete(`/requests/${requestId}`);
}
