import React, { useState, useEffect } from 'react';
import { Package, Plus, Search, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { Input } from '../components/ui/input';
import { useProductStore } from '../store/productStore';
import { useBillStore } from '../store/billStore';
import { Product, BillItem } from '../types';
import Sidebar from '../components/Sidebar';

const Billing = () => {
  const { products } = useProductStore();
  const { addBill, getBills, bills } = useBillStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProducts, setSelectedProducts] = useState<BillItem[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);

  useEffect(() => {
    const filtered = products.filter(product =>
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.code.toLowerCase().includes(searchTerm.toLowerCase())
    );
    console.log(filtered)
    setFilteredProducts(filtered);
    getBills(); // Fetch bills 
  }, [searchTerm, products]);

  const handleProductSelect = (product: Product) => {
    console.log(product)
    const billItem: BillItem = {
      ...product,
      billQuantity: 1,
      discount: 0,
      total: product.price,
      gstAmount: (product.price * (product.gstPercentage || 0)) / 100
    };
    setSelectedProducts([...selectedProducts, billItem]);
    setSearchTerm('');
  };

  const updateBillItem = (index: number, updates: Partial<BillItem>) => {
    const updatedItems = selectedProducts.map((item, i) => {
      if (i === index) {
        const updatedItem = { ...item, ...updates };
        const total = updatedItem.price * updatedItem.billQuantity;
        const gstAmount = (total * (updatedItem.gstPercentage || 0)) / 100;
        const grandTotal = total - (updatedItem.discount || 0);
        return { ...updatedItem, total, gstAmount, grandTotal };
      }
      return item;
    });
    console.log(updatedItems)
    setSelectedProducts(updatedItems);
  };

  const removeBillItem = (index: number) => {
    setSelectedProducts(selectedProducts.filter((_, i) => i !== index));
  };

  const calculateTotals = () => {
    const subtotal = selectedProducts.reduce((acc, item) => acc + item.total, 0);
    const totalGst = selectedProducts.reduce((acc, item) => acc + item.gstAmount, 0);
    const totalCGst = totalGst / 2;
    const totalSGst = totalGst / 2;
    const totalDiscount = selectedProducts.reduce((acc, item) => acc + (item.discount || 0), 0);
    const grandTotal = subtotal + totalGst - totalDiscount;

    return { subtotal, totalCGst, totalSGst, totalDiscount, grandTotal };
  };

  const handleCreateBill = () => {
    if (selectedProducts.length === 0) return;

    const updatedProducts = selectedProducts.map((product) => ({
      ...product,
      unit: product.unit && product.unit.trim() !== '' ? product.unit : 'Units', // ✅ Default fallback
    }));

    addBill(updatedProducts, totalCGst, totalSGst);
    setSelectedProducts([]);
  };

  const { subtotal, totalCGst, totalSGst, totalDiscount, grandTotal } = calculateTotals();

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 p-4 md:p-8 pt-20 md:pt-8 md:ml-64">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Create Bill</h1>
            <button
              onClick={handleCreateBill}
              disabled={selectedProducts.length === 0}
              className="w-full md:w-auto bg-blue-600 text-white px-6 py-3 rounded-lg flex items-center gap-2 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed justify-center"
            >
              <Plus className="w-5 h-5" />
              Generate Bill
            </button>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-4 md:p-6 mb-8">
            <div className="relative mb-6">
              <Search className="absolute left-4 top-3.5 h-5 w-5 text-gray-400" />
              <Input
                type="text"
                placeholder="Search by product name or code..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-12"
              />
            </div>

            {searchTerm && filteredProducts.length > 0 && (
              <div className="absolute z-10 w-full max-w-2xl bg-white rounded-lg shadow-lg border mt-1">
                <ul className="py-2">
                  {filteredProducts.map((product) => (
                    <li
                      key={product.id}
                      className="px-4 py-2 hover:bg-gray-50 cursor-pointer"
                      onClick={() => handleProductSelect(product)}
                    >
                      <div className="flex justify-between items-center">
                        <div>
                          <span className="font-medium">{product.code}</span>
                          <span className="ml-2">{product.name}</span>
                        </div>
                        <span>₹{product.price}</span>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {selectedProducts.length > 0 && (
              <div className="mt-6 overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead>
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Code</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Unit</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">GST (%)</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Discount (₹)</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {selectedProducts.map((item, index) => (
                      <tr key={index}>
                        <td className="px-4 py-4 whitespace-nowrap text-sm">{item.name}</td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm">{item.code}</td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm">₹{item.price}</td>
                        <td className="px-1 py-4 whitespace-nowrap text-sm">
                          <Input
                            type="number"
                            min="1"
                            value={item.billQuantity}
                            onChange={(e) => {
                              updateBillItem(index, { billQuantity: Number(e.target.value) })
                              console.log(item)
                            }}
                            className="w-20 md:w-24"
                          />
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm">{item.unit}</td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm">{item.gstPercentage}%</td>
                        <td className="px-2 py-4 whitespace-nowrap text-sm">
                          <Input
                            type="number"
                            min="0"
                            value={item.discount || 0}
                            onChange={(e) => updateBillItem(index, { discount: Number(e.target.value) })}
                            className="w-20 md:w-24"
                          />
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm">₹{item.total}</td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm">
                          <button
                            onClick={() => removeBillItem(index)}
                            className="text-red-600 hover:text-red-800"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                <div className="mt-2 border-t pt-2">
                  <div className="flex justify-end">
                    <div className="w-full md:w-72 space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Subtotal:</span>
                        <span className="font-medium">₹{subtotal.toFixed(2)}</span>
                      </div>
                      {/* <div className="flex justify-between">
                        <span className="text-gray-600">GST:</span>
                        <span className="font-medium">₹{totalGst.toFixed(2)}</span>
                      </div> */}
                      <div className="flex justify-between">
                        <span className="text-gray-600">CGST:</span>
                        <span className="font-medium">₹{totalCGst.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">SGST:</span>
                        <span className="font-medium">₹{totalSGst.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Discount:</span>
                        <span className="font-medium">₹{totalDiscount.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between border-t pt-2">
                        <span className="font-semibold">Grand Total:</span>
                        <span className="font-bold">₹{grandTotal.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {bills.length > 0 && (
            <div className="bg-white rounded-lg shadow-lg p-4 md:p-6">
              <h2 className="text-xl font-semibold mb-4">Recent Bills</h2>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead>
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Bill ID</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Items</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {bills.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()).slice(0, 5).map((bill) => (
                      <tr key={bill.id} className="hover:bg-gray-50">
                        <td className="px-4 py-4 whitespace-nowrap text-sm">{bill.id.slice(0, 8)}</td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm">
                          {format(new Date(bill.timestamp), 'dd/MM/yyyy HH:mm')}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm">{bill.items.length}</td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm">₹{bill.grandTotal.toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="mt-4 text-right">
                <Link
                  to="/bill-history"
                  className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                >
                  View All Bills →
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Billing;