package com.hasi.messenger;

import com.hasi.messenger.security.StompAuthChannelInterceptor;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.simp.config.ChannelRegistration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;

@Configuration
@EnableWebSocketMessageBroker
@RequiredArgsConstructor
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {

    @Value("${app.broker.relay-host}") private String relayHost;
    @Value("${app.broker.relay-port}") private int relayPort;
    @Value("${app.broker.login}")      private String login;
    @Value("${app.broker.passcode}")   private String passcode;

    // 공용 VPS에서 다른 프로젝트와 RabbitMQ를 공유하므로 vhost로 격리합니다.
    @Value("${app.broker.virtual-host}") private String virtualHost;

    @Value("${app.cors.allowed-origins}") private String[] allowedOrigins;

    private final StompAuthChannelInterceptor stompAuthChannelInterceptor;

    @Override
    public void configureClientInboundChannel(ChannelRegistration registration) {
        registration.interceptors(stompAuthChannelInterceptor);
    }

    @Override
    public void configureMessageBroker(MessageBrokerRegistry config){
        config.setApplicationDestinationPrefixes("/app");
        config.setUserDestinationPrefix("/user");

        config.enableStompBrokerRelay("/topic", "/queue")
                .setRelayHost(relayHost)
                .setRelayPort(relayPort)
                // relay가 보내는 STOMP CONNECT 프레임의 host 헤더가 되고,
                // RabbitMQ STOMP 어댑터가 이를 vhost로 mapping.
                .setVirtualHost(virtualHost)
                .setClientLogin(login)
                .setClientPasscode(passcode)
                .setSystemLogin(login)
                .setSystemPasscode(passcode);
    }

    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        // setAllowedOrigins는 와일드카드를 받지 않으므로 패턴 방식을 사용합니다.
        // (Cloudflare Pages의 프리뷰 배포는 브랜치마다 오리진이 달라짐)
        registry.addEndpoint("/ws")               // 개발: ws://localhost:8081/ws
                .setAllowedOriginPatterns(allowedOrigins);
    }
}
