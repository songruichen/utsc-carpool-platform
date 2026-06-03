package ca.utoronto.utsc.carpool.modules.riderequest.repository;

import java.util.UUID;

public interface RideRequestCountView {

    UUID getRideId();

    long getRequestCount();
}
