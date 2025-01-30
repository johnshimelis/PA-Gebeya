import React, { createContext, useState, useContext } from "react";
import { toast } from "react-toastify"; 
import "react-toastify/dist/ReactToastify.css";

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);

  const addToCart = (product) => {
    setCartItems((prevCartItems) => {
      const existingItemIndex = prevCartItems.findIndex(
        (item) => item.id === product.id && item.title === product.title
      );
  
      if (existingItemIndex !== -1) {
        return prevCartItems.map((item, index) =>
          index === existingItemIndex
            ? { ...item, quantity: item.quantity + product.quantity } // Fix: add product.quantity
            : item
        );
      } else {
        return [...prevCartItems, { ...product, uniqueId: `${product.id}-${Date.now()}` }]; // No need to set quantity: 1
      }
    });
  };
  
  const updateQuantity = (uniqueId, newQuantity) => {
    setCartItems((prevCartItems) =>
      prevCartItems
        .map((item) =>
          item.uniqueId === uniqueId ? { ...item, quantity: Math.max(newQuantity, 0) } : item
        )
        .filter((item) => item.quantity > 0) // Removes items if quantity is 0
    );
  };

  const removeFromCart = (uniqueId) => {
    const itemToRemove = cartItems.find((item) => item.uniqueId === uniqueId);
    
    if (itemToRemove) {
      toast.info(`${itemToRemove.title} is removed from the cart`, { position: "top-center" });
    }

    setCartItems((prevItems) => prevItems.filter((item) => item.uniqueId !== uniqueId));
  };

  return (
    <CartContext.Provider value={{ cartItems, addToCart, updateQuantity, removeFromCart }}>
      {children}
    </CartContext.Provider>
  );
};
