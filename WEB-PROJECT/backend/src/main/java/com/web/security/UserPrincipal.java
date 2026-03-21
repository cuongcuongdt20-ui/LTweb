package com.web.security;

import com.web.entity.User;
import lombok.Getter;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collection;
import java.util.List;

/**
 * Adapter giua User entity va Spring Security.
 * isAdmin duoc truyen tu ngoai vao (check tu AdminService),
 * khong luu vao DB.
 */
public class UserPrincipal implements UserDetails {

    @Getter
    private final User user;

    @Getter
    private final boolean admin;

    public UserPrincipal(User user, boolean isAdmin) {
        this.user = user;
        this.admin = isAdmin;
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        if (admin) {
            return List.of(new SimpleGrantedAuthority("ROLE_ADMIN"));
        }
        return List.of(new SimpleGrantedAuthority("ROLE_USER"));
    }

    @Override public String getPassword()                { return user.getPassword(); }
    @Override public String getUsername()                { return user.getEmail(); }
    @Override public boolean isAccountNonExpired()       { return true; }
    @Override public boolean isAccountNonLocked()        { return true; }
    @Override public boolean isCredentialsNonExpired()   { return true; }
    @Override public boolean isEnabled()                 { return true; }
}