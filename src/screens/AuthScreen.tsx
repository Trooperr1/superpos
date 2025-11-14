import { useState } from 'react';
import { useAuthStore } from '../store/useStore';
import { db } from '../db/database';

const AuthScreen = () => {
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuthStore();

  const handleLogin = async () => {
    if (pin === '1234') {
      // Just log them in
      const users = await db.users.toArray();
      if (users.length > 0) {
        login(users[0]);
      } else {
        // Create user if doesn't exist
        const userId = await db.users.add({
          name: 'Admin',
          pin: '1234',
          role: 'owner',
          createdAt: new Date(),
          isActive: true
        });
        const newUser = await db.users.get(userId);
        if (newUser) login(newUser);
      }
    } else {
      setError('Wrong PIN. Use: 1234');
    }
  };

  const handleNumberClick = (num: string) => {
    if (pin.length < 4) {
      const newPin = pin + num;
      setPin(newPin);
      if (newPin.length === 4) {
        // Auto-submit when 4 digits entered
        setTimeout(() => {
          if (newPin === '1234') {
            handleLogin();
          } else {
            setError('Wrong PIN. Use: 1234');
            setPin('');
          }
        }, 100);
      }
    }
  };

  const handleClear = () => {
    setPin('');
    setError('');
  };

  return (
    <div style={{
      display: 'flex',
      minHeight: '100vh',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(to bottom right, #059669, #064e3b)',
      padding: '20px'
    }}>
      <div style={{ width: '100%', maxWidth: '400px' }}>
        <div style={{ marginBottom: '30px', textAlign: 'center' }}>
          <h1 style={{ fontSize: '48px', fontWeight: 'bold', color: 'white', marginBottom: '10px' }}>
            NEXUS POS
          </h1>
          <p style={{ fontSize: '20px', color: '#d1fae5' }}>سیستەمی فرۆشتن</p>
        </div>

        <div style={{
          background: 'white',
          borderRadius: '16px',
          padding: '32px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
        }}>
          <h2 style={{ fontSize: '24px', fontWeight: '600', textAlign: 'center', marginBottom: '20px' }}>
            Enter PIN
          </h2>

          <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', marginBottom: '20px' }}>
            {[0, 1, 2, 3].map((i) => (
              <div
                key={i}
                style={{
                  width: '16px',
                  height: '16px',
                  borderRadius: '50%',
                  border: '2px solid',
                  borderColor: pin.length > i ? '#059669' : '#d1d5db',
                  background: pin.length > i ? '#059669' : 'white'
                }}
              />
            ))}
          </div>

          {error && (
            <p style={{ color: '#dc2626', textAlign: 'center', marginBottom: '20px', fontSize: '14px' }}>
              {error}
            </p>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
              <button
                key={num}
                onClick={() => handleNumberClick(num.toString())}
                style={{
                  padding: '20px',
                  fontSize: '24px',
                  fontWeight: '600',
                  background: '#f3f4f6',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  minWidth: '60px',
                  minHeight: '60px'
                }}
                onMouseOver={(e) => e.currentTarget.style.background = '#e5e7eb'}
                onMouseOut={(e) => e.currentTarget.style.background = '#f3f4f6'}
              >
                {num}
              </button>
            ))}
            <button
              onClick={handleClear}
              style={{
                padding: '20px',
                fontSize: '14px',
                fontWeight: '600',
                background: '#fee2e2',
                color: '#dc2626',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer'
              }}
            >
              Clear
            </button>
            <button
              onClick={() => handleNumberClick('0')}
              style={{
                padding: '20px',
                fontSize: '24px',
                fontWeight: '600',
                background: '#f3f4f6',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                minWidth: '60px',
                minHeight: '60px'
              }}
              onMouseOver={(e) => e.currentTarget.style.background = '#e5e7eb'}
              onMouseOut={(e) => e.currentTarget.style.background = '#f3f4f6'}
            >
              0
            </button>
            <button
              onClick={handleLogin}
              style={{
                padding: '20px',
                fontSize: '20px',
                background: '#059669',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: 'bold'
              }}
            >
              ✓
            </button>
          </div>

          <p style={{ textAlign: 'center', color: '#6b7280', marginTop: '20px', fontSize: '12px' }}>
            Default PIN: 1234
          </p>
        </div>

        <div style={{ marginTop: '24px', textAlign: 'center', color: '#d1fae5', fontSize: '14px' }}>
          <p>NEXUS POS v1.0</p>
          <p style={{ marginTop: '4px' }}>دروستکراوە بۆ سووپەرمارکێتەکانی کوردستان</p>
        </div>
      </div>
    </div>
  );
};

export default AuthScreen;
