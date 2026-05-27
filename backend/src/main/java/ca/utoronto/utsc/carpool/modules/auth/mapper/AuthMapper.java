package ca.utoronto.utsc.carpool.modules.auth.mapper;

import ca.utoronto.utsc.carpool.modules.auth.dto.AuthUserResponse;
import ca.utoronto.utsc.carpool.modules.user.entity.User;

public final class AuthMapper {

    private AuthMapper() {
    }

    public static AuthUserResponse toAuthUserResponse(User user) {
        return new AuthUserResponse(
                user.getId(),
                user.getEmail(),
                user.getFirstName(),
                user.getLastName(),
                user.getRole()
        );
    }
}

