package com.aefstathiou.crm.service;

import com.aefstathiou.crm.dto.UserDTO;
import com.aefstathiou.crm.dto.request.UserChangePasswordRequest;
import com.aefstathiou.crm.dto.request.UserUpdateRequest;
import com.aefstathiou.crm.mapper.UserDTOMapper;
import com.aefstathiou.crm.model.User;
import com.aefstathiou.crm.model.UserSpecifications;
import com.aefstathiou.crm.repository.UserRepository;
import com.aefstathiou.crm.dto.request.UserCreateRequest;
import com.aefstathiou.crm.dto.request.UserRolesUpdateRequest;
import com.aefstathiou.crm.specification.UserSpecification;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.security.Principal;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class UserService {

    private static final Logger logger = LoggerFactory.getLogger(UserService.class);
    private final UserRepository userRepository;
    private final UserDTOMapper userDTOMapper;
    private final PasswordEncoder passwordEncoder;

    public UserDTO createUser(UserCreateRequest userCreateRequest) {
        Optional<User> mailOptional= userRepository.findByEmail(userCreateRequest.getEmail());
        if(mailOptional.isPresent()){
            throw new IllegalArgumentException("The email is already used");
        }

        User user = User.builder()
                .firstName(userCreateRequest.getFirstName())
                .lastName(userCreateRequest.getLastName())
                .email(userCreateRequest.getEmail())
                .password(passwordEncoder.encode(userCreateRequest.getPassword()))
                .role(userCreateRequest.getRole())
                .build();

        User savedUser = userRepository.save(user);
        logger.info("User created with email: {}", user.getEmail());

        return userDTOMapper.apply(savedUser);
    }

    public Page<UserDTO> getAllUsers(Pageable pageable, String firstName, String lastName,String email) {
        Specification<User> finalSpec = (root, query, builder) -> null;

        Specification<User> firstNameSpec = UserSpecification.firstNameContains(firstName);
        Specification<User> lastNameSpec = UserSpecification.lastNameContains(lastName);
        Specification<User> emailSpec = UserSpecification.emailContains(email);

        if (firstNameSpec != null) {
            finalSpec = firstNameSpec;
        }
        if (lastNameSpec != null) {
            finalSpec = (finalSpec != null) ? finalSpec.and(lastNameSpec) : lastNameSpec;
        }
        if (emailSpec != null) {
            finalSpec = (finalSpec != null) ? finalSpec.and(emailSpec) : emailSpec;
        }

        Page<User> userPage = userRepository.findAll(finalSpec, pageable);
        return userPage.map(userDTOMapper);
    }

    public void deleteUser(Long id){
        if(userRepository.findById(id).isEmpty()){
            throw new IllegalArgumentException("The given user does not exist");
        }
        userRepository.deleteById(id);
    }

    public Optional<UserDTO> getUserByEmail(String email){
        return userRepository.findByEmail(email).map(userDTOMapper);
    }

    public Optional<UserDTO> getUserById(Long id){
        return userRepository.findById(id).map(userDTOMapper);
    }

    public void updateUser(long userId, UserUpdateRequest request){
        User userToUpdate = userRepository.findById(userId)
                .orElseThrow(() -> new EntityNotFoundException("User not found with id: " + userId));

        userToUpdate.setFirstName(request.firstName());
        userToUpdate.setLastName(request.lastName());
        userToUpdate.setRole(request.role());

        userRepository.save(userToUpdate);
    }

    public void updateUserRoles(long id, UserRolesUpdateRequest request) {
        User user = userRepository.findById(id)
                .orElseThrow(()->new IllegalArgumentException("The User with id [%s] does not exist".formatted(id)));
        if(request.getRole()!=null){
            user.setRole(request.getRole());
        }

        userRepository.save(user);
    }

    public void changePassword(UserChangePasswordRequest request, Principal principal)
    {
        var user = (User) ((UsernamePasswordAuthenticationToken) principal).getPrincipal();

        if (!passwordEncoder.matches(request.currentPassword(), user.getPassword())) {
            throw new IllegalStateException("Wrong password");
        }

        if (passwordEncoder.matches(request.newPassword(), user.getPassword())) {
            throw new IllegalStateException("New password cannot be the same as the old password");
        }

        String hashedNewPassword = passwordEncoder.encode(request.newPassword());

        user.setPassword(hashedNewPassword);
        userRepository.save(user);
    }


}
