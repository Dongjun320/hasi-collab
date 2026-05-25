package com.hasi.messenger;

import com.hasi.messenger.message.Message;
import com.hasi.messenger.message.MessageRepository;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.redis.core.StringRedisTemplate;


@SpringBootApplication
public class MessengerApplication {

	public static void main(String[] args) {
		var ctx = SpringApplication.run(MessengerApplication.class, args);

		// PostgreSQL 연결 테스트
		MessageRepository repo = ctx.getBean(MessageRepository.class);
		Message msg = new Message();
		msg.setContent("테스트 메시지");
		repo.save(msg);
		System.out.println("PostgreSQL 조회: " + repo.findAll());
	}
}