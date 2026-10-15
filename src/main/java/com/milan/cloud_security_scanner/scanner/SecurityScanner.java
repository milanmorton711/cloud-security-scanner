package com.milan.cloud_security_scanner.scanner;

import java.util.ArrayList;
import java.util.List;

import org.springframework.stereotype.Service;

import com.milan.cloud_security_scanner.model.Scan;
import com.milan.cloud_security_scanner.model.SecurityFinding;
import com.milan.cloud_security_scanner.repository.ScanRepository;

@Service
public class SecurityScanner {

    private final List<SecurityCheck> securityChecks;
    private final ScanRepository scanRepository;
    private final RemediationTracker remediationTracker;

    public SecurityScanner(
            List<SecurityCheck> securityChecks,
            ScanRepository scanRepository,
            RemediationTracker remediationTracker) {

        this.securityChecks = securityChecks;
        this.scanRepository = scanRepository;
        this.remediationTracker = remediationTracker;
    }

    public List<SecurityFinding> scan() {

        List<SecurityFinding> findings = new ArrayList<>();

        for (SecurityCheck securityCheck : securityChecks) {
            for (SecurityFinding finding : securityCheck.check()) {
                if (!remediationTracker.isFixed(finding)) {
                    findings.add(finding);
                }
            }
        }

        Scan scan = new Scan();
        scan.start();
        scan.complete(findings);

        scanRepository.save(scan);

        return findings;
    }
}