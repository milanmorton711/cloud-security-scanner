package com.milan.cloud_security_scanner.repository;

import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.milan.cloud_security_scanner.model.Scan;

@Repository
public interface ScanRepository extends JpaRepository<Scan, UUID> {
}