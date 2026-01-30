package com.hyperlocal.backend.user;

import com.hyperlocal.backend.exception.CustomExceptions;
import com.hyperlocal.backend.security.JwtService;
import com.hyperlocal.backend.user.dto.LoginRequestDto;
import com.hyperlocal.backend.user.dto.LoginResponseDto;
import com.hyperlocal.backend.user.dto.RegisterRequestDto;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    @Transactional
    public void registerUser(RegisterRequestDto dto) {

        if (userRepository.existsByEmail(dto.getEmail())) {
            throw new CustomExceptions.EmailAlreadyExistsException();
        }

        User user = User.builder()
                .name(dto.getName())
                .email(dto.getEmail())
                .password(passwordEncoder.encode(dto.getPassword()))
                .role(Role.ROLE_USER)
                .verified(false)
                .build();

        userRepository.save(user);
    }

    public LoginResponseDto login(LoginRequestDto dto) {
        User user = userRepository.findByEmail(dto.getEmail())
                .orElseThrow(CustomExceptions.InvalidCredentialsException::new);

        if (!passwordEncoder.matches(dto.getPassword(), user.getPassword())) {
            throw new CustomExceptions.InvalidCredentialsException();
        }

        String token = jwtService.generateToken(user);

        return new LoginResponseDto(token);
    }

}
