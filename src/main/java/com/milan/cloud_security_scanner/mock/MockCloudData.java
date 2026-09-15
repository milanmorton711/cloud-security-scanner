package com.milan.cloud_security_scanner.mock;

import java.util.List;

public class MockCloudData {

    public static List<MockS3Bucket> getBuckets() {
        return List.of(
            new MockS3Bucket(
                "customer-data-prod",
                false,
                true,
                false,
                false
            ),
            new MockS3Bucket(
                "internal-assets",
                true,
                false,
                false,
                true
            ),
            new MockS3Bucket(
                "backups",
                false,
                false,
                true,
                true
            )
        );
    }

    public static List<MockSecurityGroup> getSecurityGroups() {
        return List.of(
            new MockSecurityGroup(
                "sg-001",
                "web-server",
                List.of(22, 80, 443),
                true
            ),
            new MockSecurityGroup(
                "sg-002",
                "internal-api",
                List.of(8080),
                false
            )
        );
    }

    public static List<MockIAMPolicy> getIAMPolicies() {
        return List.of(
            new MockIAMPolicy(
                "policy-001",
                "AdminPolicy",
                List.of("*"),
                List.of("*")
            ),
            new MockIAMPolicy(
                "policy-002",
                "ReadOnlyS3",
                List.of("s3:GetObject", "s3:ListBucket"),
                List.of("arn:aws:s3:::internal-assets/*")
            )
        );
    }
}