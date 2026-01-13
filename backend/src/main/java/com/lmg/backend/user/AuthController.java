package com.lmg.backend.user;

import com.lmg.backend.chat.ChatMessage;
import com.lmg.backend.config.JwtService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.List;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final PasswordEncoder passwordEncoder;
    private final UserRepository userRepository;
    private final JwtService jwtService;


    @PostMapping("/register")
    public ResponseEntity<String> register(@RequestBody RegisterRequest request) {
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

    @GetMapping("/test-protected")
    public ResponseEntity<String> testProtcted(){
        return ResponseEntity.ok("You are authenticated");
    }

    @GetMapping("/messages")
    public ResponseEntity<List<ChatMessage>> getMessages() {
        // This would return all messages from repository
        return ResponseEntity.ok(new ArrayList<>());
    }




    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request){
        //Find User by email
        User user = userRepository.findByEmail(request.getEmail())
                .orElse(null);

        //check if user exists
        if(user == null){
            return ResponseEntity
                    .status(HttpStatus.UNAUTHORIZED)
                    .body("Invalid email");
        }

        //verify password
        if(!passwordEncoder.matches(request.getPassword(), user.getPassword())){
            return ResponseEntity
                    .status(HttpStatus.UNAUTHORIZED)
                    .body("Invalid password");
        }
        String token = jwtService.generateToken(user.getEmail());
        LoginResponse response = new LoginResponse(token, user.getEmail(), user.getUsername());

        return ResponseEntity.ok(response);
    }
}
