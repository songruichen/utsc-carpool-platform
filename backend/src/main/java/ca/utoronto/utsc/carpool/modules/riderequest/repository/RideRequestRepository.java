package ca.utoronto.utsc.carpool.modules.riderequest.repository;

import ca.utoronto.utsc.carpool.modules.riderequest.entity.RideRequest;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.Collection;
import java.util.UUID;

public interface RideRequestRepository extends JpaRepository<RideRequest, UUID> {

    boolean existsByRideIdAndPassengerId(UUID rideId, UUID passengerId);

    Optional<RideRequest> findByRideIdAndPassengerId(UUID rideId, UUID passengerId);

    List<RideRequest> findByPassengerIdAndRideIdIn(UUID passengerId, Collection<UUID> rideIds);

    @EntityGraph(attributePaths = {"ride", "passenger"})
    List<RideRequest> findByPassengerIdOrderByCreatedAtDesc(UUID passengerId);

    long countByRideId(UUID rideId);

    @Query("""
            select rr.ride.id as rideId, count(rr.id) as requestCount
            from RideRequest rr
            where rr.ride.id in :rideIds
            group by rr.ride.id
            """)
    List<RideRequestCountView> countByRideIds(@Param("rideIds") Collection<UUID> rideIds);

    @EntityGraph(attributePaths = {"ride.driver", "passenger"})
    List<RideRequest> findByRideIdOrderByCreatedAtAsc(UUID rideId);

    @Override
    @EntityGraph(attributePaths = {"ride.driver", "passenger"})
    Optional<RideRequest> findById(UUID id);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select rr from RideRequest rr join fetch rr.ride r join fetch r.driver join fetch rr.passenger where rr.id = :id")
    Optional<RideRequest> findByIdForUpdate(@Param("id") UUID id);

    @Query("""
            select
              coalesce(sum(case when rr.status = ca.utoronto.utsc.carpool.modules.riderequest.entity.RideRequestStatus.PENDING then 1 else 0 end), 0) as pendingRequests,
              coalesce(sum(case when rr.status = ca.utoronto.utsc.carpool.modules.riderequest.entity.RideRequestStatus.ACCEPTED then 1 else 0 end), 0) as acceptedPassengers
            from RideRequest rr
            where rr.ride.driver.id = :driverId
              and rr.ride.departureTime > :now
            """)
    DriverRideRequestStatsView getDriverRideRequestStats(
            @Param("driverId") UUID driverId,
            @Param("now") Instant now
    );
}
