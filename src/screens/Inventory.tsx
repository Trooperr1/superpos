import { useState, useEffect } from 'react';
import { db, type Product } from '../db/database';
import { useUIStore } from '../store/useStore';
import { t, formatCurrency } from '../i18n/translations';
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  MagnifyingGlassIcon,
  XMarkIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';

const Inventory = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const { showNotification } = useUIStore();

  const [formData, setFormData] = useState({
    name: '',
    nameKurdish: '',
    price: '',
    costPrice: '',
    barcode: '',
    category: 'other',
    stock: '',
    reorderLevel: '',
  });

  const categories = [
    { value: 'all', label: t('common.all') },
    { value: 'drinks', label: t('inventory.categories.drinks') },
    { value: 'snacks', label: t('inventory.categories.snacks') },
    { value: 'dairy', label: t('inventory.categories.dairy') },
    { value: 'bread', label: t('inventory.categories.bread') },
    { value: 'canned', label: t('inventory.categories.canned') },
    { value: 'household', label: t('inventory.categories.household') },
    { value: 'personal', label: t('inventory.categories.personal') },
    { value: 'other', label: t('inventory.categories.other') },
  ];

  useEffect(() => {
    loadProducts();
  }, []);

  useEffect(() => {
    filterProducts();
  }, [products, searchQuery, selectedCategory]);

  const loadProducts = async () => {
    try {
      const allProducts = await db.products.toArray();
      setProducts(allProducts);
    } catch (error) {
      console.error('Failed to load products:', error);
    }
  };

  const filterProducts = () => {
    let filtered = products;

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter((p) => p.category === selectedCategory);
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (p) =>
          p.name.toLowerCase().includes(query) ||
          p.nameKurdish.toLowerCase().includes(query) ||
          p.barcode?.includes(query)
      );
    }

    setFilteredProducts(filtered);
  };

  const handleOpenModal = (product?: Product) => {
    if (product) {
      setEditingProduct(product);
      setFormData({
        name: product.name,
        nameKurdish: product.nameKurdish,
        price: product.price.toString(),
        costPrice: product.costPrice.toString(),
        barcode: product.barcode || '',
        category: product.category,
        stock: product.stock.toString(),
        reorderLevel: product.reorderLevel.toString(),
      });
    } else {
      setEditingProduct(null);
      setFormData({
        name: '',
        nameKurdish: '',
        price: '',
        costPrice: '',
        barcode: '',
        category: 'other',
        stock: '',
        reorderLevel: '',
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingProduct(null);
  };

  const handleSaveProduct = async () => {
    try {
      const productData = {
        name: formData.name,
        nameKurdish: formData.nameKurdish,
        price: parseFloat(formData.price),
        costPrice: parseFloat(formData.costPrice),
        barcode: formData.barcode || undefined,
        category: formData.category,
        stock: parseInt(formData.stock),
        reorderLevel: parseInt(formData.reorderLevel),
        updatedAt: new Date(),
      };

      if (editingProduct) {
        await db.products.update(editingProduct.id!, productData);
        showNotification('success', t('success.productUpdated'));
      } else {
        await db.products.add({
          ...productData,
          createdAt: new Date(),
        });
        showNotification('success', t('success.productAdded'));
      }

      loadProducts();
      handleCloseModal();
    } catch (error) {
      console.error('Failed to save product:', error);
      showNotification('error', t('errors.unknownError'));
    }
  };

  const handleDeleteProduct = async (product: Product) => {
    if (!confirm(t('inventory.deleteConfirm'))) return;

    try {
      await db.products.delete(product.id!);
      showNotification('success', t('success.productDeleted'));
      loadProducts();
    } catch (error) {
      console.error('Failed to delete product:', error);
      showNotification('error', t('errors.unknownError'));
    }
  };

  const lowStockProducts = products.filter((p) => p.stock <= p.reorderLevel && p.stock > 0);
  const outOfStockProducts = products.filter((p) => p.stock === 0);

  return (
    <div className="space-y-4" dir="rtl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 kurdish-text">
            {t('inventory.title')}
          </h1>
          <p className="text-sm text-gray-600 kurdish-text">
            {products.length} بەرهەم • {lowStockProducts.length} کۆگای کەم • {outOfStockProducts.length} کۆتایی هات
          </p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 font-medium text-white hover:bg-emerald-700 touch-button kurdish-text"
        >
          <PlusIcon className="h-5 w-5" />
          {t('inventory.addProduct')}
        </button>
      </div>

      {/* Alerts */}
      {lowStockProducts.length > 0 && (
        <div className="flex items-center gap-3 rounded-lg bg-yellow-50 border border-yellow-200 p-4">
          <ExclamationTriangleIcon className="h-6 w-6 text-yellow-600" />
          <p className="text-sm text-yellow-800 kurdish-text">
            {t('inventory.lowStockAlert')} - {lowStockProducts.length} بەرهەم کۆگایان کەمە
          </p>
        </div>
      )}

      {/* Search and Filters */}
      <div className="flex gap-3">
        <div className="relative flex-1">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t('common.search')}
            className="w-full rounded-lg border-2 border-gray-300 py-2 pr-10 pl-4 focus:border-emerald-500 focus:outline-none kurdish-text"
          />
          <MagnifyingGlassIcon className="absolute right-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
        </div>
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="rounded-lg border-2 border-gray-300 px-4 py-2 focus:border-emerald-500 focus:outline-none kurdish-text"
        >
          {categories.map((cat) => (
            <option key={cat.value} value={cat.value}>
              {cat.label}
            </option>
          ))}
        </select>
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {filteredProducts.map((product) => {
          const profitMargin = product.price > 0
            ? ((product.price - product.costPrice) / product.price * 100).toFixed(1)
            : 0;

          return (
            <div
              key={product.id}
              className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="mb-3 flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-800 kurdish-text line-clamp-2">
                    {product.nameKurdish || product.name}
                  </h3>
                  <p className="text-xs text-gray-500 kurdish-text">
                    {categories.find((c) => c.value === product.category)?.label}
                  </p>
                </div>
                <div className="flex gap-1">
                  <button
                    onClick={() => handleOpenModal(product)}
                    className="rounded p-1 text-blue-600 hover:bg-blue-50 touch-button"
                  >
                    <PencilIcon className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteProduct(product)}
                    className="rounded p-1 text-red-600 hover:bg-red-50 touch-button"
                  >
                    <TrashIcon className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600 kurdish-text">{t('common.price')}</span>
                  <span className="font-semibold text-emerald-600">
                    {formatCurrency(product.price)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 kurdish-text">{t('inventory.costPrice')}</span>
                  <span className="font-medium">{formatCurrency(product.costPrice)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 kurdish-text">{t('inventory.profit')}</span>
                  <span className="font-medium text-green-600">{profitMargin}%</span>
                </div>
                <div className="flex justify-between border-t border-gray-200 pt-2">
                  <span className="text-gray-600 kurdish-text">{t('inventory.currentStock')}</span>
                  <span
                    className={`font-semibold ${
                      product.stock === 0
                        ? 'text-red-600'
                        : product.stock <= product.reorderLevel
                        ? 'text-yellow-600'
                        : 'text-gray-800'
                    }`}
                  >
                    {product.stock}
                  </span>
                </div>
              </div>

              {product.stock <= product.reorderLevel && (
                <div className="mt-2">
                  {product.stock === 0 ? (
                    <span className="inline-block rounded-full bg-red-100 px-2 py-1 text-xs text-red-600 kurdish-text">
                      {t('sale.outOfStock')}
                    </span>
                  ) : (
                    <span className="inline-block rounded-full bg-yellow-100 px-2 py-1 text-xs text-yellow-600 kurdish-text">
                      {t('sale.lowStock')}
                    </span>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Product Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-2xl rounded-lg bg-white p-6" dir="rtl">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-xl font-bold text-gray-800 kurdish-text">
                {editingProduct ? t('inventory.editProduct') : t('inventory.addProduct')}
              </h3>
              <button
                onClick={handleCloseModal}
                className="text-gray-600 hover:text-gray-800 touch-button"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('inventory.productName')}
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full rounded-lg border-2 border-gray-300 py-2 px-3 focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 kurdish-text">
                  {t('inventory.productNameKurdish')}
                </label>
                <input
                  type="text"
                  value={formData.nameKurdish}
                  onChange={(e) => setFormData({ ...formData, nameKurdish: e.target.value })}
                  className="w-full rounded-lg border-2 border-gray-300 py-2 px-3 focus:border-emerald-500 focus:outline-none kurdish-text"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 kurdish-text">
                  {t('common.price')} (IQD)
                </label>
                <input
                  type="number"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  className="w-full rounded-lg border-2 border-gray-300 py-2 px-3 focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 kurdish-text">
                  {t('inventory.costPrice')} (IQD)
                </label>
                <input
                  type="number"
                  value={formData.costPrice}
                  onChange={(e) => setFormData({ ...formData, costPrice: e.target.value })}
                  className="w-full rounded-lg border-2 border-gray-300 py-2 px-3 focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 kurdish-text">
                  {t('inventory.barcode')}
                </label>
                <input
                  type="text"
                  value={formData.barcode}
                  onChange={(e) => setFormData({ ...formData, barcode: e.target.value })}
                  className="w-full rounded-lg border-2 border-gray-300 py-2 px-3 focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 kurdish-text">
                  {t('inventory.category')}
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full rounded-lg border-2 border-gray-300 py-2 px-3 focus:border-emerald-500 focus:outline-none kurdish-text"
                >
                  {categories.filter((c) => c.value !== 'all').map((cat) => (
                    <option key={cat.value} value={cat.value}>
                      {cat.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 kurdish-text">
                  {t('inventory.currentStock')}
                </label>
                <input
                  type="number"
                  value={formData.stock}
                  onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                  className="w-full rounded-lg border-2 border-gray-300 py-2 px-3 focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 kurdish-text">
                  {t('inventory.reorderLevel')}
                </label>
                <input
                  type="number"
                  value={formData.reorderLevel}
                  onChange={(e) => setFormData({ ...formData, reorderLevel: e.target.value })}
                  className="w-full rounded-lg border-2 border-gray-300 py-2 px-3 focus:border-emerald-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="mt-6 flex gap-3">
              <button
                onClick={handleSaveProduct}
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

export default Inventory;
