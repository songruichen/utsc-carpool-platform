package ca.utoronto.utsc.carpool.modules.riderequest.service;

import ca.utoronto.utsc.carpool.common.error.ForbiddenOperationException;
import ca.utoronto.utsc.carpool.common.error.ResourceNotFoundException;
import ca.utoronto.utsc.carpool.modules.ride.entity.Ride;
import ca.utoronto.utsc.carpool.modules.ride.repository.RideRepository;
import ca.utoronto.utsc.carpool.modules.riderequest.dto.PassengerRideRequestResponse;
import ca.utoronto.utsc.carpool.modules.riderequest.dto.RideRequestResponse;
import ca.utoronto.utsc.carpool.modules.riderequest.entity.RideRequest;
import ca.utoronto.utsc.carpool.modules.riderequest.entity.RideRequestStatus;
import ca.utoronto.utsc.carpool.modules.riderequest.mapper.RideRequestMapper;
import ca.utoronto.utsc.carpool.modules.riderequest.repository.RideRequestRepository;
import ca.utoronto.utsc.carpool.modules.user.entity.User;
import ca.utoronto.utsc.carpool.modules.user.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
public class RideRequestService {

    private final RideRepository rideRepository;
    private final RideRequestRepository rideRequestRepository;
    private final UserRepository userRepository;

    public RideRequestService(
            RideRepository rideRepository,
            RideRequestRepository rideRequestRepository,
            UserRepository userRepository
    ) {
        this.rideRepository = rideRepository;
        this.rideRequestRepository = rideRequestRepository;
        this.userRepository = userRepository;
    }

    @Transactional
    public RideRequestResponse createRequest(UUID rideId, UUID passengerId) {
        Ride ride = findRideForUpdate(rideId);

        if (ride.getDriver().getId().equals(passengerId)) {
            throw new ForbiddenOperationException("Drivers cannot request seats in their own rides");
        }

        if (ride.getAvailableSeats() <= 0) {
            throw new IllegalArgumentException("This ride has no available seats");
        }

        if (rideRequestRepository.existsByRideIdAndPassengerId(rideId, passengerId)) {
            throw new IllegalArgumentException("You have already requested a seat in this ride");
        }

        User passenger = userRepository.getReferenceById(passengerId);
        RideRequest rideRequest = new RideRequest();
        rideRequest.setRide(ride);
        rideRequest.setPassenger(passenger);

        return RideRequestMapper.toResponse(rideRequestRepository.save(rideRequest));
    }

    @Transactional(readOnly = true)
    public List<RideRequestResponse> getRideRequests(UUID rideId, UUID currentUserId) {
        Ride ride = rideRepository.findById(rideId)
                .orElseThrow(() -> new ResourceNotFoundException("Ride not found"));

        if (!ride.getDriver().getId().equals(currentUserId)) {
            throw new ForbiddenOperationException("Only the ride owner can view ride requests");
        }

        return rideRequestRepository.findByRideIdOrderByCreatedAtAsc(rideId).stream()
                .map(RideRequestMapper::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<PassengerRideRequestResponse> getPassengerRequests(UUID passengerId) {
        return rideRequestRepository.findByPassengerIdOrderByCreatedAtDesc(passengerId).stream()
                .map(RideRequestMapper::toPassengerResponse)
                .toList();
    }

    @Transactional
    public RideRequestResponse acceptRequest(UUID requestId, UUID currentUserId) {
        RideRequest rideRequest = findRequestForUpdate(requestId);
        Ride ride = findRideForUpdate(rideRequest.getRide().getId());
        requireRideOwner(ride, currentUserId, "Only the ride owner can accept requests");

        if (rideRequest.getStatus() != RideRequestStatus.PENDING) {
            throw new IllegalArgumentException("Only pending requests can be accepted");
        }

        if (ride.getAvailableSeats() <= 0) {
            throw new IllegalArgumentException("This ride has no available seats");
        }

        ride.reserveSeat();
        rideRequest.setStatus(RideRequestStatus.ACCEPTED);

        return RideRequestMapper.toResponse(rideRequest);
    }

    @Transactional
    public RideRequestResponse rejectRequest(UUID requestId, UUID currentUserId) {
        RideRequest rideRequest = findRequestForUpdate(requestId);
        requireRideOwner(rideRequest.getRide(), currentUserId, "Only the ride owner can reject requests");

        if (rideRequest.getStatus() != RideRequestStatus.PENDING) {
            throw new IllegalArgumentException("Only pending requests can be rejected");
        }

        rideRequest.setStatus(RideRequestStatus.REJECTED);
        return RideRequestMapper.toResponse(rideRequest);
    }

    @Transactional
    public void cancelRequest(UUID requestId, UUID currentUserId) {
        RideRequest rideRequest = findRequestForUpdate(requestId);

        if (!rideRequest.getPassenger().getId().equals(currentUserId)) {
            throw new ForbiddenOperationException("Only the passenger can cancel this request");
        }

        if (rideRequest.getStatus() == RideRequestStatus.CANCELLED) {
            return;
        }

        if (rideRequest.getStatus() == RideRequestStatus.REJECTED) {
            throw new IllegalArgumentException("Rejected requests cannot be cancelled");
        }

        if (rideRequest.getStatus() == RideRequestStatus.ACCEPTED) {
            Ride ride = findRideForUpdate(rideRequest.getRide().getId());
            ride.releaseSeat();
        }

        rideRequest.setStatus(RideRequestStatus.CANCELLED);
    }

    private Ride findRideForUpdate(UUID rideId) {
        return rideRepository.findByIdForUpdate(rideId)
                .orElseThrow(() -> new ResourceNotFoundException("Ride not found"));
    }

    private RideRequest findRequestForUpdate(UUID requestId) {
        return rideRequestRepository.findByIdForUpdate(requestId)
                .orElseThrow(() -> new ResourceNotFoundException("Ride request not found"));
    }

    private void requireRideOwner(Ride ride, UUID currentUserId, String message) {
        if (!ride.getDriver().getId().equals(currentUserId)) {
            throw new ForbiddenOperationException(message);
        }
    }
}
