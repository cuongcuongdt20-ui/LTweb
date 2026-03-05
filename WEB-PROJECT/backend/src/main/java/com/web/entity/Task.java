package com.web.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "tasks")
public class Task {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(nullable = false)
    private String title;

    private String description;

    private String status = "TODO";

    private String priority = "MEDIUM";

    private Double position = 0.0;

    private Integer progress = 0;

    private Double estimatedHours = 0.0;

    private Double actualHours = 0.0;

    private LocalDateTime startedAt;

    private LocalDateTime completedAt;

    private LocalDateTime dueDate;

    @Column(nullable = false)
    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

    // Quan hệ
    @ManyToOne
    @JoinColumn(name = "projectId", nullable = false)
    private Project project;

    @ManyToOne
    @JoinColumn(name = "assigneeId")
    private User assignee;

    @ManyToOne
    @JoinColumn(name = "reporterId", nullable = false)
    private User reporter;

    @OneToMany(mappedBy = "task")
    private List<Comment> comments;

    @OneToMany(mappedBy = "task")
    private List<TaskHistory> histories;
}