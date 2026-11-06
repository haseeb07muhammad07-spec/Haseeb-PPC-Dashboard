export type Marketplace = 
  | 'Amazon.de'
  | 'Amazon.fr'
  | 'Amazon.it'
  | 'Amazon.es'
  | 'Amazon.nl'
  | 'Amazon.co.uk' 
  | 'Amazon.com' 
  | 'Amazon.ca' 
  | 'Amazon.co.jp' 
  | 'Amazon.com.au'
  | 'Multi-Marketplace (EU)';

export interface AmazonAccount {
  id: string;
  name: string;
  clientName?: string; // Client name e.g. Thomas Mild, Haas, Benoit, Ruben
  brandName: string;
  marketplace: Marketplace;
  marketplacesList?: string[]; // e.g. ['DE', 'FR', 'UK', 'NL']
  country: string;
  countryCode: string; // 'DE', 'FR', 'IT', 'ES', 'NL', 'UK', 'US', 'EU'
  currency: string;    // '€', '£', '$', etc.
  monthlySalesTarget: number;
  acosTarget: number; // in percent e.g. 22
  roasTarget: number; // e.g. 4.55
  ppcBudget: number;  // monthly budget e.g. 5000
  asinCount: number;
  assignedVa: string;
  status: 'active' | 'paused' | 'onboarding';
  notes?: string;
  createdAt: string;
}

export type AsinPriorityTier = 'Tier 1 (Hero ASIN)' | 'Tier 2 (Growth ASIN)' | 'Tier 3 (Long-Tail / Test)';

export interface AsinDailyRecord {
  date: string;
  units: number;
  sales: number;
  ppcSpend: number;
  ppcOrders: number;
  acos: number;
  organicUnits: number;
}

export interface CatalogAsin {
  id: string;
  accountId: string;
  asin: string;
  sku: string;
  title: string;
  imageUrl?: string;
  price: number;
  priorityTier: AsinPriorityTier;
  isFocusGoal: boolean;
  targetDailyUnits?: number;
  targetMonthlySales?: number;
  currentRank?: number;
  category?: string;
  fbaStock: number;
  dailyVelocity: number;
  dailyHistory: AsinDailyRecord[];
}

export type ActivityModule = 
  | 'PPC Optimization'
  | 'Negative Keywords'
  | 'Bid Adjustment'
  | 'Keyword Rank Tracking'
  | 'Listing Optimization'
  | 'Inventory Restock'
  | 'Buy Box / Pricing'
  | 'Case Log / Support'
  | 'Promotions & Coupons';

export type ActivityStatus = 'Pending Review' | 'In Progress' | 'Completed';

export interface ActivityRecord {
  id: string;
  accountId: string;
  accountName: string;
  activityDate: string; // YYYY-MM-DD
  module: ActivityModule;
  actionTaken: string;
  reference: string;
  previousValue: string;
  newValue: string;
  reasonForAction: string;
  expectedOutcome: string;
  reviewDate: string; // YYYY-MM-DD
  status: ActivityStatus;
  screenshotUrl?: string;
  notes?: string;
  actualOutcome?: string;
  vaName: string;
  updatedAt?: string;
}

export type CampaignTargeting = 
  | 'SP Auto' 
  | 'SP Manual Exact' 
  | 'SP Manual Broad' 
  | 'SP Manual Phrase' 
  | 'SB Video' 
  | 'SD Audience';

export interface PpcCampaign {
  id: string;
  accountId: string;
  name: string;
  type: CampaignTargeting;
  targetingKind: 'AUTO' | 'MANUAL';
  targetAsins: string[];
  status: 'ENABLED' | 'PAUSED' | 'BUDGET_CAPPED';
  dailyBudget: number;
  spend: number;
  sales: number;
  acos: number;
  roas: number;
  impressions: number;
  clicks: number;
  cpc: number;
  ctr: number;
  cvr: number;
  orders?: number;
  targetAcos: number;
  bidsAdjustedAt?: string;
}

export interface InventoryItem {
  id: string;
  accountId: string;
  asin: string;
  sku: string;
  title: string;
  price: number;
  fbaAvailableUnits: number;
  fbaInboundUnits: number;
  reservedUnits: number;
  dailyVelocity: number;
  daysOfSupply: number;
  reorderPointUnits?: number;
  restockAlert: 'NORMAL' | 'LOW' | 'CRITICAL' | 'OVERSTOCKED';
  leadTimeDays: number;
  reorderUnitCost: number;
  fbaFeePerUnit?: number;
  storageType?: string;
  lastRestockDate?: string;
}

export interface ListingHealthItem {
  id: string;
  accountId: string;
  asin: string;
  sku: string;
  title: string;
  buyBoxPercentage: number;
  rating: number;
  reviewCount: number;
  listingScore: number;
  imagesCount: number;
  imageCount?: number;
  bulletsCount: number;
  hasAplus: boolean;
  videoPresent?: boolean;
  status: 'HEALTHY' | 'SUPPRESSED' | 'STRANDED' | 'WARNING';
  alerts: string[];
  bsrRank?: number;
  bsrCategory?: string;
  suppressedFields?: string[];
}

export interface TaskItem {
  id: string;
  accountId: string;
  title: string;
  dueDate: string;
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  completed: boolean;
  category?: string;
  module?: string;
  assignee?: string;
  assignedTo?: string;
}

export interface PerformanceAlert {
  id: string;
  accountId: string;
  accountName: string;
  type: 'HIGH_ACOS' | 'LOW_INVENTORY' | 'BUYBOX_LOST' | 'BUDGET_CAP' | 'LISTING_ISSUE' | 'RANK_DROP' | 'ACOS_SPIKE' | 'TACOS_WARNING';
  title: string;
  message: string;
  severity: 'CRITICAL' | 'WARNING' | 'INFO';
  timestamp: string;
  isResolved: boolean;
}

export interface DailySalesData {
  date: string;
  isoDate: string;
  totalSales: number;
  adSales: number;
  organicSales: number;
  adSpend: number;
  orders: number;
  acos: number;
  tacos: number;
  roas: number;
  cvr: number;
  ctr: number;
  cpc: number;
}

export type DateFilterOption = 
  | 'today'
  | 'yesterday'
  | 'day_before'
  | '3d'
  | '7d'
  | '14d'
  | '30d'
  | 'custom';

export type MetricKey = 
  | 'totalSales'
  | 'adSales'
  | 'organicSales'
  | 'adSpend'
  | 'orders'
  | 'acos'
  | 'tacos'
  | 'roas'
  | 'cvr'
  | 'ctr'
  | 'cpc';

// RBAC & Authentication Models
export type UserRole = 'admin' | 'editor' | 'viewer';

export interface UserSession {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  roleLabel: string; // e.g. 'Agency Owner', 'VA Specialist (Editor)', 'Client (Viewer)'
  accessibleAccountIds: string[] | 'all';
  avatarInitials: string;
  createdAt: string;
}

export interface TeamInvitation {
  id: string;
  email: string;
  role: UserRole;
  roleLabel: string;
  status: 'PENDING' | 'ACCEPTED' | 'REVOKED';
  inviteToken: string;
  inviteLink: string;
  invitedBy: string;
  assignedAccounts: string[] | 'all';
  createdAt: string;
  expiresAt: string;
  emailSentAt?: string;
  emailMethod?: 'gmail' | 'mailto' | 'copied';
}
