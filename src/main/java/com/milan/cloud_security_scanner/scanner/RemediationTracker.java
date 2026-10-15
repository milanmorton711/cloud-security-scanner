package com.milan.cloud_security_scanner.scanner;

import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;

import org.springframework.stereotype.Component;

import com.milan.cloud_security_scanner.model.SecurityFinding;

@Component
public class RemediationTracker {

    private final Set<String> fixed = ConcurrentHashMap.newKeySet();

    public void markFixed(SecurityFinding finding) {
        fixed.add(key(finding));
    }

    public void markUnfixed(SecurityFinding finding) {
        fixed.remove(key(finding));
    }

    public boolean isFixed(SecurityFinding finding) {
        return fixed.contains(key(finding));
    }

    private String key(SecurityFinding finding) {
        return finding.getResourceId() + "|" + finding.getTitle();
    }
}