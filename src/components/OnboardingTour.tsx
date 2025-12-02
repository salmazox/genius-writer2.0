
import React, { useState } from 'react';
import { Modal } from './ui/Modal';
import { Button } from './ui/Button';
import { Sparkles, FileText, LayoutTemplate, Shield, ArrowRight } from 'lucide-react';

interface OnboardingTourProps {
    onComplete: () => void;
}

export const OnboardingTour: React.FC<OnboardingTourProps> = ({ onComplete }) => {
    const [step, setStep] = useState(0);

    const steps = [
        {
            title: "Welcome to Genius Writer",
            desc: "Your AI-powered writing companion. Let's take a quick tour to get you started.",
            icon: <Sparkles size={48} className="text-indigo-600 mb-6" />
        },
        {
            title: "Choose a Template",
            desc: "Start with specialized tools like 'CV Builder' or 'Blog Post' to get structured AI assistance tailored to your needs.",
            icon: <LayoutTemplate size={48} className="text-purple-600 mb-6" />
        },
        {
            title: "Smart Editor",
            desc: "Use the Smart Editor for a Google Docs-like experience with a built-in AI chat companion to brainstorm and refine.",
            icon: <FileText size={48} className="text-blue-600 mb-6" />
        },
        {
            title: "Secure & Private",
            desc: "Your data is stored locally in your browser. We respect your privacy and don't use your personal data to train our public models.",
            icon: <Shield size={48} className="text-green-600 mb-6" />
        }
    ];

    const handleNext = () => {
        if (step < steps.length - 1) {
            setStep(step + 1);
        } else {
            onComplete();
        }
    };

    return (
        <Modal isOpen={true} onClose={onComplete} title="Getting Started">
            <div className="flex flex-col items-center text-center py-6 px-4">
                <div className="transform transition-all duration-300 ease-in-out scale-100 mb-4">
                    {steps[step].icon}
                </div>
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-3">{steps[step].title}</h3>
                <p className="text-slate-600 dark:text-slate-400 mb-10 max-w-sm text-base leading-relaxed">{steps[step].desc}</p>
                
                <div className="flex gap-2.5 mb-10">
                    {steps.map((_, i) => (
                        <div key={i} className={`h-2 rounded-full transition-all duration-300 ${i === step ? 'bg-indigo-600 w-8' : 'bg-slate-200 dark:bg-slate-700 w-2'}`} />
                    ))}
                </div>

                <div className="flex w-full gap-4">
                    <Button variant="ghost" className="flex-1" onClick={onComplete}>Skip Tour</Button>
                    <Button variant="primary" className="flex-1" onClick={handleNext} icon={step === steps.length - 1 ? undefined : ArrowRight}>
                        {step === steps.length - 1 ? "Get Started" : "Next"}
                    </Button>
                </div>
            </div>
        </Modal>
    );
};
