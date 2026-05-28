package com.ferreteria;
import org.junit.jupiter.api.Test;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

public class HashTest {
    @Test
    public void testHash() {
        BCryptPasswordEncoder enc = new BCryptPasswordEncoder();
        System.out.println("HASH FOR ADMIN123: " + enc.encode("admin123"));
    }
}
