import { useState, useEffect, useRef, useCallback } from 'react';
import { db, type Product, type Customer, generateTransactionId } from '../db/database';
import { useCartStore, useAuthStore, useSettingsStore, useUIStore } from '../store/useStore';
import { t, formatCurrency } from '../i18n/translations';
import {
  MagnifyingGlassIcon,
  TrashIcon,
  PlusIcon,
  MinusIcon,
  XMarkIcon,
  BanknotesIcon,
  CreditCardIcon,
  UserIcon,
  ClockIcon,
} from '@heroicons/react/24/outline';
import NumberPad from '../components/NumberPad';

const QUICK_AMOUNTS = [5000, 10000, 25000, 50000, 100000];
const SCAN_TIMEOUT = 100; // Max ms between keystrokes for barcode scan
const MIN_BARCODE_LENGTH = 4; // Minimum barcode length

const QuickSale = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [quickProducts, setQuickProducts] = useState<Product[]>([]);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'card' | 'mixed' | 'credit'>('cash');
  const [cashAmount, setCashAmount] = useState('');
  const [cardAmount, setCardAmount] = useState('');
  const [activeInput, setActiveInput] = useState<'cash' | 'card'>('cash');
  const [scannerFlash, setScannerFlash] = useState(false);

  // Credit/Debt customer selection
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [customerSearchQuery, setCustomerSearchQuery] = useState('');
  const [filteredCustomers, setFilteredCustomers] = useState<Customer[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [showNewCustomerForm, setShowNewCustomerForm] = useState(false);
  const [newCustomerName, setNewCustomerName] = useState('');
  const [newCustomerPhone, setNewCustomerPhone] = useState('');

  // Barcode scanner refs
  const scanBufferRef = useRef('');
  const lastKeyTimeRef = useRef(0);
  const scanTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const cart = useCartStore();
  const { currentUser } = useAuthStore();
  const { settings } = useSettingsStore();
  const { showNotification } = useUIStore();

  const taxRate = settings?.taxRate || 0;

  useEffect(() => {
    loadProducts();
    loadCustomers();
  }, []);

  // Load customers for credit sales
  const loadCustomers = async () => {
    try {
      const allCustomers = await db.customers.toArray();
      setCustomers(allCustomers);
    } catch (error) {
      console.error('Failed to load customers:', error);
    }
  };

  // Filter customers based on search
  useEffect(() => {
    if (customerSearchQuery.trim()) {
      const query = customerSearchQuery.toLowerCase();
      const filtered = customers.filter(
        (c) =>
          c.name.toLowerCase().includes(query) ||
          c.phone?.toLowerCase().includes(query)
      );
      setFilteredCustomers(filtered.slice(0, 5));
    } else {
      setFilteredCustomers([]);
    }
  }, [customerSearchQuery, customers]);

  useEffect(() => {
    // Filter products based on search
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      const filtered = products.filter(
        (p) =>
          p.name.toLowerCase().includes(query) ||
          p.nameKurdish.toLowerCase().includes(query) ||
          p.barcode?.includes(query)
      );
      setFilteredProducts(filtered.slice(0, 10)); // Limit to 10 results
    } else {
      setFilteredProducts([]);
    }
  }, [searchQuery, products]);

  // Process scanned barcode
  const processBarcode = useCallback(async (barcode: string) => {
    if (barcode.length < MIN_BARCODE_LENGTH) return;

    try {
      const product = await db.products.where('barcode').equals(barcode).first();

      if (product) {
        if (product.stock <= 0) {
          showNotification('error', t('sale.outOfStock'));
          return;
        }

        // Visual feedback - flash
        setScannerFlash(true);
        setTimeout(() => setScannerFlash(false), 300);

        // Audio feedback - beep
        try {
          const audioContext = new (window.AudioContext || (window as typeof window & { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
          const oscillator = audioContext.createOscillator();
          const gainNode = audioContext.createGain();
          oscillator.connect(gainNode);
          gainNode.connect(audioContext.destination);
          oscillator.frequency.value = 1200;
          oscillator.type = 'sine';
          gainNode.gain.value = 0.3;
          oscillator.start();
          setTimeout(() => oscillator.stop(), 100);
        } catch {
          // Audio not supported, ignore
        }

        cart.addItem(product, 1);
        setSearchQuery('');
        setFilteredProducts([]);
      } else {
        showNotification('error', 'بارکۆد نەدۆزرایەوە');
      }
    } catch (error) {
      console.error('Barcode scan error:', error);
      showNotification('error', 'هەڵە لە خوێندنەوەی بارکۆد');
    }
  }, [cart, showNotification]);

  // Barcode scanner keyboard listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't process if payment modal is open
      if (showPaymentModal) return;

      const now = Date.now();
      const timeSinceLastKey = now - lastKeyTimeRef.current;

      // If Enter key - process the buffer
      if (e.key === 'Enter') {
        if (scanBufferRef.current.length >= MIN_BARCODE_LENGTH) {
          e.preventDefault();
          processBarcode(scanBufferRef.current);
        }
        scanBufferRef.current = '';
        return;
      }

      // Only accept alphanumeric characters for barcode
      if (e.key.length === 1 && /^[a-zA-Z0-9]$/.test(e.key)) {
        // If too much time passed, this is likely manual typing - reset buffer
        if (timeSinceLastKey > SCAN_TIMEOUT && scanBufferRef.current.length > 0) {
          scanBufferRef.current = '';
        }

        scanBufferRef.current += e.key;
        lastKeyTimeRef.current = now;

        // Clear any existing timeout
        if (scanTimeoutRef.current) {
          clearTimeout(scanTimeoutRef.current);
        }

        // Set timeout to clear buffer if no more keys
        scanTimeoutRef.current = setTimeout(() => {
          scanBufferRef.current = '';
        }, SCAN_TIMEOUT * 3);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      if (scanTimeoutRef.current) {
        clearTimeout(scanTimeoutRef.current);
      }
    };
  }, [showPaymentModal, processBarcode]);

  const loadProducts = async () => {
    try {
      const allProducts = await db.products.toArray();
      setProducts(allProducts);

      // Get top 20 products for quick access (by stock or manually marked)
      const quick = allProducts.slice(0, 20);
      setQuickProducts(quick);
    } catch (error) {
      console.error('Failed to load products:', error);
    }
  };

  const handleAddToCart = (product: Product) => {
    if (product.stock <= 0) {
      showNotification('error', t('sale.outOfStock'));
      return;
    }

    cart.addItem(product, 1);
    setSearchQuery('');
    setFilteredProducts([]);
  };

  const handleUpdateQuantity = (productId: number, newQuantity: number) => {
    const item = cart.items.find((i) => i.productId === productId);
    if (item && newQuantity > item.product.stock) {
      showNotification('error', t('sale.insufficientStock'));
      return;
    }
    cart.updateQuantity(productId, newQuantity);
  };

  const handleCheckout = () => {
    if (cart.items.length === 0) {
      showNotification('warning', t('sale.emptyCart'));
      return;
    }
    setShowPaymentModal(true);
  };

  // Create new customer on the spot for credit sale
  const handleCreateCustomer = async () => {
    if (!newCustomerName.trim()) {
      showNotification('error', 'ناوی کڕیار پێویستە');
      return;
    }

    try {
      const customerId = await db.customers.add({
        name: newCustomerName,
        phone: newCustomerPhone || undefined,
        totalPurchases: 0,
        totalSpent: 0,
        credit: 0,
        loyaltyPoints: 0,
        createdAt: new Date(),
      });

      const newCustomer = await db.customers.get(customerId);
      if (newCustomer) {
        setSelectedCustomer(newCustomer);
        setShowNewCustomerForm(false);
        setNewCustomerName('');
        setNewCustomerPhone('');
        loadCustomers();
        showNotification('success', 'کڕیار زیادکرا');
      }
    } catch (error) {
      console.error('Failed to create customer:', error);
      showNotification('error', t('errors.unknownError'));
    }
  };

  const handleCompleteSale = async () => {
    try {
      const subtotal = cart.getSubtotal();
      const tax = cart.getTax(taxRate);
      const total = cart.getTotal(taxRate);

      let cashPaid = 0;
      let cardPaid = 0;

      // Validate credit sale has customer selected
      if (paymentMethod === 'credit') {
        if (!selectedCustomer) {
          showNotification('error', 'تکایە کڕیارێک هەڵبژێرە بۆ قەرز');
          return;
        }
      } else if (paymentMethod === 'cash') {
        cashPaid = parseFloat(cashAmount) || 0;
        if (cashPaid < total) {
          showNotification('error', 'بڕی پارەی دراو کەمە');
          return;
        }
      } else if (paymentMethod === 'card') {
        cardPaid = total;
      } else if (paymentMethod === 'mixed') {
        cashPaid = parseFloat(cashAmount) || 0;
        cardPaid = parseFloat(cardAmount) || 0;
        if (cashPaid + cardPaid < total) {
          showNotification('error', 'بڕی پارەی دراو کەمە');
          return;
        }
      }

      const changeGiven = paymentMethod === 'cash' ? cashPaid - total : 0;

      // Create sale record
      const saleId = await db.sales.add({
        transactionId: generateTransactionId(),
        items: cart.items.map((item) => ({
          productId: item.productId,
          productName: item.productName,
          quantity: item.quantity,
          price: item.price,
          subtotal: item.subtotal,
        })),
        subtotal,
        discount: cart.discount,
        discountType: cart.discountType,
        tax,
        total,
        paymentMethod,
        cashAmount: cashPaid || undefined,
        cardAmount: cardPaid || undefined,
        changeGiven: changeGiven > 0 ? changeGiven : undefined,
        customerId: selectedCustomer?.id,
        userId: currentUser?.id,
        createdAt: new Date(),
      });

      // Update product stock
      for (const item of cart.items) {
        await db.products.update(item.productId, {
          stock: item.product.stock - item.quantity,
          updatedAt: new Date(),
        });
      }

      // Handle credit sale - add to customer's debt
      if (paymentMethod === 'credit' && selectedCustomer) {
        await db.customers.update(selectedCustomer.id!, {
          credit: selectedCustomer.credit + total,
          totalPurchases: selectedCustomer.totalPurchases + 1,
          totalSpent: selectedCustomer.totalSpent + total,
          lastVisit: new Date(),
        });
        showNotification('success', `قەرز زیادکرا - ${formatCurrency(total)} بۆ ${selectedCustomer.name}`);
      } else {
        // Add cash transaction - record the SALE amount (revenue), not cash tendered
        // For cash payments: record total sale amount as revenue
        // For mixed payments: record the cash portion of the sale
        if (paymentMethod === 'cash' || paymentMethod === 'mixed') {
          const cashRevenue = paymentMethod === 'cash' ? total : cashPaid;
          await db.cashTransactions.add({
            type: 'sale',
            amount: cashRevenue,
            saleId,
            userId: currentUser?.id,
            createdAt: new Date(),
          });
        }
        showNotification('success', t('success.saleCompleted'));
      }

      // Clear cart and close modal
      cart.clearCart();
      setShowPaymentModal(false);
      setCashAmount('');
      setCardAmount('');
      setSelectedCustomer(null);
      setCustomerSearchQuery('');

      // Reload products to update stock
      loadProducts();
      loadCustomers();
    } catch (error) {
      console.error('Failed to complete sale:', error);
      showNotification('error', t('errors.unknownError'));
    }
  };

  const handleQuickAmount = (amount: number) => {
    if (activeInput === 'cash') {
      setCashAmount(amount.toString());
    } else {
      setCardAmount(amount.toString());
    }
  };

  const handleNumberPadChange = (value: string) => {
    if (activeInput === 'cash') {
      setCashAmount(value);
    } else {
      setCardAmount(value);
    }
  };

  const subtotal = cart.getSubtotal();
  const discountAmount = cart.getDiscountAmount();
  const tax = cart.getTax(taxRate);
  const total = cart.getTotal(taxRate);

  const currentInputValue = activeInput === 'cash' ? cashAmount : cardAmount;
  const totalPaid = (parseFloat(cashAmount) || 0) + (parseFloat(cardAmount) || 0);
  const changeAmount = paymentMethod === 'cash' && parseFloat(cashAmount) >= total
    ? parseFloat(cashAmount) - total
    : 0;

  return (
    <div className="flex h-full gap-4" dir="rtl">
      {/* Scanner Ready Indicator */}
      <div
        className={`fixed top-4 left-4 z-40 flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-all ${
          scannerFlash
            ? 'bg-emerald-500 text-white scale-110'
            : 'bg-emerald-100 text-emerald-700'
        }`}
      >
        <span>{scannerFlash ? '✓' : '📷'}</span>
        <span className="kurdish-text">{scannerFlash ? 'سکان کرا!' : 'سکانەر ئامادەیە'}</span>
      </div>

      {/* Left Side - Products */}
      <div className="flex-1 flex flex-col space-y-4">
        {/* Search Bar */}
        <div className="relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t('sale.searchProduct')}
            className="w-full rounded-lg border-2 border-gray-300 py-3 pr-12 pl-4 text-lg focus:border-emerald-500 focus:outline-none kurdish-text"
          />
          <MagnifyingGlassIcon className="absolute right-3 top-1/2 h-6 w-6 -translate-y-1/2 text-gray-400" />

          {/* Search Results Dropdown */}
          {filteredProducts.length > 0 && (
            <div className="absolute z-10 mt-2 max-h-96 w-full overflow-auto rounded-lg border border-gray-200 bg-white shadow-lg">
              {filteredProducts.map((product) => (
                <button
                  key={product.id}
                  onClick={() => handleAddToCart(product)}
                  className="flex w-full items-center justify-between border-b border-gray-100 p-4 text-right hover:bg-emerald-50 touch-button"
                >
                  <div className="flex-1">
                    <p className="font-medium text-gray-800 kurdish-text">
                      {product.nameKurdish || product.name}
                    </p>
                    <p className="text-sm text-gray-500">
                      {formatCurrency(product.price)} • {t('inventory.currentStock')}: {product.stock}
                    </p>
                  </div>
                  {product.stock <= 0 && (
                    <span className="rounded-full bg-red-100 px-3 py-1 text-xs text-red-600 kurdish-text">
                      {t('sale.outOfStock')}
                    </span>
                  )}
                  {product.stock > 0 && product.stock <= product.reorderLevel && (
                    <span className="rounded-full bg-yellow-100 px-3 py-1 text-xs text-yellow-600 kurdish-text">
                      {t('sale.lowStock')}
                    </span>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Quick Products Grid */}
        <div className="flex-1 overflow-auto">
          <h3 className="mb-3 text-lg font-semibold text-gray-800 kurdish-text">
            {t('sale.quickProducts')}
          </h3>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {quickProducts.map((product) => (
              <button
                key={product.id}
                onClick={() => handleAddToCart(product)}
                disabled={product.stock <= 0}
                className={`rounded-lg border-2 p-4 text-center transition-all touch-button ${
                  product.stock <= 0
                    ? 'border-gray-200 bg-gray-50 text-gray-400 cursor-not-allowed'
                    : 'border-emerald-200 bg-white hover:border-emerald-500 hover:bg-emerald-50'
                }`}
              >
                <p className="font-medium text-gray-800 kurdish-text line-clamp-2">
                  {product.nameKurdish || product.name}
                </p>
                <p className="mt-2 text-lg font-bold text-emerald-600">
                  {formatCurrency(product.price)}
                </p>
                <p className="mt-1 text-xs text-gray-500">
                  {t('inventory.currentStock')}: {product.stock}
                </p>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Right Side - Cart */}
      <div className="w-96 flex flex-col rounded-lg bg-white shadow-lg">
        <div className="border-b border-gray-200 p-4">
          <h2 className="text-xl font-bold text-gray-800 kurdish-text">{t('sale.cart')}</h2>
          <p className="text-sm text-gray-600 kurdish-text">
            {cart.items.length} {t('sale.itemCount')}
          </p>
        </div>

        {/* Cart Items */}
        <div className="flex-1 overflow-auto p-4">
          {cart.items.length === 0 ? (
            <div className="flex h-full items-center justify-center text-gray-400">
              <p className="kurdish-text">{t('sale.emptyCart')}</p>
            </div>
          ) : (
            <div className="space-y-3">
              {cart.items.map((item) => (
                <div key={item.productId} className="rounded-lg border border-gray-200 p-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="font-medium text-gray-800 kurdish-text">
                        {item.productName}
                      </p>
                      <p className="text-sm text-gray-600">
                        {formatCurrency(item.price)} × {item.quantity}
                      </p>
                    </div>
                    <button
                      onClick={() => cart.removeItem(item.productId)}
                      className="text-red-600 hover:text-red-700 touch-button"
                    >
                      <TrashIcon className="h-5 w-5" />
                    </button>
                  </div>
                  <div className="mt-2 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleUpdateQuantity(item.productId, item.quantity - 1)}
                        className="flex h-8 w-8 items-center justify-center rounded-lg bg-gray-100 hover:bg-gray-200 touch-button"
                      >
                        <MinusIcon className="h-4 w-4" />
                      </button>
                      <span className="w-8 text-center font-medium">{item.quantity}</span>
                      <button
                        onClick={() => handleUpdateQuantity(item.productId, item.quantity + 1)}
                        className="flex h-8 w-8 items-center justify-center rounded-lg bg-gray-100 hover:bg-gray-200 touch-button"
                      >
                        <PlusIcon className="h-4 w-4" />
                      </button>
                    </div>
                    <p className="text-lg font-bold text-emerald-600">
                      {formatCurrency(item.subtotal)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Cart Summary */}
        {cart.items.length > 0 && (
          <div className="border-t border-gray-200 p-4 space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600 kurdish-text">{t('common.subtotal')}</span>
              <span className="font-medium">{formatCurrency(subtotal)}</span>
            </div>
            {discountAmount > 0 && (
              <div className="flex justify-between text-sm text-red-600">
                <span className="kurdish-text">{t('common.discount')}</span>
                <span>-{formatCurrency(discountAmount)}</span>
              </div>
            )}
            {tax > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-600 kurdish-text">{t('common.tax')}</span>
                <span className="font-medium">{formatCurrency(tax)}</span>
              </div>
            )}
            <div className="flex justify-between border-t border-gray-200 pt-3 text-lg font-bold">
              <span className="kurdish-text">{t('common.total')}</span>
              <span className="text-emerald-600">{formatCurrency(total)}</span>
            </div>

            {/* Action Buttons */}
            <div className="space-y-2">
              <button
                onClick={handleCheckout}
                className="w-full rounded-lg bg-emerald-600 py-3 font-semibold text-white hover:bg-emerald-700 touch-button kurdish-text"
              >
                {t('sale.completeSale')}
              </button>
              <button
                onClick={() => cart.clearCart()}
                className="w-full rounded-lg border-2 border-red-600 py-3 font-semibold text-red-600 hover:bg-red-50 touch-button kurdish-text"
              >
                {t('sale.clearCart')}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Payment Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-2xl rounded-lg bg-white p-6" dir="rtl">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-xl font-bold text-gray-800 kurdish-text">
                {t('sale.paymentMethod')}
              </h3>
              <button
                onClick={() => setShowPaymentModal(false)}
                className="text-gray-600 hover:text-gray-800 touch-button"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>

            {/* Payment Method Selection */}
            <div className="mb-4 grid grid-cols-4 gap-2">
              <button
                onClick={() => { setPaymentMethod('cash'); setActiveInput('cash'); }}
                className={`rounded-lg border-2 py-2 font-medium transition-all touch-button kurdish-text text-sm ${
                  paymentMethod === 'cash'
                    ? 'border-emerald-600 bg-emerald-50 text-emerald-600'
                    : 'border-gray-300 text-gray-600'
                }`}
              >
                <BanknotesIcon className="mx-auto h-5 w-5 mb-1" />
                {t('sale.cash')}
              </button>
              <button
                onClick={() => setPaymentMethod('card')}
                className={`rounded-lg border-2 py-2 font-medium transition-all touch-button kurdish-text text-sm ${
                  paymentMethod === 'card'
                    ? 'border-emerald-600 bg-emerald-50 text-emerald-600'
                    : 'border-gray-300 text-gray-600'
                }`}
              >
                <CreditCardIcon className="mx-auto h-5 w-5 mb-1" />
                {t('sale.card')}
              </button>
              <button
                onClick={() => { setPaymentMethod('mixed'); setActiveInput('cash'); }}
                className={`rounded-lg border-2 py-2 font-medium transition-all touch-button kurdish-text text-sm ${
                  paymentMethod === 'mixed'
                    ? 'border-emerald-600 bg-emerald-50 text-emerald-600'
                    : 'border-gray-300 text-gray-600'
                }`}
              >
                {t('sale.mixed')}
              </button>
              <button
                onClick={() => setPaymentMethod('credit')}
                className={`rounded-lg border-2 py-2 font-medium transition-all touch-button kurdish-text text-sm ${
                  paymentMethod === 'credit'
                    ? 'border-orange-600 bg-orange-50 text-orange-600'
                    : 'border-gray-300 text-gray-600'
                }`}
              >
                <ClockIcon className="mx-auto h-5 w-5 mb-1" />
                قەرز
              </button>
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-2 gap-4">
              {/* Left Side - Input Display */}
              <div className="space-y-3">
                <div className="rounded-lg bg-gray-50 p-3">
                  <p className="text-sm text-gray-600 kurdish-text">{t('common.total')}</p>
                  <p className="text-2xl font-bold text-emerald-600">{formatCurrency(total)}</p>
                </div>

                {(paymentMethod === 'cash' || paymentMethod === 'mixed') && (
                  <button
                    onClick={() => setActiveInput('cash')}
                    className={`w-full rounded-lg border-2 p-3 text-right transition-all touch-button ${
                      activeInput === 'cash'
                        ? 'border-emerald-600 bg-emerald-50'
                        : 'border-gray-300'
                    }`}
                  >
                    <label className="block text-sm font-medium text-gray-700 kurdish-text mb-1">
                      <BanknotesIcon className="inline h-4 w-4 ml-1" />
                      {t('sale.amountPaid')} ({t('sale.cash')})
                    </label>
                    <p className="text-xl font-bold">{cashAmount || '0'}</p>
                  </button>
                )}

                {paymentMethod === 'mixed' && (
                  <button
                    onClick={() => setActiveInput('card')}
                    className={`w-full rounded-lg border-2 p-3 text-right transition-all touch-button ${
                      activeInput === 'card'
                        ? 'border-emerald-600 bg-emerald-50'
                        : 'border-gray-300'
                    }`}
                  >
                    <label className="block text-sm font-medium text-gray-700 kurdish-text mb-1">
                      <CreditCardIcon className="inline h-4 w-4 ml-1" />
                      {t('sale.amountPaid')} ({t('sale.card')})
                    </label>
                    <p className="text-xl font-bold">{cardAmount || '0'}</p>
                  </button>
                )}

                {paymentMethod === 'mixed' && (
                  <div className="rounded-lg bg-blue-50 p-3">
                    <p className="text-sm text-gray-600 kurdish-text">کۆی پارەی دراو</p>
                    <p className={`text-xl font-bold ${totalPaid >= total ? 'text-emerald-600' : 'text-red-600'}`}>
                      {formatCurrency(totalPaid)}
                    </p>
                  </div>
                )}

                {changeAmount > 0 && (
                  <div className="rounded-lg bg-emerald-50 p-3">
                    <p className="text-sm text-gray-600 kurdish-text">{t('sale.change')}</p>
                    <p className="text-xl font-bold text-emerald-600">
                      {formatCurrency(changeAmount)}
                    </p>
                  </div>
                )}

                {/* Confirm Button */}
                <button
                  onClick={handleCompleteSale}
                  className="w-full rounded-lg bg-emerald-600 py-3 font-semibold text-white hover:bg-emerald-700 touch-button kurdish-text"
                >
                  {t('sale.completeSale')}
                </button>
              </div>

              {/* Right Side - Number Pad (only for cash/mixed) */}
              {(paymentMethod === 'cash' || paymentMethod === 'mixed') && (
                <div className="space-y-3">
                  {/* Quick Amount Buttons */}
                  <div className="grid grid-cols-3 gap-2">
                    {QUICK_AMOUNTS.map((amount) => (
                      <button
                        key={amount}
                        onClick={() => handleQuickAmount(amount)}
                        className="rounded-lg border-2 border-gray-300 bg-white py-2 font-medium text-gray-800 hover:bg-gray-100 touch-button text-sm"
                      >
                        {formatCurrency(amount)}
                      </button>
                    ))}
                    <button
                      onClick={() => handleQuickAmount(total)}
                      className="rounded-lg border-2 border-emerald-500 bg-emerald-50 py-2 font-medium text-emerald-600 hover:bg-emerald-100 touch-button text-sm kurdish-text"
                    >
                      تەواو
                    </button>
                  </div>

                  {/* Number Pad */}
                  <NumberPad
                    value={currentInputValue}
                    onChange={handleNumberPadChange}
                    showDecimal={false}
                  />
                </div>
              )}

              {/* Card-only message */}
              {paymentMethod === 'card' && (
                <div className="flex items-center justify-center rounded-lg bg-gray-50 p-8">
                  <div className="text-center">
                    <CreditCardIcon className="mx-auto h-16 w-16 text-gray-400 mb-4" />
                    <p className="text-gray-600 kurdish-text">پارەدان بە کارت</p>
                    <p className="text-2xl font-bold text-emerald-600 mt-2">{formatCurrency(total)}</p>
                  </div>
                </div>
              )}

              {/* Credit/Debt - Customer Selection */}
              {paymentMethod === 'credit' && (
                <div className="space-y-3">
                  <div className="rounded-lg bg-orange-50 p-3 border-2 border-orange-200">
                    <p className="text-sm text-orange-700 kurdish-text font-medium">
                      <ClockIcon className="inline h-4 w-4 ml-1" />
                      فرۆشتن بە قەرز - پێویستە کڕیارێک هەڵبژێریت
                    </p>
                  </div>

                  {/* Selected Customer Display */}
                  {selectedCustomer ? (
                    <div className="rounded-lg border-2 border-emerald-500 bg-emerald-50 p-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <UserIcon className="h-8 w-8 text-emerald-600" />
                          <div>
                            <p className="font-semibold text-gray-800 kurdish-text">{selectedCustomer.name}</p>
                            {selectedCustomer.phone && (
                              <p className="text-sm text-gray-500">{selectedCustomer.phone}</p>
                            )}
                          </div>
                        </div>
                        <button
                          onClick={() => setSelectedCustomer(null)}
                          className="text-gray-400 hover:text-gray-600 touch-button"
                        >
                          <XMarkIcon className="h-5 w-5" />
                        </button>
                      </div>
                      {selectedCustomer.credit > 0 && (
                        <p className="mt-2 text-sm text-red-600 kurdish-text">
                          قەرزی ئێستا: {formatCurrency(selectedCustomer.credit)}
                        </p>
                      )}
                    </div>
                  ) : (
                    <>
                      {/* Customer Search */}
                      {!showNewCustomerForm ? (
                        <div className="space-y-2">
                          <div className="relative">
                            <input
                              type="text"
                              value={customerSearchQuery}
                              onChange={(e) => setCustomerSearchQuery(e.target.value)}
                              placeholder="گەڕان بۆ کڕیار (ناو یان ژمارە)"
                              className="w-full rounded-lg border-2 border-gray-300 py-2 pr-10 pl-3 focus:border-emerald-500 focus:outline-none kurdish-text"
                            />
                            <MagnifyingGlassIcon className="absolute right-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                          </div>

                          {/* Customer Search Results */}
                          {filteredCustomers.length > 0 && (
                            <div className="max-h-40 overflow-auto rounded-lg border border-gray-200 bg-white">
                              {filteredCustomers.map((customer) => (
                                <button
                                  key={customer.id}
                                  onClick={() => {
                                    setSelectedCustomer(customer);
                                    setCustomerSearchQuery('');
                                  }}
                                  className="flex w-full items-center gap-2 border-b border-gray-100 p-2 text-right hover:bg-emerald-50 touch-button"
                                >
                                  <UserIcon className="h-5 w-5 text-gray-400" />
                                  <div className="flex-1">
                                    <p className="font-medium text-gray-800 kurdish-text">{customer.name}</p>
                                    {customer.phone && <p className="text-xs text-gray-500">{customer.phone}</p>}
                                  </div>
                                  {customer.credit > 0 && (
                                    <span className="rounded bg-red-100 px-2 py-0.5 text-xs text-red-600">
                                      {formatCurrency(customer.credit)}
                                    </span>
                                  )}
                                </button>
                              ))}
                            </div>
                          )}

                          {/* Create New Customer Button */}
                          <button
                            onClick={() => setShowNewCustomerForm(true)}
                            className="w-full rounded-lg border-2 border-dashed border-gray-300 py-3 text-gray-600 hover:border-emerald-500 hover:text-emerald-600 touch-button kurdish-text"
                          >
                            <PlusIcon className="inline h-5 w-5 ml-1" />
                            کڕیاری نوێ زیادبکە
                          </button>
                        </div>
                      ) : (
                        /* New Customer Form */
                        <div className="space-y-3 rounded-lg border-2 border-gray-200 p-3">
                          <p className="font-medium text-gray-700 kurdish-text">کڕیاری نوێ</p>
                          <input
                            type="text"
                            value={newCustomerName}
                            onChange={(e) => setNewCustomerName(e.target.value)}
                            placeholder="ناوی کڕیار *"
                            className="w-full rounded-lg border-2 border-gray-300 py-2 px-3 focus:border-emerald-500 focus:outline-none kurdish-text"
                          />
                          <input
                            type="tel"
                            value={newCustomerPhone}
                            onChange={(e) => setNewCustomerPhone(e.target.value)}
                            placeholder="ژمارەی مۆبایل (ئارەزوومەندانە)"
                            className="w-full rounded-lg border-2 border-gray-300 py-2 px-3 focus:border-emerald-500 focus:outline-none"
                          />
                          <div className="flex gap-2">
                            <button
                              onClick={handleCreateCustomer}
                              className="flex-1 rounded-lg bg-emerald-600 py-2 text-white hover:bg-emerald-700 touch-button kurdish-text"
                            >
                              زیادکردن
                            </button>
                            <button
                              onClick={() => {
                                setShowNewCustomerForm(false);
                                setNewCustomerName('');
                                setNewCustomerPhone('');
                              }}
                              className="flex-1 rounded-lg border-2 border-gray-300 py-2 text-gray-600 hover:bg-gray-50 touch-button kurdish-text"
                            >
                              پاشگەزبوونەوە
                            </button>
                          </div>
                        </div>
                      )}
                    </>
                  )}

                  {/* Credit Sale Summary */}
                  {selectedCustomer && (
                    <div className="rounded-lg bg-orange-100 p-3 text-center">
                      <p className="text-sm text-orange-700 kurdish-text">قەرزی نوێ</p>
                      <p className="text-2xl font-bold text-orange-700">{formatCurrency(total)}</p>
                      <p className="text-xs text-orange-600 kurdish-text mt-1">
                        کۆی قەرز دوای فرۆشتن: {formatCurrency(selectedCustomer.credit + total)}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default QuickSale;
