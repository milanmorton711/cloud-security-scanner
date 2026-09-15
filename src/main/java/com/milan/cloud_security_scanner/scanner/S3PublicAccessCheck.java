package com.milan.cloud_security_scanner.scanner;

import java.util.ArrayList;
import java.util.List;

import org.springframework.stereotype.Component;

import com.milan.cloud_security_scanner.mock.MockCloudData;
import com.milan.cloud_security_scanner.mock.MockS3Bucket;
import com.milan.cloud_security_scanner.model.SecurityFinding;

@Component
public class S3PublicAccessCheck implements SecurityCheck {

    @Override
    public List<SecurityFinding> check() {

        List<SecurityFinding> findings = new ArrayList<>();

        for (MockS3Bucket bucket : MockCloudData.getBuckets()) {

            if (bucket.isPublicPolicy()
                    || bucket.isPublicAcl()
                    || !bucket.isBlockPublicAccessEnabled()) {

                StringBuilder description = new StringBuilder();

                if (bucket.isPublicPolicy()) {
                    description.append("Bucket has a public bucket policy. ");
                }

                if (bucket.isPublicAcl()) {
                    description.append("Bucket has a public ACL. ");
                }

                if (!bucket.isBlockPublicAccessEnabled()) {
                    description.append("S3 Block Public Access is disabled. ");
                }

                SecurityFinding finding = new SecurityFinding(
                    bucket.getName(),
                    SecurityFinding.ResourceType.S3_BUCKET,
                    "S3 bucket may be publicly accessible",
                    description.toString(),
                    SecurityFinding.Severity.CRITICAL,
                    "Enable S3 Block Public Access and remove public bucket policies or ACLs."
                );

                findings.add(finding);
            }
        }

        return findings;
    }
}