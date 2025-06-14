import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { v4 as uuidv4 } from 'uuid';
import { Bill, BillItem } from '../types';

interface BillState {
  bills: Bill[];
  addBill: (items: BillItem[], totalCGstParam: number, totalSGstParam: number) => void;
  getBills: () => Bill[] | Promise<Bill[]>;
}


// const backendURL = 'http://localhost:8000';
const backendURL = 'http://168.231.66.208:8000';

export const useBillStore = create<BillState>()(
  persist(
    (set, get) => ({
      bills: [],

      addBill: async (items, totalCGstParam, totalSGstParam) => {
        const subtotal = items.reduce((acc, item) => acc + item.total, 0);
        const totalGst = items.reduce((acc, item) => acc + item.gstAmount, 0);
        const totalDiscount = items.reduce((acc, item) => acc + (item.discount || 0), 0);
        const totalCGst = totalCGstParam;
        const totalSGst = totalSGstParam;
        const grandTotal = subtotal + totalGst - totalDiscount;

        const newBill: Bill = {
          id: uuidv4(),
          items,
          timestamp: new Date(),
          subtotal,
          totalGst,
          totalCGst,
          totalSGst,
          totalDiscount,
          grandTotal
        };

        console.log(newBill)

        try {
          const res = await fetch(backendURL + '/bills/', {
            method: "POST",
            headers: {
              "Content-Type": "application/json"
            },
            body: JSON.stringify(newBill),
          });
          // const error = await res.json();
          // console.error(error);

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
          const res = await fetch(backendURL + '/bills/');
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