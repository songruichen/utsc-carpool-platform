package ca.utoronto.utsc.carpool.modules.ride.controller;

import ca.utoronto.utsc.carpool.common.api.ApiResponse;
import ca.utoronto.utsc.carpool.common.api.PageResponse;
import ca.utoronto.utsc.carpool.modules.ride.dto.CreateRideRequest;
import ca.utoronto.utsc.carpool.modules.ride.dto.RideResponse;
import ca.utoronto.utsc.carpool.modules.ride.service.RideService;
import ca.utoronto.utsc.carpool.security.SecurityUserDetails;
import jakarta.validation.Valid;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.security.core.annotation.AuthenticationPrincipal;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/rides")
public class RideController {

    private final RideService rideService;

    public RideController(RideService rideService) {
        this.rideService = rideService;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ApiResponse<RideResponse> createRide(
            @Valid @RequestBody CreateRideRequest request,
            @AuthenticationPrincipal SecurityUserDetails currentUser
    ) {
        return ApiResponse.success("Ride created", rideService.createRide(request, currentUser.getId()));
    }

    @GetMapping
    public ApiResponse<PageResponse<RideResponse>> getRides(
            @PageableDefault(size = 20, sort = "departureTime", direction = Sort.Direction.ASC) Pageable pageable
    ) {
        return ApiResponse.success(rideService.getRides(pageable));
    }

    @GetMapping("/{id}")
    public ApiResponse<RideResponse> getRide(@PathVariable UUID id) {
        return ApiResponse.success(rideService.getRide(id));
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteRide(
            @PathVariable UUID id,
            @AuthenticationPrincipal SecurityUserDetails currentUser
    ) {
        rideService.deleteRide(id, currentUser.getId());
    }
}

