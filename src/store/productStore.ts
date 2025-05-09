import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { v4 as uuidv4 } from 'uuid';
import { Product } from '../types';

interface ProductState {
  products: Product[];
  addProduct: (product: Omit<Product, 'id' | 'code'>) => void;
  updateProduct: (product: Product) => void;
  deleteProduct: (id: string) => void;
  getProductByCode: (code: string) => Product | undefined;
  bulkAddProducts: (products: Omit<Product, 'id'>[]) => void;
  clearAllProducts: () => void;
  loadProducts: (products: Product[]) => void;
}

// const backendURL = 'http://localhost:8000';
const backendURL = 'http://168.231.66.208:8000';

export const useProductStore = create<ProductState>()(
  persist(
    (set, get) => ({
      products: [],

      addProduct: async (product) => {
        const id = uuidv4();
        const payload = { ...product, id }
        console.log(payload)
        try {
        const res = await fetch(backendURL + '/products/', {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
            body: JSON.stringify(payload),
          });

          if (!res.ok) {
            const error = await res.json();
            throw new Error(error.detail || "Failed to add product");
          }
          const data = await res.json();
          
          set((state) => ({
            products: [...state.products, { ...product, id, code: data.code }]
          }));
      
          return data;
          } catch (err: any) {
            console.error("Add error:", err.message);
            return null;
          }
      },


      updateProduct: async (updatedProduct) => {
        set((state) => ({
          products: state.products.map((product) =>
            product.id === updatedProduct.id ? updatedProduct : product
          )
        }));

        try {
          const res = await fetch(backendURL + `/products/${updatedProduct.id}`, {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(updatedProduct),
          });

          if (!res.ok) {
            const error = await res.json();
            throw new Error(error.detail || "Failed to update product");
          }
          const data = await res.json();
          
          return data;
        } catch (err) {
          console.error("Update error:", err);
          return null;
        }
      },

      deleteProduct: async (id) => {
        set((state) => ({
          products: state.products.filter((product) => product.id !== id)
        }))
         try {
          const res = await fetch(backendURL + `/products/${id}`, {
            method: "DELETE",
          });

          if (!res.ok) {
            const error = await res.json();
            throw new Error(error.detail || "Failed to delete product");
          }
          return true;
        } catch (err) {
          console.error("Delete error:", err);
          return false;
      }
      },

      clearAllProducts: () =>
        set(() => ({
          products: []
        })),
      
      getProductByCode: (code) => {
        return get().products.find(product => product.code === code);
      },
      
      bulkAddProducts: async (newProducts) => {
        for (const product of newProducts) {
          const payload = {
            ...product,
            id: uuidv4()
          };

          try {
            const res = await fetch(backendURL + '/products/', {
              method: "POST",
              headers: {
                "Content-Type": "application/json"
              },
              body: JSON.stringify(payload),
            });

            if (!res.ok) {
              const error = await res.json();
              throw new Error(error.detail || "Failed to add product");
            }

            const data = await res.json();

            set((state) => ({
              products: [...state.products, { ...payload, code: data.code }]
            }));
            
          } catch (err: any) {
            console.error("Add error:", err.message);
          }
        }
      },

      loadProducts: (products:Product[]) => {
        set(() => ({
          products: [...products]
        }));
      }
    }),
    {
      name: 'product-storage'
    }
  )
);