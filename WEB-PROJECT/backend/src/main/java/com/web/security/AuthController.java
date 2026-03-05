package com.web.controller;

import com.web.entity.User;
import com.web.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*")
public class AuthController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    // ===================== SIGN UP =====================
    @PostMapping("/signup")
    public ResponseEntity<?> registerUser(@RequestBody User signUpRequest) {

        // Kiểm tra email tồn tại
        if (userRepository.existsByEmail(signUpRequest.getEmail())) {
            return ResponseEntity.badRequest().body("Email đã tồn tại!");
        }

        User user = new User();
        user.setName(signUpRequest.getName());
        user.setEmail(signUpRequest.getEmail());
        user.setPassword(passwordEncoder.encode(signUpRequest.getPassword())); // Encode password
        user.setAvatarUrl(signUpRequest.getAvatarUrl());

        userRepository.save(user);

        return ResponseEntity.ok("Đăng ký thành công!");
    }

    // ===================== SIGN IN =====================
    @PostMapping("/signin")
    public ResponseEntity<?> authenticateUser(@RequestBody User loginRequest) {

        return userRepository.findByEmail(loginRequest.getEmail())
                .map(user -> {
                    if (passwordEncoder.matches(loginRequest.getPassword(), user.getPassword())) {

                        // TODO: Tạo JWT ở đây
                        String dummyToken = "jwt_token_demo_123";

                        return ResponseEntity.ok(dummyToken);
                    } else {
                        return ResponseEntity.badRequest().body("Sai mật khẩu!");
                    }
                })
                .orElse(ResponseEntity.badRequest().body("Email không tồn tại!"));
    }
}