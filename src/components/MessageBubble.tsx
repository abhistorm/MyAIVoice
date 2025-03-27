
import React from 'react';
import { cn } from '@/lib/utils';
import { User, Bot } from 'lucide-react';

interface MessageBubbleProps {
  message: {
    id: string;
    text: string;
    sender: 'user' | 'assistant';
    timestamp: Date;
  };
  isLatest: boolean;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({ message, isLatest }) => {
  const isUser = message.sender === 'user';
  
  return (
    <div 
      className={cn(
        'flex w-full mb-4 gap-3 message-transition',
        isUser ? 'justify-end' : 'justify-start',
        isLatest && 'animate-fade-up'
      )}
    >
      {!isUser && (
        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
          <Bot className="w-5 h-5 text-primary" />
        </div>
      )}
      
      <div 
        className={cn(
          'max-w-[80%] sm:max-w-[70%] p-4 rounded-2xl',
          'glass-morphism message-transition',
          isUser 
            ? 'bg-primary text-primary-foreground rounded-tr-none' 
            : 'bg-secondary/80 text-secondary-foreground rounded-tl-none'
        )}
      >
        <p className="text-sm sm:text-base whitespace-pre-wrap">{message.text}</p>
        <div className={cn(
          'text-xs mt-1 opacity-70',
          isUser ? 'text-right' : 'text-left'
        )}>
          {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </div>
      </div>
      
      {isUser && (
        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
          <User className="w-5 h-5 text-primary" />
        </div>
      )}
    </div>
  );
};

export default MessageBubble;
