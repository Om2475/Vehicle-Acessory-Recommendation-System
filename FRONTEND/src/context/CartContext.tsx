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
  syncWithServer: () => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const API_BASE_URL = 'http://localhost:8000';

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cartItems, setCartItems] = useState<CartItem[]>(() => {
    // Load cart from localStorage on init
    const savedCart = localStorage.getItem('cart');
    return savedCart ? JSON.parse(savedCart) : [];
  });

  // Get auth token
  const getToken = () => localStorage.getItem('auth_token');

  // Sync with server on mount if user is logged in
  useEffect(() => {
    const token = getToken();
    if (token) {
      syncWithServer();
    }
  }, []);

  // Save cart to localStorage whenever it changes (fallback for non-logged-in users)
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cartItems));
  }, [cartItems]);

  // Sync cart with server
  const syncWithServer = async () => {
    const token = getToken();
    if (!token) return;

    try {
      const response = await fetch(`${API_BASE_URL}/cart`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.items) {
          setCartItems(data.items);
        }
      }
    } catch (error) {
      console.error('Failed to sync cart with server:', error);
    }
  };

  const addToCart = async (item: AccessoryRecommendation) => {
    const token = getToken();
    
    // If user is logged in, sync with server
    if (token) {
      try {
        const response = await fetch(`${API_BASE_URL}/cart`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({
            accessory_id: item.accessory_id,
            quantity: 1,
          }),
        });

        if (response.ok) {
          await syncWithServer();
          return;
        }
      } catch (error) {
        console.error('Failed to add to cart on server:', error);
      }
    }

    // Fallback to localStorage for non-logged-in users
    setCartItems((prev) => {
      const existingItem = prev.find((i) => i.accessory_id === item.accessory_id);
      if (existingItem) {
        return prev.map((i) =>
          i.accessory_id === item.accessory_id
            ? { ...i, quantity: i.quantity + 1 }
            : i
        );
      } else {
        return [...prev, { ...item, quantity: 1 }];
      }
    });
  };

  const removeFromCart = async (accessoryId: string) => {
    const token = getToken();
    
    // If user is logged in, sync with server
    if (token) {
      try {
        const response = await fetch(`${API_BASE_URL}/cart/${accessoryId}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (response.ok) {
          await syncWithServer();
          return;
        }
      } catch (error) {
        console.error('Failed to remove from cart on server:', error);
      }
    }

    // Fallback to localStorage
    setCartItems((prev) => prev.filter((item) => item.accessory_id !== accessoryId));
  };

  const updateQuantity = async (accessoryId: string, quantity: number) => {
    if (quantity <= 0) {
      await removeFromCart(accessoryId);
      return;
    }

    const token = getToken();
    
    // If user is logged in, sync with server
    if (token) {
      try {
        const response = await fetch(`${API_BASE_URL}/cart`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({
            accessory_id: accessoryId,
            quantity,
          }),
        });

        if (response.ok) {
          await syncWithServer();
          return;
        }
      } catch (error) {
        console.error('Failed to update cart on server:', error);
      }
    }

    // Fallback to localStorage
    setCartItems((prev) =>
      prev.map((item) =>
        item.accessory_id === accessoryId ? { ...item, quantity } : item
      )
    );
  };

  const clearCart = async () => {
    const token = getToken();
    
    // If user is logged in, sync with server
    if (token) {
      try {
        const response = await fetch(`${API_BASE_URL}/cart`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (response.ok) {
          setCartItems([]);
          return;
        }
      } catch (error) {
        console.error('Failed to clear cart on server:', error);
      }
    }

    // Fallback to localStorage
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
        syncWithServer,
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
