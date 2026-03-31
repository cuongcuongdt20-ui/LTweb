package com.web.controller;

import com.web.dto.task.TaskResponse;
import com.web.service.TaskService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.NoSuchElementException;

@RestController
@RequestMapping("/api/tasks")
@CrossOrigin(origins = "*")
public class MyTaskController {

    @Autowired
    private TaskService taskService;

    // GET /api/tasks/my
    @GetMapping("/my")
    public ResponseEntity<List<TaskResponse>> listAssignedTasks(Authentication auth) {
        List<TaskResponse> tasks = taskService.listAssignedTasks(auth.getName());
        return ResponseEntity.ok(tasks);
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
}
