import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserSession, UserRole, TeamInvitation } from '../types';

interface AuthContextType {
  currentUser: UserSession | null;
  isAuthenticated: boolean;
  teamMembers: UserSession[];
  invitations: TeamInvitation[];
  pendingInvite: TeamInvitation | null;
  
  // Actions
  login: (email: string, password?: string, overrideRole?: UserRole) => boolean;
  logout: () => void;
  createInvitation: (email: string, role: UserRole, assignedAccounts: string[] | 'all') => TeamInvitation;
  acceptInvitation: (token: string, name: string, password?: string) => boolean;
  revokeInvitation: (id: string) => void;
  deleteTeamMember: (id: string) => void;
  markInviteEmailSent: (id: string, method: 'gmail' | 'mailto' | 'copied') => void;
  hasPermission: (action: 'view' | 'edit' | 'delete' | 'admin') => boolean;
}

const STORAGE_KEYS = {
  CURRENT_USER: 'amz_va_auth_user_v2',
  TEAM_MEMBERS: 'amz_va_team_members_v2',
  INVITATIONS: 'amz_va_invitations_v2'
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

  // Logged-in session: defaults to null on fresh visits so Login Portal is strictly enforced
  const [currentUser, setCurrentUser] = useState<UserSession | null>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { console.error(e); }
    }
    return null; // Require login / invite entry on fresh visits
  });

  // Pending invitation if opened via link
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

  // Login handler
  const login = (email: string, _password?: string, overrideRole?: UserRole): boolean => {
    // Check if user exists in team
    let user = teamMembers.find(u => u.email.toLowerCase() === email.toLowerCase());

    if (!user) {
      // Create new user session if not in list
      const role = overrideRole || 'editor';
      const roleLabel = role === 'admin' 
        ? 'Agency Owner (Admin)' 
        : role === 'editor' 
        ? 'VA Operations (Editor)' 
        : 'Client (Viewer)';
      
      const initials = email.slice(0, 2).toUpperCase();
      user = {
        id: `usr-${Date.now()}`,
        name: email.split('@')[0],
        email: email,
        role: role,
        roleLabel: roleLabel,
        accessibleAccountIds: 'all',
        avatarInitials: initials,
        createdAt: new Date().toISOString().split('T')[0]
      };
      setTeamMembers(prev => [...prev, user!]);
    } else if (overrideRole && user.role !== overrideRole) {
      user = {
        ...user,
        role: overrideRole,
        roleLabel: overrideRole === 'admin' ? 'Agency Owner (Admin)' : overrideRole === 'editor' ? 'VA Operations (Editor)' : 'Client (Viewer)'
      };
    }

    setCurrentUser(user);
    return true;
  };

  const logout = () => {
    setCurrentUser(null);
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
      ? 'VA Specialist (Editor - Can change bids & activities)' 
      : 'Client Store Owner (Viewer - Read-Only)';

    const newInvite: TeamInvitation = {
      id: `inv-${Date.now()}`,
      email: email.trim(),
      role,
      roleLabel,
      status: 'PENDING',
      inviteToken: token,
      inviteLink,
      invitedBy: currentUser?.name || 'Admin',
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

    // Create user profile
    const initials = name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || 'U';
    const newUser: UserSession = {
      id: `usr-${Date.now()}`,
      name: name.trim(),
      email: invite.email,
      role: invite.role,
      roleLabel: invite.roleLabel,
      accessibleAccountIds: invite.assignedAccounts,
      avatarInitials: initials,
      createdAt: new Date().toISOString().split('T')[0]
    };

    // Mark invitation as accepted
    setInvitations(prev => prev.map(inv => inv.id === invite.id ? { ...inv, status: 'ACCEPTED' } : inv));
    setTeamMembers(prev => [...prev.filter(m => m.email !== newUser.email), newUser]);
    setCurrentUser(newUser);
    setPendingInvite(null);

    // Clean up query param
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
      pendingInvite,
      login,
      logout,
      createInvitation,
      acceptInvitation,
      revokeInvitation,
      markInviteEmailSent,
      deleteTeamMember,
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
