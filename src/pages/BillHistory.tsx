import React, { useState } from 'react';
import { format } from 'date-fns';
import { ChevronRight, FileText, Download, WholeWord as FileWord, File as FilePdf } from 'lucide-react';
import { useBillStore } from '../store/billStore';
import Sidebar from '../components/Sidebar';
import { printBills, exportToPDF, exportToWord } from '../utils/export';
import { Bill } from '../types';
import { Input } from '../components/ui/input';

const BillHistory = () => {
  const { bills } = useBillStore();
  const [selectedBills, setSelectedBills] = useState<string[]>([]);

  // To address input model data
  const [showModal, setShowModal] = useState(false);
  
  const [BuyerAddress, setBuyerAddress] = useState<string[]>(['', '', '', '', '']);
  const sampleAddress = ['ABC TRADERS - KOVILPATTI', '2/3, Main Road, Nellai Main Road,', 'Kovilpatti - 628502',
    'GSTIN / UIN: 33ABCDWFGH12345', 'State: Tamil Nadu, Code: 33'];
  const [actionType, setActionType] = useState<'pdf' | 'word' | 'print' | null>(null);

  const triggerAction = (type: 'pdf' | 'word' | 'print') => {
    setActionType(type);
    setShowModal(true);
  };

  const handleModalConfirm = async () => {
    const billsToExport = bills.filter(bill =>
      selectedBills.length === 0 || selectedBills.includes(bill.id)
    );

    if (actionType === 'pdf') {
      exportToPDF(billsToExport, BuyerAddress); // Pass notes to PDF
    } else if (actionType === 'word') {
      await exportToWord(billsToExport, 'bills'); // Pass notes to Word
    } else if (actionType === 'print') {
      printBills(billsToExport, BuyerAddress); // Pass notes to Print
    }

    setShowModal(false);
    setBuyerAddress(['', '', '', '', '']); // reset
    setActionType(null);
  };

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

  // Obselete code for download and print buttons
  // const handleDownload = async (type: 'pdf' | 'word') => {
  //   const billsToExport = bills.filter(bill => 
  //     selectedBills.length === 0 || selectedBills.includes(bill.id)
  //   );

  //   if (type === 'pdf') {
  //     exportToPDF(billsToExport);
  //   } else {
  //     await exportToWord(billsToExport, 'bills');
  //   }
  // };

  // const handlePrint = async () => {
  //   const billsToExport = bills.filter(bill =>
  //     selectedBills.length === 0 || selectedBills.includes(bill.id)
  //   );

  //   printBills(billsToExport);
  // };

  const [expandedBillIds, setExpandedBillIds] = useState<string[]>([]);

  const toggleBillExpand = (billId: string) => {
    setExpandedBillIds(prev =>
      prev.includes(billId)
        ? prev.filter(id => id !== billId)
        : [...prev, billId]
    );
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
                onClick={() => triggerAction('pdf')}
                className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                <FilePdf className="w-4 h-4" />
                Export PDF
              </button>
              <button
                onClick={() => triggerAction('word')}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                <FileWord className="w-4 h-4" />
                Export Word
              </button>
              <button
                onClick={() => triggerAction('print')}
                className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                <FilePdf className="w-4 h-4" />
                Print Bill
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
                    {/* <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">GST</th> */}
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total CGST (₹)</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total SGST (₹)</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Discount (₹)</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {bills.map((bill) => (
                    <>
                      <tr key={bill.id} className="hover:bg-gray-50" onClick={() => toggleBillExpand(bill.id)}>
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
                      <td className="px-4 py-4 whitespace-nowrap text-sm">₹{bill.totalGst?.toFixed(2)}</td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm">₹{bill.totalDiscount.toFixed(2)}</td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm font-medium">₹{bill.grandTotal.toFixed(2)}</td>
                    </tr>
                      {
                        expandedBillIds.includes(bill.id) && (
                          <tr className="bg-gray-50">
                            <td colSpan={8} className="px-4 py-4">
                              <div className="space-y-2">
                                {bill.items.map((item, index) => (
                                  <div key={index} className="flex gap-x-10 text-sm border-b py-1">
                                    <span className='min-w-20'><strong>Code:</strong> {item.code}</span>
                                    <span className='min-w-60'><strong>Name:</strong> {item.name}</span>
                                    <span className='min-w-40'><strong>Price:</strong> ₹{item.price.toFixed(2)}</span>
                                    {/* <span className='min-w-40'><strong>GST:</strong> {item.gstPercentage}%</span> */}
                                    <span className='min-w-20'><strong>Qty:</strong> {item.billQuantity + " " + (item.unit || '')}</span>
                                    <span className='min-w-20'><strong>Total:</strong> ₹{bill.grandTotal.toFixed(2)}</span>
                                  </div>
                                ))}
                              </div>
                            </td>
                          </tr>
                        )
                      }
                    </>
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
                      <span className="text-sm">₹{bill.totalGst?.toFixed(2)}</span>
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

        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md flex flex-col gap-4">
              <h2>Enter Buyer Info (5 Lines)</h2>
              {BuyerAddress.map((line, i) => (
                <Input
                  className='h-10 text-md'
                  key={i}
                  type="text"
                  value={line}
                  onChange={(e) => {
                    const updated = [...BuyerAddress];
                    updated[i] = e.target.value;
                    setBuyerAddress(updated);
                  }}
                  placeholder={sampleAddress[i]}
                />
              ))}
              <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700" onClick={handleModalConfirm}>Continue</button>
              <button className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700" onClick={() => setShowModal(false)}>Cancel</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BillHistory;