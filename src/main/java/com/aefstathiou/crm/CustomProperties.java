package com.aefstathiou.crm;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

@Getter
@Setter
@Configuration
@ConfigurationProperties(prefix = "com.aefstathiou")
public class CustomProperties {

    String jwtSecret;
    String jwtAccessTokenExpiration;
    String jwtRefreshTokenExpiration;

}
