package ca.utoronto.utsc.carpool.modules.auth.dto;

public record AuthResponse(
        String accessToken,
        String tokenType,
        long expiresInMs,
        AuthUserResponse user
) {
}

