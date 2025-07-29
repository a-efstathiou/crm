package com.aefstathiou.crm.controller;

import com.aefstathiou.crm.enums.Role;
import com.aefstathiou.crm.model.User;
import com.aefstathiou.crm.dto.UserDTO;
import com.aefstathiou.crm.request.UserRolesUpdateRequest;
import com.aefstathiou.crm.service.UserService;
import lombok.AllArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@CrossOrigin(origins = "http://localhost:5173")
@RestController
@RequestMapping(path = "api/v1/users")
@AllArgsConstructor
public class UserController {

    private final UserService userService;

    @GetMapping(path = "/email/{encodedEmail}")
    public Optional<UserDTO> getUserbyEmail(@PathVariable("encodedEmail") String encodedEmail) {
        return userService.getUserByEmail(encodedEmail);
    }

    @GetMapping(path="/getAllUsers")
    @PreAuthorize("hasRole('ADMIN')")
    public List<UserDTO> getUsers(){
        return userService.getAllUsers();
    }

    @DeleteMapping(path="{email}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<String> deleteUser(@PathVariable("email") String email) {
        try {
            userService.deleteUser(email);
        }
        catch (IllegalArgumentException e){
            return new ResponseEntity<>(e.getMessage(), HttpStatus.BAD_REQUEST);
        }
        return ResponseEntity.ok("User Deleted");
    }

    @PutMapping (path="{userId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<String> updateUser(@PathVariable("userId") long id, @RequestBody User user) {
        try {
            userService.updateUser(id, user);
        }
        catch (IllegalArgumentException e){
            return new ResponseEntity<>(e.getMessage(),HttpStatus.BAD_REQUEST);
        }
        return ResponseEntity.ok("User Updated") ;
    }

    @GetMapping("/getAllRoles")
    public ResponseEntity<Role[]> getAllRoles() {
        return ResponseEntity.ok().body(Role.values());
    }

    @GetMapping(path="/id/{id}")
    public ResponseEntity<UserDTO> getUserById(@PathVariable("id") Long id) {
        UserDTO userDTO = userService.getUserById(id).orElseThrow();
        return ResponseEntity.ok(userDTO);
    }

    @PutMapping(path = "{userId}/roles")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<String> updateUserRoles(@PathVariable("userId") long id, @RequestBody UserRolesUpdateRequest request) {
        userService.updateUserRoles(id, request);
        return ResponseEntity.ok("User's roles updated") ;
    }
}
