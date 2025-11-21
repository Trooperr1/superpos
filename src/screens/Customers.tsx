import { useState, useEffect } from 'react';
import { db, type Customer } from '../db/database';
import { useAuthStore, useUIStore } from '../store/useStore';
import { t, formatCurrency, formatDate } from '../i18n/translations';
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  MagnifyingGlassIcon,
  XMarkIcon,
  UserIcon,
  BanknotesIcon,
  CreditCardIcon,
} from '@heroicons/react/24/outline';
import NumberPad from '../components/NumberPad';

const Customers = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [filteredCustomers, setFilteredCustomers] = useState<Customer[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [activeTab, setActiveTab] = useState<'customers' | 'debts'>('customers');

  // Payment modal state
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [payingCustomer, setPayingCustomer] = useState<Customer | null>(null);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'card'>('cash');
  const [paymentNotes, setPaymentNotes] = useState('');

  const { currentUser } = useAuthStore();
  const { showNotification } = useUIStore();

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    notes: '',
  });

  useEffect(() => {
    loadCustomers();
  }, []);

  useEffect(() => {
    filterCustomers();
  }, [customers, searchQuery, activeTab]);

  const loadCustomers = async () => {
    try {
      const allCustomers = await db.customers.reverse().toArray();
      setCustomers(allCustomers);
    } catch (error) {
      console.error('Failed to load customers:', error);
    }
  };

  const filterCustomers = () => {
    let filtered = customers;

    // Filter by tab
    if (activeTab === 'debts') {
      filtered = customers.filter((c) => c.credit > 0).sort((a, b) => b.credit - a.credit);
    }

    // Filter by search
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (c) =>
          c.name.toLowerCase().includes(query) ||
          c.phone?.toLowerCase().includes(query)
      );
    }

    setFilteredCustomers(filtered);
  };

  const handleOpenModal = (customer?: Customer) => {
    if (customer) {
      setEditingCustomer(customer);
      setFormData({
        name: customer.name,
        phone: customer.phone || '',
        email: customer.email || '',
        notes: customer.notes || '',
      });
    } else {
      setEditingCustomer(null);
      setFormData({
        name: '',
        phone: '',
        email: '',
        notes: '',
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingCustomer(null);
  };

  const handleSaveCustomer = async () => {
    try {
      if (!formData.name.trim()) {
        showNotification('error', t('errors.required'));
        return;
      }

      const customerData = {
        name: formData.name,
        phone: formData.phone || undefined,
        email: formData.email || undefined,
        notes: formData.notes || undefined,
      };

      if (editingCustomer) {
        await db.customers.update(editingCustomer.id!, customerData);
        showNotification('success', t('success.customerUpdated'));
      } else {
        await db.customers.add({
          ...customerData,
          totalPurchases: 0,
          totalSpent: 0,
          credit: 0,
          loyaltyPoints: 0,
          createdAt: new Date(),
        });
        showNotification('success', t('success.customerAdded'));
      }

      loadCustomers();
      handleCloseModal();
    } catch (error) {
      console.error('Failed to save customer:', error);
      showNotification('error', t('errors.unknownError'));
    }
  };

  const handleDeleteCustomer = async (customer: Customer) => {
    if (!confirm(t('customers.deleteConfirm'))) return;

    try {
      await db.customers.delete(customer.id!);
      showNotification('success', t('success.customerDeleted'));
      loadCustomers();
    } catch (error) {
      console.error('Failed to delete customer:', error);
      showNotification('error', t('errors.unknownError'));
    }
  };

  // Open payment modal
  const handleOpenPaymentModal = (customer: Customer) => {
    setPayingCustomer(customer);
    setPaymentAmount('');
    setPaymentMethod('cash');
    setPaymentNotes('');
    setShowPaymentModal(true);
  };

  // Record debt payment
  const handleRecordPayment = async () => {
    if (!payingCustomer) return;

    const amount = parseFloat(paymentAmount) || 0;
    if (amount <= 0) {
      showNotification('error', 'تکایە بڕێک داخڵ بکە');
      return;
    }

    if (amount > payingCustomer.credit) {
      showNotification('error', 'بڕەکە لە قەرزەکە زیاترە');
      return;
    }

    try {
      // Update customer credit
      await db.customers.update(payingCustomer.id!, {
        credit: payingCustomer.credit - amount,
      });

      // Add cash transaction if paid by cash
      if (paymentMethod === 'cash') {
        await db.cashTransactions.add({
          type: 'deposit',
          amount: amount,
          reason: `قەرزی ${payingCustomer.name}`,
          userId: currentUser?.id,
          createdAt: new Date(),
        });
      }

      showNotification('success', `پارە وەرگیرا - ${formatCurrency(amount)}`);
      setShowPaymentModal(false);
      setPayingCustomer(null);
      loadCustomers();
    } catch (error) {
      console.error('Failed to record payment:', error);
      showNotification('error', t('errors.unknownError'));
    }
  };

  // Calculate debt statistics
  const totalDebt = customers.reduce((sum, c) => sum + (c.credit > 0 ? c.credit : 0), 0);
  const customersWithDebt = customers.filter((c) => c.credit > 0).length;
  const largestDebt = Math.max(...customers.map((c) => c.credit), 0);

  return (
    <div className="space-y-4" dir="rtl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 kurdish-text">
            {t('customers.title')}
          </h1>
          <p className="text-sm text-gray-600 kurdish-text">
            {customers.length} کڕیار
          </p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 font-medium text-white hover:bg-emerald-700 touch-button kurdish-text"
        >
          <PlusIcon className="h-5 w-5" />
          {t('customers.addCustomer')}
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-200">
        <button
          onClick={() => setActiveTab('customers')}
          className={`px-4 py-2 font-medium border-b-2 transition-all touch-button kurdish-text ${
            activeTab === 'customers'
              ? 'border-emerald-600 text-emerald-600'
              : 'border-transparent text-gray-600 hover:text-gray-800'
          }`}
        >
          <UserIcon className="inline h-5 w-5 ml-1" />
          هەموو کڕیارەکان
        </button>
        <button
          onClick={() => setActiveTab('debts')}
          className={`px-4 py-2 font-medium border-b-2 transition-all touch-button kurdish-text ${
            activeTab === 'debts'
              ? 'border-orange-600 text-orange-600'
              : 'border-transparent text-gray-600 hover:text-gray-800'
          }`}
        >
          <BanknotesIcon className="inline h-5 w-5 ml-1" />
          قەرزەکان
          {customersWithDebt > 0 && (
            <span className="mr-2 rounded-full bg-red-500 px-2 py-0.5 text-xs text-white">
              {customersWithDebt}
            </span>
          )}
        </button>
      </div>

      {/* Debt Summary (only on debts tab) */}
      {activeTab === 'debts' && (
        <div className="grid grid-cols-3 gap-4">
          <div className="rounded-lg bg-red-50 border border-red-200 p-4">
            <p className="text-sm text-red-600 kurdish-text">قەرزی گشتی</p>
            <p className="text-2xl font-bold text-red-700">{formatCurrency(totalDebt)}</p>
          </div>
          <div className="rounded-lg bg-orange-50 border border-orange-200 p-4">
            <p className="text-sm text-orange-600 kurdish-text">خەڵکی قەرزدار</p>
            <p className="text-2xl font-bold text-orange-700">{customersWithDebt}</p>
          </div>
          <div className="rounded-lg bg-yellow-50 border border-yellow-200 p-4">
            <p className="text-sm text-yellow-600 kurdish-text">گەورەترین قەرز</p>
            <p className="text-2xl font-bold text-yellow-700">{formatCurrency(largestDebt)}</p>
          </div>
        </div>
      )}

      {/* Search */}
      <div className="relative">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder={t('customers.searchCustomer')}
          className="w-full rounded-lg border-2 border-gray-300 py-2 pr-10 pl-4 focus:border-emerald-500 focus:outline-none kurdish-text"
        />
        <MagnifyingGlassIcon className="absolute right-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
      </div>

      {/* Customers Grid / Debt List */}
      {filteredCustomers.length === 0 ? (
        <div className="rounded-lg bg-white p-12 text-center shadow">
          <UserIcon className="mx-auto h-16 w-16 text-gray-300" />
          <p className="mt-4 text-gray-500 kurdish-text">
            {activeTab === 'debts' ? 'هیچ قەرزێک نییە' : t('customers.noCustomers')}
          </p>
        </div>
      ) : activeTab === 'debts' ? (
        /* Debt List View */
        <div className="space-y-3">
          {filteredCustomers.map((customer) => (
            <div
              key={customer.id}
              className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
                    <UserIcon className="h-6 w-6 text-red-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800 kurdish-text">{customer.name}</h3>
                    {customer.phone && (
                      <p className="text-sm text-gray-500">{customer.phone}</p>
                    )}
                    {customer.lastVisit && (
                      <p className="text-xs text-gray-400 kurdish-text">
                        دوایین سەردان: {formatDate(customer.lastVisit)}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-left">
                    <p className="text-sm text-gray-500 kurdish-text">قەرز</p>
                    <p className="text-xl font-bold text-red-600">{formatCurrency(customer.credit)}</p>
                  </div>
                  <button
                    onClick={() => handleOpenPaymentModal(customer)}
                    className="rounded-lg bg-emerald-600 px-4 py-2 font-medium text-white hover:bg-emerald-700 touch-button kurdish-text"
                  >
                    <BanknotesIcon className="inline h-5 w-5 ml-1" />
                    تۆمارکردنی پارەدان
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Regular Customer Grid */
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredCustomers.map((customer) => (
            <div
              key={customer.id}
              className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="mb-3 flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100">
                    <UserIcon className="h-6 w-6 text-emerald-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-800 kurdish-text">{customer.name}</h3>
                    {customer.phone && (
                      <p className="text-sm text-gray-500">{customer.phone}</p>
                    )}
                  </div>
                </div>
                <div className="flex gap-1">
                  <button
                    onClick={() => handleOpenModal(customer)}
                    className="rounded p-1 text-blue-600 hover:bg-blue-50 touch-button"
                  >
                    <PencilIcon className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteCustomer(customer)}
                    className="rounded p-1 text-red-600 hover:bg-red-50 touch-button"
                  >
                    <TrashIcon className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Debt Badge */}
              {customer.credit > 0 && (
                <button
                  onClick={() => handleOpenPaymentModal(customer)}
                  className="mb-3 w-full rounded-lg bg-red-100 px-3 py-2 text-red-700 hover:bg-red-200 touch-button kurdish-text text-sm font-medium"
                >
                  <BanknotesIcon className="inline h-4 w-4 ml-1" />
                  {formatCurrency(customer.credit)} قەرز
                </button>
              )}

              <div className="space-y-2 border-t border-gray-200 pt-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600 kurdish-text">{t('customers.totalSpent')}</span>
                  <span className="font-semibold text-emerald-600">
                    {formatCurrency(customer.totalSpent)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 kurdish-text">{t('customers.totalPurchases')}</span>
                  <span className="font-medium">{customer.totalPurchases}</span>
                </div>
                {customer.lastVisit && (
                  <div className="flex justify-between">
                    <span className="text-gray-600 kurdish-text">{t('customers.lastVisit')}</span>
                    <span className="text-gray-500">{formatDate(customer.lastVisit)}</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Customer Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-lg bg-white p-6" dir="rtl">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-xl font-bold text-gray-800 kurdish-text">
                {editingCustomer ? t('customers.editCustomer') : t('customers.addCustomer')}
              </h3>
              <button
                onClick={handleCloseModal}
                className="text-gray-600 hover:text-gray-800 touch-button"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 kurdish-text">
                  {t('customers.customerName')} *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full rounded-lg border-2 border-gray-300 py-2 px-3 focus:border-emerald-500 focus:outline-none kurdish-text"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 kurdish-text">
                  {t('customers.customerPhone')}
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full rounded-lg border-2 border-gray-300 py-2 px-3 focus:border-emerald-500 focus:outline-none"
                  placeholder="+964 750 123 4567"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 kurdish-text">
                  {t('customers.customerEmail')}
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full rounded-lg border-2 border-gray-300 py-2 px-3 focus:border-emerald-500 focus:outline-none"
                  placeholder="example@email.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 kurdish-text">
                  {t('common.notes')}
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  rows={3}
                  className="w-full rounded-lg border-2 border-gray-300 py-2 px-3 focus:border-emerald-500 focus:outline-none kurdish-text"
                />
              </div>
            </div>

            <div className="mt-6 flex gap-3">
              <button
                onClick={handleSaveCustomer}
                className="flex-1 rounded-lg bg-emerald-600 py-2 font-medium text-white hover:bg-emerald-700 touch-button kurdish-text"
              >
                {t('common.save')}
              </button>
              <button
                onClick={handleCloseModal}
                className="flex-1 rounded-lg border-2 border-gray-300 py-2 font-medium text-gray-700 hover:bg-gray-50 touch-button kurdish-text"
              >
                {t('common.cancel')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Payment Modal */}
      {showPaymentModal && payingCustomer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-lg rounded-lg bg-white p-6" dir="rtl">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-xl font-bold text-gray-800 kurdish-text">
                تۆمارکردنی پارەدان
              </h3>
              <button
                onClick={() => setShowPaymentModal(false)}
                className="text-gray-600 hover:text-gray-800 touch-button"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>

            {/* Customer Info */}
            <div className="mb-4 rounded-lg bg-gray-50 p-3">
              <div className="flex items-center gap-3">
                <UserIcon className="h-10 w-10 text-gray-400" />
                <div>
                  <p className="font-semibold text-gray-800 kurdish-text">{payingCustomer.name}</p>
                  {payingCustomer.phone && (
                    <p className="text-sm text-gray-500">{payingCustomer.phone}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Current Debt */}
            <div className="mb-4 rounded-lg bg-red-50 border-2 border-red-200 p-4 text-center">
              <p className="text-sm text-red-600 kurdish-text">قەرزی ئێستا</p>
              <p className="text-3xl font-bold text-red-700">{formatCurrency(payingCustomer.credit)}</p>
            </div>

            {/* Payment Method */}
            <div className="mb-4 grid grid-cols-2 gap-2">
              <button
                onClick={() => setPaymentMethod('cash')}
                className={`rounded-lg border-2 py-2 font-medium transition-all touch-button kurdish-text ${
                  paymentMethod === 'cash'
                    ? 'border-emerald-600 bg-emerald-50 text-emerald-600'
                    : 'border-gray-300 text-gray-600'
                }`}
              >
                <BanknotesIcon className="mx-auto h-5 w-5 mb-1" />
                کاش
              </button>
              <button
                onClick={() => setPaymentMethod('card')}
                className={`rounded-lg border-2 py-2 font-medium transition-all touch-button kurdish-text ${
                  paymentMethod === 'card'
                    ? 'border-emerald-600 bg-emerald-50 text-emerald-600'
                    : 'border-gray-300 text-gray-600'
                }`}
              >
                <CreditCardIcon className="mx-auto h-5 w-5 mb-1" />
                کارت
              </button>
            </div>

            {/* Number Pad */}
            <div className="mb-4">
              <NumberPad
                value={paymentAmount}
                onChange={setPaymentAmount}
                maxValue={payingCustomer.credit}
                showDecimal={false}
              />
            </div>

            {/* Quick Amounts */}
            <div className="mb-4 grid grid-cols-4 gap-2">
              {[5000, 10000, 25000, 50000].map((amount) => (
                <button
                  key={amount}
                  onClick={() => setPaymentAmount(Math.min(amount, payingCustomer.credit).toString())}
                  className="rounded-lg border border-gray-300 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 touch-button"
                >
                  {formatCurrency(amount)}
                </button>
              ))}
            </div>

            {/* Pay Full Amount Button */}
            <button
              onClick={() => setPaymentAmount(payingCustomer.credit.toString())}
              className="mb-4 w-full rounded-lg border-2 border-emerald-500 bg-emerald-50 py-2 font-medium text-emerald-600 hover:bg-emerald-100 touch-button kurdish-text"
            >
              پارەدانی هەموو قەرزەکە
            </button>

            {/* Remaining after payment */}
            {paymentAmount && parseFloat(paymentAmount) > 0 && (
              <div className="mb-4 rounded-lg bg-emerald-50 border border-emerald-200 p-3 text-center">
                <p className="text-sm text-emerald-600 kurdish-text">ماوە دوای پارەدان</p>
                <p className="text-xl font-bold text-emerald-700">
                  {formatCurrency(Math.max(0, payingCustomer.credit - (parseFloat(paymentAmount) || 0)))}
                </p>
              </div>
            )}

            {/* Notes */}
            <div className="mb-4">
              <input
                type="text"
                value={paymentNotes}
                onChange={(e) => setPaymentNotes(e.target.value)}
                placeholder="تێبینی (ئارەزوومەندانە)"
                className="w-full rounded-lg border-2 border-gray-300 py-2 px-3 focus:border-emerald-500 focus:outline-none kurdish-text"
              />
            </div>

            {/* Confirm Button */}
            <button
              onClick={handleRecordPayment}
              disabled={!paymentAmount || parseFloat(paymentAmount) <= 0}
              className="w-full rounded-lg bg-emerald-600 py-3 font-semibold text-white hover:bg-emerald-700 disabled:bg-gray-300 disabled:cursor-not-allowed touch-button kurdish-text"
            >
              <BanknotesIcon className="inline h-5 w-5 ml-2" />
              تۆمارکردنی پارەدان - {paymentAmount ? formatCurrency(parseFloat(paymentAmount)) : formatCurrency(0)}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Customers;
