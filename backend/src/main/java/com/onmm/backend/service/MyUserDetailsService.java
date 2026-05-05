package com.onmm.backend.service;

import com.onmm.backend.entity.User;
import com.onmm.backend.entity.UserPrincipal;
import com.onmm.backend.repository.UserRepository;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

@Service
public class MyUserDetailsService implements UserDetailsService {


    private final UserRepository userRepo;

    public MyUserDetailsService(UserRepository userRepo) {
        this.userRepo = userRepo;
    }


    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {

        User user = userRepo.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User  Not Found"));

        return new UserPrincipal(user);
    }
}
