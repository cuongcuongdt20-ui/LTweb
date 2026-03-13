package com.web.repository;

import com.web.entity.Project;
import com.web.entity.ProjectMember;
import com.web.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ProjectMemberRepository extends JpaRepository<ProjectMember, Integer> {
    boolean existsByProjectAndUser(Project project, User user);
    List<ProjectMember> findByProjectId(Integer projectId);
    Optional<ProjectMember> findByProjectIdAndUserId(Integer projectId, Long userId);
}
