package com.examiq.service;

import com.examiq.dto.request.LoginRequest;
import com.examiq.dto.request.RefreshTokenRequest;
import com.examiq.dto.request.RegisterRequest;
import com.examiq.dto.response.ApiResponse;
import com.examiq.dto.response.AuthResponse;
import com.examiq.entity.RefreshToken;
import com.examiq.entity.User;
import com.examiq.exception.ConflictException;
import com.examiq.exception.UnauthorizedException;
import com.examiq.repository.RefreshTokenRepository;
import com.examiq.repository.UserRepository;
import com.examiq.security.JwtProperties;
import com.examiq.security.JwtTokenProvider;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.time.LocalDateTime;
import java.util.Optional;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock UserRepository userRepository;
    @Mock RefreshTokenRepository refreshTokenRepository;
    @Mock JwtTokenProvider jwtTokenProvider;
    @Mock JwtProperties jwtProperties;
    @Mock PasswordEncoder passwordEncoder;

    @InjectMocks AuthService authService;

    private User testUser;

    @BeforeEach
    void setUp() {
        testUser = User.builder()
                .name("Test Student")
                .email("student@test.com")
                .password("$2a$10$hashedPassword")
                .role(User.Role.STUDENT)
                .active(true)
                .build();
        // Simulate an ID (normally set by Hibernate)
        try {
            var idField = com.examiq.entity.BaseEntity.class.getDeclaredField("id");
            idField.setAccessible(true);
            idField.set(testUser, "user-uuid-001");
        } catch (Exception ignored) {}
    }

    // ── register ────────────────────────────────────────────────────────────

    @Test
    void register_success() {
        RegisterRequest req = new RegisterRequest();
        req.setName("New User");
        req.setEmail("new@test.com");
        req.setPassword("Pass@123");
        req.setRole(User.Role.STUDENT);

        when(userRepository.existsByEmail("new@test.com")).thenReturn(false);
        when(passwordEncoder.encode("Pass@123")).thenReturn("hashed");
        when(userRepository.save(any(User.class))).thenAnswer(inv -> inv.getArgument(0));

        ApiResponse<AuthResponse> result = authService.register(req);

        assertThat(result.isSuccess()).isTrue();
        assertThat(result.getMessage()).contains("successful");
        verify(userRepository).save(any(User.class));
    }

    @Test
    void register_duplicateEmail_throwsConflict() {
        RegisterRequest req = new RegisterRequest();
        req.setName("Dup");
        req.setEmail("dup@test.com");
        req.setPassword("Pass@123");

        when(userRepository.existsByEmail("dup@test.com")).thenReturn(true);

        assertThatThrownBy(() -> authService.register(req))
                .isInstanceOf(ConflictException.class)
                .hasMessageContaining("Email already in use");
    }

    // ── login ────────────────────────────────────────────────────────────────

    @Test
    void login_success() {
        LoginRequest req = new LoginRequest();
        req.setEmail("student@test.com");
        req.setPassword("Demo@123");

        when(userRepository.findByEmail("student@test.com")).thenReturn(Optional.of(testUser));
        when(passwordEncoder.matches("Demo@123", testUser.getPassword())).thenReturn(true);
        when(jwtTokenProvider.generateAccessToken(anyString(), anyString(), anyString()))
                .thenReturn("access-token");
        when(jwtTokenProvider.generateRefreshToken(anyString())).thenReturn("refresh-token");
        when(jwtProperties.getRefreshTokenExpiryDays()).thenReturn(7);
        when(refreshTokenRepository.save(any(RefreshToken.class))).thenAnswer(inv -> inv.getArgument(0));

        AuthResponse result = authService.login(req);

        assertThat(result.getAccessToken()).isEqualTo("access-token");
        assertThat(result.getRefreshToken()).isEqualTo("refresh-token");
        assertThat(result.getUser().getEmail()).isEqualTo("student@test.com");
    }

    @Test
    void login_wrongPassword_throwsUnauthorized() {
        LoginRequest req = new LoginRequest();
        req.setEmail("student@test.com");
        req.setPassword("wrongPassword");

        when(userRepository.findByEmail("student@test.com")).thenReturn(Optional.of(testUser));
        when(passwordEncoder.matches("wrongPassword", testUser.getPassword())).thenReturn(false);

        assertThatThrownBy(() -> authService.login(req))
                .isInstanceOf(UnauthorizedException.class)
                .hasMessageContaining("Invalid email or password");
    }

    @Test
    void login_inactiveUser_throwsUnauthorized() {
        testUser.setActive(false);
        LoginRequest req = new LoginRequest();
        req.setEmail("student@test.com");
        req.setPassword("Demo@123");

        when(userRepository.findByEmail("student@test.com")).thenReturn(Optional.of(testUser));

        assertThatThrownBy(() -> authService.login(req))
                .isInstanceOf(UnauthorizedException.class)
                .hasMessageContaining("inactive");
    }

    // ── refresh ──────────────────────────────────────────────────────────────

    @Test
    void refresh_success() {
        RefreshToken storedToken = RefreshToken.builder()
                .token("old-refresh")
                .userId("user-uuid-001")
                .expiresAt(LocalDateTime.now().plusDays(7))
                .revoked(false)
                .build();

        RefreshTokenRequest req = new RefreshTokenRequest();
        req.setRefreshToken("old-refresh");

        when(refreshTokenRepository.findByToken("old-refresh")).thenReturn(Optional.of(storedToken));
        when(refreshTokenRepository.save(any(RefreshToken.class))).thenAnswer(inv -> inv.getArgument(0));
        when(userRepository.findById("user-uuid-001")).thenReturn(Optional.of(testUser));
        when(jwtTokenProvider.generateAccessToken(anyString(), anyString(), anyString()))
                .thenReturn("new-access-token");
        when(jwtTokenProvider.generateRefreshToken(anyString())).thenReturn("new-refresh-token");
        when(jwtProperties.getRefreshTokenExpiryDays()).thenReturn(7);

        AuthResponse result = authService.refresh(req);

        assertThat(result.getAccessToken()).isEqualTo("new-access-token");
        assertThat(storedToken.isRevoked()).isTrue();
    }
}

