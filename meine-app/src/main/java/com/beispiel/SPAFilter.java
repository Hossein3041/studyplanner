package com.beispiel;

import jakarta.servlet.*;
import jakarta.servlet.annotation.WebFilter;
import jakarta.servlet.http.HttpServletRequest;
import java.io.IOException;

@WebFilter("/*")
public class SPAFilter implements Filter {
    
    @Override
    public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain)
            throws IOException, ServletException {
        
        HttpServletRequest req = (HttpServletRequest) request;

        String contextPath = req.getContextPath();     // /meine-webapp
        String requestUri  = req.getRequestURI();      // /meine-webapp/static/main.js
        String path        = requestUri.substring(contextPath.length()); // /static/main.js

        boolean isApi       = path.startsWith("/api");
        boolean isStatic    = path.startsWith("/static");
        boolean hasExtension = path.matches(".*\\.[a-zA-Z0-9]+$");


        if (!isApi && !isStatic && !hasExtension) {
            request.getRequestDispatcher("/index.html").forward(request, response);
            return;
        }

        chain.doFilter(request, response);
    }
}