package com.milan.cloud_security_scanner.repository;

import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

import com.milan.cloud_security_scanner.model.SecurityFinding;

public interface SecurityFindingRepository
        extends JpaRepository<SecurityFinding, UUID> {

    List<SecurityFinding> findBySeverity(SecurityFinding.Severity severity);

    List<SecurityFinding> findByResourceType(
            SecurityFinding.ResourceType resourceType);
}