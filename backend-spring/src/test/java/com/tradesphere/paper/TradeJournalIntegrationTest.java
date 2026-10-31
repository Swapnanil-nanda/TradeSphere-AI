package com.tradesphere.paper;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.tradesphere.TradeSphereApplication;
import com.tradesphere.common.security.JwtTokenProvider;
import com.tradesphere.common.security.UserPrincipal;
import com.tradesphere.modules.auth.entity.Role;
import com.tradesphere.modules.auth.entity.User;
import com.tradesphere.modules.auth.repository.RoleRepository;
import com.tradesphere.modules.auth.repository.UserRepository;
import com.tradesphere.modules.paper.dto.CreateJournalEntryRequest;
import com.tradesphere.modules.paper.entity.PaperAccount;
import com.tradesphere.modules.paper.repository.PaperAccountRepository;
import com.tradesphere.modules.paper.repository.TradeJournalRepository;
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
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest(classes = TradeSphereApplication.class)
@AutoConfigureMockMvc
@ActiveProfiles("test")
public class TradeJournalIntegrationTest {

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
    private PaperAccountService paperAccountService;

    @Autowired
    private TradeJournalRepository tradeJournalRepository;

    @Autowired
    private JwtTokenProvider jwtTokenProvider;

    private User user1;
    private User user2;
    private String token1;
    private String token2;

    @BeforeEach
    void setUp() {
        tradeJournalRepository.deleteAll();

        Role traderRole = roleRepository.findByName("ROLE_TRADER")
                .orElseGet(() -> roleRepository.save(new Role("ROLE_TRADER")));

        user1 = userRepository.findByEmailIgnoreCase("journal.trader1@tradesphere.ai").orElseGet(() -> {
            User u = new User();
            u.setEmail("journal.trader1@tradesphere.ai");
            u.setPasswordHash(passwordEncoder.encode("Password@123"));
            u.setFullName("Trader One");
            u.getRoles().add(traderRole);
            return userRepository.save(u);
        });

        paperAccountService.provisionDefaultAccount(user1);
        paperAccountService.resetAccount(user1.getId(), new BigDecimal("1000000.0000"));

        user2 = userRepository.findByEmailIgnoreCase("journal.trader2@tradesphere.ai").orElseGet(() -> {
            User u = new User();
            u.setEmail("journal.trader2@tradesphere.ai");
            u.setPasswordHash(passwordEncoder.encode("Password@123"));
            u.setFullName("Trader Two");
            u.getRoles().add(traderRole);
            return userRepository.save(u);
        });

        paperAccountService.provisionDefaultAccount(user2);
        paperAccountService.resetAccount(user2.getId(), new BigDecimal("1000000.0000"));

        token1 = jwtTokenProvider.generateToken(new UserPrincipal(
                user1.getId(), user1.getEmail(), user1.getPasswordHash(), user1.getFullName(), user1.getTier(),
                List.of(new SimpleGrantedAuthority("ROLE_TRADER"))
        ));

        token2 = jwtTokenProvider.generateToken(new UserPrincipal(
                user2.getId(), user2.getEmail(), user2.getPasswordHash(), user2.getFullName(), user2.getTier(),
                List.of(new SimpleGrantedAuthority("ROLE_TRADER"))
        ));
    }

    @Test
    @DisplayName("Create Trade Journal Entry - Persists setup, psychological state, and rating")
    void testCreateJournalEntry() throws Exception {
        CreateJournalEntryRequest req = new CreateJournalEntryRequest();
        req.setSymbol("RELIANCE");
        req.setSide("BUY");
        req.setSetupType("20_EMA_PULLBACK");
        req.setEntryRulesFollowed(true);
        req.setExitRulesFollowed(true);
        req.setEmotionalState("DISCIPLINED");
        req.setMistakesTagged("NONE");
        req.setNotes("Clean trend continuation from dynamic 20-EMA with 2.0R target achieved.");
        req.setRating(5);

        mockMvc.perform(post("/api/journal")
                        .header("Authorization", "Bearer " + token1)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.symbol").value("RELIANCE"))
                .andExpect(jsonPath("$.setupType").value("20_EMA_PULLBACK"))
                .andExpect(jsonPath("$.emotionalState").value("DISCIPLINED"))
                .andExpect(jsonPath("$.rating").value(5))
                .andExpect(jsonPath("$.entryRulesFollowed").value(true));

        assertThat(tradeJournalRepository.findAll()).hasSize(1);
    }

    @Test
    @DisplayName("Tenant Isolation - User 2 cannot access or view User 1's journal entries")
    void testJournalTenantIsolation() throws Exception {
        CreateJournalEntryRequest req = new CreateJournalEntryRequest();
        req.setSymbol("TCS");
        req.setSide("BUY");
        req.setSetupType("SUPPORT_REVERSAL");
        req.setNotes("User 1 private journal entry.");

        mockMvc.perform(post("/api/journal")
                        .header("Authorization", "Bearer " + token1)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isCreated());

        // User 2 requests their journal: should receive empty list
        mockMvc.perform(get("/api/journal")
                        .header("Authorization", "Bearer " + token2))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$.length()").value(0));
    }
}
