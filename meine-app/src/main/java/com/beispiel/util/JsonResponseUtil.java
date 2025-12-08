package com.beispiel.util;

import com.google.gson.JsonObject;
import jakarta.servlet.http.HttpServletResponse;

import java.io.IOException;

public class JsonResponseUtil {

    public static void send(HttpServletResponse resp, int status, JsonObject json)
            throws IOException {
        
        resp.setStatus(status);
        resp.setContentType("application/json;charset=UTF-8");
        resp.getWriter().write(json.toString());
    }

    public static void sendMessage(HttpServletResponse resp, int status, String msg) 
            throws IOException {
        
        JsonObject json = new JsonObject();
        json.addProperty("message", msg);
        send(resp, status, json);
    }
}