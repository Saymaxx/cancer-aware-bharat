import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  UserPlus, ShieldAlert, CheckCircle2, Heart, Users, MapPin,
  Calendar, Building2, Sparkles, AlertTriangle, Send, FileText,
  HeartHandshake, ChevronRight, Phone, Mail, Award, Target, Eye, LogIn
} from 'lucide-react';
import PremiumSection from './common/PremiumSection';

interface VolunteerRole {
  id: string;
  titleHi: string;
  titleEn: string;
  descHi: string;
  descEn: string;
  badgeHi: string;
}

const VOLUNTEER_ROLES: VolunteerRole[] = [
  {
    id: 'community_advocate',
    titleHi: 'सामुदायिक जागरूकता स्वयंसेवक',
    titleEn: 'Community Awareness Advocate',
    descHi: 'अपने क्षेत्र या गाँव में पोस्टर, लीफलेट और संवाद माध्यमों से कैंसर चेतावनी संकेतों के प्रति जागरूकता फैलाना।',
    descEn: 'Spreading early cancer detection signs through posters, leaflets, and community meets in your village.',
    badgeHi: 'जागरूकता प्रसार'
  },
  {
    id: 'camp_coordinator',
    titleHi: 'स्वास्थ्य शिविर समन्वयक',
    titleEn: 'Screening Camp Coordinator',
    descHi: 'स्थानीय क्षेत्रों में निःशुल्क मोबाइल कैंसर जांच शिविरों के स्थान चयन, प्रचार और मरीज कतार प्रबंधन में सहायता करना।',
    descEn: 'Assisting in local venue setup, registration desks, and patient flow for free mobile clinical screening camps.',
    badgeHi: 'शिविर प्रबंधन'
  },
  {
    id: 'patient_guide',
    titleHi: 'मरीज सहायता व रेफरल मार्गदर्शक',
    titleEn: 'Patient Referral & Support Guide',
    descHi: 'संदिग्ध लक्षणों वाले मरीजों को नजदीकी अनुबंधित अस्पताल तक सही मार्गदर्शन और सेकंड ओपिनियन सहायता देना।',
    descEn: 'Guiding suspected patient cases to nearby partner oncology centers for diagnostic exams.',
    badgeHi: 'मरीज मार्गदर्शन'
  },
  {
    id: 'youth_student',
    titleHi: 'युवा व छात्र स्वयंसेवक',
    titleEn: 'Youth & Student Volunteer',
    descHi: 'कॉलेज, युवा क्लबों और सोशल मीडिया माध्यमों से युवाओं को प्रिवेंटिव हेल्थ व तंबाकू निषेध अभियानों से जोड़ना।',
    descEn: 'Mobilizing student networks and youth clubs for anti-tobacco and preventive wellness campaigns.',
    badgeHi: 'युवा संबल'
  }
];

export default function JoinUsTab() {
  const navigate = useNavigate();
  const [selectedRole, setSelectedRole] = useState<string>('community_advocate');
  const [lang, setLang] = useState<'hindi' | 'english'>('hindi');

  // Form State
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [districtState, setDistrictState] = useState('');
  const [email, setEmail] = useState('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [refId, setRefId] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !phone || !districtState) return;

    setIsSubmitting(true);
    const newRefId = 'VOL-' + Math.random().toString(36).substring(2, 8).toUpperCase();

    setTimeout(() => {
      const stored = localStorage.getItem('aware_bharat_volunteer_interests');
      const existing = stored ? JSON.parse(stored) : [];
      const newEntry = {
        refId: newRefId,
        roleId: selectedRole,
        fullName,
        phone,
        districtState,
        email,
        notes,
        createdAt: new Date().toLocaleString()
      };
      localStorage.setItem('aware_bharat_volunteer_interests', JSON.stringify([newEntry, ...existing]));

      setRefId(newRefId);
      setIsSubmitting(false);
      setIsSubmitted(true);
    }, 800);
  };

  return (
    <>
      <PremiumSection variant="warm-1" withBottomDivider="wave">
        <div className="space-y-12 animate-[fadeIn_0.3s_ease-out]">
      
      {/* ===== HERO SECTION FOR VOLUNTEERS ===== */}
      <section className="relative rounded-3xl min-h-[460px] flex flex-col justify-between p-6 sm:p-10 md:p-14 border border-outline-variant/30 overflow-hidden shadow-2xl bg-neutral-950 text-white">
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/25 rounded-full filter blur-[120px] pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-secondary/20 rounded-full filter blur-[100px] pointer-events-none" />

        <div className="relative z-10 max-w-4xl space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 text-slate-300 backdrop-blur-md text-xs font-bold uppercase tracking-wider border border-white/15">
              <Users className="w-4 h-4 text-slate-400" />
              <span>VOLUNTEER PORTAL / स्वयंसेवक पंजीकरण</span>
            </span>

            <div className="flex items-center bg-white/10 p-1 rounded-xl border border-white/15 backdrop-blur-md text-xs font-bold">
              <button
                onClick={() => setLang('hindi')}
                className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                  lang === 'hindi' ? 'bg-primary text-white shadow-md' : 'text-white/70 hover:text-white'
                }`}
              >
                हिंदी (Hindi)
              </button>
              <button
                onClick={() => setLang('english')}
                className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                  lang === 'english' ? 'bg-primary text-white shadow-md' : 'text-white/70 hover:text-white'
                }`}
              >
                English
              </button>
            </div>
          </div>

          <h1 className="font-headline-lg text-3xl sm:text-5xl md:text-6xl font-black leading-tight tracking-tight drop-shadow-md">
            {lang === 'hindi' ? (
              <>स्वेच्छा से जुड़ें और <span className="text-secondary-container">कैंसर-मुक्त भारत का निर्माण करें।</span></>
            ) : (
              <>Join Our Mission as a <span className="text-secondary-container">Volunteer Advocate.</span></>
            )}
          </h1>

          <p className="font-body-lg text-slate-200 text-sm sm:text-base leading-relaxed max-w-3xl font-medium">
            {lang === 'hindi' ? (
              'स्वास्थ्य जागरूकता केवल चिकित्सकों का कार्य नहीं—जिम्मेदार समुदाय सहभागिता भी इसकी महत्वपूर्ण शक्ति है। यदि आप अपनी स्वेच्छा (Free Will) से अपने गाँव या शहर में सही स्वास्थ्य जानकारी और जिम्मेदार रेफरल जागरूकता बढ़ाने में योगदान देना चाहते हैं, तो स्वयंसेवक के रूप में अपनी रुचि दर्ज करें।'
            ) : (
              'Healthcare awareness is powered by compassionate community volunteers. If you wish to dedicate your time and effort out of your own free will to guide families, spread early screening awareness, and support patients, join us today.'
            )}
          </p>

          <div className="flex flex-wrap items-center gap-4 pt-2">
            <button
              onClick={() => navigate('/volunteer/login')}
              className="px-5 py-2.5 rounded-xl bg-white/15 hover:bg-white/25 border border-white/20 text-white font-bold text-xs backdrop-blur-md flex items-center gap-2 cursor-pointer transition-all"
            >
              <LogIn className="w-4 h-4 text-slate-400" />
              <span>Already Registered? Go to Volunteer Login</span>
            </button>
          </div>
        </div>
      </section>

      {/* ===== MISSION & VISION SUMMARY FOR VOLUNTEERS ===== */}
      <section className="bg-white rounded-3xl p-6 sm:p-10 border border-outline-variant/30 shadow-md space-y-6">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <span className="px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-wider">
            MISSION & VISION OVERVIEW / हमारा मिशन एवं दृष्टि
          </span>
          <h2 className="font-headline-lg text-2xl sm:text-3xl font-black text-slate-900">
            जानें हमारे मिशन और विज़न के बारे में
          </h2>
          <p className="text-xs sm:text-sm text-slate-600">
            स्वयंसेवक बनने से पूर्व समझें कि हमारा अभियान गाँव और समाज के लिए किस प्रकार कार्य करता है।
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Mission Card */}
          <div className="bg-surface-container-low p-6 rounded-2xl border border-outline-variant/20 space-y-3">
            <div className="flex items-center gap-2.5 text-primary">
              <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center font-bold">
                <Target className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-base">हमारा मिशन (Our Mission)</h3>
            </div>
            <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-semibold border-l-3 border-primary pl-3">
              "गाँव-गाँव स्वास्थ्य जागरूकता और जिम्मेदार रेफरल सहायता का ऐसा समुदाय-आधारित नेटवर्क विकसित करना, जो लोगों को संभावित गंभीर स्वास्थ्य संकेतों के प्रति जागरूक करे और उन्हें समय पर उचित चिकित्सा सेवा तक पहुँचाने में सहयोग करे।"
            </p>
          </div>

          {/* Vision Card */}
          <div className="bg-surface-container-low p-6 rounded-2xl border border-outline-variant/20 space-y-3">
            <div className="flex items-center gap-2.5 text-secondary">
              <div className="w-9 h-9 rounded-xl bg-secondary/10 flex items-center justify-center font-bold">
                <Eye className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-base">हमारा विज़न (Our Vision)</h3>
            </div>
            <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-semibold border-l-3 border-secondary pl-3">
              "एक ऐसा जागरूक समाज, जहाँ गंभीर बीमारी के संभावित संकेतों को समय रहते पहचाना जाए, लोग उचित चिकित्सकीय परामर्श लेने में अनावश्यक देरी न करें और ग्रामीण समुदायों को सही स्वास्थ्य जानकारी एवं रेफरल सहायता उपलब्ध हो।"
            </p>
          </div>

        </div>
      </section>

      {/* ===== IMPORTANT STATUTORY DECLARATION ===== */}
      <section className="bg-secondary/10 border border-secondary/30 rounded-3xl p-6 sm:p-8 space-y-3 relative overflow-hidden shadow-sm">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-2xl bg-secondary text-neutral-950 flex items-center justify-center shrink-0 font-bold mt-1">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div className="space-y-2">
            <h3 className="font-bold text-base text-primary dark:text-slate-300 flex items-center gap-2">
              <span>IMPORTANT DECLARATION FOR VOLUNTEERS / वैधानिक घोषणा</span>
            </h3>
            <p className="text-xs sm:text-sm text-slate-900/90 leading-relaxed font-semibold">
              "मिशन से जुड़ना किसी व्यक्ति को ‘डॉक्टर’, ‘चिकित्सक’ या independent medical practitioner का दर्जा अथवा चिकित्सा अभ्यास का अधिकार प्रदान नहीं करता। भूमिका, प्रशिक्षण और गतिविधियाँ निर्धारित SOP, योग्यता और लागू कानून के अधीन होंगी।"
            </p>
            <p className="text-[11px] text-slate-800/80 leading-relaxed italic">
              Joining the mission as a volunteer does NOT grant any individual the title, status, or right to practice medicine. All volunteer roles strictly adhere to non-clinical health awareness SOPs.
            </p>
          </div>
        </div>
      </section>

      {/* ===== VOLUNTEER ROLES SELECTION ===== */}
      <section className="space-y-6">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <span className="px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-wider">
            VOLUNTEER ROLES / स्वयंसेवक की भूमिकाएं
          </span>
          <h2 className="font-headline-lg text-2xl sm:text-4xl font-black text-primary">
            अपनी इच्छानुसार भूमिका चुनें
          </h2>
          <p className="text-xs sm:text-sm text-slate-600">
            अपनी रुचि और सामर्थ्य के अनुसार स्वयंसेवक की भूमिका का चयन करें।
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {VOLUNTEER_ROLES.map((role) => {
            const isSelected = selectedRole === role.id;
            return (
              <div
                key={role.id}
                onClick={() => setSelectedRole(role.id)}
                className={`bg-white rounded-2xl p-6 border transition-all duration-300 cursor-pointer flex flex-col justify-between space-y-4 group ${
                  isSelected
                    ? 'border-primary ring-2 ring-primary/20 shadow-xl bg-primary/5'
                    : 'border-outline-variant/30 hover:border-primary/50 shadow-xs hover:shadow-md'
                }`}
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-1 rounded-full bg-primary/10 text-primary text-[10px] font-bold">
                      {role.badgeHi}
                    </span>
                    <input
                      type="radio"
                      name="volunteerRole"
                      checked={isSelected}
                      onChange={() => setSelectedRole(role.id)}
                      className="w-4 h-4 text-primary focus:ring-primary cursor-pointer"
                    />
                  </div>

                  <h3 className="font-bold text-base text-slate-900 group-hover:text-primary transition-colors">
                    {lang === 'hindi' ? role.titleHi : role.titleEn}
                  </h3>

                  <p className="text-xs text-slate-600 leading-relaxed">
                    {lang === 'hindi' ? role.descHi : role.descEn}
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-primary">
                  <span>{isSelected ? 'चयनित भूमिका (Selected)' : 'चुनने के लिए क्लिक करें'}</span>
                  <ChevronRight className={`w-4 h-4 transition-transform ${isSelected ? 'translate-x-1' : ''}`} />
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ===== VOLUNTEER REGISTRATION FORM ===== */}
      <section className="bg-white rounded-3xl p-6 sm:p-10 md:p-12 border border-outline-variant/30 shadow-xl space-y-8 max-w-4xl mx-auto">
        <div className="border-b border-slate-100 pb-6 text-center space-y-2">
          <span className="px-3 py-1 rounded-full bg-slate-50 text-slate-700 text-xs font-bold uppercase tracking-wider border border-slate-200">
            VOLUNTEER APPLICATION
          </span>
          <h2 className="font-headline-lg text-2xl sm:text-3xl font-black text-slate-900">
            स्वयंसेवक अभिरुचि फॉर्म (Volunteer Registration)
          </h2>
          <p className="text-xs text-slate-500">
            चयनित भूमिका: <strong className="text-primary">{VOLUNTEER_ROLES.find(r => r.id === selectedRole)?.titleHi}</strong>
          </p>
        </div>

        {isSubmitted ? (
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-8 text-center space-y-4 text-primary">
            <div className="w-16 h-16 rounded-full bg-primary text-white flex items-center justify-center mx-auto shadow-lg animate-bounce">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <h3 className="font-headline-lg text-xl sm:text-2xl font-black">
              बधाई! आपकी स्वयंसेवक अभिरुचि दर्ज कर ली गई है!
            </h3>
            <p className="text-xs sm:text-sm text-slate-800 max-w-md mx-auto leading-relaxed">
              Cancer Aware Bharat की जिला समन्वय टीम जल्द ही आपसे संपर्क कर ओरिएंटेशन और स्वयंसेवक गाइड साझा करेगी।
            </p>
            <div className="inline-block bg-white px-4 py-2 rounded-xl border border-slate-300 font-mono text-xs font-bold text-slate-800 shadow-xs">
              स्वयंसेवक रेफरेंस ID: <span className="text-primary">{refId}</span>
            </div>
            <div className="pt-4 flex flex-wrap justify-center gap-3">
              <button
                onClick={() => navigate('/volunteer/login')}
                className="px-6 py-2.5 bg-primary text-white font-bold text-xs rounded-xl hover:opacity-90 cursor-pointer shadow-md"
              >
                Volunteer Portal Login
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              
              {/* Full Name */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-700">
                  पूरा नाम (Full Name) <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="उदा. अमित शर्मा"
                  value={fullName}
                  onChange={e => setFullName(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none text-xs bg-slate-50 focus:bg-white transition-all"
                />
              </div>

              {/* Phone Number */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-700">
                  मोबाइल नंबर (Mobile Number) <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  required
                  placeholder="उदा. 9876543210"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none text-xs bg-slate-50 focus:bg-white transition-all"
                />
              </div>

              {/* District & State */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-700">
                  जिला एवं राज्य (District & State) <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="उदा. पुणे, महाराष्ट्र / द्वारका, नई दिल्ली"
                  value={districtState}
                  onChange={e => setDistrictState(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none text-xs bg-slate-50 focus:bg-white transition-all"
                />
              </div>

              {/* Email Address */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-700">
                  ईमेल पता (Email Address - Optional)
                </label>
                <input
                  type="email"
                  placeholder="amit@example.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none text-xs bg-slate-50 focus:bg-white transition-all"
                />
              </div>

            </div>

            {/* Past Experience / Notes */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-700">
                सामाजिक कार्य / स्वयंसेवक अनुभव या संदेश (Experience / Notes - Optional)
              </label>
              <textarea
                rows={3}
                placeholder="यदि आपने पहले किसी एनजीओ, एनएसएस (NSS) या स्वास्थ्य अभियान में काम किया है तो संक्षेप में लिखें..."
                value={notes}
                onChange={e => setNotes(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none text-xs bg-slate-50 focus:bg-white transition-all"
              />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-4 rounded-xl bg-primary text-white font-bold text-sm hover:opacity-95 shadow-xl cursor-pointer disabled:opacity-50 transition-all flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <span>स्वयंसेवक फॉर्म जमा किया जा रहा है...</span>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>स्वेच्छा से स्वयंसेवक बनें (Register as Volunteer Advocate)</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </section>

        </div>
      </PremiumSection>
    </>
  );
}
