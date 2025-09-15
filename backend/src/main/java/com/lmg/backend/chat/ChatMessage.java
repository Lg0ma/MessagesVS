package com.lmg.backend.chat;

import lombok.*;

/**
 * Data model representing a chat message in the messaging system.
 * Used for serialization/deserialization of WebSocket message payloads.
 * Supports different message types for chat, join, and leave events.
 */
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class ChatMessage {

    /** The actual message content or system message text */
    private String content;

    /** Username of the person sending the message */
    private String sender;

    /** Type of message (CHAT, JOIN, or LEAVE) */
    private MessageType type;
}
