import React, { useState, useEffect, useRef } from 'react';
import { X, Minus, Send, Bot, ChevronDown, ArrowUpRight } from 'lucide-react';
import PatientEnquiryForm, { type PatientEnquiryFormData } from './PatientEnquiryForm';

interface ChatAssistantProps {
  isOpen: boolean;
  onClose: () => void;
}

type Message = {
  id: string;
  sender: 'bot' | 'user';
  text: string;
  isImage?: boolean;
};

type StepType = 'text' | 'number' | 'buttons' | 'select' | 'date' | 'textarea' | 'file';

interface Step {
  id: string;
  question: string;
  type: StepType;
  options?: string[];
  key: string;
}

const STEPS: Step[] = [
  { id: '1', question: 'May I know your full name?', type: 'text', key: 'fullName' },
  { id: '2', question: 'How old are you?', type: 'number', key: 'age' },
  { id: '3', question: 'What is your gender?', type: 'buttons', options: ['Male', 'Female', 'Other'], key: 'gender' },
  { id: '4', question: 'Please enter your mobile number.', type: 'number', key: 'mobile' },
  { id: '5', question: 'Email Address (Optional)', type: 'text', key: 'email' },
  { id: '6', question: 'Which city and state do you live in?', type: 'text', key: 'location' },
  { id: '7', question: 'Which cancer category best matches your concern?', type: 'select', options: ['Breast Cancer', 'Oral Cancer', 'Lung Cancer', 'Blood Cancer', 'Cervical Cancer', 'Other'], key: 'cancerType' },
  { id: '8', question: 'What type of help are you looking for?', type: 'select', options: ['Free Screening Camp', 'Doctor Consultation', 'Hospital Navigation', 'Treatment Support', 'General Enquiry'], key: 'helpType' },
  { id: '9', question: 'Which hospital would you prefer?', type: 'select', options: ['Apex Oncology Center', 'CareWell Memorial', 'City General Hospital', 'Any Available Hospital'], key: 'hospital' },
  { id: '10', question: 'Preferred Date', type: 'date', key: 'preferredDate' },
  { id: '11', question: 'Please briefly describe your symptoms or concern.', type: 'textarea', key: 'symptoms' },
  { id: '12', question: 'Upload Medical Reports (Optional)', type: 'file', key: 'reports' }
];

// PatientEnquiryForm only accepts fullName/age/gender/address/phone/symptoms
// -- the chat asks several extra questions (email, cancer type, help type,
// preferred hospital/date) that the quick form has no field for, so those
// are intentionally dropped here rather than silently discarding the six
// fields the form *does* have, which is what used to happen.
function mapChatDataToEnquiry(data: Record<string, string>): Partial<PatientEnquiryFormData> {
  return {
    fullName: data.fullName ?? '',
    age: data.age ?? '',
    gender: data.gender === 'Other' ? 'Others' : (data.gender ?? ''),
    phone: data.mobile ?? '',
    address: data.location ?? '',
    symptoms: data.symptoms ?? '',
  };
}

export default function ChatAssistant({ isOpen, onClose }: ChatAssistantProps) {
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentStepIndex, setCurrentStepIndex] = useState(-1);
  const [isTyping, setIsTyping] = useState(false);
  const [formData, setFormData] = useState<Record<string, string>>({});
  
  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [isFinished, setIsFinished] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      startConversation();
    }
  }, [isOpen]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const startConversation = () => {
    setIsTyping(true);
    setTimeout(() => {
      setMessages([
        {
          id: Date.now().toString(),
          sender: 'bot',
          text: '👋 Namaste!\n\nWelcome to Cancer Aware Bharat. I\'ll help you register your enquiry in less than 2 minutes.\n\nLet\'s begin.'
        }
      ]);
      setIsTyping(false);
      askNextQuestion(0);
    }, 1000);
  };

  const askNextQuestion = (index: number) => {
    if (index >= STEPS.length) {
      finishConversation();
      return;
    }
    setCurrentStepIndex(index);
    setIsTyping(true);
    setTimeout(() => {
      setMessages(prev => [
        ...prev,
        {
          id: Date.now().toString(),
          sender: 'bot',
          text: STEPS[index].question
        }
      ]);
      setIsTyping(false);
    }, 800);
  };

  const handleUserInput = (value: string) => {
    if (!value.trim() && STEPS[currentStepIndex].type !== 'file') return; // File can be skipped since it's optional

    const currentStep = STEPS[currentStepIndex];
    setFormData(prev => ({ ...prev, [currentStep.key]: value }));
    setInputValue('');

    setMessages(prev => [
      ...prev,
      {
        id: Date.now().toString(),
        sender: 'user',
        text: value || 'No file uploaded'
      }
    ]);

    // Handle personalized responses
    if (currentStep.key === 'fullName') {
      setIsTyping(true);
      setTimeout(() => {
        setMessages(prev => [
          ...prev,
          {
            id: Date.now().toString(),
            sender: 'bot',
            text: `Nice to meet you, ${value.split(' ')[0]}.`
          }
        ]);
        askNextQuestion(currentStepIndex + 1);
      }, 800);
    } else {
      askNextQuestion(currentStepIndex + 1);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleUserInput(inputValue);
    }
  };

  const finishConversation = () => {
    setIsFinished(true);
    setIsTyping(true);
    setTimeout(() => {
      setMessages(prev => [
        ...prev,
        {
          id: Date.now().toString(),
          sender: 'bot',
          text: '✅ Thank you.\n\nYour enquiry has been prepared. Click Submit to send it.'
        }
      ]);
      setIsTyping(false);
    }, 1000);
  };

  const handleFullClose = () => {
    onClose();
    // Reset state after transition
    setTimeout(() => {
      setMessages([]);
      setCurrentStepIndex(-1);
      setIsFinished(false);
      setFormData({});
      setIsMinimized(false);
    }, 300);
  };

  if (!isOpen) return null;

  const currentStep = currentStepIndex >= 0 && currentStepIndex < STEPS.length ? STEPS[currentStepIndex] : null;

  return (
    <div 
      className={`fixed z-[100] transition-all duration-500 ease-out flex flex-col shadow-2xl overflow-hidden
      ${isMinimized ? 'bottom-6 right-6 w-72 h-14 rounded-2xl cursor-pointer bg-primary text-white hover:bg-primary-container' 
        : 'bottom-0 right-0 w-full h-full md:bottom-6 md:right-6 md:w-[420px] md:h-[650px] md:rounded-[20px] bg-white border border-outline-variant/30'}`}
      style={{
        animation: 'slideUp 0.4s ease-out forwards'
      }}
    >
      {/* Header */}
      <div 
        onClick={() => isMinimized && setIsMinimized(false)}
        className="h-16 shrink-0 bg-primary flex items-center justify-between px-4 text-white shadow-sm cursor-pointer"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-sm shadow-inner">
            <Bot className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="font-outfit font-bold text-sm tracking-wide">Cancer Aware Bharat</h3>
            {!isMinimized && <p className="text-[11px] text-white/80 tracking-wider">Patient Navigation Assistant</p>}
          </div>
        </div>
        {!isMinimized && (
          <div className="flex items-center gap-2">
            <button onClick={(e) => { e.stopPropagation(); setIsMinimized(true); }} className="p-2 hover:bg-white/10 rounded-full transition-colors cursor-pointer" title="Minimize">
              <Minus className="w-4 h-4" />
            </button>
            <button onClick={(e) => { e.stopPropagation(); handleFullClose(); }} className="p-2 hover:bg-white/10 rounded-full transition-colors cursor-pointer" title="Close">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* Chat Area */}
      {!isMinimized && (
        <div className="flex-1 overflow-y-auto p-4 bg-slate-50 flex flex-col gap-4 scroll-smooth">
          {messages.map((msg, idx) => (
            <div 
              key={msg.id} 
              className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in`}
              style={{ animationDelay: '0.1s', animationFillMode: 'both' }}
            >
              {msg.sender === 'bot' && (
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mr-2 mt-1">
                  <Bot className="w-4.5 h-4.5 text-primary" />
                </div>
              )}
              <div className="flex flex-col gap-2 max-w-[80%]">
                <div 
                  className={`px-4 py-3 whitespace-pre-wrap text-[14px] leading-relaxed shadow-sm ${
                    msg.sender === 'user' 
                      ? 'bg-primary text-white rounded-2xl rounded-tr-sm' 
                      : 'bg-white text-slate-800 rounded-2xl rounded-tl-sm border border-slate-100'
                  }`}
                >
                  {msg.text}
                </div>
                {/* Proceed with Form Chip */}
                {msg.sender === 'bot' && msg.text === 'May I know your full name?' && !isFormOpen && (
                  <button
                    onClick={() => setIsFormOpen(true)}
                    className="group self-start px-4 py-2 bg-[#183A63] text-white rounded-full flex items-center justify-center gap-1.5 hover:-translate-y-0.5 hover:shadow-md transition-all duration-300 ease-out mt-1"
                  >
                    <span className="font-medium text-xs">Proceed with Form</span>
                    <ArrowUpRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                  </button>
                )}
              </div>
            </div>
          ))}
          
          {isTyping && (
            <div className="flex justify-start animate-fade-in">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mr-2">
                <Bot className="w-4.5 h-4.5 text-primary" />
              </div>
              <div className="px-5 py-4 bg-white rounded-2xl rounded-tl-sm border border-slate-100 shadow-sm flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      )}

      {/* Input Area */}
      {!isMinimized && !isTyping && currentStep && (
        <div className="shrink-0 p-4 bg-white border-t border-outline-variant/20 shadow-[0_-4px_16px_rgba(0,0,0,0.02)] animate-slide-up">
          {/* Text / Number Input */}
          {(currentStep.type === 'text' || currentStep.type === 'number') && (
            <div className="flex items-center gap-2 bg-slate-50 p-1.5 rounded-full border border-slate-200 focus-within:border-primary/50 focus-within:bg-white transition-all shadow-sm">
              <input
                type={currentStep.type === 'number' ? 'number' : 'text'}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Type your answer..."
                className="flex-1 bg-transparent px-4 py-2 text-sm outline-none placeholder:text-slate-400"
                autoFocus
              />
              <button 
                onClick={() => handleUserInput(inputValue)}
                disabled={!inputValue.trim() && currentStep.key !== 'email'}
                className="w-10 h-10 shrink-0 rounded-full bg-primary text-white flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed hover:bg-primary-container transition-colors cursor-pointer"
              >
                <Send className="w-4.5 h-4.5 ml-0.5" />
              </button>
            </div>
          )}

          {/* Buttons Input */}
          {currentStep.type === 'buttons' && (
            <div className="flex flex-wrap gap-2">
              {currentStep.options?.map(opt => (
                <button
                  key={opt}
                  onClick={() => handleUserInput(opt)}
                  className="px-4 py-2.5 rounded-xl border border-primary/20 bg-primary/5 text-primary text-sm font-semibold hover:bg-primary hover:text-white transition-all cursor-pointer"
                >
                  {opt}
                </button>
              ))}
            </div>
          )}

          {/* Select Input */}
          {currentStep.type === 'select' && (
            <div className="space-y-3">
              <div className="relative">
                <select 
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  className="w-full appearance-none bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary shadow-sm"
                >
                  <option value="" disabled>Select an option...</option>
                  {currentStep.options?.map(opt => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
              </div>
              <button
                onClick={() => handleUserInput(inputValue)}
                disabled={!inputValue}
                className="w-full py-3 rounded-xl bg-primary text-white text-sm font-bold disabled:opacity-50 hover:bg-primary-container transition-colors shadow-md"
              >
                Continue
              </button>
            </div>
          )}

          {/* Date Input */}
          {currentStep.type === 'date' && (
            <div className="flex items-center gap-2">
              <input
                type="date"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                className="flex-1 bg-slate-50 px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-primary focus:bg-white shadow-sm"
              />
              <button
                onClick={() => handleUserInput(inputValue)}
                disabled={!inputValue}
                className="w-12 h-12 shrink-0 rounded-xl bg-primary text-white flex items-center justify-center disabled:opacity-50 hover:bg-primary-container transition-colors shadow-md cursor-pointer"
              >
                <Send className="w-5 h-5 ml-0.5" />
              </button>
            </div>
          )}

          {/* Textarea Input */}
          {currentStep.type === 'textarea' && (
            <div className="space-y-3">
              <textarea
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Describe your concern briefly..."
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary focus:bg-white resize-none shadow-sm h-24"
                autoFocus
              />
              <button
                onClick={() => handleUserInput(inputValue)}
                disabled={!inputValue.trim()}
                className="w-full py-3 rounded-xl bg-primary text-white text-sm font-bold disabled:opacity-50 hover:bg-primary-container transition-colors shadow-md cursor-pointer"
              >
                Send Message
              </button>
            </div>
          )}

          {/* File upload isn't wired to anything real yet -- this used to fake
              an attachment by setting a hardcoded filename with no actual file
              behind it. Disclosing that honestly instead of pretending. */}
          {currentStep.type === 'file' && (
            <div className="space-y-3">
              <div className="border border-dashed border-slate-300 bg-slate-50 rounded-2xl p-5 text-center">
                <p className="text-sm text-slate-600">
                  Report uploads aren't available through this chat yet. Bring your reports to your appointment, or share them with our team after we contact you.
                </p>
              </div>
              <button
                onClick={() => handleUserInput('')}
                className="w-full py-3 rounded-xl bg-primary text-white text-sm font-bold hover:bg-primary-container transition-colors shadow-md cursor-pointer"
              >
                Continue
              </button>
            </div>
          )}
        </div>
      )}

      {/* Finished State */}
      {!isMinimized && !isTyping && isFinished && !isFormOpen && (
        <div className="shrink-0 p-4 bg-white border-t border-outline-variant/20 shadow-[0_-4px_16px_rgba(0,0,0,0.02)] animate-slide-up">
          <button
            onClick={() => setIsFormOpen(true)}
            className="w-full py-4 rounded-xl bg-secondary text-slate-900 text-[15px] font-extrabold hover:bg-[#FDB64D] transition-colors shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0 cursor-pointer"
          >
            Submit Enquiry
          </button>
        </div>
      )}

      <style>{`
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: scale(0.95) translateY(10px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }
        .animate-fade-in {
          animation: fadeIn 0.4s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .animate-slide-up {
          animation: slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1);
        }
      `}</style>

      {/* Integrated Smart Form -- prefilled with whatever the chat has
          collected so far, so the user never has to retype it. */}
      <PatientEnquiryForm
        isOpen={isFormOpen}
        initialData={mapChatDataToEnquiry(formData)}
        onClose={() => setIsFormOpen(false)}
      />
    </div>
  );
}
