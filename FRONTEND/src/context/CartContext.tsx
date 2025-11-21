import React, { createContext, useContext, useState, useEffect } from 'react';
import { AccessoryRecommendation } from '../lib/api';

interface CartItem extends AccessoryRecommendation {
  quantity: number;
}

interface CartContextType {
  cartItems: CartItem[];
  addToCart: (item: AccessoryRecommendation) => void;
  removeFromCart: (accessoryId: string) => void;
  updateQuantity: (accessoryId: string, quantity: number) => void;
  clearCart: () => void;
  getCartTotal: () => number;
  getCartCount: () => number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cartItems, setCartItems] = useState<CartItem[]>(() => {
    // Load cart from localStorage on init
    const savedCart = localStorage.getItem('cart');
    return savedCart ? JSON.parse(savedCart) : [];
  });

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cartItems));
  }, [cartItems]);

  const addToCart = (item: AccessoryRecommendation) => {
    setCartItems((prev) => {
      const existingItem = prev.find((i) => i.accessory_id === item.accessory_id);
      if (existingItem) {
        // Increase quantity if item already in cart
        return prev.map((i) =>
          i.accessory_id === item.accessory_id
            ? { ...i, quantity: i.quantity + 1 }
            : i
        );
      } else {
        // Add new item with quantity 1
        return [...prev, { ...item, quantity: 1 }];
      }
    });
  };

  const removeFromCart = (accessoryId: string) => {
    setCartItems((prev) => prev.filter((item) => item.accessory_id !== accessoryId));
  };

  const updateQuantity = (accessoryId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(accessoryId);
      return;
    }
    setCartItems((prev) =>
      prev.map((item) =>
        item.accessory_id === accessoryId ? { ...item, quantity } : item
      )
    );
  };

  const clearCart = () => {
    setCartItems([]);
  };

  const getCartTotal = () => {
    return cartItems.reduce((total, item) => total + item.price * item.quantity, 0);
  };

  const getCartCount = () => {
    return cartItems.reduce((count, item) => count + item.quantity, 0);
  };

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        getCartTotal,
        getCartCount,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
