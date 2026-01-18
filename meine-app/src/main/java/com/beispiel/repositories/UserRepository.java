package com.beispiel.repositories;

import com.beispiel.entities.UserEntity;
import com.beispiel.util.DbUtil;

import java.sql.*;
import java.time.Instant;
import java.time.ZoneId;
import java.util.Optional;

public class UserRepository {

    public Optional<UserEntity> findByEmail(String email) {
        String sql = "SELECT id, email, password_hash, created_at, role FROM users WHERE email = ?";
        try (Connection con = DbUtil.getConnection();
            PreparedStatement ps = con.prepareStatement(sql)) {

            ps.setString(1, email);
            try (ResultSet rs = ps.executeQuery()) {
                if (rs.next()) {
                    UserEntity user = new UserEntity();
                    user.setId(rs.getLong("id"));
                    user.setEmail(rs.getString("email"));
                    user.setPasswordHash(rs.getString("password_hash"));
                    user.setRole(rs.getString("role"));

                    Timestamp ts = rs.getTimestamp("created_at");
                    if (ts != null) {
                        user.setCreatedAt(ts.toInstant());
                    }

                    return Optional.of(user);
                }
            }

            return Optional.empty();
        } catch (SQLException e) {
            throw new RuntimeException("Fehler beim Laden des Users", e);
        }
    }

    public Optional<UserEntity> findById(Long id) {
        String sql = "SELECT id, email, password_hash, role, created_at FROM users WHERE id = ?";
        try (Connection con = DbUtil.getConnection();
            PreparedStatement ps = con.prepareStatement(sql)) {
            
            ps.setLong(1, id);

            try (ResultSet rs = ps.executeQuery()) {
                if (rs.next()) {

                    UserEntity user = new UserEntity();
                    user.setId(rs.getLong("id"));
                    user.setEmail(rs.getString("email"));
                    user.setPasswordHash(rs.getString("password_hash"));
                    user.setRole(rs.getString("role"));

                    Timestamp ts = rs.getTimestamp("created_at");
                    if (ts != null) {
                        user.setCreatedAt(ts.toInstant());
                    }

                    return Optional.of(user);
                }
            }

            return Optional.empty();

        } catch (SQLException e) {
            throw new RuntimeException("Fehler beim Laden des Users nach ID", e);
        }
    }

    public UserEntity insert(String email, String passwordHash, String role) {
        String sql = "INSERT INTO users (email, password_hash, role) VALUES (?, ?, ?)";
        try (Connection con = DbUtil.getConnection();
            PreparedStatement ps = con.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS)) {
            
            ps.setString(1, email);
            ps.setString(2, passwordHash);
            ps.setString(3, role);
            ps.executeUpdate();

            try (ResultSet keys = ps.getGeneratedKeys()) {
                if (keys.next()) {
                    Long id = keys.getLong(1);
                    UserEntity user = new UserEntity();
                    user.setId(id);
                    user.setEmail(email);
                    user.setPasswordHash(passwordHash);
                    user.setRole(role);
                    user.setCreatedAt(Instant.now());
                    return user;
                } else {
                    throw new RuntimeException("Keine generierte ID für neuen User erhalten");
                }
            }

        } catch (SQLException e) {
            throw new RuntimeException("Fehler beim Anlegen des Users", e);
        }
    }

    public void updatePassword(Long id, String passwordHash) {
        String sql = "UPDATE users SET password_hash = ? WHERE id = ?";
        try (Connection con = DbUtil.getConnection();
            PreparedStatement ps = con.prepareStatement(sql)) {
            
            ps.setString(1, passwordHash);
            ps.setLong(2, id);
            ps.executeUpdate();
            
        } catch (SQLException e) {
            throw new RuntimeException("Fehler beim Aktualisieren des Passworts", e);
        }
    }
}
