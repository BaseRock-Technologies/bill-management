import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { v4 as uuidv4 } from 'uuid';
import { Bill, BillItem } from '../types';

interface BillState {
  bills: Bill[];
  addBill: (items: BillItem[]) => void;
  getBills: () => Bill[];
}

export const useBillStore = create<BillState>()(
  persist(
    (set, get) => ({
      bills: [],
      addBill: (items) => {
        const subtotal = items.reduce((acc, item) => acc + item.total, 0);
        const totalGst = items.reduce((acc, item) => acc + item.gstAmount, 0);
        const totalDiscount = items.reduce((acc, item) => acc + (item.discount || 0), 0);
        const grandTotal = subtotal + totalGst - totalDiscount;

        const newBill: Bill = {
          id: uuidv4(),
          items,
          timestamp: new Date(),
          subtotal,
          totalGst,
          totalDiscount,
          grandTotal
        };

        set((state) => ({
          bills: [...state.bills, newBill]
        }));
      },
      getBills: () => get().bills
    }),
    {
      name: 'bill-storage'
    }
  )
);