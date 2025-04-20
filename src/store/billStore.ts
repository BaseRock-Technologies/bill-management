import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { v4 as uuidv4 } from 'uuid';
import { Bill, BillItem } from '../types';

interface BillState {
  bills: Bill[];
  addBill: (items: BillItem[]) => void;
  getBills: () => Bill[] | Promise<Bill[]>;
}

export const useBillStore = create<BillState>()(
  persist(
    (set, get) => ({
      bills: [],

      addBill: async (items) => {
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

        try {
          const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/bills/`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json"
            },
            body: JSON.stringify(newBill),
          });

          if (!res.ok) {
            const error = await res.json();
            throw new Error(error.detail || "Failed to add bill");
          }
          const data = await res.json();

          set((state) => ({
            bills: [...state.bills, newBill]
          }));
      
          return data;
        } catch (err: any) {
          console.error("Billing error:", err.message);
          return null;
        }
      },

      getBills: async () => {
        try {
          const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/bills/`);
          const data = await res.json();

          set(() => ({
            bills: [...data]
          }));

          return data as Bill[];
        } catch (error) {
          console.error("Failed to fetch bills:", error);
        }
        return [] as Bill[];
      },

    }),
    {
      name: 'bill-storage'
    }
  )
);