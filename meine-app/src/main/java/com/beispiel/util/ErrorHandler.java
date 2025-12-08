package com.beispiel.util;

import com.google.gson.JsonObject;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;

public class ErrorHandler {

    private static JsonObject error(String message) {
        JsonObject obj = new JsonObject();
        obj.addProperty("error", message);
        return obj;
    }
    
    public static void badRequest(HttpServletResponse resp, String msg) 
            throws IOException {
       JsonResponseUtil.send(resp, HttpServletResponse.SC_BAD_REQUEST, error(msg));
    }

    public static void unauthorized(HttpServletResponse resp, String msg)
            throws IOException {
       JsonResponseUtil.send(resp, HttpServletResponse.SC_UNAUTHORIZED, error(msg));
    }

    public static void conflict(HttpServletResponse resp, String msg)
            throws IOException {
        JsonResponseUtil.send(resp, HttpServletResponse.SC_CONFLICT, error(msg));
    }
}