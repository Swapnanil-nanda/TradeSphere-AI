package com.tradesphere.screener;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.tradesphere.TradeSphereApplication;
import com.tradesphere.modules.auth.dto.AuthResponse;
import com.tradesphere.modules.auth.dto.GoogleLoginRequest;
import com.tradesphere.modules.auth.dto.RegisterRequest;
import com.tradesphere.modules.auth.dto.UpdateProfileRequest;
import com.tradesphere.modules.auth.repository.UserRepository;
import com.tradesphere.modules.paper.repository.PaperAccountRepository;
import com.tradesphere.modules.screener.dto.CreateSavedScreenRequest;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import java.math.BigDecimal;

import static org.assertj.core.api.Assertions.assertThat;
import static org.hamcrest.Matchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest(classes = TradeSphereApplication.class)
@AutoConfigureMockMvc
@ActiveProfiles("test")
public class ScreenerAndAdaptiveTierIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PaperAccountRepository paperAccountRepository;

    @Test
    @DisplayName("User Registration: Defaults to BASIC tier when tier is omitted")
    void testUserRegistrationDefaultsToBasicTier() throws Exception {
        String email = "novice.trader." + System.currentTimeMillis() + "@tradesphere.ai";
        RegisterRequest req = new RegisterRequest();
        req.setEmail(email);
        req.setPassword("NoviceSafe2026!");
        req.setFullName("Aarav Novice");
        // tier is omitted

        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.tier").value("BASIC"))
                .andExpect(jsonPath("$.token").isString());

        var userOpt = userRepository.findByEmailIgnoreCase(email);
        assertThat(userOpt).isPresent();
        assertThat(userOpt.get().getTier()).isEqualTo("BASIC");
    }

    @Test
    @DisplayName("Google OAuth Sign-In: Auto-provisions new user with default tier BASIC and paper account")
    void testGoogleLoginProvisioning() throws Exception {
        String email = "google.user." + System.currentTimeMillis() + "@gmail.com";
        GoogleLoginRequest req = new GoogleLoginRequest(email, "Google Explorer");

        mockMvc.perform(post("/api/auth/google")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").isString())
                .andExpect(jsonPath("$.email").value(email))
                .andExpect(jsonPath("$.tier").value("BASIC"));

        var userOpt = userRepository.findByEmailIgnoreCase(email);
        assertThat(userOpt).isPresent();
        assertThat(userOpt.get().getFullName()).isEqualTo("Google Explorer");

        var accountOpt = paperAccountRepository.findByUserId(userOpt.get().getId());
        assertThat(accountOpt).isPresent();
        assertThat(accountOpt.get().getNetLiquidation()).isEqualByComparingTo(new BigDecimal("1000000.0000"));
    }

    @Test
    @DisplayName("Security Boundary: Unauthenticated requests to orders and saved screens return 401")
    void testUnauthenticatedRequestsBlocked() throws Exception {
        // Orders endpoint requires auth
        mockMvc.perform(post("/api/orders")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"symbol\":\"RELIANCE\",\"side\":\"BUY\",\"quantity\":1}"))
                .andExpect(status().isUnauthorized());

        // Saved screens require auth
        mockMvc.perform(get("/api/screener/saved"))
                .andExpect(status().isUnauthorized());

        mockMvc.perform(post("/api/screener/saved")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"name\":\"Test Screen\"}"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("Public Access: Stock screener and CSV export are publicly accessible for guest demo")
    void testPublicScreenerAccessibleWithoutAuth() throws Exception {
        mockMvc.perform(get("/api/screener"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.items").isArray())
                .andExpect(jsonPath("$.totalResults").isNumber())
                .andExpect(jsonPath("$.dataProvenance").value("SIMULATED"))
                .andExpect(jsonPath("$.dataSource").value("GEOMETRIC_BROWNIAN_MOTION_GBM"));

        mockMvc.perform(get("/api/screener/export"))
                .andExpect(status().isOk())
                .andExpect(header().string("Content-Type", containsString("text/csv")))
                .andExpect(content().string(containsString("Symbol,Name,Market")));
    }

    @Test
    @DisplayName("Screener Filtering: Accurately filters by market, sector, search and handles ETF null P/E")
    void testScreenerFiltering() throws Exception {
        // Filter IN market
        mockMvc.perform(get("/api/screener?market=IN"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.items[*].market", everyItem(is("IN"))));

        // Filter US market
        mockMvc.perform(get("/api/screener?market=US"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.items[*].market", everyItem(is("US"))));

        // Search query
        mockMvc.perform(get("/api/screener?search=TCS"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.items[0].symbol").value("TCS"));

        // ETF null P/E ratio verification (SPY or QQQ)
        mockMvc.perform(get("/api/screener?search=SPY"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.items[0].symbol").value("SPY"))
                .andExpect(jsonPath("$.items[0].peRatio").doesNotExist());
    }

    @Test
    @DisplayName("Tenant Isolation: User A cannot view or delete User B's saved screens")
    void testSavedScreensTenantIsolation() throws Exception {
        String tokenA = registerAndGetToken("user.a." + System.currentTimeMillis() + "@tradesphere.ai", "User Alpha");
        String tokenB = registerAndGetToken("user.b." + System.currentTimeMillis() + "@tradesphere.ai", "User Beta");

        // User A creates a screen
        CreateSavedScreenRequest reqA = new CreateSavedScreenRequest();
        reqA.setName("Alpha Breakout Strategy");
        reqA.setMarket("IN");
        reqA.setTrend("BULLISH");

        MvcResult resA = mockMvc.perform(post("/api/screener/saved")
                        .header("Authorization", "Bearer " + tokenA)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(reqA)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.name").value("Alpha Breakout Strategy"))
                .andReturn();

        String responseBodyA = resA.getResponse().getContentAsString();
        Long screenIdA = objectMapper.readTree(responseBodyA).get("id").asLong();

        // User B creates a screen
        CreateSavedScreenRequest reqB = new CreateSavedScreenRequest();
        reqB.setName("Beta Tech Momentum");
        reqB.setMarket("US");

        mockMvc.perform(post("/api/screener/saved")
                        .header("Authorization", "Bearer " + tokenB)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(reqB)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.name").value("Beta Tech Momentum"));

        // User A lists saved screens: Should ONLY see Alpha Breakout Strategy
        mockMvc.perform(get("/api/screener/saved")
                        .header("Authorization", "Bearer " + tokenA))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(1)))
                .andExpect(jsonPath("$[0].name").value("Alpha Breakout Strategy"));

        // User B lists saved screens: Should ONLY see Beta Tech Momentum
        mockMvc.perform(get("/api/screener/saved")
                        .header("Authorization", "Bearer " + tokenB))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(1)))
                .andExpect(jsonPath("$[0].name").value("Beta Tech Momentum"));

        // User B attempts to delete User A's screen: Should fail with 404 Not Found
        mockMvc.perform(delete("/api/screener/saved/" + screenIdA)
                        .header("Authorization", "Bearer " + tokenB))
                .andExpect(status().isNotFound());

        // User A successfully deletes their screen
        mockMvc.perform(delete("/api/screener/saved/" + screenIdA)
                        .header("Authorization", "Bearer " + tokenA))
                .andExpect(status().isNoContent());

        // Verify User A now has 0 saved screens
        mockMvc.perform(get("/api/screener/saved")
                        .header("Authorization", "Bearer " + tokenA))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(0)));
    }

    @Test
    @DisplayName("Adaptive Tier Switching: Non-destructive preference update persists in DB")
    void testUserTierPreferenceSwitchingAndPersistence() throws Exception {
        String email = "tier.tester." + System.currentTimeMillis() + "@tradesphere.ai";
        String token = registerAndGetToken(email, "Tier Tester");

        // Verify initial tier is BASIC
        mockMvc.perform(get("/api/users/me")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.tier").value("BASIC"));

        // Upgrade preference to ACTIVE
        UpdateProfileRequest updateReq = new UpdateProfileRequest();
        updateReq.setTier("ACTIVE");

        mockMvc.perform(put("/api/users/me")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(updateReq)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.tier").value("ACTIVE"));

        // Verify persistence on GET
        mockMvc.perform(get("/api/users/me")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.tier").value("ACTIVE"));

        // Upgrade preference to PRO
        updateReq.setTier("PRO");
        mockMvc.perform(put("/api/users/me")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(updateReq)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.tier").value("PRO"));

        // Verify in database and verify paper account balance is non-destructively preserved
        var user = userRepository.findByEmailIgnoreCase(email).orElseThrow();
        assertThat(user.getTier()).isEqualTo("PRO");

        var account = paperAccountRepository.findByUserId(user.getId()).orElseThrow();
        assertThat(account.getNetLiquidation()).isEqualByComparingTo(new BigDecimal("1000000.0000"));
    }

    private String registerAndGetToken(String email, String fullName) throws Exception {
        RegisterRequest req = new RegisterRequest();
        req.setEmail(email);
        req.setPassword("SecureP@ss1234");
        req.setFullName(fullName);

        MvcResult res = mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isCreated())
                .andReturn();

        AuthResponse auth = objectMapper.readValue(res.getResponse().getContentAsString(), AuthResponse.class);
        return auth.getToken();
    }
}
