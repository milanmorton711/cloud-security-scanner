package com.milan.cloud_security_scanner.scanner;

import java.util.ArrayList;
import java.util.List;

import org.springframework.stereotype.Component;

import com.milan.cloud_security_scanner.mock.MockCloudData;
import com.milan.cloud_security_scanner.mock.MockIAMPolicy;
import com.milan.cloud_security_scanner.model.SecurityFinding;

@Component
public class IAMPermissionCheck implements SecurityCheck {

    @Override
    public List<SecurityFinding> check() {

        List<SecurityFinding> findings = new ArrayList<>();

        for (MockIAMPolicy policy : MockCloudData.getIAMPolicies()) {

            boolean wildcardAction = policy.getActions().contains("*");
            boolean wildcardResource = policy.getResources().contains("*");

            if (wildcardAction || wildcardResource) {

                StringBuilder description = new StringBuilder();

                if (wildcardAction) {
                    description.append("Policy allows all actions. ");
                }

                if (wildcardResource) {
                    description.append("Policy applies to all resources. ");
                }

                findings.add(
                    new SecurityFinding(
                        policy.getPolicyId(),
                        SecurityFinding.ResourceType.IAM_POLICY,
                        "IAM policy grants excessive permissions",
                        description.toString(),
                        SecurityFinding.Severity.CRITICAL,
                        "Follow the principle of least privilege and replace wildcard permissions with specific actions and resources."
                    )
                );
            }
        }

        return findings;
    }
}