package com.beispiel.repositories;

import com.beispiel.entities.PasswordResetTokenEntity;
import com.beispiel.util.DbUtil;

import java.sql.*;
import java.time.Instant;
import java.util.Optional;

public class PasswordResetTokenRepository {

    public void save(PasswordResetTokenEntity token) {
        String sql = """
            INSERT INTO password_reset_tokens (user_id, token, expires_at)
            VALUES (?, ?, ?)        
        """;

        try (Connection con = DbUtil.getConnection();
            PreparedStatement ps = con.prepareStatement(sql)) {
            
            ps.setLong(1, token.getUserId());
            ps.setString(2, token.getToken());
            ps.setTimestamp(3, Timestamp.from(token.getExpiresAt()));
            ps.executeUpdate();

        } catch (SQLException e) {
            throw new RuntimeException("Fehler beim Speichern des Password-Reset-Tokens", e);
        }
    }

    public Optional<PasswordResetTokenEntity> findByToken(String token) {
        String sql = """
            SELECT id, user_id, token, expires_at, created_at, used_at
            FROM password_reset_tokens
            WHERE token = ?
        """;

        try (Connection con = DbUtil.getConnection();
            PreparedStatement ps = con.prepareStatement(sql)) {
            
            ps.setString(1, token);

            try (ResultSet rs = ps.executeQuery()) {
                if (rs.next()) {
                    PasswordResetTokenEntity e = new PasswordResetTokenEntity();
                    e.setId(rs.getLong("id"));
                    e.setUserId(rs.getLong("user_id"));
                    e.setToken(rs.getString("token"));
                    e.setExpiresAt(rs.getTimestamp("expires_at").toInstant());
                    Timestamp created = rs.getTimestamp("created_at");
                    if (created != null) {
                        e.setCreatedAt(created.toInstant());
                    }
                    Timestamp used = rs.getTimestamp("used_at");
                    if (used != null) {
                        e.setUsedAt(used.toInstant());
                    }
                    return Optional.of(e);
                }
            }
        } catch (SQLException e) {
            throw new RuntimeException("Fehler beim Laden des Password-Reset-Tokens", e);
        }

        return Optional.empty();
    }

    public void markUsed(Long id) {
        String sql = "UPDATE password_reset_tokens SET used_at = ? WHERE id = ?";

        try (Connection con = DbUtil.getConnection();
            PreparedStatement ps = con.prepareStatement(sql)) {

            ps.setTimestamp(1, Timestamp.from(Instant.now()));
            ps.setLong(2, id);
            ps.executeUpdate();
        } catch (SQLException e) {
            throw new RuntimeException("Fehler beim Markieren des Password-Reset-Tokens als benutzt", e);
        }
    }
}
