package com.hasi.service.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.redis.connection.RedisConnectionFactory;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.data.redis.serializer.StringRedisSerializer;

    @Configuration
public class RedisConfig {
    // email인증을 위해 redis config를 작성하는 자리입니다.
        @Bean
        public RedisTemplate<String, String> redisTemplate(RedisConnectionFactory connectionFactory) {
            RedisTemplate<String, String> template = new RedisTemplate<>();
            template.setConnectionFactory(connectionFactory);

            // Key, Value 모두 String으로 직렬화
            StringRedisSerializer serializer = new StringRedisSerializer();
            template.setKeySerializer(serializer);
            template.setValueSerializer(serializer);
            template.setHashKeySerializer(serializer);
            template.setHashValueSerializer(serializer);

            return template;
        }
}
