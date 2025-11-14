# NEXUS POS - Kurdish Supermarket Point of Sale System

<div dir="rtl" align="right">

## سیستەمی فرۆشتن بۆ سووپەرمارکێتەکانی کوردستان

**NEXUS POS** سیستەمێکی تەواو و پڕۆفیشناڵە بۆ بەڕێوەبردنی فرۆشتن لە سووپەرمارکێتەکان. بە تەواوی بەبێ ئینتەرنێت کاردەکات و تایبەتە بۆ ناوچەی سلێمانی و کوردستانی عێراق.

</div>

---

## 🌟 Key Features

### ✅ Complete Offline Functionality
- **100% offline-first** - Works without any internet connection
- All data stored locally in IndexedDB
- No cloud dependencies whatsoever
- Perfect for areas with unreliable internet

### 🇰🇺 Full Kurdish Localization
- Complete UI in Kurdish (Sorani dialect)
- RTL (Right-to-Left) text support
- Kurdish number and currency formatting
- Iraqi Dinar (IQD) support: 15,000 دینار

### 🖨️ Bluetooth Thermal Printer Support
- Connect to 58mm thermal receipt printers via Web Bluetooth
- ESC/POS command protocol
- Print receipts in Kurdish with proper formatting
- Compatible with Goojprt, Zjiang models

### 📱 Progressive Web App (PWA)
- Install on Android tablets like a native app
- Works offline after first load
- Optimized for 10" tablets (1280x800)
- Also works on laptops and iPads

### 💰 Complete POS Features
1. **Quick Sale Screen** - Fast checkout with barcode scanning
2. **Inventory Management** - Track products, stock, prices
3. **Sales Reports** - Daily, weekly, monthly analytics with charts
4. **Cash Register** - Track cash flow, reconciliation
5. **Customer Management** - Track purchases, credit, loyalty
6. **Settings** - Configure shop, printer, backup/restore

---

## 🚀 Quick Start

### Requirements
- Node.js 18+ and npm
- Modern browser (Chrome, Edge, or Firefox)
- For Bluetooth printing: Chrome or Edge only

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/nexus-pos.git
cd nexus-pos

# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

The app will open at `http://localhost:3000`

### Default Login
- **PIN**: `1234`
- **User**: Admin (Owner role)

---

## 🛠️ Technology Stack

- **React 18+** with TypeScript
- **Vite** - Fast build tooling
- **TailwindCSS** - Utility-first styling
- **Zustand** - State management
- **Dexie.js** - IndexedDB wrapper
- **React Router** - Navigation
- **vite-plugin-pwa** - PWA support
- **Recharts** - Data visualization
- **jsPDF** - PDF generation

---

## 📦 Project Structure

```
src/
├── components/       # Layout & navigation
├── screens/         # Main app screens
│   ├── AuthScreen.tsx        # PIN login
│   ├── QuickSale.tsx         # POS checkout
│   ├── Inventory.tsx         # Product management
│   ├── Reports.tsx           # Analytics
│   ├── CashRegister.tsx      # Cash tracking
│   ├── Customers.tsx         # Customer CRM
│   └── Settings.tsx          # Configuration
├── db/              # IndexedDB schema
├── store/           # Zustand stores
├── i18n/            # Kurdish translations
├── utils/           # Printer utilities
└── types/           # TypeScript definitions
```

---

## 🖨️ Printer Setup

### Supported Printers
- 58mm Bluetooth thermal printers
- ESC/POS compatible models
- Tested: Goojprt, Zjiang

### Connection Steps
1. Go to Settings → Printer Settings
2. Click "Connect Printer"
3. Select your printer from list
4. Click "Test Print" to verify

### Browser Requirements
- **Chrome** or **Edge** (Web Bluetooth supported)
- Must be HTTPS or localhost

---

## 💾 Data Management

### Backup
1. Go to Settings → Backup & Restore
2. Click "Export Data"
3. Downloads `nexus-pos-backup-YYYY-MM-DD.json`
4. Save to USB drive or cloud storage

### Restore
1. Go to Settings → Backup & Restore
2. Click "Import Data"
3. Select your backup JSON file

### Data Stored Locally
- Products, Sales, Customers
- Cash transactions
- Users & Settings
- Stock adjustments

---

## 📱 Installation on Android Tablet

1. Open Chrome on tablet
2. Go to your deployed URL or `http://localhost:3000`
3. Tap menu (⋮) → "Install app"
4. App icon appears on home screen
5. Opens fullscreen like native app

---

## 🎯 Screens Overview

### 1. Quick Sale (فرۆشتنی خێرا)
- Product search & barcode scanning
- Shopping cart management
- Discount application
- Multiple payment methods
- Print receipt

### 2. Inventory (کۆگا)
- Add/edit/delete products
- Category management
- Low stock alerts
- Profit margin tracking

### 3. Reports (راپۆرت)
- Sales analytics with charts
- Date range filtering
- Top/worst sellers
- Export to PDF

### 4. Cash Register (سندووقی دراو)
- Track cash flow
- Deposits/withdrawals
- Safe drops
- Reconciliation

### 5. Customers (کڕیاران)
- Customer database
- Purchase history
- Credit tracking
- Loyalty points

### 6. Settings (ڕێکخستن)
- Shop configuration
- Printer setup
- Data backup/restore
- User management

---

## 🐛 Troubleshooting

### Printer Not Connecting
- Ensure Bluetooth is ON
- Use Chrome or Edge
- Check printer battery
- Try scanning again

### Data Not Saving
- Check browser storage permissions
- Clear cache and reload
- Ensure IndexedDB is enabled

### App Not Installing (PWA)
- Must be served via HTTPS
- Check browser supports PWA
- Manifest file must be valid

---

## 📄 License

MIT License - Free to use and modify!

---

## 👥 Support

<div dir="rtl" align="right">

### پشتگیری
- **تەلەفۆن**: +964 750 123 4567 (WhatsApp)
- **کاتژمێری کارکردن**: 9:00 - 18:00 (کاتی عێراق)

</div>

---

<div dir="rtl" align="center">

### سوپاس بۆ بەکارهێنانی NEXUS POS
**سەرکەوتن بۆ دوکانەکەت!**

Built with ❤️ for Kurdish supermarket owners

</div>
