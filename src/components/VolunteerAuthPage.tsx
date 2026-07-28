import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, Eye, EyeOff, CheckCircle, Shield, Users, Calendar, ArrowRight, User, Mail, Phone, Lock, MapPin, Briefcase, Sparkles } from 'lucide-react';
import { ApiError, getMyVolunteerProfile, loginVolunteer, registerVolunteer, setVolunteerSession } from '../api/client';

interface VolunteerAuthPageProps {}

type AuthMode = 'login' | 'register';

interface LoginForm {
  email: string;
  password: string;
  rememberMe: boolean;
}

interface RegisterForm {
  fullName: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
  city: string;
  domain: string;
  agreeToTerms: boolean;
}

export default function VolunteerAuthPage({}: VolunteerAuthPageProps) {
  const navigate = useNavigate();
  const [mode, setMode] = useState<AuthMode>('login');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [animateIn, setAnimateIn] = useState(true);
  const [loggedInUser, setLoggedInUser] = useState<string | null>(null);

  // Login form state
  const [loginForm, setLoginForm] = useState<LoginForm>({
    email: '',
    password: '',
    rememberMe: false,
  });

  // Register form state
  const [registerForm, setRegisterForm] = useState<RegisterForm>({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    city: '',
    domain: 'General Volunteer',
    agreeToTerms: false,
  });

  // Password strength calculator
  const getPasswordStrength = (password: string): { level: number; label: string; color: string } => {
    let score = 0;
    if (password.length >= 8) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[a-z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;

    if (score <= 1) return { level: 1, label: 'Weak', color: 'bg-red-400' };
    if (score <= 2) return { level: 2, label: 'Fair', color: 'bg-slate-400' };
    if (score <= 3) return { level: 3, label: 'Good', color: 'bg-slate-400' };
    if (score <= 4) return { level: 4, label: 'Strong', color: 'bg-slate-400' };
    return { level: 5, label: 'Excellent', color: 'bg-primary' };
  };

  const switchMode = (newMode: AuthMode) => {
    setAnimateIn(false);
    setErrorMessage('');
    setTimeout(() => {
      setMode(newMode);
      setAnimateIn(true);
    }, 200);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!loginForm.email || !loginForm.password) {
      setErrorMessage('Please fill in all required fields.');
      return;
    }

    setIsSubmitting(true);
    try {
      const token = await loginVolunteer(loginForm.email.trim(), loginForm.password);
      const profile = await getMyVolunteerProfile(token.accessToken);
      setVolunteerSession({
        fullName: token.name,
        email: loginForm.email,
        volunteerId: profile.volunteerId,
        city: profile.area || '',
        domain: 'General Volunteer',
        accessToken: token.accessToken,
      });
      setLoggedInUser(token.name);
      setSubmitSuccess(true);
    } catch (err) {
      setErrorMessage(err instanceof ApiError ? err.message : 'Unable to reach the server. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!registerForm.fullName || !registerForm.email || !registerForm.phone || !registerForm.password || !registerForm.city) {
      setErrorMessage('Please fill in all required fields.');
      return;
    }

    if (registerForm.password !== registerForm.confirmPassword) {
      setErrorMessage('Passwords do not match.');
      return;
    }

    if (registerForm.password.length < 8) {
      setErrorMessage('Password must be at least 8 characters long.');
      return;
    }

    if (!registerForm.agreeToTerms) {
      setErrorMessage('Please agree to the Terms & Code of Conduct.');
      return;
    }

    setIsSubmitting(true);
    try {
      const created = await registerVolunteer({
        name: registerForm.fullName,
        email: registerForm.email.trim(),
        phone: registerForm.phone,
        password: registerForm.password,
        area: registerForm.city,
        motivation: `Interested domain: ${registerForm.domain}`,
      });
      const token = await loginVolunteer(registerForm.email.trim(), registerForm.password);
      setVolunteerSession({
        fullName: registerForm.fullName,
        email: registerForm.email,
        volunteerId: created.volunteerId,
        city: registerForm.city,
        domain: registerForm.domain,
        accessToken: token.accessToken,
      });
      setLoggedInUser(registerForm.fullName);
      setSubmitSuccess(true);
    } catch (err) {
      setErrorMessage(err instanceof ApiError ? err.message : 'Unable to reach the server. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Stats for the side panel
  const stats = [
    { icon: Users, label: 'Active Volunteers', value: '2,400+' },
    { icon: Calendar, label: 'Camps Organized', value: '180+' },
    { icon: Shield, label: 'Lives Impacted', value: '50,000+' },
  ];

  const passwordStrength = getPasswordStrength(registerForm.password);

  // Success — auto-redirect to dashboard
  useEffect(() => {
    if (submitSuccess) {
      const timer = setTimeout(() => {
        navigate('/volunteer/dashboard');
      }, 1200);
      return () => clearTimeout(timer);
    }
  }, [submitSuccess, navigate]);

  if (submitSuccess) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center py-12 px-4">
        <div className="max-w-md w-full text-center">
          <div className="relative mb-8 inline-block">
            <div className="w-24 h-24 bg-slate-50 rounded-full border-2 border-slate-300 flex items-center justify-center mx-auto">
              <CheckCircle className="w-14 h-14 text-primary animate-pulse" />
            </div>
            <div className="absolute -top-2 -right-2 w-8 h-8 bg-secondary rounded-full flex items-center justify-center shadow-lg">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
          </div>

          <h2 className="font-headline-lg text-3xl text-primary mb-3">
            {mode === 'login' ? 'Welcome Back!' : 'Registration Successful!'}
          </h2>
          <p className="font-body-md text-on-surface-variant mb-6 max-w-sm mx-auto leading-relaxed">
            {mode === 'login' ? (
              <>Welcome back, <strong className="text-on-surface">{loggedInUser}</strong>. Redirecting to your dashboard...</>
            ) : (
              <>Congratulations, <strong className="text-on-surface">{loggedInUser}</strong>! Setting up your volunteer dashboard...</>
            )}
          </p>
          
          {/* Loading spinner */}
          <div className="flex items-center justify-center space-x-2">
            <div className="w-5 h-5 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
            <span className="text-sm text-on-surface-variant font-medium">Loading dashboard...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-8 px-4">
      <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-5 gap-0 rounded-2xl overflow-hidden shadow-[0_20px_60px_rgba(0,67,73,0.12)] border border-outline-variant/20">
        
        {/* Left Panel — Branding & Info */}
        <div className="lg:col-span-2 bg-gradient-to-br from-primary via-primary-container to-primary relative overflow-hidden p-8 lg:p-10 flex flex-col justify-between min-h-[280px] lg:min-h-0">
          {/* Decorative circles */}
          <div className="absolute -top-16 -right-16 w-48 h-48 rounded-full bg-white/5" />
          <div className="absolute -bottom-20 -left-12 w-64 h-64 rounded-full bg-white/5" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 rounded-full bg-secondary/10" />

          <div className="relative z-10">
            {/* Logo */}
            <div className="flex items-center space-x-2.5 mb-6 lg:mb-10">
              <div className="w-10 h-10 rounded-full bg-white/15 backdrop-blur-sm flex items-center justify-center border border-white/20">
                <Heart className="w-5 h-5 text-secondary-container" fill="currentColor" />
              </div>
              <span className="font-headline-lg text-xl font-black text-white tracking-tight">
                Aware Bharat
              </span>
            </div>

            <h1 className="text-white font-headline-lg text-2xl lg:text-3xl font-bold mb-3 leading-tight">
              Volunteer
              <br />
              <span className="text-secondary-container">Portal</span>
            </h1>
            <p className="text-white/70 text-sm leading-relaxed max-w-xs">
              Join a compassionate network of 2,400+ volunteers dedicated to early cancer detection and patient support across India.
            </p>
          </div>

          {/* Stats */}
          <div className="relative z-10 space-y-3 mt-8 lg:mt-0">
            {stats.map((stat, idx) => (
              <div
                key={idx}
                className="flex items-center space-x-3 bg-white/8 backdrop-blur-sm rounded-xl px-4 py-3 border border-white/10 hover:bg-white/12 transition-colors"
              >
                <div className="w-9 h-9 rounded-lg bg-white/10 flex items-center justify-center shrink-0">
                  <stat.icon className="w-4.5 h-4.5 text-secondary-container" />
                </div>
                <div>
                  <p className="text-white font-bold text-sm">{stat.value}</p>
                  <p className="text-white/50 text-xs">{stat.label}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Panel — Form */}
        <div className="lg:col-span-3 bg-white p-6 sm:p-8 lg:p-10 flex flex-col">
          {/* Tab Switcher */}
          <div className="flex bg-surface-container-low rounded-xl p-1 mb-6 relative">
            <button
              onClick={() => switchMode('login')}
              id="volunteer-login-tab"
              className={`flex-1 py-2.5 rounded-lg font-label-sm text-sm font-semibold transition-all duration-300 cursor-pointer ${
                mode === 'login'
                  ? 'bg-white text-primary shadow-md'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => switchMode('register')}
              id="volunteer-register-tab"
              className={`flex-1 py-2.5 rounded-lg font-label-sm text-sm font-semibold transition-all duration-300 cursor-pointer ${
                mode === 'register'
                  ? 'bg-white text-primary shadow-md'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              Create Account
            </button>
          </div>

          {/* Error Message */}
          {errorMessage && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm font-medium flex items-center space-x-2 animate-[shake_0.5s_ease-in-out]">
              <Shield className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Form Content with animation */}
          <div className={`flex-grow transition-all duration-200 ${animateIn ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}`}>
            {mode === 'login' ? (
              /* =============== LOGIN FORM =============== */
              <form onSubmit={handleLogin} className="space-y-5">
                <div>
                  <h2 className="font-headline-lg text-xl text-on-surface mb-1">Welcome Back</h2>
                  <p className="text-sm text-on-surface-variant">Sign in to access your volunteer dashboard</p>
                </div>

                {/* Email */}
                <div className="space-y-1.5">
                  <label htmlFor="login-email" className="block text-xs font-bold uppercase tracking-wider text-on-surface-variant">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-outline" />
                    <input
                      id="login-email"
                      type="email"
                      required
                      value={loginForm.email}
                      onChange={e => setLoginForm({ ...loginForm, email: e.target.value })}
                      className="w-full pl-11 pr-4 py-3 rounded-xl border border-outline-variant bg-surface-container-lowest focus:border-primary focus:ring-2 focus:ring-primary/15 outline-none transition-all text-sm"
                      placeholder="you@example.com"
                    />
                  </div>
                </div>

                {/* Password */}
                <div className="space-y-1.5">
                  <label htmlFor="login-password" className="block text-xs font-bold uppercase tracking-wider text-on-surface-variant">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-outline" />
                    <input
                      id="login-password"
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={loginForm.password}
                      onChange={e => setLoginForm({ ...loginForm, password: e.target.value })}
                      className="w-full pl-11 pr-12 py-3 rounded-xl border border-outline-variant bg-surface-container-lowest focus:border-primary focus:ring-2 focus:ring-primary/15 outline-none transition-all text-sm"
                      placeholder="Enter your password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-outline hover:text-on-surface transition-colors cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Remember & Forgot */}
                <div className="flex justify-between items-center">
                  <label className="flex items-center space-x-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={loginForm.rememberMe}
                      onChange={e => setLoginForm({ ...loginForm, rememberMe: e.target.checked })}
                      className="w-4 h-4 text-primary focus:ring-primary border-outline-variant rounded cursor-pointer"
                    />
                    <span className="text-xs text-on-surface-variant">Remember me</span>
                  </label>
                  <button type="button" className="text-xs text-primary font-semibold hover:underline cursor-pointer">
                    Forgot Password?
                  </button>
                </div>

                {/* Submit */}
                <button
                  type="submit"
                  id="volunteer-login-btn"
                  disabled={isSubmitting}
                  className="w-full py-3.5 rounded-xl bg-primary text-white font-semibold text-sm hover:opacity-95 shadow-[0_4px_20px_rgba(0,67,73,0.2)] transition-all hover:shadow-[0_8px_30px_rgba(0,67,73,0.25)] disabled:opacity-60 cursor-pointer flex items-center justify-center space-x-2"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Signing in...</span>
                    </>
                  ) : (
                    <>
                      <span>Sign In</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>

                {/* Divider */}
                <div className="relative py-2">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-outline-variant/30" />
                  </div>
                  <div className="relative flex justify-center">
                    <span className="bg-white px-3 text-xs text-on-surface-variant">or</span>
                  </div>
                </div>

                {/* Switch prompt */}
                <p className="text-center text-sm text-on-surface-variant">
                  Don't have an account?{' '}
                  <button
                    type="button"
                    onClick={() => switchMode('register')}
                    className="text-primary font-bold hover:underline cursor-pointer"
                  >
                    Register as Volunteer
                  </button>
                </p>
              </form>
            ) : (
              /* =============== REGISTER FORM =============== */
              <form onSubmit={handleRegister} className="space-y-4">
                <div>
                  <h2 className="font-headline-lg text-xl text-on-surface mb-1">Create Your Account</h2>
                  <p className="text-sm text-on-surface-variant">Join the Cancer Aware Bharat volunteer network</p>
                </div>

                {/* Full Name */}
                <div className="space-y-1">
                  <label htmlFor="register-name" className="block text-xs font-bold uppercase tracking-wider text-on-surface-variant">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-outline" />
                    <input
                      id="register-name"
                      type="text"
                      required
                      value={registerForm.fullName}
                      onChange={e => setRegisterForm({ ...registerForm, fullName: e.target.value })}
                      className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-outline-variant bg-surface-container-lowest focus:border-primary focus:ring-2 focus:ring-primary/15 outline-none transition-all text-sm"
                      placeholder="Enter your full name"
                    />
                  </div>
                </div>

                {/* Email & Phone */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label htmlFor="register-email" className="block text-xs font-bold uppercase tracking-wider text-on-surface-variant">
                      Email <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-outline" />
                      <input
                        id="register-email"
                        type="email"
                        required
                        value={registerForm.email}
                        onChange={e => setRegisterForm({ ...registerForm, email: e.target.value })}
                        className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-outline-variant bg-surface-container-lowest focus:border-primary focus:ring-2 focus:ring-primary/15 outline-none transition-all text-sm"
                        placeholder="you@example.com"
                      />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label htmlFor="register-phone" className="block text-xs font-bold uppercase tracking-wider text-on-surface-variant">
                      Phone <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-outline" />
                      <input
                        id="register-phone"
                        type="tel"
                        required
                        value={registerForm.phone}
                        onChange={e => setRegisterForm({ ...registerForm, phone: e.target.value })}
                        className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-outline-variant bg-surface-container-lowest focus:border-primary focus:ring-2 focus:ring-primary/15 outline-none transition-all text-sm"
                        placeholder="10-digit number"
                      />
                    </div>
                  </div>
                </div>

                {/* City & Domain */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label htmlFor="register-city" className="block text-xs font-bold uppercase tracking-wider text-on-surface-variant">
                      City <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-outline" />
                      <input
                        id="register-city"
                        type="text"
                        required
                        value={registerForm.city}
                        onChange={e => setRegisterForm({ ...registerForm, city: e.target.value })}
                        className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-outline-variant bg-surface-container-lowest focus:border-primary focus:ring-2 focus:ring-primary/15 outline-none transition-all text-sm"
                        placeholder="Your city"
                      />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label htmlFor="register-domain" className="block text-xs font-bold uppercase tracking-wider text-on-surface-variant">
                      Volunteer Domain
                    </label>
                    <div className="relative">
                      <Briefcase className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-outline" />
                      <select
                        id="register-domain"
                        value={registerForm.domain}
                        onChange={e => setRegisterForm({ ...registerForm, domain: e.target.value })}
                        className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-outline-variant bg-surface-container-lowest focus:border-primary focus:ring-2 focus:ring-primary/15 outline-none transition-all text-sm appearance-none cursor-pointer"
                      >
                        <option value="General Volunteer">General Volunteer</option>
                        <option value="Oncologist / Physician">Oncologist / Physician</option>
                        <option value="Nurse / Clinical Assistant">Nurse / Clinical Assistant</option>
                        <option value="Cancer Survivor Advocate">Cancer Survivor Advocate</option>
                        <option value="Medical Student">Medical / Nursing Student</option>
                        <option value="Corporate Professional">Corporate Professional</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Password & Confirm */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label htmlFor="register-password" className="block text-xs font-bold uppercase tracking-wider text-on-surface-variant">
                      Password <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-outline" />
                      <input
                        id="register-password"
                        type={showPassword ? 'text' : 'password'}
                        required
                        value={registerForm.password}
                        onChange={e => setRegisterForm({ ...registerForm, password: e.target.value })}
                        className="w-full pl-11 pr-12 py-2.5 rounded-xl border border-outline-variant bg-surface-container-lowest focus:border-primary focus:ring-2 focus:ring-primary/15 outline-none transition-all text-sm"
                        placeholder="Min. 8 characters"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-outline hover:text-on-surface transition-colors cursor-pointer"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    {/* Password strength bar */}
                    {registerForm.password && (
                      <div className="flex items-center space-x-2 mt-1.5">
                        <div className="flex-1 h-1.5 bg-surface-container-high rounded-full overflow-hidden flex space-x-0.5">
                          {[1, 2, 3, 4, 5].map(i => (
                            <div
                              key={i}
                              className={`flex-1 rounded-full transition-all duration-300 ${
                                i <= passwordStrength.level ? passwordStrength.color : 'bg-surface-container-high'
                              }`}
                            />
                          ))}
                        </div>
                        <span className="text-[10px] font-semibold text-on-surface-variant">{passwordStrength.label}</span>
                      </div>
                    )}
                  </div>
                  <div className="space-y-1">
                    <label htmlFor="register-confirm-password" className="block text-xs font-bold uppercase tracking-wider text-on-surface-variant">
                      Confirm Password <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-outline" />
                      <input
                        id="register-confirm-password"
                        type={showConfirmPassword ? 'text' : 'password'}
                        required
                        value={registerForm.confirmPassword}
                        onChange={e => setRegisterForm({ ...registerForm, confirmPassword: e.target.value })}
                        className={`w-full pl-11 pr-12 py-2.5 rounded-xl border bg-surface-container-lowest focus:ring-2 focus:ring-primary/15 outline-none transition-all text-sm ${
                          registerForm.confirmPassword && registerForm.confirmPassword !== registerForm.password
                            ? 'border-red-300 focus:border-red-400'
                            : registerForm.confirmPassword && registerForm.confirmPassword === registerForm.password
                            ? 'border-slate-300 focus:border-slate-400'
                            : 'border-outline-variant focus:border-primary'
                        }`}
                        placeholder="Re-enter password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-outline hover:text-on-surface transition-colors cursor-pointer"
                      >
                        {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    {registerForm.confirmPassword && registerForm.confirmPassword === registerForm.password && (
                      <p className="text-[10px] text-primary-container font-semibold mt-1 flex items-center space-x-1">
                        <CheckCircle className="w-3 h-3" />
                        <span>Passwords match</span>
                      </p>
                    )}
                  </div>
                </div>

                {/* Terms */}
                <div className="p-3 bg-surface-container-low rounded-xl border border-outline-variant/40 flex items-start space-x-3">
                  <input
                    id="terms-checkbox"
                    type="checkbox"
                    checked={registerForm.agreeToTerms}
                    onChange={e => setRegisterForm({ ...registerForm, agreeToTerms: e.target.checked })}
                    className="w-4 h-4 text-primary focus:ring-primary border-outline-variant rounded mt-0.5 cursor-pointer"
                  />
                  <label htmlFor="terms-checkbox" className="text-xs text-on-surface-variant select-none leading-relaxed cursor-pointer">
                    I agree to the{' '}
                    <span className="text-primary font-bold">Terms of Service</span> and{' '}
                    <span className="text-primary font-bold">Volunteer Code of Conduct</span>. I commit to treating patients, survivors, and medical professionals with dignity and respect.
                  </label>
                </div>

                {/* Submit */}
                <button
                  type="submit"
                  id="volunteer-register-btn"
                  disabled={isSubmitting}
                  className="w-full py-3.5 rounded-xl bg-primary text-white font-semibold text-sm hover:opacity-95 shadow-[0_4px_20px_rgba(0,67,73,0.2)] transition-all hover:shadow-[0_8px_30px_rgba(0,67,73,0.25)] disabled:opacity-60 cursor-pointer flex items-center justify-center space-x-2"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Creating Account...</span>
                    </>
                  ) : (
                    <>
                      <span>Create Volunteer Account</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>

                {/* Switch prompt */}
                <p className="text-center text-sm text-on-surface-variant">
                  Already have an account?{' '}
                  <button
                    type="button"
                    onClick={() => switchMode('login')}
                    className="text-primary font-bold hover:underline cursor-pointer"
                  >
                    Sign In
                  </button>
                </p>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
