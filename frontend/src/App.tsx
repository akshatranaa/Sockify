import React, { useState, useEffect, useRef } from 'react';
import { Send } from 'lucide-react';

const ChatApp = () => {
  const [ws, setWs] = useState(null);
  const [connected, setConnected] = useState(false);
  const [name, setName] = useState('');
  const [userId, setUserId] = useState('');
  const [roomId, setRoomId] = useState('');
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [joined, setJoined] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // Generate a random userId when component mounts
    setUserId(Math.random().toString(36).substr(2, 9));
  }, []);

  const connectWebSocket = () => {
    const wsUrl =  'ws://localhost:8080';
    const websocket = new WebSocket(wsUrl, 'echo-protocol');
    
    websocket.onopen = () => {
      setConnected(true);
      setWs(websocket);
    };

    websocket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      
      if (data.type === 'ADD_CHAT') {
        setMessages(prev => [...prev, data.payload]);
      } else if (data.type === 'UPDATE_CHAT') {
        setMessages(prev => prev.map(msg => 
          msg.chatId === data.payload.chatId 
            ? { ...msg, upvotes: data.payload.upvotes }
            : msg
        ));
      }
    };

    websocket.onclose = () => {
      setConnected(false);
      setWs(null);
      setJoined(false);
    };

    websocket.onerror = (error) => {
      console.error('WebSocket error:', error);
    };
  };

  const joinRoom = () => {
    if (!ws || !name || !roomId) return;
    
    const joinMessage = {
      type: 'JOIN_ROOM',
      payload: {
        name,
        userId,
        roomId
      }
    };
    
    ws.send(JSON.stringify(joinMessage));
    setJoined(true);
  };

  const sendMessage = () => {
    if (!ws || !message.trim()) return;
    
    const messageData = {
      type: 'SEND_MESSAGE',
      payload: {
        userId,
        roomId,
        message: message.trim()
      }
    };
    
    // Add message to local state immediately for the sender
    const localMessage = {
      chatId: Date.now().toString(), // temporary ID
      roomId,
      message: message.trim(),
      name,
      upvotes: 0
    };
    setMessages(prev => [...prev, localMessage]);
    
    ws.send(JSON.stringify(messageData));
    setMessage('');
  };

  const upvoteMessage = (chatId) => {
    // Remove upvote functionality
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      if (!joined) {
        joinRoom();
      } else {
        sendMessage();
      }
    }
  };

  if (!connected) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full">
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Send className="w-8 h-8 text-blue-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Chat App</h1>
            <p className="text-gray-600">Connect to start chatting</p>
          </div>
          <button
            onClick={connectWebSocket}
            className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white py-3 px-6 rounded-xl font-semibold hover:from-blue-600 hover:to-blue-700 transition-all duration-200 shadow-md hover:shadow-lg"
          >
            Connect to Server
          </button>
        </div>
      </div>
    );
  }

  if (!joined) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Send className="w-8 h-8 text-green-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Join Chat Room</h1>
            <p className="text-gray-600">Enter your details to start chatting</p>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Your Name</label>
              <input
                type="text"
                placeholder="Enter your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full p-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                onKeyPress={handleKeyPress}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Room ID</label>
              <input
                type="text"
                placeholder="Enter room ID"
                value={roomId}
                onChange={(e) => setRoomId(e.target.value)}
                className="w-full p-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                onKeyPress={handleKeyPress}
              />
            </div>
            <button
              onClick={joinRoom}
              disabled={!name || !roomId}
              className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white py-4 px-6 rounded-xl font-semibold hover:from-green-600 hover:to-green-700 transition-all duration-200 shadow-md hover:shadow-lg disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed disabled:shadow-none"
            >
              Join Room
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <Send className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-800">Room: {roomId}</h1>
                <p className="text-sm text-gray-600">Real-time chat</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-sm font-medium text-gray-700">{name}</span>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto p-6">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="h-96 overflow-y-auto p-6 space-y-4 bg-gray-50">
            {messages.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Send className="w-8 h-8 text-gray-400" />
                </div>
                <p className="text-gray-500">No messages yet. Start the conversation!</p>
              </div>
            ) : (
              messages.map((msg, index) => {
                const isMyMessage = msg.name === name;
                return (
                  <div key={msg.chatId || index} className={`flex ${isMyMessage ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-xs lg:max-w-md ${isMyMessage ? 'bg-blue-500 text-white' : 'bg-white text-gray-800'} rounded-2xl px-4 py-3 shadow-md`}>
                      {!isMyMessage && (
                        <p className="text-xs font-semibold text-blue-600 mb-1">{msg.name}</p>
                      )}
                      <p className="text-sm leading-relaxed">{msg.message}</p>
                      <p className={`text-xs mt-1 ${isMyMessage ? 'text-blue-100' : 'text-gray-500'}`}>
                        {isMyMessage ? 'You' : 'Just now'}
                      </p>
                    </div>
                  </div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="bg-white p-6 border-t border-gray-200">
            <div className="flex space-x-4">
              <input
                type="text"
                placeholder="Type your message..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                className="flex-1 p-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              />
              <button
                onClick={sendMessage}
                disabled={!message.trim()}
                className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-6 py-4 rounded-xl font-semibold hover:from-blue-600 hover:to-blue-700 transition-all duration-200 shadow-md hover:shadow-lg disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed disabled:shadow-none flex items-center space-x-2"
              >
                <Send size={20} />
                <span>Send</span>
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ChatApp;