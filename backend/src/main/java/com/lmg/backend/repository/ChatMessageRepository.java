package com.lmg.backend.chat;

import org.springframework.data.jpa.repository.JpaRepository;

public interface ChatMessageRepository extends JpaRepository<ChatMessage, Long> {
    // That's it! Spring provides all basic methods automatically
}