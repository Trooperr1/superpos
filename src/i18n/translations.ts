// Kurdish (Sorani) translations for NEXUS POS
export const translations = {
  ku: {
    // Common
    common: {
      save: 'پاشەکەوتکردن',
      cancel: 'هەڵوەشاندنەوە',
      delete: 'سڕینەوە',
      edit: 'دەستکاریکردن',
      add: 'زیادکردن',
      search: 'گەڕان',
      print: 'چاپکردن',
      export: 'هەناردەکردن',
      import: 'هاوردەکردن',
      confirm: 'دڵنیاکردنەوە',
      yes: 'بەڵێ',
      no: 'نەخێر',
      ok: 'باشە',
      close: 'داخستن',
      back: 'گەڕانەوە',
      next: 'دواتر',
      loading: 'بارکردن...',
      error: 'هەڵە',
      success: 'سەرکەوتوو',
      warning: 'ئاگادارکردنەوە',
      total: 'کۆی گشتی',
      subtotal: 'کۆی کاتی',
      discount: 'داشکاندن',
      tax: 'باج',
      currency: 'دینار',
      date: 'بەروار',
      time: 'کات',
      today: 'ئەمڕۆ',
      yesterday: 'دوێنێ',
      thisWeek: 'ئەم هەفتەیە',
      thisMonth: 'ئەم مانگە',
      customRange: 'ماوەی دیاریکراو',
      quantity: 'بڕ',
      price: 'نرخ',
      name: 'ناو',
      phone: 'تەلەفۆن',
      address: 'ناونیشان',
      notes: 'تێبینی',
      status: 'دۆخ',
      active: 'چالاک',
      inactive: 'ناچالاک',
      all: 'هەموو',
      offlineMode: 'دۆخی ئۆفلاین',
      online: 'ئۆنلاین',
      offline: 'ئۆفلاین',
    },

    // Navigation
    nav: {
      quickSale: 'فرۆشتنی خێرا',
      inventory: 'کۆگا',
      reports: 'راپۆرت',
      cashRegister: 'سندووقی دراو',
      customers: 'کڕیاران',
      settings: 'ڕێکخستن',
    },

    // Quick Sale Screen
    sale: {
      title: 'فرۆشتنی خێرا',
      searchProduct: 'گەڕان بۆ بەرهەم...',
      scanBarcode: 'سکان کردنی بارکۆد',
      cart: 'سەبەتە',
      emptyCart: 'سەبەتە بەتاڵە',
      addToCart: 'زیادکردن بۆ سەبەتە',
      removeItem: 'لابردنی بەرهەم',
      clearCart: 'بەتاڵکردنی سەبەتە',
      clearCartConfirm: 'دڵنیایت لە بەتاڵکردنی سەبەتە؟',
      itemCount: 'ژمارەی بەرهەم',
      totalItems: '{count} بەرهەم',
      paymentMethod: 'شێوازی پارەدان',
      cash: 'کاش',
      card: 'کارت',
      mixed: 'تێکەڵ',
      amountPaid: 'بڕی پارەی دراو',
      change: 'پارەی گەڕاوە',
      completeSale: 'تەواوکردنی فرۆشتن',
      printReceipt: 'چاپکردنی وەسڵ',
      saleCompleted: 'فرۆشتن تەواو بوو',
      saleError: 'هەڵەیەک ڕوویدا لە فرۆشتن',
      discountAmount: 'بڕی داشکاندن',
      discountPercent: 'ڕێژەی داشکاندن',
      applyDiscount: 'جێبەجێکردنی داشکاندن',
      removeDiscount: 'لابردنی داشکاندن',
      quickProducts: 'بەرهەمە خێراکان',
      outOfStock: 'کۆتایی هات',
      lowStock: 'کۆگا کەمە',
      insufficientStock: 'کۆگا بەسە نییە',
      enterAmount: 'بڕ بنووسە',
      enterQuantity: 'ژمارە بنووسە',
    },

    // Inventory Screen
    inventory: {
      title: 'بەڕێوەبردنی کۆگا',
      addProduct: 'زیادکردنی بەرهەمی نوێ',
      editProduct: 'دەستکاریکردنی بەرهەم',
      deleteProduct: 'سڕینەوەی بەرهەم',
      deleteConfirm: 'دڵنیایت لە سڕینەوەی ئەم بەرهەمە؟',
      productName: 'ناوی بەرهەم',
      productNameKurdish: 'ناوی بەرهەم بە کوردی',
      category: 'جۆر',
      barcode: 'بارکۆد',
      costPrice: 'نرخی کڕین',
      salePrice: 'نرخی فرۆشتن',
      currentStock: 'کۆگای ئێستا',
      reorderLevel: 'ئاستی داواکردنەوە',
      uploadImage: 'بارکردنی وێنە',
      productDetails: 'وردەکاری بەرهەم',
      stockAdjustment: 'ڕێکخستنی کۆگا',
      addStock: 'زیادکردنی کۆگا',
      removeStock: 'کەمکردنەوەی کۆگا',
      adjustmentReason: 'هۆکاری گۆڕانکاری',
      lowStockAlert: 'ئاگادارکردنەوەی کۆگای کەم',
      productsLowStock: '{count} بەرهەم کۆگایان کەمە',
      exportInventory: 'هەناردەکردنی کۆگا',
      importInventory: 'هاوردەکردنی کۆگا',
      categories: {
        drinks: 'خواردنەوە',
        snacks: 'خواردن',
        dairy: 'شیر و ماست',
        bread: 'نان',
        canned: 'کۆنسێرڤ',
        household: 'ماڵەوە',
        personal: 'تایبەتی',
        other: 'هیتر',
      },
      profit: 'قازانج',
      profitMargin: 'ڕێژەی قازانج',
    },

    // Reports Screen
    reports: {
      title: 'راپۆرتی فرۆشتن',
      todaySales: 'فرۆشتنی ئەمڕۆ',
      totalRevenue: 'داهاتی گشتی',
      totalTransactions: 'ژمارەی مامەڵە',
      averageTransaction: 'مامەڵەی ناوەند',
      topProducts: 'باشترین بەرهەمەکان',
      salesByCategory: 'فرۆشتن بەپێی جۆر',
      salesByHour: 'فرۆشتن بەپێی کاتژمێر',
      salesByPayment: 'فرۆشتن بەپێی شێوازی پارەدان',
      detailedSales: 'وردەکاری فرۆشتن',
      transactionId: 'ژمارەی مامەڵە',
      items: 'بەرهەمەکان',
      amount: 'بڕ',
      dateRange: 'ماوەی بەروار',
      selectRange: 'دیاریکردنی ماوە',
      from: 'لە',
      to: 'بۆ',
      generateReport: 'دروستکردنی راپۆرت',
      exportPDF: 'هەناردەکردن بە PDF',
      exportCSV: 'هەناردەکردن بە CSV',
      profitReport: 'راپۆرتی قازانج',
      totalProfit: 'قازانجی گشتی',
      bestSellers: 'باشترین فرۆشەکان',
      worstSellers: 'کەمترین فرۆشەکان',
      dailyReport: 'راپۆرتی ڕۆژانە',
      weeklyReport: 'راپۆرتی هەفتانە',
      monthlyReport: 'راپۆرتی مانگانە',
      zReport: 'راپۆرتی Z',
      printZReport: 'چاپکردنی راپۆرتی Z',
      soldQuantity: 'بڕی فرۆشراو',
      revenue: 'داهات',
    },

    // Cash Register Screen
    cashRegister: {
      title: 'سندووقی دراو',
      openingFloat: 'پارەی سەرەتایی',
      currentCash: 'پارەی ئێستا',
      expectedCash: 'پارەی چاوەڕوانکراو',
      actualCash: 'پارەی ڕاستەقینە',
      variance: 'جیاوازی',
      cashIn: 'پارەی هاتوو',
      cashOut: 'پارەی چووە دەرەوە',
      openRegister: 'کردنەوەی سندووق',
      closeRegister: 'داخستنی سندووق',
      reconcile: 'ڕێککەوتن',
      safeDrop: 'ناردن بۆ سەندووق',
      addCash: 'زیادکردنی پارە',
      removeCash: 'دەرهێنانی پارە',
      reason: 'هۆکار',
      enterReason: 'هۆکار بنووسە',
      enterAmount: 'بڕ بنووسە',
      transactions: 'مامەڵەکان',
      transactionType: 'جۆری مامەڵە',
      sale: 'فرۆشتن',
      withdrawal: 'دەرهێنان',
      deposit: 'خستنە ناوەوە',
      opening: 'کردنەوە',
      closing: 'داخستن',
      registerHistory: 'مێژووی سندووق',
      openedAt: 'کراوەتەوە لە',
      closedAt: 'داخراوە لە',
      opened: 'کراوەتەوە',
      closed: 'داخراوە',
    },

    // Customers Screen
    customers: {
      title: 'بەڕێوەبردنی کڕیاران',
      addCustomer: 'زیادکردنی کڕیاری نوێ',
      editCustomer: 'دەستکاریکردنی کڕیار',
      deleteCustomer: 'سڕینەوەی کڕیار',
      deleteConfirm: 'دڵنیایت لە سڕینەوەی ئەم کڕیارە؟',
      customerName: 'ناوی کڕیار',
      customerPhone: 'تەلەفۆنی کڕیار',
      customerEmail: 'ئیمەیڵی کڕیار',
      totalPurchases: 'کۆی کڕین',
      totalSpent: 'کۆی خەرجکراو',
      credit: 'قەرز',
      debt: 'قەرز',
      loyaltyPoints: 'خاڵی دڵسۆزی',
      lastVisit: 'دوا سەردان',
      purchaseHistory: 'مێژووی کڕین',
      addCredit: 'زیادکردنی قەرز',
      payCredit: 'پارەدانەوەی قەرز',
      viewHistory: 'بینینی مێژوو',
      customerDetails: 'وردەکاری کڕیار',
      noCustomers: 'هیچ کڕیارێک نییە',
      searchCustomer: 'گەڕان بۆ کڕیار...',
    },

    // Settings Screen
    settings: {
      title: 'ڕێکخستنەکان',
      shopSettings: 'ڕێکخستنی دوکان',
      shopName: 'ناوی دوکان',
      shopNameKurdish: 'ناوی دوکان بە کوردی',
      shopAddress: 'ناونیشانی دوکان',
      shopPhone: 'تەلەفۆنی دوکان',
      taxRate: 'ڕێژەی باج',
      currencySymbol: 'نیشانەی دراو',
      uploadLogo: 'بارکردنی لۆگۆ',
      printerSettings: 'ڕێکخستنی پرینتەر',
      scanPrinters: 'گەڕان بۆ پرینتەر',
      connectPrinter: 'پەیوەستکردنی پرینتەر',
      disconnectPrinter: 'پچڕاندنی پرینتەر',
      testPrint: 'تاقیکردنەوەی چاپ',
      printerConnected: 'پرینتەر پەیوەستکراوە',
      printerDisconnected: 'پرینتەر پچڕاوە',
      selectPrinter: 'هەڵبژاردنی پرینتەر',
      userSettings: 'ڕێکخستنی بەکارهێنەر',
      users: 'بەکارهێنەران',
      addUser: 'زیادکردنی بەکارهێنەر',
      editUser: 'دەستکاریکردنی بەکارهێنەر',
      deleteUser: 'سڕینەوەی بەکارهێنەر',
      userName: 'ناوی بەکارهێنەر',
      userPin: 'کۆدی تێپەڕ (۴ ژمارە)',
      userRole: 'ڕۆڵ',
      owner: 'خاوەن',
      cashier: 'کاشێر',
      backupRestore: 'پاڵپشت و گەڕاندنەوە',
      exportData: 'هەناردەکردنی داتا',
      importData: 'هاوردەکردنی داتا',
      autoBackup: 'پاڵپشتی خۆکار',
      lastBackup: 'دوا پاڵپشت',
      clearAllData: 'سڕینەوەی هەموو داتا',
      clearDataWarning: 'ئەم کارە هەموو داتاکان دەسڕێتەوە و ناگەڕێتەوە!',
      clearDataConfirm: 'دڵنیایت لە سڕینەوەی هەموو داتاکان؟',
      typeConfirm: 'بنووسە "CONFIRM" بۆ دڵنیاکردنەوە',
      language: 'زمان',
      about: 'دەربارە',
      version: 'وەشان',
      support: 'پشتگیری',
      contactSupport: 'پەیوەندی بە پشتگیری',
      settingsSaved: 'ڕێکخستنەکان پاشەکەوت کران',
      settingsError: 'هەڵەیەک ڕوویدا لە پاشەکەوتکردن',
    },

    // Authentication
    auth: {
      enterPin: 'کۆدی تێپەڕ بنووسە',
      incorrectPin: 'کۆدی تێپەڕ هەڵەیە',
      login: 'چوونە ژوورەوە',
      logout: 'چوونە دەرەوە',
      selectUser: 'بەکارهێنەر هەڵبژێرە',
      welcomeBack: 'بەخێربێیتەوە',
    },

    // Printer
    printer: {
      connecting: 'پەیوەستبوون...',
      connected: 'پەیوەستکراوە',
      disconnected: 'پچڕاوە',
      printing: 'چاپکردن...',
      printSuccess: 'چاپکردن سەرکەوتوو بوو',
      printError: 'هەڵەیەک ڕوویدا لە چاپکردن',
      noPrinter: 'هیچ پرینتەرێک نەدۆزرایەوە',
      bluetoothNotSupported: 'بلووتووس پشتگیری ناکرێت',
      selectDevice: 'ئامێر هەڵبژێرە',
    },

    // Errors
    errors: {
      required: 'پێویستە',
      invalidNumber: 'ژمارە دروست نییە',
      invalidPhone: 'ژمارەی تەلەفۆن دروست نییە',
      minValue: 'نابێت کەمتر بێت لە {min}',
      maxValue: 'نابێت زیاتر بێت لە {max}',
      outOfStock: 'کۆگا بەسە نییە',
      networkError: 'هەڵەی پەیوەندی',
      databaseError: 'هەڵەی بنکەی داتا',
      unknownError: 'هەڵەیەکی نەزانراو ڕوویدا',
    },

    // Success messages
    success: {
      productAdded: 'بەرهەم زیادکرا',
      productUpdated: 'بەرهەم نوێکرایەوە',
      productDeleted: 'بەرهەم سڕایەوە',
      saleCompleted: 'فرۆشتن تەواو بوو',
      customerAdded: 'کڕیار زیادکرا',
      customerUpdated: 'کڕیار نوێکرایەوە',
      customerDeleted: 'کڕیار سڕایەوە',
      dataExported: 'داتا هەناردە کرا',
      dataImported: 'داتا هاوردە کرا',
      backupCreated: 'پاڵپشت دروستکرا',
    },
  },

  // English (fallback)
  en: {
    // Add English translations here if needed
  },

  // Arabic (future)
  ar: {
    // Add Arabic translations here if needed
  },
};

// Get translation function
export const t = (key: string, lang: 'ku' | 'ar' | 'en' = 'ku', params?: Record<string, any>): string => {
  const keys = key.split('.');
  let value: any = translations[lang];

  for (const k of keys) {
    if (value && typeof value === 'object') {
      value = value[k];
    } else {
      return key; // Return key if translation not found
    }
  }

  // Replace parameters
  if (typeof value === 'string' && params) {
    Object.keys(params).forEach((param) => {
      value = value.replace(`{${param}}`, params[param]);
    });
  }

  return value || key;
};

// Format currency
export const formatCurrency = (amount: number, lang: 'ku' | 'ar' | 'en' = 'ku'): string => {
  const formatted = new Intl.NumberFormat('en-US').format(amount);
  return `${formatted} ${t('common.currency', lang)}`;
};

// Format date
export const formatDate = (date: Date, _lang: 'ku' | 'ar' | 'en' = 'ku'): string => {
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
};

// Format time
export const formatTime = (date: Date): string => {
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${hours}:${minutes}`;
};

// Format date and time
export const formatDateTime = (date: Date, lang: 'ku' | 'ar' | 'en' = 'ku'): string => {
  return `${formatDate(date, lang)} ${formatTime(date)}`;
};
