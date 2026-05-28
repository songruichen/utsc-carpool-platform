CREATE TABLE rides (
    id UUID PRIMARY KEY,
    driver_id UUID NOT NULL,
    origin VARCHAR(255) NOT NULL,
    destination VARCHAR(255) NOT NULL,
    departure_time TIMESTAMP WITH TIME ZONE NOT NULL,
    available_seats INTEGER NOT NULL,
    price NUMERIC(8, 2) NOT NULL,
    notes VARCHAR(1000),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL,
    CONSTRAINT fk_rides_driver FOREIGN KEY (driver_id) REFERENCES users (id),
    CONSTRAINT chk_rides_available_seats CHECK (available_seats BETWEEN 1 AND 8),
    CONSTRAINT chk_rides_price CHECK (price >= 0)
);

CREATE INDEX idx_rides_driver_id ON rides (driver_id);
CREATE INDEX idx_rides_departure_time ON rides (departure_time);

