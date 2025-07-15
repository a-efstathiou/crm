package com.aefstathiou.crm.service;

import com.aefstathiou.crm.config.JwtService;
import com.aefstathiou.crm.model.User;
import com.aefstathiou.crm.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository usersRepository;
    private final JwtService jwtService;

    public String createUser(User user) {
        Optional<User> optional=usersRepository.findById(user.getId());
        Optional<User> mailopt=usersRepository.findByEmail(user.getEmail());
        if (optional.isPresent()){
            throw new IllegalArgumentException("The users already exists");
        }
        if(mailopt.isPresent()){
            throw new IllegalArgumentException("The email is already used");
        }
        usersRepository.save(user);
        return jwtService.generateToken(user);
    }

    public List<User> getAllUsers() { return usersRepository.findAll();
    }

    public void deleteUser(String email){
        if(usersRepository.findByEmail(email).isEmpty()){
            throw new IllegalArgumentException("The given user does not exist");
        }
        usersRepository.deleteByEmail(email);
    }

    public Optional<User> getUserByEmail(String email){
        return usersRepository.findByEmail(email);
    }

    public Optional<User> getUserById(Long id){
        return usersRepository.findById(id);
    }

    public void updateUser(long id, User userUpd){
        User user=usersRepository.findById(id).orElseThrow(()->new IllegalArgumentException("The User does not exist"));
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

        usersRepository.save(user);
    }

}
