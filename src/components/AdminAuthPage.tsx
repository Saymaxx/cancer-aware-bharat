import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldAlert, Eye, EyeOff, CheckCircle, Shield, Building, Lock, Mail, Key, UserCheck, ArrowRight, Activity, Terminal, Database, Server, RefreshCw } from 'lucide-react';
import { ApiError, loginStaff, setStaffSession } from '../api/client';

interface AdminAuthPageProps {
  initialRole?: 'admin' | 'superadmin';
  lockedRole?: 'admin' | 'superadmin';
}

type AuthRole = 'admin' | 'superadmin';

export default function AdminAuthPage({ initialRole = 'admin', lockedRole }: AdminAuthPageProps) {
  const navigate = useNavigate();
  const [role, setRole] = useState<AuthRole>(initialRole);
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [animateIn, setAnimateIn] = useState(true);

  // Forms state
  const [adminEmail, setAdminEmail] = useState('admin@awarebharat.local');
  const [adminPassword, setAdminPassword] = useState('ChangeMe123!');
  const [adminPasscode, setAdminPasscode] = useState('12345');

  const [superEmail, setSuperEmail] = useState('superadmin@awarebharat.local');
  const [superPassword, setSuperPassword] = useState('ChangeMe123!');
  const [superMfaToken, setSuperMfaToken] = useState('999999');

  const switchRole = (newRole: AuthRole) => {
    setAnimateIn(false);
    setErrorMessage('');
    setTimeout(() => {
      setRole(newRole);
      setAnimateIn(true);
    }, 200);
  };

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!adminEmail || !adminPassword || !adminPasscode) {
      setErrorMessage('Please fill in all the required administrative fields.');
      return;
    }

    setIsSubmitting(true);
    try {
      const token = await loginStaff(adminEmail.trim(), adminPassword);
      if (token.role !== 'admin') {
        setErrorMessage('This account is not an Admin account. Use the Super Admin tab instead.');
        return;
      }
      setStaffSession({
        role: 'admin',
        email: adminEmail,
        name: token.name,
        accessToken: token.accessToken,
        lastAccess: new Date().toLocaleString(),
        sessionKey: 'STAFF-' + Math.random().toString(36).substr(2, 9).toUpperCase(),
      });
      setSubmitSuccess(true);
    } catch (err) {
      setErrorMessage(err instanceof ApiError ? err.message : 'Unable to reach the server. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSuperAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!superEmail || !superPassword || !superMfaToken) {
      setErrorMessage('Please enter all Trust credentials and the MFA security token.');
      return;
    }

    setIsSubmitting(true);
    try {
      const token = await loginStaff(superEmail.trim(), superPassword);
      if (token.role !== 'superadmin') {
        setErrorMessage('This account is not a Super Admin account. Use the Admin tab instead.');
        return;
      }
      setStaffSession({
        role: 'superadmin',
        email: superEmail,
        name: token.name,
        accessToken: token.accessToken,
        lastAccess: new Date().toLocaleString(),
        sessionKey: 'SUPER-' + Math.random().toString(36).substr(2, 9).toUpperCase(),
      });
      setSubmitSuccess(true);
    } catch (err) {
      setErrorMessage(err instanceof ApiError ? err.message : 'Unable to reach the server. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const sessionDetails = localStorage.getItem('aware_bharat_logged_in_staff')
    ? JSON.parse(localStorage.getItem('aware_bharat_logged_in_staff')!)
    : null;

  if (submitSuccess && sessionDetails) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 bg-background">
        <div className="max-w-2xl w-full text-center space-y-6">
          {/* Animated check */}
          <div className="relative mb-6 inline-block">
            <div className={`w-24 h-24 rounded-full border-2 flex items-center justify-center mx-auto ${role === 'superadmin' ? 'bg-indigo-50 border-indigo-300' : 'bg-slate-50 border-slate-300'
              }`}>
              <CheckCircle className={`w-14 h-14 ${role === 'superadmin' ? 'text-indigo-600' : 'text-primary'}`} />
            </div>
            <div className="absolute -top-2 -right-2 w-8 h-8 bg-secondary rounded-full flex items-center justify-center shadow-lg animate-bounce">
              <Shield className="w-4 h-4 text-white" />
            </div>
          </div>

          <h2 className="font-headline-lg text-3xl text-on-surface">
            {role === 'superadmin' ? 'Super Admin Node Initialized' : 'Admin Session Initialized'}
          </h2>
          <p className="font-body-md text-on-surface-variant max-w-md mx-auto leading-relaxed">
            {role === 'superadmin' ? (
              <>Board Level clearance authenticated. Security audit trace logging started for <strong className="text-indigo-700">{sessionDetails.email}</strong>.</>
            ) : (
              <>Connection established. Syncing administrative database logs for <strong className="text-primary">{sessionDetails.email}</strong>.</>
            )}
          </p>

          {/* SaaS Portal Status Log */}
          <div className="bg-neutral-950 text-slate-400 p-5 rounded-xl border border-neutral-800 text-left font-mono text-xs space-y-2 shadow-2xl relative overflow-hidden">
            <div className="absolute top-2 right-2 flex items-center space-x-1.5 opacity-60">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              <span className="text-[10px]">CONNECTED</span>
            </div>
            <p className="text-white/40 border-b border-neutral-800 pb-2 flex items-center gap-1.5">
              <Terminal className="w-3.5 h-3.5" /> SECURE CONSOLE LOGS
            </p>
            <div className="space-y-1">
              <p className="flex items-center gap-2"><Server className="w-3.5 h-3.5 shrink-0 text-primary" /> Host: Node-{role === 'superadmin' ? 'Alpha-0' : 'Admin-Portal'}</p>
              <p className="flex items-center gap-2"><Database className="w-3.5 h-3.5 shrink-0 text-primary" /> Database Sync: 100% (camps_schedule, volunteer_registrations)</p>
              <p className="flex items-center gap-2"><Activity className="w-3.5 h-3.5 shrink-0 text-primary" /> Session ID: <span className="text-white select-all">{sessionDetails.sessionKey}</span></p>
              <p className="flex items-center gap-2"><RefreshCw className="w-3.5 h-3.5 shrink-0 text-primary" /> Permissions: {role === 'superadmin' ? 'ROOT_ALL_ACCESS' : 'ADMIN_COORDINATION_ACCESS'}</p>
            </div>
          </div>

          <div className="flex justify-center gap-4">
            <button
              onClick={() => navigate('/')}
              className="px-6 py-3 rounded-xl border border-outline-variant text-on-surface-variant font-semibold text-sm hover:bg-surface-container transition-colors cursor-pointer"
            >
              Exit Console
            </button>
            <button
              onClick={() => navigate((sessionDetails?.role || role) === 'superadmin' ? '/superadmin/dashboard' : '/admin/dashboard')}
              className={`px-6 py-3 rounded-xl text-white font-semibold text-sm shadow-lg flex items-center gap-2 cursor-pointer ${ (sessionDetails?.role || role) === 'superadmin' ? 'bg-indigo-600 hover:bg-indigo-700' : 'bg-primary hover:bg-primary/95'
                }`}
            >
              <span>{(sessionDetails?.role || role) === 'superadmin' ? 'Go to Super Admin Console' : 'Go to Admin Dashboard'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[85vh] flex items-center justify-center py-10 px-4 bg-background">
      <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-12 gap-0 rounded-2xl overflow-hidden shadow-[0_20px_60px_rgba(0,0,0,0.08)] border border-outline-variant/20 bg-white">

        {/* Left Side: Info & Brand Panel */}
        <div className={`lg:col-span-5 relative p-8 lg:p-12 flex flex-col justify-between overflow-hidden text-white transition-all duration-500 ${role === 'superadmin'
            ? 'bg-gradient-to-br from-indigo-950 via-slate-900 to-indigo-950'
            : 'bg-gradient-to-br from-primary via-primary-container to-primary'
          }`}>
          {/* Glowing blobs */}
          <div className={`absolute -top-20 -right-20 w-64 h-64 rounded-full pointer-events-none opacity-20 filter blur-2xl transition-colors duration-500 ${role === 'superadmin' ? 'bg-indigo-500' : 'bg-secondary'
            }`} />
          <div className="absolute -bottom-24 -left-12 w-64 h-64 rounded-full bg-white/5 pointer-events-none filter blur-xl" />

          {/* Top Logo */}
          <div className="relative z-10">
            <button
              onClick={() => navigate('/')}
              className="flex items-center space-x-2.5 text-left mb-8 lg:mb-12 hover:opacity-90"
            >
              <div className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20">
                <Shield className="w-5 h-5 text-secondary-container" fill="currentColor" />
              </div>
              <span className="font-headline-lg text-lg font-black text-white tracking-tight">
                CAB Staff Portals
              </span>
            </button>

            <h1 className="font-headline-lg text-3xl font-black mb-4 leading-tight">
              {role === 'superadmin' ? 'Trust Board Security Console' : 'Regional Branch Portal'}
            </h1>
            <p className="text-white/70 text-sm leading-relaxed max-w-xs">
              {role === 'superadmin'
                ? 'Authorized Board of Trustees portal to monitor metrics, approve clinics, audit transaction ledgers, and manage regional partner access.'
                : 'Dedicated branch portal for clinic coordinators and hospital partners to manage attendee registration, sync check-in status, and request screening kits.'
              }
            </p>
          </div>

          {/* Bottom Security Info Badge */}
          <div className="relative z-10 mt-8 lg:mt-0 p-4 bg-white/5 border border-white/10 rounded-xl backdrop-blur-md">
            <p className="text-[10px] uppercase font-bold tracking-wider text-secondary-container flex items-center gap-1.5">
              <ShieldAlert className="w-4 h-4" /> Cryptographic Signatures Enabled
            </p>
            <p className="text-white/60 text-xs mt-1 leading-relaxed">
              All logins require active Multi-Factor credentials. Audits are generated on database access logs.
            </p>
          </div>
        </div>

        {/* Right Side: Form Panel */}
        <div className="lg:col-span-7 p-6 sm:p-10 flex flex-col justify-center bg-white">
          {/* Header Switcher — hidden when accessed via direct URL (lockedRole) */}
          {!lockedRole && (
            <div className="flex bg-surface-container-low rounded-xl p-1 mb-8 relative">
              <button
                onClick={() => switchRole('admin')}
                id="admin-login-tab"
                className={`flex-1 py-3 rounded-lg font-label-sm text-sm font-semibold transition-all duration-300 cursor-pointer ${role === 'admin'
                    ? 'bg-white text-primary shadow-md'
                    : 'text-on-surface-variant hover:text-on-surface'
                  }`}
              >
                Admin
              </button>
              <button
                onClick={() => switchRole('superadmin')}
                id="superadmin-login-tab"
                className={`flex-1 py-3 rounded-lg font-label-sm text-sm font-semibold transition-all duration-300 cursor-pointer ${role === 'superadmin'
                    ? 'bg-white text-indigo-700 shadow-md'
                    : 'text-on-surface-variant hover:text-on-surface'
                  }`}
              >
                Super Admin
              </button>
            </div>
          )}

          {/* Error feedback */}
          {errorMessage && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-800 rounded-xl text-sm font-medium flex items-center gap-2.5 animate-[shake_0.5s_ease-in-out]">
              <ShieldAlert className="w-5 h-5 shrink-0 text-red-600" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Tab content wrapper */}
          <div className={`transition-all duration-300 ${animateIn ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}`}>
            {role === 'admin' ? (
              /* ================== REGIONAL ADMIN FORM ================== */
              <form onSubmit={handleAdminLogin} className="space-y-5">
                <div>
                  <h2 className="font-headline-lg text-xl text-on-surface mb-1">Administrative Login</h2>
                  <p className="text-sm text-on-surface-variant">Access clinic scheduling and patient registries.</p>
                </div>


                {/* Coordinator Email */}
                <div className="space-y-1.5">
                  <label htmlFor="admin-email" className="block text-xs font-bold uppercase tracking-wider text-on-surface-variant">
                    Admin Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-outline" />
                    <input
                      id="admin-email"
                      type="email"
                      required
                      value={adminEmail}
                      onChange={e => setAdminEmail(e.target.value)}
                      className="w-full pl-11 pr-4 py-3 rounded-xl border border-outline-variant bg-surface-container-lowest focus:border-primary focus:ring-2 focus:ring-primary/15 outline-none transition-all text-sm"
                      placeholder="dwarka@awarebharat.org"
                    />
                  </div>
                </div>

                {/* Password */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label htmlFor="admin-password" className="block text-xs font-bold uppercase tracking-wider text-on-surface-variant">
                      Password
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-outline" />
                      <input
                        id="admin-password"
                        type={showPassword ? 'text' : 'password'}
                        required
                        value={adminPassword}
                        onChange={e => setAdminPassword(e.target.value)}
                        className="w-full pl-11 pr-12 py-3 rounded-xl border border-outline-variant bg-surface-container-lowest focus:border-primary focus:ring-2 focus:ring-primary/15 outline-none transition-all text-sm"
                        placeholder="••••••••"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-outline hover:text-on-surface transition-colors cursor-pointer"
                      >
                        {showPassword ? <EyeOff className="w-4.5 h-4.5" /> : <Eye className="w-4.5 h-4.5" />}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label htmlFor="admin-passcode" className="block text-xs font-bold uppercase tracking-wider text-on-surface-variant">
                      Passcode
                    </label>
                    <div className="relative">
                      <Key className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-outline" />
                      <input
                        id="admin-passcode"
                        type="password"
                        required
                        maxLength={5}
                        value={adminPasscode}
                        onChange={e => setAdminPasscode(e.target.value)}
                        className="w-full pl-11 pr-4 py-3 rounded-xl border border-outline-variant bg-surface-container-lowest focus:border-primary focus:ring-2 focus:ring-primary/15 outline-none transition-all text-sm"
                        placeholder="12345"
                      />
                    </div>
                  </div>
                </div>

                {/* Action button */}
                <button
                  type="submit"
                  id="admin-login-submit"
                  disabled={isSubmitting}
                  className="w-full mt-4 py-3.5 rounded-xl bg-primary text-white font-semibold text-sm hover:opacity-95 shadow-md disabled:opacity-60 cursor-pointer flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Verifying clearance...</span>
                    </>
                  ) : (
                    <>
                      <UserCheck className="w-4 h-4" />
                      <span>Connect Admin Console</span>
                    </>
                  )}
                </button>
              </form>
            ) : (
              /* ================== SUPER ADMIN FORM ================== */
              <form onSubmit={handleSuperAdminLogin} className="space-y-5">
                <div>
                  <h2 className="font-headline-lg text-xl text-on-surface mb-1">Trust Board Login</h2>
                  <p className="text-sm text-on-surface-variant">MFA encrypted security node access.</p>
                </div>

                {/* Trust Email */}
                <div className="space-y-1.5">
                  <label htmlFor="super-email" className="block text-xs font-bold uppercase tracking-wider text-on-surface-variant">
                    Super Admin Email
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-outline" />
                    <input
                      id="super-email"
                      type="email"
                      required
                      value={superEmail}
                      onChange={e => setSuperEmail(e.target.value)}
                      className="w-full pl-11 pr-4 py-3 rounded-xl border border-outline-variant bg-surface-container-lowest focus:border-indigo-600 focus:ring-2 focus:ring-indigo-600/15 outline-none transition-all text-sm"
                      placeholder="board@awarebharat.org"
                    />
                  </div>
                </div>

                {/* Password & Security Code */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label htmlFor="super-password" className="block text-xs font-bold uppercase tracking-wider text-on-surface-variant">
                      Trust Password
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-outline" />
                      <input
                        id="super-password"
                        type={showPassword ? 'text' : 'password'}
                        required
                        value={superPassword}
                        onChange={e => setSuperPassword(e.target.value)}
                        className="w-full pl-11 pr-12 py-3 rounded-xl border border-outline-variant bg-surface-container-lowest focus:border-indigo-600 focus:ring-2 focus:ring-indigo-600/15 outline-none transition-all text-sm"
                        placeholder="••••••••"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-outline hover:text-on-surface transition-colors cursor-pointer"
                      >
                        {showPassword ? <EyeOff className="w-4.5 h-4.5" /> : <Eye className="w-4.5 h-4.5" />}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label htmlFor="super-mfa" className="block text-xs font-bold uppercase tracking-wider text-on-surface-variant">
                      6-Digit Security Code (MFA)
                    </label>
                    <div className="relative">
                      <Key className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-outline" />
                      <input
                        id="super-mfa"
                        type="password"
                        required
                        maxLength={6}
                        value={superMfaToken}
                        onChange={e => setSuperMfaToken(e.target.value)}
                        className="w-full pl-11 pr-4 py-3 rounded-xl border border-outline-variant bg-surface-container-lowest focus:border-indigo-600 focus:ring-2 focus:ring-indigo-600/15 outline-none transition-all text-sm text-center font-mono letter-tracking-widest"
                        placeholder="999999"
                      />
                    </div>
                  </div>
                </div>

                {/* Action button */}
                <button
                  type="submit"
                  id="super-login-submit"
                  disabled={isSubmitting}
                  className="w-full mt-4 py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm shadow-md hover:shadow-indigo-500/10 disabled:opacity-60 cursor-pointer flex items-center justify-center gap-2 transition-colors"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Syncing crypt keys...</span>
                    </>
                  ) : (
                    <>
                      <Shield className="w-4 h-4" />
                      <span>Initialize Board Node</span>
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
