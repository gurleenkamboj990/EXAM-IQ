package com.examiq.service;

import com.examiq.dto.response.NotificationDto;
import com.examiq.entity.Notification;
import com.examiq.entity.User;
import com.examiq.exception.ResourceNotFoundException;
import com.examiq.repository.NotificationRepository;
import com.examiq.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;

    private String resolveUserId(String usernameOrId) {
        if (usernameOrId == null) return "";
        return userRepository.findByEmail(usernameOrId)
                .map(User::getId)
                .orElse(usernameOrId);
    }

    public List<NotificationDto> getMyNotifications(String usernameOrId) {
        String uid = resolveUserId(usernameOrId);
        return notificationRepository.findByUserIdOrderByCreatedAtDesc(uid)
                .stream().map(this::toDto).collect(Collectors.toList());
    }

    @Transactional
    public NotificationDto markRead(String notifId, String usernameOrId) {
        String uid = resolveUserId(usernameOrId);
        Notification n = notificationRepository.findById(notifId)
                .orElseThrow(() -> new ResourceNotFoundException("Notification", notifId));
        if (!n.getUserId().equals(uid)) throw new ResourceNotFoundException("Notification", notifId);
        n.setRead(true);
        notificationRepository.save(n);
        return toDto(n);
    }

    @Transactional
    public void markAllRead(String usernameOrId) {
        String uid = resolveUserId(usernameOrId);
        List<Notification> list = notificationRepository.findByUserIdOrderByCreatedAtDesc(uid);
        for (Notification n : list) {
            n.setRead(true);
        }
        notificationRepository.saveAll(list);
    }

    public NotificationDto toDto(Notification n) {
        return NotificationDto.builder()
                .id(n.getId())
                .userId(n.getUserId())
                .type(n.getType())
                .title(n.getTitle())
                .message(n.getMessage())
                .isRead(n.isRead())
                .createdAt(n.getCreatedAt())
                .build();
    }
}
