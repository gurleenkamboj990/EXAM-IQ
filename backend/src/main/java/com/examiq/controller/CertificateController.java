package com.examiq.controller;

import com.examiq.dto.response.ApiResponse;
import com.examiq.dto.response.CertificateDto;
import com.examiq.service.CertificateService;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/certificates")
@RequiredArgsConstructor
@Tag(name = "Certificates")
public class CertificateController {

    private final CertificateService certificateService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<CertificateDto>>> getMyCertificates(
            @RequestParam(required = false) String studentId,
            @AuthenticationPrincipal UserDetails userDetails) {
        String targetId = (studentId != null && !studentId.isBlank())
                ? studentId
                : (userDetails != null ? userDetails.getUsername() : "");
        List<CertificateDto> certs = certificateService.getMyCertificates(targetId);
        return ResponseEntity.ok(ApiResponse.success(certs));
    }

    @GetMapping("/verify/{certificateId}")
    public ResponseEntity<ApiResponse<CertificateDto>> verify(@PathVariable String certificateId) {
        CertificateDto cert = certificateService.verify(certificateId);
        if (cert == null) {
            return ResponseEntity.ok(ApiResponse.error("Certificate not found"));
        }
        return ResponseEntity.ok(ApiResponse.success(cert));
    }

    @GetMapping("/{certId}")
    public ResponseEntity<ApiResponse<CertificateDto>> getById(@PathVariable String certId) {
        CertificateDto cert = certificateService.verify(certId);
        if (cert == null) {
            return ResponseEntity.ok(ApiResponse.error("Certificate not found"));
        }
        return ResponseEntity.ok(ApiResponse.success(cert));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<CertificateDto>> create(
            @RequestBody CertificateDto request,
            @AuthenticationPrincipal UserDetails userDetails) {
        String userId = userDetails != null ? userDetails.getUsername() : "";
        CertificateDto created = certificateService.createManual(request, userId);
        return ResponseEntity.ok(ApiResponse.success("Certificate generated", created));
    }
}
