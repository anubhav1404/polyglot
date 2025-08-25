package com.ust.user.service;
 
import com.ust.user.model.User;
import com.ust.user.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
 
import java.util.List;
import java.util.Optional;
 
@Service
public class UserService {
 
    @Autowired
    private UserRepository userRepository;
 
    // Create or Update a User
    public User saveUser(User user) {
        return userRepository.save(user);
    }
 
    // Get All Users
    public List<User> getAllUsers() {
        return userRepository.findAll();
    }
 
    // Get User by ID
    public Optional<User> getUserById(Long id) {
        return userRepository.findById(id);
    }
 
    // Delete User by ID
    public void deleteUser(Long id) {
        userRepository.deleteById(id);
    }
}
