import React, { createContext, useState, useContext, useEffect } from 'react';
import { toast } from 'react-toastify';
import axios from 'axios';

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);

  // Fetch Cart Items when user logs in
  const fetchCartItems = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setCartItems([]); // Ensure cart is empty if no token
        return;
      }
  
      const response = await axios.get("https://pa-gebeya-backend.onrender.com/api/cart", {
        headers: { Authorization: `Bearer ${token}` },
      });
  
      setCartItems(response.data.items);
    } catch (error) {
      console.error("Error fetching cart items:", error);
    }
  };
  
  const addToCart = async (product) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.post("https://pa-gebeya-backend.onrender.com/api/cart", product, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setCartItems(response.data.items);
      toast.success(`${product.productName || product.title || "Item"} added to cart!`);
    } catch (error) {
      toast.error("Error adding item to cart");
      console.error(error);
    }
  };

  const updateQuantity = async (productId, newQuantity) => {
    try {
      const token = localStorage.getItem("token");
      await axios.put(`https://pa-gebeya-backend.onrender.com/api/cart/${productId}`, { quantity: newQuantity }, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setCartItems((prevCart) =>
        prevCart.map((item) =>
          item.productId._id === productId ? { ...item, quantity: newQuantity } : item
        )
      );
    } catch (error) {
      console.error(error);
    }
  };

  const removeFromCart = async (productId) => {
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`https://pa-gebeya-backend.onrender.com/api/cart/${productId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setCartItems((prev) => prev.filter((item) => item.productId._id !== productId));
      toast.info("Item removed from cart");
    } catch (error) {
      console.error(error);
    }
  };
   // Clear cart when user logs out
   const clearCart = () => {
    setCartItems([]); // Reset cartItems to an empty array
  };

  return (
    <CartContext.Provider value={{ cartItems, addToCart, updateQuantity, removeFromCart, setCartItems, fetchCartItems, clearCart }}>
    {children}
  </CartContext.Provider>
  );
};
