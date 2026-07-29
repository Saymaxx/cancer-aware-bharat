import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  HeartPulse, Eye, EyeOff, CheckCircle, Shield, FileText, Bell, ArrowRight,
  User, Mail, Phone, Lock, ArrowLeft, KeyRound, Sparkles,
} from 'lucide-react';
import {
  ApiError, loginPatient, registerPatient, requestPatientPasswordReset,
  resetPatientPassword, setPatientSession, verifyPatientEmail,
} from '../api/client';

type AuthMode = 'login' | 'register' | 'verify' | 'forgot-request' | 'forgot-reset';

interface LoginForm {
  email: string;
  password: string;
}

interface RegisterForm {
  fullName: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
  agreeToTerms: boolean;
}

export default function PatientAuthPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<AuthMode>('login');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [infoMessage, setInfoMessage] = useState('');
  const [animateIn, setAnimateIn] = useState(true);
  const [loggedInUser, setLoggedInUser] = useState<string | null>(null);

  const [loginForm, setLoginForm] = useState<LoginForm>({ email: '', password: '' });
  const [registerForm, setRegisterForm] = useState<RegisterForm>({
    fullName: '', email: '', phone: '', password: '', confirmPassword: '', agreeToTerms: false,
  });

  // Carried across register -> verify, and forgot-request -> forgot-reset.
  const [pendingEmail, setPendingEmail] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [forgotEmail, setForgotEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');

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
    setInfoMessage('');
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
      const token = await loginPatient(loginForm.email.trim(), loginForm.password);
      setPatientSession({
        name: token.name,
        email: loginForm.email.trim(),
        patientRefId: '',
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
    if (!registerForm.fullName || !registerForm.email || !registerForm.phone || !registerForm.password) {
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
      setErrorMessage('Please agree to the Terms & Privacy Policy.');
      return;
    }
    setIsSubmitting(true);
    try {
      await registerPatient({
        name: registerForm.fullName,
        email: registerForm.email.trim(),
        phone: registerForm.phone,
        password: registerForm.password,
      });
      setPendingEmail(registerForm.email.trim());
      switchMode('verify');
    } catch (err) {
      setErrorMessage(err instanceof ApiError ? err.message : 'Unable to reach the server. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    if (otpCode.length !== 6) {
      setErrorMessage('Enter the 6-digit code sent to your email.');
      return;
    }
    setIsSubmitting(true);
    try {
      const token = await verifyPatientEmail(pendingEmail, otpCode);
      setPatientSession({
        name: token.name,
        email: pendingEmail,
        patientRefId: '',
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

  const handleForgotRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    if (!forgotEmail) {
      setErrorMessage('Enter the email address on your account.');
      return;
    }
    setIsSubmitting(true);
    try {
      const result = await requestPatientPasswordReset(forgotEmail.trim());
      setInfoMessage(result.message);
      switchMode('forgot-reset');
    } catch (err) {
      setErrorMessage(err instanceof ApiError ? err.message : 'Unable to reach the server. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleForgotReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    if (otpCode.length !== 6) {
      setErrorMessage('Enter the 6-digit code sent to your email.');
      return;
    }
    if (newPassword !== confirmNewPassword) {
      setErrorMessage('Passwords do not match.');
      return;
    }
    if (newPassword.length < 8) {
      setErrorMessage('Password must be at least 8 characters long.');
      return;
    }
    setIsSubmitting(true);
    try {
      await resetPatientPassword(forgotEmail.trim(), otpCode, newPassword);
      setOtpCode('');
      setNewPassword('');
      setConfirmNewPassword('');
      setLoginForm({ email: forgotEmail.trim(), password: '' });
      setInfoMessage('');
      switchMode('login');
      setInfoMessage('Password updated. Sign in with your new password.');
    } catch (err) {
      setErrorMessage(err instanceof ApiError ? err.message : 'Unable to reach the server. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const stats = [
    { icon: FileText, label: 'Track Every Enquiry', value: 'Live Status' },
    { icon: Bell, label: 'Appointment Alerts', value: 'Real-Time' },
    { icon: Shield, label: 'Your Records', value: 'Private & Secure' },
  ];

  const passwordStrength = getPasswordStrength(registerForm.password);

  useEffect(() => {
    if (submitSuccess) {
      const timer = setTimeout(() => navigate('/patient/dashboard'), 1200);
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
          <h2 className="font-headline-lg text-3xl text-primary mb-3">Welcome, {loggedInUser}</h2>
          <p className="font-body-md text-on-surface-variant mb-6 max-w-sm mx-auto leading-relaxed">
            Setting up your patient dashboard...
          </p>
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
          <div className="absolute -top-16 -right-16 w-48 h-48 rounded-full bg-white/5" />
          <div className="absolute -bottom-20 -left-12 w-64 h-64 rounded-full bg-white/5" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 rounded-full bg-secondary/10" />

          <div className="relative z-10">
            <div className="flex items-center space-x-2.5 mb-6 lg:mb-10">
              <div className="w-10 h-10 rounded-full bg-white/15 backdrop-blur-sm flex items-center justify-center border border-white/20">
                <HeartPulse className="w-5 h-5 text-secondary-container" />
              </div>
              <span className="font-headline-lg text-xl font-black text-white tracking-tight">
                Aware Bharat
              </span>
            </div>

            <h1 className="text-white font-headline-lg text-2xl lg:text-3xl font-bold mb-3 leading-tight">
              Patient
              <br />
              <span className="text-secondary-container">Portal</span>
            </h1>
            <p className="text-white/70 text-sm leading-relaxed max-w-xs">
              Track your enquiries, appointments, and medical reports in one place — from submission to confirmed appointment.
            </p>
          </div>

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
          {(mode === 'login' || mode === 'register') && (
            <div className="flex bg-surface-container-low rounded-xl p-1 mb-6 relative">
              <button
                onClick={() => switchMode('login')}
                className={`flex-1 py-2.5 rounded-lg font-label-sm text-sm font-semibold transition-all duration-300 cursor-pointer ${
                  mode === 'login' ? 'bg-white text-primary shadow-md' : 'text-on-surface-variant hover:text-on-surface'
                }`}
              >
                Sign In
              </button>
              <button
                onClick={() => switchMode('register')}
                className={`flex-1 py-2.5 rounded-lg font-label-sm text-sm font-semibold transition-all duration-300 cursor-pointer ${
                  mode === 'register' ? 'bg-white text-primary shadow-md' : 'text-on-surface-variant hover:text-on-surface'
                }`}
              >
                Create Account
              </button>
            </div>
          )}

          {errorMessage && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm font-medium flex items-center space-x-2 animate-[shake_0.5s_ease-in-out]">
              <Shield className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}
          {infoMessage && !errorMessage && (
            <div className="mb-4 p-3 bg-slate-50 border border-slate-200 text-slate-700 rounded-xl text-sm font-medium flex items-center space-x-2">
              <CheckCircle className="w-4 h-4 shrink-0 text-primary" />
              <span>{infoMessage}</span>
            </div>
          )}

          <div className={`flex-grow transition-all duration-200 ${animateIn ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}`}>
            {mode === 'login' && (
              <form onSubmit={handleLogin} className="space-y-5">
                <div>
                  <h2 className="font-headline-lg text-xl text-on-surface mb-1">Welcome Back</h2>
                  <p className="text-sm text-on-surface-variant">Sign in to track your enquiries and appointments</p>
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="patient-login-email" className="block text-xs font-bold uppercase tracking-wider text-on-surface-variant">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-outline" />
                    <input
                      id="patient-login-email"
                      type="email"
                      required
                      value={loginForm.email}
                      onChange={e => setLoginForm({ ...loginForm, email: e.target.value })}
                      className="w-full pl-11 pr-4 py-3 rounded-xl border border-outline-variant bg-surface-container-lowest focus:border-primary focus:ring-2 focus:ring-primary/15 outline-none transition-all text-sm"
                      placeholder="you@example.com"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="patient-login-password" className="block text-xs font-bold uppercase tracking-wider text-on-surface-variant">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-outline" />
                    <input
                      id="patient-login-password"
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

                <div className="flex justify-end items-center">
                  <button
                    type="button"
                    onClick={() => { setForgotEmail(loginForm.email); switchMode('forgot-request'); }}
                    className="text-xs text-primary font-semibold hover:underline cursor-pointer"
                  >
                    Forgot Password?
                  </button>
                </div>

                <button
                  type="submit"
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

                <p className="text-center text-sm text-on-surface-variant">
                  Don't have an account?{' '}
                  <button type="button" onClick={() => switchMode('register')} className="text-primary font-bold hover:underline cursor-pointer">
                    Create one
                  </button>
                </p>
              </form>
            )}

            {mode === 'register' && (
              <form onSubmit={handleRegister} className="space-y-4">
                <div>
                  <h2 className="font-headline-lg text-xl text-on-surface mb-1">Create Your Account</h2>
                  <p className="text-sm text-on-surface-variant">Track every enquiry you submit, in one place</p>
                </div>

                <div className="space-y-1">
                  <label htmlFor="patient-register-name" className="block text-xs font-bold uppercase tracking-wider text-on-surface-variant">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-outline" />
                    <input
                      id="patient-register-name"
                      type="text"
                      required
                      value={registerForm.fullName}
                      onChange={e => setRegisterForm({ ...registerForm, fullName: e.target.value })}
                      className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-outline-variant bg-surface-container-lowest focus:border-primary focus:ring-2 focus:ring-primary/15 outline-none transition-all text-sm"
                      placeholder="Enter your full name"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label htmlFor="patient-register-email" className="block text-xs font-bold uppercase tracking-wider text-on-surface-variant">
                      Email <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-outline" />
                      <input
                        id="patient-register-email"
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
                    <label htmlFor="patient-register-phone" className="block text-xs font-bold uppercase tracking-wider text-on-surface-variant">
                      Phone <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-outline" />
                      <input
                        id="patient-register-phone"
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

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label htmlFor="patient-register-password" className="block text-xs font-bold uppercase tracking-wider text-on-surface-variant">
                      Password <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-outline" />
                      <input
                        id="patient-register-password"
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
                    {registerForm.password && (
                      <div className="flex items-center space-x-2 mt-1.5">
                        <div className="flex-1 h-1.5 bg-surface-container-high rounded-full overflow-hidden flex space-x-0.5">
                          {[1, 2, 3, 4, 5].map(i => (
                            <div key={i} className={`flex-1 rounded-full transition-all duration-300 ${i <= passwordStrength.level ? passwordStrength.color : 'bg-surface-container-high'}`} />
                          ))}
                        </div>
                        <span className="text-[10px] font-semibold text-on-surface-variant">{passwordStrength.label}</span>
                      </div>
                    )}
                  </div>
                  <div className="space-y-1">
                    <label htmlFor="patient-register-confirm-password" className="block text-xs font-bold uppercase tracking-wider text-on-surface-variant">
                      Confirm Password <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-outline" />
                      <input
                        id="patient-register-confirm-password"
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

                <div className="p-3 bg-surface-container-low rounded-xl border border-outline-variant/40 flex items-start space-x-3">
                  <input
                    id="patient-terms-checkbox"
                    type="checkbox"
                    checked={registerForm.agreeToTerms}
                    onChange={e => setRegisterForm({ ...registerForm, agreeToTerms: e.target.checked })}
                    className="w-4 h-4 text-primary focus:ring-primary border-outline-variant rounded mt-0.5 cursor-pointer"
                  />
                  <label htmlFor="patient-terms-checkbox" className="text-xs text-on-surface-variant select-none leading-relaxed cursor-pointer">
                    I agree to the <span className="text-primary font-bold">Terms of Service</span> and{' '}
                    <span className="text-primary font-bold">Privacy Policy</span>, and consent to my enquiry and appointment data being stored to provide this service.
                  </label>
                </div>

                <button
                  type="submit"
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
                      <span>Create Account</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>

                <p className="text-center text-sm text-on-surface-variant">
                  Already have an account?{' '}
                  <button type="button" onClick={() => switchMode('login')} className="text-primary font-bold hover:underline cursor-pointer">
                    Sign In
                  </button>
                </p>
              </form>
            )}

            {mode === 'verify' && (
              <form onSubmit={handleVerify} className="space-y-5">
                <div>
                  <h2 className="font-headline-lg text-xl text-on-surface mb-1">Verify Your Email</h2>
                  <p className="text-sm text-on-surface-variant">
                    Enter the 6-digit code sent to <strong className="text-on-surface">{pendingEmail}</strong>
                  </p>
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="patient-otp-code" className="block text-xs font-bold uppercase tracking-wider text-on-surface-variant">
                    Verification Code
                  </label>
                  <div className="relative">
                    <KeyRound className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-outline" />
                    <input
                      id="patient-otp-code"
                      type="text"
                      inputMode="numeric"
                      maxLength={6}
                      required
                      value={otpCode}
                      onChange={e => setOtpCode(e.target.value.replace(/\D/g, ''))}
                      className="w-full pl-11 pr-4 py-3 rounded-xl border border-outline-variant bg-surface-container-lowest focus:border-primary focus:ring-2 focus:ring-primary/15 outline-none transition-all text-sm tracking-[0.3em] font-mono text-center"
                      placeholder="000000"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3.5 rounded-xl bg-primary text-white font-semibold text-sm hover:opacity-95 shadow-[0_4px_20px_rgba(0,67,73,0.2)] transition-all disabled:opacity-60 cursor-pointer flex items-center justify-center space-x-2"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Verifying...</span>
                    </>
                  ) : (
                    <>
                      <span>Verify & Continue</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => switchMode('login')}
                  className="flex items-center justify-center gap-1.5 text-xs text-on-surface-variant hover:text-primary font-semibold cursor-pointer w-full"
                >
                  <ArrowLeft className="w-3.5 h-3.5" /> Back to Sign In
                </button>
              </form>
            )}

            {mode === 'forgot-request' && (
              <form onSubmit={handleForgotRequest} className="space-y-5">
                <div>
                  <h2 className="font-headline-lg text-xl text-on-surface mb-1">Reset Your Password</h2>
                  <p className="text-sm text-on-surface-variant">Enter your account email and we'll send a verification code</p>
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="patient-forgot-email" className="block text-xs font-bold uppercase tracking-wider text-on-surface-variant">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-outline" />
                    <input
                      id="patient-forgot-email"
                      type="email"
                      required
                      value={forgotEmail}
                      onChange={e => setForgotEmail(e.target.value)}
                      className="w-full pl-11 pr-4 py-3 rounded-xl border border-outline-variant bg-surface-container-lowest focus:border-primary focus:ring-2 focus:ring-primary/15 outline-none transition-all text-sm"
                      placeholder="you@example.com"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3.5 rounded-xl bg-primary text-white font-semibold text-sm hover:opacity-95 shadow-[0_4px_20px_rgba(0,67,73,0.2)] transition-all disabled:opacity-60 cursor-pointer flex items-center justify-center space-x-2"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Sending...</span>
                    </>
                  ) : (
                    <span>Send Verification Code</span>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => switchMode('login')}
                  className="flex items-center justify-center gap-1.5 text-xs text-on-surface-variant hover:text-primary font-semibold cursor-pointer w-full"
                >
                  <ArrowLeft className="w-3.5 h-3.5" /> Back to Sign In
                </button>
              </form>
            )}

            {mode === 'forgot-reset' && (
              <form onSubmit={handleForgotReset} className="space-y-4">
                <div>
                  <h2 className="font-headline-lg text-xl text-on-surface mb-1">Enter New Password</h2>
                  <p className="text-sm text-on-surface-variant">
                    Enter the code sent to <strong className="text-on-surface">{forgotEmail}</strong> and choose a new password
                  </p>
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="patient-reset-code" className="block text-xs font-bold uppercase tracking-wider text-on-surface-variant">
                    Verification Code
                  </label>
                  <div className="relative">
                    <KeyRound className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-outline" />
                    <input
                      id="patient-reset-code"
                      type="text"
                      inputMode="numeric"
                      maxLength={6}
                      required
                      value={otpCode}
                      onChange={e => setOtpCode(e.target.value.replace(/\D/g, ''))}
                      className="w-full pl-11 pr-4 py-3 rounded-xl border border-outline-variant bg-surface-container-lowest focus:border-primary focus:ring-2 focus:ring-primary/15 outline-none transition-all text-sm tracking-[0.3em] font-mono text-center"
                      placeholder="000000"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="patient-new-password" className="block text-xs font-bold uppercase tracking-wider text-on-surface-variant">
                    New Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-outline" />
                    <input
                      id="patient-new-password"
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={newPassword}
                      onChange={e => setNewPassword(e.target.value)}
                      className="w-full pl-11 pr-12 py-3 rounded-xl border border-outline-variant bg-surface-container-lowest focus:border-primary focus:ring-2 focus:ring-primary/15 outline-none transition-all text-sm"
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
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="patient-confirm-new-password" className="block text-xs font-bold uppercase tracking-wider text-on-surface-variant">
                    Confirm New Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-outline" />
                    <input
                      id="patient-confirm-new-password"
                      type={showConfirmPassword ? 'text' : 'password'}
                      required
                      value={confirmNewPassword}
                      onChange={e => setConfirmNewPassword(e.target.value)}
                      className="w-full pl-11 pr-12 py-3 rounded-xl border border-outline-variant bg-surface-container-lowest focus:border-primary focus:ring-2 focus:ring-primary/15 outline-none transition-all text-sm"
                      placeholder="Re-enter new password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-outline hover:text-on-surface transition-colors cursor-pointer"
                    >
                      {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3.5 rounded-xl bg-primary text-white font-semibold text-sm hover:opacity-95 shadow-[0_4px_20px_rgba(0,67,73,0.2)] transition-all disabled:opacity-60 cursor-pointer flex items-center justify-center space-x-2"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Updating...</span>
                    </>
                  ) : (
                    <span>Update Password</span>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => switchMode('login')}
                  className="flex items-center justify-center gap-1.5 text-xs text-on-surface-variant hover:text-primary font-semibold cursor-pointer w-full"
                >
                  <ArrowLeft className="w-3.5 h-3.5" /> Back to Sign In
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
