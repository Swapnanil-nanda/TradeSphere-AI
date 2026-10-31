package com.tradesphere.watchlist;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.tradesphere.TradeSphereApplication;
import com.tradesphere.common.security.JwtTokenProvider;
import com.tradesphere.common.security.UserPrincipal;
import com.tradesphere.modules.auth.entity.Role;
import com.tradesphere.modules.auth.entity.User;
import com.tradesphere.modules.auth.repository.RoleRepository;
import com.tradesphere.modules.auth.repository.UserRepository;
import com.tradesphere.modules.watchlist.dto.*;
import com.tradesphere.modules.watchlist.entity.Watchlist;
import com.tradesphere.modules.watchlist.repository.WatchlistAlertRepository;
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

import java.math.BigDecimal;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
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
    private WatchlistAlertRepository watchlistAlertRepository;

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
    @DisplayName("User-Level Authorization: User B cannot delete or access User A's custom watchlist (IDOR / BOLA Prevention)")
    void testWatchlistOwnershipIsolation() throws Exception {
        // User A creates a watchlist
        CreateWatchlistRequest req = new CreateWatchlistRequest("Alpha Proprietary Basket");
        String createJson = mockMvc.perform(post("/api/v1/watchlists")
                        .header("Authorization", tokenA)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isCreated())
                .andReturn().getResponse().getContentAsString();

        Long watchlistId = objectMapper.readTree(createJson).get("id").asLong();

        // User B attempts to read User A's watchlist -> Must return 404
        mockMvc.perform(get("/api/v1/watchlists/" + watchlistId)
                        .header("Authorization", tokenB))
                .andExpect(status().isNotFound());

        // User B attempts to rename User A's watchlist -> Must return 404
        UpdateWatchlistRequest renameReq = new UpdateWatchlistRequest("Hacked Basket Name");
        mockMvc.perform(patch("/api/v1/watchlists/" + watchlistId)
                        .header("Authorization", tokenB)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(renameReq)))
                .andExpect(status().isNotFound());

        // User B attempts to add an instrument to User A's watchlist -> Must return 404
        AddWatchlistItemRequest addReq = new AddWatchlistItemRequest("INFY");
        mockMvc.perform(post("/api/v1/watchlists/" + watchlistId + "/items")
                        .header("Authorization", tokenB)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(addReq)))
                .andExpect(status().isNotFound());

        // User B attempts to fetch quotes for User A's watchlist -> Must return 404
        mockMvc.perform(get("/api/v1/watchlists/" + watchlistId + "/quotes")
                        .header("Authorization", tokenB))
                .andExpect(status().isNotFound());

        // User B attempts to delete User A's watchlist -> Must return 404
        mockMvc.perform(delete("/api/v1/watchlists/" + watchlistId)
                        .header("Authorization", tokenB))
                .andExpect(status().isNotFound());

        // Verify watchlist still exists and is untouched in database
        assertThat(watchlistRepository.findById(watchlistId)).isPresent();
    }

    @Test
    @DisplayName("Input Validation & XSS Sanitization: Dangerous script tags are sanitized")
    void testXssSanitization() throws Exception {
        CreateWatchlistRequest req = new CreateWatchlistRequest("<script>alert('xss')</script> Tech Leaders");
        String resJson = mockMvc.perform(post("/api/v1/watchlists")
                        .header("Authorization", tokenA)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isCreated())
                .andReturn().getResponse().getContentAsString();

        String name = objectMapper.readTree(resJson).get("name").asText();
        assertThat(name).doesNotContain("<script>");
        assertThat(name).contains("&lt;script&gt;");
    }

    @Test
    @DisplayName("Constituent Management: Add, Reorder, Quotes, and Duplicate Workflow")
    void testConstituentLifecycle() throws Exception {
        // 1. User A creates watchlist
        CreateWatchlistRequest req = new CreateWatchlistRequest("Swing Strategy Watch");
        String createJson = mockMvc.perform(post("/api/v1/watchlists")
                        .header("Authorization", tokenA)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isCreated())
                .andReturn().getResponse().getContentAsString();

        Long wlId = objectMapper.readTree(createJson).get("id").asLong();

        // 2. Add RELIANCE and TCS
        mockMvc.perform(post("/api/v1/watchlists/" + wlId + "/items")
                        .header("Authorization", tokenA)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new AddWatchlistItemRequest("RELIANCE"))))
                .andExpect(status().isOk());

        mockMvc.perform(post("/api/v1/watchlists/" + wlId + "/items")
                        .header("Authorization", tokenA)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new AddWatchlistItemRequest("TCS"))))
                .andExpect(status().isOk());

        // 3. Reorder: TCS first, RELIANCE second
        ReorderItemsRequest reorderReq = new ReorderItemsRequest(List.of("TCS", "RELIANCE"));
        mockMvc.perform(patch("/api/v1/watchlists/" + wlId + "/items/reorder")
                        .header("Authorization", tokenA)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(reorderReq)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.instruments[0].symbol").value("TCS"))
                .andExpect(jsonPath("$.instruments[1].symbol").value("RELIANCE"));

        // 4. Fetch quotes: Verify SIMULATED integrity label
        mockMvc.perform(get("/api/v1/watchlists/" + wlId + "/quotes")
                        .header("Authorization", tokenA))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].dataStatus").value("SIMULATED"))
                .andExpect(jsonPath("$[0].simulated").value(true));

        // 5. Duplicate watchlist
        mockMvc.perform(post("/api/v1/watchlists/" + wlId + "/duplicate")
                        .header("Authorization", tokenA)
                        .param("targetName", "Swing Strategy Watch - Secondary"))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.name").value("Swing Strategy Watch - Secondary"))
                .andExpect(jsonPath("$.instruments.length()").value(2));

        // 6. Delete watchlist
        mockMvc.perform(delete("/api/v1/watchlists/" + wlId)
                        .header("Authorization", tokenA))
                .andExpect(status().isNoContent());
    }

    @Test
    @DisplayName("Alerts Lifecycle: Create alert and verify cross-user isolation")
    void testAlertLifecycleAndIsolation() throws Exception {
        // User A creates price alert for RELIANCE above 3050.00
        CreateAlertRequest alertReq = new CreateAlertRequest(
                "RELIANCE",
                "PRICE_ABOVE",
                new BigDecimal("3050.00"),
                "Breakout resistance alert"
        );

        String alertJson = mockMvc.perform(post("/api/v1/watchlists/alerts")
                        .header("Authorization", tokenA)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(alertReq)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.symbol").value("RELIANCE"))
                .andExpect(jsonPath("$.alertType").value("PRICE_ABOVE"))
                .andReturn().getResponse().getContentAsString();

        Long alertId = objectMapper.readTree(alertJson).get("id").asLong();

        // User B attempts to delete User A's alert -> 404 Not Found
        mockMvc.perform(delete("/api/v1/watchlists/alerts/" + alertId)
                        .header("Authorization", tokenB))
                .andExpect(status().isNotFound());

        // User A verifies alert is in their list
        mockMvc.perform(get("/api/v1/watchlists/alerts")
                        .header("Authorization", tokenA))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value(alertId));

        // User A deletes alert -> 204 No Content
        mockMvc.perform(delete("/api/v1/watchlists/alerts/" + alertId)
                        .header("Authorization", tokenA))
                .andExpect(status().isNoContent());
    }
}
