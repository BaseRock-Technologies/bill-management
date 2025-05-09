import React, { useState, useRef, useEffect } from 'react';
import { Pencil, Trash2, Plus, File as FilePdf, WholeWord as FileWord, Upload, Download } from 'lucide-react';
import Papa from 'papaparse';
import Sidebar from '../components/Sidebar';
import { useProductStore } from '../store/productStore';
import { Product } from '../types';
import { Input } from '../components/ui/input';
import { exportProductsToPDF, exportToWord } from '../utils/export';

const Products = () => {
  const { products, addProduct, updateProduct, deleteProduct, bulkAddProducts, clearAllProducts, loadProducts } = useProductStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    price: '',
    quantity: '',
    unit: 'Units',
    gstPercentage: ''
  });


  // const backendURL = 'http://localhost:8000';
  const backendURL = 'http://168.231.66.208:8000';

  useEffect(() => {
    const fetchProducts = async () => {
      console.log("fetchProducts")
      try {
        const res = await fetch(backendURL + '/all_products/');
        const data = await res.json();

        clearAllProducts(); // Clear existing products
        console.log(data)
        loadProducts(data);
      } catch (error) {
        console.error("Failed to fetch products:", error);
      }
    };

    fetchProducts();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const productData = {
      code: formData.code,
      name: formData.name,
      price: Number(formData.price),
      quantity: Number(formData.quantity),
      unit: formData.unit,
      gstPercentage: Number(formData.gstPercentage)
    };

    if (editingProduct) {
      updateProduct({ ...productData, id: editingProduct.id });
    } else {
      addProduct(productData);
    }

    setIsModalOpen(false);
    setEditingProduct(null);
    setFormData({ code: '', name: '', price: '', quantity: '', unit: "Units", gstPercentage: '' });
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      code: product.code,
      name: product.name,
      price: String(product.price),
      quantity: String(product.quantity || ''),
      gstPercentage: String(product.gstPercentage || ''),
      unit: String(product.unit || 'Units')
    });
    setIsModalOpen(true);
  };

  const handleSelectProduct = (productId: string) => {
    setSelectedProducts(prev =>
      prev.includes(productId)
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    );
  };

  const handleSelectAll = () => {
    setSelectedProducts(
      selectedProducts.length === products.length
        ? []
        : products.map(product => product.id)
    );
  };

  const handleDownload = async (type: 'pdf' | 'word') => {
    const productsToExport = products.filter(product =>
      selectedProducts.length === 0 || selectedProducts.includes(product.id)
    );

    if (type === 'pdf') {
      exportProductsToPDF(productsToExport, 'products');
    } else {
      await exportToWord(productsToExport, 'products');
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const products = results.data.map((row: any) => ({
          code: row.code,
          name: row.name,
          price: Number(row.price),
          quantity: Number(row.quantity),
          unit: row.unit,
          gstPercentage: Number(row.gstPercentage)
        }));
        console.log(products)
        bulkAddProducts(products);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      },
      error: (error) => {
        console.error('Error parsing CSV:', error);
      }
    });
  };

  const handleDownloadTemplate = () => {
    const csvContent = "code,name,price,quantity,unit,gstPercentage\nHSN001,Sample Product,100,10,units,18";
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'product_template.csv';
    link.click();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar />
      <div className="p-4 lg:p-8 transition-all duration-300 md:ml-64">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4 mt-16 md:mt-0">
            <h1 className="text-2xl font-bold">Products</h1>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => handleDownload('pdf')}
                className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                <FilePdf className="w-4 h-4" />
                Export PDF
              </button>
              <button
                onClick={() => handleDownload('word')}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                <FileWord className="w-4 h-4" />
                Export Word
              </button>
              <div className="relative">
                <input
                  type="file"
                  ref={fileInputRef}
                  accept=".csv"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                >
                  <Upload className="w-4 h-4" />
                  Upload CSV
                </button>
              </div>
              <button
                onClick={handleDownloadTemplate}
                className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
              >
                <Download className="w-4 h-4" />
                Download Template
              </button>
              <button
                onClick={() => setIsModalOpen(true)}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                <Plus className="w-4 h-4" />
                Add Product
              </button>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left">
                      <input
                        type="checkbox"
                        checked={selectedProducts.length === products.length}
                        onChange={handleSelectAll}
                        className="rounded border-gray-300"
                      />
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Code</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Price</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Quantity</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">GST %</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {products.map((product) => (
                    <tr key={product.id} className="hover:bg-gray-50">
                      <td className="px-4 py-4">
                        <input
                          type="checkbox"
                          checked={selectedProducts.includes(product.id)}
                          onChange={() => handleSelectProduct(product.id)}
                          className="rounded border-gray-300"
                        />
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm">{product.code}</td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm">{product.name}</td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm">₹{product.price}</td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm">{product.quantity} {product.unit ? " " + product.unit : ' Units'}</td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm">{product.gstPercentage}%</td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm">
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleEdit(product)}
                            className="text-blue-600 hover:text-blue-800"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => deleteProduct(product.id)}
                            className="text-red-600 hover:text-red-800"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {isModalOpen && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
              <div className="bg-white rounded-lg p-6 w-full max-w-md">
                <h2 className="text-xl font-bold mb-4">
                  {editingProduct ? 'Edit Product' : 'Add New Product'}
                </h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Code</label>
                    <Input
                      type="text"
                      value={formData.code}
                      onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                      required
                      className="w-full"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Name</label>
                    <Input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                      className="w-full"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Price</label>
                    <Input
                      type="number"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                      required
                      className="w-full"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Quantity</label>
                    <Input
                      type="number"
                      value={formData.quantity}
                      onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                      required
                      className="w-full"
                    />
                  </div>
                  {/* Unit Selector */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Unit</label>
                    <select
                      value={formData.unit}
                      onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                      className="flex h-12 w-full rounded-md border border-input bg-background px-3 py-2 text-lg ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <option value="Units">Select unit</option>
                      <option value="Kgs">Kilo Grams</option>
                      <option value="Pieces">Pieces</option>
                      <option value="Bundles">Bundles</option>
                      <option value="Liters">Liters</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">GST Percentage</label>
                    <Input
                      type="number"
                      value={formData.gstPercentage}
                      onChange={(e) => setFormData({ ...formData, gstPercentage: e.target.value })}
                      required
                      className="w-full"
                    />
                  </div>
                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setIsModalOpen(false);
                        setEditingProduct(null);
                        setFormData({ code: '', name: '', price: '', quantity: '', unit: 'Units', gstPercentage: '' });
                      }}
                      className="px-4 py-2 border rounded-md hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                    >
                      {editingProduct ? 'Update' : 'Add'} Product
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Products;