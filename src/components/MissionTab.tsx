import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Target, ShieldAlert, HeartPulse, GraduationCap, GitFork, Tent,
  Clock, Eye, Sparkles, CheckCircle2, ArrowRight, HeartHandshake,
  Users, MapPin, Activity, Stethoscope, ChevronRight, Award, Shield, FileText
} from 'lucide-react';
import PremiumSection from './common/PremiumSection';

interface MissionTabProps {
  onOpenVolunteer: () => void;
  onOpenEnquiry: () => void;
}

export default function MissionTab({ onOpenVolunteer, onOpenEnquiry }: MissionTabProps) {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'hindi' | 'english'>('hindi');

  const objectives = [
    {
      icon: ShieldAlert,
      titleHi: 'कैंसर के संभावित चेतावनी संकेतों की जागरूकता',
      titleEn: 'Cancer Warning Signs Awareness',
      descHi: 'समुदाय स्तर पर स्तन, मुख (oral), गर्भाशय ग्रीवा और अन्य कैंसर के शुरुआती लक्षणों के प्रति व्यापक जनजागरूकता फैलाना।',
      descEn: 'Spreading wide awareness on early warning signs of breast, oral, cervical and organ cancers at the village level.',
      color: 'text-secondary bg-secondary/10 border-secondary/20'
    },
    {
      icon: HeartPulse,
      titleHi: 'सामान्य व महिला स्वास्थ्य शिक्षा',
      titleEn: 'Women & Lifestyle Health Education',
      descHi: 'महिला स्वास्थ्य, स्वच्छता, तंबाकू निषेध और पोषण से जुड़े जोखिमों पर नियमित ग्रामीण शिक्षा सत्र एवं काउंसलिंग प्रदान करना।',
      descEn: 'Providing regular rural education sessions and counseling on women health, hygiene, tobacco cessation, and diet risks.',
      color: 'text-rose-500 bg-rose-500/10 border-rose-500/20'
    },
    {
      icon: GraduationCap,
      titleHi: 'स्वयंसेवक व फर्स्ट ऐड प्रशिक्षण',
      titleEn: 'Volunteer First Aid & Safety Training',
      descHi: 'प्रशिक्षित कर्मियों एवं स्वयंसेवकों को प्राथमिक सहायता (First Aid), मरीज सुरक्षा और जिम्मेदार रेफरल जागरूकता में प्रशिक्षित करना।',
      descEn: 'Training grassroot volunteers and caseworkers in First Aid protocols, patient safety standards, and referral scope.',
      color: 'text-indigo-500 bg-indigo-500/10 border-indigo-500/20'
    },
    {
      icon: GitFork,
      titleHi: 'स्पष्ट रेफरल पाथवे विकास',
      titleEn: 'Clear Referral Pathways Development',
      descHi: 'गंभीर या संदिग्ध मरीजों को प्राथमिक केंद्र से सही ऑन्कोलॉजी अस्पताल तक पहुँचाने के लिए स्पष्ट और पारदर्शी रेफरल नेटवर्क तैयार करना।',
      descEn: 'Developing clear, transparent referral channels connecting rural screening nodes with accredited oncology hospitals.',
      color: 'text-primary bg-primary/10 border-primary/20'
    },
    {
      icon: Tent,
      titleHi: 'ग्रामीण स्वास्थ्य शिविर आयोजन',
      titleEn: 'Rural Health Camps & Workshops',
      descHi: 'गाँव और समुदाय स्तर पर विशेषज्ञ डॉक्टरों के मार्गदर्शन में निःशुल्क मोबाइल जांच शिविर और स्वास्थ्य जागरूकता कार्यक्रम संचालित करना।',
      descEn: 'Operating free mobile screening camps and wellness workshops in rural villages under expert medical guidance.',
      color: 'text-primary bg-primary/10 border-primary/20'
    },
    {
      icon: Clock,
      titleHi: 'फॉलो-अप कोऑर्डिनेशन सिस्टम',
      titleEn: 'Patient Follow-up Coordination',
      descHi: 'रेफर किए गए मरीजों के लिए अस्पताल अपॉइंटमेंट, जांच रिपोर्ट और आगे के उपचार में उपलब्ध व्यवस्था अनुसार निरंतर फॉलो-अप सहयोग देना।',
      descEn: 'Providing continuous follow-up coordination for hospital appointments, diagnostic reports, and ongoing therapy support.',
      color: 'text-purple-500 bg-purple-500/10 border-purple-500/20'
    }
  ];

  const referralSteps = [
    {
      step: '01',
      titleHi: 'गाँव स्तर पर जागरूकता व जांच',
      titleEn: 'Grassroots Screening & Risk Detection',
      descHi: 'ग्रामीण शिविरों में स्वयंसेवक और पैरामेडिक्स द्वारा प्राथमिक लक्षण स्क्रीनिंग और जोखिम मूल्यांकन।',
      descEn: 'Grassroots symptom screening and risk assessment conducted by paramedics and trained volunteers at rural camps.'
    },
    {
      step: '02',
      titleHi: 'जिम्मेदार रेफरल सहायता',
      titleEn: 'Responsible Referral Navigation',
      descHi: 'संदिग्ध मामले में मरीज और परिवार को निकटतम अनुबंधित कैंसर अस्पताल के विशेषज्ञ के पास रेफर करना।',
      descEn: 'Navigating suspected patient cases to accredited partner oncology hospitals with verified referral slips.'
    },
    {
      step: '03',
      titleHi: 'प्राथमिकता अपॉइंटमेंट व जांच',
      titleEn: 'Priority Clinical Examination',
      descHi: 'अस्पताल नोड पर बायोप्सी, मैमोग्राफी और स्कैन के लिए रियायती या प्राथमिकता स्लॉट बुक करना।',
      descEn: 'Booking priority slots for diagnostic biopsy, mammography, and PET-CT scans at hospital network nodes.'
    },
    {
      step: '04',
      titleHi: 'सतत फॉलो-अप व सहायता',
      titleEn: 'Continuous Follow-up Support',
      descHi: 'इलाज के दौरान मरीज के परिवार से संवाद, पोषण मार्गदर्शन और सरकारी सहायता का समन्वय।',
      descEn: 'Maintaining continuous contact with patient families for treatment adherence, nutrition guides, and financial aid coordination.'
    }
  ];

  return (
    <>
      <PremiumSection variant="warm-1" withTopDivider="none" withBottomDivider="torn">
        <div className="space-y-12 animate-[fadeIn_0.3s_ease-out]">
      {/* ===== HERO SECTION ===== */}
      <section className="relative rounded-2xl min-h-[480px] sm:min-h-[520px] flex flex-col justify-between p-6 sm:p-10 md:p-14 overflow-hidden shadow-2xl bg-neutral-950 text-white">
        
        {/* Glowing Ambient Radial Background Gradient */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/20 rounded-full filter blur-[120px] pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-secondary/20 rounded-full filter blur-[100px] pointer-events-none" />

        <div className="relative z-10 max-w-4xl space-y-6">
          
          {/* Badge & Language Toggle */}
          <div className="flex flex-wrap items-center justify-between gap-4">
            <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 text-slate-300 backdrop-blur-md text-xs font-bold uppercase tracking-wider border border-white/15">
              <Sparkles className="w-4 h-4 text-slate-400" />
              <span>OUR MISSION / हमारा मिशन</span>
            </span>

            <div className="flex items-center bg-white/10 p-1 rounded-xl border border-white/15 backdrop-blur-md text-xs font-bold">
              <button
                onClick={() => setActiveTab('hindi')}
                className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                  activeTab === 'hindi' ? 'bg-primary text-white shadow-md' : 'text-white/70 hover:text-white'
                }`}
              >
                हिंदी (Hindi)
              </button>
              <button
                onClick={() => setActiveTab('english')}
                className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                  activeTab === 'english' ? 'bg-primary text-white shadow-md' : 'text-white/70 hover:text-white'
                }`}
              >
                English
              </button>
            </div>
          </div>

          <h1 className="font-outfit text-3xl sm:text-5xl md:text-6xl font-extrabold leading-tight tracking-tight drop-shadow-md">
            {activeTab === 'hindi' ? (
              <>समुदाय-आधारित स्वास्थ्य क्रांति व <span className="text-secondary-container">जिम्मेदार रेफरल सहायता।</span></>
            ) : (
              <>Community-Driven Healthcare & <span className="text-secondary-container">Responsible Referral Navigation.</span></>
            )}
          </h1>

          <p className="font-body-lg text-slate-200 text-sm sm:text-base md:text-lg leading-relaxed max-w-3xl drop-shadow-sm font-medium">
            {activeTab === 'hindi' ? (
              'हमारा मिशन गाँव-गाँव स्वास्थ्य जागरूकता और जिम्मेदार रेफरल सहायता का ऐसा समुदाय-आधारित नेटवर्क विकसित करना है, जो लोगों को संभावित गंभीर स्वास्थ्य संकेतों के प्रति जागरूक करे और उन्हें समय पर उचित चिकित्सा सेवा तक पहुँचने के लिए प्रेरित एवं सहयोग करे।'
            ) : (
              'Our mission is to build a grassroots, community-driven network for health awareness and responsible referral support across every village—empowering people to recognize critical health signals early and guiding them towards timely, expert medical care.'
            )}
          </p>

          <div className="flex flex-wrap gap-4 pt-2">
            <button
              onClick={onOpenVolunteer}
              className="px-6 py-3.5 rounded-xl bg-primary text-white font-bold text-sm hover:bg-primary/90 hover:scale-[1.02] shadow-xl flex items-center gap-2 cursor-pointer transition-all duration-300"
            >
              <Users className="w-4.5 h-4.5" />
              <span>{activeTab === 'hindi' ? 'स्वयंसेवक के रूप में जुड़ें' : 'Join as Volunteer Advocate'}</span>
            </button>

            <button
              onClick={onOpenEnquiry}
              className="px-6 py-3.5 rounded-xl bg-white/15 border border-white/20 text-white font-bold text-sm hover:bg-white/25 hover:border-white/40 backdrop-blur-md transition-all duration-300 cursor-pointer flex items-center gap-2"
            >
              <HeartHandshake className="w-4.5 h-4.5 text-secondary-container" />
              <span>{activeTab === 'hindi' ? 'स्वास्थ्य सहायता हेतु संपर्क करें' : 'Request Patient Support'}</span>
            </button>
          </div>

        </div>

        {/* Live Mission Counter Metrics */}
        <div className="relative z-10 grid grid-cols-2 sm:grid-cols-4 gap-3 mt-10 pt-6 border-t border-white/15">
          {[
            { label: 'Target Rural Districts', val: '50+' },
            { label: 'Screening Awareness Camps', val: '180+' },
            { label: 'Certified Caseworkers', val: '2,400+' },
            { label: 'Patient Guidance Cases', val: '1,240+' }
          ].map((st, i) => (
            <div key={i} className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/15 text-center">
              <p className="text-xl sm:text-2xl font-black text-white">{st.val}</p>
              <p className="text-[11px] text-white/70 font-semibold mt-0.5">{st.label}</p>
            </div>
          ))}
        </div>

      </section>
        </div>
      </PremiumSection>

      <PremiumSection variant="warm-2">
        <div className="space-y-16">
      <section className="bg-white rounded-3xl p-8 sm:p-12 border border-outline-variant/30 shadow-md space-y-6">
        <div className="flex items-center gap-3 text-primary">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center font-bold">
            <Target className="w-5.5 h-5.5" />
          </div>
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-secondary">Mission Philosophy</span>
            <h2 className="font-headline-lg text-2xl sm:text-3xl font-extrabold text-primary">
              हमारा मूल मिशन एवं उद्देश्य
            </h2>
          </div>
        </div>

        <div className="bg-surface-container-low p-6 sm:p-8 rounded-2xl border border-outline-variant/20 space-y-4">
          <p className="text-base sm:text-lg text-slate-800 leading-relaxed font-semibold border-l-4 border-primary pl-4">
            "हमारा मिशन गाँव-गाँव स्वास्थ्य जागरूकता और जिम्मेदार रेफरल सहायता का ऐसा समुदाय-आधारित नेटवर्क विकसित करना है, जो लोगों को संभावित गंभीर स्वास्थ्य संकेतों के प्रति जागरूक करे और उन्हें समय पर उचित चिकित्सा सेवा तक पहुँचने के लिए प्रेरित एवं सहयोग करे।"
          </p>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed italic">
            At Cancer Aware Bharat, we believe no individual should suffer due to lack of health information or delayed diagnosis. By establishing structured community referral pathways, we bridge the critical gap between rural families and advanced clinical oncology centers.
          </p>
        </div>
      </section>

      {/* ===== KEY OBJECTIVES GRID (मुख्य उद्देश्य) ===== */}
      <section className="space-y-6">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <span className="px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-wider">
            CORE OBJECTIVES / मुख्य उद्देश्य
          </span>
          <h2 className="font-headline-lg text-2xl sm:text-4xl font-black text-primary">
            हमारे 6 मुख्य रणनीतिक उद्देश्य
          </h2>
          <p className="font-body-md text-slate-600 text-xs sm:text-sm">
            समुदाय स्तर पर कैंसर जागरूकता से लेकर अस्पताल फॉलो-अप तक हमारी चरणबद्ध कार्ययोजना।
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {objectives.map((obj, index) => {
            const Icon = obj.icon;
            return (
              <div
                key={index}
                className="bg-white rounded-2xl p-6 border border-outline-variant/30 shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col justify-between group hover:-translate-y-1"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border ${obj.color}`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <span className="text-xs font-black text-slate-300 group-hover:text-primary transition-colors">
                      0{index + 1}
                    </span>
                  </div>

                  <div className="space-y-2">
                    <h3 className="font-headline-lg text-base font-bold text-slate-900 group-hover:text-primary transition-colors">
                      {activeTab === 'hindi' ? obj.titleHi : obj.titleEn}
                    </h3>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      {activeTab === 'hindi' ? obj.descHi : obj.descEn}
                    </p>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100 mt-4 flex items-center justify-between text-[11px] font-bold text-slate-400 group-hover:text-primary">
                  <span>Structured Protocol</span>
                  <ChevronRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            );
          })}
        </div>
      </section>
        </div>
      </PremiumSection>
      <PremiumSection variant="warm-3" withTopDivider="wave" withBottomDivider="torn">
        <div className="space-y-16">
          {/* ===== REFERRAL PATHWAY WORKFLOW (रेफरल प्रक्रिया) ===== */}
      <section className="bg-gradient-to-br from-slate-900 via-neutral-900 to-slate-950 text-white rounded-3xl p-8 sm:p-12 border border-slate-800 space-y-8 shadow-2xl relative overflow-hidden">
        <div className="max-w-2xl space-y-3">
          <span className="px-3 py-1 rounded-full bg-primary/20 text-slate-300 text-xs font-bold uppercase tracking-wider border border-primary/30">
            RESPONSIBLE REFERRAL PATHWAYS
          </span>
          <h2 className="font-headline-lg text-2xl sm:text-4xl font-black">
            जिम्मेदार रेफरल एवं मरीज यात्रा (Patient Navigation Flow)
          </h2>
          <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
            गाँव स्तर की शुरुआती जांच से लेकर super-speciality अस्पताल उपचार तक 4 पारदर्शी चरण।
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {referralSteps.map((s, idx) => (
            <div key={idx} className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-3 backdrop-blur-md relative">
              <span className="text-2xl font-black text-slate-400 font-mono">{s.step}</span>
              <h3 className="font-bold text-sm text-white">
                {activeTab === 'hindi' ? s.titleHi : s.titleEn}
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                {activeTab === 'hindi' ? s.descHi : s.descEn}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ===== LONG-TERM VISION SECTION (दीर्घकालिक विज़न) ===== */}
      <section className="bg-white rounded-3xl p-8 sm:p-12 border border-outline-variant/30 shadow-md space-y-8">
        <div className="flex items-center gap-3 text-secondary">
          <div className="w-10 h-10 rounded-xl bg-secondary/10 flex items-center justify-center font-bold">
            <Eye className="w-5.5 h-5.5" />
          </div>
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-primary">Strategic Horizon</span>
            <h2 className="font-headline-lg text-2xl sm:text-3xl font-extrabold text-slate-900">
              हमारा दीर्घकालिक विज़न (Our Long-Term Vision)
            </h2>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-7 bg-surface-container-low p-6 sm:p-8 rounded-2xl border border-outline-variant/20 space-y-4">
            <h3 className="font-bold text-lg text-primary">
              जागरूक एवं कैंसर-सचेत ग्रामीण समाज की परिकल्पना
            </h3>
            <p className="text-sm text-slate-700 leading-relaxed">
              एक ऐसा जागरूक समाज, जहाँ गंभीर बीमारी के संभावित संकेतों को समय रहते पहचाना जाए, लोग उचित चिकित्सकीय परामर्श लेने में अनावश्यक देरी न करें और ग्रामीण समुदायों को सही स्वास्थ्य जानकारी एवं रेफरल सहायता उपलब्ध हो।
            </p>
            <p className="text-xs text-slate-500 leading-relaxed border-t border-slate-200 pt-3">
              We envision an empowered society where early warning signs of life-threatening illnesses are recognized without delay, clinical consultations are sought promptly, and rural families receive verified healthcare navigation at their doorstep.
            </p>
          </div>

          <div className="lg:col-span-5 space-y-3">
            {[
              { title: 'Zero Delay in Medical Consultation', desc: 'Removing fear & stigma around cancer screening' },
              { title: '100% Verified Hospital Networks', desc: 'Direct tie-ups with NABH oncology institutes' },
              { title: 'Community Caseworkers in Every Block', desc: 'Trained local youth guiding patients end-to-end' }
            ].map((v, i) => (
              <div key={i} className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-primary-container shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-xs text-slate-800">{v.title}</h4>
                  <p className="text-[11px] text-slate-500">{v.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
        </div>
      </PremiumSection>

      <PremiumSection variant="warm-1">
        <div className="space-y-16">
          {/* ===== CORE VALUES & COMMITMENTS (हमारे मूल सिद्धांत) ===== */}
      <section className="space-y-6">
        <div className="text-center max-w-2xl mx-auto space-y-1">
          <h2 className="font-headline-lg text-2xl font-extrabold text-primary">हमारे 4 मूल सिद्धांत व प्रतिबद्धता</h2>
          <p className="text-xs text-slate-500">Guided by clinical integrity, empathy, and transparent healthcare navigation.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { title: 'नैदानिक सत्यनिष्ठा (Clinical Integrity)', desc: 'केवल प्रमाणित विशेषज्ञों और अस्पतालों के साथ कार्य करना।', icon: Shield },
            { title: 'मरीज की गरिमा (Patient Dignity)', desc: 'हर ग्रामीण नागरिक के प्रति सम्मान, संवेदनशीलता और गोपनीयता।', icon: HeartPulse },
            { title: 'समयबद्ध कारवाही (Timely Action)', desc: 'लक्षण दिखाई देने से लेकर जांच तक न्यूनतम प्रतीक्षा समय।', icon: Clock },
            { title: 'निःशुल्क परामर्श (Free Assistance)', desc: 'रेफरल और मार्गदर्शन सहायता पूर्णतः पारदर्शी व निःशुल्क।', icon: Award }
          ].map((val, i) => {
            const Icon = val.icon;
            return (
              <div key={i} className="bg-white p-5 rounded-2xl border border-outline-variant/30 space-y-2 text-center shadow-xs">
                <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center mx-auto">
                  <Icon className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-xs text-slate-900">{val.title}</h3>
                <p className="text-[11px] text-slate-500 leading-relaxed">{val.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* ===== CALL TO ACTION FOOTER ===== */}
      <section className="bg-gradient-to-r from-primary via-primary-container to-primary text-white rounded-3xl p-8 sm:p-10 text-center space-y-6 shadow-xl">
        <div className="max-w-2xl mx-auto space-y-3">
          <h2 className="font-headline-lg text-2xl sm:text-3xl font-black">
            क्या आप हमारे मिशन से जुड़ना चाहते हैं?
          </h2>
          <p className="text-xs sm:text-sm text-white/80 leading-relaxed">
            स्वास्थ्य जागरूकता और जिम्मेदार रेफरल के इस जनस्वास्थ्य अभियान में स्वयंसेवक बनें या अपने गाँव/क्षेत्र में निःशुल्क कैंसर स्क्रीनिंग शिविर आयोजित कराएं।
          </p>
        </div>

        <div className="flex flex-wrap justify-center gap-4">
          <button
            onClick={onOpenVolunteer}
            className="px-6 py-3.5 rounded-xl bg-white text-primary font-bold text-xs sm:text-sm hover:bg-slate-100 shadow-lg cursor-pointer transition-transform hover:scale-105"
          >
            Become a Certified Volunteer / स्वयंसेवक बनें
          </button>

          <button
            onClick={onOpenEnquiry}
            className="px-6 py-3.5 rounded-xl bg-secondary text-white font-bold text-xs sm:text-sm hover:opacity-95 shadow-lg cursor-pointer transition-transform hover:scale-105"
          >
            Request Screening Camp / शिविर हेतु संपर्क
          </button>
        </div>
      </section>

        </div>
      </PremiumSection>
    </>
  );
}
