package com.web.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.Arrays;
import java.util.List;

@Service
public class AdminService {

    private final List<String> adminEmails;

    public AdminService(@Value("${app.admin.emails}") String adminEmailsConfig) {
        this.adminEmails = Arrays.stream(adminEmailsConfig.split(","))
                .map(String::trim)
                .map(String::toLowerCase)
                .toList();
    }

    public boolean isAdmin(String email) {
        return adminEmails.contains(email.toLowerCase());
    }
}