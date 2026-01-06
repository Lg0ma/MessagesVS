package com.lmg.backend.User;

import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final PasswordEncoder passwordEncoder;
    private final UserRepository userRepository;

    @PostMapping("/register")
    public ResponseEntity<String> register(@RequestBody RegisterRequest request) {
        //Todo add validation for username and email
        //Check if username already exists
        if(userRepository.existsByUsername(request.getUsername())){
            return ResponseEntity
                    .status(HttpStatus.BAD_REQUEST)
                    .body("UserName Already Exists");
        }

        //check if email already exists
        if(userRepository.existsByEmail(request.getEmail())){
            return ResponseEntity
                    .status(HttpStatus.BAD_REQUEST)
                    .body("Email Already Exists");
        }

        //hash password
        String hashedPassword = passwordEncoder.encode(request.getPassword());

        //create user
        User user = User.builder()
                .username(request.getUsername())
                .email(request.getEmail())
                .password(hashedPassword)
                .build();

        userRepository.save(user);

        return ResponseEntity.ok("User Registered successfully");
    }
}
