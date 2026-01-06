import React from 'react';
import ReactMarkdown from 'react-markdown';
import { Bot, User, AlertCircle, CheckCircle2 } from 'lucide-react';
import { Message, DocumentSpec, Block } from '../../types';
import { ChartBlock } from './ChartBlock';
import { DynamicForm } from './DynamicForm';
import clsx from 'clsx';

interface MessageBubbleProps {
  message: Message;
  onFormSubmit?: (executionId: string, data: Record<string, any>) => void;
  isFormSubmitting?: boolean;
}

const renderBlock = (block: Block, index: number) => {
  if (block.type === 'paragraph') {
    return (
      <div key={index} className="prose prose-sm max-w-none text-slate-700 mb-2 leading-relaxed">
        <ReactMarkdown>{block.text}</ReactMarkdown>
      </div>
    );
  }
  if (block.type === 'chart') {
    return <ChartBlock key={index} spec={block.chart} />;
  }
  return null;
};

const renderDocument = (doc: DocumentSpec) => {
  return <div className="space-y-2">{doc.blocks.map(renderBlock)}</div>;
};

export const MessageBubble: React.FC<MessageBubbleProps> = ({ 
  message, 
  onFormSubmit, 
  isFormSubmitting 
}) => {
  const isUser = message.role === 'user';
  const isSystem = message.role === 'system';

  if (isSystem) {
    return (
      <div className="flex justify-center my-4">
        <span className="text-xs text-gray-400 bg-gray-100 px-3 py-1 rounded-full">
          {typeof message.content === 'string' ? message.content : 'System Notification'}
        </span>
      </div>
    );
  }

  return (
    <div className={clsx("flex w-full mb-6", isUser ? "justify-end" : "justify-start")}>
      <div className={clsx("flex max-w-[85%] md:max-w-[70%]", isUser ? "flex-row-reverse" : "flex-row")}>
        
        {/* Avatar */}
        <div className={clsx(
          "flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center mt-1",
          isUser ? "ml-3 bg-blue-600 text-white" : "mr-3 bg-white border border-gray-200 text-blue-600"
        )}>
          {isUser ? <User size={16} /> : <Bot size={18} />}
        </div>

        {/* Content Bubble */}
        <div className={clsx(
          "flex flex-col p-4 shadow-sm text-sm border",
          isUser 
            ? "bg-blue-600 text-white rounded-2xl rounded-tr-sm border-blue-600" 
            : "bg-white text-slate-800 rounded-2xl rounded-tl-sm border-gray-100"
        )}>
          {/* Main Content */}
          <div className={clsx(isUser && "text-white prose-invert prose-p:text-white prose-headings:text-white")}>
             {typeof message.content === 'string' ? (
                <div className="prose prose-sm max-w-none break-words">
                  <ReactMarkdown>{message.content}</ReactMarkdown>
                </div>
             ) : (
               renderDocument(message.content as DocumentSpec)
             )}
          </div>

          {/* Dynamic Form Area (Only for Agent messages that prompt for input) */}
          {message.isAwaitPrompt && message.inputSchema && message.executionId && (
            <div className="mt-2 pt-2 border-t border-gray-100/50">
              {message.hasSubmitted ? (
                 <div className="flex items-center space-x-2 text-green-600 mt-2 text-xs font-medium bg-green-50 p-2 rounded-lg">
                   <CheckCircle2 size={14} />
                   <span>Input submitted</span>
                 </div>
              ) : (
                <DynamicForm 
                  schema={message.inputSchema}
                  isSubmitting={!!isFormSubmitting}
                  disabled={message.hasSubmitted}
                  onSubmit={(data) => {
                    if (onFormSubmit && message.executionId) {
                      onFormSubmit(message.executionId, data);
                    }
                  }}
                />
              )}
            </div>
          )}
          
          {/* Timestamp & Status */}
          <div className={clsx(
            "mt-2 text-[10px] flex items-center gap-1 opacity-70",
            isUser ? "text-blue-100 justify-end" : "text-gray-400 justify-start"
          )}>
            <span>{new Date(message.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
            {isUser && message.status === 'error' && <AlertCircle size={10} className="text-red-200" />}
          </div>
        </div>
      </div>
    </div>
  );
};