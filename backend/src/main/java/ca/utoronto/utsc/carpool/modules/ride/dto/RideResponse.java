package ca.utoronto.utsc.carpool.modules.ride.dto;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

public record RideResponse(
        UUID id,
        UUID driverId,
        String driverName,
        String origin,
        String destination,
        Instant departureTime,
        int availableSeats,
        BigDecimal price,
        String notes,
        Instant createdAt,
        Instant updatedAt
) {
}

