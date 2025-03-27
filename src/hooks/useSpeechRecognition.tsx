import { useState, useEffect, useCallback } from 'react';

interface SpeechRecognitionHook {
  text: string;
  isListening: boolean;
  startListening: () => void;
  stopListening: () => void;
  hasRecognitionSupport: boolean;
  error: string | null;
}

export const useSpeechRecognition = (): SpeechRecognitionHook => {
  const [text, setText] = useState<string>('');
  const [isListening, setIsListening] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [recognition, setRecognition] = useState<SpeechRecognition | null>(null);
  const [hasRecognitionSupport, setHasRecognitionSupport] = useState<boolean>(false);

  useEffect(() => {
    // Check for browser support
    if ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window) {
      const SpeechRecognitionClass = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SpeechRecognitionClass) {
        const recognitionInstance = new SpeechRecognitionClass();
        
        recognitionInstance.continuous = true;
        recognitionInstance.interimResults = true;
        // Set English as the default language
        recognitionInstance.lang = 'en-US';
        
        setRecognition(recognitionInstance);
        setHasRecognitionSupport(true);
      }
    } else {
      setHasRecognitionSupport(false);
      setError('Your browser does not support speech recognition');
    }
    
    // Cleanup function
    return () => {
      if (recognition) {
        recognition.stop();
      }
    };
  }, []);

  const handleResult = (event: SpeechRecognitionEvent) => {
    const transcript = Array.from(event.results)
      .map(result => result[0])
      .map(result => result.transcript)
      .join('');
    
    setText(transcript);
  };

  const handleEnd = () => {
    setIsListening(false);
  };

  const handleError = (event: SpeechRecognitionErrorEvent) => {
    console.error('Speech recognition error:', event.error);
    setError(`Speech recognition error: ${event.error}`);
    setIsListening(false);
  };

  useEffect(() => {
    if (!recognition) return;

    recognition.onresult = handleResult;
    recognition.onend = handleEnd;
    recognition.onerror = handleError;

    return () => {
      recognition.onresult = null;
      recognition.onend = null;
      recognition.onerror = null;
    };
  }, [recognition]);

  const startListening = useCallback(() => {
    setText('');
    setError(null);
    
    if (recognition) {
      try {
        recognition.start();
        setIsListening(true);
      } catch (err) {
        console.error('Failed to start recognition:', err);
        setError('Failed to start speech recognition');
      }
    }
  }, [recognition]);

  const stopListening = useCallback(() => {
    if (recognition) {
      recognition.stop();
      setIsListening(false);
    }
  }, [recognition]);

  return {
    text,
    isListening,
    startListening,
    stopListening,
    hasRecognitionSupport,
    error
  };
};
