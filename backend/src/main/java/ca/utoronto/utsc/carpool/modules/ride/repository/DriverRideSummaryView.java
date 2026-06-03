package ca.utoronto.utsc.carpool.modules.ride.repository;

public interface DriverRideSummaryView {
    long getActiveRides();

    long getTotalRemainingSeats();
}
