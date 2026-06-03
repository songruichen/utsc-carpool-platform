package ca.utoronto.utsc.carpool.modules.riderequest.dto;

import ca.utoronto.utsc.carpool.modules.riderequest.entity.RideRequestStatus;

import java.time.Instant;
import java.util.UUID;

public record PassengerRideRequestResponse(
        UUID id,
        UUID rideId,
        String rideOrigin,
        String rideDestination,
        Instant rideDepartureTime,
        int rideAvailableSeats,
        RideRequestStatus status,
        Instant createdAt,
        Instant updatedAt
) {
}
