package ca.utoronto.utsc.carpool.modules.riderequest.mapper;

import ca.utoronto.utsc.carpool.modules.ride.entity.Ride;
import ca.utoronto.utsc.carpool.modules.riderequest.dto.PassengerRideRequestResponse;
import ca.utoronto.utsc.carpool.modules.riderequest.dto.RideRequestResponse;
import ca.utoronto.utsc.carpool.modules.riderequest.entity.RideRequest;
import ca.utoronto.utsc.carpool.modules.user.entity.User;

public final class RideRequestMapper {

    private RideRequestMapper() {
    }

    public static RideRequestResponse toResponse(RideRequest rideRequest) {
        User passenger = rideRequest.getPassenger();

        return new RideRequestResponse(
                rideRequest.getId(),
                rideRequest.getRide().getId(),
                passenger.getId(),
                passenger.getFirstName() + " " + passenger.getLastName(),
                rideRequest.getStatus(),
                rideRequest.getCreatedAt(),
                rideRequest.getUpdatedAt()
        );
    }

    public static PassengerRideRequestResponse toPassengerResponse(RideRequest rideRequest) {
        Ride ride = rideRequest.getRide();

        return new PassengerRideRequestResponse(
                rideRequest.getId(),
                ride.getId(),
                ride.getOrigin(),
                ride.getDestination(),
                ride.getDepartureTime(),
                ride.getAvailableSeats(),
                rideRequest.getStatus(),
                rideRequest.getCreatedAt(),
                rideRequest.getUpdatedAt()
        );
    }
}
