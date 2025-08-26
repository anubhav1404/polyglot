package com.example.translate;

import org.springframework.ai.chat.client.ChatClient;
import org.springframework.stereotype.Service;

@Service
public class ClaudeService {

    private final ChatClient chatClient;

    public ClaudeService(ChatClient chatClient) {
        this.chatClient = chatClient;
    }

    public String askClaude(String prompt) {
        return chatClient.prompt()
                .user(prompt)
                .call()
                .content();
    }
}
 
