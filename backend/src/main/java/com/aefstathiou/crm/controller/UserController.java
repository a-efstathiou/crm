package com.aefstathiou.crm.controller;

import com.aefstathiou.crm.dto.request.UserChangePasswordRequest;
import com.aefstathiou.crm.dto.request.UserUpdateRequest;
import com.aefstathiou.crm.enums.Role;
import com.aefstathiou.crm.model.User;
import com.aefstathiou.crm.dto.UserDTO;
import com.aefstathiou.crm.dto.request.UserCreateRequest;
import com.aefstathiou.crm.dto.request.UserRolesUpdateRequest;
import com.aefstathiou.crm.service.UserService;
import jakarta.validation.Valid;
import lombok.AllArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;
import java.util.Optional;

@CrossOrigin(origins = "http://localhost:5173")
@RestController
@RequestMapping(path = "api/v1/users")
@AllArgsConstructor
public class UserController {

    private final UserService userService;

    @GetMapping(path = "/email/{encodedEmail}")
    public Optional<UserDTO> getUserByEmail(@PathVariable("encodedEmail") String encodedEmail) {
        return userService.getUserByEmail(encodedEmail);
    }

    @GetMapping(path="/getAllUsers")
    @PreAuthorize("hasRole('ADMIN')")
    public Page<UserDTO> getUsers(
            Pageable pageable,
            @RequestParam(required = false) String firstName,
            @RequestParam(required = false) String lastName,
            @RequestParam(required = false) String email
    ) {
        return userService.getAllUsers(pageable, firstName, lastName, email);
    }

    @DeleteMapping(path="{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<String> deleteUserByEmail(@PathVariable("id") Long id) {
        try {
            userService.deleteUser(id);
        }
        catch (IllegalArgumentException e){
            return new ResponseEntity<>(e.getMessage(), HttpStatus.BAD_REQUEST);
        }
        return ResponseEntity.ok("User Deleted");
    }

    @PutMapping (path="/{userId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<String> updateUser(
            @PathVariable("userId") long id,
            @RequestBody @Valid UserUpdateRequest userUpdateRequest
    ) {

        userService.updateUser(id, userUpdateRequest);

        return ResponseEntity.ok("User Updated");
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
    

    @PostMapping("/createUser")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<UserDTO> createUser(@RequestBody UserCreateRequest userCreateRequest) {
        UserDTO userDTO = userService.createUser(userCreateRequest);
        return ResponseEntity.ok(userDTO);
    }

    @PostMapping("/changePassword")
    public ResponseEntity<?> changePassword(
            @RequestBody @Valid UserChangePasswordRequest userChangePasswordRequest,
            Principal principal
    ) {
        userService.changePassword(userChangePasswordRequest,principal);

        return ResponseEntity.ok().build();
    }

    @GetMapping("/search-customers")
    @PreAuthorize("hasAnyRole('SUPPORT_AGENT', 'SUPERVISOR', 'ADMIN')")
    public ResponseEntity<List<UserDTO>> searchCustomers(@RequestParam("q") String searchTerm) {
        List<UserDTO> customers = userService.searchCustomers(searchTerm);
        return ResponseEntity.ok(customers);
    }

    @GetMapping("/search-staff")
    @PreAuthorize("hasAnyRole('SUPPORT_AGENT', 'SUPERVISOR', 'ADMIN')")
    public ResponseEntity<List<UserDTO>> searchInternalStaff(@RequestParam("q") String searchTerm) {
        List<UserDTO> customers = userService.searchInternalStuff(searchTerm);
        return ResponseEntity.ok(customers);
    }

}
