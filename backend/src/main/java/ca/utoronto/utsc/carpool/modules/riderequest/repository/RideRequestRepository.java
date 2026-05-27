package ca.utoronto.utsc.carpool.modules.riderequest.repository;

import ca.utoronto.utsc.carpool.modules.riderequest.entity.RideRequest;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface RideRequestRepository extends JpaRepository<RideRequest, UUID> {

    boolean existsByRideIdAndPassengerId(UUID rideId, UUID passengerId);

    @EntityGraph(attributePaths = {"ride.driver", "passenger"})
    List<RideRequest> findByRideIdOrderByCreatedAtAsc(UUID rideId);

    @Override
    @EntityGraph(attributePaths = {"ride.driver", "passenger"})
    Optional<RideRequest> findById(UUID id);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select rr from RideRequest rr join fetch rr.ride r join fetch r.driver join fetch rr.passenger where rr.id = :id")
    Optional<RideRequest> findByIdForUpdate(@Param("id") UUID id);
}
