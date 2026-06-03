package ca.utoronto.utsc.carpool.modules.ride.dto;

public record DriverRideStatsResponse(
        long activeRides,
        long pendingRequests,
        long acceptedPassengers,
        long totalRemainingSeats
) {
}
