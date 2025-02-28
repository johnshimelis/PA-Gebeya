import React, { useState, useEffect } from "react";
import "../styles/recommended.css";
import { useNavigate } from "react-router-dom";
import { useCart } from "../components/CartContext"; // Ensure you have access to the cart context
import { toast } from "react-toastify"; // Import toast
import axios from "axios"; // Import axios for API requests

const BestSeller = () => {
  const { addToCart, updateQuantity, cartItems, setCartItems } = useCart(); // Cart context to add items
  const navigate = useNavigate(); // Used for page redirection
  const [deals, setDeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchBestSellers = async () => {
      try {
        const response = await fetch("http://localhost:5000/api/products/bestsellers"); // Replace with your actual API endpoint
        if (!response.ok) {
          throw new Error("Failed to fetch best-selling products");
        }
        const data = await response.json();
        setDeals(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchBestSellers();
  }, []);

  const handleProductClick = (deal) => {
    navigate("/product_detail", { state: { product: deal } });
  };

  const handleAddToCart = async (product) => {
    const userId = localStorage.getItem("userId");
    const token = localStorage.getItem("token");
  
    // Ensure the user is logged in before proceeding
    if (!userId || !token) {
      toast.error("Please log in to add items to the cart");
      return; // Stop execution immediately
    }
  
    let productId = product._id;
    if (!productId) {
      console.error("Error: Product ID is undefined");
      toast.error("Error adding item to cart: Product ID missing");
      return;
    }
  
    try {
      const response = await axios.post(
        "http://localhost:5000/api/cart",
        {
          userId,
          productId,
          productName: product.name,
          price: product.price,
          quantity: 1,
          image: product.image || null,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
  
      if (response.status !== 200 && response.status !== 201) {
        throw new Error("Failed to add item to the cart");
      }
  
      toast.success(`1 ${product.name} added to the cart!`);
      addToCart(response.data); // Ensure this correctly updates the cart context
    } catch (error) {
      console.error("Error adding to cart:", error);
      toast.error("Failed to add item to the cart");
    }
  };
  
  const handleQuantityChange = async (productId, action) => {
    console.log("handleQuantityChange called for:", productId, "Action:", action);
  
    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("Failed to update the quantity. Please log in.");
      return;
    }
  
    const cartItem = cartItems.find((item) => item.productId === productId);
    console.log("Found cart item:", cartItem);
  
    if (!cartItem) {
      console.error("Product not found in cart.");
      toast.error("Product not found in cart.");
      return;
    }
  
    const newQuantity = action === "increment" ? cartItem.quantity + 1 : cartItem.quantity - 1;
    if (newQuantity < 1) return;
  
    try {
      console.log("Sending request to update quantity...");
      const response = await axios.put(
        `http://localhost:5000/api/cart/${cartItem._id}`, // Make sure _id exists
        { quantity: newQuantity },
        { headers: { Authorization: `Bearer ${token}` } }
      );
  
      if (response.status !== 200) {
        throw new Error("Failed to update cart");
      }
  
      // Update frontend state
      console.log("Updating cart state...");
      setCartItems((prevCart) =>
        prevCart.map((item) =>
          item._id === cartItem._id ? { ...item, quantity: newQuantity } : item
        )
      );
  
      toast.success(`Quantity updated to ${newQuantity}`);
    } catch (error) {
      console.error("Error updating quantity:", error);
      toast.error("Failed to update quantity");
    }
  };
  

  return (
    <section>
      <h4 style={{ margin: "60px 20px", textAlign: "left", fontSize: "35px", fontWeight: 1000 }}>
        Best Seller
      </h4>
      <div id="rec" className="nav-deals-main">
        {deals.map((deal) => {
          const cartItem = cartItems.find((item) => item.productId === deal._id);
          const quantity = cartItem ? cartItem.quantity : 0;

          return (
            <div key={deal._id} className="nav-rec-cards">
              <div className="card-img" onClick={() => handleProductClick(deal)}>
                <img src={deal.image} alt={deal.name} />
              </div>
              <div className="card-title" onClick={() => handleProductClick(deal)}>
                {deal.name}
              </div>
              <div className="card-price">ETB {deal.price}</div>
              <div className="card-bottom">
                <div className="card-counter">
                  <button
                    className="counter-btn"
                    disabled={quantity <= 0}
                    onClick={() => handleQuantityChange(deal._id, "decrement")}
                  >
                    -
                  </button>
                  <span className="counter-value">{quantity}</span>
                  <button
                    className="counter-btn"
                    onClick={() => handleQuantityChange(deal._id, "increment")}
                  >
                    +
                  </button>
                </div>
                <i
                  className="cart-icon fa fa-shopping-cart"
                  onClick={() => handleAddToCart(deal)}
                  style={{ cursor: "pointer" }}
                ></i>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default BestSeller;
