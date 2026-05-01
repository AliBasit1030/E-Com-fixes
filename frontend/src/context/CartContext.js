import React, { createContext, useState, useContext } from 'react';
import api from '../services/api';

const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const [cartTotal, setCartTotal] = useState(0);
  const [loading, setLoading] = useState(false);

  const fetchCart = async () => {
    setLoading(true);
    const response = await api.get('/cart');
    setCartItems(response.data.items || []);
    setCartTotal(response.data.total || 0);
    setLoading(false);
  };

  const addToCart = async (productId, quantity = 1) => {
    const response = await api.post('/cart/items', {
      product_id: productId,
      quantity: quantity,
    });
    if (response.data.cart) {
      setCartItems(response.data.cart.items);
      setCartTotal(response.data.total);
    }
    return response.data;
  };

  const updateCartItem = async (itemId, quantity) => {
    const response = await api.post(`/cart/items/${itemId}`, {
      quantity: quantity,
    });
    if (response.data.cart) {
      setCartItems(response.data.cart.items);
      setCartTotal(response.data.total);
    }
  };

  const removeFromCart = async (itemId) => {
    await api.delete(`/cart/items/${itemId}`);
    const updatedItems = cartItems;
    const index = updatedItems.findIndex(item => item.id === itemId);
    if (index > -1) {
      updatedItems.splice(index, 1);
    }
    setCartItems(updatedItems);

    let total = 0;
    updatedItems.forEach(item => {
      total += item.price * item.quantity;
    });
    setCartTotal(total);
  };

  const clearCart = () => {
    setCartItems([]);
    setCartTotal(0);
  };

  return (
    <CartContext.Provider
      value={{
        cartItems,
        cartTotal,
        loading,
        fetchCart,
        addToCart,
        updateCartItem,
        removeFromCart,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
