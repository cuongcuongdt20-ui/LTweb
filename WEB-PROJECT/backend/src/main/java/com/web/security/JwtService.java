package com.web.security;

import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;
import io.jsonwebtoken.SignatureAlgorithm;
import javax.crypto.SecretKey;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import java.util.function.Function;

@Service
public class JwtService {

    @Value("${app.jwt.access-secret}")
    private String accessSecret;

    @Value("${app.jwt.refresh-secret}")
    private String refreshSecret;

    @Value("${app.jwt.access-expiration-ms}")
    private long accessExpirationMs;

    @Value("${app.jwt.refresh-expiration-ms}")
    private long refreshExpirationMs;

    // ── Access Token ─────────────────────────────────────────────────────────

    public String generateAccessToken(UserDetails userDetails) {
        return buildToken(new HashMap<>(), userDetails, accessSecret, accessExpirationMs);
    }

    public boolean isAccessTokenValid(String token, UserDetails userDetails) {
        return extractUsername(token, accessSecret).equals(userDetails.getUsername())
                && !isExpired(token, accessSecret);
    }

    public String extractUsernameFromAccess(String token) {
        return extractUsername(token, accessSecret);
    }

    // ── Refresh Token ────────────────────────────────────────────────────────

    public String generateRefreshToken(UserDetails userDetails) {
        return buildToken(new HashMap<>(), userDetails, refreshSecret, refreshExpirationMs);
    }

    public boolean isRefreshTokenValid(String token, UserDetails userDetails) {
        return extractUsername(token, refreshSecret).equals(userDetails.getUsername())
                && !isExpired(token, refreshSecret);
    }

    public String extractUsernameFromRefresh(String token) {
        return extractUsername(token, refreshSecret);
    }

    // ── Shared helpers ────────────────────────────────────────────────────────

    private String buildToken(Map<String, Object> extraClaims, UserDetails userDetails,
                               String secret, long expirationMs) {
        return Jwts.builder()
                .setClaims(extraClaims)
                .setSubject(userDetails.getUsername())
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + expirationMs))
                .signWith(getKey(secret), SignatureAlgorithm.HS256)
                .compact();
    }

    private String extractUsername(String token, String secret) {
        return extractClaim(token, secret, Claims::getSubject);
    }

    private boolean isExpired(String token, String secret) {
        return extractClaim(token, secret, Claims::getExpiration).before(new Date());
    }

    private <T> T extractClaim(String token, String secret, Function<Claims, T> resolver) {
        Claims claims = Jwts.parserBuilder()
                    .setSigningKey(getKey(secret))
                    .build()
                    .parseClaimsJws(token)
                    .getBody();
        return resolver.apply(claims);
    }

    private SecretKey getKey(String secret) {
        byte[] raw = secret.getBytes();
        byte[] key = new byte[32];
        System.arraycopy(raw, 0, key, 0, Math.min(raw.length, 32));
        return Keys.hmacShaKeyFor(key);
    }
}