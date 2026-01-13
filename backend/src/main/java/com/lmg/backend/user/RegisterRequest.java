package com.lmg.backend.user;
import lombok.Data;

@Data
public class RegisterRequest {
    private String username;
    private String email;
    private String password;
}
//DTA(Data Transfer Object) allows for secure data transfer from frontend and backend
