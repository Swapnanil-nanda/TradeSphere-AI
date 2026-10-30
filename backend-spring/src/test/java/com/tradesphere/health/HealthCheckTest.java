package com.tradesphere.health;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import static org.hamcrest.Matchers.containsString;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class HealthCheckTest {

    @Autowired
    private MockMvc mockMvc;

    @Test
    @DisplayName("Health Check: GET /api/health returns UP with DB connection status")
    void testApiHealthEndpoint() throws Exception {
        mockMvc.perform(get("/api/health")
                        .accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("UP"))
                .andExpect(jsonPath("$.service").value("TradeSphere AI Backend"))
                .andExpect(jsonPath("$.executionMode").value("PAPER_TRADING_ONLY"))
                .andExpect(jsonPath("$.disclaimer").value("PAPER TRADING – NO REAL MONEY"))
                .andExpect(jsonPath("$.database.status").value("CONNECTED"));
    }

    @Test
    @DisplayName("Actuator: GET /actuator/health returns UP without authentication")
    void testActuatorHealthEndpoint() throws Exception {
        mockMvc.perform(get("/actuator/health")
                        .accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("UP"));
    }
}
