
import React, { useState, useRef, useEffect } from 'react';
import { Send, Paperclip, X, FileText, Image, File } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
  file?: {
    name: string;
    size: number;
    type: string;
    base64: string;
  };
}

const Index = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: "Hello! I'm your AI assistant. You can chat with me and upload files. Everything is logged to the console for now.",
      isUser: false,
      timestamp: new Date()
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    if (scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight;
      }
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleFileUpload = (file: File) => {
    setUploadedFile(file);
    console.log('📁 File uploaded:', file.name);
    console.log('📊 File size:', file.size, 'bytes');
    console.log('🎭 File type:', file.type);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!inputText.trim() && !uploadedFile) return;

    let fileData = null;
    
    if (uploadedFile) {
      const reader = new FileReader();
      const base64Promise = new Promise<string>((resolve) => {
        reader.onload = () => resolve(reader.result as string);
        reader.readAsDataURL(uploadedFile);
      });
      
      const base64 = await base64Promise;
      fileData = {
        name: uploadedFile.name,
        size: uploadedFile.size,
        type: uploadedFile.type,
        base64: base64
      };

      // Console logging
      console.log('💬 Chat text:', inputText);
      console.log('📁 File name:', uploadedFile.name);
      console.log('📊 File size:', uploadedFile.size);
      console.log('🔗 File content (Base64, truncated):', base64.substring(0, 100) + '...');
    } else {
      console.log('💬 Chat text:', inputText);
    }

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputText,
      isUser: true,
      timestamp: new Date(),
      file: fileData
    };

    setMessages(prev => [...prev, userMessage]);

    // Simulate bot response
    setTimeout(() => {
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: fileData 
          ? `I received your message${inputText ? `: "${inputText}"` : ''} along with the file "${fileData.name}" (${(fileData.size / 1024).toFixed(1)} KB). The file content has been logged to the console!`
          : `Thanks for your message! I've logged it to the console. This is just a demo response - in the future, this could connect to a real AI backend.`,
        isUser: false,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, botMessage]);
    }, 1000);

    // Reset form
    setInputText('');
    setUploadedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileUpload(files[0]);
    }
  };

  const getFileIcon = (fileType: string) => {
    if (fileType.startsWith('image/')) return <Image className="w-4 h-4" />;
    if (fileType.includes('text') || fileType.includes('document')) return <FileText className="w-4 h-4" />;
    return <File className="w-4 h-4" />;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-3 shadow-sm">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-xl font-semibold text-gray-800">AI Chat Assistant</h1>
          <p className="text-sm text-gray-500">Chat with AI and upload files • Console logging enabled</p>
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 max-w-4xl mx-auto w-full px-4 py-6">
        <Card className="h-[600px] flex flex-col bg-white shadow-lg">
          <ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
            <div className="space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                      message.isUser
                        ? 'bg-blue-600 text-white rounded-br-md'
                        : 'bg-gray-100 text-gray-800 rounded-bl-md'
                    } shadow-sm`}
                  >
                    {message.text && <p className="text-sm leading-relaxed">{message.text}</p>}
                    
                    {message.file && (
                      <div className={`mt-2 p-3 rounded-lg border ${
                        message.isUser 
                          ? 'bg-blue-500 border-blue-400' 
                          : 'bg-white border-gray-200'
                      }`}>
                        <div className="flex items-center space-x-2">
                          {getFileIcon(message.file.type)}
                          <div className="flex-1 min-w-0">
                            <p className={`text-xs font-medium truncate ${
                              message.isUser ? 'text-blue-100' : 'text-gray-700'
                            }`}>
                              {message.file.name}
                            </p>
                            <p className={`text-xs ${
                              message.isUser ? 'text-blue-200' : 'text-gray-500'
                            }`}>
                              {formatFileSize(message.file.size)}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    <p className={`text-xs mt-2 ${
                      message.isUser ? 'text-blue-200' : 'text-gray-500'
                    }`}>
                      {message.timestamp.toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>

          {/* Input Area */}
          <div className="border-t border-gray-200 p-4">
            {uploadedFile && (
              <div className="mb-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    {getFileIcon(uploadedFile.type)}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-700 truncate">
                        {uploadedFile.name}
                      </p>
                      <p className="text-xs text-gray-500">
                        {formatFileSize(uploadedFile.size)}
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setUploadedFile(null);
                      if (fileInputRef.current) {
                        fileInputRef.current.value = '';
                      }
                    }}
                    className="h-8 w-8 p-0 text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="flex items-end space-x-2">
              <div 
                className={`flex-1 relative ${isDragging ? 'opacity-50' : ''}`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >
                <Input
                  type="text"
                  placeholder="Type your message... (or drag & drop a file)"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  className="pr-12 py-3 rounded-xl border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0 text-gray-400 hover:text-gray-600"
                >
                  <Paperclip className="w-4 h-4" />
                </Button>
                <input
                  ref={fileInputRef}
                  type="file"
                  onChange={(e) => {
                    const files = e.target.files;
                    if (files && files.length > 0) {
                      handleFileUpload(files[0]);
                    }
                  }}
                  className="hidden"
                />
              </div>
              
              <Button
                type="submit"
                disabled={!inputText.trim() && !uploadedFile}
                className="h-12 w-12 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
              >
                <Send className="w-4 h-4" />
              </Button>
            </form>
            
            {isDragging && (
              <div className="absolute inset-0 bg-blue-500 bg-opacity-10 border-2 border-dashed border-blue-400 rounded-lg flex items-center justify-center">
                <p className="text-blue-600 font-medium">Drop your file here</p>
              </div>
            )}
          </div>
        </Card>
      </div>
      
      {/* Footer */}
      <div className="bg-white border-t border-gray-200 px-4 py-3">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-xs text-gray-500">
            Frontend-only demo • Check browser console for file data • Ready for PHP backend integration
          </p>
        </div>
      </div>
    </div>
  );
};

export default Index;
