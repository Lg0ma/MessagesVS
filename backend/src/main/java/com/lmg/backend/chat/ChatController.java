package com.lmg.backend.chat;

import lombok.RequiredArgsConstructor;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.messaging.simp.SimpMessageHeaderAccessor;
import org.springframework.stereotype.Controller;
import com.lmg.backend.chat.ChatMessageRepository;

/**
 * Controller for handling WebSocket chat operations.
 * Manages message sending and user join/leave events.
 */
@Controller
@RequiredArgsConstructor
public class ChatController {
    private final ChatMessageRepository repository;


    /**
     * Handles incoming chat messages and broadcasts them to all connected clients.
     * Messages are sent to /app/chat.sendMessage and broadcasted to /topic/public.
     *
     * @param chatMessage The chat message payload containing sender, content, and type
     * @return The same message to be broadcasted to all subscribers
     */
    @MessageMapping("/chat.sendMessage")
    @SendTo("/topic/public")
    public ChatMessage sendMessage(@Payload ChatMessage chatMessage) {
        return repository.save(chatMessage);
    }

    /**
     * Handles user join events when a new user connects to the chat.
     * Stores the username in the WebSocket session and broadcasts the join event.
     *
     * @param chatMessage The join message containing the username
     * @param headerAccessor Provides access to WebSocket session attributes
     * @return The join message to be broadcasted to all subscribers
     */
    @MessageMapping("/chat.addUser")
    @SendTo("/topic/public")
    public ChatMessage addUser(@Payload ChatMessage chatMessage, SimpMessageHeaderAccessor headerAccessor) {
        // Store username in WebSocket session for later retrieval (e.g., on disconnect)
        headerAccessor.getSessionAttributes().put("Username", chatMessage.getSender());
        return chatMessage;
    }
}

