import React, { useState } from 'react';
import { Plus, Trash2, Wand2, Loader2, MessageSquare, Save, X } from 'lucide-react';
import { useUser } from '../contexts/UserContext';
import { Button } from '../components/ui/Button';
import { Input, Textarea } from '../components/ui/Forms';
import { extractBrandVoice } from '../services/gemini';
import { useToast } from '../contexts/ToastContext';
import { BrandVoice } from '../types';

interface BrandVoiceManagerProps {
    onClose: () => void;
}

export const BrandVoiceManager: React.FC<BrandVoiceManagerProps> = ({ onClose }) => {
    const { brandVoices, addBrandVoice, removeBrandVoice } = useUser();
    const { showToast } = useToast();
    
    const [mode, setMode] = useState<'list' | 'create' | 'analyze'>('list');
    const [newVoice, setNewVoice] = useState<Partial<BrandVoice>>({});
    const [sampleText, setSampleText] = useState('');
    const [isAnalyzing, setIsAnalyzing] = useState(false);

    const handleCreate = () => {
        if (!newVoice.name || !newVoice.description) {
            showToast("Please fill in all fields", "error");
            return;
        }
        addBrandVoice({
            id: Date.now().toString(),
            name: newVoice.name,
            description: newVoice.description
        });
        showToast("Brand voice created", "success");
        setMode('list');
        setNewVoice({});
    };

    const handleAnalyze = async () => {
        if (!sampleText.trim()) {
            showToast("Please enter sample text", "error");
            return;
        }
        setIsAnalyzing(true);
        try {
            const result = await extractBrandVoice(sampleText);
            setNewVoice(result);
            setMode('create');
        } catch (e) {
            showToast("Analysis failed", "error");
        } finally {
            setIsAnalyzing(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
                <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
                    <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <MessageSquare size={20} className="text-indigo-600"/> Brand Voices
                    </h2>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                        <X size={20}/>
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
                    {mode === 'list' && (
                        <div className="space-y-4">
                            {brandVoices.map(voice => (
                                <div key={voice.id} className="p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 hover:border-indigo-300 dark:hover:border-indigo-700 transition-colors group relative">
                                    <h3 className="font-bold text-slate-900 dark:text-white">{voice.name}</h3>
                                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{voice.description}</p>
                                    <button 
                                        onClick={() => removeBrandVoice(voice.id)}
                                        className="absolute top-3 right-3 text-slate-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            ))}
                            {brandVoices.length === 0 && (
                                <div className="text-center py-8 text-slate-500">
                                    No brand voices yet. Create one to sound consistent.
                                </div>
                            )}
                            
                            <div className="grid grid-cols-2 gap-3 mt-4">
                                <Button onClick={() => setMode('create')} variant="outline" icon={Plus}>Manual Entry</Button>
                                <Button onClick={() => setMode('analyze')} variant="primary" icon={Wand2}>Analyze Text</Button>
                            </div>
                        </div>
                    )}

                    {mode === 'create' && (
                        <div className="space-y-4 animate-in slide-in-from-right">
                            <Input 
                                label="Voice Name" 
                                placeholder="e.g. Professional Tech"
                                value={newVoice.name || ''}
                                onChange={e => setNewVoice(prev => ({...prev, name: e.target.value}))}
                            />
                            <Textarea 
                                label="Description" 
                                placeholder="Describe the tone, style, and vocabulary..."
                                value={newVoice.description || ''}
                                onChange={e => setNewVoice(prev => ({...prev, description: e.target.value}))}
                                className="min-h-[120px]"
                            />
                            <div className="flex gap-3 pt-2">
                                <Button onClick={() => setMode('list')} variant="secondary" className="flex-1">Cancel</Button>
                                <Button onClick={handleCreate} variant="primary" className="flex-1" icon={Save}>Save Voice</Button>
                            </div>
                        </div>
                    )}

                    {mode === 'analyze' && (
                        <div className="space-y-4 animate-in slide-in-from-right">
                            <div className="p-3 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg text-sm text-indigo-700 dark:text-indigo-300">
                                Paste a sample of your writing (blog post, email, website copy) and our AI will extract the brand voice.
                            </div>
                            <Textarea 
                                placeholder="Paste text sample here..." 
                                value={sampleText}
                                onChange={e => setSampleText(e.target.value)}
                                className="min-h-[200px]"
                            />
                            <div className="flex gap-3 pt-2">
                                <Button onClick={() => setMode('list')} variant="secondary" className="flex-1">Back</Button>
                                <Button 
                                    onClick={handleAnalyze} 
                                    variant="primary" 
                                    className="flex-1" 
                                    isLoading={isAnalyzing}
                                    icon={Wand2}
                                >
                                    Analyze & Create
                                </Button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};