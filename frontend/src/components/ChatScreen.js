import React, {useEffect, useRef, useState} from 'react';
import SockJS from 'sockjs-client';
import {Client} from '@stomp/stompjs';
import './ChatScreen.css';
import {useAuth} from '../context/AuthContext';

const ChatScreen = ({ username, onDisconnect }) => {
  const { logout, user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [messageInput, setMessageInput] = useState('');

  const stompClientRef = useRef(null);
  const messagesEndRef = useRef(null);

  // Auto-scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // Clean up any existing connection first
    if (stompClientRef.current) {
      stompClientRef.current.deactivate();
      stompClientRef.current = null;
    }

    if (!username) return;

    console.log('Initiating WebSocket connection for user:', username);
    setIsConnecting(true);

    const onMessageReceived = (payload) => {
      const message = JSON.parse(payload.body);

      if (message.type === 'JOIN') {
        message.content = message.sender + ' joined!';
      } else if (message.type === 'LEAVE') {
        message.content = message.sender + ' left!';
      }

      setMessages(prevMessages => [...prevMessages, message]);
    };

    const onConnected = () => {
      console.log('WebSocket connection established successfully');
      setIsConnecting(false);
      setIsConnected(true);

      if (stompClientRef.current) {
        stompClientRef.current.subscribe('/topic/public', onMessageReceived);

        stompClientRef.current.publish({
          destination: '/app/chat.addUser',
          body: JSON.stringify({ sender: username, type: 'JOIN' })
        });
      }
    };

    const onError = (error) => {
      setIsConnecting(false);
      setIsConnected(false);
      console.error('WebSocket connection error:', error);
      console.error('Error details:', {
        message: error?.message,
        type: error?.type,
        timestamp: new Date().toISOString()
      });
    };

    const socket = new SockJS('http://localhost:8080/ws');
    const client = new Client({
      webSocketFactory: () => socket,
      onConnect: onConnected,
      onStompError: onError,
      onWebSocketError: onError,
      reconnectDelay: 0, // Disable automatic reconnection
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
    });

    stompClientRef.current = client;
    client.activate();

    return () => {
      if (stompClientRef.current) {
        // Send LEAVE message before disconnecting
        if (isConnected) {
          try {
            stompClientRef.current.publish({
              destination: '/app/chat.sendMessage',
              body: JSON.stringify({ sender: username, type: 'LEAVE' })
            });
          } catch (error) {
            console.error('Error sending LEAVE message:', error);
          }
        }
        stompClientRef.current.deactivate();
        stompClientRef.current = null;
      }
    };
  }, [username, isConnected]);

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

  const handleLogout = () => {
    // Send LEAVE message
    if (stompClientRef.current && isConnected) {
      try {
        stompClientRef.current.publish({
          destination: '/app/chat.sendMessage',
          body: JSON.stringify({ sender: username, type: 'LEAVE' })
        });
      } catch (error) {
        console.error('Error sending LEAVE message:', error);
      }
      stompClientRef.current.deactivate();
    }

    // Logout and redirect
    logout();
    onDisconnect();
  };

  return (
      <div id="chat-page">
        <div className="chat-container">
          <div className="chat-header">
            <div className="header-left">
              <h2>MessagesVS Chat</h2>
              <span className="connection-status">
              {isConnecting && '🟡 Connecting...'}
                {isConnected && '🟢 Connected'}
                {!isConnected && !isConnecting && '🔴 Disconnected'}
            </span>
            </div>
            <div className="user-info">
              <span className="username">👤 {user?.username || username}</span>
              <button onClick={handleLogout} className="logout-btn">
                Logout
              </button>
            </div>
          </div>

          {isConnecting && (
              <div className="connecting">
                Connecting to chat server...
              </div>
          )}

          {!isConnected && !isConnecting && (
              <div className="connecting error-message">
                ⚠️ Could not connect to WebSocket server. Please refresh this page to try again!
              </div>
          )}

          <div className="messages-container">
            <ul id="messageArea">
              {messages.length === 0 && isConnected && (
                  <li className="empty-state">
                    <p>No messages yet. Start the conversation! 👋</p>
                  </li>
              )}
              {messages.map((message, index) => (
                  <li key={index} className={
                    message.type === 'JOIN' || message.type === 'LEAVE'
                        ? 'event-message'
                        : message.sender === username
                            ? 'chat-message own-message'
                            : 'chat-message other-message'
                  }>
                    {message.type === 'CHAT' && (
                        <span className="message-sender">{message.sender}</span>
                    )}
                    <p className="message-content">{message.content}</p>
                  </li>
              ))}
              <div ref={messagesEndRef} />
            </ul>
          </div>

          <form onSubmit={sendMessage} className="message-form">
            <div className="form-group">
              <div className="input-wrapper">
                <input
                    type="text"
                    value={messageInput}
                    onChange={(e) => setMessageInput(e.target.value)}
                    placeholder={isConnected ? "Type a message..." : "Connecting..."}
                    autoComplete="off"
                    className="form-control"
                    disabled={!isConnected}
                />
                <button
                    type="submit"
                    className="send-button"
                    disabled={!isConnected || !messageInput.trim()}
                >
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