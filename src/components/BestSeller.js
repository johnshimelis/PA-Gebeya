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
        const response = await fetch("https://pa-gebeya-backend.onrender.com/api/products/bestsellers"); // Updated URL
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

    if (!userId || !token) {
      toast.error("Please log in to add items to the cart");
      return;
    }

    let productId = product._id;
    if (!productId) {
      console.error("Error: Product ID is undefined");
      toast.error("Error adding item to cart: Product ID missing");
      return;
    }

    // Replace the base URL in the image path
    const imageUrl = product.image.replace(
      "https://pa-gebeya-backend.onrender.com",
      "https://pa-gebeya-backend.onrender.com"
    );

    const cartItem = {
      userId,
      productId,
      productName: product.name,
      price: product.price,
      quantity: 1,
      img: imageUrl, // Use the updated image URL
    };

    try {
      const response = await axios.post(
        "https://pa-gebeya-backend.onrender.com/api/cart",
        cartItem,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.status === 200) {
        toast.success(`${product.name} added to the cart!`);

        // Refresh the cart
        const updatedCart = await axios.get("https://pa-gebeya-backend.onrender.com/api/cart", {
          headers: { Authorization: `Bearer ${token}` },
        });

        setCartItems(updatedCart.data.items); // Update the cart in the state
      } else {
        throw new Error("Failed to add item to cart");
      }
    } catch (error) {
      console.error("Error adding to cart:", error);
      toast.error(error.message);
    }
  };

  const handleUpdateQuantity = async (productId, currentQuantity, increment) => {
    const newQuantity = increment ? currentQuantity + 1 : currentQuantity - 1;

    // Prevent negative quantity
    if (newQuantity <= 0) return;

    try {
      const token = localStorage.getItem("token");

      // Send the new quantity to the backend
      const response = await axios.put(
        `https://pa-gebeya-backend.onrender.com/api/cart/${productId}`,
        { quantity: newQuantity },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.status === 200) {
        // Update the frontend state for cart items
        setCartItems((prevCart) =>
          prevCart.map((item) =>
            item.productId._id === productId ? { ...item, quantity: newQuantity } : item
          )
        );

        toast.success(`Quantity updated to ${newQuantity}`);
      } else {
        throw new Error("Failed to update quantity in the backend");
      }
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
          const cartItem = cartItems.find((item) => item.productId._id === deal._id);
          const quantity = cartItem ? cartItem.quantity : 0;

          return (
            <div key={deal._id} className="nav-rec-cards">
              <div className="card-img" onClick={() => handleProductClick(deal)}>
                <img
                  src={deal.image.replace(
                    "https://pa-gebeya-backend.onrender.com",
                    "https://pa-gebeya-backend.onrender.com"
                  )}
                  alt={deal.name}
                />
              </div>
              <div className="card-title" onClick={() => handleProductClick(deal)}>
                {deal.name}
              </div>
              <div className="card-price">ETB {deal.price}</div>
              <div className="card-bottom">
                <div className="card-counter">
                  <button
                    className="counter-btn"
                    disabled={quantity <= 0} // Disable "-" button if quantity is zero
                    onClick={() => handleUpdateQuantity(deal._id, quantity, false)} // Decrement
                  >
                    -
                  </button>
                  <span className="counter-value">{quantity}</span> {/* Show current quantity */}
                  <button
                    className="counter-btn"
                    onClick={() => handleUpdateQuantity(deal._id, quantity, true)} // Increment
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