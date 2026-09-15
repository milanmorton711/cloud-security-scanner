package com.milan.cloud_security_scanner.mock;

public class MockS3Bucket {
    private final String name;
    private final boolean blockPublicAccessEnabled;
    private final boolean publicPolicy;
    private final boolean publicAcl;
    private final boolean encryptionEnabled;

    public MockS3Bucket(String name, boolean blockPublicAccessEnabled,
                        boolean publicPolicy, boolean publicAcl,
                        boolean encryptionEnabled) {
        this.name = name;
        this.blockPublicAccessEnabled = blockPublicAccessEnabled;
        this.publicPolicy = publicPolicy;
        this.publicAcl = publicAcl;
        this.encryptionEnabled = encryptionEnabled;
    }

    public String getName() { return name; }
    public boolean isBlockPublicAccessEnabled() { return blockPublicAccessEnabled; }
    public boolean isPublicPolicy() { return publicPolicy; }
    public boolean isPublicAcl() { return publicAcl; }
    public boolean isEncryptionEnabled() { return encryptionEnabled; }
}