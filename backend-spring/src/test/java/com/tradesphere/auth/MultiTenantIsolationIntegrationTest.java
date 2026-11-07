package com.tradesphere.auth;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.tradesphere.TradeSphereApplication;
import com.tradesphere.common.security.JwtTokenProvider;
import com.tradesphere.common.security.UserPrincipal;
import com.tradesphere.modules.auth.entity.Role;
import com.tradesphere.modules.auth.entity.User;
import com.tradesphere.modules.auth.repository.RoleRepository;
import com.tradesphere.modules.auth.repository.UserRepository;
import com.tradesphere.modules.paper.dto.ClosePositionRequest;
import com.tradesphere.modules.paper.dto.OrderRequest;
import com.tradesphere.modules.paper.entity.PaperOrder;
import com.tradesphere.modules.paper.repository.PaperOrderRepository;
import com.tradesphere.modules.paper.repository.PositionRepository;
import com.tradesphere.modules.paper.service.PaperAccountService;
import com.tradesphere.modules.watchlist.dto.AddWatchlistItemRequest;
import com.tradesphere.modules.watchlist.dto.CreateWatchlistRequest;
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
import org.springframework.test.web.servlet.MvcResult;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest(classes = TradeSphereApplication.class)
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Transactional
public class MultiTenantIsolationIntegrationTest {

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
    private PaperOrderRepository orderRepository;

    @Autowired
    private PositionRepository positionRepository;

    @Autowired
    private PaperAccountService paperAccountService;

    @Autowired
    private JwtTokenProvider tokenProvider;

    private User tenantAlpha;
    private User tenantBeta;
    private String tokenAlpha;
    private String tokenBeta;

    @BeforeEach
    void setupTenants() {
        Role role = roleRepository.findByName("ROLE_USER").orElseGet(() -> roleRepository.save(new Role("ROLE_USER")));

        tenantAlpha = userRepository.findByEmailIgnoreCase("tenant_alpha@tradesphere.ai").orElseGet(() -> {
            User u = new User();
            u.setEmail("tenant_alpha@tradesphere.ai");
            u.setPasswordHash(passwordEncoder.encode("PassTenantAlpha123!"));
            u.setFullName("Tenant Alpha");
            u.getRoles().add(role);
            return userRepository.save(u);
        });

        tenantBeta = userRepository.findByEmailIgnoreCase("tenant_beta@tradesphere.ai").orElseGet(() -> {
            User u = new User();
            u.setEmail("tenant_beta@tradesphere.ai");
            u.setPasswordHash(passwordEncoder.encode("PassTenantBeta123!"));
            u.setFullName("Tenant Beta");
            u.getRoles().add(role);
            return userRepository.save(u);
        });

        paperAccountService.provisionDefaultAccount(tenantAlpha);
        paperAccountService.provisionDefaultAccount(tenantBeta);

        tokenAlpha = "Bearer " + tokenProvider.generateToken(new UserPrincipal(
                tenantAlpha.getId(), tenantAlpha.getEmail(), tenantAlpha.getPasswordHash(),
                tenantAlpha.getFullName(), tenantAlpha.getTier(),
                List.of(new SimpleGrantedAuthority("ROLE_USER"))
        ));

        tokenBeta = "Bearer " + tokenProvider.generateToken(new UserPrincipal(
                tenantBeta.getId(), tenantBeta.getEmail(), tenantBeta.getPasswordHash(),
                tenantBeta.getFullName(), tenantBeta.getTier(),
                List.of(new SimpleGrantedAuthority("ROLE_USER"))
        ));
    }

    @Test
    @DisplayName("Tenant Isolation 1: Tenant Beta cannot view Tenant Alpha's individual order")
    void testTenantCannotReadOtherTenantOrder() throws Exception {
        // Tenant Alpha places an order
        OrderRequest orderReq = new OrderRequest();
        orderReq.setSymbol("RELIANCE");
        orderReq.setSide("BUY");
        orderReq.setOrderType("LIMIT");
        orderReq.setQuantity(5);
        orderReq.setLimitPrice(new BigDecimal("2900.00"));
        orderReq.setStopLoss(new BigDecimal("2800.00"));
        orderReq.setTakeProfit(new BigDecimal("3100.00"));

        MvcResult res = mockMvc.perform(post("/api/orders")
                        .header("Authorization", tokenAlpha)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(orderReq)))
                .andExpect(status().isCreated())
                .andReturn();

        Long orderId = objectMapper.readTree(res.getResponse().getContentAsString()).get("id").asLong();

        // Tenant Beta attempts to access Tenant Alpha's order -> Should be 404
        mockMvc.perform(get("/api/orders/" + orderId)
                        .header("Authorization", tokenBeta))
                .andExpect(status().isNotFound());
    }

    @Test
    @DisplayName("Tenant Isolation 2: Tenant Beta cannot cancel Tenant Alpha's pending order")
    void testTenantCannotCancelOtherTenantOrder() throws Exception {
        // Tenant Alpha places a limit order
        OrderRequest orderReq = new OrderRequest();
        orderReq.setSymbol("TCS");
        orderReq.setSide("BUY");
        orderReq.setOrderType("LIMIT");
        orderReq.setQuantity(2);
        orderReq.setLimitPrice(new BigDecimal("4000.00"));
        orderReq.setStopLoss(new BigDecimal("3900.00"));

        MvcResult res = mockMvc.perform(post("/api/orders")
                        .header("Authorization", tokenAlpha)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(orderReq)))
                .andExpect(status().isCreated())
                .andReturn();

        Long orderId = objectMapper.readTree(res.getResponse().getContentAsString()).get("id").asLong();

        // Tenant Beta attempts to cancel Tenant Alpha's order -> Should fail with 404
        mockMvc.perform(delete("/api/orders/" + orderId)
                        .header("Authorization", tokenBeta))
                .andExpect(status().isNotFound());

        // Verify order is still owned by Tenant Alpha and remains active
        PaperOrder orderInDb = orderRepository.findById(orderId).orElseThrow();
        assertThat(orderInDb.getAccount().getUser().getId()).isEqualTo(tenantAlpha.getId());
        assertThat(orderInDb.getStatus()).isIn("OPEN", "PENDING");
    }

    @Test
    @DisplayName("Tenant Isolation 3: Tenant Beta cannot close Tenant Alpha's open position")
    void testTenantCannotCloseOtherTenantPosition() throws Exception {
        // Tenant Alpha buys market shares of INFY
        OrderRequest orderReq = new OrderRequest();
        orderReq.setSymbol("INFY");
        orderReq.setSide("BUY");
        orderReq.setOrderType("MARKET");
        orderReq.setQuantity(10);
        orderReq.setStopLoss(new BigDecimal("1800.00"));

        mockMvc.perform(post("/api/orders")
                        .header("Authorization", tokenAlpha)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(orderReq)))
                .andExpect(status().isCreated());

        // Tenant Beta attempts to square off INFY position (which Tenant Beta does not hold)
        ClosePositionRequest closeReq = new ClosePositionRequest();
        closeReq.setSymbol("INFY");

        mockMvc.perform(post("/api/positions/close")
                        .header("Authorization", tokenBeta)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(closeReq)))
                .andExpect(status().isBadRequest()); // INSUFFICIENT_POSITION / POSITION_NOT_FOUND
    }

    @Test
    @DisplayName("Tenant Isolation 4: Portfolio reset for Tenant Beta leaves Tenant Alpha completely unaffected")
    void testPortfolioResetIsolation() throws Exception {
        // Tenant Alpha buys RELIANCE
        OrderRequest orderReq = new OrderRequest();
        orderReq.setSymbol("RELIANCE");
        orderReq.setSide("BUY");
        orderReq.setOrderType("MARKET");
        orderReq.setQuantity(5);
        orderReq.setStopLoss(new BigDecimal("2900.00"));

        mockMvc.perform(post("/api/orders")
                        .header("Authorization", tokenAlpha)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(orderReq)))
                .andExpect(status().isCreated());

        // Tenant Beta resets account
        mockMvc.perform(post("/api/portfolio/reset")
                        .header("Authorization", tokenBeta))
                .andExpect(status().isOk());

        // Tenant Alpha's portfolio should still contain RELIANCE position
        mockMvc.perform(get("/api/portfolio")
                        .header("Authorization", tokenAlpha))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.positions").isArray())
                .andExpect(jsonPath("$.positions[?(@.symbol == 'RELIANCE')]").exists());
    }

    @Test
    @DisplayName("Tenant Isolation 5: Tenant Beta cannot access Tenant Alpha's custom watchlist or add items to it")
    void testWatchlistTenantBoundary() throws Exception {
        // Tenant Alpha creates proprietary watchlist
        CreateWatchlistRequest createReq = new CreateWatchlistRequest("Alpha Dark Pool Targets");
        MvcResult res = mockMvc.perform(post("/api/v1/watchlists")
                        .header("Authorization", tokenAlpha)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(createReq)))
                .andExpect(status().isCreated())
                .andReturn();

        Long wlId = objectMapper.readTree(res.getResponse().getContentAsString()).get("id").asLong();

        // Tenant Beta cannot get watchlist (returns 404 as it is not Beta's watchlist)
        mockMvc.perform(get("/api/v1/watchlists/" + wlId)
                        .header("Authorization", tokenBeta))
                .andExpect(status().isNotFound());

        // Tenant Beta cannot append items to Alpha's watchlist (returns 404)
        AddWatchlistItemRequest itemReq = new AddWatchlistItemRequest("NVDA");
        mockMvc.perform(post("/api/v1/watchlists/" + wlId + "/items")
                        .header("Authorization", tokenBeta)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(itemReq)))
                .andExpect(status().isNotFound());
    }
}
