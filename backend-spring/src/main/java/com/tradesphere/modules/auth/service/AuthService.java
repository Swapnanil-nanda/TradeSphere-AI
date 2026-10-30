package com.tradesphere.modules.auth.service;

import com.tradesphere.common.exception.TradeSphereException;
import com.tradesphere.common.security.JwtTokenProvider;
import com.tradesphere.common.security.UserPrincipal;
import com.tradesphere.modules.audit.service.AuditEventService;
import com.tradesphere.modules.auth.dto.AuthResponse;
import com.tradesphere.modules.auth.dto.LoginRequest;
import com.tradesphere.modules.auth.dto.RegisterRequest;
import com.tradesphere.modules.auth.entity.Role;
import com.tradesphere.modules.auth.entity.User;
import com.tradesphere.modules.auth.repository.RoleRepository;
import com.tradesphere.modules.auth.repository.UserRepository;
import com.tradesphere.modules.paper.service.PaperAccountService;
import com.tradesphere.modules.watchlist.service.WatchlistService;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtTokenProvider tokenProvider;
    private final PaperAccountService paperAccountService;
    private final WatchlistService watchlistService;
    private final AuditEventService auditEventService;

    public AuthService(
            UserRepository userRepository,
            RoleRepository roleRepository,
            PasswordEncoder passwordEncoder,
            AuthenticationManager authenticationManager,
            JwtTokenProvider tokenProvider,
            PaperAccountService paperAccountService,
            WatchlistService watchlistService,
            AuditEventService auditEventService) {
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
        this.passwordEncoder = passwordEncoder;
        this.authenticationManager = authenticationManager;
        this.tokenProvider = tokenProvider;
        this.paperAccountService = paperAccountService;
        this.watchlistService = watchlistService;
        this.auditEventService = auditEventService;
    }

    @Transactional
    public AuthResponse register(RegisterRequest req) {
        if (userRepository.existsByEmailIgnoreCase(req.getEmail())) {
            throw new TradeSphereException("Email address is already registered: " + req.getEmail());
        }

        User user = new User();
        user.setEmail(req.getEmail().trim().toLowerCase());
        user.setPasswordHash(passwordEncoder.encode(req.getPassword()));
        user.setFullName(req.getFullName().trim());
        if (req.getTier() != null && !req.getTier().isBlank()) {
            user.setTier(req.getTier().toUpperCase());
        }

        Role userRole = roleRepository.findByName("ROLE_USER")
                .orElseGet(() -> roleRepository.save(new Role("ROLE_USER")));
        user.getRoles().add(userRole);

        User savedUser = userRepository.save(user);

        // Provision paper account & default watchlist
        paperAccountService.provisionDefaultAccount(savedUser);
        watchlistService.provisionDefaultWatchlist(savedUser);

        // Audit log
        auditEventService.logEvent(savedUser.getId(), "USER_REGISTER",
                String.format("User registered successfully with tier %s", savedUser.getTier()));

        // Build UserPrincipal & Token
        var authorities = savedUser.getRoles().stream()
                .map(r -> (GrantedAuthority) r::getName)
                .collect(Collectors.toList());

        UserPrincipal principal = new UserPrincipal(
                savedUser.getId(),
                savedUser.getEmail(),
                savedUser.getPasswordHash(),
                savedUser.getFullName(),
                savedUser.getTier(),
                authorities
        );

        String token = tokenProvider.generateToken(principal);

        return new AuthResponse(
                token,
                savedUser.getId(),
                savedUser.getEmail(),
                savedUser.getFullName(),
                savedUser.getTier(),
                authorities.stream().map(GrantedAuthority::getAuthority).collect(Collectors.toList())
        );
    }

    @Transactional
    public AuthResponse login(LoginRequest req) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(req.getEmail().trim().toLowerCase(), req.getPassword())
        );

        UserPrincipal principal = (UserPrincipal) authentication.getPrincipal();
        String token = tokenProvider.generateToken(principal);

        auditEventService.logEvent(principal.getId(), "USER_LOGIN", "User authenticated successfully via JWT");

        List<String> roles = principal.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .collect(Collectors.toList());

        return new AuthResponse(
                token,
                principal.getId(),
                principal.getUsername(),
                principal.getFullName(),
                principal.getTier(),
                roles
        );
    }
}
