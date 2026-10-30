package com.tradesphere.paper;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.tradesphere.TradeSphereApplication;
import com.tradesphere.common.security.JwtTokenProvider;
import com.tradesphere.common.security.UserPrincipal;
import com.tradesphere.modules.auth.entity.User;
import com.tradesphere.modules.auth.repository.UserRepository;
import com.tradesphere.modules.paper.dto.OrderRequest;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import java.math.BigDecimal;
import java.util.List;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest(classes = TradeSphereApplication.class)
@AutoConfigureMockMvc
@ActiveProfiles("test")
public class OrderRiskGatekeeperTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

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
    @DisplayName("Risk Gatekeeper Rule A: Rejects order when single-trade max loss exceeds 1.0% cap")
    void testSingleTradeRiskCapBreachRejection() throws Exception {
        // Entry ~2985, Stop-Loss 2500 (Risk per share = ~485)
        // Quantity = 100 shares -> Total Risk = 48,500 INR
        // 1.0% Risk Cap on 10,00,000 INR = 10,000 INR -> Must be rejected!
        OrderRequest req = new OrderRequest();
        req.setSymbol("RELIANCE");
        req.setSide("BUY");
        req.setOrderType("BRACKET");
        req.setQuantity(100);
        req.setLimitPrice(new BigDecimal("2985.00"));
        req.setStopLoss(new BigDecimal("2500.00"));
        req.setTakeProfit(new BigDecimal("3900.00"));

        mockMvc.perform(post("/api/orders")
                        .header("Authorization", authToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isUnprocessableEntity())
                .andExpect(jsonPath("$.error").value("RISK_GATEKEEPER_VIOLATION"))
                .andExpect(jsonPath("$.message").value(org.hamcrest.Matchers.containsString("exceeds single-trade max loss cap")));
    }

    @Test
    @DisplayName("Risk Gatekeeper Rule A: Rejects bracket order when Reward:Risk is sub-optimal (< 1.50R)")
    void testSubOptimalRiskRewardRejection() throws Exception {
        // Entry 3000, Stop-Loss 2950 (Risk = 50)
        // Take-Profit 3030 (Reward = 30) -> R:R = 30/50 = 0.60R < 1.50R -> Must be rejected!
        OrderRequest req = new OrderRequest();
        req.setSymbol("RELIANCE");
        req.setSide("BUY");
        req.setOrderType("BRACKET");
        req.setQuantity(10);
        req.setLimitPrice(new BigDecimal("3000.00"));
        req.setStopLoss(new BigDecimal("2950.00"));
        req.setTakeProfit(new BigDecimal("3030.00"));

        mockMvc.perform(post("/api/orders")
                        .header("Authorization", authToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isUnprocessableEntity())
                .andExpect(jsonPath("$.error").value("RISK_GATEKEEPER_VIOLATION"))
                .andExpect(jsonPath("$.message").value(org.hamcrest.Matchers.containsString("Sub-optimal Reward:Risk")));
    }

    @Test
    @DisplayName("Risk Gatekeeper: Accepts and executes valid bracket order adhering to 1% risk and >= 1.50R")
    void testValidBracketOrderExecution() throws Exception {
        // Entry 3000, Stop-Loss 2960 (Risk = 40)
        // Quantity = 10 -> Total Risk = 400 INR (well within 10,000 INR cap)
        // Take-Profit 3080 (Reward = 80) -> R:R = 80/40 = 2.00R >= 1.50R -> Allowed!
        OrderRequest req = new OrderRequest();
        req.setSymbol("RELIANCE");
        req.setSide("BUY");
        req.setOrderType("BRACKET");
        req.setQuantity(10);
        req.setLimitPrice(new BigDecimal("3000.00"));
        req.setStopLoss(new BigDecimal("2960.00"));
        req.setTakeProfit(new BigDecimal("3080.00"));

        mockMvc.perform(post("/api/orders")
                        .header("Authorization", authToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.status").value("FILLED"))
                .andExpect(jsonPath("$.symbol").value("RELIANCE"))
                .andExpect(jsonPath("$.quantity").value(10));
    }
}
