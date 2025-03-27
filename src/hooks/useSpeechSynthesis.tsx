
import { useState, useEffect, useCallback } from 'react';

interface SpeechSynthesisHook {
  speak: (text: string) => void;
  cancel: () => void;
  isSpeaking: boolean;
  isPaused: boolean;
  hasSynthesisSupport: boolean;
  voices: SpeechSynthesisVoice[];
  selectedVoice: SpeechSynthesisVoice | null;
  setSelectedVoice: (voice: SpeechSynthesisVoice) => void;
  error: string | null;
}

export const useSpeechSynthesis = (): SpeechSynthesisHook => {
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoice, setSelectedVoice] = useState<SpeechSynthesisVoice | null>(null);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [hasSynthesisSupport, setHasSynthesisSupport] = useState<boolean>(false);

  useEffect(() => {
    if ('speechSynthesis' in window) {
      setHasSynthesisSupport(true);
      
      // Function to load voices
      const loadVoices = () => {
        const availableVoices = window.speechSynthesis.getVoices();
        
        if (availableVoices.length > 0) {
          setVoices(availableVoices);
          
          // Try to find and set a good default English voice
          const preferredVoice = availableVoices.find(
            voice => 
              voice.lang.includes('en-US') && 
              voice.name.includes('Premium') || 
              voice.name.includes('Enhanced')
          ) || 
          availableVoices.find(voice => voice.lang.includes('en-US')) || 
          availableVoices[0];
          
          setSelectedVoice(preferredVoice);
        }
      };
      
      // Load voices
      loadVoices();
      
      // Chrome loads voices asynchronously, so we need this event
      if (window.speechSynthesis.onvoiceschanged !== undefined) {
        window.speechSynthesis.onvoiceschanged = loadVoices;
      }
      
    } else {
      setHasSynthesisSupport(false);
      setError('Your browser does not support speech synthesis');
    }
    
    // Handle page visibility changes
    const handleVisibilityChange = () => {
      if (document.hidden && window.speechSynthesis.speaking) {
        window.speechSynthesis.pause();
        setIsPaused(true);
      } else if (isPaused) {
        window.speechSynthesis.resume();
        setIsPaused(false);
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    // Cleanup
    return () => {
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [isPaused]);

  const speak = useCallback((text: string) => {
    if (!hasSynthesisSupport) {
      setError('Speech synthesis is not supported in your browser');
      return;
    }
    
    if (!text) {
      setError('No text provided to speak');
      return;
    }
    
    try {
      // Cancel any ongoing speech
      window.speechSynthesis.cancel();
      
      const utterance = new SpeechSynthesisUtterance(text);
      
      if (selectedVoice) {
        utterance.voice = selectedVoice;
      }
      
      utterance.rate = 1.0;
      utterance.pitch = 1.0;
      utterance.volume = 1.0;
      
      utterance.onstart = () => {
        setIsSpeaking(true);
        setError(null);
      };
      
      utterance.onend = () => {
        setIsSpeaking(false);
      };
      
      utterance.onerror = (event) => {
        console.error('Speech synthesis error:', event);
        setError(`Speech synthesis error: ${event.error}`);
        setIsSpeaking(false);
      };
      
      window.speechSynthesis.speak(utterance);
    } catch (err) {
      console.error('Error in speech synthesis:', err);
      setError('Failed to synthesize speech');
    }
  }, [hasSynthesisSupport, selectedVoice]);

  const cancel = useCallback(() => {
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      setIsPaused(false);
    }
  }, []);

  return {
    speak,
    cancel,
    isSpeaking,
    isPaused,
    hasSynthesisSupport,
    voices,
    selectedVoice,
    setSelectedVoice,
    error
  };
};
