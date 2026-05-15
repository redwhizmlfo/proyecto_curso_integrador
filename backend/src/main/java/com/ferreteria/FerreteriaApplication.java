package com.ferreteria;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;

@SpringBootApplication
@EnableJpaAuditing
public class FerreteriaApplication {

	public static void main(String[] args) {
		SpringApplication.run(FerreteriaApplication.class, args);
	}

}
