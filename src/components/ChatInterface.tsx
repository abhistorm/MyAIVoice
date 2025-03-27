
import React, { useState, useEffect, useRef } from 'react';
import { Sparkles, Volume2, VolumeX, Settings, Send, AlertCircle, Mic, MicOff, StopCircle } from 'lucide-react';
import { useSpeechRecognition } from '@/hooks/useSpeechRecognition';
import { useSpeechSynthesis } from '@/hooks/useSpeechSynthesis';
import { generateChatResponse } from '@/services/openai';
import VoiceButton from './VoiceButton';
import MessageBubble from './MessageBubble';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'assistant';
  timestamp: Date;
}

const ChatInterface: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isTextMode, setIsTextMode] = useState(false);
  const [autoSpeak, setAutoSpeak] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  
  // Custom hooks for speech recognition and synthesis
  const { 
    text: recognizedText, 
    isListening, 
    startListening, 
    stopListening,
    hasRecognitionSupport
  } = useSpeechRecognition();
  
  const { 
    speak, 
    cancel, 
    isSpeaking, 
    hasSynthesisSupport,
    voices,
    selectedVoice, 
    setSelectedVoice
  } = useSpeechSynthesis();

  // Handle speech recognition text
  useEffect(() => {
    if (recognizedText && !isLoading) {
      setInputText(recognizedText);
    }
  }, [recognizedText, isLoading]);

  // Auto-scroll to the bottom of the messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const toggleListening = () => {
    if (isListening) {
      stopListening();
      if (recognizedText) {
        handleSendMessage();
      }
    } else {
      setInputText('');
      startListening();
    }
  };

  const toggleSpeaking = () => {
    if (isSpeaking) {
      cancel();
    } else {
      const lastAssistantMessage = messages
        .filter(msg => msg.sender === 'assistant')
        .pop();
      
      if (lastAssistantMessage) {
        speak(lastAssistantMessage.text);
      }
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputText(e.target.value);
  };

  const handleSendMessage = async () => {
    const trimmedText = inputText.trim();
    if (!trimmedText || isLoading) return;

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      text: trimmedText,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsLoading(true);
    
    if (isListening) {
      stopListening();
    }

    try {
      // Prepare messages for the API
      const messageHistory = messages
        .map(msg => ({
          role: msg.sender === 'user' ? 'user' : 'assistant',
          content: msg.text
        }));
      
      messageHistory.push({
        role: 'user',
        content: trimmedText
      });

      // Get response from our service
      const response = await generateChatResponse(messageHistory);

      // Add assistant message
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: response,
        sender: 'assistant',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMessage]);

      // Auto speak the response if enabled
      if (autoSpeak && hasSynthesisSupport) {
        speak(response);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to get a response. Please try again."
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const renderWelcomeMessage = () => (
    <div className="flex flex-col items-center justify-center text-center py-16 px-4 space-y-6">
      <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mb-4 animate-breathe">
        <Sparkles className="w-10 h-10 text-primary" />
      </div>
      <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight">Voice Assistant</h1>
      <p className="text-muted-foreground max-w-md">
        Ask me anything using your voice or the text input below. I'm here to assist you.
      </p>
      <div className="flex flex-col sm:flex-row gap-3 mt-4">
        <Button
          className="flex items-center gap-2"
          onClick={() => {
            if (hasRecognitionSupport) {
              toggleListening();
            } else {
              setIsTextMode(true);
              setTimeout(() => {
                inputRef.current?.focus();
              }, 100);
            }
          }}
        >
          <Sparkles className="w-4 h-4" />
          <span>Get Started</span>
        </Button>
      </div>
    </div>
  );

  const renderSettings = () => (
    <div className="absolute inset-0 z-20 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-card border rounded-lg shadow-lg p-6 w-full max-w-md animate-fade-in">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">Settings</h2>
          <Button variant="ghost" size="icon" onClick={() => setShowSettings(false)}>
            <span className="sr-only">Close</span>
            ✕
          </Button>
        </div>
        
        <div className="space-y-6">
          {hasSynthesisSupport && (
            <div className="space-y-2">
              <label htmlFor="voice-select" className="text-sm font-medium">
                Voice
              </label>
              <select
                id="voice-select"
                value={selectedVoice?.name || ''}
                onChange={(e) => {
                  const selectedVoiceName = e.target.value;
                  const voice = voices.find(v => v.name === selectedVoiceName);
                  if (voice) setSelectedVoice(voice);
                }}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                {voices.map((voice) => (
                  <option key={voice.name} value={voice.name}>
                    {voice.name} ({voice.lang})
                  </option>
                ))}
              </select>
            </div>
          )}
          
          <div className="flex items-center space-x-2">
            <input
              id="auto-speak"
              type="checkbox"
              checked={autoSpeak}
              onChange={() => setAutoSpeak(!autoSpeak)}
              className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
            />
            <label htmlFor="auto-speak" className="text-sm font-medium">
              Auto-speak responses
            </label>
          </div>
          
          <div className="flex justify-end gap-3 pt-4">
            <Button variant="outline" onClick={() => setShowSettings(false)}>
              Cancel
            </Button>
            <Button onClick={() => setShowSettings(false)}>
              Save Settings
            </Button>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="w-full max-w-3xl mx-auto h-full flex flex-col">
      <div className="flex items-center justify-between px-4 py-3 border-b">
        <h1 className="text-xl font-semibold tracking-tight">Voice Assistant</h1>
        <div className="flex items-center gap-2">
          {hasSynthesisSupport && messages.length > 0 && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={toggleSpeaking}
                    className={cn(
                      "text-muted-foreground hover:text-foreground",
                      isSpeaking && "text-primary hover:text-primary"
                    )}
                  >
                    {isSpeaking ? (
                      <VolumeX className="h-5 w-5" />
                    ) : (
                      <Volume2 className="h-5 w-5" />
                    )}
                    <span className="sr-only">
                      {isSpeaking ? "Stop Speaking" : "Start Speaking"}
                    </span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  {isSpeaking ? "Stop Speaking" : "Speak Last Response"}
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
          
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowSettings(true)}
                >
                  <Settings className="h-5 w-5" />
                  <span className="sr-only">Settings</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>Settings</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>
      
      <div
        className="flex-1 overflow-y-auto p-4 sm:p-6"
        style={{ scrollBehavior: 'smooth' }}
      >
        {messages.length === 0 ? (
          renderWelcomeMessage()
        ) : (
          <div className="space-y-6">
            {messages.map((message, index) => (
              <MessageBubble
                key={message.id}
                message={message}
                isLatest={index === messages.length - 1}
              />
            ))}
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      
      <div className="p-4 border-t bg-card/30 backdrop-blur-sm">
        {!hasRecognitionSupport && !isTextMode && (
          <div className="mb-3 p-3 bg-amber-50 dark:bg-amber-950/30 rounded-md flex items-center gap-2 text-amber-800 dark:text-amber-300 text-sm">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <p>
              Speech recognition is not supported in your browser. Please use the text input instead.
            </p>
          </div>
        )}
        
        <div className="flex items-center gap-3">
          {isTextMode || !hasRecognitionSupport ? (
            <div className="relative flex-1">
              <input
                ref={inputRef}
                type="text"
                value={inputText}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                placeholder="Type your message..."
                disabled={isLoading}
                className="w-full h-12 pl-4 pr-12 rounded-full border bg-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              />
              <Button
                size="icon"
                className="absolute right-1 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full"
                disabled={!inputText.trim() || isLoading}
                onClick={handleSendMessage}
              >
                <Send className="h-5 w-5" />
                <span className="sr-only">Send</span>
              </Button>
            </div>
          ) : (
            <div className="flex-1 h-12 px-4 flex items-center border rounded-full bg-background">
              <span className={cn(
                "text-sm truncate transition-opacity",
                (isListening || inputText) ? "opacity-100" : "text-muted-foreground opacity-70"
              )}>
                {isListening 
                  ? (inputText || "Listening...") 
                  : (inputText || "Press the mic button to speak")}
              </span>
            </div>
          )}
          
          {hasRecognitionSupport && (
            <>
              {isTextMode ? (
                <Button 
                  variant="outline"
                  size="icon"
                  className="h-12 w-12 rounded-full"
                  onClick={() => setIsTextMode(false)}
                >
                  <Mic className="h-5 w-5" />
                  <span className="sr-only">Switch to Voice Mode</span>
                </Button>
              ) : (
                <VoiceButton
                  isListening={isListening}
                  isSpeaking={isSpeaking}
                  onClick={toggleListening}
                  disabled={isLoading}
                />
              )}
            </>
          )}
        </div>
      </div>
      
      {showSettings && renderSettings()}
    </div>
  );
};

export default ChatInterface;
