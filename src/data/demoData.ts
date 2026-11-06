import { 
  AmazonAccount, 
  CatalogAsin,
  ActivityRecord, 
  PpcCampaign, 
  InventoryItem, 
  ListingHealthItem, 
  TaskItem, 
  PerformanceAlert,
  DailySalesData 
} from '../types';

// Real Client Accounts provided by Haseeb:
// 1. Thomas Mild - Tomishop - Germany (Amazon.de)
// 2. Haas - Baihaas Natürlich - DE, France, UK, NL
// 3. Benoit - Laboratoire Optim - DE, Italy, Spain, France
// 4. Ruben - EquicProducts - Germany (Amazon.de)
export const INITIAL_ACCOUNTS: AmazonAccount[] = [
  {
    id: 'acc-tomishop',
    name: 'Tomishop (DE)',
    clientName: 'Thomas Mild',
    brandName: 'Tomishop',
    marketplace: 'Amazon.de',
    marketplacesList: ['DE'],
    country: 'Germany',
    countryCode: 'DE',
    currency: '€',
    monthlySalesTarget: 35000,
    acosTarget: 22,
    roasTarget: 4.55,
    ppcBudget: 4500,
    asinCount: 8,
    assignedVa: 'Haseeb Malik (PPC Lead)',
    status: 'active',
    notes: 'Client: Thomas Mild. Primary German marketplace Amazon.de storefront.',
    createdAt: '2026-02-01'
  },
  {
    id: 'acc-baihaas',
    name: 'Baihaas Natürlich (EU)',
    clientName: 'Haas',
    brandName: 'Baihaas Natürlich',
    marketplace: 'Multi-Marketplace (EU)',
    marketplacesList: ['DE', 'FR', 'UK', 'NL'],
    country: 'Germany / Pan-EU',
    countryCode: 'EU',
    currency: '€',
    monthlySalesTarget: 52000,
    acosTarget: 24,
    roasTarget: 4.17,
    ppcBudget: 7500,
    asinCount: 16,
    assignedVa: 'Haseeb Malik (PPC Lead)',
    status: 'active',
    notes: 'Client: Haas. Pan-European multi-marketplace operations across DE, France, UK, and Netherlands.',
    createdAt: '2026-02-05'
  },
  {
    id: 'acc-optim',
    name: 'Laboratoire Optim (EU)',
    clientName: 'Benoit',
    brandName: 'Laboratoire Optim',
    marketplace: 'Multi-Marketplace (EU)',
    marketplacesList: ['DE', 'IT', 'ES', 'FR'],
    country: 'France / Pan-EU',
    countryCode: 'EU',
    currency: '€',
    monthlySalesTarget: 46000,
    acosTarget: 21,
    roasTarget: 4.76,
    ppcBudget: 5800,
    asinCount: 12,
    assignedVa: 'Haseeb Malik (PPC Lead)',
    status: 'active',
    notes: 'Client: Benoit. Health, supplements & lab nutrition brand operating in DE, Italy, Spain, France.',
    createdAt: '2026-02-10'
  },
  {
    id: 'acc-equic',
    name: 'EquicProducts (DE)',
    clientName: 'Ruben',
    brandName: 'EquicProducts',
    marketplace: 'Amazon.de',
    marketplacesList: ['DE'],
    country: 'Germany',
    countryCode: 'DE',
    currency: '€',
    monthlySalesTarget: 28000,
    acosTarget: 23,
    roasTarget: 4.35,
    ppcBudget: 3800,
    asinCount: 6,
    assignedVa: 'Haseeb Malik (PPC Lead)',
    status: 'active',
    notes: 'Client: Ruben. German marketplace Amazon.de equestrian and specialized products.',
    createdAt: '2026-02-15'
  }
];

export const INITIAL_CATALOG_ASINS: CatalogAsin[] = [
  // Tomishop (Thomas Mild) ASINs
  {
    id: 'asin-tomi-1',
    accountId: 'acc-tomishop',
    asin: 'B0DE98X710',
    sku: 'TOMI-HOME-ORG-01',
    title: 'Tomishop Premium Edelstahl Küchen-Organizer verstellbar (Rostfrei)',
    price: 34.99,
    priorityTier: 'Tier 1 (Hero ASIN)',
    isFocusGoal: true,
    targetDailyUnits: 30,
    targetMonthlySales: 31500,
    currentRank: 18,
    category: 'Küche & Haushalt',
    fbaStock: 420,
    dailyVelocity: 26,
    dailyHistory: [
      { date: 'Nov 01', units: 22, sales: 769.78, ppcSpend: 145.20, ppcOrders: 11, acos: 18.8, organicUnits: 11 },
      { date: 'Nov 02', units: 25, sales: 874.75, ppcSpend: 160.00, ppcOrders: 12, acos: 18.3, organicUnits: 13 },
      { date: 'Nov 03', units: 24, sales: 839.76, ppcSpend: 155.00, ppcOrders: 11, acos: 18.5, organicUnits: 13 },
      { date: 'Nov 04', units: 28, sales: 979.72, ppcSpend: 175.50, ppcOrders: 14, acos: 17.9, organicUnits: 14 },
      { date: 'Nov 05 (Today)', units: 29, sales: 1014.71, ppcSpend: 182.00, ppcOrders: 15, acos: 17.9, organicUnits: 14 }
    ]
  },
  {
    id: 'asin-tomi-2',
    accountId: 'acc-tomishop',
    asin: 'B0DE44L922',
    sku: 'TOMI-SIL-SET-04',
    title: 'Tomishop Silikon Backmatte Set BPA-frei rutschfest & hitzebeständig',
    price: 19.95,
    priorityTier: 'Tier 2 (Growth ASIN)',
    isFocusGoal: false,
    targetDailyUnits: 15,
    targetMonthlySales: 8900,
    currentRank: 42,
    category: 'Backzubehör',
    fbaStock: 280,
    dailyVelocity: 14,
    dailyHistory: [
      { date: 'Nov 01', units: 12, sales: 239.40, ppcSpend: 48.00, ppcOrders: 6, acos: 20.0, organicUnits: 6 },
      { date: 'Nov 02', units: 14, sales: 279.30, ppcSpend: 54.00, ppcOrders: 7, acos: 19.3, organicUnits: 7 },
      { date: 'Nov 03', units: 13, sales: 259.35, ppcSpend: 50.00, ppcOrders: 6, acos: 19.3, organicUnits: 7 },
      { date: 'Nov 04', units: 15, sales: 299.25, ppcSpend: 58.00, ppcOrders: 7, acos: 19.4, organicUnits: 8 },
      { date: 'Nov 05 (Today)', units: 16, sales: 319.20, ppcSpend: 62.00, ppcOrders: 8, acos: 19.4, organicUnits: 8 }
    ]
  },

  // Baihaas Natürlich (Haas) ASINs
  {
    id: 'asin-bai-1',
    accountId: 'acc-baihaas',
    asin: 'B0EU77NAT01',
    sku: 'BAI-BIO-OEL-500',
    title: 'Baihaas Natürlich Bio Kaltgepresstes Schwarzkümmelöl 500ml Vegan',
    price: 24.90,
    priorityTier: 'Tier 1 (Hero ASIN)',
    isFocusGoal: true,
    targetDailyUnits: 45,
    targetMonthlySales: 33600,
    currentRank: 9,
    category: 'Naturprodukte & Öle',
    fbaStock: 650,
    dailyVelocity: 38,
    dailyHistory: [
      { date: 'Nov 01', units: 32, sales: 796.80, ppcSpend: 158.00, ppcOrders: 15, acos: 19.8, organicUnits: 17 },
      { date: 'Nov 02', units: 36, sales: 896.40, ppcSpend: 172.00, ppcOrders: 17, acos: 19.2, organicUnits: 19 },
      { date: 'Nov 03', units: 35, sales: 871.50, ppcSpend: 168.00, ppcOrders: 16, acos: 19.3, organicUnits: 19 },
      { date: 'Nov 04', units: 40, sales: 996.00, ppcSpend: 190.00, ppcOrders: 19, acos: 19.1, organicUnits: 21 },
      { date: 'Nov 05 (Today)', units: 42, sales: 1045.80, ppcSpend: 198.00, ppcOrders: 20, acos: 18.9, organicUnits: 22 }
    ]
  },
  {
    id: 'asin-bai-2',
    accountId: 'acc-baihaas',
    asin: 'B0EU88TEE02',
    sku: 'BAI-KR-TEE-200',
    title: 'Baihaas Natürlich Kräutertee Mischung Entspannung & Schlaf Bio 200g',
    price: 14.50,
    priorityTier: 'Tier 2 (Growth ASIN)',
    isFocusGoal: false,
    targetDailyUnits: 25,
    targetMonthlySales: 10875,
    currentRank: 34,
    category: 'Tee & Kräuter',
    fbaStock: 340,
    dailyVelocity: 21,
    dailyHistory: [
      { date: 'Nov 01', units: 18, sales: 261.00, ppcSpend: 55.00, ppcOrders: 8, acos: 21.0, organicUnits: 10 },
      { date: 'Nov 02', units: 20, sales: 290.00, ppcSpend: 60.00, ppcOrders: 9, acos: 20.7, organicUnits: 11 },
      { date: 'Nov 03', units: 19, sales: 275.50, ppcSpend: 58.00, ppcOrders: 9, acos: 21.0, organicUnits: 10 },
      { date: 'Nov 04', units: 23, sales: 333.50, ppcSpend: 68.00, ppcOrders: 11, acos: 20.4, organicUnits: 12 },
      { date: 'Nov 05 (Today)', units: 24, sales: 348.00, ppcSpend: 70.00, ppcOrders: 11, acos: 20.1, organicUnits: 13 }
    ]
  },

  // Laboratoire Optim (Benoit) ASINs
  {
    id: 'asin-opt-1',
    accountId: 'acc-optim',
    asin: 'B0FR99CUR01',
    sku: 'OPT-CURC-LONG-60',
    title: 'Laboratoire Optim Curcuma Longvida® Haute Biodisponibilité 60 Gélules',
    price: 29.90,
    priorityTier: 'Tier 1 (Hero ASIN)',
    isFocusGoal: true,
    targetDailyUnits: 35,
    targetMonthlySales: 31400,
    currentRank: 14,
    category: 'Santé et Nutrition',
    fbaStock: 520,
    dailyVelocity: 31,
    dailyHistory: [
      { date: 'Nov 01', units: 26, sales: 777.40, ppcSpend: 138.00, ppcOrders: 12, acos: 17.7, organicUnits: 14 },
      { date: 'Nov 02', units: 29, sales: 867.10, ppcSpend: 152.00, ppcOrders: 14, acos: 17.5, organicUnits: 15 },
      { date: 'Nov 03', units: 28, sales: 837.20, ppcSpend: 148.00, ppcOrders: 13, acos: 17.7, organicUnits: 15 },
      { date: 'Nov 04', units: 33, sales: 986.70, ppcSpend: 170.00, ppcOrders: 16, acos: 17.2, organicUnits: 17 },
      { date: 'Nov 05 (Today)', units: 35, sales: 1046.50, ppcSpend: 178.00, ppcOrders: 17, acos: 17.0, organicUnits: 18 }
    ]
  },

  // EquicProducts (Ruben) ASINs
  {
    id: 'asin-equic-1',
    accountId: 'acc-equic',
    asin: 'B0DE66EQ01',
    sku: 'EQ-PFERD-PFLEGE-01',
    title: 'EquicProducts Premium Pferdepflege Bürsten-Set 5-teilig mit Tasche',
    price: 39.99,
    priorityTier: 'Tier 1 (Hero ASIN)',
    isFocusGoal: true,
    targetDailyUnits: 20,
    targetMonthlySales: 24000,
    currentRank: 22,
    category: 'Haustier & Reitsport',
    fbaStock: 310,
    dailyVelocity: 18,
    dailyHistory: [
      { date: 'Nov 01', units: 14, sales: 559.86, ppcSpend: 110.00, ppcOrders: 7, acos: 19.6, organicUnits: 7 },
      { date: 'Nov 02', units: 16, sales: 639.84, ppcSpend: 124.00, ppcOrders: 8, acos: 19.4, organicUnits: 8 },
      { date: 'Nov 03', units: 15, sales: 599.85, ppcSpend: 118.00, ppcOrders: 7, acos: 19.7, organicUnits: 8 },
      { date: 'Nov 04', units: 18, sales: 719.82, ppcSpend: 138.00, ppcOrders: 9, acos: 19.2, organicUnits: 9 },
      { date: 'Nov 05 (Today)', units: 20, sales: 799.80, ppcSpend: 152.00, ppcOrders: 10, acos: 19.0, organicUnits: 10 }
    ]
  }
];

export const INITIAL_PPC_CAMPAIGNS: PpcCampaign[] = [
  // Tomishop (Thomas Mild) Campaigns
  {
    id: 'cmp-tomi-1',
    accountId: 'acc-tomishop',
    name: 'SP - Manual - Exact - Kuechen Organizer Core',
    type: 'SP Manual Exact',
    targetingKind: 'MANUAL',
    targetAsins: ['B0DE98X710'],
    status: 'ENABLED',
    dailyBudget: 65,
    spend: 1420.50,
    sales: 7890.00,
    acos: 18.0,
    targetAcos: 22,
    roas: 5.55,
    cpc: 0.82,
    cvr: 17.5,
    ctr: 1.65,
    impressions: 48200,
    clicks: 1732,
    orders: 303,
    bidsAdjustedAt: '2026-11-04'
  },
  {
    id: 'cmp-tomi-2',
    accountId: 'acc-tomishop',
    name: 'SP - Auto - Catch-All Discovery DE',
    type: 'SP Auto',
    targetingKind: 'AUTO',
    targetAsins: ['B0DE98X710', 'B0DE44L922'],
    status: 'ENABLED',
    dailyBudget: 40,
    spend: 890.00,
    sales: 4250.00,
    acos: 20.9,
    targetAcos: 22,
    roas: 4.78,
    cpc: 0.65,
    cvr: 14.8,
    ctr: 1.25,
    impressions: 34500,
    clicks: 1369,
    orders: 202,
    bidsAdjustedAt: '2026-11-02'
  },

  // Baihaas Natürlich (Haas) Campaigns
  {
    id: 'cmp-bai-1',
    accountId: 'acc-baihaas',
    name: 'SP - Manual - Exact - Schwarzkümmelöl Bio Hero',
    type: 'SP Manual Exact',
    targetingKind: 'MANUAL',
    targetAsins: ['B0EU77NAT01'],
    status: 'ENABLED',
    dailyBudget: 90,
    spend: 2150.00,
    sales: 11400.00,
    acos: 18.8,
    targetAcos: 24,
    roas: 5.30,
    cpc: 0.94,
    cvr: 19.2,
    ctr: 1.80,
    impressions: 62000,
    clicks: 2287,
    orders: 439,
    bidsAdjustedAt: '2026-11-04'
  },
  {
    id: 'cmp-bai-2',
    accountId: 'acc-baihaas',
    name: 'SBV - Video - Bio Kräutertee Relaxation Showcase',
    type: 'SB Video',
    targetingKind: 'MANUAL',
    targetAsins: ['B0EU88TEE02'],
    status: 'ENABLED',
    dailyBudget: 45,
    spend: 980.00,
    sales: 4650.00,
    acos: 21.0,
    targetAcos: 24,
    roas: 4.74,
    cpc: 0.78,
    cvr: 16.5,
    ctr: 2.10,
    impressions: 39000,
    clicks: 1256,
    orders: 207,
    bidsAdjustedAt: '2026-11-03'
  },

  // Laboratoire Optim (Benoit) Campaigns
  {
    id: 'cmp-opt-1',
    accountId: 'acc-optim',
    name: 'SP - Manual - Curcuma Longvida Bio Santé',
    type: 'SP Manual Exact',
    targetingKind: 'MANUAL',
    targetAsins: ['B0FR99CUR01'],
    status: 'ENABLED',
    dailyBudget: 80,
    spend: 1840.00,
    sales: 10800.00,
    acos: 17.0,
    targetAcos: 21,
    roas: 5.87,
    cpc: 0.88,
    cvr: 18.9,
    ctr: 1.72,
    impressions: 54000,
    clicks: 2090,
    orders: 395,
    bidsAdjustedAt: '2026-11-05'
  },

  // EquicProducts (Ruben) Campaigns
  {
    id: 'cmp-equic-1',
    accountId: 'acc-equic',
    name: 'SP - Manual - Exact - Pferdepflege Bürstenset',
    type: 'SP Manual Exact',
    targetingKind: 'MANUAL',
    targetAsins: ['B0DE66EQ01'],
    status: 'ENABLED',
    dailyBudget: 50,
    spend: 1120.00,
    sales: 5900.00,
    acos: 19.0,
    targetAcos: 23,
    roas: 5.27,
    cpc: 0.79,
    cvr: 16.8,
    ctr: 1.55,
    impressions: 36000,
    clicks: 1417,
    orders: 238,
    bidsAdjustedAt: '2026-11-04'
  }
];

export const INITIAL_ACTIVITIES: ActivityRecord[] = [
  {
    id: 'act-1',
    accountId: 'acc-tomishop',
    accountName: 'Tomishop (DE) · Thomas Mild',
    activityDate: '2026-11-04',
    module: 'PPC Optimization',
    actionTaken: 'Erhöhte Top-of-Search Gebote für "edelstahl küchen organizer"',
    reference: 'Kampagne: SP - Manual - Exact - Kuechen Organizer Core',
    previousValue: 'CPC: €0.75 | Platzierungsgebot: +25%',
    newValue: 'CPC: €0.85 | Platzierungsgebot: +45%',
    reasonForAction: 'ACOS liegt bei 17.9% deutlich unter dem Kundenziel (22%). Hohe Conversion Rate.',
    expectedOutcome: '+20% mehr Impressionen auf Platz 1 der Suchergebnisse und Steigerung des Tagesumsatzes.',
    reviewDate: '2026-11-11',
    status: 'Completed',
    actualOutcome: 'Impressionen stiegen um +28%, ACOS blieb stabil bei 18.2%.',
    vaName: 'Haseeb Malik (PPC Lead)',
    updatedAt: '2026-11-05'
  },
  {
    id: 'act-2',
    accountId: 'acc-baihaas',
    accountName: 'Baihaas Natürlich (EU) · Haas',
    activityDate: '2026-11-03',
    module: 'Negative Keywords',
    actionTaken: 'Negiertes Suchwort [Exakt]: "billig schwarzkümmelöl kapseln"',
    reference: 'Kampagne: SP - Auto - Catch-All Discovery DE',
    previousValue: 'Ausgaben: €48.20 | 0 Bestellungen',
    newValue: 'Als Negativ Exakt hinzugefügt',
    reasonForAction: '32 Klicks ohne Konversion. Irrelevantes preissensitives Suchvolumen.',
    expectedOutcome: 'Einsparung von ca. €65/Monat an unnötigen Werbeausgaben.',
    reviewDate: '2026-11-10',
    status: 'Completed',
    actualOutcome: 'Keine weiteren Klicks für dieses Keyword verzeichnet.',
    vaName: 'Haseeb Malik (PPC Lead)',
    updatedAt: '2026-11-05'
  },
  {
    id: 'act-3',
    accountId: 'acc-optim',
    accountName: 'Laboratoire Optim (EU) · Benoit',
    activityDate: '2026-11-05',
    module: 'PPC Optimization',
    actionTaken: 'Optimisation des enchères sur le mot-clé exact "curcuma hautement biodisponible"',
    reference: 'Campagne: SP - Manual - Curcuma Longvida Bio Santé',
    previousValue: 'CPC: €0.82 | ACOS: 16.4%',
    newValue: 'CPC: €0.90 | Budget journalier: €80',
    reasonForAction: 'Excellente rentabilité (ROAS > 6x), capacité de scaling immédiat.',
    expectedOutcome: 'Augmentation des commandes quotidiennes de 14 à 18 unités.',
    reviewDate: '2026-11-12',
    status: 'Pending Review',
    vaName: 'Haseeb Malik (PPC Lead)',
    updatedAt: '2026-11-05'
  }
];

export const INITIAL_INVENTORY: InventoryItem[] = [
  {
    id: 'inv-tomi-1',
    accountId: 'acc-tomishop',
    asin: 'B0DE98X710',
    sku: 'TOMI-HOME-ORG-01',
    title: 'Tomishop Premium Edelstahl Küchen-Organizer verstellbar',
    price: 29.99,
    fbaAvailableUnits: 420,
    fbaInboundUnits: 300,
    reservedUnits: 25,
    dailyVelocity: 26,
    daysOfSupply: 27,
    reorderPointUnits: 200,
    leadTimeDays: 14,
    reorderUnitCost: 8.50,
    restockAlert: 'NORMAL',
    fbaFeePerUnit: 4.85,
    storageType: 'Standard-Size',
    lastRestockDate: '2026-10-18'
  },
  {
    id: 'inv-bai-1',
    accountId: 'acc-baihaas',
    asin: 'B0EU77NAT01',
    sku: 'BAI-BIO-OEL-500',
    title: 'Baihaas Natürlich Bio Schwarzkümmelöl 500ml',
    price: 24.50,
    fbaAvailableUnits: 650,
    fbaInboundUnits: 500,
    reservedUnits: 40,
    dailyVelocity: 38,
    daysOfSupply: 30,
    reorderPointUnits: 350,
    leadTimeDays: 12,
    reorderUnitCost: 6.20,
    restockAlert: 'NORMAL',
    fbaFeePerUnit: 3.90,
    storageType: 'Standard-Size',
    lastRestockDate: '2026-10-22'
  },
  {
    id: 'inv-opt-1',
    accountId: 'acc-optim',
    asin: 'B0FR99CUR01',
    sku: 'OPT-CURC-LONG-60',
    title: 'Laboratoire Optim Curcuma Longvida® 60 Gélules',
    price: 34.90,
    fbaAvailableUnits: 520,
    fbaInboundUnits: 400,
    reservedUnits: 30,
    dailyVelocity: 31,
    daysOfSupply: 29,
    reorderPointUnits: 250,
    leadTimeDays: 10,
    reorderUnitCost: 9.80,
    restockAlert: 'NORMAL',
    fbaFeePerUnit: 3.20,
    storageType: 'Small-Size',
    lastRestockDate: '2026-10-25'
  },
  {
    id: 'inv-equic-1',
    accountId: 'acc-equic',
    asin: 'B0DE66EQ01',
    sku: 'EQ-PFERD-PFLEGE-01',
    title: 'EquicProducts Premium Pferdepflege Bürsten-Set',
    price: 39.00,
    fbaAvailableUnits: 310,
    fbaInboundUnits: 200,
    reservedUnits: 15,
    dailyVelocity: 18,
    daysOfSupply: 28,
    reorderPointUnits: 150,
    leadTimeDays: 15,
    reorderUnitCost: 11.20,
    restockAlert: 'NORMAL',
    fbaFeePerUnit: 5.20,
    storageType: 'Standard-Size',
    lastRestockDate: '2026-10-20'
  }
];

export const INITIAL_LISTING_HEALTH: ListingHealthItem[] = [
  {
    id: 'lh-tomi-1',
    accountId: 'acc-tomishop',
    asin: 'B0DE98X710',
    sku: 'TOMI-HOME-ORG-01',
    title: 'Tomishop Premium Edelstahl Küchen-Organizer verstellbar',
    buyBoxPercentage: 99.4,
    rating: 4.8,
    reviewCount: 312,
    listingScore: 94,
    imagesCount: 7,
    imageCount: 7,
    bulletsCount: 5,
    hasAplus: true,
    videoPresent: true,
    status: 'HEALTHY',
    alerts: [],
    bsrRank: 18,
    bsrCategory: 'Küche & Haushalt',
    suppressedFields: []
  },
  {
    id: 'lh-bai-1',
    accountId: 'acc-baihaas',
    asin: 'B0EU77NAT01',
    sku: 'BAI-BIO-OEL-500',
    title: 'Baihaas Natürlich Bio Schwarzkümmelöl 500ml',
    buyBoxPercentage: 100.0,
    rating: 4.9,
    reviewCount: 540,
    listingScore: 98,
    imagesCount: 7,
    imageCount: 7,
    bulletsCount: 5,
    hasAplus: true,
    videoPresent: true,
    status: 'HEALTHY',
    alerts: [],
    bsrRank: 9,
    bsrCategory: 'Naturprodukte & Öle',
    suppressedFields: []
  },
  {
    id: 'lh-opt-1',
    accountId: 'acc-optim',
    asin: 'B0FR99CUR01',
    sku: 'OPT-CURC-LONG-60',
    title: 'Laboratoire Optim Curcuma Longvida® 60 Gélules',
    buyBoxPercentage: 98.9,
    rating: 4.8,
    reviewCount: 420,
    listingScore: 92,
    imagesCount: 7,
    imageCount: 7,
    bulletsCount: 5,
    hasAplus: true,
    videoPresent: true,
    status: 'HEALTHY',
    alerts: [],
    bsrRank: 14,
    bsrCategory: 'Santé et Nutrition',
    suppressedFields: []
  },
  {
    id: 'lh-equic-1',
    accountId: 'acc-equic',
    asin: 'B0DE66EQ01',
    sku: 'EQ-PFERD-PFLEGE-01',
    title: 'EquicProducts Premium Pferdepflege Bürsten-Set',
    buyBoxPercentage: 100.0,
    rating: 4.7,
    reviewCount: 180,
    listingScore: 89,
    imagesCount: 6,
    imageCount: 6,
    bulletsCount: 5,
    hasAplus: true,
    videoPresent: false,
    status: 'HEALTHY',
    alerts: ['Empfehlung: Video hinzufügen zur BSR-Steigerung'],
    bsrRank: 22,
    bsrCategory: 'Haustier & Reitsport',
    suppressedFields: []
  }
];

export const INITIAL_TASKS: TaskItem[] = [
  {
    id: 'tsk-1',
    accountId: 'acc-tomishop',
    title: 'Prüfung der Suchbegriffe (Search Terms) für Tomishop Küchen-Organizer',
    module: 'PPC Optimization',
    category: 'PPC Optimization',
    dueDate: '2026-11-06',
    completed: false,
    priority: 'HIGH',
    assignee: 'Haseeb Malik',
    assignedTo: 'Haseeb Malik'
  },
  {
    id: 'tsk-2',
    accountId: 'acc-baihaas',
    title: 'Monatlicher Performance-Bericht für Haas (DE + FR + UK + NL)',
    module: 'Monthly Reports',
    category: 'Monthly Reports',
    dueDate: '2026-11-08',
    completed: false,
    priority: 'HIGH',
    assignee: 'Haseeb Malik',
    assignedTo: 'Haseeb Malik'
  },
  {
    id: 'tsk-3',
    accountId: 'acc-optim',
    title: 'Vérification du stock FBA France pour Curcuma Longvida',
    module: 'Inventory (FBA)',
    category: 'Inventory (FBA)',
    dueDate: '2026-11-07',
    completed: false,
    priority: 'MEDIUM',
    assignee: 'Haseeb Malik',
    assignedTo: 'Haseeb Malik'
  },
  {
    id: 'tsk-4',
    accountId: 'acc-equic',
    title: 'Video-Anzeige (SBV) für Pferdepflege Bürstenset testen',
    module: 'PPC Optimization',
    category: 'PPC Optimization',
    dueDate: '2026-11-09',
    completed: false,
    priority: 'MEDIUM',
    assignee: 'Haseeb Malik',
    assignedTo: 'Haseeb Malik'
  }
];

export const INITIAL_ALERTS: PerformanceAlert[] = [
  {
    id: 'al-1',
    accountId: 'acc-tomishop',
    accountName: 'Tomishop (DE) · Thomas Mild',
    type: 'ACOS_SPIKE',
    title: 'ACOS Ziel erreicht (17.9% vs Ziel 22%)',
    message: 'Kampagne läuft sehr profitabel. Budget kann um +15% erhöht werden.',
    severity: 'INFO',
    timestamp: 'Vor 2 Stunden',
    isResolved: false
  },
  {
    id: 'al-2',
    accountId: 'acc-baihaas',
    accountName: 'Baihaas Natürlich (EU) · Haas',
    type: 'TACOS_WARNING',
    title: 'Top 10 BSR erreicht in DE',
    message: 'Bio Schwarzkümmelöl hält Rang #9 in Naturprodukte. Organischer Anteil bei 52%.',
    severity: 'INFO',
    timestamp: 'Vor 4 Stunden',
    isResolved: false
  }
];

// Generates time-series data dynamically paced to the active account's actual target & ACOS
export const GENERATE_DAILY_SALES = (accountId?: string, account?: AmazonAccount | null): DailySalesData[] => {
  if (!accountId || accountId === '' || accountId === 'none' || !account) {
    return [];
  }

  const dates = [
    { date: 'Oct 07', iso: '2026-10-07' },
    { date: 'Oct 08', iso: '2026-10-08' },
    { date: 'Oct 09', iso: '2026-10-09' },
    { date: 'Oct 10', iso: '2026-10-10' },
    { date: 'Oct 11', iso: '2026-10-11' },
    { date: 'Oct 12', iso: '2026-10-12' },
    { date: 'Oct 13', iso: '2026-10-13' },
    { date: 'Oct 14', iso: '2026-10-14' },
    { date: 'Oct 15', iso: '2026-10-15' },
    { date: 'Oct 16', iso: '2026-10-16' },
    { date: 'Oct 17', iso: '2026-10-17' },
    { date: 'Oct 18', iso: '2026-10-18' },
    { date: 'Oct 19', iso: '2026-10-19' },
    { date: 'Oct 20', iso: '2026-10-20' },
    { date: 'Oct 21', iso: '2026-10-21' },
    { date: 'Oct 22', iso: '2026-10-22' },
    { date: 'Oct 23', iso: '2026-10-23' },
    { date: 'Oct 24', iso: '2026-10-24' },
    { date: 'Oct 25', iso: '2026-10-25' },
    { date: 'Oct 26', iso: '2026-10-26' },
    { date: 'Oct 27', iso: '2026-10-27' },
    { date: 'Oct 28', iso: '2026-10-28' },
    { date: 'Oct 29', iso: '2026-10-29' },
    { date: 'Oct 30', iso: '2026-10-30' },
    { date: 'Oct 31', iso: '2026-10-31' },
    { date: 'Nov 01', iso: '2026-11-01' },
    { date: 'Nov 02', iso: '2026-11-02' },
    { date: 'Nov 03 (Day Before)', iso: '2026-11-03' },
    { date: 'Nov 04 (Yesterday)', iso: '2026-11-04' },
    { date: 'Nov 05 (Today)', iso: '2026-11-05' }
  ];

  const targetMonthlySales = account.monthlySalesTarget || 35000;
  const targetAcos = account.acosTarget || 22;
  const avgDailyTarget = Math.round(targetMonthlySales / 30);

  return dates.map((d, idx) => {
    const dayOfWeek = (idx + 3) % 7;
    const isWeekend = dayOfWeek === 5 || dayOfWeek === 6;
    const boost = isWeekend ? 1.18 : 1.0;
    const progressTrend = 0.92 + (idx / 30) * 0.18; // progressive upward pacing
    const noise = Math.sin(idx * 0.7) * 0.08 + 1.0;

    const baseTotal = Math.round(avgDailyTarget * boost * progressTrend * noise);
    const adSalesPercent = 0.38 + Math.sin(idx * 0.4) * 0.04;
    const adSales = Math.round(baseTotal * adSalesPercent);
    const organicSales = baseTotal - adSales;
    
    const acos = +(targetAcos - 2.5 + Math.cos(idx * 0.35) * 1.8).toFixed(1);
    const adSpend = Math.round((adSales * acos) / 100);
    const tacos = +((adSpend / (baseTotal || 1)) * 100).toFixed(1);
    const roas = +(adSales / (adSpend || 1)).toFixed(2);
    const orders = Math.max(1, Math.round(baseTotal / 32));

    const cvr = +(16.2 + Math.sin(idx * 0.6) * 1.8).toFixed(1);
    const ctr = +(1.55 + Math.cos(idx * 0.8) * 0.18).toFixed(2);
    const cpc = +(0.84 + Math.sin(idx * 0.5) * 0.09).toFixed(2);

    return {
      date: d.date,
      isoDate: d.iso,
      totalSales: baseTotal,
      adSales,
      organicSales,
      adSpend,
      orders,
      acos,
      tacos,
      roas,
      cvr,
      ctr,
      cpc
    };
  });
};
