package com.web.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.List;
 
@Entity
@Table(name = "users")
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(nullable = false)
    private String password;

    private String avatarUrl;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    // Quan hệ
    @OneToMany(mappedBy = "owner")
    private List<Project> ownedProjects;

    @OneToMany(mappedBy = "assignee")
    private List<Task> assignedTasks;

    @OneToMany(mappedBy = "reporter")
    private List<Task> reportedTasks;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public String getAvatarUrl() {
        return avatarUrl;
    }

    public void setAvatarUrl(String avatarUrl) {
        this.avatarUrl = avatarUrl;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public List<Project> getOwnedProjects() {
        return ownedProjects;
    }

    public void setOwnedProjects(List<Project> ownedProjects) {
        this.ownedProjects = ownedProjects;
    }

    public List<Task> getAssignedTasks() {
        return assignedTasks;
    }

    public void setAssignedTasks(List<Task> assignedTasks) {
        this.assignedTasks = assignedTasks;
    }

    public List<Task> getReportedTasks() {
        return reportedTasks;
    }

    public void setReportedTasks(List<Task> reportedTasks) {
        this.reportedTasks = reportedTasks;
    }

    @Override
    public String toString() {
        return "User [id=" + id + ", name=" + name + ", email=" + email + ", password=" + password + ", avatarUrl="
                + avatarUrl + ", createdAt=" + createdAt + ", ownedProjects=" + ownedProjects + ", assignedTasks="
                + assignedTasks + ", reportedTasks=" + reportedTasks + "]";
    }
    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
    }
}
