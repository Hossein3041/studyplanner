package com.beispiel.services;

import com.beispiel.dtos.UserDto;
import com.beispiel.entities.UserEntity;
import com.beispiel.mappers.UserMapper;
import com.beispiel.repositories.UserRepository;

import javax.crypto.SecretKeyFactory;
import javax.crypto.spec.PBEKeySpec;
import java.security.SecureRandom;
import java.util.Base64;
import java.util.Optional;


public class AuthService {

    private final UserRepository userRepository = new UserRepository();

    private static final String ALGORITHM = "PBKDF2WithHmacSHA256";
    private static final int ITERATIONS = 100_000;
    private static final int KEY_LENGTH = 256;
    private static final int SALT_LENGTH = 16;

    private String hashPassword(String plain) {
        try {
            byte[] salt = new byte[SALT_LENGTH];
            SecureRandom random = new SecureRandom();
            random.nextBytes(salt);

            PBEKeySpec spec = new PBEKeySpec(plain.toCharArray(), salt, ITERATIONS, KEY_LENGTH);
            SecretKeyFactory factory = SecretKeyFactory.getInstance(ALGORITHM);
            byte[] hash = factory.generateSecret(spec).getEncoded();

            return ALGORITHM + ":" + ITERATIONS + ":" + Base64.getEncoder().encodeToString(salt) + ":" + Base64.getEncoder().encodeToString(hash);

        } catch (Exception e) {
            throw new RuntimeException("Fehler beim Hashen des Passworts", e);
        }
    }

    public boolean verifyPassword(String plain, String storedHash) {
        try {
            String[] parts = storedHash.split(":");
            if (parts.length != 4) return false;

            int iterations = Integer.parseInt(parts[1]);
            byte[] salt = Base64.getDecoder().decode(parts[2]);
            byte[] expectedHash = Base64.getDecoder().decode(parts[3]);

            PBEKeySpec spec = new PBEKeySpec(plain.toCharArray(), salt, iterations, expectedHash.length * 8);
            SecretKeyFactory factory = SecretKeyFactory.getInstance(parts[0]);
            byte[] testHash = factory.generateSecret(spec).getEncoded();

            if (testHash.length != expectedHash.length) return false;

            int diff = 0;
            for (int i = 0; i < testHash.length; i++) {
                diff |=  testHash[i] ^ expectedHash[i];
            }
            return diff  == 0;

        } catch (Exception e) {
            return false;
        }
    }

    public UserDto register(String email, String passwordPlain) {
        if (userRepository.findByEmail(email).isPresent()) {
            throw new IllegalArgumentException("E-Mail bereits vorhanden");
        }

        String hashed = hashPassword(passwordPlain);

        UserEntity createdUser = userRepository.insert(email, hashed, "STUDENT");
        return UserMapper.toUserDto(createdUser);
    }

    public Optional<UserDto> login(String email, String passwordPlain) {
        Optional<UserEntity> opt = userRepository.findByEmail(email);

        if (opt.isEmpty()) return Optional.empty();

        UserEntity user = opt.get();

        if (verifyPassword(passwordPlain, user.getPasswordHash())) {
            return Optional.of(UserMapper.toUserDto(user));
        }

        return Optional.empty();
    }
}