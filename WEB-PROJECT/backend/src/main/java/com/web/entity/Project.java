package com.web.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "projects")
public class Project {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(nullable = false)
    private String name;

    @Column(name = "`key`", nullable = false, unique = true)
    private String key;

    private String description;

    @Enumerated(EnumType.STRING)
    private ProjectStatus status;

    @Column(nullable = false)
    private LocalDateTime createdAt;

    // Quan hệ
    @ManyToOne
    @JoinColumn(name = "ownerId")
    private User owner;

    @OneToMany(mappedBy = "project")
    private List<Task> tasks;

    public enum ProjectStatus {
        PLANNING,
        IN_PROGRESS,
        COMPLETED,
        ON_HOLD,
        ARCHIVED
    }
}
