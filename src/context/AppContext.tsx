import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  AmazonAccount, 
  CatalogAsin,
  AsinPriorityTier,
  ActivityRecord, 
  PpcCampaign, 
  InventoryItem, 
  ListingHealthItem, 
  TaskItem, 
  PerformanceAlert,
  DailySalesData,
  DateFilterOption
} from '../types';
import { 
  INITIAL_ACCOUNTS, 
  INITIAL_CATALOG_ASINS,
  INITIAL_ACTIVITIES, 
  INITIAL_PPC_CAMPAIGNS, 
  INITIAL_INVENTORY, 
  INITIAL_LISTING_HEALTH, 
  INITIAL_TASKS, 
  INITIAL_ALERTS, 
  GENERATE_DAILY_SALES 
} from '../data/demoData';

interface AppContextType {
  // Navigation & View State
  activePage: string;
  setActivePage: (page: string) => void;
  activeAccountId: string; // accountId or 'all'
  setActiveAccountId: (id: string) => void;
  
  // Date Filtering (Today, Yesterday, Day Before, 3d, 7d, 14d, 30d, Custom)
  dateFilter: DateFilterOption;
  setDateFilter: (option: DateFilterOption) => void;
  customStartDate: string;
  setCustomStartDate: (date: string) => void;
  customEndDate: string;
  setCustomEndDate: (date: string) => void;

  isSidebarCollapsed: boolean;
  setIsSidebarCollapsed: (collapsed: boolean | ((prev: boolean) => boolean)) => void;

  // Data Collections
  accounts: AmazonAccount[];
  catalogAsins: CatalogAsin[];
  activities: ActivityRecord[];
  ppcCampaigns: PpcCampaign[];
  inventory: InventoryItem[];
  listingHealth: ListingHealthItem[];
  tasks: TaskItem[];
  alerts: PerformanceAlert[];
  salesData: DailySalesData[]; // Active filtered range
  raw30DaySalesData: DailySalesData[]; // Uncut 30-day history

  // Filtered views by active account
  currentAccount: AmazonAccount | null;
  filteredCatalogAsins: CatalogAsin[];
  filteredActivities: ActivityRecord[];
  filteredCampaigns: PpcCampaign[];
  filteredInventory: InventoryItem[];
  filteredListingHealth: ListingHealthItem[];
  filteredTasks: TaskItem[];
  filteredAlerts: PerformanceAlert[];

  // ASIN Operations
  updateAsinPriority: (id: string, tier: AsinPriorityTier) => void;
  toggleAsinFocusGoal: (id: string) => void;
  updateAsinTargets: (id: string, dailyUnits: number, monthlySales: number) => void;
  addCatalogAsin: (asin: Omit<CatalogAsin, 'id' | 'dailyHistory'>) => void;

  // Account CRUD
  addAccount: (account: Omit<AmazonAccount, 'id' | 'createdAt'>) => void;
  updateAccount: (id: string, account: Partial<AmazonAccount>) => void;
  deleteAccount: (id: string) => void;

  // Activity Operations
  addActivity: (activity: Omit<ActivityRecord, 'id' | 'updatedAt'>) => void;
  updateActivity: (id: string, activity: Partial<ActivityRecord>) => void;
  deleteActivity: (id: string) => void;

  // Other Operations
  updateCampaign: (id: string, updates: Partial<PpcCampaign>) => void;
  updateInventory: (id: string, updates: Partial<InventoryItem>) => void;
  addTask: (task: Omit<TaskItem, 'id'>) => void;
  toggleTask: (id: string) => void;
  deleteTask: (id: string) => void;
  resolveAlert: (id: string) => void;
  clearAllData: () => void;
  resetAllToDemoData: () => void;
}

const STORAGE_KEYS = {
  ACCOUNTS: 'amz_va_accounts_v4',
  CATALOG: 'amz_va_catalog_v4',
  ACTIVITIES: 'amz_va_activities_v4',
  CAMPAIGNS: 'amz_va_campaigns_v4',
  INVENTORY: 'amz_va_inventory_v4',
  LISTINGS: 'amz_va_listings_v4',
  TASKS: 'amz_va_tasks_v4',
  ALERTS: 'amz_va_alerts_v4',
  ACTIVE_ACC: 'amz_va_active_acc_v4',
  DATE_FILTER: 'amz_va_date_filter_v4'
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activePage, setActivePage] = useState<string>('overview');
  
  // Default to 'all' (All Accounts Rollup Matrix) or saved user account
  const [activeAccountId, setActiveAccountId] = useState<string>(() => {
    return localStorage.getItem(STORAGE_KEYS.ACTIVE_ACC) || 'all';
  });

  // Date Filter State
  const [dateFilter, setDateFilter] = useState<DateFilterOption>(() => {
    return (localStorage.getItem(STORAGE_KEYS.DATE_FILTER) as DateFilterOption) || '30d';
  });
  const [customStartDate, setCustomStartDate] = useState<string>('2026-10-25');
  const [customEndDate, setCustomEndDate] = useState<string>('2026-11-05');

  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(false);

  // Accounts: Initialized with user's 4 client accounts
  const [accounts, setAccounts] = useState<AmazonAccount[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.ACCOUNTS);
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { console.error(e); }
    }
    return INITIAL_ACCOUNTS;
  });

  // Catalog ASINs with Priority Tiers & Focus Goals
  const [catalogAsins, setCatalogAsins] = useState<CatalogAsin[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.CATALOG);
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { console.error(e); }
    }
    return INITIAL_CATALOG_ASINS;
  });

  // Activities
  const [activities, setActivities] = useState<ActivityRecord[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.ACTIVITIES);
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { console.error(e); }
    }
    return INITIAL_ACTIVITIES;
  });

  // PPC Campaigns
  const [ppcCampaigns, setPpcCampaigns] = useState<PpcCampaign[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.CAMPAIGNS);
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { console.error(e); }
    }
    return INITIAL_PPC_CAMPAIGNS;
  });

  // Inventory
  const [inventory, setInventory] = useState<InventoryItem[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.INVENTORY);
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { console.error(e); }
    }
    return INITIAL_INVENTORY;
  });

  // Listing Health
  const [listingHealth, setListingHealth] = useState<ListingHealthItem[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.LISTINGS);
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { console.error(e); }
    }
    return INITIAL_LISTING_HEALTH;
  });

  // Tasks
  const [tasks, setTasks] = useState<TaskItem[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.TASKS);
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { console.error(e); }
    }
    return INITIAL_TASKS;
  });

  // Alerts
  const [alerts, setAlerts] = useState<PerformanceAlert[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.ALERTS);
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { console.error(e); }
    }
    return INITIAL_ALERTS;
  });

  // Persistence effects
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.ACCOUNTS, JSON.stringify(accounts));
  }, [accounts]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.CATALOG, JSON.stringify(catalogAsins));
  }, [catalogAsins]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.ACTIVITIES, JSON.stringify(activities));
  }, [activities]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.CAMPAIGNS, JSON.stringify(ppcCampaigns));
  }, [ppcCampaigns]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.INVENTORY, JSON.stringify(inventory));
  }, [inventory]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.LISTINGS, JSON.stringify(listingHealth));
  }, [listingHealth]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.ALERTS, JSON.stringify(alerts));
  }, [alerts]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.ACTIVE_ACC, activeAccountId);
  }, [activeAccountId]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.DATE_FILTER, dateFilter);
  }, [dateFilter]);

  // Derived filtered views by active account
  const currentAccount = accounts.length === 0
    ? null
    : (activeAccountId === 'all' 
      ? (accounts[0] || null) 
      : (accounts.find(a => a.id === activeAccountId) || accounts[0] || null));

  const filteredCatalogAsins = activeAccountId === 'all'
    ? catalogAsins
    : catalogAsins.filter(a => a.accountId === activeAccountId);

  const filteredActivities = activeAccountId === 'all'
    ? activities
    : activities.filter(a => a.accountId === activeAccountId);

  const filteredCampaigns = activeAccountId === 'all'
    ? ppcCampaigns
    : ppcCampaigns.filter(c => c.accountId === activeAccountId);

  const filteredInventory = activeAccountId === 'all'
    ? inventory
    : inventory.filter(i => i.accountId === activeAccountId);

  const filteredListingHealth = activeAccountId === 'all'
    ? listingHealth
    : listingHealth.filter(l => l.accountId === activeAccountId);

  const filteredTasks = activeAccountId === 'all'
    ? tasks
    : tasks.filter(t => t.accountId === activeAccountId);

  const filteredAlerts = activeAccountId === 'all'
    ? alerts.filter(a => !a.isResolved)
    : alerts.filter(a => a.accountId === activeAccountId && !a.isResolved);

  // Raw 30 day sales series: returns [] if no accounts exist
  const raw30DaySalesData = accounts.length === 0
    ? []
    : GENERATE_DAILY_SALES(
        activeAccountId === 'all' ? (accounts[0]?.id || '') : activeAccountId,
        currentAccount
      );

  // Dynamic slice based on Date Filter
  let salesData = raw30DaySalesData;
  if (dateFilter === 'today') {
    salesData = raw30DaySalesData.slice(-1);
  } else if (dateFilter === 'yesterday') {
    salesData = raw30DaySalesData.slice(-2, -1);
  } else if (dateFilter === 'day_before') {
    salesData = raw30DaySalesData.slice(-3, -2);
  } else if (dateFilter === '3d') {
    salesData = raw30DaySalesData.slice(-3);
  } else if (dateFilter === '7d') {
    salesData = raw30DaySalesData.slice(-7);
  } else if (dateFilter === '14d') {
    salesData = raw30DaySalesData.slice(-14);
  } else if (dateFilter === '30d') {
    salesData = raw30DaySalesData;
  } else if (dateFilter === 'custom') {
    salesData = raw30DaySalesData.filter(d => d.isoDate >= customStartDate && d.isoDate <= customEndDate);
    if (salesData.length === 0) salesData = raw30DaySalesData.slice(-7);
  }

  // ASIN operations
  const updateAsinPriority = (id: string, tier: AsinPriorityTier) => {
    setCatalogAsins(prev => prev.map(a => a.id === id ? { ...a, priorityTier: tier } : a));
  };

  const toggleAsinFocusGoal = (id: string) => {
    setCatalogAsins(prev => prev.map(a => a.id === id ? { ...a, isFocusGoal: !a.isFocusGoal } : a));
  };

  const updateAsinTargets = (id: string, dailyUnits: number, monthlySales: number) => {
    setCatalogAsins(prev => prev.map(a => a.id === id ? { 
      ...a, 
      targetDailyUnits: dailyUnits, 
      targetMonthlySales: monthlySales 
    } : a));
  };

  const addCatalogAsin = (asinData: Omit<CatalogAsin, 'id' | 'dailyHistory'>) => {
    const newAsin: CatalogAsin = {
      ...asinData,
      id: `asin-${Date.now()}`,
      dailyHistory: [
        { date: 'Nov 01', units: 10, sales: 300, ppcSpend: 60, ppcOrders: 3, acos: 20, organicUnits: 7 },
        { date: 'Nov 02', units: 12, sales: 360, ppcSpend: 70, ppcOrders: 4, acos: 19.4, organicUnits: 8 },
        { date: 'Nov 03', units: 11, sales: 330, ppcSpend: 65, ppcOrders: 4, acos: 19.6, organicUnits: 7 },
        { date: 'Nov 04', units: 14, sales: 420, ppcSpend: 80, ppcOrders: 5, acos: 19.0, organicUnits: 9 },
        { date: 'Nov 05 (Today)', units: 15, sales: 450, ppcSpend: 85, ppcOrders: 5, acos: 18.8, organicUnits: 10 }
      ]
    };
    setCatalogAsins(prev => [newAsin, ...prev]);
  };

  // Account operations
  const addAccount = (accountData: Omit<AmazonAccount, 'id' | 'createdAt'>) => {
    const newAccount: AmazonAccount = {
      ...accountData,
      id: `acc-${Date.now()}`,
      createdAt: new Date().toISOString().split('T')[0]
    };
    setAccounts(prev => [newAccount, ...prev]);
    setActiveAccountId(newAccount.id);
  };

  const updateAccount = (id: string, updates: Partial<AmazonAccount>) => {
    setAccounts(prev => prev.map(acc => acc.id === id ? { ...acc, ...updates } : acc));
  };

  const deleteAccount = (id: string) => {
    setAccounts(prev => prev.filter(acc => acc.id !== id));
    if (activeAccountId === id) {
      setActiveAccountId(accounts[0]?.id || 'acc-tommy');
    }
  };

  // Activity operations
  const addActivity = (activityData: Omit<ActivityRecord, 'id' | 'updatedAt'>) => {
    const newActivity: ActivityRecord = {
      ...activityData,
      id: `act-${Date.now()}`,
      updatedAt: new Date().toLocaleString()
    };
    setActivities(prev => [newActivity, ...prev]);
  };

  const updateActivity = (id: string, updates: Partial<ActivityRecord>) => {
    setActivities(prev => prev.map(act => act.id === id ? { 
      ...act, 
      ...updates, 
      updatedAt: new Date().toLocaleString() 
    } : act));
  };

  const deleteActivity = (id: string) => {
    setActivities(prev => prev.filter(act => act.id !== id));
  };

  // Campaign & Inventory
  const updateCampaign = (id: string, updates: Partial<PpcCampaign>) => {
    setPpcCampaigns(prev => prev.map(cmp => cmp.id === id ? { ...cmp, ...updates } : cmp));
  };

  const updateInventory = (id: string, updates: Partial<InventoryItem>) => {
    setInventory(prev => prev.map(item => item.id === id ? { ...item, ...updates } : item));
  };

  // Task operations
  const addTask = (taskData: Omit<TaskItem, 'id'>) => {
    const newTask: TaskItem = {
      ...taskData,
      id: `tsk-${Date.now()}`
    };
    setTasks(prev => [newTask, ...prev]);
  };

  const toggleTask = (id: string) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
  };

  const deleteTask = (id: string) => {
    setTasks(prev => prev.filter(t => t.id !== id));
  };

  // Alert operations
  const resolveAlert = (id: string) => {
    setAlerts(prev => prev.map(a => a.id === id ? { ...a, isResolved: true } : a));
  };

  // Clear all accounts and data for fresh workspace
  const clearAllData = () => {
    Object.values(STORAGE_KEYS).forEach(k => localStorage.removeItem(k));
    // Clear old versions too
    ['amz_va_accounts_v1', 'amz_va_accounts_v2', 'amz_va_catalog_v2', 'amz_va_activities_v2', 'amz_va_campaigns_v2'].forEach(k => localStorage.removeItem(k));
    setAccounts([]);
    setCatalogAsins([]);
    setActivities([]);
    setPpcCampaigns([]);
    setInventory([]);
    setListingHealth([]);
    setTasks([]);
    setAlerts([]);
    setActiveAccountId('');
    setDateFilter('30d');
  };

  // Reset demo data
  const resetAllToDemoData = () => {
    clearAllData();
  };

  return (
    <AppContext.Provider value={{
      activePage,
      setActivePage,
      activeAccountId,
      setActiveAccountId,
      dateFilter,
      setDateFilter,
      customStartDate,
      setCustomStartDate,
      customEndDate,
      setCustomEndDate,
      isSidebarCollapsed,
      setIsSidebarCollapsed,
      accounts,
      catalogAsins,
      activities,
      ppcCampaigns,
      inventory,
      listingHealth,
      tasks,
      alerts,
      salesData,
      raw30DaySalesData,
      currentAccount,
      filteredCatalogAsins,
      filteredActivities,
      filteredCampaigns,
      filteredInventory,
      filteredListingHealth,
      filteredTasks,
      filteredAlerts,
      updateAsinPriority,
      toggleAsinFocusGoal,
      updateAsinTargets,
      addCatalogAsin,
      addAccount,
      updateAccount,
      deleteAccount,
      addActivity,
      updateActivity,
      deleteActivity,
      updateCampaign,
      updateInventory,
      addTask,
      toggleTask,
      deleteTask,
      resolveAlert,
      clearAllData,
      resetAllToDemoData
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
