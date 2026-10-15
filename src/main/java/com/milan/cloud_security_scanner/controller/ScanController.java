package com.milan.cloud_security_scanner.controller;

import java.util.List;
import java.util.UUID;

import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.milan.cloud_security_scanner.model.Scan;
import com.milan.cloud_security_scanner.model.ScanResult;
import com.milan.cloud_security_scanner.model.SecurityFinding;
import com.milan.cloud_security_scanner.repository.ScanRepository;
import com.milan.cloud_security_scanner.repository.SecurityFindingRepository;
import com.milan.cloud_security_scanner.scanner.RemediationTracker;
import com.milan.cloud_security_scanner.scanner.SecurityScanner;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "http://localhost:5173")
public class ScanController {

    private final SecurityScanner securityScanner;
    private final ScanRepository scanRepository;
    private final SecurityFindingRepository securityFindingRepository;
    private final RemediationTracker remediationTracker;

    public ScanController(
            SecurityScanner securityScanner,
            ScanRepository scanRepository,
            SecurityFindingRepository securityFindingRepository,
            RemediationTracker remediationTracker) {

        this.securityScanner = securityScanner;
        this.scanRepository = scanRepository;
        this.securityFindingRepository = securityFindingRepository;
        this.remediationTracker = remediationTracker;
    }

    @GetMapping("/scan")
    public ScanResult scan() {
        return new ScanResult(securityScanner.scan());
    }

    @GetMapping("/scans")
    public List<Scan> getScans() {
        return scanRepository.findAll();
    }

    @GetMapping("/scans/{id}")
    public Scan getScan(@PathVariable UUID id) {
        return scanRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Scan not found"));
    }

    @DeleteMapping("/scans/{id}")
    public void deleteScan(@PathVariable UUID id) {
        Scan scan = scanRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Scan not found"));

        scanRepository.delete(scan);
    }

    @PatchMapping("/findings/{id}/status")
    public SecurityFinding updateFindingStatus(
            @PathVariable UUID id,
            @RequestParam SecurityFinding.FindingStatus status) {

        SecurityFinding finding = securityFindingRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Finding not found"));

        finding.setStatus(status);

        if (status == SecurityFinding.FindingStatus.RESOLVED) {
            remediationTracker.markFixed(finding);
        } else {
            remediationTracker.markUnfixed(finding);
        }

        return securityFindingRepository.save(finding);
    }
}