package ca.utoronto.utsc.carpool.modules.ride;

import ca.utoronto.utsc.carpool.modules.ride.repository.RideRepository;
import ca.utoronto.utsc.carpool.modules.riderequest.repository.RideRequestRepository;
import ca.utoronto.utsc.carpool.modules.user.repository.UserRepository;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.Map;
import java.util.UUID;

import static org.hamcrest.Matchers.greaterThanOrEqualTo;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class RideControllerIntegrationTests {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private RideRepository rideRepository;

    @Autowired
    private RideRequestRepository rideRequestRepository;

    @Autowired
    private UserRepository userRepository;

    @AfterEach
    void cleanDatabase() {
        rideRequestRepository.deleteAll();
        rideRepository.deleteAll();
        userRepository.deleteAll();
    }

    @Test
    void protectedRideEndpointsRequireAuthentication() throws Exception {
        mockMvc.perform(get("/api/v1/rides"))
                .andExpect(status().isUnauthorized());

        mockMvc.perform(get("/api/v1/rides/me/stats"))
                .andExpect(status().isUnauthorized());

        mockMvc.perform(post("/api/v1/rides")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(validRideRequest())))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void authenticatedUserCanCreateAndFetchRide() throws Exception {
        String token = registerAndGetToken("driver-create@example.com");

        String createResponse = mockMvc.perform(post("/api/v1/rides")
                        .header("Authorization", bearer(token))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(validRideRequest())))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.origin").value("UTSC Student Centre"))
                .andExpect(jsonPath("$.data.destination").value("Scarborough Town Centre"))
                .andExpect(jsonPath("$.data.availableSeats").value(3))
                .andExpect(jsonPath("$.data.price").value(8.50))
                .andExpect(jsonPath("$.data.driverId").exists())
                .andExpect(jsonPath("$.data.createdAt").exists())
                .andExpect(jsonPath("$.data.updatedAt").exists())
                .andReturn()
                .getResponse()
                .getContentAsString();

        UUID rideId = UUID.fromString(objectMapper.readTree(createResponse).at("/data/id").asText());

        mockMvc.perform(get("/api/v1/rides/{id}", rideId)
                        .header("Authorization", bearer(token)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.id").value(rideId.toString()))
                .andExpect(jsonPath("$.data.driverName").value("Test Student"));

        mockMvc.perform(get("/api/v1/rides?page=0&size=10")
                        .header("Authorization", bearer(token)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.content.length()", greaterThanOrEqualTo(1)))
                .andExpect(jsonPath("$.data.page").value(0))
                .andExpect(jsonPath("$.data.size").value(10))
                .andExpect(jsonPath("$.data.totalElements", greaterThanOrEqualTo(1)));
    }

    @Test
    void rideCreationValidationRejectsInvalidFields() throws Exception {
        String token = registerAndGetToken("driver-validation@example.com");

        Map<String, Object> invalidRide = Map.of(
                "origin", "",
                "destination", "Scarborough Town Centre",
                "departureTime", Instant.now().minusSeconds(3600).toString(),
                "availableSeats", 0,
                "price", new BigDecimal("-1.00"),
                "notes", "Invalid ride"
        );

        mockMvc.perform(post("/api/v1/rides")
                        .header("Authorization", bearer(token))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(invalidRide)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.status").value(400))
                .andExpect(jsonPath("$.message").exists());
    }

    @Test
    void onlyRideOwnerCanDeleteRide() throws Exception {
        String ownerToken = registerAndGetToken("owner-delete@example.com");
        String otherUserToken = registerAndGetToken("other-delete@example.com");

        UUID rideId = createRideAndGetId(ownerToken);

        mockMvc.perform(delete("/api/v1/rides/{id}", rideId)
                        .header("Authorization", bearer(otherUserToken)))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.message").value("Only the ride owner can delete this ride"));

        mockMvc.perform(get("/api/v1/rides/{id}", rideId)
                        .header("Authorization", bearer(ownerToken)))
                .andExpect(status().isOk());

        mockMvc.perform(delete("/api/v1/rides/{id}", rideId)
                        .header("Authorization", bearer(ownerToken)))
                .andExpect(status().isNoContent());

        mockMvc.perform(get("/api/v1/rides/{id}", rideId)
                        .header("Authorization", bearer(ownerToken)))
                .andExpect(status().isNotFound());
    }

    @Test
    void driverRideStatsReturnCountsForCurrentDriverOnly() throws Exception {
        String driverToken = registerAndGetToken("stats-driver@example.com");
        String otherDriverToken = registerAndGetToken("stats-other-driver@example.com");
        String passengerOneToken = registerAndGetToken("stats-passenger-one@example.com");
        String passengerTwoToken = registerAndGetToken("stats-passenger-two@example.com");
        String otherPassengerToken = registerAndGetToken("stats-other-passenger@example.com");

        UUID firstRideId = createRideAndGetId(driverToken, 3);
        UUID secondRideId = createRideAndGetId(driverToken, 2);
        UUID otherRideId = createRideAndGetId(otherDriverToken, 5);
        UUID acceptedRequestId = createRequestAndGetId(passengerOneToken, secondRideId);

        createRequestAndGetId(passengerTwoToken, firstRideId);
        createRequestAndGetId(otherPassengerToken, otherRideId);

        mockMvc.perform(patch("/api/v1/requests/{requestId}/accept", acceptedRequestId)
                        .header("Authorization", bearer(driverToken)))
                .andExpect(status().isOk());

        mockMvc.perform(get("/api/v1/rides/me/stats")
                        .header("Authorization", bearer(driverToken)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.activeRides").value(2))
                .andExpect(jsonPath("$.data.pendingRequests").value(1))
                .andExpect(jsonPath("$.data.acceptedPassengers").value(1))
                .andExpect(jsonPath("$.data.totalRemainingSeats").value(4));

        mockMvc.perform(get("/api/v1/rides/me/stats")
                        .header("Authorization", bearer(otherDriverToken)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.activeRides").value(1))
                .andExpect(jsonPath("$.data.pendingRequests").value(1))
                .andExpect(jsonPath("$.data.acceptedPassengers").value(0))
                .andExpect(jsonPath("$.data.totalRemainingSeats").value(5));
    }

    @Test
    void driverRideStatsReturnZerosForEmptyAccount() throws Exception {
        String token = registerAndGetToken("stats-empty@example.com");

        mockMvc.perform(get("/api/v1/rides/me/stats")
                        .header("Authorization", bearer(token)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.activeRides").value(0))
                .andExpect(jsonPath("$.data.pendingRequests").value(0))
                .andExpect(jsonPath("$.data.acceptedPassengers").value(0))
                .andExpect(jsonPath("$.data.totalRemainingSeats").value(0));
    }

    private UUID createRideAndGetId(String token) throws Exception {
        return createRideAndGetId(token, 3);
    }

    private UUID createRideAndGetId(String token, int availableSeats) throws Exception {
        String response = mockMvc.perform(post("/api/v1/rides")
                        .header("Authorization", bearer(token))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(validRideRequest(availableSeats))))
                .andExpect(status().isCreated())
                .andReturn()
                .getResponse()
                .getContentAsString();

        return UUID.fromString(objectMapper.readTree(response).at("/data/id").asText());
    }

    private UUID createRequestAndGetId(String token, UUID rideId) throws Exception {
        String response = mockMvc.perform(post("/api/v1/rides/{rideId}/requests", rideId)
                        .header("Authorization", bearer(token)))
                .andExpect(status().isCreated())
                .andReturn()
                .getResponse()
                .getContentAsString();

        return UUID.fromString(objectMapper.readTree(response).at("/data/id").asText());
    }

    private String registerAndGetToken(String email) throws Exception {
        String response = mockMvc.perform(post("/api/v1/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of(
                                "email", email,
                                "password", "Password123",
                                "firstName", "Test",
                                "lastName", "Student"
                        ))))
                .andExpect(status().isCreated())
                .andReturn()
                .getResponse()
                .getContentAsString();

        JsonNode json = objectMapper.readTree(response);
        return json.at("/data/accessToken").asText();
    }

    private Map<String, Object> validRideRequest() {
        return validRideRequest(3);
    }

    private Map<String, Object> validRideRequest(int availableSeats) {
        return Map.of(
                "origin", "UTSC Student Centre",
                "destination", "Scarborough Town Centre",
                "departureTime", Instant.now().plusSeconds(86_400).toString(),
                "availableSeats", availableSeats,
                "price", new BigDecimal("8.50"),
                "notes", "Meet near the main entrance"
        );
    }

    private String bearer(String token) {
        return "Bearer " + token;
    }
}
