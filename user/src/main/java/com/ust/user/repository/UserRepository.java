package com.ust.user.repository;
 
import com.ust.user.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
 
public interface UserRepository extends JpaRepository<User, Long> {
    // JpaRepository provides built-in CRUD methods
}
