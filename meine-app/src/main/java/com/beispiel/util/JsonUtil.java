package com.beispiel.util;

public class JsonUtil {
    public static String json(String key, String value) {
         return String.format("{\"%s\":\"%s\"}", key, value);
    }
}