import React, { useState, useEffect, useCallback } from 'react';
import { Mic, MicOff, Loader2 } from 'lucide-react';
import { cn } from '../lib/utils';

interface VoiceInputProps {
  onResult: (text: string) => void;
  className?: string;
  lang?: string;
  placeholder?: string;
}

export default function VoiceInput({ onResult, className, lang = 'ur-PK', placeholder }: VoiceInputProps) {
  const [isListening, setIsListening] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [support, setSupport] = useState(true);

  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setSupport(false);
    }
  }, []);

  const startListening = useCallback(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    const recognition = new SpeechRecognition();
    recognition.lang = lang;
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      setIsListening(true);
      setError(null);
    };

    recognition.onresult = (event: any) => {
      const text = event.results[0][0].transcript;
      onResult(text);
      setIsListening(false);
    };

    recognition.onerror = (event: any) => {
      console.error('Speech recognition error:', event.error);
      setError(event.error);
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.start();
  }, [lang, onResult]);

  if (!support) return null;

  return (
    <div className={cn("relative flex items-center", className)}>
      <button
        type="button"
        onClick={isListening ? undefined : startListening}
        disabled={isListening}
        className={cn(
          "p-3 rounded-xl transition-all active:scale-95 flex items-center justify-center gap-2",
          isListening 
            ? "bg-ruby text-white animate-pulse" 
            : "bg-gray-100 dark:bg-white/5 text-gray-400 hover:text-ruby hover:bg-ruby/5"
        )}
        title={isListening ? "سن رہا ہوں..." : "آواز سے لکھیں"}
      >
        {isListening ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            <span className="text-[10px] font-black uppercase tracking-widest hidden md:block">Listening</span>
          </>
        ) : (
          <>
            <Mic className="w-5 h-5" />
          </>
        )}
      </button>
      {error && (
        <div className="absolute top-full right-0 mt-2 text-[10px] text-red-500 font-bold bg-white dark:bg-dark-surface p-2 rounded-lg shadow-lg z-50">
          {error === 'not-allowed' ? 'مائیکروفون تک رسائی نہیں ہے' : 'کوشش کریں'}
        </div>
      )}
    </div>
  );
}
