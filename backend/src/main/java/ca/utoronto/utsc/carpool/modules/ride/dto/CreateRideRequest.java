package ca.utoronto.utsc.carpool.modules.ride.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Digits;
import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;
import java.time.Instant;

public record CreateRideRequest(
        @NotBlank
        @Size(max = 255)
        String origin,

        @NotBlank
        @Size(max = 255)
        String destination,

        @NotNull
        @Future
        Instant departureTime,

        @Min(1)
        @Max(8)
        int availableSeats,

        @NotNull
        @DecimalMin(value = "0.00")
        @Digits(integer = 6, fraction = 2)
        BigDecimal price,

        @Size(max = 1000)
        String notes
) {
}

