package com.milan.cloud_security_scanner.scanner;

import java.util.List;

import com.milan.cloud_security_scanner.model.SecurityFinding;

/**
 * Represents a single security check performed by the cloud security scanner.
 *
 * Implementations can inspect an AWS resource or configuration and return
 * one or more security findings when issues are detected.
 */
public interface SecurityCheck {

    /**
     * Executes this security check.
     *
     * @return security findings discovered by this check
     */
    List<SecurityFinding> check();
}
