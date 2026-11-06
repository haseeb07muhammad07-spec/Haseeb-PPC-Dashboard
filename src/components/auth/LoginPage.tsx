import React, { useState } from 'react';
import { 
  Lock, 
  Mail, 
  ArrowRight, 
  ShieldCheck, 
  AlertCircle,
  User,
  Send,
  Clock,
  CheckCircle2,
  HelpCircle,
  ArrowLeft
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const LoginPage: React.FC = () => {
  const { login, pendingInvite, acceptInvitation, requestAccess, accessRequests } = useAuth();

  // Mode: 'login' | 'request_access'
  const [activeTab, setActiveTab] = useState<'login' | 'request_access'>('login');

  // Acceptance form state (when ?invite=token is in URL)
  const [inviteName, setInviteName] = useState('');
  const [invitePassword, setInvitePassword] = useState('');

  // Standard login form state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState<{ status: string; message: string } | null>(null);

  // Request Access form state
  const [reqName, setReqName] = useState('');
  const [reqEmail, setReqEmail] = useState('');
  const [reqMessage, setReqMessage] = useState('');
  const [reqSuccessMsg, setReqSuccessMsg] = useState<string | null>(null);

  const handleAcceptInviteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pendingInvite || !inviteName.trim()) return;
    acceptInvitation(pendingInvite.inviteToken, inviteName, invitePassword);
  };

  const handleStandardLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);

    if (!email.trim()) {
      setLoginError({ status: 'VALIDATION', message: 'Please enter your authorized email address.' });
      return;
    }

    if (!password) {
      setLoginError({ status: 'VALIDATION', message: 'Please enter your account password.' });
      return;
    }

    const res = login(email, password);
    if (!res.success) {
      setLoginError({ status: res.status, message: res.message });
    }
  };

  const handleRequestAccessSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reqName.trim() || !reqEmail.trim()) return;

    const res = requestAccess(reqName, reqEmail, reqMessage);
    if (res.success) {
      setReqSuccessMsg(res.message);
      setReqName('');
      setReqEmail('');
      setReqMessage('');
    } else {
      setLoginError({ status: 'REQUEST_FAILED', message: res.message });
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
            <span>Private Security · Invite & Approval Locked</span>
          </div>
        </div>

        {/* CASE 1: Accepting a received Private Invitation Link (?invite=token) */}
        {pendingInvite ? (
          <div className="space-y-4 p-5 rounded-2xl bg-violet-50/70 border border-violet-200">
            <div className="space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-violet-700 block">
                Private Invitation Detected
              </span>
              <h2 className="text-sm font-bold text-slate-900">
                You've been authorized by Haseeb Malik
              </h2>
              <div className="flex items-center gap-2 pt-1 text-[11px] text-slate-600">
                <span>Assigned Role:</span>
                <span className="px-2 py-0.5 rounded-full font-bold bg-violet-200 text-violet-800 text-[10px]">
                  {pendingInvite.role.toUpperCase()}
                </span>
              </div>
            </div>

            <form onSubmit={handleAcceptInviteSubmit} className="space-y-3 pt-2">
              {/* STRICT EMAIL LOCK: The invited email is permanently locked to prevent bypass */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-[11px] font-bold text-slate-700 block">
                    Authorized Email Address (Locked)
                  </label>
                  <span className="text-[10px] text-violet-600 font-bold flex items-center gap-1">
                    <Lock className="w-3 h-3" />
                    <span>Locked to Invite</span>
                  </span>
                </div>
                <div className="relative">
                  <Mail className="w-4 h-4 text-violet-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    value={pendingInvite.email}
                    readOnly
                    disabled
                    className="w-full bg-violet-100/70 border border-violet-300 rounded-xl pl-9 pr-3 py-2 text-violet-900 font-mono text-xs font-bold cursor-not-allowed select-none shadow-xs"
                  />
                </div>
                <p className="text-[10px] text-slate-500 mt-1">
                  🔒 This link is strictly reserved for <strong className="text-slate-800">{pendingInvite.email}</strong>.
                </p>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1">
                  Your Full Name
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={inviteName}
                    onChange={(e) => setInviteName(e.target.value)}
                    placeholder="e.g. Thomas Mild / Alex"
                    className="w-full bg-white border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-slate-800 text-xs focus:outline-none focus:border-violet-500 shadow-sm"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1">
                  Create Account Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    required
                    value={invitePassword}
                    onChange={(e) => setInvitePassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-white border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-slate-800 text-xs focus:outline-none focus:border-violet-500 shadow-sm font-mono"
                  />
                </div>
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
        ) : activeTab === 'request_access' ? (
          /* CASE 3: Send Access Request to Haseeb Malik */
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <button
                onClick={() => {
                  setActiveTab('login');
                  setReqSuccessMsg(null);
                  setLoginError(null);
                }}
                className="flex items-center gap-1.5 text-xs font-bold text-violet-600 hover:text-violet-700 cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back to Sign In</span>
              </button>
              <span className="text-[11px] font-bold text-slate-500">Access Request Portal</span>
            </div>

            {reqSuccessMsg ? (
              <div className="p-5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 space-y-3">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                  <h3 className="font-bold text-xs text-slate-900">Request Sent Successfully!</h3>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  {reqSuccessMsg}
                </p>
                <div className="p-3 rounded-xl bg-white/80 border border-emerald-100 text-[11px] text-slate-600 space-y-1">
                  <p className="font-semibold text-slate-800">Agla Step:</p>
                  <p>Haseeb Malik apne Admin dashboard mein aapki request check karengay. Jab Haseeb aapko Role & Store access assign karkay approve karengay, tab aap login kar sakein gay.</p>
                </div>
                <button
                  onClick={() => {
                    setActiveTab('login');
                    setReqSuccessMsg(null);
                  }}
                  className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs cursor-pointer transition-colors shadow-xs"
                >
                  Return to Login
                </button>
              </div>
            ) : (
              <form onSubmit={handleRequestAccessSubmit} className="space-y-3.5">
                <div className="p-3 rounded-xl bg-violet-50/70 border border-violet-100 text-xs text-violet-900">
                  <p className="font-bold text-[11px] text-violet-800 flex items-center gap-1.5 mb-0.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-violet-600" />
                    <span>Private Store Dashboard</span>
                  </p>
                  <p className="text-[11px] text-slate-600">
                    Agar aapke paas invitation link nahi hai, toh yahan apna naam aur email submit karein. Haseeb Malik aapki request review karke access grant karengay.
                  </p>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">
                    Your Full Name <span className="text-violet-600">*</span>
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      value={reqName}
                      onChange={(e) => setReqName(e.target.value)}
                      placeholder="e.g. Thomas Mild / Benoit"
                      className="w-full bg-white border border-slate-200 rounded-xl pl-9 pr-3 py-2.5 text-slate-800 text-xs focus:outline-none focus:border-violet-500 shadow-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">
                    Your Email Address <span className="text-violet-600">*</span>
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      required
                      value={reqEmail}
                      onChange={(e) => setReqEmail(e.target.value)}
                      placeholder="e.g. client@tomishop.de"
                      className="w-full bg-white border border-slate-200 rounded-xl pl-9 pr-3 py-2.5 text-slate-800 text-xs focus:outline-none focus:border-violet-500 shadow-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">
                    Store / Brand Details (Optional)
                  </label>
                  <textarea
                    rows={2}
                    value={reqMessage}
                    onChange={(e) => setReqMessage(e.target.value)}
                    placeholder="e.g. Tomishop DE client store, need viewer access"
                    className="w-full bg-white border border-slate-200 rounded-xl p-2.5 text-slate-800 text-xs focus:outline-none focus:border-violet-500 shadow-sm resize-none"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 rounded-2xl bg-[#7C5CFC] hover:bg-[#6C4CEE] text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md shadow-violet-500/25 cursor-pointer hover:shadow-lg transition-all card-popup"
                >
                  <Send className="w-4 h-4" />
                  <span>Send Request to Haseeb Malik</span>
                </button>
              </form>
            )}
          </div>
        ) : (
          /* CASE 2: Strict Secure Login Form */
          <div className="space-y-4">
            {loginError && (
              <div className={`p-4 rounded-2xl border text-xs leading-relaxed space-y-2 shadow-xs ${
                loginError.status === 'PENDING_APPROVAL'
                  ? 'bg-amber-50 border-amber-200 text-amber-900'
                  : loginError.status === 'REJECTED'
                  ? 'bg-rose-50 border-rose-200 text-rose-900'
                  : 'bg-rose-50 border-rose-200 text-rose-900'
              }`}>
                <div className="flex items-start gap-2">
                  {loginError.status === 'PENDING_APPROVAL' ? (
                    <Clock className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  )}
                  <span className="font-semibold">{loginError.message}</span>
                </div>

                {loginError.status === 'UNAUTHORIZED' && (
                  <button
                    type="button"
                    onClick={() => {
                      setReqEmail(email);
                      setActiveTab('request_access');
                      setLoginError(null);
                    }}
                    className="w-full py-2 px-3 rounded-xl bg-violet-600 hover:bg-violet-700 text-white font-bold text-[11px] flex items-center justify-center gap-1.5 cursor-pointer transition-colors shadow-xs mt-2"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Request Access from Haseeb Malik</span>
                  </button>
                )}
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
                      if (loginError) setLoginError(null);
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
                      if (loginError) setLoginError(null);
                    }}
                    placeholder="••••••••"
                    className="w-full bg-white border border-slate-200 rounded-2xl pl-9 pr-3 py-2.5 text-slate-800 text-xs focus:outline-none focus:border-violet-500 shadow-sm font-mono"
                  />
                </div>
              </div>

              <div className="text-[11px] text-slate-500 bg-slate-50 p-3 rounded-xl border border-slate-200/80 leading-relaxed">
                ℹ️ <strong>Strict Privacy Protocol:</strong> Only emails authorized or approved by Haseeb Malik can sign in.
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-2xl bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md shadow-violet-500/25 cursor-pointer hover:shadow-lg transition-all card-popup"
              >
                <span>Secure Sign In</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>

            <div className="pt-2 text-center border-t border-slate-100">
              <button
                type="button"
                onClick={() => {
                  setReqEmail(email);
                  setActiveTab('request_access');
                  setLoginError(null);
                }}
                className="text-xs font-semibold text-violet-700 hover:text-violet-800 cursor-pointer inline-flex items-center gap-1.5"
              >
                <HelpCircle className="w-3.5 h-3.5" />
                <span>Don't have an invitation? Request Access from Haseeb</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
