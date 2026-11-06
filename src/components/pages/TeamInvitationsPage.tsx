import React, { useState } from 'react';
import { 
  UserPlus, 
  Copy, 
  Check, 
  ShieldCheck, 
  Eye, 
  Edit3, 
  Trash2, 
  CheckCircle2, 
  XCircle,
  Mail,
  Send,
  MessageSquare,
  Clock,
  UserCheck,
  UserX,
  AlertCircle
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import { UserRole, TeamInvitation, AccessRequest } from '../../types';
import { Modal } from '../common/Modal';

export const TeamInvitationsPage: React.FC = () => {
  const { 
    currentUser, 
    teamMembers, 
    invitations, 
    accessRequests,
    createInvitation, 
    revokeInvitation, 
    markInviteEmailSent,
    deleteTeamMember,
    approveAccessRequest,
    rejectAccessRequest,
    deleteAccessRequest,
    hasPermission 
  } = useAuth();
  
  const { accounts } = useApp();

  // Invite creation modal state
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<UserRole>('viewer');
  const [assignedAccounts, setAssignedAccounts] = useState<string>('all');
  
  // Last created invitation object
  const [lastCreatedInvite, setLastCreatedInvite] = useState<TeamInvitation | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [emailStatusMessage, setEmailStatusMessage] = useState<string | null>(null);

  // Approval modal state
  const [requestToApprove, setRequestToApprove] = useState<AccessRequest | null>(null);
  const [approvalRole, setApprovalRole] = useState<UserRole>('viewer');
  const [approvalAccounts, setApprovalAccounts] = useState<string>('all');

  const pendingRequests = accessRequests.filter(r => r.status === 'PENDING');
  const processedRequests = accessRequests.filter(r => r.status !== 'PENDING');

  // Helper to build email subject and body
  const buildEmailContent = (inv: TeamInvitation) => {
    const senderName = currentUser?.name || 'Haseeb Malik';
    const storeLabel = inv.assignedAccounts === 'all' 
      ? 'All Client Accounts' 
      : accounts.find(a => inv.assignedAccounts.includes(a.id))?.name || 'Your Amazon Store';

    const subject = `Invitation: Access your Amazon Seller & PPC Command Center (${storeLabel})`;
    
    const body = `Hello,

${senderName} has invited you to access the Amazon Seller & PPC Operations Command Center.

Account / Store: ${storeLabel}
Permission Level: ${inv.roleLabel}
Access Link: ${inv.inviteLink}

Click the link above to log in directly and review your store performance metrics, PPC ad efficiency, and operational activity logs. Note: This private link is locked to your email (${inv.email}).

Best regards,
${senderName}
Amazon Operations Team`;

    return { subject, body };
  };

  // 1-Click Send via Gmail Web Draft
  const handleSendViaGmail = (inv: TeamInvitation) => {
    const { subject, body } = buildEmailContent(inv);
    const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(inv.email)}&su=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.open(gmailUrl, '_blank');
    markInviteEmailSent(inv.id, 'gmail');
    setEmailStatusMessage(`Gmail draft opened for ${inv.email}. Click 'Send' in Gmail!`);
    setTimeout(() => setEmailStatusMessage(null), 4000);
  };

  // 1-Click Send via Default Email Client (mailto:)
  const handleSendViaMailto = (inv: TeamInvitation) => {
    const { subject, body } = buildEmailContent(inv);
    const mailtoUrl = `mailto:${encodeURIComponent(inv.email)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.location.href = mailtoUrl;
    markInviteEmailSent(inv.id, 'mailto');
    setEmailStatusMessage(`Default mail client opened for ${inv.email}!`);
    setTimeout(() => setEmailStatusMessage(null), 4000);
  };

  // Copy full ready-to-paste email
  const handleCopyFullEmail = (inv: TeamInvitation) => {
    const { subject, body } = buildEmailContent(inv);
    const fullText = `Subject: ${subject}\n\n${body}`;
    navigator.clipboard.writeText(fullText);
    markInviteEmailSent(inv.id, 'copied');
    setCopiedId(`full-${inv.id}`);
    setTimeout(() => setCopiedId(null), 2500);
  };

  // Share via WhatsApp
  const handleSendViaWhatsApp = (inv: TeamInvitation) => {
    const { body } = buildEmailContent(inv);
    const waUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(body)}`;
    window.open(waUrl, '_blank');
  };

  const handleCreateInviteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail.trim()) return;

    const accountsParam = assignedAccounts === 'all' ? 'all' : [assignedAccounts];
    const newInv = createInvitation(inviteEmail, inviteRole, accountsParam);
    setLastCreatedInvite(newInv);
    setInviteEmail('');
  };

  const handleConfirmApproval = (e: React.FormEvent) => {
    e.preventDefault();
    if (!requestToApprove) return;

    const accountsParam = approvalAccounts === 'all' ? 'all' : [approvalAccounts];
    approveAccessRequest(requestToApprove.id, approvalRole, accountsParam);
    
    setEmailStatusMessage(`Access approved for ${requestToApprove.name} (${requestToApprove.email}) as ${approvalRole.toUpperCase()}!`);
    setTimeout(() => setEmailStatusMessage(null), 4000);
    setRequestToApprove(null);
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  const canManageTeam = hasPermission('admin');

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <span>Team & Client Access Permissions</span>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono bg-violet-50 text-violet-700 border border-violet-200 font-semibold">
              Private Invite & Approval Security
            </span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Only emails invited or directly approved by Haseeb Malik can access this portal.
          </p>
        </div>

        {canManageTeam && (
          <button
            onClick={() => {
              setLastCreatedInvite(null);
              setIsInviteModalOpen(true);
            }}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#7C5CFC] hover:bg-[#6C4CEE] text-white font-bold text-xs transition-all cursor-pointer shadow-md shadow-violet-500/20 self-start sm:self-auto card-popup"
          >
            <UserPlus className="w-4 h-4 stroke-[2.5]" />
            <span>Invite New Member / Client</span>
          </button>
        )}
      </div>

      {/* Floating Status Notification */}
      {emailStatusMessage && (
        <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2 shadow-xs transition-all">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{emailStatusMessage}</span>
        </div>
      )}

      {/* SECTION 1: Pending Access Requests Queue (Crucial Feature for Uninvited Access Requests) */}
      <div className="p-6 rounded-2xl glass-card space-y-4 card-popup border-2 border-amber-200/60 bg-gradient-to-r from-amber-50/40 via-white to-violet-50/20">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-100 border border-amber-200 flex items-center justify-center text-amber-700">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-slate-900 tracking-tight">
                  Access Requests Pending Your Approval
                </h3>
                <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${
                  pendingRequests.length > 0
                    ? 'bg-amber-500 text-white animate-pulse'
                    : 'bg-slate-100 text-slate-500'
                }`}>
                  {pendingRequests.length} Pending
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Users who tried to sign in or requested access. Only you (Haseeb) can approve them.
              </p>
            </div>
          </div>
        </div>

        {pendingRequests.length === 0 ? (
          <div className="p-4 rounded-xl bg-slate-50/80 border border-slate-200/80 text-center text-xs text-slate-500 flex items-center justify-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Koi pending access request nahi hai. Sabhi unauthorized log bahar rahengay jab tak request na bhejein.</span>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-amber-200/80 text-slate-400 font-semibold text-[11px] uppercase tracking-wider">
                  <th className="pb-3 pl-2">Requester Name</th>
                  <th className="pb-3">Email Address</th>
                  <th className="pb-3">Client Note / Message</th>
                  <th className="pb-3">Requested At</th>
                  <th className="pb-3 text-right pr-2">Your Decision</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-amber-100 font-sans">
                {pendingRequests.map(req => (
                  <tr key={req.id} className="hover:bg-amber-50/50 transition-colors">
                    <td className="py-3 pl-2 font-bold text-slate-900">
                      {req.name}
                    </td>
                    <td className="py-3 font-mono text-violet-700 font-semibold">
                      {req.email}
                    </td>
                    <td className="py-3 text-slate-600 max-w-xs truncate">
                      {req.message || <span className="text-slate-400 italic">No note provided</span>}
                    </td>
                    <td className="py-3 text-[11px] text-slate-500 font-mono">
                      {req.requestedAt}
                    </td>
                    <td className="py-3 text-right pr-2">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => {
                            setRequestToApprove(req);
                            setApprovalRole('viewer');
                            setApprovalAccounts('all');
                          }}
                          className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 transition-all shadow-xs cursor-pointer card-popup"
                        >
                          <UserCheck className="w-3.5 h-3.5" />
                          <span>Approve & Assign</span>
                        </button>

                        <button
                          onClick={() => rejectAccessRequest(req.id)}
                          className="px-2.5 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-bold text-xs flex items-center gap-1 transition-all cursor-pointer"
                          title="Decline request"
                        >
                          <UserX className="w-3.5 h-3.5" />
                          <span>Decline</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Permission Tier Breakdown Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl glass-card space-y-2 card-popup">
          <div className="flex items-center justify-between">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-violet-100 text-violet-800">
              Admin (Owner)
            </span>
            <ShieldCheck className="w-4 h-4 text-violet-600" />
          </div>
          <h3 className="font-bold text-slate-900 text-xs">Full Control Access</h3>
          <p className="text-[11px] text-slate-500 leading-relaxed">
            Haseeb Malik account. Can approve requests, add/delete client accounts, send invites, and manage settings.
          </p>
        </div>

        <div className="p-5 rounded-2xl glass-card space-y-2 card-popup">
          <div className="flex items-center justify-between">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
              Editor (VA Specialist)
            </span>
            <Edit3 className="w-4 h-4 text-blue-600" />
          </div>
          <h3 className="font-bold text-slate-900 text-xs">Operations & Edit Permission</h3>
          <p className="text-[11px] text-slate-500 leading-relaxed">
            Can log daily activities, optimize PPC bids, harvest negative keywords, and plan FBA restocks. Cannot delete accounts.
          </p>
        </div>

        <div className="p-5 rounded-2xl glass-card space-y-2 card-popup">
          <div className="flex items-center justify-between">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
              Viewer (Client Store Owner)
            </span>
            <Eye className="w-4 h-4 text-slate-500" />
          </div>
          <h3 className="font-bold text-slate-900 text-xs">Read-Only Oversight</h3>
          <p className="text-[11px] text-slate-500 leading-relaxed">
            Can view Overview metrics, sales charts, reports, and activity logs for their store only. Cannot edit bids or modify data.
          </p>
        </div>
      </div>

      {/* Generated Invitation Links & Email Dispatch Table */}
      <div className="p-6 rounded-2xl glass-card space-y-4 card-popup">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-sm font-bold text-slate-900 tracking-tight">
              Invitations & Email Dispatch Status ({invitations.length})
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Each invitation link is strictly locked to the recipient's email address.
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200/80 text-slate-400 font-semibold text-[11px] uppercase tracking-wider">
                <th className="pb-3 pl-2">Invitee Email</th>
                <th className="pb-3">Role Granted</th>
                <th className="pb-3">Delivery & Acceptance Status</th>
                <th className="pb-3">Created / Expires</th>
                <th className="pb-3 text-right pr-2">Send Email & Share Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-sans">
              {invitations.map(inv => (
                <tr key={inv.id} className="hover:bg-violet-50/40 transition-colors">
                  <td className="py-3 pl-2 font-mono font-semibold text-slate-800">
                    <div className="flex items-center gap-2">
                      <Mail className="w-3.5 h-3.5 text-violet-600" />
                      <span>{inv.email}</span>
                    </div>
                  </td>

                  <td className="py-3">
                    <span className="font-bold text-violet-700 font-mono">
                      {inv.role.toUpperCase()}
                    </span>
                    <span className="text-[10px] text-slate-400 block font-normal">
                      {inv.assignedAccounts === 'all' ? 'All Stores' : 'Selected Store'}
                    </span>
                  </td>

                  <td className="py-3">
                    <div className="space-y-1">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        inv.status === 'ACCEPTED'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : inv.status === 'PENDING'
                          ? 'bg-amber-50 text-amber-700 border border-amber-200'
                          : 'bg-rose-50 text-rose-700 border border-rose-200'
                      }`}>
                        {inv.status}
                      </span>
                      {inv.emailSentAt ? (
                        <span className="text-[10px] text-emerald-700 flex items-center gap-1 font-medium">
                          <Check className="w-3 h-3 text-emerald-600" />
                          <span>Sent via {inv.emailMethod === 'gmail' ? 'Gmail' : 'Email'} ({inv.emailSentAt})</span>
                        </span>
                      ) : (
                        <span className="text-[10px] text-slate-400 block italic">
                          Click 'Send Email' to deliver
                        </span>
                      )}
                    </div>
                  </td>

                  <td className="py-3 font-mono text-slate-500 text-[11px]">
                    <div>Created: {inv.createdAt}</div>
                    <div className="text-[10px] text-slate-400">Expires: {inv.expiresAt}</div>
                  </td>

                  <td className="py-3 text-right pr-2">
                    <div className="flex items-center justify-end gap-1.5 flex-wrap">
                      {/* Send via Gmail Button */}
                      <button
                        onClick={() => handleSendViaGmail(inv)}
                        className="px-2.5 py-1.5 rounded-xl bg-violet-50 hover:bg-violet-100 text-violet-700 text-[11px] font-bold flex items-center gap-1 transition-all cursor-pointer border border-violet-200 shadow-xs card-popup"
                        title="Open in Gmail Draft"
                      >
                        <Send className="w-3 h-3 text-violet-600" />
                        <span>Gmail</span>
                      </button>

                      {/* Send via Default Email Button */}
                      <button
                        onClick={() => handleSendViaMailto(inv)}
                        className="px-2.5 py-1.5 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 text-[11px] font-bold flex items-center gap-1 transition-all cursor-pointer border border-slate-200 shadow-xs card-popup"
                        title="Open in Default Mail Client (Outlook / Apple Mail)"
                      >
                        <Mail className="w-3 h-3 text-slate-500" />
                        <span>Mail</span>
                      </button>

                      {/* Copy Link Button */}
                      <button
                        onClick={() => copyToClipboard(inv.inviteLink, inv.id)}
                        className="px-2.5 py-1.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 text-[11px] font-bold flex items-center gap-1 transition-all cursor-pointer border border-slate-200 shadow-xs card-popup"
                        title="Copy direct invite link"
                      >
                        {copiedId === inv.id ? (
                          <>
                            <Check className="w-3 h-3 text-emerald-600" />
                            <span className="text-emerald-700">Copied!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3 text-slate-400" />
                            <span>Link</span>
                          </>
                        )}
                      </button>

                      {inv.status === 'PENDING' && canManageTeam && (
                        <button
                          onClick={() => revokeInvitation(inv.id)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 cursor-pointer"
                          title="Revoke link"
                        >
                          <XCircle className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Active Team Members Table */}
      <div className="p-6 rounded-2xl glass-card space-y-4 card-popup">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900 tracking-tight">
              Active Authorized Team Members & Clients ({teamMembers.length})
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Users currently permitted to log in and access the dashboard.
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200/80 text-slate-400 font-semibold text-[11px] uppercase tracking-wider">
                <th className="pb-3 pl-2">Member Name & Email</th>
                <th className="pb-3">Permission Role</th>
                <th className="pb-3">Accessible Accounts</th>
                <th className="pb-3">Joined Date</th>
                <th className="pb-3 text-right pr-2">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-sans">
              {teamMembers.map(m => {
                const isYou = currentUser?.id === m.id;

                return (
                  <tr key={m.id} className="hover:bg-violet-50/40 transition-colors">
                    <td className="py-3 pl-2">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-xl bg-violet-100 border border-violet-200 flex items-center justify-center text-violet-700 font-bold text-xs shrink-0">
                          {m.avatarInitials}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900 flex items-center gap-1.5">
                            <span>{m.name}</span>
                            {isYou && (
                              <span className="px-2 py-0.2 rounded-full text-[10px] font-mono bg-violet-50 text-violet-700 font-bold">
                                You
                              </span>
                            )}
                          </p>
                          <p className="text-[10px] text-slate-500 font-mono">{m.email}</p>
                        </div>
                      </div>
                    </td>

                    <td className="py-3">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        m.role === 'admin' 
                          ? 'bg-violet-100 text-violet-800 border border-violet-200' 
                          : m.role === 'editor' 
                          ? 'bg-blue-50 text-blue-700 border border-blue-200' 
                          : 'bg-slate-100 text-slate-700 border border-slate-200'
                      }`}>
                        {m.role.toUpperCase()}
                      </span>
                    </td>

                    <td className="py-3 text-slate-700">
                      {m.accessibleAccountIds === 'all' ? (
                        <span className="text-emerald-700 font-semibold">All Client Accounts ({accounts.length})</span>
                      ) : (
                        <span className="font-medium">{m.accessibleAccountIds.length} Assigned Store(s)</span>
                      )}
                    </td>

                    <td className="py-3 font-mono text-slate-500">
                      {m.createdAt}
                    </td>

                    <td className="py-3 text-right pr-2">
                      {canManageTeam && !isYou && (
                        <button
                          onClick={() => {
                            if (window.confirm(`Revoke access for ${m.name}?`)) {
                              deleteTeamMember(m.id);
                            }
                          }}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                          title="Revoke user access"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL 1: Approve Access Request Modal */}
      {requestToApprove && (
        <Modal
          isOpen={!!requestToApprove}
          onClose={() => setRequestToApprove(null)}
          title="Approve User Access Request"
          subtitle={`Assign permissions and storefront access for ${requestToApprove.name}.`}
          maxWidth="md"
        >
          <form onSubmit={handleConfirmApproval} className="space-y-4 text-xs">
            <div className="p-3 rounded-xl bg-violet-50 border border-violet-200 space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-violet-700 block">
                Requester Details
              </span>
              <p className="font-bold text-slate-900 text-sm">{requestToApprove.name}</p>
              <p className="font-mono text-violet-800">{requestToApprove.email}</p>
              {requestToApprove.message && (
                <p className="text-[11px] text-slate-600 mt-1 italic">
                  "{requestToApprove.message}"
                </p>
              )}
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">
                Select Permission Role <span className="text-violet-600">*</span>
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setApprovalRole('viewer')}
                  className={`p-3 rounded-xl border text-left cursor-pointer transition-all ${
                    approvalRole === 'viewer'
                      ? 'bg-purple-50 border-purple-400 text-purple-900 ring-2 ring-purple-500/20'
                      : 'bg-slate-50 border-slate-200 text-slate-600'
                  }`}
                >
                  <span className="font-bold block text-xs">Viewer (Client)</span>
                  <span className="text-[10px] text-slate-500 block mt-0.5">Read-only oversight</span>
                </button>

                <button
                  type="button"
                  onClick={() => setApprovalRole('editor')}
                  className={`p-3 rounded-xl border text-left cursor-pointer transition-all ${
                    approvalRole === 'editor'
                      ? 'bg-blue-50 border-blue-400 text-blue-900 ring-2 ring-blue-500/20'
                      : 'bg-slate-50 border-slate-200 text-slate-600'
                  }`}
                >
                  <span className="font-bold block text-xs">Editor (VA Specialist)</span>
                  <span className="text-[10px] text-slate-500 block mt-0.5">Can edit bids & logs</span>
                </button>
              </div>
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">
                Storefront Access Scope
              </label>
              <select
                value={approvalAccounts}
                onChange={(e) => setApprovalAccounts(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-800 focus:outline-none focus:border-violet-500"
              >
                <option value="all">All Store Accounts (Global Agency Scope)</option>
                {accounts.map(a => (
                  <option key={a.id} value={a.id}>
                    {a.name} ({a.marketplace})
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setRequestToApprove(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs cursor-pointer shadow-md shadow-emerald-500/20 card-popup flex items-center gap-1.5"
              >
                <UserCheck className="w-3.5 h-3.5" />
                <span>Confirm & Grant Access</span>
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* MODAL 2: Invite Member & Direct Send Email Modal */}
      {isInviteModalOpen && (
        <Modal
          isOpen={isInviteModalOpen}
          onClose={() => setIsInviteModalOpen(false)}
          title="Invite New Team Member or Client"
          subtitle="Generate and dispatch an invitation email directly to the recipient."
          maxWidth="lg"
        >
          {lastCreatedInvite ? (
            <div className="space-y-4 text-xs">
              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 space-y-2">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  <h4 className="font-bold text-slate-900 text-sm">Invitation Generated for {lastCreatedInvite.email}!</h4>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Choose how you want to deliver this invitation to their inbox right now:
                </p>
              </div>

              {/* Direct Send Buttons */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => handleSendViaGmail(lastCreatedInvite)}
                  className="p-3.5 rounded-2xl bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md shadow-red-500/20 cursor-pointer card-popup transition-all"
                >
                  <Send className="w-4 h-4" />
                  <span>Send via Gmail (1-Click Draft)</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleSendViaMailto(lastCreatedInvite)}
                  className="p-3.5 rounded-2xl bg-[#7C5CFC] hover:bg-[#6C4CEE] text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md shadow-violet-500/20 cursor-pointer card-popup transition-all"
                >
                  <Mail className="w-4 h-4" />
                  <span>Send via Email App (Outlook)</span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                <button
                  type="button"
                  onClick={() => handleCopyFullEmail(lastCreatedInvite)}
                  className="p-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 font-semibold text-xs flex items-center justify-center gap-2 cursor-pointer transition-all"
                >
                  {copiedId === `full-${lastCreatedInvite.id}` ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span className="text-emerald-700 font-bold">Email Template Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 text-slate-500" />
                      <span>Copy Full Email Text</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => handleSendViaWhatsApp(lastCreatedInvite)}
                  className="p-2.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-800 font-semibold text-xs flex items-center justify-center gap-2 cursor-pointer transition-all"
                >
                  <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Share via WhatsApp</span>
                </button>
              </div>

              {/* Direct Link Box */}
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
                <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider block">
                  Direct Login & Invite Link (Email-Locked):
                </span>
                <div className="flex items-center justify-between gap-2">
                  <span className="font-mono text-[11px] text-violet-700 font-bold truncate select-all">
                    {lastCreatedInvite.inviteLink}
                  </span>
                  <button
                    type="button"
                    onClick={() => copyToClipboard(lastCreatedInvite.inviteLink, 'modal-link')}
                    className="px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-700 hover:text-slate-900 font-bold text-xs flex items-center gap-1 transition-all cursor-pointer shrink-0 shadow-xs"
                  >
                    {copiedId === 'modal-link' ? (
                      <>
                        <Check className="w-3 h-3 text-emerald-600" />
                        <span>Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3 text-violet-600" />
                        <span>Copy Link</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              <div className="flex justify-end pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => {
                    setLastCreatedInvite(null);
                    setIsInviteModalOpen(false);
                  }}
                  className="px-5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold cursor-pointer"
                >
                  Done
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleCreateInviteSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Invitee Email Address <span className="text-violet-600">*</span>
                </label>
                <input
                  type="email"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  placeholder="e.g. client@tomishop.de or va.specialist@agency.com"
                  required
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-800 focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/10"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Select Access Permission Level <span className="text-violet-600">*</span>
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
                  <label 
                    onClick={() => setInviteRole('viewer')}
                    className={`p-3.5 rounded-xl border text-left cursor-pointer transition-all ${
                      inviteRole === 'viewer'
                        ? 'bg-purple-50 border-purple-400 text-slate-900 ring-2 ring-purple-500/20'
                        : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <span className="font-bold block text-purple-700 text-[11px]">Viewer (Client)</span>
                    <span className="text-[10px] text-slate-500 block mt-1">Read-only oversight of sales, charts, and reports.</span>
                  </label>

                  <label 
                    onClick={() => setInviteRole('editor')}
                    className={`p-3.5 rounded-xl border text-left cursor-pointer transition-all ${
                      inviteRole === 'editor'
                        ? 'bg-blue-50 border-blue-400 text-slate-900 ring-2 ring-blue-500/20'
                        : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <span className="font-bold block text-blue-700 text-[11px]">Editor (VA Specialist)</span>
                    <span className="text-[10px] text-slate-500 block mt-1">Can adjust bids, add daily activity logs & restocks.</span>
                  </label>

                  <label 
                    onClick={() => setInviteRole('admin')}
                    className={`p-3.5 rounded-xl border text-left cursor-pointer transition-all ${
                      inviteRole === 'admin'
                        ? 'bg-violet-50 border-violet-400 text-slate-900 ring-2 ring-violet-500/20'
                        : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <span className="font-bold block text-violet-700 text-[11px]">Admin (Owner)</span>
                    <span className="text-[10px] text-slate-500 block mt-1">Full control over accounts, team, and settings.</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Storefront Access Scope
                </label>
                <select
                  value={assignedAccounts}
                  onChange={(e) => setAssignedAccounts(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-800 focus:outline-none focus:border-violet-500"
                >
                  <option value="all">All Store Accounts (Global Agency Scope)</option>
                  {accounts.map(a => (
                    <option key={a.id} value={a.id}>
                      {a.name} ({a.marketplace})
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsInviteModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-[#7C5CFC] hover:bg-[#6C4CEE] text-white font-bold text-xs cursor-pointer shadow-md shadow-violet-500/20 card-popup flex items-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Create & Prepare Email Invitation</span>
                </button>
              </div>
            </form>
          )}
        </Modal>
      )}
    </div>
  );
};
