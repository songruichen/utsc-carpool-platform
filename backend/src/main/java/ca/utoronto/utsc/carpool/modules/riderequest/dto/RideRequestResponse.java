package ca.utoronto.utsc.carpool.modules.riderequest.dto;

import ca.utoronto.utsc.carpool.modules.riderequest.entity.RideRequestStatus;

import java.time.Instant;
import java.util.UUID;

public record RideRequestResponse(
        UUID id,
        UUID rideId,
        UUID passengerId,
        String passengerName,
        RideRequestStatus status,
        Instant createdAt,
        Instant updatedAt
) {
}
