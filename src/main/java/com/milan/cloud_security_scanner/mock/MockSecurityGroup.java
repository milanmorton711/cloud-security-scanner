package com.milan.cloud_security_scanner.mock;

import java.util.List;

public class MockSecurityGroup {
    private final String groupId;
    private final String groupName;
    private final List<Integer> openPorts;
    private final boolean allowsPublicAccess;

    public MockSecurityGroup(String groupId, String groupName,
                             List<Integer> openPorts,
                             boolean allowsPublicAccess) {
        this.groupId = groupId;
        this.groupName = groupName;
        this.openPorts = List.copyOf(openPorts);
        this.allowsPublicAccess = allowsPublicAccess;
    }

    public String getGroupId() { return groupId; }
    public String getGroupName() { return groupName; }
    public List<Integer> getOpenPorts() { return openPorts; }
    public boolean isAllowsPublicAccess() { return allowsPublicAccess; }
}
