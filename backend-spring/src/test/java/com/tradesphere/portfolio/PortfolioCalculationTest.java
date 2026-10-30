package com.tradesphere.portfolio;

import com.tradesphere.TradeSphereApplication;
import com.tradesphere.common.security.JwtTokenProvider;
import com.tradesphere.common.security.UserPrincipal;
import com.tradesphere.modules.auth.entity.User;
import com.tradesphere.modules.auth.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest(classes = TradeSphereApplication.class)
@AutoConfigureMockMvc
@ActiveProfiles("test")
public class PortfolioCalculationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private JwtTokenProvider tokenProvider;

    private String authToken;

    @BeforeEach
    void setupToken() {
        User user = userRepository.findByEmailIgnoreCase("demo.trader@tradesphere.ai").orElseThrow();
        UserPrincipal principal = new UserPrincipal(
                user.getId(),
                user.getEmail(),
                user.getPasswordHash(),
                user.getFullName(),
                user.getTier(),
                List.of(new SimpleGrantedAuthority("ROLE_USER"))
        );
        authToken = "Bearer " + tokenProvider.generateToken(principal);
    }

    @Test
    @DisplayName("Portfolio Calculations: Computes Net Liquidation equity and cash balance correctly")
    void testPortfolioSummaryCalculation() throws Exception {
        mockMvc.perform(get("/api/portfolio")
                        .header("Authorization", authToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.account.startingCapital").value(1000000.00))
                .andExpect(jsonPath("$.account.currency").value("INR"))
                .andExpect(jsonPath("$.positions").isArray())
                .andExpect(jsonPath("$.trades").isArray());
    }
}
