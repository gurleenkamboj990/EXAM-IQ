package com.examiq.util;

import java.security.SecureRandom;
import java.time.Year;

public class CertificateIdGenerator {

    private static final String CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    private static final SecureRandom RANDOM = new SecureRandom();

    private CertificateIdGenerator() {}

    public static String generate() {
        int year = Year.now().getValue();
        StringBuilder sb = new StringBuilder();
        for (int i = 0; i < 6; i++) {
            sb.append(CHARS.charAt(RANDOM.nextInt(CHARS.length())));
        }
        return "EXQ-" + year + "-" + sb;
    }
}
