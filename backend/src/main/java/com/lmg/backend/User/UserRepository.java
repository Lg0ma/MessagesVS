package com.lmg.backend.User;

import org.springframework.data.jpa.repository.JpaRepository;

public interface UserRepository extends JpaRepository<User, Long> {
    // That's it! Spring provides all basic methods automatically
    boolean existsByUsername(String username);
    boolean existsByEmail(String email);

//    Optional<User> findByEmail(String email);
}
