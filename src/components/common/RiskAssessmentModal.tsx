import React, { useState } from 'react';
import { 
  X, AlertTriangle, ShieldCheck, ChevronRight, ChevronLeft, 
  HeartHandshake, Phone, ArrowRight, Activity, CheckCircle2, 
  Sparkles, RefreshCw, FileText, Stethoscope, MapPin
} from 'lucide-react';
import { useNavigate } from 'react-router';

interface RiskAssessmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenEnquiry?: () => void;
}

interface AssessmentAnswers {
  primaryArea: string;
  symptoms: string[];
  duration: string;
  tobaccoExposure: string;
  familyHistory: string;
  ageGroup: string;
}

export default function RiskAssessmentModal({ isOpen, onClose, onOpenEnquiry }: RiskAssessmentModalProps) {
  const navigate = useNavigate();
  const [step, setStep] = useState<number>(1);
  const [answers, setAnswers] = useState<AssessmentAnswers>({
    primaryArea: '',
    symptoms: [],
    duration: '',
    tobaccoExposure: '',
    familyHistory: '',
    ageGroup: ''
  });

  if (!isOpen) return null;

  const handleToggleSymptom = (sym: string) => {
    setAnswers(prev => {
      const exists = prev.symptoms.includes(sym);
      return {
        ...prev,
        symptoms: exists ? prev.symptoms.filter(s => s !== sym) : [...prev.symptoms, sym]
      };
    });
  };

  const handleReset = () => {
    setStep(1);
    setAnswers({
      primaryArea: '',
      symptoms: [],
      duration: '',
      tobaccoExposure: '',
      familyHistory: '',
      ageGroup: ''
    });
  };

  // Calculate Risk Level
  const calculateRisk = () => {
    let score = 0;
    if (answers.duration === 'more_than_month' || answers.duration === '2_to_4_weeks') score += 2;
    if (answers.tobaccoExposure === 'daily' || answers.tobaccoExposure === 'past_heavy') score += 2;
    if (answers.familyHistory === 'first_degree') score += 2;
    if (answers.ageGroup === 'above_50' || answers.ageGroup === '40_to_50') score += 1;
    score += answers.symptoms.length * 1.5;

    if (score >= 6) return 'high';
    if (score >= 3) return 'moderate';
    return 'low';
  };

  const riskLevel = calculateRisk();

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-[fadeIn_0.2s_ease-out]">
      <div className="relative bg-[#FAFCF8] w-full max-w-2xl rounded-3xl shadow-2xl border border-[#0E3B36]/20 overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Header */}
        <div className="bg-[#0E3B36] px-6 sm:px-8 py-5 flex justify-between items-center text-white">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center text-[#E8A23A]">
              <Stethoscope className="w-4.5 h-4.5" />
            </div>
            <div>
              <h2 className="font-serif text-lg sm:text-xl font-normal text-white">Early Detection Self-Assessment</h2>
              <p className="text-[10px] text-white/70 font-sans">प्राथमिक लक्षण व जोखिम मूल्यांकन सहायक</p>
            </div>
          </div>
          
          <button 
            onClick={onClose} 
            className="text-white/80 hover:text-white p-1 rounded-full cursor-pointer transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Progress Bar */}
        {step <= 3 && (
          <div className="bg-[#EEF3EF] px-6 sm:px-8 py-3 border-b border-[#0E3B36]/10 flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-bold text-[#0E3B36]">
              <span>Step {step} of 3</span>
              <span className="text-[#1B2620]/40">•</span>
              <span className="text-[#1B2620]/70 font-normal">
                {step === 1 ? 'Primary Health Concern' : step === 2 ? 'Symptoms & Duration' : 'Risk & Family Profile'}
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              {[1, 2, 3].map((s) => (
                <div 
                  key={s} 
                  className={`h-2 rounded-full transition-all ${
                    s === step ? 'w-8 bg-[#0E3B36]' : s < step ? 'w-4 bg-[#7C9A82]' : 'w-2 bg-[#0E3B36]/20'
                  }`} 
                />
              ))}
            </div>
          </div>
        )}

        {/* Modal Body */}
        <div className="p-6 sm:p-8 overflow-y-auto flex-grow space-y-6">
          
          {/* STEP 1: Primary Focus Area */}
          {step === 1 && (
            <div className="space-y-5 animate-[fadeIn_0.2s_ease-out]">
              <div className="space-y-1">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#C8443C]">Step 1: Focus Area</span>
                <h3 className="font-serif text-xl sm:text-2xl font-normal text-[#0E3B36]">
                  What area would you like to assess today?
                </h3>
                <p className="text-xs text-[#1B2620]/70">
                  Select the anatomical area or health concern that is concerning you or your loved one.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {[
                  { id: 'oral', title: 'Mouth / Oral / Throat', desc: 'Sores, white/red patches, swallowing trouble', icon: '👄' },
                  { id: 'breast', title: 'Breast / Women\'s Health', desc: 'Lump, skin change, nipple discharge', icon: '🌸' },
                  { id: 'gastro', title: 'Stomach / Bowel / Digestion', desc: 'Rapid weight loss, persistent pain, blood in stool', icon: '🩺' },
                  { id: 'general', title: 'General / Unexplained Symptoms', desc: 'Fatigue, swollen lymph nodes, chronic cough', icon: '🛡️' }
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setAnswers(prev => ({ ...prev, primaryArea: item.id }))}
                    className={`p-4 rounded-2xl border text-left transition-all cursor-pointer flex items-start gap-3.5 ${
                      answers.primaryArea === item.id
                        ? 'bg-white border-[#0E3B36] ring-2 ring-[#0E3B36]/20 shadow-md'
                        : 'bg-white/60 border-[#0E3B36]/12 hover:border-[#0E3B36]/40 hover:bg-white'
                    }`}
                  >
                    <span className="text-2xl">{item.icon}</span>
                    <div>
                      <h4 className="font-bold text-xs sm:text-sm text-[#0E3B36]">{item.title}</h4>
                      <p className="text-[11px] text-[#1B2620]/65 mt-0.5">{item.desc}</p>
                    </div>
                  </button>
                ))}
              </div>

              <div className="space-y-2 pt-2">
                <label className="block text-xs font-bold text-[#0E3B36]">
                  Age Group of the Patient
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    { id: 'under_30', label: 'Under 30 yrs' },
                    { id: '30_to_40', label: '30 - 40 yrs' },
                    { id: '40_to_50', label: '40 - 50 yrs' },
                    { id: 'above_50', label: 'Above 50 yrs' }
                  ].map((a) => (
                    <button
                      key={a.id}
                      onClick={() => setAnswers(prev => ({ ...prev, ageGroup: a.id }))}
                      className={`py-2 px-3 rounded-xl border text-xs font-semibold cursor-pointer transition-all ${
                        answers.ageGroup === a.id
                          ? 'bg-[#0E3B36] text-white border-[#0E3B36]'
                          : 'bg-white border-[#0E3B36]/15 text-[#1B2620]/80 hover:bg-[#EEF3EF]'
                      }`}
                    >
                      {a.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: Symptoms & Duration */}
          {step === 2 && (
            <div className="space-y-5 animate-[fadeIn_0.2s_ease-out]">
              <div className="space-y-1">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#C8443C]">Step 2: Specific Symptoms</span>
                <h3 className="font-serif text-xl sm:text-2xl font-normal text-[#0E3B36]">
                  Check all symptoms currently observed
                </h3>
                <p className="text-xs text-[#1B2620]/70">
                  Select any warning signals that have been persistently noticeable.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {[
                  'Painless lump or thickening in tissue',
                  'Sore or ulcer that does not heal within 2 weeks',
                  'Unexplained rapid weight loss (5+ kg)',
                  'Persistent bleeding or unusual discharge',
                  'Difficulty swallowing or chronic throat soreness',
                  'Nagging cough or hoarseness lasting > 3 weeks',
                  'Noticeable change in size or color of a mole',
                  'Persistent extreme fatigue & weakness'
                ].map((symptom) => {
                  const isChecked = answers.symptoms.includes(symptom);
                  return (
                    <div
                      key={symptom}
                      onClick={() => handleToggleSymptom(symptom)}
                      className={`p-3 rounded-xl border flex items-start gap-2.5 cursor-pointer transition-all text-xs font-medium ${
                        isChecked
                          ? 'bg-white border-[#0E3B36] text-[#0E3B36] font-bold shadow-xs'
                          : 'bg-white/60 border-[#0E3B36]/12 text-[#1B2620]/80 hover:bg-white'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => {}}
                        className="mt-0.5 w-4 h-4 text-[#0E3B36] rounded focus:ring-[#0E3B36]"
                      />
                      <span>{symptom}</span>
                    </div>
                  );
                })}
              </div>

              <div className="space-y-2 pt-2">
                <label className="block text-xs font-bold text-[#0E3B36]">
                  How long have these symptoms persisted?
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {[
                    { id: 'less_than_2_weeks', label: 'Less than 2 weeks' },
                    { id: '2_to_4_weeks', label: '2 to 4 weeks' },
                    { id: 'more_than_month', label: 'More than a month' }
                  ].map((d) => (
                    <button
                      key={d.id}
                      onClick={() => setAnswers(prev => ({ ...prev, duration: d.id }))}
                      className={`py-2.5 px-3 rounded-xl border text-xs font-semibold cursor-pointer transition-all ${
                        answers.duration === d.id
                          ? 'bg-[#0E3B36] text-white border-[#0E3B36]'
                          : 'bg-white border-[#0E3B36]/15 text-[#1B2620]/80 hover:bg-[#EEF3EF]'
                      }`}
                    >
                      {d.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: Lifestyle & Family History */}
          {step === 3 && (
            <div className="space-y-5 animate-[fadeIn_0.2s_ease-out]">
              <div className="space-y-1">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#C8443C]">Step 3: Risk Factors</span>
                <h3 className="font-serif text-xl sm:text-2xl font-normal text-[#0E3B36]">
                  Habits & Family Health Profile
                </h3>
                <p className="text-xs text-[#1B2620]/70">
                  This helps determine if environmental or hereditary factors heighten clinical priority.
                </p>
              </div>

              <div className="space-y-3">
                <label className="block text-xs font-bold text-[#0E3B36]">
                  Tobacco / Bidi / Gutkha / Khaini Exposure
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {[
                    { id: 'none', label: 'Never Used / Non-User' },
                    { id: 'past_heavy', label: 'Past User (Quit recently)' },
                    { id: 'daily', label: 'Active Daily User' }
                  ].map((t) => (
                    <button
                      key={t.id}
                      onClick={() => setAnswers(prev => ({ ...prev, tobaccoExposure: t.id }))}
                      className={`p-3 rounded-xl border text-xs font-semibold cursor-pointer transition-all ${
                        answers.tobaccoExposure === t.id
                          ? 'bg-[#0E3B36] text-white border-[#0E3B36]'
                          : 'bg-white border-[#0E3B36]/15 text-[#1B2620]/80 hover:bg-[#EEF3EF]'
                      }`}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <label className="block text-xs font-bold text-[#0E3B36]">
                  Family History of Cancer
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {[
                    { id: 'none', label: 'No known family history' },
                    { id: 'distant', label: 'Extended relatives (Aunts/Uncles)' },
                    { id: 'first_degree', label: 'Immediate (Parents/Siblings)' }
                  ].map((f) => (
                    <button
                      key={f.id}
                      onClick={() => setAnswers(prev => ({ ...prev, familyHistory: f.id }))}
                      className={`p-3 rounded-xl border text-xs font-semibold cursor-pointer transition-all ${
                        answers.familyHistory === f.id
                          ? 'bg-[#0E3B36] text-white border-[#0E3B36]'
                          : 'bg-white border-[#0E3B36]/15 text-[#1B2620]/80 hover:bg-[#EEF3EF]'
                      }`}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* STEP 4: Assessment Results & Next Steps */}
          {step === 4 && (
            <div className="space-y-6 animate-[fadeIn_0.3s_ease-out]">
              
              {/* Risk Level Badge Box */}
              <div className={`p-6 rounded-3xl border ${
                riskLevel === 'high'
                  ? 'bg-[#C8443C]/10 border-[#C8443C]/30 text-[#C8443C]'
                  : riskLevel === 'moderate'
                  ? 'bg-[#E8A23A]/15 border-[#E8A23A]/40 text-[#8B5E00]'
                  : 'bg-[#7C9A82]/15 border-[#7C9A82]/30 text-[#0E3B36]'
              }`}>
                <div className="flex items-center gap-3">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-bold ${
                    riskLevel === 'high' ? 'bg-[#C8443C] text-white' : riskLevel === 'moderate' ? 'bg-[#E8A23A] text-[#1B2620]' : 'bg-[#0E3B36] text-white'
                  }`}>
                    {riskLevel === 'high' ? <AlertTriangle className="w-6 h-6" /> : riskLevel === 'moderate' ? <Activity className="w-6 h-6" /> : <ShieldCheck className="w-6 h-6" />}
                  </div>

                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider">Clinical Assessment Result</span>
                    <h3 className="font-serif text-xl sm:text-2xl font-normal leading-tight">
                      {riskLevel === 'high'
                        ? 'High Clinical Priority — Doctor Consultation Advised'
                        : riskLevel === 'moderate'
                        ? 'Moderate Risk — Follow-up Screening Recommended'
                        : 'Low Immediate Risk — Maintain Routine Prevention'}
                    </h3>
                  </div>
                </div>

                <p className="text-xs sm:text-sm text-[#1B2620]/80 mt-4 leading-relaxed font-sans">
                  {riskLevel === 'high'
                    ? 'Based on persistent symptoms and risk factors provided, we strongly urge you not to delay medical examination. A clinical biopsy, endoscopy, or mammogram at a verified oncology center can rule out or catch conditions in their early curable stage.'
                    : riskLevel === 'moderate'
                    ? 'Your reported symptoms or risk profile suggest you should undergo a preventive checkup at an upcoming free screening camp or partner hospital within the next 2-3 weeks.'
                    : 'Your reported symptoms currently show low acute indicators. We recommend continuing annual preventive screenings, maintaining a healthy lifestyle, and staying tobacco-free.'}
                </p>
              </div>

              {/* Actionable Next Steps Bento */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div className="bg-white p-5 rounded-2xl border border-[#0E3B36]/12 space-y-2 shadow-xs">
                  <div className="flex items-center gap-2 text-xs font-bold text-[#0E3B36]">
                    <Phone className="w-4 h-4 text-[#E8A23A]" />
                    <span>Free National Companion Helpline</span>
                  </div>
                  <p className="text-xs text-[#1B2620]/75">
                    Speak confidentially with our certified caseworkers for free guidance on local hospital nodes.
                  </p>
                  <a
                    href="tel:+919120110286"
                    className="inline-block font-mono font-bold text-sm text-[#0E3B36] hover:underline"
                  >
                    +91-9120110286 (Helpline)
                  </a>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-[#0E3B36]/12 space-y-2 shadow-xs">
                  <div className="flex items-center gap-2 text-xs font-bold text-[#0E3B36]">
                    <MapPin className="w-4 h-4 text-[#C8443C]" />
                    <span>Locate Partner Oncology Centers</span>
                  </div>
                  <p className="text-xs text-[#1B2620]/75">
                    Find NABH-accredited cancer hospitals offering subsidized slots in your district.
                  </p>
                  <button
                    onClick={() => {
                      onClose();
                      navigate('/hospitals');
                    }}
                    className="text-xs font-bold text-[#0E3B36] hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    Browse 32+ Hospitals <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Fast Track Consultation CTA */}
              <div className="p-5 rounded-2xl bg-[#0E3B36] text-white flex flex-col sm:flex-row items-center justify-between gap-4">
                <div>
                  <h4 className="font-serif text-base font-normal">Need Fast-Track Assistance?</h4>
                  <p className="text-xs text-white/75 mt-0.5">Submit an enquiry and our clinical desk will reach out within 4 hours.</p>
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <button
                    onClick={() => {
                      onClose();
                      if (onOpenEnquiry) onOpenEnquiry();
                    }}
                    className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-[#E8A23A] hover:bg-[#D49129] text-[#1B2620] font-bold text-xs shadow-md transition-all cursor-pointer whitespace-nowrap"
                  >
                    Request Callback
                  </button>
                  
                  <button
                    onClick={handleReset}
                    className="p-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white cursor-pointer"
                    title="Retake Assessment"
                  >
                    <RefreshCw className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <p className="text-[10px] text-[#1B2620]/60 text-center italic">
                Disclaimer: This self-assessment wizard is an educational tool and does NOT substitute professional medical diagnosis by a qualified oncologist.
              </p>
            </div>
          )}

        </div>

        {/* Modal Footer Controls */}
        <div className="bg-[#EEF3EF] px-6 sm:px-8 py-4 border-t border-[#0E3B36]/10 flex items-center justify-between">
          {step > 1 && step <= 3 ? (
            <button
              onClick={() => setStep(step - 1)}
              className="inline-flex items-center gap-1 text-xs font-bold text-[#0E3B36] hover:bg-white px-3.5 py-2 rounded-xl transition-all cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" /> Back
            </button>
          ) : step === 4 ? (
            <button
              onClick={handleReset}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-[#0E3B36] hover:bg-white px-3.5 py-2 rounded-xl transition-all cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" /> Start Over
            </button>
          ) : (
            <div />
          )}

          {step < 3 ? (
            <button
              onClick={() => setStep(step + 1)}
              disabled={step === 1 && !answers.primaryArea}
              className="inline-flex items-center gap-1.5 text-xs font-bold bg-[#0E3B36] hover:bg-[#0E3B36]/90 disabled:opacity-40 text-white px-5 py-2.5 rounded-xl transition-all cursor-pointer shadow-sm"
            >
              <span>Next Step</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          ) : step === 3 ? (
            <button
              onClick={() => setStep(4)}
              className="inline-flex items-center gap-1.5 text-xs font-bold bg-[#C8443C] hover:bg-[#B23831] text-white px-6 py-2.5 rounded-xl transition-all cursor-pointer shadow-md"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Generate Clinical Guidance</span>
            </button>
          ) : (
            <button
              onClick={onClose}
              className="px-6 py-2.5 rounded-xl bg-[#0E3B36] text-white font-bold text-xs cursor-pointer"
            >
              Close
            </button>
          )}
        </div>

      </div>
    </div>
  );
}
