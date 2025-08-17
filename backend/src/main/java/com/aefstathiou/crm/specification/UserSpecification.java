package com.aefstathiou.crm.specification;

import com.aefstathiou.crm.enums.Role;
import com.aefstathiou.crm.model.User;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class UserSpecification {

    public static Specification<User> firstNameContains(String firstName) {
        if (firstName == null || firstName.isBlank()) {
            return null;
        }
        return (root, query, criteriaBuilder) ->
                criteriaBuilder.like(criteriaBuilder.lower(root.get("firstName")), "%" + firstName.toLowerCase() + "%");
    }

    public static Specification<User> lastNameContains(String lastName) {
        if (lastName == null || lastName.isBlank()) {
            return null;
        }
        return (root, query, criteriaBuilder) ->
                criteriaBuilder.like(criteriaBuilder.lower(root.get("lastName")), "%" + lastName.toLowerCase() + "%");
    }

    public static Specification<User> emailContains(String email) {
        if (email == null || email.isBlank()) {
            return null;
        }
        return (root, query, criteriaBuilder) ->
                criteriaBuilder.like(criteriaBuilder.lower(root.get("email")), "%" + email.toLowerCase() + "%");
    }

    public static Specification<User> hasRole(Role role) {
        if (role == null ) {
            return null;
        }
        return (root, query, criteriaBuilder) ->
                criteriaBuilder.equal(root.get("role"), role);
    }

    public static Specification<User> hasRoleIn(List<Role> roles) {
        if (roles == null || roles.isEmpty()) {
            return null;
        }
        return (root, query, criteriaBuilder) -> root.get("role").in(roles);
    }

}
