package com.web.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.List;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "tasks")
@Getter
@Setter
public class Task {

    public enum TaskStatus {
        TODO,
        IN_PROGRESS,
        REVIEW,
        DONE;

        public static TaskStatus fromRequest(String value) {
            return parse(value, false);
        }

        public static TaskStatus fromStoredValue(String value) {
            return parse(value, true);
        }

        public static TaskStatus from(String value) {
            return fromStoredValue(value);
        }

        private static TaskStatus parse(String value, boolean allowCompletedAlias) {
            if (value == null || value.trim().isEmpty()) {
                throw new IllegalArgumentException("Trang thai task khong duoc de trong");
            }

            String normalized = value.trim().toUpperCase();
            if (allowCompletedAlias && "COMPLETED".equals(normalized)) {
                return DONE;
            }

            try {
                return TaskStatus.valueOf(normalized);
            } catch (IllegalArgumentException ex) {
                throw new IllegalArgumentException("Trang thai task khong hop le");
            }
        }
    }

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(nullable = false)
    private String title;

    private String description;

    private String status = TaskStatus.TODO.name();

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

    // Quan h?
    @ManyToOne
    @JoinColumn(name = "projectId")
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

    @Override
    public String toString() {
        return "Task [id=" + id + ", title=" + title + ", description=" + description + ", status=" + status
                + ", priority=" + priority + ", position=" + position + ", progress=" + progress + ", estimatedHours="
                + estimatedHours + ", actualHours=" + actualHours + ", startedAt=" + startedAt + ", completedAt="
                + completedAt + ", dueDate=" + dueDate + ", createdAt=" + createdAt + ", updatedAt=" + updatedAt
                + ", project=" + project + ", assignee=" + assignee + ", reporter=" + reporter + ", comments="
                + comments + ", histories=" + histories + "]";
    }

}
