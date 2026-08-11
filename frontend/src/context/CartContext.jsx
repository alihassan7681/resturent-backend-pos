import { createContext, useContext, useState, useCallback } from 'react';

const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
  const [items, setItems] = useState([]);
  const [orderType, setOrderType] = useState('dine-in');
  const [tableNumber, setTableNumber] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [discountType, setDiscountType] = useState('flat'); // 'flat' | 'percent'
  const [discountValue, setDiscountValue] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [taxRate] = useState(0); // 0% GST (Tax removed)

  const addItem = useCallback((menuItem) => {
    setItems(prev => {
      const existing = prev.find(i => i._id === menuItem._id);
      if (existing) {
        return prev.map(i => i._id === menuItem._id ? { ...i, quantity: i.quantity + 1 } : i);
      }
      return [...prev, { ...menuItem, quantity: 1, notes: '' }];
    });
  }, []);

  const removeItem = useCallback((id) => {
    setItems(prev => prev.filter(i => i._id !== id));
  }, []);

  const updateQuantity = useCallback((id, qty) => {
    if (qty <= 0) {
      setItems(prev => prev.filter(i => i._id !== id));
    } else {
      setItems(prev => prev.map(i => i._id === id ? { ...i, quantity: qty } : i));
    }
  }, []);

  const updateNotes = useCallback((id, notes) => {
    setItems(prev => prev.map(i => i._id === id ? { ...i, notes } : i));
  }, []);

  const clearCart = useCallback(() => {
    setItems([]);
    setOrderType('dine-in');
    setTableNumber('');
    setCustomerName('');
    setCustomerPhone('');
    setDiscountType('flat');
    setDiscountValue(0);
    setPaymentMethod('cash');
  }, []);

  // Computed
  const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const discountAmount = discountType === 'percent'
    ? (subtotal * discountValue) / 100
    : Math.min(discountValue, subtotal);
  const afterDiscount = subtotal - discountAmount;
  const taxAmount = (afterDiscount * taxRate) / 100;
  const grandTotal = afterDiscount + taxAmount;
  const itemCount = items.reduce((sum, i) => sum + i.quantity, 0);

  return (
    <CartContext.Provider value={{
      items, orderType, tableNumber, customerName, customerPhone,
      discountType, discountValue, paymentMethod, taxRate,
      subtotal, discountAmount, taxAmount, grandTotal, itemCount,
      addItem, removeItem, updateQuantity, updateNotes, clearCart,
      setOrderType, setTableNumber, setCustomerName, setCustomerPhone,
      setDiscountType, setDiscountValue, setPaymentMethod,
    }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used inside CartProvider');
  return ctx;
};
