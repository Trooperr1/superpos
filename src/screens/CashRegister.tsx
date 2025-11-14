import { useState, useEffect } from 'react';
import { db, type CashTransaction } from '../db/database';
import { useAuthStore, useUIStore } from '../store/useStore';
import { t, formatCurrency, formatDateTime } from '../i18n/translations';
import {
  BanknotesIcon,
  PlusIcon,
  MinusIcon,
  ArrowDownTrayIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';

const CashRegister = () => {
  const [transactions, setTransactions] = useState<CashTransaction[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState<'deposit' | 'withdrawal' | 'safeDrop'>('deposit');
  const [amount, setAmount] = useState('');
  const [reason, setReason] = useState('');
  const { currentUser } = useAuthStore();
  const { showNotification } = useUIStore();

  useEffect(() => {
    loadTransactions();
  }, []);

  const loadTransactions = async () => {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const allTransactions = await db.cashTransactions
        .where('createdAt')
        .aboveOrEqual(today)
        .reverse()
        .toArray();
      setTransactions(allTransactions);
    } catch (error) {
      console.error('Failed to load transactions:', error);
    }
  };

  const calculateCashBalance = () => {
    let balance = 0;
    transactions.forEach((tx) => {
      if (tx.type === 'sale' || tx.type === 'deposit' || tx.type === 'opening') {
        balance += tx.amount;
      } else if (tx.type === 'withdrawal' || tx.type === 'safe_drop') {
        balance -= tx.amount;
      }
    });
    return balance;
  };

  const handleOpenModal = (type: 'deposit' | 'withdrawal' | 'safeDrop') => {
    setModalType(type);
    setAmount('');
    setReason('');
    setShowModal(true);
  };

  const handleSaveTransaction = async () => {
    try {
      const amountValue = parseFloat(amount);
      if (isNaN(amountValue) || amountValue <= 0) {
        showNotification('error', t('errors.invalidNumber'));
        return;
      }

      if (!reason.trim()) {
        showNotification('error', t('cashRegister.enterReason'));
        return;
      }

      await db.cashTransactions.add({
        type: modalType === 'safeDrop' ? 'safe_drop' : modalType,
        amount: amountValue,
        reason: reason,
        userId: currentUser?.id,
        createdAt: new Date(),
      });

      showNotification('success', 'مامەڵە تۆمار کرا');
      loadTransactions();
      setShowModal(false);
    } catch (error) {
      console.error('Failed to save transaction:', error);
      showNotification('error', t('errors.unknownError'));
    }
  };

  const currentCash = calculateCashBalance();
  const salesTotal = transactions
    .filter((tx) => tx.type === 'sale')
    .reduce((sum, tx) => sum + tx.amount, 0);

  return (
    <div className="space-y-6" dir="rtl">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-800 kurdish-text">
          {t('cashRegister.title')}
        </h1>
      </div>

      {/* Cash Balance Card */}
      <div className="rounded-lg bg-gradient-to-br from-emerald-600 to-emerald-700 p-8 text-white shadow-lg">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-emerald-100 kurdish-text">{t('cashRegister.currentCash')}</p>
            <p className="mt-2 text-5xl font-bold">{formatCurrency(currentCash)}</p>
          </div>
          <BanknotesIcon className="h-24 w-24 opacity-20" />
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="rounded-lg bg-white p-6 shadow">
          <p className="text-sm text-gray-600 kurdish-text">{t('cashRegister.sale')}</p>
          <p className="mt-2 text-2xl font-bold text-blue-600">{formatCurrency(salesTotal)}</p>
        </div>
        <div className="rounded-lg bg-white p-6 shadow">
          <p className="text-sm text-gray-600 kurdish-text">پارە هاتووە ناوەوە</p>
          <p className="mt-2 text-2xl font-bold text-green-600">
            {formatCurrency(
              transactions
                .filter((tx) => tx.type === 'deposit')
                .reduce((sum, tx) => sum + tx.amount, 0)
            )}
          </p>
        </div>
        <div className="rounded-lg bg-white p-6 shadow">
          <p className="text-sm text-gray-600 kurdish-text">پارە چووەتە دەرەوە</p>
          <p className="mt-2 text-2xl font-bold text-red-600">
            {formatCurrency(
              transactions
                .filter((tx) => tx.type === 'withdrawal' || tx.type === 'safe_drop')
                .reduce((sum, tx) => sum + tx.amount, 0)
            )}
          </p>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3">
        <button
          onClick={() => handleOpenModal('deposit')}
          className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-green-600 px-6 py-3 font-medium text-white hover:bg-green-700 touch-button kurdish-text"
        >
          <PlusIcon className="h-5 w-5" />
          {t('cashRegister.addCash')}
        </button>
        <button
          onClick={() => handleOpenModal('withdrawal')}
          className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-red-600 px-6 py-3 font-medium text-white hover:bg-red-700 touch-button kurdish-text"
        >
          <MinusIcon className="h-5 w-5" />
          {t('cashRegister.removeCash')}
        </button>
        <button
          onClick={() => handleOpenModal('safeDrop')}
          className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-blue-600 px-6 py-3 font-medium text-white hover:bg-blue-700 touch-button kurdish-text"
        >
          <ArrowDownTrayIcon className="h-5 w-5" />
          ناردن بۆ سەندووق
        </button>
      </div>

      {/* Transactions List */}
      <div className="rounded-lg bg-white p-6 shadow">
        <h3 className="mb-4 text-lg font-semibold text-gray-800 kurdish-text">
          {t('cashRegister.transactions')}
        </h3>
        <div className="space-y-3">
          {transactions.length === 0 ? (
            <p className="py-8 text-center text-gray-500 kurdish-text">مامەڵە نییە</p>
          ) : (
            transactions.map((tx) => (
              <div
                key={tx.id}
                className="flex items-center justify-between rounded-lg border border-gray-200 p-4"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-medium kurdish-text ${
                        tx.type === 'sale' || tx.type === 'deposit' || tx.type === 'opening'
                          ? 'bg-green-100 text-green-600'
                          : 'bg-red-100 text-red-600'
                      }`}
                    >
                      {tx.type === 'sale'
                        ? t('cashRegister.sale')
                        : tx.type === 'deposit'
                        ? 'خستنە ناوەوە'
                        : tx.type === 'withdrawal'
                        ? 'دەرهێنان'
                        : tx.type === 'safe_drop'
                        ? 'سەندووق'
                        : tx.type}
                    </span>
                    {tx.reason && (
                      <span className="text-sm text-gray-600 kurdish-text">{tx.reason}</span>
                    )}
                  </div>
                  <p className="mt-1 text-xs text-gray-500">{formatDateTime(tx.createdAt)}</p>
                </div>
                <p
                  className={`text-lg font-bold ${
                    tx.type === 'sale' || tx.type === 'deposit' || tx.type === 'opening'
                      ? 'text-green-600'
                      : 'text-red-600'
                  }`}
                >
                  {tx.type === 'sale' || tx.type === 'deposit' || tx.type === 'opening' ? '+' : '-'}
                  {formatCurrency(tx.amount)}
                </p>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Transaction Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-lg bg-white p-6" dir="rtl">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-xl font-bold text-gray-800 kurdish-text">
                {modalType === 'deposit'
                  ? t('cashRegister.addCash')
                  : modalType === 'withdrawal'
                  ? t('cashRegister.removeCash')
                  : 'ناردن بۆ سەندووق'}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-600 hover:text-gray-800 touch-button"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 kurdish-text">
                  بڕی پارە (IQD)
                </label>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0"
                  className="w-full rounded-lg border-2 border-gray-300 py-2 px-4 text-lg focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 kurdish-text">
                  {t('cashRegister.reason')}
                </label>
                <input
                  type="text"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder={t('cashRegister.enterReason')}
                  className="w-full rounded-lg border-2 border-gray-300 py-2 px-4 focus:border-emerald-500 focus:outline-none kurdish-text"
                />
              </div>
            </div>

            <div className="mt-6 flex gap-3">
              <button
                onClick={handleSaveTransaction}
                className="flex-1 rounded-lg bg-emerald-600 py-2 font-medium text-white hover:bg-emerald-700 touch-button kurdish-text"
              >
                {t('common.save')}
              </button>
              <button
                onClick={() => setShowModal(false)}
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

export default CashRegister;
