package ca.utoronto.utsc.carpool.modules.riderequest;

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

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class RideRequestControllerIntegrationTests {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private RideRequestRepository rideRequestRepository;

    @Autowired
    private RideRepository rideRepository;

    @Autowired
    private UserRepository userRepository;

    @AfterEach
    void cleanDatabase() {
        rideRequestRepository.deleteAll();
        rideRepository.deleteAll();
        userRepository.deleteAll();
    }

    @Test
    void authenticatedPassengerCanCreateRideRequest() throws Exception {
        String driverToken = registerAndGetToken("request-driver@example.com");
        String passengerToken = registerAndGetToken("request-passenger@example.com");
        UUID rideId = createRideAndGetId(driverToken, 2);

        mockMvc.perform(post("/api/v1/rides/{rideId}/requests", rideId)
                        .header("Authorization", bearer(passengerToken)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.rideId").value(rideId.toString()))
                .andExpect(jsonPath("$.data.status").value("PENDING"))
                .andExpect(jsonPath("$.data.passengerId").exists())
                .andExpect(jsonPath("$.data.createdAt").exists())
                .andExpect(jsonPath("$.data.updatedAt").exists());

        mockMvc.perform(get("/api/v1/rides/{id}", rideId)
                        .header("Authorization", bearer(passengerToken)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.currentUserRequestStatus").value("PENDING"));

        mockMvc.perform(get("/api/v1/rides")
                        .header("Authorization", bearer(passengerToken)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.content[0].currentUserRequestStatus").value("PENDING"));
    }

    @Test
    void protectedRequestEndpointsRequireAuthentication() throws Exception {
        String driverToken = registerAndGetToken("protected-driver@example.com");
        UUID rideId = createRideAndGetId(driverToken, 1);

        mockMvc.perform(post("/api/v1/rides/{rideId}/requests", rideId))
                .andExpect(status().isUnauthorized());

        mockMvc.perform(get("/api/v1/rides/{rideId}/requests", rideId))
                .andExpect(status().isUnauthorized());

        mockMvc.perform(patch("/api/v1/requests/{requestId}/accept", UUID.randomUUID()))
                .andExpect(status().isUnauthorized());

        mockMvc.perform(get("/api/v1/requests/me"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void passengerCanViewOnlyTheirOwnRequests() throws Exception {
        String driverToken = registerAndGetToken("mine-driver@example.com");
        String passengerOneToken = registerAndGetToken("mine-passenger-one@example.com");
        String passengerTwoToken = registerAndGetToken("mine-passenger-two@example.com");
        UUID firstRideId = createRideAndGetId(driverToken, 2);
        UUID secondRideId = createRideAndGetId(driverToken, 3);
        UUID passengerOneRequestId = createRequestAndGetId(passengerOneToken, firstRideId);

        createRequestAndGetId(passengerTwoToken, secondRideId);

        mockMvc.perform(get("/api/v1/requests/me")
                        .header("Authorization", bearer(passengerOneToken)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.length()").value(1))
                .andExpect(jsonPath("$.data[0].id").value(passengerOneRequestId.toString()))
                .andExpect(jsonPath("$.data[0].rideId").value(firstRideId.toString()))
                .andExpect(jsonPath("$.data[0].rideOrigin").value("UTSC Student Centre"))
                .andExpect(jsonPath("$.data[0].rideDestination").value("Scarborough Town Centre"))
                .andExpect(jsonPath("$.data[0].rideDepartureTime").exists())
                .andExpect(jsonPath("$.data[0].rideAvailableSeats").value(2))
                .andExpect(jsonPath("$.data[0].status").value("PENDING"));
    }

    @Test
    void duplicateRequestsAndDriverSelfRequestsAreRejected() throws Exception {
        String driverToken = registerAndGetToken("duplicate-driver@example.com");
        String passengerToken = registerAndGetToken("duplicate-passenger@example.com");
        UUID rideId = createRideAndGetId(driverToken, 2);

        mockMvc.perform(post("/api/v1/rides/{rideId}/requests", rideId)
                        .header("Authorization", bearer(driverToken)))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.message").value("Drivers cannot request seats in their own rides"));

        createRequestAndGetId(passengerToken, rideId);

        mockMvc.perform(post("/api/v1/rides/{rideId}/requests", rideId)
                        .header("Authorization", bearer(passengerToken)))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.message").value("You have already requested a seat in this ride"));
    }

    @Test
    void onlyRideOwnerCanViewAcceptAndRejectRequests() throws Exception {
        String driverToken = registerAndGetToken("owner-driver@example.com");
        String otherDriverToken = registerAndGetToken("owner-other@example.com");
        String passengerToken = registerAndGetToken("owner-passenger@example.com");
        UUID rideId = createRideAndGetId(driverToken, 2);
        UUID requestId = createRequestAndGetId(passengerToken, rideId);

        mockMvc.perform(get("/api/v1/rides/{rideId}/requests", rideId)
                        .header("Authorization", bearer(passengerToken)))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.message").value("Only the ride owner can view ride requests"));

        mockMvc.perform(patch("/api/v1/requests/{requestId}/accept", requestId)
                        .header("Authorization", bearer(otherDriverToken)))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.message").value("Only the ride owner can accept requests"));

        mockMvc.perform(get("/api/v1/rides/{rideId}/requests", rideId)
                        .header("Authorization", bearer(driverToken)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.length()").value(1))
                .andExpect(jsonPath("$.data[0].id").value(requestId.toString()));
    }

    @Test
    void acceptRejectAndCancelFlowUpdatesRequestStatusesAndSeats() throws Exception {
        String driverToken = registerAndGetToken("flow-driver@example.com");
        String passengerOneToken = registerAndGetToken("flow-passenger-one@example.com");
        String passengerTwoToken = registerAndGetToken("flow-passenger-two@example.com");
        UUID rideId = createRideAndGetId(driverToken, 2);
        UUID acceptedRequestId = createRequestAndGetId(passengerOneToken, rideId);
        UUID rejectedRequestId = createRequestAndGetId(passengerTwoToken, rideId);

        mockMvc.perform(patch("/api/v1/requests/{requestId}/accept", acceptedRequestId)
                        .header("Authorization", bearer(driverToken)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.status").value("ACCEPTED"));

        mockMvc.perform(get("/api/v1/rides/{id}", rideId)
                        .header("Authorization", bearer(driverToken)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.availableSeats").value(1));

        mockMvc.perform(patch("/api/v1/requests/{requestId}/reject", rejectedRequestId)
                        .header("Authorization", bearer(driverToken)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.status").value("REJECTED"));

        mockMvc.perform(delete("/api/v1/requests/{requestId}", acceptedRequestId)
                        .header("Authorization", bearer(passengerOneToken)))
                .andExpect(status().isNoContent());

        mockMvc.perform(get("/api/v1/rides/{id}", rideId)
                        .header("Authorization", bearer(driverToken)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.availableSeats").value(2));
    }

    @Test
    void overbookingIsPreventedWhenSeatsAreFull() throws Exception {
        String driverToken = registerAndGetToken("full-driver@example.com");
        String passengerOneToken = registerAndGetToken("full-passenger-one@example.com");
        String passengerTwoToken = registerAndGetToken("full-passenger-two@example.com");
        String passengerThreeToken = registerAndGetToken("full-passenger-three@example.com");
        UUID rideId = createRideAndGetId(driverToken, 1);
        UUID firstRequestId = createRequestAndGetId(passengerOneToken, rideId);
        UUID secondRequestId = createRequestAndGetId(passengerTwoToken, rideId);

        mockMvc.perform(patch("/api/v1/requests/{requestId}/accept", firstRequestId)
                        .header("Authorization", bearer(driverToken)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.status").value("ACCEPTED"));

        mockMvc.perform(patch("/api/v1/requests/{requestId}/accept", secondRequestId)
                        .header("Authorization", bearer(driverToken)))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.message").value("This ride has no available seats"));

        mockMvc.perform(post("/api/v1/rides/{rideId}/requests", rideId)
                        .header("Authorization", bearer(passengerThreeToken)))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.message").value("This ride has no available seats"));

        mockMvc.perform(get("/api/v1/rides/{id}", rideId)
                        .header("Authorization", bearer(driverToken)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.availableSeats").value(0));
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
