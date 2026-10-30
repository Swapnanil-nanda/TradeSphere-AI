package com.tradesphere.watchlist;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.tradesphere.TradeSphereApplication;
import com.tradesphere.common.security.JwtTokenProvider;
import com.tradesphere.common.security.UserPrincipal;
import com.tradesphere.modules.auth.entity.Role;
import com.tradesphere.modules.auth.entity.User;
import com.tradesphere.modules.auth.repository.RoleRepository;
import com.tradesphere.modules.auth.repository.UserRepository;
import com.tradesphere.modules.watchlist.dto.CreateWatchlistRequest;
import com.tradesphere.modules.watchlist.entity.Watchlist;
import com.tradesphere.modules.watchlist.repository.WatchlistRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest(classes = TradeSphereApplication.class)
@AutoConfigureMockMvc
@ActiveProfiles("test")
public class WatchlistSecurityTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private RoleRepository roleRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private WatchlistRepository watchlistRepository;

    @Autowired
    private JwtTokenProvider tokenProvider;

    private User userA;
    private User userB;
    private String tokenA;
    private String tokenB;

    @BeforeEach
    void setupUsers() {
        Role role = roleRepository.findByName("ROLE_USER").orElseGet(() -> roleRepository.save(new Role("ROLE_USER")));

        userA = userRepository.findByEmailIgnoreCase("usera@tradesphere.ai").orElseGet(() -> {
            User u = new User();
            u.setEmail("usera@tradesphere.ai");
            u.setPasswordHash(passwordEncoder.encode("PassUserA123!"));
            u.setFullName("User Alpha");
            u.getRoles().add(role);
            return userRepository.save(u);
        });

        userB = userRepository.findByEmailIgnoreCase("userb@tradesphere.ai").orElseGet(() -> {
            User u = new User();
            u.setEmail("userb@tradesphere.ai");
            u.setPasswordHash(passwordEncoder.encode("PassUserB123!"));
            u.setFullName("User Beta");
            u.getRoles().add(role);
            return userRepository.save(u);
        });

        tokenA = "Bearer " + tokenProvider.generateToken(new UserPrincipal(
                userA.getId(), userA.getEmail(), userA.getPasswordHash(), userA.getFullName(), userA.getTier(),
                List.of(new SimpleGrantedAuthority("ROLE_USER"))
        ));

        tokenB = "Bearer " + tokenProvider.generateToken(new UserPrincipal(
                userB.getId(), userB.getEmail(), userB.getPasswordHash(), userB.getFullName(), userB.getTier(),
                List.of(new SimpleGrantedAuthority("ROLE_USER"))
        ));
    }

    @Test
    @DisplayName("User-Level Authorization: User B cannot delete or access User A's custom watchlist")
    void testWatchlistOwnershipIsolation() throws Exception {
        // User A creates a watchlist
        CreateWatchlistRequest req = new CreateWatchlistRequest("Alpha Proprietary Basket");
        String createJson = mockMvc.perform(post("/api/watchlists")
                        .header("Authorization", tokenA)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isCreated())
                .andReturn().getResponse().getContentAsString();

        Long watchlistId = objectMapper.readTree(createJson).get("id").asLong();

        // User B attempts to delete User A's watchlist -> Must return 404 Resource Not Found (ownership isolation)
        mockMvc.perform(delete("/api/watchlists/" + watchlistId)
                        .header("Authorization", tokenB))
                .andExpect(status().isNotFound());

        // Verify watchlist still exists in database
        assertThat(watchlistRepository.findById(watchlistId)).isPresent();
    }
}
