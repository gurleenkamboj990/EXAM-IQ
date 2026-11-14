package com.examiq.service;

import com.examiq.dto.request.CreateUserRequest;
import com.examiq.dto.response.UserDto;
import com.examiq.entity.User;
import com.examiq.exception.BadRequestException;
import com.examiq.exception.ConflictException;
import com.examiq.exception.ResourceNotFoundException;
import com.examiq.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public UserDto getMe(String userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", userId));
        return UserDto.from(user);
    }

    public List<UserDto> getAllUsers() {
        return userRepository.findAll().stream()
                .map(UserDto::from)
                .collect(Collectors.toList());
    }

    public UserDto getUserById(String id) {
        return UserDto.from(userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User", id)));
    }

    public UserDto createUser(CreateUserRequest req) {
        if (userRepository.existsByEmail(req.getEmail())) {
            throw new ConflictException("Email already exists: " + req.getEmail());
        }

        String rawPassword = (req.getPassword() != null && !req.getPassword().isBlank())
                ? req.getPassword()
                : "Demo@123";

        User.Role role = req.getRole() != null ? req.getRole() : User.Role.STUDENT;

        String avatar = req.getAvatar();
        if (avatar == null || avatar.isBlank()) {
            avatar = "https://api.dicebear.com/7.x/avataaars/svg?seed=" + req.getEmail();
        }

        User user = User.builder()
                .name(req.getName())
                .email(req.getEmail())
                .password(passwordEncoder.encode(rawPassword))
                .role(role)
                .title(req.getTitle())
                .department(req.getDepartment())
                .avatar(avatar)
                .active(true)
                .build();

        return UserDto.from(userRepository.save(user));
    }

    public UserDto updateUser(String id, CreateUserRequest req) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User", id));
        if (req.getName() != null) user.setName(req.getName());
        if (req.getTitle() != null) user.setTitle(req.getTitle());
        if (req.getDepartment() != null) user.setDepartment(req.getDepartment());
        if (req.getAvatar() != null) user.setAvatar(req.getAvatar());
        if (req.getRole() != null) user.setRole(req.getRole());
        userRepository.save(user);
        return UserDto.from(user);
    }

    public UserDto updateRole(String id, User.Role role) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User", id));
        user.setRole(role);
        return UserDto.from(userRepository.save(user));
    }

    public UserDto updateStatus(String id, boolean active) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User", id));
        user.setActive(active);
        return UserDto.from(userRepository.save(user));
    }

    public void deleteUser(String id, String currentAdminEmail) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User", id));
        if (currentAdminEmail != null && user.getEmail().equalsIgnoreCase(currentAdminEmail)) {
            throw new BadRequestException("Admin cannot delete own account");
        }
        user.setActive(false);
        userRepository.save(user);
    }

    public void deleteUser(String id) {
        deleteUser(id, null);
    }
}
