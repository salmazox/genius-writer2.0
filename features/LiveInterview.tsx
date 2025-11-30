
import React, { useEffect, useRef, useState } from 'react';
import { Mic, MicOff, PhoneOff, Activity, Loader2, Sparkles, AlertCircle, BarChart3 } from 'lucide-react';
import { createLiveSession } from '../services/gemini';
import { useToast } from '../contexts/ToastContext';
import { Button } from '../components/ui/Button';
import { LiveServerMessage, Modality, Blob } from '@google/genai';

const LiveInterview: React.FC = () => {
    const { showToast } = useToast();
    
    // State
    const [status, setStatus] = useState<'idle' | 'connecting' | 'connected' | 'error'>('idle');
    const [isMuted, setIsMuted] = useState(false);
    const [volume, setVolume] = useState(0);
    const [aiSpeaking, setAiSpeaking] = useState(false);
    
    // Refs for Audio Handling
    const sessionRef = useRef<any>(null);
    const audioContextRef = useRef<AudioContext | null>(null);
    const sourceNodeRef = useRef<MediaStreamAudioSourceNode | null>(null);
    const processorRef = useRef<ScriptProcessorNode | null>(null);
    const analyzerRef = useRef<AnalyserNode | null>(null);
    const streamRef = useRef<MediaStream | null>(null);
    const animationFrameRef = useRef<number | null>(null);
    
    // Playback Queue
    const nextStartTimeRef = useRef<number>(0);
    const activeSourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());

    const startSession = async () => {
        try {
            setStatus('connecting');
            
            // 1. Setup Audio Context & Stream
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            streamRef.current = stream;
            
            const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
            const ctx = new AudioContextClass({ sampleRate: 16000 });
            audioContextRef.current = ctx;
            
            // Analyzer for Visuals
            const analyzer = ctx.createAnalyser();
            analyzer.fftSize = 256;
            analyzerRef.current = analyzer;

            // Input Pipeline: Mic -> Analyzer -> Processor -> Destination (Muted to prevent feedback)
            const source = ctx.createMediaStreamSource(stream);
            sourceNodeRef.current = source;
            source.connect(analyzer);
            
            // 2. Setup Gemini Live Session
            const sessionPromise = createLiveSession({
                config: {
                    responseModalities: [Modality.AUDIO],
                    speechConfig: {
                        voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } },
                    },
                    systemInstruction: `You are a professional hiring manager conducting a job interview. 
                    Ask insightful questions, listen to the candidate's answers, and provide brief feedback before moving to the next question. 
                    Be professional but encouraging. Start by asking what role they are applying for.`,
                },
                callbacks: {
                    onopen: () => {
                        console.log('Session opened');
                        setStatus('connected');
                        
                        // Start Audio Processing when session opens
                        const processor = ctx.createScriptProcessor(4096, 1, 1);
                        processorRef.current = processor;
                        
                        processor.onaudioprocess = (e) => {
                            if (isMuted) return;
                            const inputData = e.inputBuffer.getChannelData(0);
                            const pcmBlob = createBlob(inputData);
                            
                            sessionPromise.then((session: any) => {
                                session.sendRealtimeInput({ media: pcmBlob });
                            });
                        };
                        
                        source.connect(processor);
                        processor.connect(ctx.destination);
                    },
                    onmessage: async (msg: LiveServerMessage) => {
                        // Handle Audio Output
                        const base64Audio = msg.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
                        if (base64Audio) {
                            setAiSpeaking(true);
                            await queueAudio(base64Audio);
                            // Simple timeout to turn off speaking indicator (approximate)
                            setTimeout(() => setAiSpeaking(false), 2000); 
                        }

                        // Handle Interruption
                        if (msg.serverContent?.interrupted) {
                            stopAudioQueue();
                            setAiSpeaking(false);
                        }
                    },
                    onclose: () => {
                        console.log('Session closed');
                        cleanup();
                        setStatus('idle');
                    },
                    onerror: (err: any) => {
                        console.error('Session error', err);
                        showToast("Connection error", "error");
                        cleanup();
                        setStatus('error');
                    }
                }
            });
            
            sessionRef.current = sessionPromise;
            
            // Start Visualizer Loop
            visualize();

        } catch (e) {
            console.error(e);
            showToast("Failed to access microphone or connect.", "error");
            setStatus('error');
            cleanup();
        }
    };

    const cleanup = () => {
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
            streamRef.current = null;
        }
        if (processorRef.current) {
            processorRef.current.disconnect();
            processorRef.current = null;
        }
        if (sourceNodeRef.current) {
            sourceNodeRef.current.disconnect();
            sourceNodeRef.current = null;
        }
        if (audioContextRef.current) {
            audioContextRef.current.close();
            audioContextRef.current = null;
        }
        if (sessionRef.current) {
            sessionRef.current.then((s: any) => s.close());
            sessionRef.current = null;
        }
        if (animationFrameRef.current) {
            cancelAnimationFrame(animationFrameRef.current);
        }
        stopAudioQueue();
    };

    const stopAudioQueue = () => {
        activeSourcesRef.current.forEach(source => source.stop());
        activeSourcesRef.current.clear();
        nextStartTimeRef.current = 0;
    };

    const queueAudio = async (base64: string) => {
        const ctx = audioContextRef.current;
        if (!ctx) return;

        // Ensure we are synced with current time
        nextStartTimeRef.current = Math.max(nextStartTimeRef.current, ctx.currentTime);

        const audioBuffer = await decodeAudioData(base64, ctx);
        
        const source = ctx.createBufferSource();
        source.buffer = audioBuffer;
        source.connect(ctx.destination);
        source.onended = () => activeSourcesRef.current.delete(source);
        
        source.start(nextStartTimeRef.current);
        nextStartTimeRef.current += audioBuffer.duration;
        activeSourcesRef.current.add(source);
    };

    const visualize = () => {
        if (!analyzerRef.current) return;
        const dataArray = new Uint8Array(analyzerRef.current.frequencyBinCount);
        analyzerRef.current.getByteFrequencyData(dataArray);
        
        // Calculate average volume
        const avg = dataArray.reduce((a, b) => a + b) / dataArray.length;
        setVolume(avg);
        
        animationFrameRef.current = requestAnimationFrame(visualize);
    };

    // Helper: Create Blob for Gemini
    function createBlob(data: Float32Array): Blob {
        const l = data.length;
        const int16 = new Int16Array(l);
        for (let i = 0; i < l; i++) {
            int16[i] = data[i] * 32768;
        }
        return {
            data: arrayBufferToBase64(int16.buffer),
            mimeType: 'audio/pcm;rate=16000',
        };
    }

    // Helper: ArrayBuffer to Base64
    function arrayBufferToBase64(buffer: ArrayBuffer) {
        let binary = '';
        const bytes = new Uint8Array(buffer);
        const len = bytes.byteLength;
        for (let i = 0; i < len; i++) {
            binary += String.fromCharCode(bytes[i]);
        }
        return btoa(binary);
    }

    // Helper: Base64 to AudioBuffer
    async function decodeAudioData(base64: string, ctx: AudioContext): Promise<AudioBuffer> {
        const binaryString = atob(base64);
        const len = binaryString.length;
        const bytes = new Uint8Array(len);
        for (let i = 0; i < len; i++) {
            bytes[i] = binaryString.charCodeAt(i);
        }
        
        // Manual PCM decoding (16-bit, 24kHz usually from Gemini)
        const dataInt16 = new Int16Array(bytes.buffer);
        // Gemini output usually 24000Hz
        const targetRate = 24000; 
        const buffer = ctx.createBuffer(1, dataInt16.length, targetRate);
        const channelData = buffer.getChannelData(0);
        for (let i = 0; i < dataInt16.length; i++) {
            channelData[i] = dataInt16[i] / 32768.0;
        }
        return buffer;
    }

    useEffect(() => {
        return () => cleanup();
    }, []);

    return (
        <div className="flex flex-col items-center justify-center h-full bg-slate-950 text-white relative overflow-hidden rounded-2xl p-4 md:p-8">
            {/* Background Ambience */}
            <div className={`absolute inset-0 bg-gradient-to-b from-indigo-900/20 to-black transition-opacity duration-1000 ${status === 'connected' ? 'opacity-100' : 'opacity-50'}`}></div>
            
            {/* Central Visualizer */}
            <div className="relative z-10 flex flex-col items-center gap-8 md:gap-12 w-full max-w-lg">
                
                <div className="relative mt-8 md:mt-0">
                    {/* Glowing Orb */}
                    <div 
                        className={`w-32 h-32 md:w-48 md:h-48 rounded-full blur-3xl absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 transition-all duration-200 ${aiSpeaking ? 'bg-indigo-500 opacity-60 scale-150' : 'bg-blue-500 opacity-20 scale-100'}`}
                    ></div>
                    
                    <div className="relative w-32 h-32 md:w-48 md:h-48 rounded-full border-4 border-slate-800 flex items-center justify-center bg-slate-900 shadow-2xl transition-all">
                        {status === 'connecting' ? (
                            <Loader2 size={48} className="animate-spin text-indigo-400" />
                        ) : status === 'connected' ? (
                            <div 
                                className="w-full h-full rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 transition-transform duration-75 ease-linear opacity-90"
                                style={{ transform: `scale(${0.7 + (volume / 255) * 0.5})` }}
                            ></div>
                        ) : (
                            <div className="bg-slate-800 w-full h-full rounded-full flex items-center justify-center">
                                <BarChart3 size={32} className="text-slate-600" />
                            </div>
                        )}
                        
                        {/* Status Icon Overlay */}
                        <div className="absolute -bottom-3 bg-slate-800 px-3 py-1 rounded-full text-[10px] md:text-xs font-bold uppercase tracking-wider border border-slate-700 flex items-center gap-2 shadow-lg">
                            <span className={`w-2 h-2 rounded-full ${status === 'connected' ? 'bg-green-500 animate-pulse' : status === 'error' ? 'bg-red-500' : 'bg-slate-500'}`}></span>
                            {status === 'idle' ? 'Ready' : status}
                        </div>
                    </div>
                </div>

                {/* Instructions / Feedback */}
                <div className="text-center w-full space-y-3 px-2">
                    <h2 className="text-xl md:text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">Live Interview Coach</h2>
                    <p className="text-slate-400 text-sm leading-relaxed max-w-sm mx-auto">
                        {status === 'idle' 
                            ? "Practice your interview skills with real-time feedback. Click the microphone to begin." 
                            : status === 'connecting' 
                                ? "Establishing secure connection to Gemini Live..."
                                : "Session active. Speak clearly. The AI will respond naturally."}
                    </p>
                </div>

                {/* Controls */}
                <div className="flex items-center gap-6 md:gap-8 pb-8 md:pb-0">
                    {status === 'idle' || status === 'error' ? (
                        <button 
                            onClick={startSession}
                            className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-green-500 hover:bg-green-400 text-white flex items-center justify-center shadow-lg hover:scale-105 active:scale-95 transition-all group"
                            title="Start Session"
                        >
                            <Mic size={28} className="group-hover:animate-pulse md:w-8 md:h-8" />
                        </button>
                    ) : (
                        <>
                            <button 
                                onClick={() => setIsMuted(!isMuted)}
                                className={`w-14 h-14 md:w-16 md:h-16 rounded-full flex items-center justify-center transition-all shadow-md ${isMuted ? 'bg-red-500 text-white hover:bg-red-400' : 'bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700'}`}
                                title={isMuted ? "Unmute" : "Mute"}
                            >
                                {isMuted ? <MicOff size={24} /> : <Mic size={24} />}
                            </button>
                            
                            <button 
                                onClick={() => { cleanup(); setStatus('idle'); }}
                                className="w-14 h-14 md:w-16 md:h-16 rounded-full bg-red-600 hover:bg-red-500 text-white flex items-center justify-center shadow-lg hover:scale-105 active:scale-95 transition-all"
                                title="End Session"
                            >
                                <PhoneOff size={24} />
                            </button>
                        </>
                    )}
                </div>
            </div>
            
            {/* Tech Badge */}
            <div className="absolute bottom-4 flex items-center gap-2 text-[10px] md:text-xs text-indigo-400/60 font-mono">
                <Sparkles size={10} /> Powered by Gemini 2.5 Flash Native Audio
            </div>
        </div>
    );
};

export default LiveInterview;
