export type ApiError = {
  timestamp: string;
  status: number;
  error: string;
  message: string;
  path: string;
};

export type ApiResponse<T> = {
  success: boolean;
  message: string | null;
  data: T;
};

export type PageResponse<T> = {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  first: boolean;
  last: boolean;
};

export type AuthUser = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'STUDENT' | 'ADMIN';
};

export type AuthResponse = {
  accessToken: string;
  tokenType: string;
  expiresInMs: number;
  user: AuthUser;
};

export type LoginRequest = {
  email: string;
  password: string;
};

export type RegisterRequest = LoginRequest & {
  firstName: string;
  lastName: string;
};

export type Ride = {
  id: string;
  driverId: string;
  driverName: string;
  origin: string;
  destination: string;
  departureTime: string;
  availableSeats: number;
  price: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
};

export type CreateRideRequest = {
  origin: string;
  destination: string;
  departureTime: string;
  availableSeats: number;
  price: number;
  notes?: string;
};

export type RideRequestStatus = 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'CANCELLED';

export type RideRequest = {
  id: string;
  rideId: string;
  passengerId: string;
  passengerName: string;
  status: RideRequestStatus;
  createdAt: string;
  updatedAt: string;
};
