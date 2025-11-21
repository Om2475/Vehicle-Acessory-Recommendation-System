import React, { createContext, useContext, useState, useEffect } from 'react';
import { AccessoryRecommendation } from '../lib/api';

interface WishlistContextType {
  wishlistItems: AccessoryRecommendation[];
  addToWishlist: (item: AccessoryRecommendation) => void;
  removeFromWishlist: (accessoryId: string) => void;
  isInWishlist: (accessoryId: string) => boolean;
  clearWishlist: () => void;
  getWishlistCount: () => number;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export const WishlistProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [wishlistItems, setWishlistItems] = useState<AccessoryRecommendation[]>(() => {
    const savedWishlist = localStorage.getItem('wishlist');
    return savedWishlist ? JSON.parse(savedWishlist) : [];
  });

  useEffect(() => {
    localStorage.setItem('wishlist', JSON.stringify(wishlistItems));
  }, [wishlistItems]);

  const addToWishlist = (item: AccessoryRecommendation) => {
    setWishlistItems((prev) => {
      const exists = prev.find((i) => i.accessory_id === item.accessory_id);
      if (exists) {
        return prev;
      }
      return [...prev, item];
    });
  };

  const removeFromWishlist = (accessoryId: string) => {
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
