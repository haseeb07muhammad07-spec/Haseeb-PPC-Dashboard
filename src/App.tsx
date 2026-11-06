/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AppProvider, useApp } from './context/AppContext';
import { LoginPage } from './components/auth/LoginPage';
import { Sidebar } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { DemoDataNotice } from './components/common/DemoDataNotice';
import { OverviewPage } from './components/pages/OverviewPage';
import { AsinTrackerPage } from './components/pages/AsinTrackerPage';
import { AccountsPage } from './components/pages/AccountsPage';
import { ActivityLogPage } from './components/pages/ActivityLogPage';
import { PpcManagementPage } from './components/pages/PpcManagementPage';
import { SalesAnalyticsPage } from './components/pages/SalesAnalyticsPage';
import { InventoryPage } from './components/pages/InventoryPage';
import { ListingHealthPage } from './components/pages/ListingHealthPage';
import { GoalsTargetsPage } from './components/pages/GoalsTargetsPage';
import { ReportsPage } from './components/pages/ReportsPage';
import { AiAnalystPage } from './components/pages/AiAnalystPage';
import { TeamInvitationsPage } from './components/pages/TeamInvitationsPage';
import { SettingsPage } from './components/pages/SettingsPage';
import { ActivityFormModal } from './components/activities/ActivityFormModal';
import { ActivityRecord } from './types';

function MainLayout() {
  const { activePage } = useApp();
  const { isAuthenticated, pendingInvite, hasPermission } = useAuth();

  // Activity Modal State
  const [isActivityModalOpen, setIsActivityModalOpen] = useState(false);
  const [editingActivity, setEditingActivity] = useState<ActivityRecord | null>(null);

  // If user opened with an invitation link or is logged out, show LoginPage
  if (!isAuthenticated || pendingInvite) {
    return <LoginPage />;
  }

  const handleOpenNewActivity = () => {
    if (!hasPermission('edit')) {
      alert('Read-Only Access: Your current user account has Viewer permissions. You cannot log or edit operational activities.');
      return;
    }
    setEditingActivity(null);
    setIsActivityModalOpen(true);
  };

  const handleEditActivity = (activity: ActivityRecord) => {
    if (!hasPermission('edit')) {
      alert('Read-Only Access: Your current user account has Viewer permissions. You cannot edit activities.');
      return;
    }
    setEditingActivity(activity);
    setIsActivityModalOpen(true);
  };

  const renderActivePage = () => {
    switch (activePage) {
      case 'overview':
        return <OverviewPage onOpenNewActivity={handleOpenNewActivity} />;
      case 'asin-tracker':
        return <AsinTrackerPage onOpenNewActivity={handleOpenNewActivity} />;
      case 'accounts':
        return <AccountsPage />;
      case 'activity-log':
        return (
          <ActivityLogPage 
            onOpenNewActivity={handleOpenNewActivity} 
            onEditActivity={handleEditActivity} 
          />
        );
      case 'ppc-management':
        return <PpcManagementPage />;
      case 'sales-analytics':
        return <SalesAnalyticsPage />;
      case 'inventory':
        return <InventoryPage />;
      case 'listing-health':
        return <ListingHealthPage onOpenNewActivity={handleOpenNewActivity} />;
      case 'goals-targets':
        return <GoalsTargetsPage />;
      case 'weekly-reports':
        return <ReportsPage initialType="weekly" key="weekly" />;
      case 'monthly-reports':
        return <ReportsPage initialType="monthly" key="monthly" />;
      case 'ai-analyst':
        return <AiAnalystPage />;
      case 'team-invites':
        return <TeamInvitationsPage />;
      case 'settings':
        return <SettingsPage />;
      default:
        return <OverviewPage onOpenNewActivity={handleOpenNewActivity} />;
    }
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#f4f2f8] text-slate-800 font-sans relative selection:bg-violet-500/20 selection:text-violet-900">
      {/* Ambient background soft glow orbs matching screenshot */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
        <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full bg-violet-200/50 blur-3xl" />
        <div className="absolute top-1/4 -left-32 w-[520px] h-[520px] rounded-full bg-indigo-100/60 blur-3xl" />
        <div className="absolute -bottom-40 left-1/3 w-[650px] h-[650px] rounded-full bg-rose-100/50 blur-3xl" />
        <div className="absolute top-1/2 right-1/4 w-80 h-80 rounded-full bg-amber-100/40 blur-3xl" />
      </div>

      {/* Sidebar Navigation */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Global Header with Seller Central store switcher, segmented nav & user session */}
        <Header onOpenNewActivity={handleOpenNewActivity} />

        {/* Scrollable Viewport */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
          <div className="max-w-[1500px] mx-auto">
            {renderActivePage()}
          </div>
        </main>
      </div>

      {/* Global Activity Form Modal */}
      <ActivityFormModal
        isOpen={isActivityModalOpen}
        onClose={() => {
          setIsActivityModalOpen(false);
          setEditingActivity(null);
        }}
        activityToEdit={editingActivity}
      />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppProvider>
        <MainLayout />
      </AppProvider>
    </AuthProvider>
  );
}
