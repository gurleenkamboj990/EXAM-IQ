package com.examiq.dto.response;

import com.examiq.entity.User;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserDto {
    private String id;
    private String name;
    private String email;
    private User.Role role;
    private String avatar;
    private String title;
    private String department;
    private boolean active;
    private String status;
    private LocalDateTime createdAt;
    private LocalDateTime lastLogin;

    public static UserDto from(User user) {
        return UserDto.builder()
                .id(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .role(user.getRole())
                .avatar(user.getAvatar())
                .title(user.getTitle())
                .department(user.getDepartment())
                .active(user.isActive())
                .status(user.isActive() ? "ACTIVE" : "INACTIVE")
                .createdAt(user.getCreatedAt())
                .build();
    }
}
