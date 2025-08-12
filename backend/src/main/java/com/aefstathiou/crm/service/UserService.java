package com.aefstathiou.crm.service;

import com.aefstathiou.crm.dto.UserDTO;
import com.aefstathiou.crm.mapper.UserDTOMapper;
import com.aefstathiou.crm.enums.Role;
import com.aefstathiou.crm.model.User;
import com.aefstathiou.crm.model.UserSpecifications;
import com.aefstathiou.crm.repository.UserRepository;
import com.aefstathiou.crm.dto.request.RegisterRequest;
import com.aefstathiou.crm.dto.request.UserRolesUpdateRequest;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class UserService {

    private static final Logger logger = LoggerFactory.getLogger(UserService.class);
    private final UserRepository userRepository;
    private final UserDTOMapper userDTOMapper;
    private final PasswordEncoder passwordEncoder;

    public UserDTO createUser(RegisterRequest registerRequest) {
        Optional<User> mailOptional= userRepository.findByEmail(registerRequest.getEmail());
        if(mailOptional.isPresent()){
            throw new IllegalArgumentException("The email is already used");
        }

        User user = User.builder()
                .firstName(registerRequest.getFirstName())
                .lastName(registerRequest.getLastName())
                .email(registerRequest.getEmail())
                .password(passwordEncoder.encode(registerRequest.getPassword()))
                .role(Role.CUSTOMER)
                .build();

        User savedUser = userRepository.save(user);
        logger.info("User created with email: {}", user.getEmail());

        return userDTOMapper.apply(savedUser);
    }

    public Page<UserDTO> getAllUsers(Pageable pageable, String firstName, String lastName,String email) {
        Specification<User> spec = UserSpecifications.findByCriteria(firstName, lastName, email);

        // Use the new repository method that accepts a Specification
        Page<User> userPage = userRepository.findAll(spec, pageable);
        return userPage.map(userDTOMapper);
    }

    public void deleteUser(String email){
        if(userRepository.findByEmail(email).isEmpty()){
            throw new IllegalArgumentException("The given user does not exist");
        }
        userRepository.deleteByEmail(email);
    }

    public Optional<UserDTO> getUserByEmail(String email){
        return userRepository.findByEmail(email).map(userDTOMapper);
    }

    public Optional<UserDTO> getUserById(Long id){
        return userRepository.findById(id).map(userDTOMapper);
    }

    public void updateUser(long id, User userUpd){
        User user= userRepository.findById(id).orElseThrow(()->new IllegalArgumentException("The User with id [%s] does not exist".formatted(id)));
        if(userUpd.getEmail()!=null){
            user.setEmail(userUpd.getEmail());
        }
        if(userUpd.getFirstName()!=null){
            user.setFirstName(userUpd.getFirstName());
        }
        if(userUpd.getLastName()!=null){
            user.setLastName(userUpd.getLastName());
        }
        if(userUpd.getPassword()!=null){
            user.setPassword(userUpd.getPassword());
        }
        if(userUpd.getRole()!=null){
            user.setRole(userUpd.getRole());
        }

        userRepository.save(user);
    }

    public void updateUserRoles(long id, UserRolesUpdateRequest request) {
        User user = userRepository.findById(id)
                .orElseThrow(()->new IllegalArgumentException("The User with id [%s] does not exist".formatted(id)));
        if(request.getRole()!=null){
            user.setRole(request.getRole());
        }

        userRepository.save(user);
    }

}
