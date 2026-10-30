package com.tradesphere.auth;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.tradesphere.TradeSphereApplication;
import com.tradesphere.modules.auth.dto.LoginRequest;
import com.tradesphere.modules.auth.dto.RegisterRequest;
import com.tradesphere.modules.auth.repository.UserRepository;
import com.tradesphere.modules.paper.repository.PaperAccountRepository;
import com.tradesphere.modules.watchlist.repository.WatchlistRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import java.math.BigDecimal;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest(classes = TradeSphereApplication.class)
@AutoConfigureMockMvc
@ActiveProfiles("test")
public class AuthIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PaperAccountRepository paperAccountRepository;

    @Autowired
    private WatchlistRepository watchlistRepository;

    @Test
    @DisplayName("User Registration: Persists user, provisions ₹10L paper account, creates default watchlist, returns JWT")
    void testUserRegistrationAndAutomaticProvisioning() throws Exception {
        RegisterRequest req = new RegisterRequest();
        req.setEmail("quant.trader@tradesphere.ai");
        req.setPassword("SecureQuant2026!");
        req.setFullName("Arjun Quant Analyst");
        req.setTier("PRO");

        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.token").isString())
                .andExpect(jsonPath("$.email").value("quant.trader@tradesphere.ai"))
                .andExpect(jsonPath("$.tier").value("PRO"));

        // Verify database persistence
        var userOpt = userRepository.findByEmailIgnoreCase("quant.trader@tradesphere.ai");
        assertThat(userOpt).isPresent();
        var user = userOpt.get();
        assertThat(user.getFullName()).isEqualTo("Arjun Quant Analyst");

        // Verify automatic Paper Account provisioning
        var accountOpt = paperAccountRepository.findByUserId(user.getId());
        assertThat(accountOpt).isPresent();
        assertThat(accountOpt.get().getNetLiquidation()).isEqualByComparingTo(new BigDecimal("1000000.0000"));

        // Verify automatic default Watchlist provisioning
        var watchlists = watchlistRepository.findByUserIdOrderByCreatedAtAsc(user.getId());
        assertThat(watchlists).isNotEmpty();
        assertThat(watchlists.get(0).getName()).isEqualTo("Core Market Watch");
    }

    @Test
    @DisplayName("User Login: Authenticates existing demo user and returns valid bearer token")
    void testUserLogin() throws Exception {
        LoginRequest req = new LoginRequest();
        req.setEmail("demo.trader@tradesphere.ai");
        req.setPassword("TradeSafe2026!");

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").isString())
                .andExpect(jsonPath("$.email").value("demo.trader@tradesphere.ai"))
                .andExpect(jsonPath("$.tier").value("PRO"));
    }

    @Test
    @DisplayName("Duplicate Registration: Rejects duplicate email with 400 Bad Request")
    void testDuplicateRegistrationRejection() throws Exception {
        RegisterRequest req = new RegisterRequest();
        req.setEmail("demo.trader@tradesphere.ai"); // Already seeded in V1
        req.setPassword("SomePassword123!");
        req.setFullName("Duplicate User");

        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error").value("APPLICATION_ERROR"));
    }
}
