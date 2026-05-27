package ca.utoronto.utsc.carpool.modules.ride.repository;

import ca.utoronto.utsc.carpool.modules.ride.entity.Ride;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface RideRepository extends JpaRepository<Ride, UUID> {

    @Override
    @EntityGraph(attributePaths = "driver")
    Page<Ride> findAll(Pageable pageable);

    @Override
    @EntityGraph(attributePaths = "driver")
    Optional<Ride> findById(UUID id);
}
