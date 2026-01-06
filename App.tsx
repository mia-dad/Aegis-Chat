import React, { useState, useEffect, useRef } from 'react';
import { Send, Menu, Plus, MessageSquare, AlertTriangle } from 'lucide-react';
import { Message, ExecuteRequest, ExecuteResponse } from './types';
import { executeAgent, checkServiceStatus } from './services/mockAgentService';
import { MessageBubble } from './components/Chat/MessageBubble';
import { Loader } from './components/ui/Loader';
import clsx from 'clsx';

function App() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isServiceAvailable, setIsServiceAvailable] = useState<boolean | null>(null);
  
  // Ref for auto-scrolling
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    // Initial Service Check
    checkServiceStatus().then((res) => setIsServiceAvailable(res.available));
    
    // Initial Welcome Message
    const welcomeMsg: Message = {
      id: 'welcome',
      role: 'agent',
      content: {
        type: 'document',
        version: 'v1',
        blocks: [
          {
            type: 'paragraph',
            text: "# Welcome to Aegis Chat\n\nI am your intelligent assistant. I can help you generate reports, analyze data, and visualize trends.\n\n**Try asking:**\n- *\"Generate a sales report\"* (Demo: Multi-turn flow)\n- *\"Show me market analysis\"* (Demo: Charts)"
          }
        ]
      },
      timestamp: Date.now()
    };
    setMessages([welcomeMsg]);
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: Date.now(),
      status: 'sending'
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const request: ExecuteRequest = { query: userMsg.content as string };
      const response = await executeAgent(request);
      handleAgentResponse(response);
    } catch (error) {
      console.error(error);
      const errorMsg: Message = {
        id: Date.now().toString(),
        role: 'system',
        content: 'Error: Failed to connect to Aegis Agent.',
        timestamp: Date.now(),
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFormSubmit = async (executionId: string, data: Record<string, any>) => {
    setIsLoading(true);

    // Mark previous form message as submitted
    setMessages(prev => prev.map(m => {
        if (m.executionId === executionId) {
            return { ...m, hasSubmitted: true };
        }
        return m;
    }));

    try {
      const request: ExecuteRequest = { executionId, userInput: data };
      const response = await executeAgent(request);
      handleAgentResponse(response);
    } catch (error) {
      console.error(error);
       const errorMsg: Message = {
        id: Date.now().toString(),
        role: 'system',
        content: 'Error submitting form data.',
        timestamp: Date.now(),
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAgentResponse = (response: ExecuteResponse) => {
    if (response.status === 'FAILED') {
      const msg: Message = {
        id: Date.now().toString(),
        role: 'agent',
        content: response.error || 'Something went wrong.',
        timestamp: Date.now()
      };
      setMessages(prev => [...prev, msg]);
      return;
    }

    if (response.status === 'WAITING_FOR_INPUT') {
      const msg: Message = {
        id: Date.now().toString(),
        role: 'agent',
        content: response.awaitMessage || 'Please provide more details.',
        timestamp: Date.now(),
        isAwaitPrompt: true,
        executionId: response.executionId,
        inputSchema: response.inputSchema,
        hasSubmitted: false
      };
      setMessages(prev => [...prev, msg]);
    } else if (response.status === 'COMPLETED') {
       const msg: Message = {
        id: Date.now().toString(),
        role: 'agent',
        content: response.output || 'Task completed.',
        timestamp: Date.now()
      };
      setMessages(prev => [...prev, msg]);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      
      {/* Sidebar - Optional for this MVP */}
      <div className="hidden md:flex w-64 flex-col bg-white border-r border-gray-200">
        <div className="p-4 border-b border-gray-100">
           <div className="flex items-center gap-2 font-bold text-lg text-slate-800">
             <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white">A</div>
             <span>Aegis Chat</span>
           </div>
        </div>
        
        <div className="flex-1 overflow-y-auto p-3 space-y-2">
           <button 
             onClick={() => window.location.reload()}
             className="flex w-full items-center gap-3 px-3 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors shadow-sm mb-4"
           >
             <Plus size={16} />
             New Chat
           </button>
           
           <div className="text-xs font-semibold text-gray-400 uppercase px-3 mb-2">Recent</div>
           <button className="flex w-full items-center gap-3 px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 rounded-lg transition-colors">
             <MessageSquare size={16} />
             <span className="truncate">Sales Report Q4</span>
           </button>
           <button className="flex w-full items-center gap-3 px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 rounded-lg transition-colors">
             <MessageSquare size={16} />
             <span className="truncate">Market Analysis 2024</span>
           </button>
        </div>

        <div className="p-4 border-t border-gray-100">
           {isServiceAvailable === false && (
             <div className="flex items-center gap-2 text-xs text-red-500 bg-red-50 p-2 rounded">
                <AlertTriangle size={12} />
                <span>Service Unavailable</span>
             </div>
           )}
           {isServiceAvailable === true && (
             <div className="flex items-center gap-2 text-xs text-green-600 bg-green-50 p-2 rounded">
                <div className="w-2 h-2 rounded-full bg-green-500"></div>
                <span>System Online</span>
             </div>
           )}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col h-full relative">
        {/* Mobile Header */}
        <div className="md:hidden flex items-center justify-between p-4 bg-white border-b border-gray-200">
           <div className="font-bold text-slate-800">Aegis Chat</div>
           <button className="p-2 text-gray-500"><Menu size={20} /></button>
        </div>

        {/* Messages List */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-2 scroll-smooth">
          <div className="max-w-4xl mx-auto w-full">
            {messages.map((msg) => (
              <MessageBubble 
                key={msg.id} 
                message={msg} 
                onFormSubmit={handleFormSubmit}
                isFormSubmitting={isLoading}
              />
            ))}
            {isLoading && (
              <div className="flex justify-start mb-6">
                 <div className="flex max-w-[80%] flex-row">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-white border border-gray-200 flex items-center justify-center mr-3">
                       <div className="w-2 h-2 bg-blue-600 rounded-full animate-ping"></div>
                    </div>
                    <div className="bg-white p-3 rounded-2xl rounded-tl-sm border border-gray-100 shadow-sm">
                      <Loader />
                    </div>
                 </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Input Area */}
        <div className="p-4 bg-white border-t border-gray-200">
           <div className="max-w-4xl mx-auto relative">
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Message Aegis..."
                rows={1}
                disabled={isLoading}
                className="w-full pl-4 pr-12 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 resize-none max-h-32 min-h-[48px] shadow-sm text-sm disabled:opacity-60"
                style={{
                  minHeight: '48px',
                  height: 'auto'
                }}
                onInput={(e) => {
                   const target = e.target as HTMLTextAreaElement;
                   target.style.height = 'auto';
                   target.style.height = `${Math.min(target.scrollHeight, 128)}px`;
                }}
              />
              <button 
                onClick={handleSend}
                disabled={!input.trim() || isLoading}
                className="absolute right-2 bottom-2 p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
              >
                <Send size={16} />
              </button>
           </div>
           <div className="max-w-4xl mx-auto mt-2 text-center">
             <p className="text-[10px] text-gray-400">Aegis AI can make mistakes. Consider checking important information.</p>
           </div>
        </div>

      </div>
    </div>
  );
}

export default App;