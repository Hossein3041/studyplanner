package com.beispiel.services;

import com.beispiel.entities.PasswordResetTokenEntity;
import com.beispiel.repositories.PasswordResetTokenRepository;
import com.beispiel.dtos.UserDto;
import com.beispiel.entities.RememberMeTokenEntity;
import com.beispiel.entities.UserEntity;
import com.beispiel.mappers.UserMapper;
import com.beispiel.repositories.RememberMeTokenRepository;
import com.beispiel.repositories.UserRepository;

import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;

import javax.crypto.SecretKeyFactory;
import javax.crypto.spec.PBEKeySpec;
import java.security.SecureRandom;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Base64;
import java.util.Optional;


public class AuthService {

    private final UserRepository userRepository = new UserRepository();
    private final RememberMeTokenRepository rememberMeTokenRepository = new RememberMeTokenRepository();
    private final PasswordResetTokenRepository passwordResetTokenRepository = new PasswordResetTokenRepository();

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

    private String randomString(int length) {
        return java.util.UUID.randomUUID().toString().replace("-", "").substring(0, length);
    }

    public UserDto login(String email, String passwordPlain, boolean rememberMe, HttpServletRequest req, HttpServletResponse resp) {
        
        Optional<UserEntity> opt = userRepository.findByEmail(email);
        if (opt.isEmpty()) {
            throw new IllegalArgumentException("Ungültige Anmeldedaten");
        }

        UserEntity user = opt.get();
        if (!verifyPassword(passwordPlain, user.getPasswordHash())) {
            throw new IllegalArgumentException("Ungültige Anmeldedaten");
        }

        HttpSession session = req.getSession(true);
        session.setAttribute("userId", user.getId());
        session.setAttribute("email", user.getEmail());
        session.setAttribute("role", user.getRole());

        if (rememberMe) {
            String selector = randomString(16);
            String validatorRaw = randomString(32);

            String validatorHash = hashPassword(validatorRaw);

            RememberMeTokenEntity token = new RememberMeTokenEntity();
            token.setUserId(user.getId());
            token.setSelector(selector);
            token.setValidator(validatorHash);
            token.setExpiresAt(Instant.now().plus(14, ChronoUnit.DAYS));

            rememberMeTokenRepository.save(token);

            String cookieValue = selector + ":" + validatorRaw;

            Cookie rememberCookie = new Cookie("REMEMBER_ME", cookieValue);
            rememberCookie.setHttpOnly(true);

            String contextPath = req.getContextPath();
            if (contextPath == null || contextPath.isEmpty()) {
                contextPath = "/";
            }

            rememberCookie.setPath(contextPath);
            rememberCookie.setMaxAge(14 * 24 * 60 * 60);

            resp.addCookie(rememberCookie);
        }

        return UserMapper.toUserDto(user);
    }

    public UserDto tryLoginFromRememberMe(HttpServletRequest req, HttpServletResponse resp) {
        Cookie[] cookies = req.getCookies();
        if (cookies == null) return null;

        String raw = null;
        for (Cookie c : cookies) {
            if ("REMEMBER_ME".equals(c.getName())) {
                raw = c.getValue();
                break;
            }
        }

        if (raw == null || !raw.contains(":")) {
            return null;
        }

        String[] parts = raw.split(":", 2);
        String selector = parts[0];
        String validatorRaw = parts[1];

        var opt = rememberMeTokenRepository.findBySelector(selector);
        if (opt.isEmpty()) {
            return null;
        }

        var token = opt.get();

        if (token.getExpiresAt().isBefore(Instant.now())) {
            rememberMeTokenRepository.deleteBySelector(selector);
            return null;
        }

        if (!verifyPassword(validatorRaw, token.getValidator())) {
            rememberMeTokenRepository.deleteBySelector(selector);
            return null;
        }

        Optional<UserEntity> userOpt = userRepository.findById(token.getUserId());
        if (userOpt.isEmpty()) {
            return null;
        }

        UserEntity user = userOpt.get();

        HttpSession session = req.getSession(true);
        session.setAttribute("userId", user.getId());
        session.setAttribute("email", user.getEmail());
        session.setAttribute("role", user.getRole());

        return UserMapper.toUserDto(user);
    }

    public void logout(HttpServletRequest req, HttpServletResponse resp) {

        HttpSession session = req.getSession(false);
        if (session != null) {
            session.invalidate();
        }

        Cookie[] cookies = req.getCookies();
        if (cookies == null) return;

        for (Cookie c : cookies) {
            if ("REMEMBER_ME".equals(c.getName())) {
                String value = c.getValue();
                if (value != null && value.contains(":")) {
                    String selector = value.split(":", 2)[0];
                    rememberMeTokenRepository.deleteBySelector(selector);
                }

                c.setValue("");
                String contextPath = req.getContextPath();
                if (contextPath == null || contextPath.isEmpty()) {
                    contextPath = "/";
                }

                c.setPath(contextPath);
                c.setMaxAge(0);
                resp.addCookie(c);
            }
        }
    }

    public String requestPasswordReset(String email) {
        Optional<UserEntity> optUser = userRepository.findByEmail(email);
        if (optUser.isEmpty()) {
            return null;
        }

        UserEntity user = optUser.get();

        String token = java.util.UUID.randomUUID().toString().replace("-", "");

        PasswordResetTokenEntity prt = new PasswordResetTokenEntity();
        prt.setUserId(user.getId());
        prt.setToken(token);
        prt.setExpiresAt(Instant.now().plus(1, ChronoUnit.HOURS));

        passwordResetTokenRepository.save(prt);

        return token;
    }

    public void resetPassword(String token, String newPlainPassword) {
        Optional<PasswordResetTokenEntity> optToken = passwordResetTokenRepository.findByToken(token);
        if (optToken.isEmpty()) {
            throw new IllegalArgumentException("Ungültiger oder abgelaufender Token");
        }

        PasswordResetTokenEntity prt = optToken.get();

        if (prt.getUsedAt() != null) {
            throw new IllegalArgumentException("Token wurde bereits verwendet");
        }
        if (prt.getExpiresAt().isBefore(Instant.now())) {
            throw new IllegalArgumentException("Token ist abgelaufen");
        }

        Optional<UserEntity> optUser = userRepository.findById(prt.getUserId());
        if (optUser.isEmpty()) {
            throw new IllegalArgumentException("Benutzer zum Token nicht gefunden");
        }

        UserEntity user = optUser.get();
        String newHash = hashPassword(newPlainPassword);
        userRepository.updatePassword(user.getId(), newHash);

        passwordResetTokenRepository.markUsed(prt.getId());
    }
}
