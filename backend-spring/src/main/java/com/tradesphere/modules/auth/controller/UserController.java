package com.tradesphere.modules.auth.controller;

import com.tradesphere.common.security.UserPrincipal;
import com.tradesphere.modules.auth.dto.UpdateProfileRequest;
import com.tradesphere.modules.auth.dto.UserProfileResponse;
import com.tradesphere.modules.auth.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users")
@Tag(name = "User Profiles", description = "User profile preferences, risk caps, and progressive complexity tier")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping("/me")
    @Operation(summary = "Get current authenticated user profile")
    public ResponseEntity<UserProfileResponse> getCurrentUser(@AuthenticationPrincipal UserPrincipal principal) {
        UserProfileResponse response = userService.getProfile(principal.getId());
        return ResponseEntity.ok(response);
    }

    @PutMapping("/me")
    @Operation(summary = "Update authenticated user profile, tier, and risk cap")
    public ResponseEntity<UserProfileResponse> updateCurrentUser(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody UpdateProfileRequest request) {
        UserProfileResponse response = userService.updateProfile(principal.getId(), request);
        return ResponseEntity.ok(response);
    }
}
