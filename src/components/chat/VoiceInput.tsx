'use client';

/**
 * Voice input for the chat composer.
 *
 * VoiceInput renders its children (the composer textarea) in place of the input area while
 * idle, and swaps in the kokonutui-style listening UI — rotating square, elapsed timer and
 * an animated waveform — while the recognizer runs. When speech ends the textarea comes
 * back holding the transcript, ready to edit and send.
 */

import { Mic } from 'lucide-react';
import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface VoiceInputProps {
  value: string;
  onChange: (value: string) => void;
  /** Input area, replaced by the listening UI while recording */
  children?: ReactNode;
  onListeningChange?: (listening: boolean) => void;
  className?: string;
  buttonClassName?: string;
  disabled?: boolean;
}

const ERROR_MESSAGES: Record<string, string> = {
  'not-allowed': 'Microphone blocked. Allow access in your browser.',
  'service-not-allowed': 'Microphone blocked. Allow access in your browser.',
  'audio-capture': 'No microphone found.',
  network: 'Voice input needs a network connection.',
};

const BAR_COUNT = 32;

const formatTime = (seconds: number) => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

export default function VoiceInput({
  value,
  onChange,
  children,
  onListeningChange,
  className,
  buttonClassName,
  disabled = false,
}: VoiceInputProps) {
  const [isListening, setIsListening] = useState(false);
  const [voiceSupported, setVoiceSupported] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [time, setTime] = useState(0);
  const [isClient, setIsClient] = useState(false);
  const recognitionRef = useRef<any>(null);
  const valueRef = useRef(value);
  const onChangeRef = useRef(onChange);
  const onListeningChangeRef = useRef(onListeningChange);

  const setListening = (next: boolean) => {
    setIsListening(next);
    onListeningChangeRef.current?.(next);
  };

  // Keep latest props available without recreating the recognizer
  useEffect(() => {
    valueRef.current = value;
    onChangeRef.current = onChange;
    onListeningChangeRef.current = onListeningChange;
  }, [value, onChange, onListeningChange]);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const SpeechRecognitionConstructor =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognitionConstructor) return;

    setVoiceSupported(true);
    const recognition = new SpeechRecognitionConstructor();
    recognition.lang = 'en-US';
    recognition.continuous = false;
    recognition.interimResults = true;

    recognition.onresult = (event: any) => {
      let transcript = '';

      for (let i = event.resultIndex; i < event.results.length; i += 1) {
        const result = event.results[i];
        if (result.isFinal) {
          transcript += result[0].transcript;
        }
      }

      if (!transcript.trim()) return;

      onChangeRef.current(`${valueRef.current} ${transcript.trim()}`.trim());
    };

    recognition.onerror = (event: any) => {
      setListening(false);
      if (event?.error && event.error !== 'no-speech' && event.error !== 'aborted') {
        setError(ERROR_MESSAGES[event.error] ?? 'Voice input failed. Try again.');
      }
    };

    recognition.onend = () => {
      setListening(false);
    };

    recognitionRef.current = recognition;

    return () => {
      recognition.onresult = null;
      recognition.onerror = null;
      recognition.onend = null;
      recognition.abort();
      recognitionRef.current = null;
    };
  }, []);

  // Elapsed time, reset when the recognizer stops
  useEffect(() => {
    if (!isListening) {
      setTime(0);
      return;
    }
    const intervalId = setInterval(() => setTime((t) => t + 1), 1000);
    return () => clearInterval(intervalId);
  }, [isListening]);

  useEffect(() => {
    if (!error) return;
    const timer = setTimeout(() => setError(null), 4000);
    return () => clearTimeout(timer);
  }, [error]);

  // One set of bar heights per listening session, so the waveform pulses instead of jittering
  const barHeights = useMemo(
    () => Array.from({ length: BAR_COUNT }, () => 20 + Math.random() * 80),
    [isListening]
  );

  const toggleVoiceInput = () => {
    if (!voiceSupported || !recognitionRef.current) return;
    if (disabled && !isListening) return;

    if (isListening) {
      recognitionRef.current.stop();
      setListening(false);
      return;
    }

    setError(null);
    try {
      recognitionRef.current.start();
      setListening(true);
    } catch {
      setListening(false);
    }
  };

  // No speech recognition in this browser: keep the input, drop the mic
  if (!voiceSupported) return children ?? null;

  return (
    <>
      {isListening ? (
        <div className="flex min-w-0 flex-1 items-center gap-2.5 self-center">
          <div
            className="h-3.5 w-3.5 shrink-0 animate-spin rounded-[3px] bg-foreground"
            style={{ animationDuration: '3s' }}
          />
          <span className="shrink-0 font-mono text-xs tabular-nums text-foreground" aria-hidden>
            {formatTime(time)}
          </span>

          <div className="flex h-4 min-w-0 flex-1 items-center justify-between overflow-hidden">
            {barHeights.map((height, i) => (
              <div
                key={i}
                className={cn(
                  'w-0.5 shrink-0 rounded-full transition-all duration-300',
                  isClient ? 'animate-pulse bg-foreground/50' : 'h-1 bg-foreground/10'
                )}
                style={
                  isClient
                    ? { height: `${height}%`, animationDelay: `${i * 0.05}s` }
                    : undefined
                }
              />
            ))}
          </div>

          <span role="status" className="shrink-0 text-xs text-foreground">Listening…</span>
        </div>
      ) : (
        children
      )}

      <div className="relative shrink-0">
        <button
          type="button"
          onClick={toggleVoiceInput}
          aria-label={isListening ? 'Stop voice input' : 'Start voice input'}
          className={cn(
            'flex h-10 w-10 sm:h-8 sm:w-8 shrink-0 items-center justify-center rounded-xl transition-colors active:scale-95',
            isListening
              ? 'hover:bg-black/5 dark:hover:bg-white/5'
              : 'bg-muted text-foreground hover:bg-brand/10 hover:text-brand',
            className,
            buttonClassName,
            disabled && !isListening && 'cursor-not-allowed opacity-50'
          )}
          disabled={disabled && !isListening}
        >
          {isListening ? (
            <div
              className="h-3.5 w-3.5 animate-spin rounded-[3px] bg-foreground"
              style={{ animationDuration: '3s' }}
            />
          ) : (
            <Mic size={16} />
          )}
        </button>
        {error && (
          <span
            role="alert"
            className="absolute bottom-full right-0 z-30 mb-2 w-max max-w-[220px] rounded-md bg-foreground px-2 py-1 text-xs text-background shadow"
          >
            {error}
          </span>
        )}
      </div>
    </>
  );
}
