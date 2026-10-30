package com.tradesphere.modules.audit.controller;

import com.tradesphere.common.security.UserPrincipal;
import com.tradesphere.modules.audit.dto.AuditEventDto;
import com.tradesphere.modules.audit.service.AuditEventService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/audit-events")
@Tag(name = "Audit Trail", description = "Immutable audit log of user authorizations, orders, and risk circuit events")
public class AuditController {

    private final AuditEventService auditEventService;

    public AuditController(AuditEventService auditEventService) {
        this.auditEventService = auditEventService;
    }

    @GetMapping
    @Operation(summary = "Get audit trail for authenticated user")
    public ResponseEntity<List<AuditEventDto>> getUserAuditTrail(@AuthenticationPrincipal UserPrincipal principal) {
        List<AuditEventDto> events = auditEventService.getAuditEventsForUser(principal.getId());
        return ResponseEntity.ok(events);
    }
}
