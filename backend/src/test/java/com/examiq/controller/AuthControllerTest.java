package com.examiq.controller;

import com.examiq.dto.request.LoginRequest;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.annotation.DirtiesContext;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * Integration tests that boot the full Spring context (H2 in-memory).
 * Verifies role-based access control via real JWT tokens.
 */
@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("default")
@TestMethodOrder(MethodOrderer.OrderAnnotation.class)
@DirtiesContext(classMode = DirtiesContext.ClassMode.BEFORE_CLASS)
class AuthControllerTest {

    @Autowired MockMvc mockMvc;
    @Autowired ObjectMapper objectMapper;

    // ── warm-up: ensure JPA / Hibernate fully initialised before first test ─

    @BeforeEach
    void warmUp() throws Exception {
        // A no-op request to a public endpoint to prime the JPA context
        mockMvc.perform(get("/api/certificates/verify/WARMUP-TEST-ID"));
    }

    // ── helper: login and extract accessToken ─────────────────────────────

    private String loginAndGetToken(String email, String password) throws Exception {
        LoginRequest req = new LoginRequest();
        req.setEmail(email);
        req.setPassword(password);

        MvcResult result = mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isOk())
                .andReturn();

        String body = result.getResponse().getContentAsString();
        // response.data.accessToken (ApiResponse wraps in .data for login)
        // AuthController returns AuthResponse directly for login — unwrap accordingly
        com.fasterxml.jackson.databind.JsonNode node = objectMapper.readTree(body);
        // Try direct field first (login returns AuthResponse directly)
        if (node.has("accessToken")) return node.get("accessToken").asText();
        // Otherwise try nested .data.accessToken
        return node.path("data").path("accessToken").asText();
    }

    // ── Test 1: login with seeded student returns 200 + accessToken ───────

    @Test
    @Order(1)
    void login_seedStudent_returns200AndToken() throws Exception {
        LoginRequest req = new LoginRequest();
        req.setEmail("student@examiq.com");
        req.setPassword("Demo@123");

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.accessToken").isNotEmpty());
    }

    // ── Test 2: student JWT → GET /api/admin/users → 403 ─────────────────

    @Test
    void adminEndpoint_studentToken_returns403() throws Exception {
        String token = loginAndGetToken("student@examiq.com", "Demo@123");

        mockMvc.perform(get("/api/admin/users")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isForbidden());
    }

    // ── Test 3: admin JWT → GET /api/admin/users → 200 ───────────────────

    @Test
    void adminEndpoint_adminToken_returns200() throws Exception {
        String token = loginAndGetToken("admin@examiq.com", "Demo@123");

        mockMvc.perform(get("/api/admin/users")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk());
    }

    // ── Test 4: bad credentials → 401 ────────────────────────────────────

    @Test
    void login_wrongPassword_returns401() throws Exception {
        LoginRequest req = new LoginRequest();
        req.setEmail("student@examiq.com");
        req.setPassword("WrongPass!");

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isUnauthorized());
    }

    // ── Test 5: no token → 401 ────────────────────────────────────────────

    @Test
    void protectedEndpoint_noToken_returns401() throws Exception {
        mockMvc.perform(get("/api/users/me"))
                .andExpect(status().isUnauthorized());
    }
}
