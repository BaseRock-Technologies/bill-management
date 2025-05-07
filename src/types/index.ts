export interface User {
  username: string;
  securityQuestion: string;
  securityAnswer: string;
}

export interface Product {
  id: string;
  code: string;
  name: string;
  gstPercentage?: number;
  price: number;
  quantity?: number;
  unit?: string;
}

export interface BillItem extends Product {
  billQuantity: number;
  discount?: number;
  total: number;
  gstAmount: number;
}

export interface Bill {
  id: string;
  items: BillItem[];
  timestamp: Date;
  subtotal: number;
  // totalGst: number;
  totalCGst: number;
  totalSGst: number;
  totalDiscount: number;
  grandTotal: number;
}