package com.milan.cloud_security_scanner.model;

import java.time.Instant;
import java.util.Objects;
import java.util.UUID;

import com.fasterxml.jackson.annotation.JsonIgnore;

import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

@Entity
@Table(name = "security_findings")
public class SecurityFinding {

    @Id
    private UUID id;

    @NotBlank(message = "resourceId must not be blank")
    @Size(max = 512)
    private String resourceId;

    @NotNull(message = "resourceType must not be null")
    @Enumerated(EnumType.STRING)
    private ResourceType resourceType;

    @NotBlank(message = "title must not be blank")
    @Size(max = 255)
    private String title;

    @NotBlank(message = "description must not be blank")
    private String description;

    @NotNull(message = "severity must not be null")
    @Enumerated(EnumType.STRING)
    private Severity severity;

    @Size(max = 2000)
    private String remediation;

    @NotNull
    private Instant discoveredAt;

    @NotNull
    @Enumerated(EnumType.STRING)
    private FindingStatus status = FindingStatus.NOT_STARTED;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "scan_id")
    @JsonIgnore
    private Scan scan;

    protected SecurityFinding() {
    }

    public SecurityFinding(
            String resourceId,
            ResourceType resourceType,
            String title,
            String description,
            Severity severity,
            String remediation) {

        this.id = UUID.randomUUID();
        this.resourceId = resourceId;
        this.resourceType = resourceType;
        this.title = title;
        this.description = description;
        this.severity = severity;
        this.remediation = remediation;
        this.discoveredAt = Instant.now();
        this.status = FindingStatus.NOT_STARTED;
    }

    public UUID getId() {
        return id;
    }

    public String getResourceId() {
        return resourceId;
    }

    public void setResourceId(String resourceId) {
        this.resourceId = resourceId;
    }

    public ResourceType getResourceType() {
        return resourceType;
    }

    public void setResourceType(ResourceType resourceType) {
        this.resourceType = resourceType;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public Severity getSeverity() {
        return severity;
    }

    public void setSeverity(Severity severity) {
        this.severity = severity;
    }

    public String getRemediation() {
        return remediation;
    }

    public void setRemediation(String remediation) {
        this.remediation = remediation;
    }

    public Instant getDiscoveredAt() {
        return discoveredAt;
    }

    public void setDiscoveredAt(Instant discoveredAt) {
        this.discoveredAt = discoveredAt;
    }

    public FindingStatus getStatus() {
        return status;
    }

    public void setStatus(FindingStatus status) {
        this.status = status;
    }

    public Scan getScan() {
        return scan;
    }

    public void setScan(Scan scan) {
        this.scan = scan;
    }

    public enum FindingStatus {
        NOT_STARTED,
        IN_PROGRESS,
        RESOLVED
    }

    public enum ResourceType {
        S3_BUCKET,
        EC2_INSTANCE,
        IAM_ROLE,
        IAM_POLICY,
        SECURITY_GROUP,
        RDS_INSTANCE,
        LAMBDA_FUNCTION,
        VPC,
        OTHER
    }

    public enum Severity {
        INFO,
        LOW,
        MEDIUM,
        HIGH,
        CRITICAL
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) {
            return true;
        }

        if (!(o instanceof SecurityFinding)) {
            return false;
        }

        SecurityFinding that = (SecurityFinding) o;

        return id != null && id.equals(that.id);
    }

    @Override
    public int hashCode() {
        return Objects.hash(id);
    }

    @Override
    public String toString() {
        return "SecurityFinding{" +
                "id=" + id +
                ", resourceId='" + resourceId + '\'' +
                ", resourceType=" + resourceType +
                ", title='" + title + '\'' +
                ", severity=" + severity +
                ", status=" + status +
                ", discoveredAt=" + discoveredAt +
                '}';
    }
}