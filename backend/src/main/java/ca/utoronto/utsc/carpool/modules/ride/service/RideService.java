package ca.utoronto.utsc.carpool.modules.ride.service;

import ca.utoronto.utsc.carpool.common.api.PageResponse;
import ca.utoronto.utsc.carpool.common.error.ForbiddenOperationException;
import ca.utoronto.utsc.carpool.common.error.ResourceNotFoundException;
import ca.utoronto.utsc.carpool.modules.ride.dto.CreateRideRequest;
import ca.utoronto.utsc.carpool.modules.ride.dto.RideResponse;
import ca.utoronto.utsc.carpool.modules.ride.entity.Ride;
import ca.utoronto.utsc.carpool.modules.ride.mapper.RideMapper;
import ca.utoronto.utsc.carpool.modules.ride.repository.RideRepository;
import ca.utoronto.utsc.carpool.modules.riderequest.entity.RideRequestStatus;
import ca.utoronto.utsc.carpool.modules.riderequest.repository.RideRequestCountView;
import ca.utoronto.utsc.carpool.modules.riderequest.repository.RideRequestRepository;
import ca.utoronto.utsc.carpool.modules.user.entity.User;
import ca.utoronto.utsc.carpool.modules.user.repository.UserRepository;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Page;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class RideService {

    private final RideRepository rideRepository;
    private final RideRequestRepository rideRequestRepository;
    private final UserRepository userRepository;

    public RideService(
            RideRepository rideRepository,
            RideRequestRepository rideRequestRepository,
            UserRepository userRepository
    ) {
        this.rideRepository = rideRepository;
        this.rideRequestRepository = rideRequestRepository;
        this.userRepository = userRepository;
    }

    @Transactional
    public RideResponse createRide(CreateRideRequest request, UUID driverId) {
        User driver = userRepository.getReferenceById(driverId);
        Ride ride = RideMapper.toEntity(request, driver);
        return RideMapper.toResponse(rideRepository.save(ride));
    }

    @Transactional(readOnly = true)
    public PageResponse<RideResponse> getRides(Pageable pageable, UUID currentUserId) {
        Page<Ride> rides = rideRepository.findAll(pageable);
        var rideIds = rides.map(Ride::getId).toList();
        Map<UUID, RideRequestStatus> requestStatuses = rideRequestRepository
                .findByPassengerIdAndRideIdIn(currentUserId, rideIds)
                .stream()
                .collect(Collectors.toMap(request -> request.getRide().getId(), request -> request.getStatus()));
        Map<UUID, Long> requestCounts = rideIds.isEmpty()
                ? Map.of()
                : rideRequestRepository.countByRideIds(rideIds)
                        .stream()
                        .collect(Collectors.toMap(RideRequestCountView::getRideId, RideRequestCountView::getRequestCount));
        return PageResponse.from(
                rides.map(ride -> RideMapper.toResponse(
                        ride,
                        requestStatuses.get(ride.getId()),
                        requestCounts.getOrDefault(ride.getId(), 0L)
                ))
        );
    }

    @Transactional(readOnly = true)
    public RideResponse getRide(UUID rideId, UUID currentUserId) {
        return toResponse(findRideWithDriver(rideId), currentUserId);
    }

    @Transactional
    public void deleteRide(UUID rideId, UUID currentUserId) {
        Ride ride = findRideWithDriver(rideId);

        if (!ride.getDriver().getId().equals(currentUserId)) {
            throw new ForbiddenOperationException("Only the ride owner can delete this ride");
        }

        rideRepository.delete(ride);
    }

    @Transactional
    public RideResponse updateRide(UUID rideId, CreateRideRequest request, UUID currentUserId) {
        Ride ride = findRideWithDriver(rideId);

        if (!ride.getDriver().getId().equals(currentUserId)) {
            throw new ForbiddenOperationException("Only the ride owner can edit this ride");
        }

        ride.setOrigin(request.origin());
        ride.setDestination(request.destination());
        ride.setDepartureTime(request.departureTime());
        ride.setAvailableSeats(request.availableSeats());
        ride.setPrice(request.price());
        ride.setNotes(request.notes());

        return toResponse(ride, currentUserId);
    }

    private Ride findRideWithDriver(UUID rideId) {
        return rideRepository.findById(rideId)
                .orElseThrow(() -> new ResourceNotFoundException("Ride not found"));
    }

    private RideResponse toResponse(Ride ride, UUID currentUserId) {
        RideRequestStatus requestStatus = rideRequestRepository.findByRideIdAndPassengerId(ride.getId(), currentUserId)
                .map(request -> request.getStatus())
                .orElse(null);
        return RideMapper.toResponse(ride, requestStatus, rideRequestRepository.countByRideId(ride.getId()));
    }
}
