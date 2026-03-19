package com.web.repository;

import com.web.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

/**
 * UserRepository — "Kho lưu trữ, tra cứu User"
 *
 * Chỉ cần khai báo interface, Spring Data JPA tự tạo code SQL!
 *
 * JpaRepository<User, Long> cung cấp sẵn:
 * - save(user) → INSERT hoặc UPDATE
 * - findById(id) → SELECT WHERE id = ?
 * - findAll() → SELECT * FROM users
 * - deleteById(id) → DELETE WHERE id = ?
 * - count() → SELECT COUNT(*)
 *
 * Ta chỉ cần thêm các method tìm kiếm đặc biệt:
 */
@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    // Spring tự tạo: SELECT * FROM users WHERE name = ?
    Optional<User> findByName(String name);

    // Spring tự tạo: SELECT COUNT(*) > 0 FROM users WHERE name = ?
    Boolean existsByName(String name);

    // Spring tự tạo: SELECT COUNT(*) > 0 FROM users WHERE email = ?
    boolean existsByEmail(String email);

    Optional<User> findByEmail(String email);
}