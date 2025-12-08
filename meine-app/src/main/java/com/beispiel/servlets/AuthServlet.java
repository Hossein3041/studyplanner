package com.beispiel.servlets;

import com.beispiel.dtos.UserDto;
import com.beispiel.services.AuthService;
import com.beispiel.util.ErrorHandler;
import com.beispiel.util.JsonRequestUtil;
import com.beispiel.util.JsonResponseUtil;

import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.PrintWriter;
import java.util.Optional;

import com.google.gson.JsonObject;
import com.google.gson.JsonParser;

@WebServlet("/api/auth/*")
public class AuthServlet extends HttpServlet {

    private final AuthService authService = new AuthService();

    @Override
    protected void doPost(HttpServletRequest req, HttpServletResponse resp)
            throws ServletException, IOException {

        String path = req.getPathInfo();
        if (path == null) {
            ErrorHandler.badRequest(resp, "Ungültiger Auth-Pfad");
            return;
        }

        switch (path) {
            case "/register" -> handleRegister(req, resp);
            case "/login" -> handleLogin(req, resp);
            case "/logout" -> handleLogout(req, resp);
            default -> resp.setStatus(HttpServletResponse.SC_NOT_FOUND);
        }
    }

    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp)
            throws ServletException, IOException {
        
        if("/session".equals(req.getPathInfo())) {
            handleSession(req, resp);
        } else {
            resp.setStatus(HttpServletResponse.SC_NOT_FOUND);
        }
    }

    private void handleRegister(HttpServletRequest req, HttpServletResponse resp)
            throws IOException {
        
        JsonObject json = JsonRequestUtil.readJson(req);

        String email = JsonRequestUtil.getString(json, "email");
        String password = JsonRequestUtil.getString(json, "password");
        
        if (email == null || password == null) {
            ErrorHandler.badRequest(resp, "email und password erforderlich");
            return;
        }

        try {
            UserDto user = authService.register(email, password);

            JsonObject result = new JsonObject();
            result.addProperty("id", user.getId());
            result.addProperty("email", user.getEmail());

            JsonResponseUtil.send(resp, HttpServletResponse.SC_CREATED, result);

        } catch (IllegalArgumentException e) {
            ErrorHandler.conflict(resp, "E-Mail bereits registriert");
        }
    }

    private void handleLogin(HttpServletRequest req, HttpServletResponse resp)
            throws IOException {
        
        JsonObject json = JsonRequestUtil.readJson(req);

        String email = JsonRequestUtil.getString(json, "email");
        String password = JsonRequestUtil.getString(json, "password");

        if (email == null || password == null) {
            ErrorHandler.badRequest(resp, "email und password erforderlich");
            return;
        }

        Optional<UserDto> opt = authService.login(email, password);

        if (opt.isEmpty()) {
            ErrorHandler.unauthorized(resp, "Ungültige Anmeldedaten");
            return;
        }

        UserDto user = opt.get();

        var session = req.getSession(true);
        session.setAttribute("userId", user.getId());
        session.setAttribute("email", user.getEmail());
        session.setAttribute("role", user.getRole());

        JsonObject result = new JsonObject();
        result.addProperty("id", user.getId());
        result.addProperty("email", user.getEmail());
        result.addProperty("role", user.getRole());

        JsonResponseUtil.send(resp, HttpServletResponse.SC_OK, result);
    }

    private void handleLogout(HttpServletRequest req, HttpServletResponse resp)
            throws IOException {
        var session = req.getSession(false);
        if (session != null) {
            session.invalidate();
        }

        JsonResponseUtil.sendMessage(resp, HttpServletResponse.SC_OK, "Logout erfolgreich");
    }

    private void handleSession(HttpServletRequest req, HttpServletResponse resp)
            throws IOException {
        
        var session = req.getSession(false);
        JsonObject json = new JsonObject();

        if (session == null || session.getAttribute("userId") == null) {
            json.addProperty("loggedIn", false);
        } else {
            json.addProperty("loggedIn", true);
            json.addProperty("id", (Long) session.getAttribute("userId"));
            json.addProperty("email", (String) session.getAttribute("email"));
            json.addProperty("role", (String) session.getAttribute("role"));
        }

        JsonResponseUtil.send(resp, HttpServletResponse.SC_OK, json);
    }

}