import React, { createContext, useContext, useState, useEffect } from 'react';
import { AccessoryRecommendation } from '../lib/api';

interface WishlistContextType {
  wishlistItems: AccessoryRecommendation[];
  addToWishlist: (item: AccessoryRecommendation) => void;
  removeFromWishlist: (accessoryId: string) => void;
  isInWishlist: (accessoryId: string) => boolean;
  clearWishlist: () => void;
  getWishlistCount: () => number;
  syncWithServer: () => Promise<void>;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

const API_BASE_URL = 'http://localhost:8000';

export const WishlistProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [wishlistItems, setWishlistItems] = useState<AccessoryRecommendation[]>(() => {
    const savedWishlist = localStorage.getItem('wishlist');
    return savedWishlist ? JSON.parse(savedWishlist) : [];
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

  // Save to localStorage whenever it changes (fallback)
  useEffect(() => {
    localStorage.setItem('wishlist', JSON.stringify(wishlistItems));
  }, [wishlistItems]);

  // Sync wishlist with server
  const syncWithServer = async () => {
    const token = getToken();
    if (!token) return;

    try {
      const response = await fetch(`${API_BASE_URL}/wishlist`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.items) {
          setWishlistItems(data.items);
        }
      }
    } catch (error) {
      console.error('Failed to sync wishlist with server:', error);
    }
  };

  const addToWishlist = async (item: AccessoryRecommendation) => {
    const token = getToken();
    
    // If user is logged in, sync with server
    if (token) {
      try {
        const response = await fetch(`${API_BASE_URL}/wishlist`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({
            accessory_id: item.accessory_id,
          }),
        });

        if (response.ok) {
          await syncWithServer();
          return;
        }
      } catch (error) {
        console.error('Failed to add to wishlist on server:', error);
      }
    }

    // Fallback to localStorage
    setWishlistItems((prev) => {
      const exists = prev.find((i) => i.accessory_id === item.accessory_id);
      if (exists) {
        return prev;
      }
      return [...prev, item];
    });
  };

  const removeFromWishlist = async (accessoryId: string) => {
    const token = getToken();
    
    // If user is logged in, sync with server
    if (token) {
      try {
        const response = await fetch(`${API_BASE_URL}/wishlist/${accessoryId}`, {
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
        console.error('Failed to remove from wishlist on server:', error);
      }
    }

    // Fallback to localStorage
    setWishlistItems((prev) => prev.filter((item) => item.accessory_id !== accessoryId));
  };

  const isInWishlist = (accessoryId: string) => {
    return wishlistItems.some((item) => item.accessory_id === accessoryId);
  };

  const clearWishlist = () => {
    setWishlistItems([]);
  };

  const getWishlistCount = () => {
    return wishlistItems.length;
  };

  return (
    <WishlistContext.Provider
      value={{
        wishlistItems,
        addToWishlist,
        removeFromWishlist,
        isInWishlist,
        clearWishlist,
        getWishlistCount,
        syncWithServer,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
};
