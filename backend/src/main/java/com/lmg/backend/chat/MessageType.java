package com.lmg.backend.chat;

/**
 * Enum defining the different types of messages in the chat system.
 * Used to differentiate between regular chat messages and system events.
 */
public enum MessageType {
    /** Regular chat message from a user */
    CHAT,

    /** System message when a user joins the chat */
    JOIN,

    /** System message when a user leaves the chat */
    LEAVE
}
