import './App.css';
import { useState, useRef } from 'react';
import SockJS from 'sockjs-client';
import { Client } from '@stomp/stompjs';



function App() {
  const [username, setUsername] = useState('');
  const [messages, setMessages] = useState([]);
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [currentPage, setCurrentPage] = useState('username'); // 'username' or 'chat'
  const [messageInput, setMessageInput] = useState('');
  
  const stompClientRef = useRef(null);
  
  const colors = [
    '#2196F3', '#32c787', '#00BCD4', '#ff5652',
    '#ffc107', '#ff85af', '#FF9800', '#39bbb0'
  ];
  
  const getAvatarColor = (messageSender) => {
    let hash = 0;
    for (let i = 0; i < messageSender.length; i++) {
      hash = 31 * hash + messageSender.charCodeAt(i);
    }
    const index = Math.abs(hash % colors.length);
    return colors[index];
  };
  
  const connect = (event) => {
    event.preventDefault();
    const usernameValue = document.querySelector('#name').value.trim();
    
    if (usernameValue) {
      setUsername(usernameValue);
      setCurrentPage('chat');
      setIsConnecting(true);
      
      const socket = new SockJS('https://messagesvs-production.up.railway.app/ws');
      const client = new Client({
        webSocketFactory: () => socket,
        onConnect: onConnected,
        onStompError: onError,
      });
      
      stompClientRef.current = client;
      client.activate();
    }
  };
  
  const onConnected = () => {
    setIsConnecting(false);
    setIsConnected(true);
    
    // Subscribe to the Public Topic
    stompClientRef.current.subscribe('/topic/public', onMessageReceived);
    
    // Tell your username to the server
    stompClientRef.current.publish({
      destination: '/app/chat.addUser',
      body: JSON.stringify({ sender: username, type: 'JOIN' })
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
    <div className="App">
      {currentPage === 'username' && (
        <div id="username-page">
          <div className="username-page-container">
            <h1 className="title">Type your username to enter the Chatroom</h1>
            <form onSubmit={connect}>
              <div className="form-group">
                <input 
                  type="text" 
                  id="name" 
                  placeholder="Username" 
                  autoComplete="off" 
                  className="form-control" 
                />
              </div>
              <div className="form-group">
                <button type="submit" className="accent username-submit">
                  Start Chatting
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {currentPage === 'chat' && (
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
                <li key={index} className={message.type === 'JOIN' || message.type === 'LEAVE' ? 'event-message' : 'chat-message'}>
                  {message.type === 'CHAT' && (
                    <>
                      <i style={{ backgroundColor: getAvatarColor(message.sender) }}>
                        {message.sender[0]}
                      </i>
                      <span>{message.sender}</span>
                    </>
                  )}
                  <p>{message.content}</p>
                </li>
              ))}
            </ul>
            <form onSubmit={sendMessage}>
              <div className="form-group">
                <div className="input-group clearfix">
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
      )}
    </div>
  );
}

export default App;
