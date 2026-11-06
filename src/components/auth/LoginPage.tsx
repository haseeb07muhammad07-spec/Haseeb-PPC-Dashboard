import React, { useState } from 'react';
import { 
  Lock, 
  Mail, 
  ArrowRight, 
  ShieldCheck, 
  AlertCircle
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const LoginPage: React.FC = () => {
  const { login, pendingInvite, acceptInvitation } = useAuth();

  // Acceptance form state
  const [inviteName, setInviteName] = useState('');
  const [invitePassword, setInvitePassword] = useState('');

  // Standard login form state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleAcceptInviteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pendingInvite || !inviteName.trim()) return;
    acceptInvitation(pendingInvite.inviteToken, inviteName, invitePassword);
  };

  const handleStandardLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!email.trim()) {
      setErrorMessage('Please enter your authorized email address.');
      return;
    }

    if (!password) {
      setErrorMessage('Please enter your account password.');
      return;
    }

    const success = login(email, password);
    if (!success) {
      setErrorMessage('Access Denied: This email has not been invited by Haseeb Malik. Only authorized clients with a private invitation link can access this dashboard.');
    }
  };

  return (
    <div className="min-h-screen w-screen bg-[#f5f3f9] flex items-center justify-center p-4 text-slate-800 relative selection:bg-violet-500/20 selection:text-violet-900 font-sans">
      {/* Background ambient gradient glow */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
        <div className="absolute -top-40 -left-40 w-[500px] h-[500px] bg-violet-200/50 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -right-40 w-[550px] h-[550px] bg-indigo-200/50 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/3 w-96 h-96 bg-rose-100/40 rounded-full blur-3xl" />
      </div>

      <div className="card-popup glass-container w-full max-w-md rounded-3xl p-6 sm:p-8 relative z-10 space-y-6">
        {/* Brand Lockup */}
        <div className="text-center space-y-2">
          {/* Logo Mark */}
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-violet-600 via-violet-500 to-indigo-500 mx-auto flex items-center justify-center shadow-lg shadow-violet-500/25">
            <div className="w-7 h-7 rounded-full border-2 border-white flex items-center justify-center">
              <div className="w-2 h-2 rounded-full bg-white" />
            </div>
          </div>
          <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">Haseeb PPC Command Center</h1>
          <p className="text-xs text-slate-500 font-medium">
            Multi-Account Amazon Seller Central & Operations Portal
          </p>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-violet-50 border border-violet-200 text-violet-700 text-[10px] font-bold">
            <ShieldCheck className="w-3.5 h-3.5 text-violet-600" />
            <span>Private Access · Authorized Accounts & Invite Only</span>
          </div>
        </div>

        {/* CASE 1: Accepting a received Private Invitation Link */}
        {pendingInvite ? (
          <div className="space-y-4 p-5 rounded-2xl bg-violet-50/70 border border-violet-200">
            <div className="space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-violet-700 block">
                Private Invitation Detected
              </span>
              <h2 className="text-sm font-bold text-slate-900">
                You've been authorized by Haseeb Malik
              </h2>
              <p className="text-xs text-slate-600 leading-relaxed mt-1">
                Recipient Email: <strong className="text-slate-900">{pendingInvite.email}</strong>
              </p>
              <div className="flex items-center gap-2 pt-1 text-[11px] text-slate-600">
                <span>Assigned Permission:</span>
                <span className="px-2 py-0.5 rounded-full font-bold bg-violet-200 text-violet-800">
                  {pendingInvite.role.toUpperCase()} ({pendingInvite.roleLabel})
                </span>
              </div>
            </div>

            <form onSubmit={handleAcceptInviteSubmit} className="space-y-3 pt-2">
              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1">
                  Your Full Name
                </label>
                <input
                  type="text"
                  required
                  value={inviteName}
                  onChange={(e) => setInviteName(e.target.value)}
                  placeholder="e.g. Thomas Mild / Alex"
                  className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-800 text-xs focus:outline-none focus:border-violet-500 shadow-sm"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1">
                  Create Account Password
                </label>
                <input
                  type="password"
                  required
                  value={invitePassword}
                  onChange={(e) => setInvitePassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-800 text-xs focus:outline-none focus:border-violet-500 shadow-sm font-mono"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-2xl bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md shadow-violet-500/25 cursor-pointer hover:shadow-lg transition-all"
              >
                <span>Accept Private Invite & Enter Dashboard</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          </div>
        ) : (
          /* CASE 2: Strict Secure Login Form (No bypass buttons) */
          <div className="space-y-4">
            {errorMessage && (
              <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start gap-2 shadow-xs">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <span className="leading-relaxed">{errorMessage}</span>
              </div>
            )}

            <form onSubmit={handleStandardLogin} className="space-y-4">
              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1">
                  Authorized Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (errorMessage) setErrorMessage(null);
                    }}
                    placeholder="e.g. haseeb07malik07@gmail.com"
                    className="w-full bg-white border border-slate-200 rounded-2xl pl-9 pr-3 py-2.5 text-slate-800 text-xs focus:outline-none focus:border-violet-500 shadow-sm"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1">
                  Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (errorMessage) setErrorMessage(null);
                    }}
                    placeholder="••••••••"
                    className="w-full bg-white border border-slate-200 rounded-2xl pl-9 pr-3 py-2.5 text-slate-800 text-xs focus:outline-none focus:border-violet-500 shadow-sm font-mono"
                  />
                </div>
              </div>

              <div className="text-[11px] text-slate-500 bg-slate-50 p-3 rounded-xl border border-slate-200/80 leading-relaxed">
                ℹ️ <strong>Private Access Note:</strong> Only accounts registered by Haseeb Malik or recipients of an active invitation link can access this dashboard.
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-2xl bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md shadow-violet-500/25 cursor-pointer hover:shadow-lg transition-all card-popup"
              >
                <span>Secure Sign In</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};
