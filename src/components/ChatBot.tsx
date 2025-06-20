
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
  const [serverUrl, setServerUrl] = useState('http://localhost/your-path/your-php-file.php'); // Update this
  const fileRef = useRef<HTMLInputElement>(null);
  const messagesRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (messagesRef.current) {
      messagesRef.current.scrollTop = messagesRef.current.scrollHeight;
    }
  }, [messages]);

  const convertFileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        // Remove the data:type;base64, prefix to get pure base64
        const base64 = result.split(',')[1];
        resolve(base64);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const sendToPhpServer = async (message: string, fileData?: { name: string; size: number; base64: string }) => {
    try {
      const formData = new FormData();
      
      // Add required fields for your PHP server
      formData.append('CHAT_TEXT', message);
      formData.append('page', 'chatbot'); // You can customize this
      
      if (fileData) {
        formData.append('FILE_NAME', fileData.name);
        formData.append('FILE_SIZE', fileData.size.toString());
        formData.append('FILE_BASE64', fileData.base64);
      }

      console.log('🚀 Sending to PHP server:', {
        CHAT_TEXT: message,
        FILE_NAME: fileData?.name || '',
        FILE_SIZE: fileData?.size || 0,
        FILE_BASE64: fileData?.base64 ? 'base64 data present' : '',
        page: 'chatbot'
      });

      const response = await fetch(serverUrl, {
        method: 'POST',
        body: formData,
      });

      const result = await response.text();
      console.log('📨 PHP Server Response:', result);
      
      return result;
    } catch (error) {
      console.error('❌ Error sending to PHP server:', error);
      return 'Error connecting to server';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() && !file) return;

    // Log to console (for debugging)
    console.log('💬 Message:', input);
    
    let fileData;
    if (file) {
      console.log('📁 File:', file.name, file.size, 'bytes');
      const base64 = await convertFileToBase64(file);
      fileData = {
        name: file.name,
        size: file.size,
        base64: base64
      };
      console.log('📄 File Base64 length:', base64.length);
    }

    // Add user message
    const userMsg: Message = {
      id: Date.now().toString(),
      text: input,
      isUser: true,
      file: file ? { name: file.name, size: file.size } : undefined
    };
    setMessages(prev => [...prev, userMsg]);

    // Send to PHP server
    const serverResponse = await sendToPhpServer(input, fileData);

    // Add server response as bot message
    setTimeout(() => {
      const botMsg: Message = {
        id: (Date.now() + 1).toString(),
        text: serverResponse || 'Server response received',
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
        <h1 className="text-xl font-bold">PHP ChatBot</h1>
        <input
          type="text"
          value={serverUrl}
          onChange={(e) => setServerUrl(e.target.value)}
          placeholder="PHP Server URL"
          className="w-full mt-2 p-1 text-xs border rounded"
        />
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
              <p className="whitespace-pre-wrap">{msg.text}</p>
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
