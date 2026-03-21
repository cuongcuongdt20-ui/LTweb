package com.web.service;

import com.web.dto.AuthResponse;
import com.web.dto.LoginRequest;
import com.web.dto.RefreshTokenRequest;
import com.web.dto.RegisterRequest;
import com.web.entity.RefreshToken;
import com.web.entity.User;
import com.web.repository.RefreshTokenRepository;
import com.web.repository.UserRepository;
import com.web.security.JwtService;
import com.web.security.UserPrincipal;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.Instant;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;
    private final AdminService adminService;

    @Value("${app.jwt.refresh-expiration-ms}")
    private long refreshExpirationMs;

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new IllegalArgumentException("Email already in use: " + request.getEmail());
        }

        User user = new User();
        user.setName(request.getName());
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));

        userRepository.save(user);
        return buildAuthResponse(user);
    }

    @Transactional
public AuthResponse login(LoginRequest request) {
    try {
        // Dòng này thường là nơi gây ra lỗi 500
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
        );

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        return buildAuthResponse(user);
    } catch (Exception e) {
        // ÉP LỖI PHẢI HIỆN RA TERMINAL
        System.out.println("!!!!!!!! LỖI ĐĂNG NHẬP: " + e.getMessage());
        e.printStackTrace();
        throw e; // Ném lại lỗi để Spring xử lý tiếp
    }
}
    @Transactional
    public AuthResponse refreshToken(RefreshTokenRequest request) {
        RefreshToken storedToken = refreshTokenRepository.findByToken(request.getRefreshToken())
                .orElseThrow(() -> new IllegalArgumentException("Refresh token not found"));

        if (storedToken.isExpired()) {
            refreshTokenRepository.delete(storedToken);
            throw new IllegalArgumentException("Refresh token expired. Please login again.");
        }

        User user = storedToken.getUser();
        refreshTokenRepository.delete(storedToken);

        return AuthResponse.builder()
                .accessToken(jwtService.generateAccessToken(toPrincipal(user)))
                .refreshToken(createAndSaveRefreshToken(user))
                .tokenType("Bearer")
                .user(mapToUserDto(user))
                .build();
    }

    @Transactional
    public void logout(User user) {
        refreshTokenRepository.deleteByUser(user);
    }

    // ── Helpers ───────────────────────────────────────────────

    private AuthResponse buildAuthResponse(User user) {
        return AuthResponse.builder()
                .accessToken(jwtService.generateAccessToken(toPrincipal(user)))
                .refreshToken(createAndSaveRefreshToken(user))
                .tokenType("Bearer")
                .user(mapToUserDto(user))
                .build();
    }

    private UserPrincipal toPrincipal(User user) {
        return new UserPrincipal(user, adminService.isAdmin(user.getEmail()));
    }

    private String createAndSaveRefreshToken(User user) {
        refreshTokenRepository.deleteByUser(user);

        String tokenValue = jwtService.generateRefreshToken(toPrincipal(user));

        RefreshToken refreshToken = RefreshToken.builder()
                .token(tokenValue)
                .user(user)
                .expiryDate(Instant.now().plusMillis(refreshExpirationMs))
                .build();

        refreshTokenRepository.save(refreshToken);
        return tokenValue;
    }

    private AuthResponse.UserDto mapToUserDto(User user) {
        return AuthResponse.UserDto.builder()
                .id(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .avatarUrl(user.getAvatarUrl())
                .admin(adminService.isAdmin(user.getEmail()))
                .build();
    }
}