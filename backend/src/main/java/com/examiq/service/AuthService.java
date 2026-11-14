package com.examiq.service;

import com.examiq.dto.request.*;
import com.examiq.dto.response.ApiResponse;
import com.examiq.dto.response.AuthResponse;
import com.examiq.dto.response.UserDto;
import com.examiq.entity.RefreshToken;
import com.examiq.entity.User;
import com.examiq.exception.BadRequestException;
import com.examiq.exception.ConflictException;
import com.examiq.exception.ResourceNotFoundException;
import com.examiq.exception.UnauthorizedException;
import com.examiq.repository.RefreshTokenRepository;
import com.examiq.repository.UserRepository;
import com.examiq.security.JwtProperties;
import com.examiq.security.JwtTokenProvider;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Slf4j
@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final JwtTokenProvider jwtTokenProvider;
    private final JwtProperties jwtProperties;
    private final PasswordEncoder passwordEncoder;

    @Transactional
    public ApiResponse<AuthResponse> register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new ConflictException("Email already in use: " + request.getEmail());
        }

        User.Role role = request.getRole();
        if (role == null) {
            role = User.Role.STUDENT;
        }
        if (role == User.Role.ADMIN) {
            throw new BadRequestException("Cannot register as ADMIN");
        }

        User user = User.builder()
                .name(request.getName())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .role(role)
                .active(true)
                .build();

        userRepository.save(user);
        log.info("Registered new user: {} with role {}", user.getEmail(), user.getRole());

        UserDto userDto = UserDto.from(user);
        return ApiResponse.<AuthResponse>builder()
                .success(true)
                .message("Registration successful")
                .data(AuthResponse.builder()
                        .user(userDto)
                        .build())
                .build();
    }

    @Transactional
    public AuthResponse login(LoginRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new UnauthorizedException("Invalid email or password"));

        if (!user.isActive()) {
            throw new UnauthorizedException("Account is inactive");
        }

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new UnauthorizedException("Invalid email or password");
        }

        String accessToken = jwtTokenProvider.generateAccessToken(user.getId(), user.getEmail(), user.getRole().name());
        String rawRefreshToken = jwtTokenProvider.generateRefreshToken(user.getId());

        LocalDateTime expiresAt = LocalDateTime.now().plusDays(jwtProperties.getRefreshTokenExpiryDays());
        RefreshToken refreshToken = RefreshToken.builder()
                .token(rawRefreshToken)
                .userId(user.getId())
                .expiresAt(expiresAt)
                .revoked(false)
                .build();
        refreshTokenRepository.save(refreshToken);

        log.info("User logged in: {}", user.getEmail());

        return AuthResponse.builder()
                .user(UserDto.from(user))
                .accessToken(accessToken)
                .refreshToken(rawRefreshToken)
                .build();
    }

    @Transactional
    public AuthResponse refresh(RefreshTokenRequest request) {
        RefreshToken stored = refreshTokenRepository.findByToken(request.getRefreshToken())
                .orElseThrow(() -> new UnauthorizedException("Invalid refresh token"));

        if (stored.isRevoked()) {
            throw new UnauthorizedException("Refresh token has been revoked");
        }
        if (stored.getExpiresAt().isBefore(LocalDateTime.now())) {
            throw new UnauthorizedException("Refresh token has expired");
        }

        stored.setRevoked(true);
        refreshTokenRepository.save(stored);

        User user = userRepository.findById(stored.getUserId())
                .orElseThrow(() -> new UnauthorizedException("User not found"));

        if (!user.isActive()) {
            throw new UnauthorizedException("Account is inactive");
        }

        String newAccessToken = jwtTokenProvider.generateAccessToken(user.getId(), user.getEmail(), user.getRole().name());
        String newRefreshToken = jwtTokenProvider.generateRefreshToken(user.getId());

        RefreshToken newStored = RefreshToken.builder()
                .token(newRefreshToken)
                .userId(user.getId())
                .expiresAt(LocalDateTime.now().plusDays(jwtProperties.getRefreshTokenExpiryDays()))
                .revoked(false)
                .build();
        refreshTokenRepository.save(newStored);

        return AuthResponse.builder()
                .user(UserDto.from(user))
                .accessToken(newAccessToken)
                .refreshToken(newRefreshToken)
                .build();
    }

    @Transactional
    public void logout(RefreshTokenRequest request) {
        refreshTokenRepository.findByToken(request.getRefreshToken()).ifPresent(rt -> {
            rt.setRevoked(true);
            refreshTokenRepository.save(rt);
        });
    }

    public ApiResponse<Void> forgotPassword(ForgotPasswordRequest request) {
        userRepository.findByEmail(request.getEmail()).ifPresent(user -> {
            String resetToken = "RESET-" + java.util.UUID.randomUUID();
            log.info("Password reset URL for {}: http://localhost:5173/reset-password?token={}", user.getEmail(), resetToken);
        });
        return ApiResponse.success("If your email is registered, you will receive a password reset link.");
    }
}
