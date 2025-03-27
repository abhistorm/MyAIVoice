
import React from 'react';
import { Mic, MicOff, StopCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface VoiceButtonProps {
  isListening: boolean;
  isSpeaking: boolean;
  onClick: () => void;
  disabled?: boolean;
}

const VoiceButton: React.FC<VoiceButtonProps> = ({
  isListening,
  isSpeaking,
  onClick,
  disabled = false
}) => {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={cn(
        'relative flex items-center justify-center w-16 h-16 rounded-full transition-all duration-300 ease-in-out transform',
        isListening 
          ? 'bg-red-500 hover:bg-red-600 scale-110'
          : isSpeaking
            ? 'bg-primary/80 hover:bg-primary scale-105'
            : 'bg-primary hover:bg-primary/90',
        'focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        'shadow-lg'
      )}
    >
      {isListening ? (
        <>
          <StopCircle className="w-8 h-8 text-white animate-pulse-subtle" />
          <span className="sr-only">Stop Listening</span>
          
          {/* Animated rings */}
          <span className="absolute w-full h-full rounded-full bg-red-500/20 animate-ping" />
          <span className="absolute w-[120%] h-[120%] rounded-full bg-red-500/10 animate-pulse" />
        </>
      ) : isSpeaking ? (
        <div className="flex items-end justify-center h-8 space-x-1">
          {[1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              className="soundwave-bar w-1.5 h-6 bg-white"
              style={{ 
                height: `${Math.max(20, Math.min(32, Math.random() * 32))}px`,
                animationDelay: `${i * 0.1}s`
              }}
            />
          ))}
        </div>
      ) : (
        <>
          <Mic className="w-8 h-8 text-white" />
          <span className="sr-only">Start Listening</span>
        </>
      )}
    </button>
  );
};

export default VoiceButton;
