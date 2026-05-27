package ca.utoronto.utsc.carpool.modules.auth.dto;

import ca.utoronto.utsc.carpool.modules.user.entity.Role;

import java.util.UUID;

public record AuthUserResponse(
        UUID id,
        String email,
        String firstName,
        String lastName,
        Role role
) {
}

