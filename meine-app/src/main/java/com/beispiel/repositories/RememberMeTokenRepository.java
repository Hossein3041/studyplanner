package com.beispiel.repositories;

import com.beispiel.entities.RememberMeTokenEntity;
import com.beispiel.util.DbUtil;

import java.sql.*;
import java.time.Instant;
import java.util.Optional;

public class RememberMeTokenRepository {
    
    public void save(RememberMeTokenEntity token) {
        String sql = """
            INSERT INTO remember_me_tokens (user_id, selector, validator, expires_at)
            VALUES (?, ?, ?, ?)        
        """;

        try (Connection con = DbUtil.getConnection();
            PreparedStatement ps = con.prepareStatement(sql)) {
            
            ps.setLong(1, token.getUserId());
            ps.setString(2, token.getSelector());
            ps.setString(3, token.getValidator());
            ps.setTimestamp(4, Timestamp.from(token.getExpiresAt()));
            ps.executeUpdate();
        } catch (SQLException e) {
            throw new RuntimeException("Fehler beim Speichern des Remember-Me-Tokens", e);
        }
    }

     public Optional<RememberMeTokenEntity> findBySelector(String selector) {
        String sql = """
            SELECT id, user_id, selector, validator, expires_at, created_at, last_used_at
            FROM remember_me_tokens
            WHERE selector = ?
        """;

        try (Connection con = DbUtil.getConnection();
             PreparedStatement ps = con.prepareStatement(sql)) {

            ps.setString(1, selector);
            try (ResultSet rs = ps.executeQuery()) {
                if (rs.next()) {
                    RememberMeTokenEntity t = new RememberMeTokenEntity();
                    t.setId(rs.getLong("id"));
                    t.setUserId(rs.getLong("user_id"));
                    t.setSelector(rs.getString("selector"));
                    t.setValidator(rs.getString("validator"));
                    t.setExpiresAt(rs.getTimestamp("expires_at").toInstant());
                    t.setCreatedAt(rs.getTimestamp("created_at").toInstant());
                    t.setLastUsedAt(rs.getTimestamp("last_used_at").toInstant());
                    return Optional.of(t);
                }
            }
        } catch (SQLException e) {
            throw new RuntimeException("Fehler beim Laden des Remember-Me-Tokens", e);
        }
        return Optional.empty();
    }

    public void deleteBySelector(String selector) {
        String sql = "DELETE FROM remember_me_tokens WHERE selector = ?";

        try (Connection con = DbUtil.getConnection();
            PreparedStatement ps = con.prepareStatement(sql)) {
            
            ps.setString(1, selector);
            ps.executeUpdate();
        } catch (SQLException e) {
            throw new RuntimeException("Fehler beim Löschen des Remember-Me-Tokens", e);
        }
    }
}