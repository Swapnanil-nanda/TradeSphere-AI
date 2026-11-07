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
import java.util.UUID;

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
    @DisplayName("Risk Gatekeeper Real Cap: Rejects BUY order when required capital exceeds available cash")
    void testInsufficientMarginRejection() throws Exception {
        // Price ~2985, Quantity = 5000 shares -> Required cash ~1.49 Crores (> 10 Lakhs cash)
        OrderRequest req = new OrderRequest();
        req.setSymbol("RELIANCE");
        req.setSide("BUY");
        req.setOrderType("MARKET");
        req.setQuantity(5000);

        mockMvc.perform(post("/api/orders")
                        .header("Authorization", authToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isUnprocessableEntity())
                .andExpect(jsonPath("$.error").value("RISK_GATEKEEPER_VIOLATION"))
                .andExpect(jsonPath("$.message").value(org.hamcrest.Matchers.containsString("exceeds available paper cash balance")));
    }

    @Test
    @DisplayName("Risk Gatekeeper Real Cap: Accepts and executes standard order without mandatory Stop-Loss")
    void testOrderWithoutStopLossExecution() throws Exception {
        OrderRequest req = new OrderRequest();
        req.setSymbol("RELIANCE");
        req.setSide("BUY");
        req.setOrderType("MARKET");
        req.setQuantity(5);
        req.setClientOrderId("test_market_nosl_" + UUID.randomUUID());

        mockMvc.perform(post("/api/orders")
                        .header("Authorization", authToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.symbol").value("RELIANCE"))
                .andExpect(jsonPath("$.quantity").value(5));
    }

    @Test
    @DisplayName("Risk Gatekeeper: Accepts and executes valid bracket order with optional Stop-Loss and Target")
    void testValidBracketOrderExecution() throws Exception {
        OrderRequest req = new OrderRequest();
        req.setSymbol("RELIANCE");
        req.setSide("BUY");
        req.setOrderType("BRACKET");
        req.setQuantity(10);
        req.setLimitPrice(new BigDecimal("3000.00"));
        req.setStopLoss(new BigDecimal("2960.00"));
        req.setTakeProfit(new BigDecimal("3080.00"));
        req.setClientOrderId("test_bracket_" + UUID.randomUUID());

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
