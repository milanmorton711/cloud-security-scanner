package com.milan.cloud_security_scanner.scanner;

import java.util.ArrayList;
import java.util.List;

import org.springframework.stereotype.Component;

import com.milan.cloud_security_scanner.mock.MockCloudData;
import com.milan.cloud_security_scanner.mock.MockSecurityGroup;
import com.milan.cloud_security_scanner.model.SecurityFinding;

@Component
public class OpenSecurityGroupCheck implements SecurityCheck {

    @Override
    public List<SecurityFinding> check() {

        List<SecurityFinding> findings = new ArrayList<>();

        for (MockSecurityGroup group : MockCloudData.getSecurityGroups()) {

            if (!group.isAllowsPublicAccess()) {
                continue;
            }

            for (Integer port : group.getOpenPorts()) {

                SecurityFinding.Severity severity =
                    port == 22
                        ? SecurityFinding.Severity.CRITICAL
                        : SecurityFinding.Severity.HIGH;

                String title = "Security group exposes port " + port;

                String description =
                    group.getGroupName()
                    + " allows public access to port "
                    + port
                    + ".";

                String remediation =
                    "Restrict inbound access to port "
                    + port
                    + " using trusted IP ranges or private networking.";

                findings.add(
                    new SecurityFinding(
                        group.getGroupId(),
                        SecurityFinding.ResourceType.SECURITY_GROUP,
                        title,
                        description,
                        severity,
                        remediation
                    )
                );
            }
        }

        return findings;
    }
}