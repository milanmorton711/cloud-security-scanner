package com.milan.cloud_security_scanner.mock;

import java.util.List;

public class MockIAMPolicy {
    private final String policyId;
    private final String policyName;
    private final List<String> actions;
    private final List<String> resources;

    public MockIAMPolicy(String policyId, String policyName,
                         List<String> actions, List<String> resources) {
        this.policyId = policyId;
        this.policyName = policyName;
        this.actions = List.copyOf(actions);
        this.resources = List.copyOf(resources);
    }

    public String getPolicyId() { return policyId; }
    public String getPolicyName() { return policyName; }
    public List<String> getActions() { return actions; }
    public List<String> getResources() { return resources; }
}
