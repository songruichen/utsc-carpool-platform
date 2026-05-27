package ca.utoronto.utsc.carpool.modules.ride.mapper;

import ca.utoronto.utsc.carpool.modules.ride.dto.CreateRideRequest;
import ca.utoronto.utsc.carpool.modules.ride.dto.RideResponse;
import ca.utoronto.utsc.carpool.modules.ride.entity.Ride;
import ca.utoronto.utsc.carpool.modules.user.entity.User;

public final class RideMapper {

    private RideMapper() {
    }

    public static Ride toEntity(CreateRideRequest request, User driver) {
        Ride ride = new Ride();
        ride.setDriver(driver);
        ride.setOrigin(request.origin().trim());
        ride.setDestination(request.destination().trim());
        ride.setDepartureTime(request.departureTime());
        ride.setAvailableSeats(request.availableSeats());
        ride.setPrice(request.price());
        ride.setNotes(request.notes() == null || request.notes().isBlank() ? null : request.notes().trim());
        return ride;
    }

    public static RideResponse toResponse(Ride ride) {
        User driver = ride.getDriver();
        return new RideResponse(
                ride.getId(),
                driver.getId(),
                driver.getFirstName() + " " + driver.getLastName(),
                ride.getOrigin(),
                ride.getDestination(),
                ride.getDepartureTime(),
                ride.getAvailableSeats(),
                ride.getPrice(),
                ride.getNotes(),
                ride.getCreatedAt(),
                ride.getUpdatedAt()
        );
    }
}

