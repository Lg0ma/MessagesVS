package com.lmg.backend.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;

/**
 * WebSocket configuration for real-time messaging.
 * Enables STOMP (Simple Text Oriented Messaging Protocol) over WebSocket.
 * Configures endpoints and message broker for the chat application.
 */
@Configuration
@EnableWebSocketMessageBroker
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {

    /**
     * Register STOMP endpoints that clients will use to connect to the WebSocket server.
     * Includes SockJS fallback for browsers that don't support WebSocket.
     * Configures CORS to allow connections from frontend applications.
     */
    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        registry.addEndpoint("/ws")
                .setAllowedOrigins("http://localhost:3000", "https://messages-vs.vercel.app", "https://messagesvs-production.up.railway.app")
                .withSockJS();
    }

    /**
     * Configure the message broker that routes messages between server and clients.
     * - "/app" prefix for messages destined for @MessageMapping annotated methods
     * - "/topic" for broadcasting messages to all subscribers
     */
    @Override
    public void configureMessageBroker(MessageBrokerRegistry registry) {
        registry.setApplicationDestinationPrefixes("/app");
        registry.enableSimpleBroker("/topic");
    }
}
