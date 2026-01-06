import React, { useState, useRef, useEffect } from 'react';
import SockJS from 'sockjs-client';
import { Client } from '@stomp/stompjs';
import './ChatScreen.css';

const ChatScreen = ({ username }) => {
  const [messages, setMessages] = useState([]);
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [messageInput, setMessageInput] = useState('');

  const stompClientRef = useRef(null);

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

    const socket = new SockJS('https://messagesvs-production.up.railway.app/ws');
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
        stompClientRef.current.deactivate();
        stompClientRef.current = null;
      }
    };
  }, [username]);

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
            <div className="">
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