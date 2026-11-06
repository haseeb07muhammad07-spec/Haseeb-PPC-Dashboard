import React, { useState } from 'react';
import { 
  Lock, 
  Mail, 
  User, 
  ArrowRight, 
  ShieldCheck, 
  CheckCircle2, 
  Sparkles,
  Users
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { UserRole } from '../../types';

export const LoginPage: React.FC = () => {
  const { login, pendingInvite, acceptInvitation } = useAuth();

  // Acceptance form state
  const [inviteName, setInviteName] = useState('');
  const [invitePassword, setInvitePassword] = useState('');

  // Standard login form state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [selectedRole, setSelectedRole] = useState<UserRole>('admin');

  const handleAcceptInviteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pendingInvite || !inviteName.trim()) return;
    acceptInvitation(pendingInvite.inviteToken, inviteName, invitePassword);
  };

  const handleStandardLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    login(email, password, selectedRole);
  };

  const handleFastLogin = (memberEmail: string, role: UserRole) => {
    login(memberEmail, 'password', role);
  };

  return (
    <div className="min-h-screen w-screen bg-[#f5f3f9] flex items-center justify-center p-4 text-slate-800 relative selection:bg-violet-500/20 selection:text-violet-900 font-sans">
      {/* Background ambient gradient glow matching screenshot */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
        <div className="absolute -top-40 -left-40 w-[500px] h-[500px] bg-violet-200/50 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -right-40 w-[550px] h-[550px] bg-indigo-200/50 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/3 w-96 h-96 bg-rose-100/40 rounded-full blur-3xl" />
      </div>

      <div className="card-popup glass-container w-full max-w-md rounded-3xl p-6 sm:p-8 relative z-10 space-y-6">
        {/* Brand Lockup */}
        <div className="text-center space-y-2">
          {/* Logo Mark Matching Screenshot */}
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
            <span>Protected Access · Login or Invite Link</span>
          </div>
        </div>

        {/* CASE 1: Accepting a received Invitation Link */}
        {pendingInvite ? (
          <div className="space-y-4 p-5 rounded-2xl bg-violet-50/70 border border-violet-200">
            <div className="space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-violet-700 block">
                Team Invitation Detected
              </span>
              <h2 className="text-sm font-bold text-slate-900">
                You've been invited to join the Command Center
              </h2>
              <p className="text-xs text-slate-600 leading-relaxed mt-1">
                Invited by: <strong className="text-slate-900">{pendingInvite.invitedBy}</strong>
              </p>
              <div className="flex items-center gap-2 pt-1 text-[11px] text-slate-600">
                <span>Role:</span>
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
                  Choose a Password
                </label>
                <input
                  type="password"
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
                <span>Accept Invite & Open Dashboard</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          </div>
        ) : (
          /* CASE 2: Standard Login with 1-Click Fast Roles */
          <div className="space-y-5">
            {/* Quick 1-Click Role Login Bar */}
            <div className="space-y-2">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                Quick 1-Click Test Login:
              </span>
              <div className="space-y-2">
                <button
                  type="button"
                  onClick={() => handleFastLogin('haseeb07malik07@gmail.com', 'admin')}
                  className="card-popup w-full p-3 rounded-2xl bg-white/90 border border-slate-200/90 shadow-sm hover:border-violet-300 transition-all text-left flex items-center justify-between cursor-pointer group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-violet-600 to-indigo-600 text-white font-bold flex items-center justify-center text-xs shadow-sm">
                      HM
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-900 group-hover:text-violet-600 transition-colors">
                        Haseeb Malik (Agency Owner)
                      </p>
                      <p className="text-[10px] text-slate-500">haseeb07malik07@gmail.com · Full Admin</p>
                    </div>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-violet-100 text-violet-700">
                    Admin
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => handleFastLogin('thomas.mild@tomishop.de', 'viewer')}
                  className="card-popup w-full p-3 rounded-2xl bg-white/90 border border-slate-200/90 shadow-sm hover:border-violet-300 transition-all text-left flex items-center justify-between cursor-pointer group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-slate-100 border border-slate-200 text-slate-800 font-bold flex items-center justify-center text-xs">
                      TM
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-900 group-hover:text-violet-600 transition-colors">
                        Thomas Mild (Client · Tomishop DE)
                      </p>
                      <p className="text-[10px] text-slate-500">thomas.mild@tomishop.de · Client Viewer</p>
                    </div>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700">
                    Viewer
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => handleFastLogin('haas@baihaas.de', 'viewer')}
                  className="card-popup w-full p-3 rounded-2xl bg-white/90 border border-slate-200/90 shadow-sm hover:border-violet-300 transition-all text-left flex items-center justify-between cursor-pointer group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-slate-100 border border-slate-200 text-slate-800 font-bold flex items-center justify-center text-xs">
                      HN
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-900 group-hover:text-violet-600 transition-colors">
                        Haas (Client · Baihaas Natürlich)
                      </p>
                      <p className="text-[10px] text-slate-500">haas@baihaas.de · Client Viewer</p>
                    </div>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700">
                    Viewer
                  </span>
                </button>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="h-px bg-slate-200 flex-1" />
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">or sign in with password</span>
              <div className="h-px bg-slate-200 flex-1" />
            </div>

            {/* Standard Login Form */}
            <form onSubmit={handleStandardLogin} className="space-y-4">
              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@agency.com"
                    className="w-full bg-white border border-slate-200 rounded-2xl pl-9 pr-3 py-2 text-slate-800 text-xs focus:outline-none focus:border-violet-500 shadow-sm"
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
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-white border border-slate-200 rounded-2xl pl-9 pr-3 py-2 text-slate-800 text-xs focus:outline-none focus:border-violet-500 shadow-sm font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1.5">
                  Sign in as Role:
                </label>
                <div className="grid grid-cols-3 gap-2 text-xs">
                  <button
                    type="button"
                    onClick={() => setSelectedRole('admin')}
                    className={`py-2 px-2 rounded-xl text-[11px] font-bold border transition-all cursor-pointer ${
                      selectedRole === 'admin'
                        ? 'bg-violet-600 text-white border-violet-600 shadow-sm'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    Admin
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedRole('editor')}
                    className={`py-2 px-2 rounded-xl text-[11px] font-bold border transition-all cursor-pointer ${
                      selectedRole === 'editor'
                        ? 'bg-violet-600 text-white border-violet-600 shadow-sm'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    Editor
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedRole('viewer')}
                    className={`py-2 px-2 rounded-xl text-[11px] font-bold border transition-all cursor-pointer ${
                      selectedRole === 'viewer'
                        ? 'bg-violet-600 text-white border-violet-600 shadow-sm'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    Viewer
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-2xl bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md shadow-violet-500/25 cursor-pointer hover:shadow-lg transition-all"
              >
                <span>Enter Dashboard</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};
