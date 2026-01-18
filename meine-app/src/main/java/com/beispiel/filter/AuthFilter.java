package com.beispiel.filter;

import com.beispiel.dtos.UserDto;
import com.beispiel.services.AuthService;
import com.beispiel.util.JsonUtil;

import jakarta.servlet.*;
import jakarta.servlet.annotation.WebFilter;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;

import java.io.IOException;

@WebFilter("/api/*")
public class AuthFilter implements Filter {

    private final AuthService authService = new AuthService();

    @Override
    public void doFilter(ServletRequest req, ServletResponse resp, FilterChain chain)
            throws IOException, ServletException {

        HttpServletRequest request = (HttpServletRequest) req;
        HttpServletResponse response = (HttpServletResponse) resp;

        String path = request.getRequestURI();
        String context = request.getContextPath();

        if (context != null && !context.isEmpty() && path.startsWith(context)) {
            path = path.substring(context.length());
        }

        if (path.startsWith("/api/auth")) {
            chain.doFilter(req, resp);
            return;
        }

        HttpSession session = request.getSession(false);
        Long userId = null;
        if (session != null) {
            Object idAttr = session.getAttribute("userId");
            if (idAttr instanceof Long) {
                userId = (Long) idAttr;
            }
        }

        if (userId == null) {
            UserDto userFromRemember = authService.tryLoginFromRememberMe(request, response);
            if (userFromRemember == null) {
                response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                response.getWriter().write(JsonUtil.json("error", "Login erforderlich"));
                return;
            }
        }

        chain.doFilter(req, resp);
    }
}
