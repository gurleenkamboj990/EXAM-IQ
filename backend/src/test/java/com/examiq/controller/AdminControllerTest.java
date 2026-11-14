package com.examiq.controller;

import com.examiq.dto.request.CreateUserRequest;
import com.examiq.dto.request.LoginRequest;
import com.examiq.entity.User;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.annotation.DirtiesContext;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("default")
@DirtiesContext(classMode = DirtiesContext.ClassMode.BEFORE_CLASS)
class AdminControllerTest {

    @Autowired MockMvc mockMvc;
    @Autowired ObjectMapper objectMapper;

    private String adminToken;
    private String studentToken;

    @BeforeEach
    void setupTokens() throws Exception {
        if (adminToken == null) {
            adminToken = loginAndGetToken("admin@examiq.com", "Demo@123");
        }
        if (studentToken == null) {
            studentToken = loginAndGetToken("student@examiq.com", "Demo@123");
        }
    }

    private String loginAndGetToken(String email, String password) throws Exception {
        LoginRequest req = new LoginRequest();
        req.setEmail(email);
        req.setPassword(password);

        MvcResult result = mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isOk())
                .andReturn();

        return objectMapper.readTree(result.getResponse().getContentAsString())
                .path("data").path("accessToken").asText();
    }

    @Test
    void createUser_student_success() throws Exception {
        CreateUserRequest req = new CreateUserRequest();
        req.setName("Test Student");
        req.setEmail("teststudent@examiq.com");
        req.setRole(User.Role.STUDENT);
        // password omitted

        mockMvc.perform(post("/api/admin/users")
                        .header("Authorization", "Bearer " + adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.name").value("Test Student"))
                .andExpect(jsonPath("$.data.email").value("teststudent@examiq.com"))
                .andExpect(jsonPath("$.data.role").value("STUDENT"))
                .andExpect(jsonPath("$.data.status").value("ACTIVE"))
                .andExpect(jsonPath("$.data.active").value(true));

        // verify new student can log in with default password Demo@123
        String newToken = loginAndGetToken("teststudent@examiq.com", "Demo@123");
        assertThat(newToken).isNotBlank();
    }

    @Test
    void createUser_teacher_success() throws Exception {
        CreateUserRequest req = new CreateUserRequest();
        req.setName("Test Teacher");
        req.setEmail("testteacher@examiq.com");
        req.setRole(User.Role.TEACHER);

        mockMvc.perform(post("/api/admin/users")
                        .header("Authorization", "Bearer " + adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.name").value("Test Teacher"))
                .andExpect(jsonPath("$.data.email").value("testteacher@examiq.com"))
                .andExpect(jsonPath("$.data.role").value("TEACHER"))
                .andExpect(jsonPath("$.data.status").value("ACTIVE"));

        String newToken = loginAndGetToken("testteacher@examiq.com", "Demo@123");
        assertThat(newToken).isNotBlank();
    }

    @Test
    void createUser_admin_success() throws Exception {
        CreateUserRequest req = new CreateUserRequest();
        req.setName("Test Admin");
        req.setEmail("testadmin@examiq.com");
        req.setRole(User.Role.ADMIN);

        mockMvc.perform(post("/api/admin/users")
                        .header("Authorization", "Bearer " + adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.name").value("Test Admin"))
                .andExpect(jsonPath("$.data.email").value("testadmin@examiq.com"))
                .andExpect(jsonPath("$.data.role").value("ADMIN"))
                .andExpect(jsonPath("$.data.status").value("ACTIVE"));

        String newToken = loginAndGetToken("testadmin@examiq.com", "Demo@123");
        assertThat(newToken).isNotBlank();
    }

    @Test
    void createUser_duplicateEmail_throwsConflict() throws Exception {
        CreateUserRequest req = new CreateUserRequest();
        req.setName("Existing Admin");
        req.setEmail("admin@examiq.com");
        req.setRole(User.Role.ADMIN);

        mockMvc.perform(post("/api/admin/users")
                        .header("Authorization", "Bearer " + adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.status").value(409))
                .andExpect(jsonPath("$.message").value("Email already exists: admin@examiq.com"));
    }

    @Test
    void createUser_forbidden_forStudent() throws Exception {
        CreateUserRequest req = new CreateUserRequest();
        req.setName("Hacker");
        req.setEmail("hacker@examiq.com");
        req.setRole(User.Role.ADMIN);

        mockMvc.perform(post("/api/admin/users")
                        .header("Authorization", "Bearer " + studentToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isForbidden());
    }
}

