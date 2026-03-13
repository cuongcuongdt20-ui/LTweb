package com.web.controller;

import com.web.dto.project.CreateProjectRequest;
import com.web.dto.project.ProjectResponse;
import com.web.service.ProjectService;
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
import java.util.Map;
import java.util.NoSuchElementException;

@RestController
@RequestMapping("/api/project")
@CrossOrigin(origins = "*")
public class ProjectController {

    @Autowired
    private ProjectService projectService;

    // POST /api/project/create
    @PostMapping("/create")
    public ResponseEntity<?> create(@Valid @RequestBody CreateProjectRequest request, Authentication auth) {
        String email = auth.getName();
        ProjectResponse created = projectService.createProject(request, email);
        URI location = ServletUriComponentsBuilder
                .fromCurrentContextPath()
                .path("/api/project/{id}")
                .buildAndExpand(created.getId())
                .toUri();
        return ResponseEntity.created(location).body(created);
    }

    // GET /api/project/{id}
    @GetMapping("/{id}")
    public ResponseEntity<ProjectResponse> getById(@PathVariable Integer id) {
        ProjectResponse res = projectService.getById(id);
        return ResponseEntity.ok(res);
    }

    // DELETE /api/project/delete/{id}
    @DeleteMapping("/delete/{id}")
    public ResponseEntity<?> delete(@PathVariable Integer id, Authentication auth) {
        projectService.deleteById(id, auth.getName());
        return ResponseEntity.noContent().build();
    }

    @ExceptionHandler(NoSuchElementException.class)
    public ResponseEntity<?> handleNotFound(NoSuchElementException ex) {
        Map<String, Object> err = new HashMap<>();
        err.put("error", ex.getMessage());
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(err);
    }

    @ExceptionHandler({IllegalStateException.class, DataIntegrityViolationException.class})
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
