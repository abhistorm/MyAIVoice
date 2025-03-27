
import React from 'react';
import ChatInterface from '@/components/ChatInterface';

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-background to-secondary/30">
      <div className="flex-1 container py-6 px-4 flex flex-col">
        <ChatInterface />
      </div>
    </div>
  );
};

export default Index;
