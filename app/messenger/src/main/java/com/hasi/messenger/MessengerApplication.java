package com.hasi.messenger;

import com.hasi.messenger.channel.ChannelMessage;
import com.hasi.messenger.channel.ChannelMessageRepository;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;


@SpringBootApplication
public class MessengerApplication {

	public static void main(String[] args) {
		var ctx = SpringApplication.run(MessengerApplication.class, args);

		// PostgreSQL 연결 테스트
//		ChannelMessageRepository repo = ctx.getBean(ChannelMessageRepository.class);
//		ChannelMessage msg = new ChannelMessage();
//		msg.setContent("테스트 메시지");
//		repo.save(msg);
//		System.out.println("PostgreSQL 조회: " + repo.findAll());
	}
}