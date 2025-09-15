import React, { useState, useRef, useEffect } from 'react';
import SockJS from 'sockjs-client';
import { Client } from '@stomp/stompjs';
import './ChatScreen.css';

const ChatScreen = ({ username, onDisconnect }) => {
  const [messages, setMessages] = useState([]);
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [messageInput, setMessageInput] = useState('');

  const stompClientRef = useRef(null);

  useEffect(() => {
    const connectToChat = () => {
      setIsConnecting(true);

      const socket = new SockJS('https://messagesvs-production.up.railway.app/ws');
      const client = new Client({
        webSocketFactory: () => socket,
        onConnect: () => onConnected(username),
        onStompError: onError,
      });

      stompClientRef.current = client;
      client.activate();
    };

    connectToChat();

    return () => {
      if (stompClientRef.current) {
        stompClientRef.current.deactivate();
      }
    };
  }, [username]);

  const onConnected = (currentUsername) => {
    setIsConnecting(false);
    setIsConnected(true);

    stompClientRef.current.subscribe('/topic/public', onMessageReceived);

    stompClientRef.current.publish({
      destination: '/app/chat.addUser',
      body: JSON.stringify({ sender: currentUsername, type: 'JOIN' })
    });
  };

  const onError = (error) => {
    setIsConnecting(false);
    setIsConnected(false);
    console.error('Could not connect to WebSocket server:', error);
  };

  const sendMessage = (event) => {
    event.preventDefault();

    if (messageInput.trim() && stompClientRef.current && isConnected) {
      const chatMessage = {
        sender: username,
        content: messageInput,
        type: 'CHAT'
      };

      stompClientRef.current.publish({
        destination: '/app/chat.sendMessage',
        body: JSON.stringify(chatMessage)
      });

      setMessageInput('');
    }
  };

  const onMessageReceived = (payload) => {
    const message = JSON.parse(payload.body);

    if (message.type === 'JOIN') {
      message.content = message.sender + ' joined!';
    } else if (message.type === 'LEAVE') {
      message.content = message.sender + ' left!';
    }

    setMessages(prevMessages => [...prevMessages, message]);
  };

  return (
    <div id="chat-page">
      <div className="chat-container">
        <div className="chat-header">
        </div>
        {isConnecting && (
          <div className="connecting">
            Connecting...
          </div>
        )}
        {!isConnected && !isConnecting && (
          <div className="connecting" style={{ color: 'red' }}>
            Could not connect to WebSocket server. Please refresh this page to try again!
          </div>
        )}
        <ul id="messageArea">
          {messages.map((message, index) => (
            <li key={index} className={
              message.type === 'JOIN' || message.type === 'LEAVE'
                ? 'event-message'
                : message.sender === username
                  ? 'chat-message own-message'
                  : 'chat-message other-message'
            }>
              {message.type === 'CHAT' && (
                <span>{message.sender}</span>
              )}
              <p>{message.content}</p>
            </li>
          ))}
        </ul>
        <form onSubmit={sendMessage}>
          <div className="form-group">
            <div className="input-group">
              <input
                type="text"
                value={messageInput}
                onChange={(e) => setMessageInput(e.target.value)}
                placeholder="Type a message..."
                autoComplete="off"
                className="form-control"
                disabled={!isConnected}
              />
              <button type="submit" className="primary" disabled={!isConnected}>
                Send
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ChatScreen;