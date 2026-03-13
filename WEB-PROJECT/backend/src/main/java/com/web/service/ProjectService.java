package com.web.service;

import com.web.dto.project.CreateProjectRequest;
import com.web.dto.project.ProjectResponse;
import com.web.entity.Project;
import com.web.entity.User;
import com.web.repository.ProjectRepository;
import com.web.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.NoSuchElementException;

@Service
public class ProjectService {

    @Autowired
    private ProjectRepository projectRepository;

    @Autowired
    private UserRepository userRepository;

    public ProjectResponse createProject(CreateProjectRequest req, String ownerEmail) {
        String normalizedKey = req.getKey().trim().toUpperCase();

        if (projectRepository.existsByKey(normalizedKey)) {
            throw new IllegalStateException("Key project đã tồn tại: " + normalizedKey);
        }

        User owner = userRepository.findByEmail(ownerEmail)
                .orElseThrow(() -> new IllegalStateException("Không tìm thấy user: " + ownerEmail));

        Project p = new Project();
        p.setName(req.getName().trim());
        p.setKey(normalizedKey);
        p.setDescription(req.getDescription());
        p.setStatus(Project.ProjectStatus.PLANNING);
        p.setCreatedAt(LocalDateTime.now());
        p.setOwner(owner);

        Project saved = projectRepository.save(p);
        return toResponse(saved);
    }

    public ProjectResponse getById(Integer id) {
        Project p = projectRepository.findById(id)
                .orElseThrow(() -> new NoSuchElementException("Không tìm thấy project id=" + id));
        return toResponse(p);
    }

    public void deleteById(Integer id, String requesterEmail) {
        Project p = projectRepository.findById(id)
                .orElseThrow(() -> new NoSuchElementException("Không tìm thấy project id=" + id));

        if (p.getOwner() == null || p.getOwner().getEmail() == null ||
                !p.getOwner().getEmail().equalsIgnoreCase(requesterEmail)) {
            throw new AccessDeniedException("Bạn không có quyền xóa project này");
        }
        try {
            projectRepository.deleteById(id);
        } catch (DataIntegrityViolationException ex) {
            throw new IllegalStateException("Không thể xóa project đang được tham chiếu");
        }
    }

    private ProjectResponse toResponse(Project p) {
        ProjectResponse res = new ProjectResponse();
        res.setId(p.getId());
        res.setName(p.getName());
        res.setKey(p.getKey());
        res.setDescription(p.getDescription());
        res.setStatus(p.getStatus() != null ? p.getStatus().name() : null);
        res.setCreatedAt(p.getCreatedAt());
        if (p.getOwner() != null) {
            res.setOwnerId(p.getOwner().getId());
            res.setOwnerName(p.getOwner().getName());
        }
        return res;
    }
}
