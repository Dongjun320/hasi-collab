package com.hasi.service;

import com.hasi.service.message.Message;
import com.hasi.service.message.MessageRepository;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.redis.core.StringRedisTemplate;

@SpringBootApplication
public class ServiceApplication {

	public static void main(String[] args) {

		var ctx = SpringApplication.run(ServiceApplication.class, args);

		// Redis 연결 테스트
		StringRedisTemplate redis = ctx.getBean(StringRedisTemplate.class);
		redis.opsForValue().set("test-key", "헬로 Redis");
		System.out.println("Redis 조회: " + redis.opsForValue().get("test-key"));

		// PostgreSQL 연결 테스트
		MessageRepository repo = ctx.getBean(MessageRepository.class);
		Message msg = new Message();
		msg.setContent("테스트 메시지");
		repo.save(msg);
		System.out.println("PostgreSQL 조회: " + repo.findAll());
	}

}
