package com.lmg.backend.repository;
import com.lmg.backend.chat.ChatMessage;

import org.springframework.data.jpa.repository.JpaRepository;

public interface ChatMessageRepository extends JpaRepository<ChatMessage, Long> {
    // That's it! Spring provides all basic methods automatically
}