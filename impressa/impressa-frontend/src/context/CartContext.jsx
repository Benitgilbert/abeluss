import { createContext, useContext, useEffect, useState } from "react";
import * as api from "../services/api";

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch cart on mount
  useEffect(() => {
    fetchCart();
  }, []);

  const fetchCart = async () => {
    try {
      setLoading(true);
      const response = await api.getCart();
      setCart(response.data);
      setError(null);
    } catch (err) {
      console.error("Failed to fetch cart:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const addItem = async (productId, quantity = 1, variationId = null) => {
    try {
      const response = await api.addToCart(productId, quantity, variationId);
      setCart(response.data);
      return response;
    } catch (err) {
      console.error("Failed to add item:", err);
      throw err;
    }
  };

  const updateItem = async (productId, quantity, variationId = null) => {
    try {
      const response = await api.updateCartItem(productId, quantity, variationId);
      setCart(response.data);
      return response;
    } catch (err) {
      console.error("Failed to update item:", err);
      throw err;
    }
  };

  const removeItem = async (productId) => {
    try {
      const response = await api.removeFromCart(productId);
      setCart(response.data);
      return response;
    } catch (err) {
      console.error("Failed to remove item:", err);
      throw err;
    }
  };

  const clearCart = async () => {
    try {
      const response = await api.clearCart();
      setCart(response.data);
      return response;
    } catch (err) {
      console.error("Failed to clear cart:", err);
      throw err;
    }
  };

  const applyCoupon = async (couponCode) => {
    try {
      const response = await api.applyCoupon(couponCode);
      setCart(response.data);
      return response;
    } catch (err) {
      console.error("Failed to apply coupon:", err);
      throw err;
    }
  };

  const removeCoupon = async () => {
    try {
      const response = await api.removeCoupon();
      setCart(response.data);
      return response;
    } catch (err) {
      console.error("Failed to remove coupon:", err);
      throw err;
    }
  };

  const value = {
    cart,
    loading,
    error,
    items: cart?.items || [],
    itemCount: cart?.items?.reduce((count, item) => count + item.quantity, 0) || 0,
    totals: cart?.totals || { subtotal: 0, discount: 0, shipping: 0, tax: 0, grandTotal: 0 },
    coupon: cart?.coupon || null,
    fetchCart,
    addItem,
    updateItem,
    removeItem,
    clearCart,
    applyCoupon,
    removeCoupon,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
