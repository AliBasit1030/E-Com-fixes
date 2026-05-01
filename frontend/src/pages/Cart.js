import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

const Cart = () => {
  const { cartItems, cartTotal, loading, fetchCart, updateCartItem, removeFromCart } = useCart();
  const [pendingQuantities, setPendingQuantities] = useState({});
  const debounceTimers = useRef({});
  
  // Sync pendingQuantities with cartItems if cartItems change (e.g., after API update)
  useEffect(() => {
    setPendingQuantities((prev) => {
      const updated = { ...prev };
      cartItems.forEach(item => {
        // If backend value is different from pending, update pending
        if (updated[item.id] !== undefined && updated[item.id] !== item.quantity) {
          updated[item.id] = item.quantity;
        }
      });
      return updated;
    });
  }, [cartItems]);

  const { user } = useAuth();
  const navigate = useNavigate();
  
  // Prevent duplicate fetchCart calls (e.g., due to StrictMode)
  const fetchedRef = useRef(false);
  
  useEffect(() => {
    if (user && !fetchedRef.current) {
      console.log('fetchCart called');
      fetchCart();
      fetchedRef.current = true;
    }
  }, [user]);

  // Get the current quantity to display (pending or actual)
  const getDisplayQuantity = (item) => {
    return pendingQuantities[item.id] !== undefined ? pendingQuantities[item.id] : item.quantity;
  };

  // Debounced quantity update with immediate UI sync
  const handleQuantityChange = (itemId, currentActualQuantity, delta) => {
    // Get the current pending quantity or actual quantity
    const currentQuantity = pendingQuantities[itemId] !== undefined 
      ? pendingQuantities[itemId] 
      : currentActualQuantity;
    
    const newQuantity = currentQuantity + delta;
    
    if (newQuantity < 1) return;
    
    // Immediately update the pending quantity
    setPendingQuantities((prev) => ({ ...prev, [itemId]: newQuantity }));
    
    // Clear existing timer for this item
    if (debounceTimers.current[itemId]) {
      clearTimeout(debounceTimers.current[itemId]);
    }
    
    // Set new timer
    debounceTimers.current[itemId] = setTimeout(() => {
      console.log('updateCartItem called', itemId, newQuantity);
      updateCartItem(itemId, newQuantity).then(() => {
        // After successful update, clear the pending quantity if it matches backend
        setPendingQuantities((prev) => {
          const copy = { ...prev };
          // Only clear if backend matches
          if (cartItems.find(i => i.id === itemId)?.quantity === newQuantity) {
            delete copy[itemId];
          }
          return copy;
        });
      }).catch(() => {
        // If update fails, revert to original quantity
        setPendingQuantities((prev) => {
          const copy = { ...prev };
          delete copy[itemId];
          return copy;
        });
      });
    }, 500);
  };

  const handleRemove = (itemId) => {
    removeFromCart(itemId);
  };

  const handleCheckout = () => {
    navigate('/checkout');
  };

  if (!user) {
    return (
      <div style={styles.container}>
        Please login to view your cart.
      </div>
    );
  }

  if (loading) {
    return (
      <div style={styles.container}>
        Loading cart...
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <h1 style={styles.heading}>Shopping Cart</h1>
      {cartItems.length === 0 ? (
        <div style={styles.empty}>Your cart is empty.</div>
      ) : (
        <>
          <div style={styles.itemsList}>
            {cartItems.map((item) => (
              <div key={item.id} style={styles.item}>
                <div style={styles.itemInfo}>
                  <h3 style={styles.itemName}>
                    {item.product ? item.product.name : 'Product'}
                  </h3>
                  <div style={styles.itemPrice}>${item.price} each</div>
                </div>
                <div style={styles.itemActions}>
                  <button
                    onClick={() => handleQuantityChange(item.id, item.quantity, -1)}
                    style={styles.qtyBtn}
                  >
                    -
                  </button>
                  <span style={styles.qty}>
                    {getDisplayQuantity(item)}
                  </span>
                  <button
                    onClick={() => handleQuantityChange(item.id, item.quantity, 1)}
                    style={styles.qtyBtn}
                  >
                    +
                  </button>
                  <span style={styles.subtotal}>
                    ${(item.price * getDisplayQuantity(item)).toFixed(2)}
                  </span>
                  <button
                    onClick={() => handleRemove(item.id)}
                    style={styles.removeBtn}
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
          <div style={styles.totalSection}>
            <h2>Total: ${Number(cartTotal).toFixed(2)}</h2>
            <button onClick={handleCheckout} style={styles.checkoutBtn}>
              Proceed to Checkout
            </button>
          </div>
        </>
      )}
    </div>
  );
};

const styles = {
  container: { maxWidth: '800px', margin: '0 auto', padding: '24px' },
  heading: { color: '#2c3e50', marginBottom: '20px' },
  empty: { textAlign: 'center', color: '#999', marginTop: '40px' },
  itemsList: { marginBottom: '24px' },
  item: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '16px',
    background: '#fff',
    borderRadius: '8px',
    boxShadow: '0 1px 4px rgba(0,0,0,0.1)',
    marginBottom: '12px',
  },
  itemInfo: {},
  itemName: { margin: 0, color: '#2c3e50', fontSize: '16px' },
  itemPrice: { color: '#666', fontSize: '14px', margin: '4px 0 0' },
  itemActions: { display: 'flex', alignItems: 'center', gap: '12px' },
  qtyBtn: {
    width: '32px',
    height: '32px',
    border: '1px solid #ddd',
    borderRadius: '4px',
    background: '#f8f9fa',
    cursor: 'pointer',
    fontSize: '16px',
  },
  qty: { fontSize: '16px', fontWeight: 'bold', minWidth: '20px', textAlign: 'center' },
  subtotal: { fontSize: '16px', fontWeight: 'bold', color: '#27ae60', minWidth: '80px' },
  removeBtn: {
    background: '#e74c3c',
    color: '#fff',
    border: 'none',
    padding: '6px 12px',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '13px',
  },
  totalSection: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '20px',
    background: '#fff',
    borderRadius: '8px',
    boxShadow: '0 1px 4px rgba(0,0,0,0.1)',
  },
  checkoutBtn: {
    padding: '12px 32px',
    backgroundColor: '#27ae60',
    color: '#fff',
    border: 'none',
    borderRadius: '4px',
    fontSize: '16px',
    cursor: 'pointer',
  },
};

export default Cart;