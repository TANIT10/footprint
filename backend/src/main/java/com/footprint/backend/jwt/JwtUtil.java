package com.footprint.backend.jwt;

import java.nio.charset.StandardCharsets;
import java.util.Date;

import javax.crypto.SecretKey;
import javax.crypto.spec.SecretKeySpec;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;

@Component
public class JwtUtil {

    private final String secretKey;
    private final long expirationTime;

    public JwtUtil(
        @Value("${jwt.secret}") String secretKey,
        @Value("${jwt.expiration-ms:86400000}") long expirationTime
    ) {
        if (secretKey == null || secretKey.isBlank()) {
            throw new IllegalStateException(
                "JWT_SECRET 환경변수가 설정되지 않았습니다."
            );
        }

        if (secretKey.getBytes(StandardCharsets.UTF_8).length < 32) {
            throw new IllegalStateException(
                "JWT_SECRET은 32바이트 이상이어야 합니다."
            );
        }

        this.secretKey = secretKey;
        this.expirationTime = expirationTime;
    }

    private SecretKey getSigningKey() {
        byte[] keyBytes =
            secretKey.getBytes(StandardCharsets.UTF_8);

        return new SecretKeySpec(
            keyBytes,
            SignatureAlgorithm.HS256.getJcaName()
        );
    }

    public String createToken(String username) {
        Date now = new Date();

        Date expiration = new Date(
            now.getTime() + expirationTime
        );

        return Jwts.builder()
            .subject(username)
            .issuedAt(now)
            .expiration(expiration)
            .signWith(getSigningKey())
            .compact();
    }

    public String getUsername(String token) {
        return Jwts.parser()
            .verifyWith(getSigningKey())
            .build()
            .parseSignedClaims(token)
            .getPayload()
            .getSubject();
    }

    public boolean validateToken(String token) {
        try {
            getUsername(token);
            return true;
        } catch (Exception exception) {
            return false;
        }
    }
}