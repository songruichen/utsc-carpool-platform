package ca.utoronto.utsc.carpool.modules.riderequest.controller;

import ca.utoronto.utsc.carpool.common.api.ApiResponse;
import ca.utoronto.utsc.carpool.modules.riderequest.dto.PassengerRideRequestResponse;
import ca.utoronto.utsc.carpool.modules.riderequest.dto.RideRequestResponse;
import ca.utoronto.utsc.carpool.modules.riderequest.service.RideRequestService;
import ca.utoronto.utsc.carpool.security.SecurityUserDetails;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1")
public class RideRequestController {

    private final RideRequestService rideRequestService;

    public RideRequestController(RideRequestService rideRequestService) {
        this.rideRequestService = rideRequestService;
    }

    @PostMapping("/rides/{rideId}/requests")
    @ResponseStatus(HttpStatus.CREATED)
    public ApiResponse<RideRequestResponse> createRequest(
            @PathVariable UUID rideId,
            @AuthenticationPrincipal SecurityUserDetails currentUser
    ) {
        return ApiResponse.success("Ride request created", rideRequestService.createRequest(rideId, currentUser.getId()));
    }

    @GetMapping("/rides/{rideId}/requests")
    public ApiResponse<List<RideRequestResponse>> getRideRequests(
            @PathVariable UUID rideId,
            @AuthenticationPrincipal SecurityUserDetails currentUser
    ) {
        return ApiResponse.success(rideRequestService.getRideRequests(rideId, currentUser.getId()));
    }

    @GetMapping("/requests/me")
    public ApiResponse<List<PassengerRideRequestResponse>> getMyRequests(
            @AuthenticationPrincipal SecurityUserDetails currentUser
    ) {
        return ApiResponse.success(rideRequestService.getPassengerRequests(currentUser.getId()));
    }

    @PatchMapping("/requests/{requestId}/accept")
    public ApiResponse<RideRequestResponse> acceptRequest(
            @PathVariable UUID requestId,
            @AuthenticationPrincipal SecurityUserDetails currentUser
    ) {
        return ApiResponse.success("Ride request accepted", rideRequestService.acceptRequest(requestId, currentUser.getId()));
    }

    @PatchMapping("/requests/{requestId}/reject")
    public ApiResponse<RideRequestResponse> rejectRequest(
            @PathVariable UUID requestId,
            @AuthenticationPrincipal SecurityUserDetails currentUser
    ) {
        return ApiResponse.success("Ride request rejected", rideRequestService.rejectRequest(requestId, currentUser.getId()));
    }

    @DeleteMapping("/requests/{requestId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void cancelRequest(
            @PathVariable UUID requestId,
            @AuthenticationPrincipal SecurityUserDetails currentUser
    ) {
        rideRequestService.cancelRequest(requestId, currentUser.getId());
    }
}
