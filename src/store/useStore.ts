import { create } from 'zustand';
import type { Product, SaleItem, User, Settings } from '../db/database';

// Cart store for Quick Sale
interface CartItem extends SaleItem {
  product: Product;
}

interface CartStore {
  items: CartItem[];
  discount: number;
  discountType: 'percentage' | 'fixed';
  addItem: (product: Product, quantity?: number) => void;
  removeItem: (productId: number) => void;
  updateQuantity: (productId: number, quantity: number) => void;
  clearCart: () => void;
  setDiscount: (amount: number, type: 'percentage' | 'fixed') => void;
  getSubtotal: () => number;
  getDiscountAmount: () => number;
  getTax: (taxRate: number) => number;
  getTotal: (taxRate: number) => number;
}

export const useCartStore = create<CartStore>((set, get) => ({
  items: [],
  discount: 0,
  discountType: 'fixed',

  addItem: (product, quantity = 1) => {
    const items = get().items;
    const existingItem = items.find((item) => item.productId === product.id);

    if (existingItem) {
      // Update quantity if item already in cart
      set({
        items: items.map((item) =>
          item.productId === product.id
            ? {
                ...item,
                quantity: item.quantity + quantity,
                subtotal: (item.quantity + quantity) * item.price,
              }
            : item
        ),
      });
    } else {
      // Add new item to cart
      set({
        items: [
          ...items,
          {
            productId: product.id!,
            productName: product.nameKurdish || product.name,
            quantity,
            price: product.price,
            subtotal: product.price * quantity,
            product,
          },
        ],
      });
    }
  },

  removeItem: (productId) => {
    set({ items: get().items.filter((item) => item.productId !== productId) });
  },

  updateQuantity: (productId, quantity) => {
    if (quantity <= 0) {
      get().removeItem(productId);
      return;
    }

    set({
      items: get().items.map((item) =>
        item.productId === productId
          ? {
              ...item,
              quantity,
              subtotal: quantity * item.price,
            }
          : item
      ),
    });
  },

  clearCart: () => {
    set({ items: [], discount: 0, discountType: 'fixed' });
  },

  setDiscount: (amount, type) => {
    set({ discount: amount, discountType: type });
  },

  getSubtotal: () => {
    return get().items.reduce((sum, item) => sum + item.subtotal, 0);
  },

  getDiscountAmount: () => {
    const subtotal = get().getSubtotal();
    const { discount, discountType } = get();

    if (discountType === 'percentage') {
      return (subtotal * discount) / 100;
    }
    return discount;
  },

  getTax: (taxRate) => {
    const subtotal = get().getSubtotal();
    const discountAmount = get().getDiscountAmount();
    return ((subtotal - discountAmount) * taxRate) / 100;
  },

  getTotal: (taxRate) => {
    const subtotal = get().getSubtotal();
    const discountAmount = get().getDiscountAmount();
    const tax = get().getTax(taxRate);
    return subtotal - discountAmount + tax;
  },
}));

// Auth store
interface AuthStore {
  currentUser: User | null;
  isAuthenticated: boolean;
  login: (user: User) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthStore>((set) => ({
  currentUser: null,
  isAuthenticated: false,

  login: (user) => {
    set({ currentUser: user, isAuthenticated: true });
  },

  logout: () => {
    set({ currentUser: null, isAuthenticated: false });
  },
}));

// Settings store
interface SettingsStore {
  settings: Settings | null;
  loadSettings: (settings: Settings) => void;
  updateSettings: (settings: Partial<Settings>) => void;
}

export const useSettingsStore = create<SettingsStore>((set, get) => ({
  settings: null,

  loadSettings: (settings) => {
    set({ settings });
  },

  updateSettings: (updates) => {
    const currentSettings = get().settings;
    if (currentSettings) {
      set({ settings: { ...currentSettings, ...updates } });
    }
  },
}));

// Printer store
interface PrinterStore {
  device: BluetoothDevice | null;
  characteristic: BluetoothRemoteGATTCharacteristic | null;
  isConnected: boolean;
  isConnecting: boolean;
  error: string | null;
  connect: () => Promise<void>;
  disconnect: () => void;
  print: (data: Uint8Array) => Promise<void>;
}

export const usePrinterStore = create<PrinterStore>((set, get) => ({
  device: null,
  characteristic: null,
  isConnected: false,
  isConnecting: false,
  error: null,

  connect: async () => {
    try {
      set({ isConnecting: true, error: null });

      // Check if Web Bluetooth is supported
      if (!navigator.bluetooth) {
        throw new Error('Web Bluetooth is not supported in this browser');
      }

      // Request Bluetooth device
      const device = await navigator.bluetooth.requestDevice({
        filters: [{ services: ['000018f0-0000-1000-8000-00805f9b34fb'] }],
        optionalServices: ['000018f0-0000-1000-8000-00805f9b34fb'],
      });

      // Connect to GATT server
      const server = await device.gatt!.connect();
      const service = await server.getPrimaryService('000018f0-0000-1000-8000-00805f9b34fb');
      const characteristic = await service.getCharacteristic('00002af1-0000-1000-8000-00805f9b34fb');

      set({
        device,
        characteristic,
        isConnected: true,
        isConnecting: false,
      });
    } catch (error: any) {
      set({
        error: error.message,
        isConnecting: false,
        isConnected: false,
      });
      throw error;
    }
  },

  disconnect: () => {
    const device = get().device;
    if (device && device.gatt?.connected) {
      device.gatt.disconnect();
    }
    set({
      device: null,
      characteristic: null,
      isConnected: false,
    });
  },

  print: async (data) => {
    const { characteristic, isConnected } = get();

    if (!isConnected || !characteristic) {
      throw new Error('Printer not connected');
    }

    try {
      // Send data in chunks (20 bytes at a time for BLE)
      const chunkSize = 20;
      for (let i = 0; i < data.length; i += chunkSize) {
        const chunk = data.slice(i, i + chunkSize);
        await characteristic.writeValue(chunk);
        // Small delay between chunks
        await new Promise((resolve) => setTimeout(resolve, 50));
      }
    } catch (error: any) {
      set({ error: error.message });
      throw error;
    }
  },
}));

// UI store (for general UI state)
interface UIStore {
  isLoading: boolean;
  isSidebarOpen: boolean;
  notification: {
    show: boolean;
    type: 'success' | 'error' | 'warning' | 'info';
    message: string;
  } | null;
  setLoading: (loading: boolean) => void;
  toggleSidebar: () => void;
  showNotification: (type: 'success' | 'error' | 'warning' | 'info', message: string) => void;
  hideNotification: () => void;
}

export const useUIStore = create<UIStore>((set) => ({
  isLoading: false,
  isSidebarOpen: true,
  notification: null,

  setLoading: (loading) => {
    set({ isLoading: loading });
  },

  toggleSidebar: () => {
    set((state) => ({ isSidebarOpen: !state.isSidebarOpen }));
  },

  showNotification: (type, message) => {
    set({ notification: { show: true, type, message } });
    // Auto hide after 5 seconds
    setTimeout(() => {
      set({ notification: null });
    }, 5000);
  },

  hideNotification: () => {
    set({ notification: null });
  },
}));
