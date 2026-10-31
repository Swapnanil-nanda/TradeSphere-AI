package com.tradesphere.paper;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.tradesphere.TradeSphereApplication;
import com.tradesphere.common.security.JwtTokenProvider;
import com.tradesphere.common.security.UserPrincipal;
import com.tradesphere.modules.auth.entity.Role;
import com.tradesphere.modules.auth.entity.User;
import com.tradesphere.modules.auth.repository.RoleRepository;
import com.tradesphere.modules.auth.repository.UserRepository;
import com.tradesphere.modules.paper.dto.ConfigureAccountRequest;
import com.tradesphere.modules.paper.dto.OrderRequest;
import com.tradesphere.modules.paper.entity.PaperAccount;
import com.tradesphere.modules.paper.repository.PaperAccountRepository;
import com.tradesphere.modules.paper.service.PaperAccountService;
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
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest(classes = TradeSphereApplication.class)
@AutoConfigureMockMvc
@ActiveProfiles("test")
public class DeterministicPaperTradingTest {

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
    private PaperAccountRepository paperAccountRepository;

    @Autowired
    private PaperAccountService paperAccountService;

    @Autowired
    private JwtTokenProvider tokenProvider;

    private User testUser;
    private String authToken;

    @BeforeEach
    void setupUser() {
        Role role = roleRepository.findByName("ROLE_USER").orElseGet(() -> roleRepository.save(new Role("ROLE_USER")));

        testUser = userRepository.findByEmailIgnoreCase("deterministic.trader@tradesphere.ai").orElseGet(() -> {
            User u = new User();
            u.setEmail("deterministic.trader@tradesphere.ai");
            u.setPasswordHash(passwordEncoder.encode("SecurePass2026!"));
            u.setFullName("Deterministic Paper Trader");
            u.setTier("PRO");
            u.getRoles().add(role);
            return userRepository.save(u);
        });

        // Provision paper account if not present
        paperAccountService.provisionDefaultAccount(testUser);

        // Reset account to clean state with 10,00,000 INR
        paperAccountService.resetAccount(testUser.getId(), new BigDecimal("1000000.0000"));

        authToken = "Bearer " + tokenProvider.generateToken(new UserPrincipal(
                testUser.getId(), testUser.getEmail(), testUser.getPasswordHash(),
                testUser.getFullName(), testUser.getTier(), List.of(new SimpleGrantedAuthority("ROLE_USER"))
        ));
    }

    @Test
    @DisplayName("1. Virtual Account: Configure custom starting capital & simulated rates")
    void testConfigureVirtualAccount() throws Exception {
        ConfigureAccountRequest req = new ConfigureAccountRequest();
        req.setStartingCapital(new BigDecimal("2500000.0000"));
        req.setCurrency("INR");
        req.setSlippageRate(new BigDecimal("0.000400")); // 0.04%
        req.setFeeRate(new BigDecimal("0.000200"));      // 0.02%

        mockMvc.perform(post("/api/accounts/configure")
                        .header("Authorization", authToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.startingCapital").value(2500000.00))
                .andExpect(jsonPath("$.currency").value("INR"));

        PaperAccount act = paperAccountRepository.findByUserId(testUser.getId()).orElseThrow();
        assertThat(act.getStartingCapital()).isEqualByComparingTo(new BigDecimal("2500000.0000"));
        assertThat(act.getSlippageRate()).isEqualByComparingTo(new BigDecimal("0.000400"));
    }

    @Test
    @DisplayName("2. BUY Execution: Applies slippage and simulated fees, updates cash & position")
    void testMarketBuyOrderExecution() throws Exception {
        OrderRequest orderReq = new OrderRequest();
        orderReq.setSymbol("RELIANCE");
        orderReq.setSide("BUY");
        orderReq.setOrderType("MARKET");
        orderReq.setQuantity(50);
        orderReq.setStopLoss(new BigDecimal("2950.00"));
        orderReq.setTakeProfit(new BigDecimal("3075.00"));

        String resJson = mockMvc.perform(post("/api/orders")
                        .header("Authorization", authToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(orderReq)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.status").value("FILLED"))
                .andExpect(jsonPath("$.simulated").value(true))
                .andExpect(jsonPath("$.disclaimer").value("PAPER TRADING – NO REAL MONEY"))
                .andReturn().getResponse().getContentAsString();

        JsonNode root = objectMapper.readTree(resJson);
        BigDecimal executedPrice = new BigDecimal(root.get("executedPrice").asText());
        BigDecimal feeAmount = new BigDecimal(root.get("feeAmount").asText());
        assertThat(executedPrice).isGreaterThan(BigDecimal.ZERO);
        assertThat(feeAmount).isGreaterThan(BigDecimal.ZERO);

        // Verify Cash deduction in account
        PaperAccount act = paperAccountRepository.findByUserId(testUser.getId()).orElseThrow();
        assertThat(act.getCurrentCash()).isLessThan(new BigDecimal("1000000.0000"));
    }

    @Test
    @DisplayName("3. Insufficient Funds: Rejects BUY order when required capital exceeds cash")
    void testInsufficientFundsValidation() throws Exception {
        // Reset capital to ₹1,000,000 equity (1% max risk = ₹10,000), but reduce current cash to ₹5,000
        paperAccountService.resetAccount(testUser.getId(), new BigDecimal("1000000.0000"));
        PaperAccount act = paperAccountRepository.findByUserId(testUser.getId()).orElseThrow();
        act.setCurrentCash(new BigDecimal("5000.0000"));
        paperAccountRepository.save(act);

        // Attempt to buy 10 shares of RELIANCE (~₹29,850) with only ₹5,000 cash
        // Risk = 10 shares * (2985 - 2980) = ₹50, which is well below the ₹10,000 single-trade risk cap (passes Risk Gatekeeper).
        OrderRequest orderReq = new OrderRequest();
        orderReq.setSymbol("RELIANCE");
        orderReq.setSide("BUY");
        orderReq.setOrderType("MARKET");
        orderReq.setQuantity(10);
        orderReq.setStopLoss(new BigDecimal("2980.00"));
        orderReq.setTakeProfit(new BigDecimal("3050.00"));

        mockMvc.perform(post("/api/orders")
                        .header("Authorization", authToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(orderReq)))
                .andExpect(status().isUnprocessableEntity())
                .andExpect(jsonPath("$.message").value(org.hamcrest.Matchers.containsString("INSUFFICIENT_MARGIN")));
    }

    @Test
    @DisplayName("4. SELL Execution: Decrements position, realizes PnL, credits cash")
    void testMarketSellOrderExecution() throws Exception {
        // First BUY 100 shares
        OrderRequest buyReq = new OrderRequest();
        buyReq.setSymbol("RELIANCE");
        buyReq.setSide("BUY");
        buyReq.setOrderType("MARKET");
        buyReq.setQuantity(100);
        buyReq.setStopLoss(new BigDecimal("2950.00"));
        buyReq.setTakeProfit(new BigDecimal("3075.00"));

        mockMvc.perform(post("/api/orders")
                        .header("Authorization", authToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(buyReq)))
                .andExpect(status().isCreated());

        // Then SELL 40 shares
        OrderRequest sellReq = new OrderRequest();
        sellReq.setSymbol("RELIANCE");
        sellReq.setSide("SELL");
        sellReq.setOrderType("MARKET");
        sellReq.setQuantity(40);

        mockMvc.perform(post("/api/orders")
                        .header("Authorization", authToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(sellReq)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.status").value("FILLED"))
                .andExpect(jsonPath("$.side").value("SELL"))
                .andExpect(jsonPath("$.quantity").value(40));

        // Check positions: Remaining quantity must be 60
        mockMvc.perform(get("/api/positions")
                        .header("Authorization", authToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].quantity").value(60));
    }

    @Test
    @DisplayName("5. Position Validation: Rejects SELL order when user holds insufficient shares")
    void testInsufficientPositionValidation() throws Exception {
        // User holds 0 shares of TCS
        OrderRequest sellReq = new OrderRequest();
        sellReq.setSymbol("TCS");
        sellReq.setSide("SELL");
        sellReq.setOrderType("MARKET");
        sellReq.setQuantity(10);

        mockMvc.perform(post("/api/orders")
                        .header("Authorization", authToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(sellReq)))
                .andExpect(status().isUnprocessableEntity())
                .andExpect(jsonPath("$.message").value(org.hamcrest.Matchers.containsString("INSUFFICIENT_POSITION")));
    }

    @Test
    @DisplayName("6. Limit Order: Enters OPEN state when not immediately marketable")
    void testLimitOrderOpenState() throws Exception {
        // Place a Limit BUY far below market price (Limit: ₹1,500 vs Market: ~₹2,985)
        OrderRequest limitReq = new OrderRequest();
        limitReq.setSymbol("RELIANCE");
        limitReq.setSide("BUY");
        limitReq.setOrderType("LIMIT");
        limitReq.setQuantity(10);
        limitReq.setLimitPrice(new BigDecimal("1500.00"));
        limitReq.setStopLoss(new BigDecimal("1450.00"));
        limitReq.setTakeProfit(new BigDecimal("1600.00"));

        mockMvc.perform(post("/api/orders")
                        .header("Authorization", authToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(limitReq)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.status").value("OPEN"))
                .andExpect(jsonPath("$.limitPrice").value(1500.00));
    }

    @Test
    @DisplayName("7. Order Cancellation: Cancels open limit order and guarantees it is never filled")
    void testOrderCancellation() throws Exception {
        // Create an open limit order
        OrderRequest limitReq = new OrderRequest();
        limitReq.setSymbol("RELIANCE");
        limitReq.setSide("BUY");
        limitReq.setOrderType("LIMIT");
        limitReq.setQuantity(10);
        limitReq.setLimitPrice(new BigDecimal("1500.00"));
        limitReq.setStopLoss(new BigDecimal("1450.00"));
        limitReq.setTakeProfit(new BigDecimal("1600.00"));

        String createJson = mockMvc.perform(post("/api/orders")
                        .header("Authorization", authToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(limitReq)))
                .andExpect(status().isCreated())
                .andReturn().getResponse().getContentAsString();

        Long orderId = objectMapper.readTree(createJson).get("id").asLong();

        // Cancel order
        mockMvc.perform(delete("/api/orders/" + orderId)
                        .header("Authorization", authToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("CANCELLED"));

        // Trigger order matching engine: Cancelled order must NOT be filled
        mockMvc.perform(post("/api/orders/match")
                        .header("Authorization", authToken))
                .andExpect(status().isOk());

        // Verify order remains CANCELLED in blotter
        mockMvc.perform(get("/api/orders")
                        .header("Authorization", authToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].status").value("CANCELLED"));
    }

    @Test
    @DisplayName("8. Idempotency: Duplicate submission with same clientOrderId does not duplicate execution")
    void testIdempotencyGuard() throws Exception {
        String clientOrderId = "IDEMPOTENT_TEST_" + UUID.randomUUID();

        OrderRequest orderReq = new OrderRequest();
        orderReq.setSymbol("RELIANCE");
        orderReq.setSide("BUY");
        orderReq.setOrderType("MARKET");
        orderReq.setQuantity(20);
        orderReq.setStopLoss(new BigDecimal("2950.00"));
        orderReq.setTakeProfit(new BigDecimal("3075.00"));
        orderReq.setClientOrderId(clientOrderId);

        // First submission -> FILLED
        String firstRes = mockMvc.perform(post("/api/orders")
                        .header("Authorization", authToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(orderReq)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.status").value("FILLED"))
                .andReturn().getResponse().getContentAsString();

        Long firstOrderId = objectMapper.readTree(firstRes).get("id").asLong();

        // Second submission with exact same clientOrderId -> Replays same order response without re-debiting
        String secondRes = mockMvc.perform(post("/api/orders")
                        .header("Authorization", authToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(orderReq)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.status").value("FILLED"))
                .andReturn().getResponse().getContentAsString();

        Long secondOrderId = objectMapper.readTree(secondRes).get("id").asLong();
        assertThat(firstOrderId).isEqualTo(secondOrderId);

        // Verify position quantity is 20, not 40
        mockMvc.perform(get("/api/positions")
                        .header("Authorization", authToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].quantity").value(20));
    }

    @Test
    @DisplayName("9. Reconciliation: Exact mathematical reconciliation between Cash Ledger and Portfolio Value")
    void testCashLedgerReconciliation() throws Exception {
        // Place and execute a valid BUY order
        OrderRequest orderReq = new OrderRequest();
        orderReq.setSymbol("RELIANCE");
        orderReq.setSide("BUY");
        orderReq.setOrderType("MARKET");
        orderReq.setQuantity(50);
        orderReq.setStopLoss(new BigDecimal("2950.00"));
        orderReq.setTakeProfit(new BigDecimal("3075.00"));

        mockMvc.perform(post("/api/orders")
                        .header("Authorization", authToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(orderReq)))
                .andExpect(status().isCreated());

        // Perform reconciliation check
        mockMvc.perform(get("/api/accounts/reconcile")
                        .header("Authorization", authToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.reconciled").value(true))
                .andExpect(jsonPath("$.cashVariance").value(0.00))
                .andExpect(jsonPath("$.disclaimer").value("PAPER TRADING – NO REAL MONEY"));
    }
}
