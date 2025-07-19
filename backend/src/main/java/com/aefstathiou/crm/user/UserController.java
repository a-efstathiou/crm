package com.aefstathiou.crm.user;

import com.aefstathiou.crm.enums.Role;
import lombok.AllArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@CrossOrigin(origins = "http://localhost:3000")
@RestController
@RequestMapping(path = "api/user")
@AllArgsConstructor
public class UserController {

    private final UserService userService;

    @GetMapping(path = "/email/{encodedEmail}")
    public Optional<User> getUserbyEmail(@PathVariable("encodedEmail") String encodedEmail){
        //We can't enter the special chars "@" and "." at the pathName, that's why we will encode the email and the conversions
        // "@" -> "%40" and "." -> "%2E" would be ok as a path variable. The front-end should do the request using the encoded email
        // which will be decoded in the backend

        return userService.getUserByEmail(encodedEmail);
    }

    @GetMapping(path="/getAllUsers")
    public List<User> getUsers(){
        return userService.getAllUsers();
    }

    @DeleteMapping(path="{email}")
    public ResponseEntity<String> deleteUser(@PathVariable("email") String email){
        try {
            userService.deleteUser(email);
        }
        catch (IllegalArgumentException e){
            return new ResponseEntity<>(e.getMessage(), HttpStatus.BAD_REQUEST);
        }
        return ResponseEntity.ok("User Deleted");
    }


    @PutMapping (path="{userId}")
    public ResponseEntity<String> updateUser(@PathVariable("userId") long id, @RequestBody User user){
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
    public ResponseEntity<User> getUserById(@PathVariable("id") Long id){
        User user = userService.getUserById(id).orElseThrow();
        return ResponseEntity.ok(user);
    }
}
