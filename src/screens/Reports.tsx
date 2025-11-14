import { useState, useEffect } from 'react';
import { db, type Sale } from '../db/database';
import { t, formatCurrency, formatTime } from '../i18n/translations';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const Reports = () => {
  const [sales, setSales] = useState<Sale[]>([]);
  const [dateRange, setDateRange] = useState('today');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  useEffect(() => {
    loadSales();
  }, [dateRange, startDate, endDate]);

  const loadSales = async () => {
    try {
      let filtered: Sale[] = [];
      const now = new Date();

      if (dateRange === 'today') {
        const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        filtered = await db.sales.where('createdAt').aboveOrEqual(startOfDay).toArray();
      } else if (dateRange === 'yesterday') {
        const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        const startOfYesterday = new Date(yesterday.getFullYear(), yesterday.getMonth(), yesterday.getDate());
        const endOfYesterday = new Date(startOfYesterday.getTime() + 24 * 60 * 60 * 1000);
        filtered = await db.sales
          .where('createdAt')
          .between(startOfYesterday, endOfYesterday, true, false)
          .toArray();
      } else if (dateRange === 'thisWeek') {
        const startOfWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        filtered = await db.sales.where('createdAt').aboveOrEqual(startOfWeek).toArray();
      } else if (dateRange === 'thisMonth') {
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        filtered = await db.sales.where('createdAt').aboveOrEqual(startOfMonth).toArray();
      } else if (dateRange === 'custom' && startDate && endDate) {
        const start = new Date(startDate);
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        filtered = await db.sales
          .where('createdAt')
          .between(start, end, true, true)
          .toArray();
      }

      setSales(filtered);
    } catch (error) {
      console.error('Failed to load sales:', error);
    }
  };

  const totalRevenue = sales.reduce((sum, sale) => sum + sale.total, 0);
  const averageTransaction = sales.length > 0 ? totalRevenue / sales.length : 0;

  // Top products
  const productSales = new Map<string, { name: string; quantity: number; revenue: number }>();
  sales.forEach((sale) => {
    sale.items.forEach((item) => {
      const existing = productSales.get(item.productName) || { name: item.productName, quantity: 0, revenue: 0 };
      productSales.set(item.productName, {
        name: item.productName,
        quantity: existing.quantity + item.quantity,
        revenue: existing.revenue + item.subtotal,
      });
    });
  });

  const topProducts = Array.from(productSales.values())
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 5);

  // Sales by payment method
  const paymentMethods = [
    { name: t('sale.cash'), value: sales.filter((s) => s.paymentMethod === 'cash').length },
    { name: t('sale.card'), value: sales.filter((s) => s.paymentMethod === 'card').length },
    { name: t('sale.mixed'), value: sales.filter((s) => s.paymentMethod === 'mixed').length },
  ];

  const COLORS = ['#10b981', '#3b82f6', '#f59e0b'];

  return (
    <div className="space-y-6" dir="rtl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800 kurdish-text">{t('reports.title')}</h1>
      </div>

      {/* Date Range Selector */}
      <div className="rounded-lg bg-white p-4 shadow">
        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => setDateRange('today')}
            className={`rounded-lg px-4 py-2 font-medium transition-all touch-button kurdish-text ${
              dateRange === 'today'
                ? 'bg-emerald-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {t('common.today')}
          </button>
          <button
            onClick={() => setDateRange('yesterday')}
            className={`rounded-lg px-4 py-2 font-medium transition-all touch-button kurdish-text ${
              dateRange === 'yesterday'
                ? 'bg-emerald-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {t('common.yesterday')}
          </button>
          <button
            onClick={() => setDateRange('thisWeek')}
            className={`rounded-lg px-4 py-2 font-medium transition-all touch-button kurdish-text ${
              dateRange === 'thisWeek'
                ? 'bg-emerald-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {t('common.thisWeek')}
          </button>
          <button
            onClick={() => setDateRange('thisMonth')}
            className={`rounded-lg px-4 py-2 font-medium transition-all touch-button kurdish-text ${
              dateRange === 'thisMonth'
                ? 'bg-emerald-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {t('common.thisMonth')}
          </button>
          <button
            onClick={() => setDateRange('custom')}
            className={`rounded-lg px-4 py-2 font-medium transition-all touch-button kurdish-text ${
              dateRange === 'custom'
                ? 'bg-emerald-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {t('common.customRange')}
          </button>
        </div>

        {dateRange === 'custom' && (
          <div className="mt-3 flex gap-3">
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="rounded-lg border-2 border-gray-300 px-3 py-2 focus:border-emerald-500 focus:outline-none"
            />
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="rounded-lg border-2 border-gray-300 px-3 py-2 focus:border-emerald-500 focus:outline-none"
            />
          </div>
        )}
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="rounded-lg bg-white p-6 shadow">
          <p className="text-sm text-gray-600 kurdish-text">{t('reports.totalRevenue')}</p>
          <p className="mt-2 text-3xl font-bold text-emerald-600">{formatCurrency(totalRevenue)}</p>
        </div>
        <div className="rounded-lg bg-white p-6 shadow">
          <p className="text-sm text-gray-600 kurdish-text">{t('reports.totalTransactions')}</p>
          <p className="mt-2 text-3xl font-bold text-blue-600">{sales.length}</p>
        </div>
        <div className="rounded-lg bg-white p-6 shadow">
          <p className="text-sm text-gray-600 kurdish-text">{t('reports.averageTransaction')}</p>
          <p className="mt-2 text-3xl font-bold text-purple-600">{formatCurrency(averageTransaction)}</p>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Top Products */}
        <div className="rounded-lg bg-white p-6 shadow">
          <h3 className="mb-4 text-lg font-semibold text-gray-800 kurdish-text">
            {t('reports.topProducts')}
          </h3>
          {topProducts.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={topProducts}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis />
                <Tooltip />
                <Bar dataKey="revenue" fill="#10b981" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-center text-gray-500 kurdish-text py-20">داتا نییە</p>
          )}
        </div>

        {/* Payment Methods */}
        <div className="rounded-lg bg-white p-6 shadow">
          <h3 className="mb-4 text-lg font-semibold text-gray-800 kurdish-text">
            {t('reports.salesByPayment')}
          </h3>
          {sales.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={paymentMethods.filter((p) => p.value > 0)}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  label
                >
                  {paymentMethods.map((_entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-center text-gray-500 kurdish-text py-20">داتا نییە</p>
          )}
        </div>
      </div>

      {/* Detailed Sales Table */}
      <div className="rounded-lg bg-white p-6 shadow">
        <h3 className="mb-4 text-lg font-semibold text-gray-800 kurdish-text">
          {t('reports.detailedSales')}
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 text-right">
                <th className="pb-3 text-sm font-medium text-gray-600 kurdish-text">
                  {t('reports.transactionId')}
                </th>
                <th className="pb-3 text-sm font-medium text-gray-600 kurdish-text">{t('common.time')}</th>
                <th className="pb-3 text-sm font-medium text-gray-600 kurdish-text">
                  {t('reports.items')}
                </th>
                <th className="pb-3 text-sm font-medium text-gray-600 kurdish-text">
                  {t('sale.paymentMethod')}
                </th>
                <th className="pb-3 text-sm font-medium text-gray-600 kurdish-text">
                  {t('common.total')}
                </th>
              </tr>
            </thead>
            <tbody>
              {sales.slice(0, 20).map((sale) => (
                <tr key={sale.id} className="border-b border-gray-100">
                  <td className="py-3 text-sm text-gray-800">{sale.transactionId}</td>
                  <td className="py-3 text-sm text-gray-600">{formatTime(sale.createdAt)}</td>
                  <td className="py-3 text-sm text-gray-600">{sale.items.length}</td>
                  <td className="py-3">
                    <span className="inline-block rounded-full bg-emerald-100 px-2 py-1 text-xs text-emerald-600 kurdish-text">
                      {sale.paymentMethod === 'cash' ? t('sale.cash') : sale.paymentMethod === 'card' ? t('sale.card') : t('sale.mixed')}
                    </span>
                  </td>
                  <td className="py-3 text-sm font-semibold text-emerald-600">
                    {formatCurrency(sale.total)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {sales.length === 0 && (
            <p className="py-8 text-center text-gray-500 kurdish-text">فرۆشتن نییە بۆ ئەم ماوەیە</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Reports;
