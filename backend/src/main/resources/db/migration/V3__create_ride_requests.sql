ALTER TABLE rides DROP CONSTRAINT chk_rides_available_seats;
ALTER TABLE rides ADD CONSTRAINT chk_rides_available_seats CHECK (available_seats BETWEEN 0 AND 8);

CREATE TABLE ride_requests (
    id UUID PRIMARY KEY,
    ride_id UUID NOT NULL,
    passenger_id UUID NOT NULL,
    status VARCHAR(40) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL,
    CONSTRAINT fk_ride_requests_ride FOREIGN KEY (ride_id) REFERENCES rides (id),
    CONSTRAINT fk_ride_requests_passenger FOREIGN KEY (passenger_id) REFERENCES users (id),
    CONSTRAINT uk_ride_requests_ride_passenger UNIQUE (ride_id, passenger_id),
    CONSTRAINT chk_ride_requests_status CHECK (status IN ('PENDING', 'ACCEPTED', 'REJECTED', 'CANCELLED'))
);

CREATE INDEX idx_ride_requests_ride_id ON ride_requests (ride_id);
CREATE INDEX idx_ride_requests_passenger_id ON ride_requests (passenger_id);
CREATE INDEX idx_ride_requests_status ON ride_requests (status);
