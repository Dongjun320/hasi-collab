package com.hasi.service;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.redis.core.StringRedisTemplate;

@SpringBootApplication
public class ServiceApplication {

	public static void main(String[] args) {

		var ctx = SpringApplication.run(ServiceApplication.class, args);

	}

}
