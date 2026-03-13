package com.web.service;

import com.web.dto.member.AddMemberRequest;
import com.web.dto.member.MemberResponse;
import com.web.dto.project.CreateProjectRequest;
import com.web.dto.project.ProjectResponse;
import com.web.entity.Project;
import com.web.entity.ProjectMember;
import com.web.entity.User;
import com.web.repository.ProjectMemberRepository;
import com.web.repository.ProjectRepository;
import com.web.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.NoSuchElementException;
import java.util.stream.Collectors;

@Service
public class ProjectService {

    @Autowired
    private ProjectRepository projectRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ProjectMemberRepository projectMemberRepository;

    public ProjectResponse createProject(CreateProjectRequest req, String ownerEmail) {
        String normalizedKey = req.getKey().trim().toUpperCase();

        if (projectRepository.existsByKey(normalizedKey)) {
            throw new IllegalStateException("Key project đã tồn tai: " + normalizedKey);
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
            throw new AccessDeniedException("Bạn không được quyền xóa project này");
        }
        try {
            projectRepository.deleteById(id);
        } catch (DataIntegrityViolationException ex) {
            throw new IllegalStateException("Không thể xóa project dang duợc tham chiếu");
        }
    }

    public MemberResponse addMember(Integer projectId, AddMemberRequest req, String requesterEmail) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new NoSuchElementException("Không tìm thấy project id=" + projectId));

        if (project.getOwner() == null || project.getOwner().getEmail() == null ||
                !project.getOwner().getEmail().equalsIgnoreCase(requesterEmail)) {
            throw new AccessDeniedException("Bạn không có quyền thêm thành viên vào project này");
        }

        String email = req.getEmail().trim();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new NoSuchElementException("Không tìm thấy user với email: " + email));

        if (projectMemberRepository.existsByProjectAndUser(project, user)) {
            throw new IllegalStateException("Nguời dùng đã là thành viên của project");
        }

        ProjectMember pm = new ProjectMember();
        pm.setProject(project);
        pm.setUser(user);
        String role = (req.getRole() == null || req.getRole().trim().isEmpty()) ? "MEMBER" : req.getRole().trim();
        pm.setRole(role);
        pm.setJoinedAt(LocalDateTime.now());

        ProjectMember saved = projectMemberRepository.save(pm);
        return toMemberResponse(saved);
    }

    public List<MemberResponse> listMembers(Integer projectId) {
        // Ensure project exists
        projectRepository.findById(projectId)
                .orElseThrow(() -> new NoSuchElementException("Không tìm thấy project id=" + projectId));

        return projectMemberRepository.findByProjectId(projectId)
                .stream()
                .map(this::toMemberResponse)
                .collect(Collectors.toList());
    }

    private MemberResponse toMemberResponse(ProjectMember pm) {
        MemberResponse res = new MemberResponse();
        res.setId(pm.getId());
        if (pm.getProject() != null) {
            res.setProjectId(pm.getProject().getId());
        }
        if (pm.getUser() != null) {
            res.setUserId(pm.getUser().getId());
            res.setUserName(pm.getUser().getName());
            res.setUserEmail(pm.getUser().getEmail());
        }
        res.setRole(pm.getRole());
        res.setJoinedAt(pm.getJoinedAt());
        res.setLeftAt(pm.getLeftAt());
        return res;
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
