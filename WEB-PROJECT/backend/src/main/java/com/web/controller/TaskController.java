package com.web.controller;

import com.web.dto.comment.CommentResponse;
import com.web.dto.comment.CreateCommentRequest;
import com.web.dto.task.TaskHistoryResponse;
import com.web.dto.task.TaskResponse;
import com.web.service.CommentService;
import com.web.service.TaskService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import java.net.URI;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.NoSuchElementException;

@RestController
@RequestMapping("/api/project")
@CrossOrigin(origins = "*")
public class TaskController {

    @Autowired
    private TaskService taskService;

    @Autowired
    private CommentService commentService;

    // POST /api/project/{projectId}/tasks
    @PostMapping("/{projectId}/tasks")
    public ResponseEntity<?> createTask(@PathVariable Integer projectId,
            @RequestBody Map<String, Object> request,
            Authentication auth) {
        TaskResponse created = taskService.createTask(projectId, request, auth.getName());
        URI location = ServletUriComponentsBuilder
                .fromCurrentContextPath()
                .path("/api/project/{projectId}/tasks/{taskId}")
                .buildAndExpand(projectId, created.getId())
                .toUri();
        return ResponseEntity.created(location).body(created);
    }

    // GET /api/project/{projectId}/tasks/my
    @GetMapping("/{projectId}/tasks/my")
    public ResponseEntity<List<TaskResponse>> listMyTasks(@PathVariable Integer projectId, Authentication auth) {
        List<TaskResponse> tasks = taskService.listMyTasks(projectId, auth.getName());
        return ResponseEntity.ok(tasks);
    }

    // PATCH /api/project/{projectId}/tasks/{taskId}
    @PatchMapping("/{projectId}/tasks/{taskId}")
    public ResponseEntity<TaskResponse> updateTask(@PathVariable Integer projectId,
            @PathVariable Integer taskId,
            @RequestBody Map<String, Object> request,
            Authentication auth) {
        TaskResponse updated = taskService.updateTask(projectId, taskId, request, auth.getName());
        return ResponseEntity.ok(updated);
    }

    // PATCH /api/project/{projectId}/tasks/{taskId}/status
    @PatchMapping("/{projectId}/tasks/{taskId}/status")
    public ResponseEntity<TaskResponse> updateStatus(@PathVariable Integer projectId,
            @PathVariable Integer taskId,
            @RequestBody Map<String, Object> request,
            Authentication auth) {
        TaskResponse updated = taskService.updateStatus(projectId, taskId, request, auth.getName());
        return ResponseEntity.ok(updated);
    }

    // GET /api/project/{projectId}/tasks/{taskId}/history
    @GetMapping("/{projectId}/tasks/{taskId}/history")
    public ResponseEntity<List<TaskHistoryResponse>> listTaskHistory(@PathVariable Integer projectId,
            @PathVariable Integer taskId,
            Authentication auth) {
        List<TaskHistoryResponse> histories = taskService.listTaskHistories(projectId, taskId, auth.getName());
        return ResponseEntity.ok(histories);
    }

    // DELETE /api/project/{projectId}/tasks/{taskId}
    @DeleteMapping("/{projectId}/tasks/{taskId}")
    public ResponseEntity<?> deleteTask(@PathVariable Integer projectId,
            @PathVariable Integer taskId,
            Authentication auth) {
        taskService.deleteTask(projectId, taskId, auth.getName());
        return ResponseEntity.noContent().build();
    }

    // GET /api/project/{projectId}/tasks/{taskId}/comments
    @GetMapping("/{projectId}/tasks/{taskId}/comments")
    public ResponseEntity<List<CommentResponse>> listComments(@PathVariable Integer projectId,
            @PathVariable Integer taskId,
            Authentication auth) {
        List<CommentResponse> comments = commentService.listComments(projectId, taskId, auth.getName());
        return ResponseEntity.ok(comments);
    }

    // POST /api/project/{projectId}/tasks/{taskId}/comments
    @PostMapping("/{projectId}/tasks/{taskId}/comments")
    public ResponseEntity<CommentResponse> createComment(@PathVariable Integer projectId,
            @PathVariable Integer taskId,
            @Valid @RequestBody CreateCommentRequest request,
            Authentication auth) {
        CommentResponse created = commentService.createComment(projectId, taskId, request, auth.getName());
        URI location = ServletUriComponentsBuilder
                .fromCurrentContextPath()
                .path("/api/project/{projectId}/tasks/{taskId}/comments/{commentId}")
                .buildAndExpand(projectId, taskId, created.getId())
                .toUri();
        return ResponseEntity.created(location).body(created);
    }

    // DELETE /api/project/{projectId}/tasks/{taskId}/comments/{commentId}
    @DeleteMapping("/{projectId}/tasks/{taskId}/comments/{commentId}")
    public ResponseEntity<?> deleteComment(@PathVariable Integer projectId,
            @PathVariable Integer taskId,
            @PathVariable Integer commentId,
            Authentication auth) {
        commentService.deleteComment(projectId, taskId, commentId, auth.getName());
        return ResponseEntity.noContent().build();
    }

    @ExceptionHandler(NoSuchElementException.class)
    public ResponseEntity<?> handleNotFound(NoSuchElementException ex) {
        Map<String, Object> err = new HashMap<>();
        err.put("error", ex.getMessage());
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(err);
    }

    @ExceptionHandler({ IllegalStateException.class, DataIntegrityViolationException.class })
    public ResponseEntity<?> handleConflict(RuntimeException ex) {
        Map<String, Object> err = new HashMap<>();
        err.put("error", ex.getMessage());
        return ResponseEntity.status(HttpStatus.CONFLICT).body(err);
    }

    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<?> handleForbidden(AccessDeniedException ex) {
        Map<String, Object> err = new HashMap<>();
        err.put("error", ex.getMessage());
        return ResponseEntity.status(HttpStatus.FORBIDDEN).body(err);
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<?> handleBadRequest(IllegalArgumentException ex) {
        Map<String, Object> err = new HashMap<>();
        err.put("error", ex.getMessage());
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(err);
    }
}
