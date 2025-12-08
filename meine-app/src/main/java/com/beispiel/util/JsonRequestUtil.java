package com.beispiel.util;

import com.google.gson.JsonObject;
import com.google.gson.JsonParser;
import jakarta.servlet.http.HttpServletRequest;

import java.io.BufferedReader;
import java.io.IOException;

public class JsonRequestUtil {
    
    public static JsonObject readJson(HttpServletRequest req)
            throws IOException {
        
        try (BufferedReader reader = req.getReader()) {
            return JsonParser.parseReader(reader).getAsJsonObject();
        } catch (Exception e) {
            throw new IOException("Ungültiges JSON im Request", e);
        }
    }

    public static String getString(JsonObject json, String key) {
        return json.has(key) && !json.get(key).isJsonNull() ? json.get(key).getAsString() : null;
    }
}