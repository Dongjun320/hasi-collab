package com.hasi.service.config;

import com.hasi.service.jwt.InternalJwtProvider;
import com.hasi.service.messenger.ApiClient;
import com.hasi.service.messenger.api.InternalMessageApi;
import com.hasi.service.messenger.api.InternalNotificationApi;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class MessengerClientConfig {

    @Bean
    public ApiClient messengerApiClient(InternalJwtProvider internalJwtProvider,
                                        @Value("${app.messenger.base-url}") String baseUrl) {
        ApiClient apiClient = new ApiClient();
        apiClient.setBasePath(baseUrl);
        apiClient.setBearerToken(internalJwtProvider::issue);
        return apiClient;
    }

    @Bean
    public InternalNotificationApi internalNotificationApi(ApiClient messengerApiClient) {
        return new InternalNotificationApi(messengerApiClient);
    }

    @Bean
    public InternalMessageApi internalMessageApi(ApiClient messengerApiClient) {
        return new InternalMessageApi(messengerApiClient);
    }
}
