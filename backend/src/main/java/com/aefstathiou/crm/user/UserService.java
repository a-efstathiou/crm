package com.aefstathiou.crm.user;

import com.aefstathiou.crm.jwt.JwtService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final JwtService jwtService;
    private final UserDTOMapper userDTOMapper;

    public String createUser(User user) {
        Optional<User> userOptional= userRepository.findById(user.getId());
        Optional<User> mailOptional= userRepository.findByEmail(user.getEmail());
        if (userOptional.isPresent()){
            throw new IllegalArgumentException("The users already exists");
        }
        if(mailOptional.isPresent()){
            throw new IllegalArgumentException("The email is already used");
        }
        userRepository.save(user);
        return jwtService.generateToken(user);
    }

    public List<UserDTO> getAllUsers() {
        return userRepository.findAll()
                .stream()
                .map(userDTOMapper)
                .collect(Collectors.toList());
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
        if(userUpd.getRoles()!=null){
            user.setRoles(userUpd.getRoles());
        }

        userRepository.save(user);
    }

    public void updateUserRoles(long id, UserRolesUpdateRequest request) {
        User user = userRepository.findById(id)
                .orElseThrow(()->new IllegalArgumentException("The User with id [%s] does not exist".formatted(id)));
        if(request.getRoles()!=null && !request.getRoles().isEmpty()){
            user.setRoles(request.getRoles());
        }

        userRepository.save(user);
    }

}
