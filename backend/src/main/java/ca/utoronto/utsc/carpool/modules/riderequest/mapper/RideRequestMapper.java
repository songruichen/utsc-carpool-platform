package ca.utoronto.utsc.carpool.modules.riderequest.mapper;

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
}
