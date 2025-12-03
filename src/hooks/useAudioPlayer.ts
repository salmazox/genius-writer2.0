/**
 * Audio Player Hook
 *
 * Provides TTS (Text-to-Speech) functionality with audio playback controls.
 * Handles audio context management, playback state, and cleanup.
 *
 * @example
 * const { isPlaying, isGenerating, play, stop } = useAudioPlayer();
 *
 * // Play text
 * await play(content, (error) => showToast(error, 'error'));
 *
 * // Stop playback
 * stop();
 */

import { useState, useRef, useEffect } from 'react';
import { generateSpeech } from '../services/gemini';

interface UseAudioPlayerReturn {
  isPlaying: boolean;
  isGenerating: boolean;
  play: (content: string, onError?: (message: string) => void) => Promise<void>;
  stop: () => void;
}

export function useAudioPlayer(): UseAudioPlayerReturn {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const audioContextRef = useRef<AudioContext | null>(null);
  const audioSourceRef = useRef<AudioBufferSourceNode | null>(null);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

  const stop = () => {
    if (audioSourceRef.current) {
      audioSourceRef.current.stop();
      audioSourceRef.current = null;
    }
    setIsPlaying(false);
  };

  const play = async (content: string, onError?: (message: string) => void) => {
    // If already playing, stop
    if (isPlaying) {
      stop();
      return;
    }

    // Validate content
    if (!content) return;

    // Strip HTML/Markdown for TTS
    const plainText = content.replace(/<[^>]*>/g, ' ').replace(/[#*_`]/g, '');
    if (!plainText.trim()) return;

    setIsGenerating(true);
    try {
      const buffer = await generateSpeech(plainText);
      const ctx = audioContextRef.current || new (window.AudioContext || (window as any).webkitAudioContext)();
      audioContextRef.current = ctx;

      const audioBuffer = await ctx.decodeAudioData(buffer);
      const source = ctx.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(ctx.destination);

      source.onended = () => setIsPlaying(false);
      source.start();
      audioSourceRef.current = source;
      setIsPlaying(true);
    } catch (error) {
      if (onError) {
        onError('Failed to play audio');
      }
    } finally {
      setIsGenerating(false);
    }
  };

  return {
    isPlaying,
    isGenerating,
    play,
    stop
  };
}
