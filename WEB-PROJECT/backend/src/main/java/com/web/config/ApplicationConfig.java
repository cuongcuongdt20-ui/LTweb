package com.web.config;

import com.web.repository.UserRepository;
import com.web.security.UserPrincipal;
import com.web.service.AdminService;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;

@Configuration
@RequiredArgsConstructor
public class ApplicationConfig {

    private final UserRepository userRepository;
    private final AdminService adminService;

    @Bean
public UserDetailsService userDetailsService() {
    return email -> {
        // Thêm dòng này để xem Terminal có in ra gì không
        System.out.println(">>> Đang đăng nhập với email: " + email); 
        
        var user = userRepository.findByEmail(email)
                .orElseThrow(() -> {
                    System.out.println(">>> LỖI: Không tìm thấy User này trong DB!");
                    return new UsernameNotFoundException("User not found: " + email);
                });
        return new UserPrincipal(user, adminService.isAdmin(email));
    };
}

    @Bean
    public AuthenticationProvider authenticationProvider() {
        DaoAuthenticationProvider provider = new DaoAuthenticationProvider();
        provider.setUserDetailsService(userDetailsService());
        provider.setPasswordEncoder(passwordEncoder());
        return provider;
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config)
            throws Exception {
        return config.getAuthenticationManager();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
    
}