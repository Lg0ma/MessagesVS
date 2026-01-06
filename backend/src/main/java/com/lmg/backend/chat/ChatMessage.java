package com.lmg.backend.chat;

import jakarta.persistence.*;  // ← You'll need this import!
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "messages")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ChatMessage {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String content;

    private String sender;

    @Enumerated(EnumType.STRING)
    private MessageType type;

    @CreationTimestamp
    private LocalDateTime sentAt;
}