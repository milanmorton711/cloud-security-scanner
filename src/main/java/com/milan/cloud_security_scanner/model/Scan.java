package com.milan.cloud_security_scanner.model;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;

@Entity
@Table(name = "scans")
public class Scan {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    private Instant startedAt;
    private Instant completedAt;

    private int totalFindings;
    private int critical;
    private int high;
    private int medium;
    private int low;
    private int info;

    @OneToMany(
            mappedBy = "scan",
            cascade = CascadeType.ALL,
            orphanRemoval = true,
            fetch = FetchType.EAGER
    )
    private List<SecurityFinding> findings = new ArrayList<>();

    public Scan() {
    }

    public UUID getId() {
        return id;
    }

    public Instant getStartedAt() {
        return startedAt;
    }

    public Instant getCompletedAt() {
        return completedAt;
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

    public void start() {
        startedAt = Instant.now();
    }

    public void complete(List<SecurityFinding> findings) {
        completedAt = Instant.now();

        this.findings.clear();
        this.findings.addAll(findings);

        totalFindings = findings.size();

        critical = 0;
        high = 0;
        medium = 0;
        low = 0;
        info = 0;

        for (SecurityFinding finding : findings) {
            finding.setScan(this);

            switch (finding.getSeverity()) {
                case CRITICAL -> critical++;
                case HIGH -> high++;
                case MEDIUM -> medium++;
                case LOW -> low++;
                case INFO -> info++;
            }
        }
    }
}