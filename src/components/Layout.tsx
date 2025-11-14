import { Outlet, NavLink, useLocation } from 'react-router-dom';
import { useAuthStore, useUIStore } from '../store/useStore';
import { t } from '../i18n/translations';
import {
  ShoppingCartIcon,
  CubeIcon,
  ChartBarIcon,
  BanknotesIcon,
  UsersIcon,
  Cog6ToothIcon,
  ArrowRightOnRectangleIcon,
  Bars3Icon,
  XMarkIcon,
  WifiIcon,
} from '@heroicons/react/24/outline';

const Layout = () => {
  const { currentUser, logout } = useAuthStore();
  const { isSidebarOpen, toggleSidebar, notification, hideNotification } = useUIStore();
  const location = useLocation();

  const navigation = [
    { name: t('nav.quickSale'), path: '/sale', icon: ShoppingCartIcon },
    { name: t('nav.inventory'), path: '/inventory', icon: CubeIcon },
    { name: t('nav.reports'), path: '/reports', icon: ChartBarIcon },
    { name: t('nav.cashRegister'), path: '/cash-register', icon: BanknotesIcon },
    { name: t('nav.customers'), path: '/customers', icon: UsersIcon },
    { name: t('nav.settings'), path: '/settings', icon: Cog6ToothIcon },
  ];

  return (
    <div className="flex h-screen bg-gray-100 kurdish-text" dir="rtl">
      {/* Sidebar */}
      <aside
        className={`${
          isSidebarOpen ? 'translate-x-0' : 'translate-x-full'
        } fixed right-0 top-0 z-40 h-screen w-64 transform bg-gradient-to-b from-emerald-700 to-emerald-900 shadow-2xl transition-transform duration-300 ease-in-out lg:static lg:translate-x-0`}
      >
        <div className="flex h-full flex-col">
          {/* Logo/Header */}
          <div className="flex items-center justify-between border-b border-emerald-600 p-4">
            <div className="text-center flex-1">
              <h1 className="text-2xl font-bold text-white">NEXUS POS</h1>
              <p className="text-xs text-emerald-200">سیستەمی فرۆشتن</p>
            </div>
            <button
              onClick={toggleSidebar}
              className="text-white lg:hidden touch-button"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>

          {/* User Info */}
          <div className="border-b border-emerald-600 bg-emerald-800/50 p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-600">
                <span className="text-lg font-bold text-white">
                  {currentUser?.name.charAt(0)}
                </span>
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-white">{currentUser?.name}</p>
                <p className="text-xs text-emerald-200">
                  {currentUser?.role === 'owner' ? 'خاوەن' : 'کاشێر'}
                </p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto p-4">
            <ul className="space-y-2">
              {navigation.map((item) => {
                const isActive = location.pathname === item.path;
                return (
                  <li key={item.path}>
                    <NavLink
                      to={item.path}
                      className={`flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-all touch-button ${
                        isActive
                          ? 'bg-white text-emerald-700 shadow-lg'
                          : 'text-emerald-100 hover:bg-emerald-800'
                      }`}
                      onClick={() => {
                        // Close sidebar on mobile after navigation
                        if (window.innerWidth < 1024) {
                          toggleSidebar();
                        }
                      }}
                    >
                      <item.icon className="h-5 w-5" />
                      <span>{item.name}</span>
                    </NavLink>
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* Offline Indicator */}
          <div className="border-t border-emerald-600 p-4">
            <div className="flex items-center gap-2 rounded-lg bg-emerald-800/50 px-3 py-2">
              <WifiIcon className="h-4 w-4 text-emerald-300" />
              <span className="text-xs text-emerald-200">{t('common.offlineMode')}</span>
            </div>
          </div>

          {/* Logout */}
          <div className="border-t border-emerald-600 p-4">
            <button
              onClick={logout}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-red-600 px-4 py-3 text-sm font-medium text-white transition-colors hover:bg-red-700 touch-button"
            >
              <ArrowRightOnRectangleIcon className="h-5 w-5" />
              <span>{t('auth.logout')}</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex flex-1 flex-col overflow-hidden">
        {/* Top Bar */}
        <header className="flex items-center justify-between border-b border-gray-200 bg-white px-4 py-3 shadow-sm lg:px-6">
          <button
            onClick={toggleSidebar}
            className="text-gray-600 hover:text-gray-900 lg:hidden touch-button"
          >
            <Bars3Icon className="h-6 w-6" />
          </button>

          <div className="flex-1 text-center lg:text-right">
            <h2 className="text-lg font-semibold text-gray-800">
              {navigation.find((item) => item.path === location.pathname)?.name || 'NEXUS POS'}
            </h2>
          </div>

          <div className="text-sm text-gray-600">
            {new Date().toLocaleDateString('en-GB')}
          </div>
        </header>

        {/* Content Area */}
        <div className="flex-1 overflow-auto p-4 lg:p-6">
          <Outlet />
        </div>
      </main>

      {/* Notification Toast */}
      {notification?.show && (
        <div className="fixed bottom-4 left-1/2 z-50 -translate-x-1/2 transform animate-fade-in">
          <div
            className={`flex items-center gap-3 rounded-lg px-6 py-4 shadow-2xl ${
              notification.type === 'success'
                ? 'bg-green-600'
                : notification.type === 'error'
                ? 'bg-red-600'
                : notification.type === 'warning'
                ? 'bg-yellow-600'
                : 'bg-blue-600'
            }`}
          >
            <span className="text-white">{notification.message}</span>
            <button
              onClick={hideNotification}
              className="text-white hover:text-gray-200 touch-button"
            >
              <XMarkIcon className="h-5 w-5" />
            </button>
          </div>
        </div>
      )}

      {/* Overlay for mobile sidebar */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 lg:hidden"
          onClick={toggleSidebar}
        />
      )}
    </div>
  );
};

export default Layout;
