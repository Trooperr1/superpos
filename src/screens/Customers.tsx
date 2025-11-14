import { useState, useEffect } from 'react';
import { db, type Customer } from '../db/database';
import { useUIStore } from '../store/useStore';
import { t, formatCurrency, formatDate } from '../i18n/translations';
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  MagnifyingGlassIcon,
  XMarkIcon,
  UserIcon,
} from '@heroicons/react/24/outline';

const Customers = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [filteredCustomers, setFilteredCustomers] = useState<Customer[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
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
  }, [customers, searchQuery]);

  const loadCustomers = async () => {
    try {
      const allCustomers = await db.customers.reverse().toArray();
      setCustomers(allCustomers);
    } catch (error) {
      console.error('Failed to load customers:', error);
    }
  };

  const filterCustomers = () => {
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      const filtered = customers.filter(
        (c) =>
          c.name.toLowerCase().includes(query) ||
          c.phone?.toLowerCase().includes(query)
      );
      setFilteredCustomers(filtered);
    } else {
      setFilteredCustomers(customers);
    }
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

      {/* Customers Grid */}
      {filteredCustomers.length === 0 ? (
        <div className="rounded-lg bg-white p-12 text-center shadow">
          <UserIcon className="mx-auto h-16 w-16 text-gray-300" />
          <p className="mt-4 text-gray-500 kurdish-text">{t('customers.noCustomers')}</p>
        </div>
      ) : (
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
                {customer.credit !== 0 && (
                  <div className="flex justify-between">
                    <span className="text-gray-600 kurdish-text">{t('customers.credit')}</span>
                    <span className={`font-semibold ${customer.credit > 0 ? 'text-red-600' : 'text-green-600'}`}>
                      {formatCurrency(Math.abs(customer.credit))}
                    </span>
                  </div>
                )}
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
    </div>
  );
};

export default Customers;
