package com.aefstathiou.crm.mapper;

import com.aefstathiou.crm.dto.UserDTO;
import com.aefstathiou.crm.dto.UserSummaryDTO;
import com.aefstathiou.crm.model.User;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.stereotype.Service;

import java.util.function.Function;
import java.util.stream.Collectors;

@Service
public class UserDTOMapper implements Function<User, UserDTO> {
    @Override
    public UserDTO apply(User user) {
        return new UserDTO(
                user.getId(),
                user.getFirstName(),
                user.getLastName(),
                user.getEmail(),
                user.getAuthorities()
                        .stream()
                        .map(GrantedAuthority::getAuthority)
                        .collect(Collectors.toList())
        );
    }

    public UserSummaryDTO toSummaryDTO(User user) {
        if (user == null) return null;

        return new UserSummaryDTO(
                user.getId(),
                user.getFullName()
        );
    }
}
