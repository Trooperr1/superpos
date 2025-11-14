import { useState, useEffect } from 'react';
import { db, type User } from '../db/database';
import { useAuthStore } from '../store/useStore';
import { t } from '../i18n/translations';
import { UserIcon, LockClosedIcon } from '@heroicons/react/24/outline';

const AuthScreen = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuthStore();

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      const allUsers = await db.users.where('isActive').equals(true).toArray();
      setUsers(allUsers);
      if (allUsers.length === 1) {
        setSelectedUser(allUsers[0]);
      }
    } catch (error) {
      console.error('Failed to load users:', error);
    }
  };

  const handlePinInput = (digit: string) => {
    if (pin.length < 4) {
      setPin(pin + digit);
      setError('');
    }
  };

  const handleDelete = () => {
    setPin(pin.slice(0, -1));
    setError('');
  };

  const handleClear = () => {
    setPin('');
    setError('');
  };

  const handleLogin = async () => {
    if (!selectedUser) {
      setError(t('auth.selectUser'));
      return;
    }

    if (pin.length !== 4) {
      setError(t('auth.enterPin'));
      return;
    }

    if (pin === selectedUser.pin) {
      // Update last login
      await db.users.update(selectedUser.id!, { lastLogin: new Date() });
      login(selectedUser);
    } else {
      setError(t('auth.incorrectPin'));
      setPin('');
    }
  };

  useEffect(() => {
    if (pin.length === 4 && selectedUser) {
      handleLogin();
    }
  }, [pin]);

  return (
    <div className="flex h-screen items-center justify-center bg-gradient-to-br from-emerald-600 to-emerald-900 p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="mb-8 text-center">
          <h1 className="text-5xl font-bold text-white">NEXUS POS</h1>
          <p className="mt-2 text-xl text-emerald-100 kurdish-text">سیستەمی فرۆشتن</p>
        </div>

        {/* Login Card */}
        <div className="rounded-2xl bg-white p-8 shadow-2xl" dir="rtl">
          {/* User Selection */}
          {!selectedUser ? (
            <div>
              <h2 className="mb-4 text-center text-xl font-semibold text-gray-800 kurdish-text">
                {t('auth.selectUser')}
              </h2>
              <div className="space-y-3">
                {users.map((user) => (
                  <button
                    key={user.id}
                    onClick={() => setSelectedUser(user)}
                    className="flex w-full items-center gap-4 rounded-lg border-2 border-gray-200 p-4 transition-all hover:border-emerald-500 hover:bg-emerald-50 touch-button"
                  >
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-600">
                      <UserIcon className="h-6 w-6 text-white" />
                    </div>
                    <div className="flex-1 text-right">
                      <p className="font-medium text-gray-800">{user.name}</p>
                      <p className="text-sm text-gray-500 kurdish-text">
                        {user.role === 'owner' ? 'خاوەن' : 'کاشێر'}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div>
              {/* Selected User */}
              <div className="mb-6 flex items-center justify-between">
                <button
                  onClick={() => {
                    setSelectedUser(null);
                    setPin('');
                    setError('');
                  }}
                  className="text-sm text-emerald-600 hover:text-emerald-700 kurdish-text"
                >
                  گۆڕین
                </button>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <p className="font-medium text-gray-800">{selectedUser.name}</p>
                    <p className="text-sm text-gray-500 kurdish-text">
                      {selectedUser.role === 'owner' ? 'خاوەن' : 'کاشێر'}
                    </p>
                  </div>
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-600">
                    <UserIcon className="h-6 w-6 text-white" />
                  </div>
                </div>
              </div>

              {/* PIN Input Display */}
              <div className="mb-6">
                <div className="mb-2 flex items-center justify-center gap-2 text-gray-600">
                  <span className="text-sm kurdish-text">{t('auth.enterPin')}</span>
                  <LockClosedIcon className="h-5 w-5" />
                </div>
                <div className="flex justify-center gap-3">
                  {[0, 1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className={`h-4 w-4 rounded-full border-2 transition-all ${
                        pin.length > i
                          ? 'border-emerald-600 bg-emerald-600'
                          : 'border-gray-300 bg-white'
                      }`}
                    />
                  ))}
                </div>
                {error && (
                  <p className="mt-2 text-center text-sm text-red-600 kurdish-text">{error}</p>
                )}
              </div>

              {/* PIN Pad */}
              <div className="grid grid-cols-3 gap-3">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((digit) => (
                  <button
                    key={digit}
                    onClick={() => handlePinInput(digit.toString())}
                    className="rounded-lg bg-gray-100 py-4 text-2xl font-semibold text-gray-800 transition-all hover:bg-gray-200 active:scale-95 touch-button"
                  >
                    {digit}
                  </button>
                ))}
                <button
                  onClick={handleClear}
                  className="rounded-lg bg-red-100 py-4 text-sm font-medium text-red-600 transition-all hover:bg-red-200 active:scale-95 touch-button kurdish-text"
                >
                  پاککردنەوە
                </button>
                <button
                  onClick={() => handlePinInput('0')}
                  className="rounded-lg bg-gray-100 py-4 text-2xl font-semibold text-gray-800 transition-all hover:bg-gray-200 active:scale-95 touch-button"
                >
                  0
                </button>
                <button
                  onClick={handleDelete}
                  className="rounded-lg bg-gray-100 py-4 text-2xl font-semibold text-gray-800 transition-all hover:bg-gray-200 active:scale-95 touch-button"
                >
                  ⌫
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="mt-6 text-center text-sm text-emerald-100">
          <p>NEXUS POS v1.0</p>
          <p className="mt-1 kurdish-text">دروستکراوە بۆ سووپەرمارکێتەکانی کوردستان</p>
        </div>
      </div>
    </div>
  );
};

export default AuthScreen;
