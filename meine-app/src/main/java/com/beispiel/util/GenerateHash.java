package com.beispiel.util;

public class GenerateHash {
    public static void main(String[] args) {
        String pw1 = PasswordUtil.hash("admin123");
        String pw2 = PasswordUtil.hash("student123");

        System.out.println("Admin Hash: " + pw1);
        System.out.println("Student Hash: " + pw2);
    }
}