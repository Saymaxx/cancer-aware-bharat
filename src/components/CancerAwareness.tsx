import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ChevronRight, Sparkles, Search as SearchIcon, Apple, Cigarette, 
  Dumbbell, Sun, Syringe, AlertTriangle, Activity, Info, Shield, 
  Heart, CheckCircle2, ChevronDown
} from 'lucide-react';

/* ─────────── Reveal Section ─────────── */
function RevealSection({ children, className = '', delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTimeout(() => setVisible(true), delay);
          observer.disconnect();
        }
      },
      { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [delay]);

  return (
    <div
      ref={ref}
      className={`transition-all duration-700 ease-out ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'} ${className}`}
    >
      {children}
    </div>
  );
}

// ────────────────────────────────────────────────────────
// DATA ARRAYS
// ────────────────────────────────────────────────────────

const CANCER_TYPES = [
  { title: 'Oral Cancer', desc: 'Often caused by tobacco use. Look for sores that do not heal or red/white patches in the mouth.', img: 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&q=80&w=400&h=300' },
  { title: 'Breast Cancer', desc: 'Early detection through regular self-exams and mammograms significantly improves survival rates.', img: 'https://images.unsplash.com/photo-1576671081837-49000212a370?auto=format&fit=crop&q=80&w=400&h=300' },
  { title: 'Cervical Cancer', desc: 'Highly preventable with the HPV vaccine and regular Pap smear screenings.', img: 'https://images.unsplash.com/photo-1579684453377-48ec05c6b30a?auto=format&fit=crop&q=80&w=400&h=300' },
  { title: 'Lung Cancer', desc: 'Primarily associated with smoking. Quitting tobacco dramatically reduces your risk over time.', img: 'https://images.unsplash.com/photo-1584362917165-526a968579e8?auto=format&fit=crop&q=80&w=400&h=300' },
  { title: 'Blood Cancer', desc: 'Includes leukemia and lymphoma. Watch for persistent fatigue, frequent infections, or easy bleeding.', img: 'https://images.unsplash.com/photo-1530026405186-ed1f139313f8?auto=format&fit=crop&q=80&w=400&h=300' },
];

const EARLY_SIGNS = [
  'Persistent fatigue or extreme tiredness',
  'Unexplained weight loss or gain',
  'Changes in bowel or bladder habits',
  'Unusual bleeding or discharge',
  'A sore that does not heal',
  'A thickening or lump in the breast or elsewhere',
  'Indigestion or difficulty swallowing',
  'Obvious change in a wart or mole',
  'Nagging cough or hoarseness',
];

const RISK_FACTORS = [
  { icon: Cigarette, title: 'Tobacco Use', desc: 'Smoking and chewing tobacco are the leading preventable causes of cancer worldwide.' },
  { icon: Activity, title: 'Diet & Physical Activity', desc: 'High-fat diets, processed meats, and lack of exercise contribute to an increased risk.' },
  { icon: Sun, title: 'Sun Exposure', desc: 'Excessive UV radiation without protection can lead to skin cancers like melanoma.' },
  { icon: Shield, title: 'Genetics', desc: 'A family history of cancer may indicate an inherited genetic mutation.' },
];

const LIFESTYLE_TIPS = [
  { title: 'Eat a Plant-Based Diet', desc: 'Fill your plate with vegetables, fruits, and whole grains.' },
  { title: 'Limit Alcohol', desc: 'If you choose to drink alcohol, do so in moderation.' },
  { title: 'Maintain a Healthy Weight', desc: 'Keeping a healthy BMI can lower the risk of various cancers.' },
  { title: 'Manage Stress', desc: 'Practice mindfulness, meditation, or yoga to support immune health.' },
];

const FAQS = [
  { q: 'At what age should I start cancer screenings?', a: 'It varies by cancer type. Generally, women should begin cervical screenings at 21 and mammograms around 40-50. Both men and women should begin colon cancer screenings at 45. Discuss your family history with your doctor for a personalized plan.' },
  { q: 'Are all tumors cancerous?', a: 'No, tumors can be benign (non-cancerous) or malignant (cancerous). Biopsies are required to determine the exact nature of a tumor.' },
  { q: 'Is cancer always genetic?', a: 'No. While about 5-10% of cancers are strongly linked to inherited genetic mutations, the vast majority are caused by genetic changes that occur throughout a person’s lifetime as a result of aging and environmental exposures.' },
  { q: 'How effective is early detection?', a: 'Early detection is one of the most powerful tools in cancer care. When found early, many cancers are highly treatable and even curable.' },
];

// ────────────────────────────────────────────────────────
// COMPONENT
// ────────────────────────────────────────────────────────

export default function CancerAwareness() {
  const navigate = useNavigate();
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="bg-surface min-h-screen">
      
      {/* 1. HERO BANNER */}
      <section className="relative h-[350px] md:h-[450px] w-full flex items-center justify-center overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: 'url(/events/event-1.jpeg)' }}
        />
        <div className="absolute inset-0 bg-neutral-950/70" />

        <div className="relative z-10 text-center space-y-4 px-4">
          <div className="flex items-center justify-center gap-2 text-[11px] sm:text-[13px] font-bold tracking-widest uppercase text-white/80">
            <span onClick={() => navigate('/')} className="hover:text-white cursor-pointer transition-colors">Home</span>
            <ChevronRight className="w-3.5 h-3.5 text-secondary" />
            <span className="text-secondary">Cancer Awareness</span>
          </div>

          <h1 className="font-outfit text-4xl sm:text-5xl md:text-6xl font-black text-white drop-shadow-lg tracking-tight">
            Cancer <span className="text-secondary">Awareness</span>
          </h1>
          <p className="text-white/90 text-sm sm:text-base font-medium max-w-xl mx-auto">
            Learn, Prevent, Detect Early
          </p>
        </div>
      </section>

      {/* 2. INTRODUCTION */}
      <section className="py-16 md:py-20 bg-white">
        <div className="section-container max-w-4xl text-center">
          <RevealSection>
            <h2 className="font-outfit text-3xl md:text-4xl font-bold text-slate-900 mb-6">
              Knowledge is the First Step to Prevention
            </h2>
            <p className="text-slate-600 text-lg leading-relaxed">
              At Cancer Aware Bharat, we believe that education empowers individuals to make proactive health decisions. Understanding the risks, recognizing early symptoms, and adopting a healthy lifestyle can significantly reduce the impact of cancer.
            </p>
          </RevealSection>
        </div>
      </section>

      {/* 3. CANCER PREVENTION TIPS (Moved from Home Page) */}
      <section className="gradient-section py-16 md:py-20">
        <div className="section-container">
          <RevealSection>
            <div className="section-header">
              <span className="section-badge"><Sparkles className="w-3 h-3" /> Prevention First</span>
              <h2 className="section-title text-2xl md:text-3xl">Cancer Prevention Tips</h2>
              <p className="section-subtitle">Simple lifestyle changes can significantly reduce your cancer risk.</p>
            </div>
          </RevealSection>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-5">
            {[
              { icon: SearchIcon, title: 'Regular Screening', desc: 'Schedule annual checkups and age-appropriate cancer screenings', color: 'text-primary bg-primary/10' },
              { icon: Apple, title: 'Healthy Diet', desc: 'Eat fruits, vegetables, and whole grains. Limit processed foods', color: 'text-primary bg-primary/10' },
              { icon: Cigarette, title: 'Avoid Tobacco', desc: 'Quit smoking and chewing tobacco — the #1 preventable cause', color: 'text-secondary bg-secondary/10' },
              { icon: Dumbbell, title: 'Stay Active', desc: 'Exercise 30 minutes daily to lower your cancer risk significantly', color: 'text-primary bg-primary/10' },
              { icon: Sun, title: 'Sun Protection', desc: 'Use sunscreen and protective clothing when outdoors', color: 'text-secondary bg-secondary/10' },
              { icon: Syringe, title: 'Get Vaccinated', desc: 'HPV and Hepatitis B vaccines can prevent certain cancers', color: 'text-primary bg-primary/10' },
            ].map((tip, i) => (
              <RevealSection key={i} delay={i * 80}>
                <div className="card-subtle p-5 md:p-6 h-full">
                  <div className={`w-11 h-11 rounded-xl ${tip.color} flex items-center justify-center mb-4`}>
                    <tip.icon className="w-5 h-5" />
                  </div>
                  <h3 className="font-outfit font-bold text-on-surface text-sm mb-1.5">{tip.title}</h3>
                  <p className="text-xs text-on-surface-variant leading-relaxed">{tip.desc}</p>
                </div>
              </RevealSection>
            ))}
          </div>
        </div>
      </section>

      {/* 4. TYPES OF CANCER */}
      <section className="py-16 md:py-20 bg-white">
        <div className="section-container">
          <RevealSection>
            <div className="section-header">
              <span className="section-badge"><Activity className="w-3 h-3" /> Common Cancers</span>
              <h2 className="section-title text-2xl md:text-3xl">Types of Cancer We Address</h2>
              <p className="section-subtitle">Understanding specific cancers helps in targeting early prevention and screenings.</p>
            </div>
          </RevealSection>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {CANCER_TYPES.map((type, i) => (
              <RevealSection key={i} delay={i * 100}>
                <div className="card-premium h-full overflow-hidden flex flex-col group">
                  <div className="h-48 overflow-hidden">
                    <img src={type.img} alt={type.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                  </div>
                  <div className="p-6 flex-1 flex flex-col">
                    <h3 className="font-outfit font-bold text-lg text-slate-900 mb-2">{type.title}</h3>
                    <p className="text-sm text-slate-600 leading-relaxed flex-1">{type.desc}</p>
                  </div>
                </div>
              </RevealSection>
            ))}
          </div>
        </div>
      </section>

      {/* 5. EARLY WARNING SIGNS & 6. RISK FACTORS */}
      <section className="py-16 md:py-20 bg-slate-50">
        <div className="section-container">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16">
            
            {/* Early Signs */}
            <RevealSection>
              <div className="bg-white rounded-3xl p-8 border border-outline-variant/30 shadow-sm h-full">
                <div className="w-12 h-12 rounded-xl bg-secondary/10 text-secondary flex items-center justify-center mb-6">
                  <AlertTriangle className="w-6 h-6" />
                </div>
                <h3 className="font-outfit text-2xl font-bold text-slate-900 mb-6">Early Warning Signs</h3>
                <ul className="space-y-4">
                  {EARLY_SIGNS.map((sign, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <div className="mt-1 flex-shrink-0">
                        <CheckCircle2 className="w-5 h-5 text-secondary" />
                      </div>
                      <span className="text-slate-700 font-medium">{sign}</span>
                    </li>
                  ))}
                </ul>
                <p className="mt-6 text-xs text-slate-500 italic">
                  *If you experience any of these symptoms persistently for more than two weeks, please consult a physician.
                </p>
              </div>
            </RevealSection>

            {/* Risk Factors */}
            <RevealSection delay={200}>
              <div className="space-y-8">
                <div>
                  <span className="section-badge mb-3"><Shield className="w-3 h-3" /> Be Aware</span>
                  <h3 className="font-outfit text-2xl font-bold text-slate-900 mb-2">Common Risk Factors</h3>
                  <p className="text-slate-600">While you cannot change all risk factors, knowing them empowers you to modify the ones you can.</p>
                </div>
                
                <div className="space-y-4">
                  {RISK_FACTORS.map((risk, i) => (
                    <div key={i} className="bg-white p-5 rounded-2xl border border-outline-variant/30 shadow-sm flex items-start gap-4">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center flex-shrink-0">
                        <risk.icon className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-900 mb-1">{risk.title}</h4>
                        <p className="text-sm text-slate-600">{risk.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </RevealSection>

          </div>
        </div>
      </section>

      {/* 7. HEALTHY LIFESTYLE TIPS */}
      <section className="py-16 md:py-20 bg-primary text-white relative overflow-hidden">
        {/* Background Accent */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-white/5 rounded-full filter blur-[80px]" />
        
        <div className="section-container relative z-10">
          <RevealSection>
            <div className="text-center max-w-2xl mx-auto mb-12">
              <Heart className="w-10 h-10 text-secondary mx-auto mb-4" />
              <h2 className="font-outfit text-3xl md:text-4xl font-bold mb-4">Healthy Lifestyle Tips</h2>
              <p className="text-white/80">A healthy lifestyle is your strongest defense.</p>
            </div>
          </RevealSection>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {LIFESTYLE_TIPS.map((tip, i) => (
              <RevealSection key={i} delay={i * 100}>
                <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/10 h-full hover:bg-white/15 transition-all">
                  <h3 className="font-bold text-secondary text-lg mb-2">{tip.title}</h3>
                  <p className="text-sm text-white/90 leading-relaxed">{tip.desc}</p>
                </div>
              </RevealSection>
            ))}
          </div>
        </div>
      </section>

      {/* 8. FAQS */}
      <section className="py-16 md:py-20 bg-white">
        <div className="section-container max-w-3xl">
          <RevealSection>
            <div className="text-center mb-12">
              <h2 className="font-outfit text-3xl font-bold text-slate-900 mb-4">Frequently Asked Questions</h2>
              <p className="text-slate-600">Common questions about cancer prevention and screening.</p>
            </div>
          </RevealSection>

          <div className="space-y-4">
            {FAQS.map((faq, i) => (
              <RevealSection key={i} delay={i * 50}>
                <div className="border border-outline-variant/30 rounded-2xl overflow-hidden bg-surface-container-lowest">
                  <button
                    onClick={() => setOpenFaq(openFaq === i ? null : i)}
                    className="w-full px-6 py-5 flex items-center justify-between text-left focus:outline-none hover:bg-surface-container-low transition-colors"
                  >
                    <span className="font-bold text-on-surface text-[15px] pr-4">{faq.q}</span>
                    <ChevronDown className={`w-5 h-5 text-primary transition-transform duration-300 shrink-0 ${openFaq === i ? 'rotate-180' : ''}`} />
                  </button>
                  <div className={`overflow-hidden transition-all duration-300 ease-in-out ${openFaq === i ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}>
                    <div className="px-6 pb-5 text-sm text-on-surface-variant leading-relaxed">
                      {faq.a}
                    </div>
                  </div>
                </div>
              </RevealSection>
            ))}
          </div>
        </div>
      </section>

      {/* 9. CALL TO ACTION */}
      <section className="py-16 md:py-20 bg-slate-900 text-white text-center">
        <div className="section-container max-w-3xl">
          <RevealSection>
            <h2 className="font-outfit text-3xl md:text-4xl font-bold mb-6">Take Action Today</h2>
            <p className="text-slate-300 text-lg mb-10">
              Join hands with Cancer Aware Bharat to spread awareness in your community or register for an upcoming screening camp.
            </p>
            <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
              <button 
                onClick={() => navigate('/join-us')}
                className="w-full sm:w-auto bg-secondary hover:bg-white text-primary font-bold px-8 py-4 rounded-xl transition-all shadow-lg hover:-translate-y-1"
              >
                Become a Volunteer
              </button>
              <button 
                onClick={() => navigate('/events')}
                className="w-full sm:w-auto bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold px-8 py-4 rounded-xl transition-all shadow-lg hover:-translate-y-1"
              >
                Book Awareness Camp
              </button>
            </div>
          </RevealSection>
        </div>
      </section>

    </div>
  );
}
