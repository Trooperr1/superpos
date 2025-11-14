import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { initializeDatabase, db } from './db/database';
import { useAuthStore, useSettingsStore } from './store/useStore';

// Screens
import Layout from './components/Layout';
import AuthScreen from './screens/AuthScreen';
import QuickSale from './screens/QuickSale';
import Inventory from './screens/Inventory';
import Reports from './screens/Reports';
import CashRegister from './screens/CashRegister';
import Customers from './screens/Customers';
import Settings from './screens/Settings';

function App() {
  const { isAuthenticated } = useAuthStore();
  const { loadSettings } = useSettingsStore();

  useEffect(() => {
    // Initialize database and load settings
    const init = async () => {
      try {
        await initializeDatabase();
        const settings = await db.settings.toArray();
        if (settings.length > 0) {
          loadSettings(settings[0]);
        }
      } catch (error) {
        console.error('Failed to initialize database:', error);
      }
    };

    init();
  }, [loadSettings]);

  return (
    <BrowserRouter>
      <Routes>
        {!isAuthenticated ? (
          <>
            <Route path="/auth" element={<AuthScreen />} />
            <Route path="*" element={<Navigate to="/auth" replace />} />
          </>
        ) : (
          <Route path="/" element={<Layout />}>
            <Route index element={<Navigate to="/sale" replace />} />
            <Route path="sale" element={<QuickSale />} />
            <Route path="inventory" element={<Inventory />} />
            <Route path="reports" element={<Reports />} />
            <Route path="cash-register" element={<CashRegister />} />
            <Route path="customers" element={<Customers />} />
            <Route path="settings" element={<Settings />} />
            <Route path="*" element={<Navigate to="/sale" replace />} />
          </Route>
        )}
      </Routes>
    </BrowserRouter>
  );
}

export default App;
