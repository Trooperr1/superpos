import { useState, useEffect } from 'react';
import { db, exportAllData, importAllData } from '../db/database';
import { useSettingsStore, usePrinterStore, useUIStore } from '../store/useStore';
import { t } from '../i18n/translations';
import {
  BuildingStorefrontIcon,
  PrinterIcon,
  ArrowUpTrayIcon,
  ArrowDownTrayIcon,
  TrashIcon,
} from '@heroicons/react/24/outline';

const Settings = () => {
  const { settings, loadSettings, updateSettings } = useSettingsStore();
  const { isConnected, connect, disconnect } = usePrinterStore();
  const { showNotification } = useUIStore();

  const [formData, setFormData] = useState({
    shopName: '',
    shopNameKurdish: '',
    shopAddress: '',
    shopPhone: '',
    taxRate: '',
  });

  useEffect(() => {
    if (settings) {
      setFormData({
        shopName: settings.shopName,
        shopNameKurdish: settings.shopNameKurdish,
        shopAddress: settings.shopAddress,
        shopPhone: settings.shopPhone,
        taxRate: settings.taxRate.toString(),
      });
    }
  }, [settings]);

  const handleSaveSettings = async () => {
    try {
      if (!settings?.id) return;

      const updatedSettings = {
        shopName: formData.shopName,
        shopNameKurdish: formData.shopNameKurdish,
        shopAddress: formData.shopAddress,
        shopPhone: formData.shopPhone,
        taxRate: parseFloat(formData.taxRate) || 0,
      };

      await db.settings.update(settings.id, updatedSettings);
      updateSettings(updatedSettings);
      showNotification('success', t('settings.settingsSaved'));
    } catch (error) {
      console.error('Failed to save settings:', error);
      showNotification('error', t('settings.settingsError'));
    }
  };

  const handleConnectPrinter = async () => {
    try {
      await connect();
      showNotification('success', t('settings.printerConnected'));
    } catch (error: any) {
      showNotification('error', error.message || t('printer.printError'));
    }
  };

  const handleDisconnectPrinter = () => {
    disconnect();
    showNotification('success', t('settings.printerDisconnected'));
  };

  const handleExportData = async () => {
    try {
      const data = await exportAllData();
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `nexus-pos-backup-${new Date().toISOString().split('T')[0]}.json`;
      link.click();
      URL.revokeObjectURL(url);
      showNotification('success', t('success.dataExported'));
    } catch (error) {
      console.error('Failed to export data:', error);
      showNotification('error', t('errors.unknownError'));
    }
  };

  const handleImportData = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      const file = event.target.files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const data = JSON.parse(e.target?.result as string);
          const success = await importAllData(data);
          if (success) {
            showNotification('success', t('success.dataImported'));
            // Reload settings
            const newSettings = await db.settings.toArray();
            if (newSettings.length > 0) {
              loadSettings(newSettings[0]);
            }
            // Refresh page to reload all data
            window.location.reload();
          } else {
            showNotification('error', 'هەڵە لە هاوردەکردن');
          }
        } catch (error) {
          console.error('Failed to parse import file:', error);
          showNotification('error', 'فایلی هەڵە');
        }
      };
      reader.readAsText(file);
    } catch (error) {
      console.error('Failed to import data:', error);
      showNotification('error', t('errors.unknownError'));
    }
  };

  const handleClearAllData = async () => {
    const confirmation = prompt(t('settings.typeConfirm'));
    if (confirmation !== 'CONFIRM') {
      showNotification('warning', 'هەڵوەشایەوە');
      return;
    }

    try {
      await db.products.clear();
      await db.sales.clear();
      await db.customers.clear();
      await db.cashTransactions.clear();
      await db.stockAdjustments.clear();
      showNotification('success', 'هەموو داتاکان سڕانەوە');
      window.location.reload();
    } catch (error) {
      console.error('Failed to clear data:', error);
      showNotification('error', t('errors.unknownError'));
    }
  };

  return (
    <div className="space-y-6" dir="rtl">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-800 kurdish-text">{t('settings.title')}</h1>
      </div>

      {/* Shop Settings */}
      <div className="rounded-lg bg-white p-6 shadow">
        <div className="mb-4 flex items-center gap-3">
          <BuildingStorefrontIcon className="h-6 w-6 text-emerald-600" />
          <h2 className="text-xl font-semibold text-gray-800 kurdish-text">
            {t('settings.shopSettings')}
          </h2>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('settings.shopName')}
            </label>
            <input
              type="text"
              value={formData.shopName}
              onChange={(e) => setFormData({ ...formData, shopName: e.target.value })}
              className="w-full rounded-lg border-2 border-gray-300 py-2 px-3 focus:border-emerald-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1 kurdish-text">
              {t('settings.shopNameKurdish')}
            </label>
            <input
              type="text"
              value={formData.shopNameKurdish}
              onChange={(e) => setFormData({ ...formData, shopNameKurdish: e.target.value })}
              className="w-full rounded-lg border-2 border-gray-300 py-2 px-3 focus:border-emerald-500 focus:outline-none kurdish-text"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1 kurdish-text">
              {t('settings.shopAddress')}
            </label>
            <input
              type="text"
              value={formData.shopAddress}
              onChange={(e) => setFormData({ ...formData, shopAddress: e.target.value })}
              className="w-full rounded-lg border-2 border-gray-300 py-2 px-3 focus:border-emerald-500 focus:outline-none kurdish-text"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1 kurdish-text">
              {t('settings.shopPhone')}
            </label>
            <input
              type="tel"
              value={formData.shopPhone}
              onChange={(e) => setFormData({ ...formData, shopPhone: e.target.value })}
              className="w-full rounded-lg border-2 border-gray-300 py-2 px-3 focus:border-emerald-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1 kurdish-text">
              {t('settings.taxRate')} (%)
            </label>
            <input
              type="number"
              value={formData.taxRate}
              onChange={(e) => setFormData({ ...formData, taxRate: e.target.value })}
              className="w-full rounded-lg border-2 border-gray-300 py-2 px-3 focus:border-emerald-500 focus:outline-none"
              placeholder="0"
            />
          </div>
        </div>

        <div className="mt-4">
          <button
            onClick={handleSaveSettings}
            className="rounded-lg bg-emerald-600 px-6 py-2 font-medium text-white hover:bg-emerald-700 touch-button kurdish-text"
          >
            {t('common.save')}
          </button>
        </div>
      </div>

      {/* Printer Settings */}
      <div className="rounded-lg bg-white p-6 shadow">
        <div className="mb-4 flex items-center gap-3">
          <PrinterIcon className="h-6 w-6 text-blue-600" />
          <h2 className="text-xl font-semibold text-gray-800 kurdish-text">
            {t('settings.printerSettings')}
          </h2>
        </div>

        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div
              className={`h-3 w-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}
            />
            <span className="text-sm font-medium text-gray-700 kurdish-text">
              {isConnected ? t('settings.printerConnected') : t('settings.printerDisconnected')}
            </span>
          </div>

          <div className="flex gap-3">
            {!isConnected ? (
              <button
                onClick={handleConnectPrinter}
                className="rounded-lg bg-blue-600 px-6 py-2 font-medium text-white hover:bg-blue-700 touch-button kurdish-text"
              >
                {t('settings.connectPrinter')}
              </button>
            ) : (
              <button
                onClick={handleDisconnectPrinter}
                className="rounded-lg bg-red-600 px-6 py-2 font-medium text-white hover:bg-red-700 touch-button kurdish-text"
              >
                {t('settings.disconnectPrinter')}
              </button>
            )}
          </div>

          <div className="rounded-lg bg-blue-50 border border-blue-200 p-4">
            <p className="text-sm text-blue-800 kurdish-text">
              تێبینی: پرینتەری بلووتووسی ٥٨ملم پێویستە. لەگەڵ گووگڵ کرۆم یان ئێج بەکاردێت.
            </p>
          </div>
        </div>
      </div>

      {/* Backup & Restore */}
      <div className="rounded-lg bg-white p-6 shadow">
        <div className="mb-4 flex items-center gap-3">
          <ArrowDownTrayIcon className="h-6 w-6 text-purple-600" />
          <h2 className="text-xl font-semibold text-gray-800 kurdish-text">
            {t('settings.backupRestore')}
          </h2>
        </div>

        <div className="space-y-3">
          <button
            onClick={handleExportData}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-green-600 px-6 py-3 font-medium text-white hover:bg-green-700 touch-button kurdish-text"
          >
            <ArrowDownTrayIcon className="h-5 w-5" />
            {t('settings.exportData')}
          </button>

          <label className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg bg-blue-600 px-6 py-3 font-medium text-white hover:bg-blue-700 touch-button kurdish-text">
            <ArrowUpTrayIcon className="h-5 w-5" />
            {t('settings.importData')}
            <input
              type="file"
              accept=".json"
              onChange={handleImportData}
              className="hidden"
            />
          </label>

          <div className="rounded-lg bg-yellow-50 border border-yellow-200 p-4">
            <p className="text-sm text-yellow-800 kurdish-text">
              تێبینی: پاڵپشتی خۆکار هەموو ڕۆژێک دروست دەکرێت. داتاکان لە مۆبایل یان تابلێتەکەت پاشەکەوت دەکرێن.
            </p>
          </div>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="rounded-lg border-2 border-red-300 bg-red-50 p-6">
        <h2 className="mb-4 text-xl font-semibold text-red-800 kurdish-text">
          ناوچەی مەترسیدار
        </h2>

        <button
          onClick={handleClearAllData}
          className="flex items-center gap-2 rounded-lg bg-red-600 px-6 py-3 font-medium text-white hover:bg-red-700 touch-button kurdish-text"
        >
          <TrashIcon className="h-5 w-5" />
          {t('settings.clearAllData')}
        </button>

        <p className="mt-3 text-sm text-red-700 kurdish-text">
          {t('settings.clearDataWarning')}
        </p>
      </div>

      {/* About */}
      <div className="rounded-lg bg-white p-6 shadow">
        <h2 className="mb-4 text-xl font-semibold text-gray-800 kurdish-text">
          {t('settings.about')}
        </h2>

        <div className="space-y-2 text-sm text-gray-600">
          <div className="flex justify-between">
            <span className="kurdish-text">{t('settings.version')}</span>
            <span className="font-medium">1.0.0</span>
          </div>
          <div className="flex justify-between">
            <span className="kurdish-text">دروستکراوە لە</span>
            <span className="font-medium">2025</span>
          </div>
          <div className="flex justify-between">
            <span className="kurdish-text">پشتگیری</span>
            <span className="font-medium" dir="ltr">+964 750 123 4567</span>
          </div>
        </div>

        <div className="mt-4 text-center">
          <p className="text-lg font-bold text-emerald-600">NEXUS POS</p>
          <p className="text-sm text-gray-600 kurdish-text">
            سیستەمی فرۆشتن بۆ سووپەرمارکێتەکانی کوردستان
          </p>
        </div>
      </div>
    </div>
  );
};

export default Settings;
