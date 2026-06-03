package ca.utoronto.utsc.carpool.modules.riderequest.repository;

public interface DriverRideRequestStatsView {
    long getPendingRequests();

    long getAcceptedPassengers();
}
