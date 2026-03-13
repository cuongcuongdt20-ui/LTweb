package com.web.repository;

import com.web.entity.Project;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ProjectRepository extends JpaRepository<Project, Integer> {
    boolean existsByKey(String key);
    Optional<Project> findByKey(String key);
}
