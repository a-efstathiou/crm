package com.aefstathiou.crm.service;

import com.aefstathiou.crm.repository.JwtTokenRepository;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import java.util.function.Function;
import org.springframework.security.core.userdetails.UserDetails;

import javax.crypto.SecretKey;

@Service
@RequiredArgsConstructor
public class JwtService {

    @Value("${com.aefstathiou.jwt-secret}")
    private String secretKey;
    @Value("${com.aefstathiou.jwt-access-token-expiration}")
    private long jwtExpiration;
    @Value("${com.aefstathiou.jwt-refresh-token-expiration}")
    private long refreshExpiration;

    private final JwtTokenRepository jwtTokenRepository;

    public String extractUsername(String token){
        return  extractClaim(token, Claims::getSubject);
    }

    public String generateAccessToken(UserDetails userDetails){
        Map<String, Object> claims = Map.of("typ", "access");
        return generateToken(new HashMap<>(),userDetails);
    }

    public String generateRefreshToken(
            UserDetails userDetails
    ) {
        Map<String, Object> claims = Map.of("typ", "refresh");
        return buildToken(claims, userDetails, refreshExpiration);
    }

    private String buildToken(
            Map<String, Object> extraClaims,
            UserDetails userDetails,
            long expiration
    ) {
        return Jwts
                .builder()
                .claims(extraClaims)
                .subject(userDetails.getUsername())
                .issuedAt(new Date(System.currentTimeMillis()))
                .expiration(new Date(System.currentTimeMillis() + expiration))
                .signWith(getSignInKey())
                .compact();
    }

    public Boolean isTokenValid(String token,UserDetails userDetails){
        final String username=extractUsername(token);
        if (!username.equals(userDetails.getUsername())) return false;
        if (isTokenExpired(token)) return false;
        return isTokenActiveInDb(token);
    }

    public boolean isTokenActiveInDb(String token) {
        return jwtTokenRepository.findByToken(token)
                .map(t -> !t.isExpired() && !t.isRevoked())
                .orElse(false);
    }

    private boolean isTokenExpired(String token) {
        return extractExpiration(token).before(new Date());
    }

    private Date extractExpiration(String token){
        return extractClaim(token,Claims::getExpiration);
    }

    public String generateToken(Map<String, Object> extraClaims, UserDetails userDetails){
        return buildToken(extraClaims, userDetails, jwtExpiration);
    }

    public <T> T extractClaim(String token, Function<Claims,T> claimsResolver){
        final Claims claims=extractAllClaims(token);
        return claimsResolver.apply(claims);
    }

    private Claims extractAllClaims(String token){
        return Jwts.parser().verifyWith(getSignInKey()).build().parseSignedClaims(token).getPayload();
    }

    private SecretKey getSignInKey() {
        byte[] keyBytes= Decoders.BASE64.decode(secretKey);
        return Keys.hmacShaKeyFor(keyBytes);
    }

    public boolean isRefreshToken(String token) {
        String typ = extractClaim(token, c -> c.get("typ", String.class));
        return "refresh".equals(typ);
    }
}
