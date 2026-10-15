package com.milan.cloud_security_scanner.mock;

import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.ThreadLocalRandom;

public class MockCloudData {

    private static final List<String> EXTRA_BUCKETS = List.of(
        "staging-uploads",
        "analytics-exports",
        "temp-file-share",
        "ml-training-data"
    );

    private static final List<String[]> EXTRA_GROUPS = List.of(
        new String[] { "sg-101", "dev-bastion" },
        new String[] { "sg-102", "legacy-database" },
        new String[] { "sg-103", "test-windows-rdp" }
    );

    private static final List<String[]> EXTRA_POLICIES = List.of(
        new String[] { "policy-101", "CiDeployPolicy" },
        new String[] { "policy-102", "DataTeamAccess" }
    );

    private static final List<Integer> RISKY_PORTS = List.of(22, 3389, 5432, 8080);

    public static List<MockS3Bucket> getBuckets() {
        List<MockS3Bucket> buckets = new ArrayList<>(List.of(
            new MockS3Bucket("customer-data-prod", false, true, false, false),
            new MockS3Bucket("internal-assets", true, false, false, true),
            new MockS3Bucket("backups", false, false, true, true)
        ));

        for (String name : EXTRA_BUCKETS) {
            if (chance(0.5)) {
                buckets.add(new MockS3Bucket(
                    name,
                    chance(0.5),
                    chance(0.3),
                    chance(0.3),
                    chance(0.5)
                ));
            }
        }

        return buckets;
    }

    public static List<MockSecurityGroup> getSecurityGroups() {
        List<MockSecurityGroup> groups = new ArrayList<>(List.of(
            new MockSecurityGroup("sg-001", "web-server", List.of(22, 80, 443), true),
            new MockSecurityGroup("sg-002", "internal-api", List.of(8080), false)
        ));

        for (String[] group : EXTRA_GROUPS) {
            if (chance(0.5)) {
                List<Integer> ports = new ArrayList<>();

                for (Integer port : RISKY_PORTS) {
                    if (chance(0.35)) {
                        ports.add(port);
                    }
                }

                groups.add(new MockSecurityGroup(group[0], group[1], ports, chance(0.6)));
            }
        }

        return groups;
    }

    public static List<MockIAMPolicy> getIAMPolicies() {
        List<MockIAMPolicy> policies = new ArrayList<>(List.of(
            new MockIAMPolicy("policy-001", "AdminPolicy", List.of("*"), List.of("*")),
            new MockIAMPolicy(
                "policy-002",
                "ReadOnlyS3",
                List.of("s3:GetObject", "s3:ListBucket"),
                List.of("arn:aws:s3:::internal-assets/*")
            )
        ));

        for (String[] policy : EXTRA_POLICIES) {
            if (chance(0.5)) {
                policies.add(new MockIAMPolicy(
                    policy[0],
                    policy[1],
                    chance(0.5) ? List.of("*") : List.of("s3:PutObject"),
                    chance(0.5) ? List.of("*") : List.of("arn:aws:s3:::staging-uploads/*")
                ));
            }
        }

        return policies;
    }

    private static boolean chance(double probability) {
        return ThreadLocalRandom.current().nextDouble() < probability;
    }
}