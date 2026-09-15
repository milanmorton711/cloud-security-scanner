package com.milan.cloud_security_scanner.model;

import java.time.Instant;
import java.util.List;

public class ScanResult {

    private Instant scannedAt;
    private int totalFindings;
    private int critical;
    private int high;
    private int medium;
    private int low;
    private int info;
    private List<SecurityFinding> findings;

    public ScanResult(List<SecurityFinding> findings) {
        this.scannedAt = Instant.now();
        this.findings = findings;
        this.totalFindings = findings.size();

        for (SecurityFinding finding : findings) {
            switch (finding.getSeverity()) {
                case CRITICAL -> critical++;
                case HIGH -> high++;
                case MEDIUM -> medium++;
                case LOW -> low++;
                case INFO -> info++;
            }
        }
    }

    public Instant getScannedAt() {
        return scannedAt;
    }

    public int getTotalFindings() {
        return totalFindings;
    }

    public int getCritical() {
        return critical;
    }

    public int getHigh() {
        return high;
    }

    public int getMedium() {
        return medium;
    }

    public int getLow() {
        return low;
    }

    public int getInfo() {
        return info;
    }

    public List<SecurityFinding> getFindings() {
        return findings;
    }
}