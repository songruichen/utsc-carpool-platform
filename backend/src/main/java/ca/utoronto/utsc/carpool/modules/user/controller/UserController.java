package ca.utoronto.utsc.carpool.modules.user.controller;

import ca.utoronto.utsc.carpool.common.api.ApiResponse;
import ca.utoronto.utsc.carpool.modules.auth.dto.AuthUserResponse;
import ca.utoronto.utsc.carpool.modules.auth.mapper.AuthMapper;
import ca.utoronto.utsc.carpool.security.SecurityUserDetails;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/users")
public class UserController {

    @GetMapping("/me")
    public ApiResponse<AuthUserResponse> me(@AuthenticationPrincipal SecurityUserDetails currentUser) {
        return ApiResponse.success(AuthMapper.toAuthUserResponse(currentUser.getUser()));
    }
}

