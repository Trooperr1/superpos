import Dexie, { type Table } from 'dexie';

// Product interface
export interface Product {
  id?: number;
  name: string;
  nameKurdish: string;
  price: number;
  costPrice: number;
  barcode?: string;
  category: string;
  stock: number;
  reorderLevel: number;
  imageUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Sale transaction interface
export interface Sale {
  id?: number;
  transactionId: string;
  items: SaleItem[];
  subtotal: number;
  discount: number;
  discountType: 'percentage' | 'fixed';
  tax: number;
  total: number;
  paymentMethod: 'cash' | 'card' | 'mixed' | 'credit';
  cashAmount?: number;
  cardAmount?: number;
  changeGiven?: number;
  customerId?: number;
  userId?: number;
  createdAt: Date;
  notes?: string;
}

// Sale item interface (items within a sale)
export interface SaleItem {
  productId: number;
  productName: string;
  quantity: number;
  price: number;
  subtotal: number;
}

// Customer interface
export interface Customer {
  id?: number;
  name: string;
  phone?: string;
  email?: string;
  totalPurchases: number;
  totalSpent: number;
  credit: number; // Outstanding credit/debt
  loyaltyPoints: number;
  lastVisit?: Date;
  createdAt: Date;
  notes?: string;
}

// Cash register transaction interface
export interface CashTransaction {
  id?: number;
  type: 'sale' | 'withdrawal' | 'deposit' | 'opening' | 'closing' | 'safe_drop';
  amount: number;
  reason?: string;
  saleId?: number;
  userId?: number;
  createdAt: Date;
}

// User interface (for multi-user support)
export interface User {
  id?: number;
  name: string;
  pin: string; // Simple 4-digit PIN
  role: 'owner' | 'cashier';
  createdAt: Date;
  lastLogin?: Date;
  isActive: boolean;
}

// Settings interface
export interface Settings {
  id?: number;
  shopName: string;
  shopNameKurdish: string;
  shopAddress: string;
  shopPhone: string;
  taxRate: number;
  currencySymbol: string;
  logoUrl?: string;
  printerDeviceId?: string;
  printerName?: string;
  language: 'ku' | 'ar' | 'en';
  autoBackup: boolean;
  lastBackupDate?: Date;
}

// Stock adjustment interface (for tracking inventory changes)
export interface StockAdjustment {
  id?: number;
  productId: number;
  productName: string;
  previousStock: number;
  newStock: number;
  adjustment: number;
  reason: string;
  userId?: number;
  createdAt: Date;
}

// Database class
export class POSDatabase extends Dexie {
  products!: Table<Product, number>;
  sales!: Table<Sale, number>;
  customers!: Table<Customer, number>;
  cashTransactions!: Table<CashTransaction, number>;
  users!: Table<User, number>;
  settings!: Table<Settings, number>;
  stockAdjustments!: Table<StockAdjustment, number>;

  constructor() {
    super('NexusPOSDB');

    this.version(1).stores({
      products: '++id, barcode, category, name, nameKurdish, stock',
      sales: '++id, transactionId, customerId, userId, createdAt, paymentMethod',
      customers: '++id, phone, name, totalSpent, lastVisit',
      cashTransactions: '++id, type, saleId, userId, createdAt',
      users: '++id, pin, role, isActive',
      settings: '++id',
      stockAdjustments: '++id, productId, createdAt'
    });
  }
}

// Create database instance
export const db = new POSDatabase();

// Initialize default settings
export const initializeDefaultSettings = async () => {
  const existingSettings = await db.settings.toArray();

  if (existingSettings.length === 0) {
    await db.settings.add({
      shopName: 'NEXUS Supermarket',
      shopNameKurdish: 'سووپەرمارکێتی نێکسەس',
      shopAddress: 'سلێمانی، عێراق',
      shopPhone: '+964 750 123 4567',
      taxRate: 0,
      currencySymbol: 'IQD',
      language: 'ku',
      autoBackup: true
    });
  }
};

// Initialize default admin user
export const initializeDefaultUser = async () => {
  const existingUsers = await db.users.toArray();

  if (existingUsers.length === 0) {
    await db.users.add({
      name: 'Admin',
      pin: '1234',
      role: 'owner',
      createdAt: new Date(),
      isActive: true
    });
  }
};

// Utility function to generate transaction ID
export const generateTransactionId = (): string => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const seconds = String(now.getSeconds()).padStart(2, '0');
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');

  return `TXN${year}${month}${day}${hours}${minutes}${seconds}${random}`;
};

// Export data to JSON
export const exportAllData = async () => {
  const data = {
    products: await db.products.toArray(),
    sales: await db.sales.toArray(),
    customers: await db.customers.toArray(),
    cashTransactions: await db.cashTransactions.toArray(),
    users: await db.users.toArray(),
    settings: await db.settings.toArray(),
    stockAdjustments: await db.stockAdjustments.toArray(),
    exportDate: new Date().toISOString()
  };

  return data;
};

// Import data from JSON
export const importAllData = async (data: any) => {
  try {
    // Clear existing data
    await db.products.clear();
    await db.sales.clear();
    await db.customers.clear();
    await db.cashTransactions.clear();
    await db.users.clear();
    await db.settings.clear();
    await db.stockAdjustments.clear();

    // Import new data
    if (data.products) await db.products.bulkAdd(data.products);
    if (data.sales) await db.sales.bulkAdd(data.sales);
    if (data.customers) await db.customers.bulkAdd(data.customers);
    if (data.cashTransactions) await db.cashTransactions.bulkAdd(data.cashTransactions);
    if (data.users) await db.users.bulkAdd(data.users);
    if (data.settings) await db.settings.bulkAdd(data.settings);
    if (data.stockAdjustments) await db.stockAdjustments.bulkAdd(data.stockAdjustments);

    return true;
  } catch (error) {
    console.error('Import failed:', error);
    return false;
  }
};

// Initialize database with default data
export const initializeDatabase = async () => {
  await initializeDefaultSettings();
  await initializeDefaultUser();
};
