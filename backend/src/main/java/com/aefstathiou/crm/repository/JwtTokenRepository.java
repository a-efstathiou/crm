package com.aefstathiou.crm.repository;

import com.aefstathiou.crm.model.JwtToken;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;

public interface JwtTokenRepository extends JpaRepository<JwtToken, Integer> {

    @Query("""
      select t from JwtToken t
      where t.user.id = :userId
        and t.tokenType = com.aefstathiou.crm.enums.TokenType.ACCESS
        and t.expired = false
        and t.revoked = false
    """)
    List<JwtToken> findAllValidAccessTokensByUser(Long userId);

    Optional<JwtToken> findByToken(String token);

    @Query("""
      select t from JwtToken t
      where t.token = :token
        and t.tokenType = com.aefstathiou.crm.enums.TokenType.REFRESH
    """)
    Optional<JwtToken> findRefreshToken(String token);
}
