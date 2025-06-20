
import React, { useState, useRef, useEffect } from 'react';
import { Send, Paperclip, X } from 'lucide-react';

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  file?: {
    name: string;
    size: number;
  };
}

const ChatBot = () => {
  const [messages, setMessages] = useState<Message[]>([
    { id: '1', text: "Hello! Send me a message or upload a file.", isUser: false }
  ]);
  const [input, setInput] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const messagesRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (messagesRef.current) {
      messagesRef.current.scrollTop = messagesRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() && !file) return;

    // Log to console
    console.log('💬 Message:', input);
    if (file) {
      console.log('📁 File:', file.name, file.size, 'bytes');
      const reader = new FileReader();
      reader.onload = () => console.log('📄 File content (Base64):', reader.result);
      reader.readAsDataURL(file);
    }

    // Add user message
    const userMsg: Message = {
      id: Date.now().toString(),
      text: input,
      isUser: true,
      file: file ? { name: file.name, size: file.size } : undefined
    };
    setMessages(prev => [...prev, userMsg]);

    // Bot response
    setTimeout(() => {
      const botMsg: Message = {
        id: (Date.now() + 1).toString(),
        text: file ? `Got your message and file "${file.name}"!` : 'Thanks for your message!',
        isUser: false
      };
      setMessages(prev => [...prev, botMsg]);
    }, 500);

    // Reset
    setInput('');
    setFile(null);
    if (fileRef.current) fileRef.current.value = '';
  };

  return (
    <div className="max-w-2xl mx-auto h-screen flex flex-col bg-white">
      {/* Header */}
      <div className="p-4 border-b">
        <h1 className="text-xl font-bold">Simple ChatBot</h1>
      </div>

      {/* Messages */}
      <div 
        ref={messagesRef}
        className="flex-1 p-4 overflow-y-auto space-y-4"
      >
        {messages.map(msg => (
          <div key={msg.id} className={`flex ${msg.isUser ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-xs p-3 rounded-lg ${
              msg.isUser 
                ? 'bg-blue-500 text-white' 
                : 'bg-gray-200 text-black'
            }`}>
              <p>{msg.text}</p>
              {msg.file && (
                <div className="mt-2 text-xs opacity-75">
                  📎 {msg.file.name} ({Math.round(msg.file.size/1024)}KB)
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Input */}
      <div className="p-4 border-t">
        {file && (
          <div className="mb-2 p-2 bg-gray-100 rounded flex justify-between items-center">
            <span className="text-sm">📎 {file.name}</span>
            <button onClick={() => setFile(null)} className="text-red-500">
              <X size={16} />
            </button>
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 p-2 border rounded"
          />
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="p-2 border rounded hover:bg-gray-100"
          >
            <Paperclip size={20} />
          </button>
          <button
            type="submit"
            disabled={!input.trim() && !file}
            className="p-2 bg-blue-500 text-white rounded disabled:opacity-50"
          >
            <Send size={20} />
          </button>
        </form>
        
        <input
          ref={fileRef}
          type="file"
          onChange={(e) => setFile(e.target.files?.[0] || null)}
          className="hidden"
        />
      </div>
    </div>
  );
};

export default ChatBot;
