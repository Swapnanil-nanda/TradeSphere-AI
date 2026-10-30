package com.tradesphere.modules.audit.service;

import com.tradesphere.modules.audit.dto.AuditEventDto;
import com.tradesphere.modules.audit.entity.AuditEvent;
import com.tradesphere.modules.audit.repository.AuditEventRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class AuditEventService {

    private final AuditEventRepository auditEventRepository;

    public AuditEventService(AuditEventRepository auditEventRepository) {
        this.auditEventRepository = auditEventRepository;
    }

    @Transactional
    public void logEvent(Long userId, String eventType, String detailsJson) {
        logEvent(userId, eventType, detailsJson, "127.0.0.1");
    }

    @Transactional
    public void logEvent(Long userId, String eventType, String detailsJson, String ipAddress) {
        AuditEvent event = new AuditEvent(userId, eventType, detailsJson, ipAddress);
        auditEventRepository.save(event);
    }

    @Transactional(readOnly = true)
    public List<AuditEventDto> getAuditEventsForUser(Long userId) {
        return auditEventRepository.findByUserIdOrderByCreatedAtDesc(userId)
                .stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    private AuditEventDto toDto(AuditEvent e) {
        AuditEventDto dto = new AuditEventDto();
        dto.setId(e.getId());
        dto.setUserId(e.getUserId());
        dto.setEventType(e.getEventType());
        dto.setDetailsJson(e.getDetailsJson());
        dto.setIpAddress(e.getIpAddress());
        dto.setCreatedAt(e.getCreatedAt());
        return dto;
    }
}
