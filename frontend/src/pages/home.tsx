import { useState, useRef, useEffect } from 'react';
import { Upload, Send, FileText, MessageCircle, Loader2, Bot, User } from 'lucide-react';

function Home() {
  const [file, setFile] = useState(null);
  const [showChat, setShowChat] = useState(false);
  const [messages, setMessages] = useState<any>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const [docId, setDocId] = useState(null);
  const [streaming, setStreaming] = useState(false);
  const [streamingMsg, setStreamingMsg] = useState("");
  const fileInputRef = useRef(null);
  const messagesEndRef = useRef(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, streamingMsg]);

  const changeHandler = (event) => {
    const selectedFile = event.target.files?.[0];
    handleFileSelection(selectedFile);
  };

  const handleFileSelection = (selectedFile) => {
    if (selectedFile) {
      console.log(selectedFile.type);
      if (selectedFile.type === "application/pdf") {
        console.log('Selected file:', selectedFile.name);
        setFile(selectedFile);
      } else {
        alert("Only PDF files are allowed");
      }
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    const droppedFile = e.dataTransfer.files[0];
    handleFileSelection(droppedFile);
  };

  const submitHandler = async () => {
    if (!file) return;
    setIsLoading(true);
    
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await fetch('http://localhost:3000/upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem("token")}`
        },
        body: formData
      });

      const data = await response.json();
      console.log(data);
    
      if (response.status === 200) {
        setShowChat(true);
        setDocId(data.response.docId);
        setMessages([
          {
            type: 'system',
            content: `PDF "${file.name}" uploaded successfully! You can now ask questions about the document.`,
            timestamp: new Date()
          },
          {
            type: 'ai',
            content: data.response.summary,
            timestamp: new Date()
          }
        ]);
      } else {
        throw new Error('Upload failed');
      }
    } catch (error) {
      console.error('Upload failed:', error);
      alert('Upload failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const sendMessage = async () => {
    if (!inputMessage.trim() || streaming) return;

    const userMessage = {
      type: 'user',
      content: inputMessage,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    const currentQuery = inputMessage;
    setInputMessage('');
    setStreaming(true);
    setStreamingMsg("");

    try {
      const response = await fetch('http://localhost:3000/query', {
        method: "POST",
        headers: {
          "Content-Type": "application/json", 
          "Authorization": `Bearer ${localStorage.getItem("token")}`
        },
        body: JSON.stringify({ query: currentQuery, docId: docId })
      });

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let result = "";

      if (reader) {
        while (true) {
          const { value, done } = await reader.read();
          if (done) break;
    
          const chunk = decoder.decode(value, { stream: true });

          console.log(chunk);

          console.log(chunk.split('\n\n'));
    
          chunk.split("\n\n").forEach((line) => {
            if (line.startsWith("data : ")) {
              const data = line.replace("data : ", "").trim();
              if (data === "[DONE]") return;
              result += data;
              console.log(result)
              setStreamingMsg(result);
            }
          });
        }
      }

      // Add the complete AI response to messages
      setMessages(prev => [...prev, {
        type: 'ai',
        content: result,
        timestamp: new Date()
      }]);
      
    } catch (error) {
      console.error('Query failed:', error);
      setMessages(prev => [...prev, {
        type: 'ai',
        content: 'Sorry, I encountered an error processing your request. Please try again.',
        timestamp: new Date()
      }]);
    } finally {
      setStreamingMsg("");
      setStreaming(false);
    }
  };

  const resetApp = () => {
    setFile(null);
    setShowChat(false);
    setMessages([]);
    setInputMessage('');
    setDocId(null);
    setStreaming(false);
    setStreamingMsg("");
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  if (showChat) {
    return (
      <div className="bg-gradient-to-br from-gray-900 via-black to-gray-800 w-screen h-screen flex flex-col text-white">
        {/* Header */}
        <div className="bg-gray-800/50 backdrop-blur-sm border-b border-gray-700 p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <FileText className="w-6 h-6 text-blue-400" />
            <div>
              <h1 className="text-lg font-semibold">PDF Chat</h1>
              <p className="text-sm text-gray-400">{file?.name}</p>
            </div>
          </div>
          <button
            onClick={resetApp}
            className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors text-sm"
          >
            New Document
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'} items-start gap-2`}
            >
              {message.type !== 'user' && (
                <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                  message.type === 'system' ? 'bg-green-600' : 'bg-blue-600'
                }`}>
                  {message.type === 'system' ? (
                    <FileText className="w-4 h-4" />
                  ) : (
                    <Bot className="w-4 h-4" />
                  )}
                </div>
              )}
              
              <div
                className={`max-w-xs lg:max-w-2xl px-4 py-3 rounded-2xl ${
                  message.type === 'user'
                    ? 'bg-blue-600 text-white rounded-br-md'
                    : message.type === 'system'
                    ? 'bg-green-600/20 text-green-400 border border-green-600/30'
                    : 'bg-gray-700 text-white rounded-bl-md'
                }`}
              >
                <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
                <p className="text-xs opacity-70 mt-2">
                  {message.timestamp.toLocaleTimeString()}
                </p>
              </div>

              {message.type === 'user' && (
                <div className="flex-shrink-0 w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                  <User className="w-4 h-4" />
                </div>
              )}
            </div>
          ))}

          {/* Streaming Message */}
          {streaming && streamingMsg && (
            <div className="flex justify-start items-start gap-2">
              <div className="flex-shrink-0 w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                <Bot className="w-4 h-4" />
              </div>
              <div className="max-w-xs lg:max-w-2xl px-4 py-3 rounded-2xl rounded-bl-md bg-gray-700 text-white relative">
                <p className="text-sm leading-relaxed whitespace-pre-wrap">{streamingMsg}</p>
                <div className="inline-block w-2 h-4 bg-blue-400 animate-pulse ml-1"></div>
                <p className="text-xs opacity-70 mt-2">Typing...</p>
              </div>
            </div>
          )}

          {/* Loading indicator when streaming starts */}
          {streaming && !streamingMsg && (
            <div className="flex justify-start items-start gap-2">
              <div className="flex-shrink-0 w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                <Bot className="w-4 h-4" />
              </div>
              <div className="max-w-xs lg:max-w-2xl px-4 py-3 rounded-2xl rounded-bl-md bg-gray-700 text-white">
                <div className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span className="text-sm text-gray-300">Thinking...</span>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="p-4 bg-gray-800/30 backdrop-blur-sm border-t border-gray-700">
          <div className="flex gap-2">
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && !streaming && sendMessage()}
              placeholder={streaming ? "AI is responding..." : "Ask a question about your PDF..."}
              disabled={streaming}
              className="flex-1 bg-gray-700 text-white px-4 py-3 rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
            />
            <button
              onClick={sendMessage}
              disabled={!inputMessage.trim() || streaming}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed p-3 rounded-lg transition-colors relative"
            >
              {streaming ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Send className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-gray-900 via-black to-gray-800 flex w-screen h-screen justify-center items-center text-white relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-blue-600 rounded-full mix-blend-multiply filter blur-xl animate-pulse"></div>
        <div className="absolute top-3/4 right-1/4 w-64 h-64 bg-purple-600 rounded-full mix-blend-multiply filter blur-xl animate-pulse delay-1000"></div>
      </div>

      <div className="relative z-10 max-w-md w-full mx-4">
        {/* Header */}
        <div className="text-center mb-8">
          <MessageCircle className="w-16 h-16 text-blue-400 mx-auto mb-4" />
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent mb-2">
            PDF Chat
          </h1>
          <p className="text-gray-400">Upload your PDF and start chatting with it</p>
        </div>

        {/* File Upload Area */}
        <div
          className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-all duration-300 ${
            isDragOver
              ? 'border-blue-400 bg-blue-400/10'
              : 'border-gray-600 hover:border-gray-500'
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <input
            ref={fileInputRef}
            type="file"
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            onChange={changeHandler}
            name="file"
            id="file"
            accept=".pdf"
          />
          
          <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-lg font-medium text-gray-300 mb-2">
            {file ? file.name : 'Drop your PDF here'}
          </p>
          <p className="text-sm text-gray-500">
            or click to browse files
          </p>
        </div>

        {/* File Info */}
        {file && (
          <div className="mt-4 p-4 bg-gray-800/50 rounded-lg border border-gray-700">
            <div className="flex items-center gap-3">
              <FileText className="w-5 h-5 text-blue-400" />
              <div className="flex-1">
                <p className="text-sm font-medium">{file.name}</p>
                <p className="text-xs text-gray-400">
                  {(file.size / (1024 * 1024)).toFixed(2)} MB
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Submit Button */}
        <button
          onClick={submitHandler}
          disabled={!file || isLoading}
          className="w-full mt-6 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:from-gray-600 disabled:to-gray-600 disabled:cursor-not-allowed text-white py-4 px-6 rounded-xl font-semibold transition-all duration-300 transform hover:scale-[1.02] disabled:hover:scale-100 shadow-lg"
        >
          {isLoading ? (
            <div className="flex items-center justify-center gap-2">
              <Loader2 className="w-5 h-5 animate-spin" />
              Processing...
            </div>
          ) : (
            'Start Chatting'
          )}
        </button>
      </div>
    </div>
  );
}

export default Home;