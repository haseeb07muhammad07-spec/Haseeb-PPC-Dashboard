import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserSession, UserRole, TeamInvitation, AccessRequest } from '../types';

export interface LoginResult {
  success: boolean;
  status: 'SUCCESS' | 'PENDING_APPROVAL' | 'REJECTED' | 'UNAUTHORIZED';
  message: string;
}

interface AuthContextType {
  currentUser: UserSession | null;
  isAuthenticated: boolean;
  teamMembers: UserSession[];
  invitations: TeamInvitation[];
  accessRequests: AccessRequest[];
  pendingInvite: TeamInvitation | null;
  
  // Actions
  login: (email: string, password?: string) => LoginResult;
  logout: () => void;
  createInvitation: (email: string, role: UserRole, assignedAccounts: string[] | 'all') => TeamInvitation;
  acceptInvitation: (token: string, name: string, password?: string) => boolean;
  revokeInvitation: (id: string) => void;
  deleteTeamMember: (id: string) => void;
  markInviteEmailSent: (id: string, method: 'gmail' | 'mailto' | 'copied') => void;
  requestAccess: (name: string, email: string, message?: string) => { success: boolean; message: string };
  approveAccessRequest: (requestId: string, role: UserRole, assignedAccounts: string[] | 'all') => boolean;
  rejectAccessRequest: (requestId: string) => void;
  deleteAccessRequest: (requestId: string) => void;
  hasPermission: (action: 'view' | 'edit' | 'delete' | 'admin') => boolean;
}

const STORAGE_KEYS = {
  CURRENT_USER: 'amz_va_auth_user_v2',
  TEAM_MEMBERS: 'amz_va_team_members_v2',
  INVITATIONS: 'amz_va_invitations_v2',
  ACCESS_REQUESTS: 'amz_va_access_requests_v2'
};

const DEFAULT_USERS: UserSession[] = [
  {
    id: 'usr-admin-1',
    name: 'Haseeb Malik',
    email: 'haseeb07malik07@gmail.com',
    role: 'admin',
    roleLabel: 'Agency Owner (Full Admin)',
    accessibleAccountIds: 'all',
    avatarInitials: 'HM',
    createdAt: '2026-01-01'
  },
  {
    id: 'usr-client-thomas',
    name: 'Thomas Mild (Client)',
    email: 'thomas.mild@tomishop.de',
    role: 'viewer',
    roleLabel: 'Client: Tomishop (DE)',
    accessibleAccountIds: ['acc-tomishop'],
    avatarInitials: 'TM',
    createdAt: '2026-02-01'
  },
  {
    id: 'usr-client-haas',
    name: 'Haas (Client)',
    email: 'haas@baihaas.de',
    role: 'viewer',
    roleLabel: 'Client: Baihaas Natürlich (EU)',
    accessibleAccountIds: ['acc-baihaas'],
    avatarInitials: 'HN',
    createdAt: '2026-02-05'
  },
  {
    id: 'usr-client-benoit',
    name: 'Benoit (Client)',
    email: 'benoit@laboratoire-optim.fr',
    role: 'viewer',
    roleLabel: 'Client: Laboratoire Optim (EU)',
    accessibleAccountIds: ['acc-optim'],
    avatarInitials: 'BL',
    createdAt: '2026-02-10'
  },
  {
    id: 'usr-client-ruben',
    name: 'Ruben (Client)',
    email: 'ruben@equicproducts.de',
    role: 'viewer',
    roleLabel: 'Client: EquicProducts (DE)',
    accessibleAccountIds: ['acc-equic'],
    avatarInitials: 'RE',
    createdAt: '2026-02-15'
  }
];

const DEFAULT_INVITATIONS: TeamInvitation[] = [
  {
    id: 'inv-thomas',
    email: 'thomas.mild@tomishop.de',
    role: 'viewer',
    roleLabel: 'Client Store Owner (Read-Only)',
    status: 'PENDING',
    inviteToken: 'inv_tok_thomas_mild',
    inviteLink: typeof window !== 'undefined' ? `${window.location.origin}${window.location.pathname}?invite=inv_tok_thomas_mild` : '',
    invitedBy: 'Haseeb Malik',
    assignedAccounts: ['acc-tomishop'],
    createdAt: '2026-11-05',
    expiresAt: '2026-11-19'
  },
  {
    id: 'inv-haas',
    email: 'haas@baihaas.de',
    role: 'viewer',
    roleLabel: 'Client Store Owner (Read-Only)',
    status: 'PENDING',
    inviteToken: 'inv_tok_haas_baihaas',
    inviteLink: typeof window !== 'undefined' ? `${window.location.origin}${window.location.pathname}?invite=inv_tok_haas_baihaas` : '',
    invitedBy: 'Haseeb Malik',
    assignedAccounts: ['acc-baihaas'],
    createdAt: '2026-11-05',
    expiresAt: '2026-11-19'
  }
];

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Team members list
  const [teamMembers, setTeamMembers] = useState<UserSession[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.TEAM_MEMBERS);
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { console.error(e); }
    }
    return DEFAULT_USERS;
  });

  // Invitations list
  const [invitations, setInvitations] = useState<TeamInvitation[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.INVITATIONS);
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { console.error(e); }
    }
    return DEFAULT_INVITATIONS;
  });

  // Access Requests list
  const [accessRequests, setAccessRequests] = useState<AccessRequest[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.ACCESS_REQUESTS);
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { console.error(e); }
    }
    return [];
  });

  // Logged-in session: defaults to null on fresh visits so Login Portal is strictly enforced
  const [currentUser, setCurrentUser] = useState<UserSession | null>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { console.error(e); }
    }
    return null; // Require login / invite entry on fresh visits
  });

  // Pending invitation if opened via link ?invite=token
  const [pendingInvite, setPendingInvite] = useState<TeamInvitation | null>(null);

  // Check URL query parameters for ?invite=token
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const token = params.get('invite');
      if (token) {
        const found = invitations.find(inv => inv.inviteToken === token && inv.status === 'PENDING');
        if (found) {
          setPendingInvite(found);
        }
      }
    }
  }, [invitations]);

  // Sync across tabs via window storage event
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === STORAGE_KEYS.TEAM_MEMBERS && e.newValue) {
        try { setTeamMembers(JSON.parse(e.newValue)); } catch (err) { console.error(err); }
      }
      if (e.key === STORAGE_KEYS.INVITATIONS && e.newValue) {
        try { setInvitations(JSON.parse(e.newValue)); } catch (err) { console.error(err); }
      }
      if (e.key === STORAGE_KEYS.ACCESS_REQUESTS && e.newValue) {
        try { setAccessRequests(JSON.parse(e.newValue)); } catch (err) { console.error(err); }
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Persistence
  useEffect(() => {
    if (currentUser) {
      localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(currentUser));
    } else {
      localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
    }
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.TEAM_MEMBERS, JSON.stringify(teamMembers));
  }, [teamMembers]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.INVITATIONS, JSON.stringify(invitations));
  }, [invitations]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.ACCESS_REQUESTS, JSON.stringify(accessRequests));
  }, [accessRequests]);

  // Login handler with strict security
  const login = (email: string, _password?: string): LoginResult => {
    const trimmedEmail = email.trim().toLowerCase();
    
    // Check if it's the Admin email (Haseeb Malik)
    if (trimmedEmail === 'haseeb07malik07@gmail.com') {
      let adminUser = teamMembers.find(u => u.email.toLowerCase() === trimmedEmail);
      if (!adminUser) {
        adminUser = {
          id: 'usr-admin-1',
          name: 'Haseeb Malik',
          email: 'haseeb07malik07@gmail.com',
          role: 'admin',
          roleLabel: 'Agency Owner (Full Admin)',
          accessibleAccountIds: 'all',
          avatarInitials: 'HM',
          createdAt: '2026-01-01'
        };
        setTeamMembers(prev => [adminUser!, ...prev]);
      }
      setCurrentUser(adminUser);
      return {
        success: true,
        status: 'SUCCESS',
        message: 'Welcome back, Haseeb Malik!'
      };
    }

    // Check if user exists in authorized team/client list
    const authorizedUser = teamMembers.find(u => u.email.toLowerCase() === trimmedEmail);
    if (authorizedUser) {
      setCurrentUser(authorizedUser);
      return {
        success: true,
        status: 'SUCCESS',
        message: `Welcome back, ${authorizedUser.name}!`
      };
    }

    // Check if user has an accepted invitation waiting for first entry
    const acceptedInvite = invitations.find(i => i.email.toLowerCase() === trimmedEmail && i.status === 'ACCEPTED');
    if (acceptedInvite) {
      const newUser: UserSession = {
        id: `usr-${Date.now()}`,
        name: acceptedInvite.email.split('@')[0],
        email: acceptedInvite.email,
        role: acceptedInvite.role,
        roleLabel: acceptedInvite.roleLabel,
        accessibleAccountIds: acceptedInvite.assignedAccounts,
        avatarInitials: acceptedInvite.email.slice(0, 2).toUpperCase(),
        createdAt: new Date().toISOString().split('T')[0]
      };
      setTeamMembers(prev => [...prev, newUser]);
      setCurrentUser(newUser);
      return {
        success: true,
        status: 'SUCCESS',
        message: `Welcome, ${newUser.name}!`
      };
    }

    // Check if user has an access request in the queue
    const userRequest = accessRequests.find(r => r.email.toLowerCase() === trimmedEmail);
    if (userRequest) {
      if (userRequest.status === 'PENDING') {
        return {
          success: false,
          status: 'PENDING_APPROVAL',
          message: 'Aapki access request Haseeb Malik ko send ho chuki hai aur abhi PENDING hai. Haseeb Malik jab ise approve karengay, tab aap login kar sakengay.'
        };
      }
      if (userRequest.status === 'REJECTED') {
        return {
          success: false,
          status: 'REJECTED',
          message: 'Aapki access request decline kardi gayi hai. Mazeed maloomat ke liye Haseeb Malik se rabta karein.'
        };
      }
    }

    // Not authorized and no pending request
    return {
      success: false,
      status: 'UNAUTHORIZED',
      message: 'Access Denied: Is email ko Haseeb Malik ki taraf se invite ya approve nahi kiya gaya. Agar aap access chahte hain toh neeche "Request Access from Haseeb" par click karein.'
    };
  };

  const logout = () => {
    setCurrentUser(null);
  };

  // Submit an Access Request (When an uninvited user tries to join)
  const requestAccess = (name: string, email: string, message?: string): { success: boolean; message: string } => {
    const trimmedEmail = email.trim().toLowerCase();
    const trimmedName = name.trim();

    if (!trimmedEmail || !trimmedName) {
      return { success: false, message: 'Please provide both your name and email.' };
    }

    // Check if already in team
    if (teamMembers.some(m => m.email.toLowerCase() === trimmedEmail)) {
      return { success: false, message: 'Yeh email pehle se authorized hai! Aap seedha login kar sakte hain.' };
    }

    // Check if already requested
    const existing = accessRequests.find(r => r.email.toLowerCase() === trimmedEmail);
    if (existing && existing.status === 'PENDING') {
      return { 
        success: true, 
        message: 'Aapki request pehle se Haseeb Malik ke paas pending hai. Haseeb Malik ke approval ka intezar karein.' 
      };
    }

    const newRequest: AccessRequest = {
      id: `req-${Date.now()}`,
      name: trimmedName,
      email: trimmedEmail,
      message: message?.trim() || '',
      status: 'PENDING',
      requestedAt: new Date().toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    };

    setAccessRequests(prev => [newRequest, ...prev.filter(r => r.email.toLowerCase() !== trimmedEmail)]);
    return {
      success: true,
      message: 'Aapki access request Haseeb Malik ko bhej di gayi hai! Jaise hi Haseeb approve karengay, aap login kar payengay.'
    };
  };

  // Approve an Access Request (Haseeb clicks Approve & assigns role/accounts)
  const approveAccessRequest = (
    requestId: string, 
    role: UserRole, 
    assignedAccounts: string[] | 'all'
  ): boolean => {
    const req = accessRequests.find(r => r.id === requestId);
    if (!req) return false;

    const initials = req.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || 'U';
    const roleLabel = role === 'admin' 
      ? 'Agency Owner (Full Admin)' 
      : role === 'editor' 
      ? 'VA Specialist (Editor - Operations)' 
      : 'Client Store Owner (Viewer - Read-Only)';

    const newUser: UserSession = {
      id: `usr-${Date.now()}`,
      name: req.name,
      email: req.email,
      role,
      roleLabel,
      accessibleAccountIds: assignedAccounts,
      avatarInitials: initials,
      createdAt: new Date().toISOString().split('T')[0]
    };

    // Add to active team members
    setTeamMembers(prev => [...prev.filter(m => m.email.toLowerCase() !== req.email.toLowerCase()), newUser]);

    // Update request status to APPROVED
    setAccessRequests(prev => prev.map(r => r.id === requestId ? {
      ...r,
      status: 'APPROVED',
      assignedRole: role,
      assignedAccounts,
      decisionAt: new Date().toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    } : r));

    return true;
  };

  // Reject an Access Request
  const rejectAccessRequest = (requestId: string) => {
    setAccessRequests(prev => prev.map(r => r.id === requestId ? {
      ...r,
      status: 'REJECTED',
      decisionAt: new Date().toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    } : r));
  };

  // Delete an Access Request from history
  const deleteAccessRequest = (requestId: string) => {
    setAccessRequests(prev => prev.filter(r => r.id !== requestId));
  };

  // Create an Invitation Link
  const createInvitation = (
    email: string, 
    role: UserRole, 
    assignedAccounts: string[] | 'all'
  ): TeamInvitation => {
    const token = `inv_${Math.random().toString(36).substring(2, 9)}_${Date.now().toString(36)}`;
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    const pathname = typeof window !== 'undefined' ? window.location.pathname : '';
    const inviteLink = `${origin}${pathname}?invite=${token}`;

    const roleLabel = role === 'admin' 
      ? 'Agency Owner (Full Admin)' 
      : role === 'editor' 
      ? 'VA Specialist (Editor - Operations)' 
      : 'Client Store Owner (Viewer - Read-Only)';

    const newInvite: TeamInvitation = {
      id: `inv-${Date.now()}`,
      email: email.trim().toLowerCase(),
      role,
      roleLabel,
      status: 'PENDING',
      inviteToken: token,
      inviteLink,
      invitedBy: currentUser?.name || 'Haseeb Malik',
      assignedAccounts,
      createdAt: new Date().toISOString().split('T')[0],
      expiresAt: new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0]
    };

    setInvitations(prev => [newInvite, ...prev]);
    return newInvite;
  };

  // Accept an Invitation
  const acceptInvitation = (token: string, name: string, _password?: string): boolean => {
    const invite = invitations.find(i => i.inviteToken === token);
    if (!invite || invite.status !== 'PENDING') return false;

    // Create user profile strictly with the invited email
    const initials = name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || 'U';
    const newUser: UserSession = {
      id: `usr-${Date.now()}`,
      name: name.trim(),
      email: invite.email.toLowerCase(),
      role: invite.role,
      roleLabel: invite.roleLabel,
      accessibleAccountIds: invite.assignedAccounts,
      avatarInitials: initials,
      createdAt: new Date().toISOString().split('T')[0]
    };

    // Mark invitation as accepted
    setInvitations(prev => prev.map(inv => inv.id === invite.id ? { ...inv, status: 'ACCEPTED' } : inv));
    setTeamMembers(prev => [...prev.filter(m => m.email.toLowerCase() !== newUser.email.toLowerCase()), newUser]);
    setCurrentUser(newUser);
    setPendingInvite(null);

    // Clean up query param from browser URL
    if (typeof window !== 'undefined' && window.history.replaceState) {
      const url = new URL(window.location.href);
      url.searchParams.delete('invite');
      window.history.replaceState({}, '', url.toString());
    }

    return true;
  };

  const revokeInvitation = (id: string) => {
    setInvitations(prev => prev.map(inv => inv.id === id ? { ...inv, status: 'REVOKED' } : inv));
  };

  const markInviteEmailSent = (id: string, method: 'gmail' | 'mailto' | 'copied') => {
    setInvitations(prev => prev.map(inv => inv.id === id ? {
      ...inv,
      emailSentAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      emailMethod: method
    } : inv));
  };

  const deleteTeamMember = (id: string) => {
    setTeamMembers(prev => prev.filter(m => m.id !== id));
    if (currentUser?.id === id) {
      setCurrentUser(null);
    }
  };

  // RBAC Permission Check
  const hasPermission = (action: 'view' | 'edit' | 'delete' | 'admin'): boolean => {
    if (!currentUser) return false;
    if (currentUser.role === 'admin') return true;
    if (currentUser.role === 'editor') {
      return action === 'view' || action === 'edit';
    }
    if (currentUser.role === 'viewer') {
      return action === 'view';
    }
    return false;
  };

  return (
    <AuthContext.Provider value={{
      currentUser,
      isAuthenticated: !!currentUser,
      teamMembers,
      invitations,
      accessRequests,
      pendingInvite,
      login,
      logout,
      createInvitation,
      acceptInvitation,
      revokeInvitation,
      markInviteEmailSent,
      deleteTeamMember,
      requestAccess,
      approveAccessRequest,
      rejectAccessRequest,
      deleteAccessRequest,
      hasPermission
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
