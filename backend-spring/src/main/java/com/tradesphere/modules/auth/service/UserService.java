package com.tradesphere.modules.auth.service;

import com.tradesphere.common.exception.ResourceNotFoundException;
import com.tradesphere.modules.audit.service.AuditEventService;
import com.tradesphere.modules.auth.dto.UpdateProfileRequest;
import com.tradesphere.modules.auth.dto.UserProfileResponse;
import com.tradesphere.modules.auth.entity.Role;
import com.tradesphere.modules.auth.entity.User;
import com.tradesphere.modules.auth.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.stream.Collectors;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final AuditEventService auditEventService;

    public UserService(UserRepository userRepository, AuditEventService auditEventService) {
        this.userRepository = userRepository;
        this.auditEventService = auditEventService;
    }

    @Transactional(readOnly = true)
    public UserProfileResponse getProfile(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));

        return toProfileResponse(user);
    }

    @Transactional
    public UserProfileResponse updateProfile(Long userId, UpdateProfileRequest req) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));

        if (req.getFullName() != null && !req.getFullName().isBlank()) {
            user.setFullName(req.getFullName().trim());
        }
        if (req.getTier() != null && !req.getTier().isBlank()) {
            user.setTier(req.getTier().toUpperCase());
        }
        if (req.getRiskCapPct() != null) {
            user.setRiskCapPct(req.getRiskCapPct());
        }
        if (req.getDailyDrawdownLimitPct() != null) {
            user.setDailyDrawdownLimitPct(req.getDailyDrawdownLimitPct());
        }

        user.setUpdatedAt(Instant.now());
        User saved = userRepository.save(user);

        auditEventService.logEvent(userId, "PROFILE_UPDATED",
                String.format("Updated profile: tier=%s, riskCap=%s%%", saved.getTier(), saved.getRiskCapPct()));

        return toProfileResponse(saved);
    }

    private UserProfileResponse toProfileResponse(User user) {
        UserProfileResponse res = new UserProfileResponse();
        res.setId(user.getId());
        res.setEmail(user.getEmail());
        res.setFullName(user.getFullName());
        res.setTier(user.getTier());
        res.setRiskCapPct(user.getRiskCapPct());
        res.setDailyDrawdownLimitPct(user.getDailyDrawdownLimitPct());
        res.setRoles(user.getRoles().stream().map(Role::getName).collect(Collectors.toList()));
        res.setCreatedAt(user.getCreatedAt());
        return res;
    }
}
