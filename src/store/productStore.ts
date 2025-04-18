import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { v4 as uuidv4 } from 'uuid';
import { Product } from '../types';

interface ProductState {
  products: Product[];
  lastProductCode: number;
  addProduct: (product: Omit<Product, 'id' | 'code'>) => void;
  updateProduct: (product: Product) => void;
  deleteProduct: (id: string) => void;
  getProductByCode: (code: string) => Product | undefined;
  bulkAddProducts: (products: Omit<Product, 'id' | 'code'>[]) => void;
}

export const useProductStore = create<ProductState>()(
  persist(
    (set, get) => ({
      products: [],
      lastProductCode: 0,
      addProduct: (product) => {
        const nextCode = get().lastProductCode + 1;
        const formattedCode = `P${String(nextCode).padStart(4, '0')}`;
        set((state) => ({
          products: [...state.products, { ...product, id: uuidv4(), code: formattedCode }],
          lastProductCode: nextCode
        }));
      },
      updateProduct: (updatedProduct) =>
        set((state) => ({
          products: state.products.map((product) =>
            product.id === updatedProduct.id ? updatedProduct : product
          )
        })),
      deleteProduct: (id) =>
        set((state) => ({
          products: state.products.filter((product) => product.id !== id)
        })),
      getProductByCode: (code) => {
        return get().products.find(product => product.code === code);
      },
      bulkAddProducts: (newProducts) => {
        let nextCode = get().lastProductCode;
        const productsWithIds = newProducts.map(product => {
          nextCode++;
          return {
            ...product,
            id: uuidv4(),
            code: `P${String(nextCode).padStart(4, '0')}`
          };
        });

        set((state) => ({
          products: [...state.products, ...productsWithIds],
          lastProductCode: nextCode
        }));
      }
    }),
    {
      name: 'product-storage'
    }
  )
);