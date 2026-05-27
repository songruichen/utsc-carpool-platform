package ca.utoronto.utsc.carpool.modules.ride.repository;

import ca.utoronto.utsc.carpool.modules.ride.entity.Ride;
import jakarta.persistence.LockModeType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;
import java.util.UUID;

public interface RideRepository extends JpaRepository<Ride, UUID> {

    @Override
    @EntityGraph(attributePaths = "driver")
    Page<Ride> findAll(Pageable pageable);

    @Override
    @EntityGraph(attributePaths = "driver")
    Optional<Ride> findById(UUID id);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select r from Ride r join fetch r.driver where r.id = :id")
    Optional<Ride> findByIdForUpdate(@Param("id") UUID id);
}
