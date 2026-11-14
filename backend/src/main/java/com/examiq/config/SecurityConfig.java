package com.examiq.config;

import com.examiq.security.JwtAuthenticationFilter;
import com.examiq.security.UserDetailsServiceImpl;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.annotation.web.configurers.HeadersConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthenticationFilter;
    private final ObjectMapper objectMapper;

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .csrf(AbstractHttpConfigurer::disable)
            .cors(cors -> {})
            .sessionManagement(sm -> sm.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .headers(h -> h.frameOptions(HeadersConfigurer.FrameOptionsConfig::disable))
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/api/auth/**").permitAll()
                .requestMatchers("/api/certificates/verify/**").permitAll()
                .requestMatchers("/swagger-ui/**", "/swagger-ui.html", "/v3/api-docs/**").permitAll()
                .requestMatchers("/h2-console/**").permitAll()
                .requestMatchers("/ws/**").permitAll()
                .requestMatchers("/api/admin/**").hasRole("ADMIN")
                .requestMatchers(HttpMethod.POST, "/api/questions").hasAnyRole("TEACHER", "ADMIN")
                .requestMatchers(HttpMethod.PUT, "/api/questions/**").hasAnyRole("TEACHER", "ADMIN")
                .requestMatchers(HttpMethod.DELETE, "/api/questions/**").hasAnyRole("TEACHER", "ADMIN")
                .requestMatchers(HttpMethod.POST, "/api/exams/*/attempt/**").authenticated()
                .requestMatchers(HttpMethod.PUT, "/api/exams/*/attempt/**").authenticated()
                .requestMatchers(HttpMethod.POST, "/api/exams").hasAnyRole("TEACHER", "ADMIN")
                .requestMatchers(HttpMethod.PUT, "/api/exams/**").hasAnyRole("TEACHER", "ADMIN")
                .requestMatchers(HttpMethod.DELETE, "/api/exams/**").hasAnyRole("TEACHER", "ADMIN")
                .anyRequest().authenticated()
            )
            .exceptionHandling(ex -> ex
                .authenticationEntryPoint((request, response, authException) -> {
                    response.setStatus(HttpStatus.UNAUTHORIZED.value());
                    response.setContentType(MediaType.APPLICATION_JSON_VALUE);
                    Map<String, Object> body = new HashMap<>();
                    body.put("timestamp", LocalDateTime.now().toString());
                    body.put("status", 401);
                    body.put("error", "Unauthorized");
                    String customMsg = (String) request.getAttribute("jwt_error_message");
                    String msg = (customMsg != null && !customMsg.isBlank()) ? customMsg : authException.getMessage();
                    if (msg == null || msg.isBlank()) {
                        msg = "Full authentication is required to access this resource";
                    }
                    body.put("message", msg);
                    body.put("path", request.getRequestURI());
                    objectMapper.writeValue(response.getOutputStream(), body);
                })
                .accessDeniedHandler((request, response, accessDeniedException) -> {
                    response.setStatus(HttpStatus.FORBIDDEN.value());
                    response.setContentType(MediaType.APPLICATION_JSON_VALUE);
                    Map<String, Object> body = new HashMap<>();
                    body.put("timestamp", LocalDateTime.now().toString());
                    body.put("status", 403);
                    body.put("error", "Forbidden");
                    body.put("message", "Access denied: insufficient permissions");
                    body.put("path", request.getRequestURI());
                    objectMapper.writeValue(response.getOutputStream(), body);
                })
            )
            .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
}
