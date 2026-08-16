package com.footprint.backend.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.footprint.backend.entity.User;
import com.footprint.backend.entity.UserRole;

public interface UserRepository
        extends JpaRepository<User, Long> {

    boolean existsByUsername(String username);

    boolean existsByNickname(String nickname);

    Optional<User> findByUsername(String username);

    List<User> findByRole(UserRole role);
}