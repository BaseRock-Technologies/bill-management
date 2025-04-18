import React, { useState } from 'react';
import { format } from 'date-fns';
import { ChevronRight, FileText, Download, WholeWord as FileWord, File as FilePdf } from 'lucide-react';
import { useBillStore } from '../store/billStore';
import Sidebar from '../components/Sidebar';
import { exportToPDF, exportToWord } from '../utils/export';
import { Bill } from '../types';

const BillHistory = () => {
  const { bills } = useBillStore();
  const [selectedBills, setSelectedBills] = useState<string[]>([]);

  const handleSelectBill = (billId: string) => {
    setSelectedBills(prev => 
      prev.includes(billId) 
        ? prev.filter(id => id !== billId)
        : [...prev, billId]
    );
  };

  const handleSelectAll = () => {
    setSelectedBills(
      selectedBills.length === bills.length 
        ? [] 
        : bills.map(bill => bill.id)
    );
  };

  const handleDownload = async (type: 'pdf' | 'word') => {
    const billsToExport = bills.filter(bill => 
      selectedBills.length === 0 || selectedBills.includes(bill.id)
    );

    if (type === 'pdf') {
      exportToPDF(billsToExport, 'bills');
    } else {
      await exportToWord(billsToExport, 'bills');
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 p-4 md:p-8 pt-20 md:pt-8 md:ml-64">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Billing History</h1>
            <div className="flex gap-2">
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
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left">
                      <input
                        type="checkbox"
                        checked={selectedBills.length === bills.length}
                        onChange={handleSelectAll}
                        className="rounded border-gray-300"
                      />
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Bill ID</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Items</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Subtotal</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">GST</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Discount (₹)</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {bills.map((bill) => (
                    <tr key={bill.id} className="hover:bg-gray-50">
                      <td className="px-4 py-4">
                        <input
                          type="checkbox"
                          checked={selectedBills.includes(bill.id)}
                          onChange={() => handleSelectBill(bill.id)}
                          className="rounded border-gray-300"
                        />
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm">
                        <div className="flex items-center">
                          <FileText className="h-4 w-4 text-gray-400 mr-2" />
                          {bill.id.slice(0, 8)}
                        </div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm">
                        {format(new Date(bill.timestamp), 'dd/MM/yyyy HH:mm')}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm">{bill.items.length}</td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm">₹{bill.subtotal.toFixed(2)}</td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm">₹{bill.totalGst.toFixed(2)}</td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm">₹{bill.totalDiscount.toFixed(2)}</td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm font-medium">₹{bill.grandTotal.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile view for bills */}
            <div className="md:hidden">
              {bills.map((bill) => (
                <div key={bill.id} className="p-4 border-b">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={selectedBills.includes(bill.id)}
                        onChange={() => handleSelectBill(bill.id)}
                        className="rounded border-gray-300"
                      />
                      <FileText className="h-4 w-4 text-gray-400" />
                      <span className="text-sm font-medium">{bill.id.slice(0, 8)}</span>
                    </div>
                    <span className="text-sm text-gray-500">
                      {format(new Date(bill.timestamp), 'dd/MM/yyyy')}
                    </span>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500">Items:</span>
                      <span className="text-sm">{bill.items.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500">Subtotal:</span>
                      <span className="text-sm">₹{bill.subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500">GST:</span>
                      <span className="text-sm">₹{bill.totalGst.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500">Discount:</span>
                      <span className="text-sm">₹{bill.totalDiscount.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between font-medium">
                      <span className="text-sm text-gray-500">Total:</span>
                      <span className="text-sm">₹{bill.grandTotal.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BillHistory;