package ca.utoronto.utsc.carpool.modules.ride.service;

import ca.utoronto.utsc.carpool.common.api.PageResponse;
import ca.utoronto.utsc.carpool.common.error.ForbiddenOperationException;
import ca.utoronto.utsc.carpool.common.error.ResourceNotFoundException;
import ca.utoronto.utsc.carpool.modules.ride.dto.CreateRideRequest;
import ca.utoronto.utsc.carpool.modules.ride.dto.RideResponse;
import ca.utoronto.utsc.carpool.modules.ride.entity.Ride;
import ca.utoronto.utsc.carpool.modules.ride.mapper.RideMapper;
import ca.utoronto.utsc.carpool.modules.ride.repository.RideRepository;
import ca.utoronto.utsc.carpool.modules.user.entity.User;
import ca.utoronto.utsc.carpool.modules.user.repository.UserRepository;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
public class RideService {

    private final RideRepository rideRepository;
    private final UserRepository userRepository;

    public RideService(RideRepository rideRepository, UserRepository userRepository) {
        this.rideRepository = rideRepository;
        this.userRepository = userRepository;
    }

    @Transactional
    public RideResponse createRide(CreateRideRequest request, UUID driverId) {
        User driver = userRepository.getReferenceById(driverId);
        Ride ride = RideMapper.toEntity(request, driver);
        return RideMapper.toResponse(rideRepository.save(ride));
    }

    @Transactional(readOnly = true)
    public PageResponse<RideResponse> getRides(Pageable pageable) {
        return PageResponse.from(rideRepository.findAll(pageable).map(RideMapper::toResponse));
    }

    @Transactional(readOnly = true)
    public RideResponse getRide(UUID rideId) {
        return RideMapper.toResponse(findRideWithDriver(rideId));
    }

    @Transactional
    public void deleteRide(UUID rideId, UUID currentUserId) {
        Ride ride = findRideWithDriver(rideId);

        if (!ride.getDriver().getId().equals(currentUserId)) {
            throw new ForbiddenOperationException("Only the ride owner can delete this ride");
        }

        rideRepository.delete(ride);
    }

    private Ride findRideWithDriver(UUID rideId) {
        return rideRepository.findById(rideId)
                .orElseThrow(() -> new ResourceNotFoundException("Ride not found"));
    }
}
