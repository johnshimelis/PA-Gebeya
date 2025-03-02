import React, { useState, useEffect } from "react";
import "../styles/recommended.css";
import { useNavigate } from "react-router-dom";
import { useCart } from "../components/CartContext";
import { toast } from "react-toastify";
import axios from "axios";

const RecommendedDeals = () => {
  const { addToCart, updateQuantity, cartItems, setCartItems } = useCart();
  const navigate = useNavigate();
  const [deals, setDeals] = useState([]);
  const [refresh, setRefresh] = useState(false);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await axios.get("http://localhost:5000/api/products");
        const nonDiscountedProducts = response.data.filter(product => !product.discount);
        setDeals(nonDiscountedProducts);
      } catch (error) {
        console.error("Error fetching products:", error);
      }
    };
    fetchProducts();
  }, [refresh]);

  const handleProductClick = (deal) => {
    // Store product details in local storage
    localStorage.setItem("selectedProduct", JSON.stringify(deal));
    console.log("Product stored in localStorage:", deal);

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

    const formData = new FormData();
    formData.append("userId", userId);
    formData.append("productId", productId);
    formData.append("productName", product.name);
    formData.append("price", product.price);
    formData.append("quantity", 1);

    if (product.image) {
      formData.append("image", product.image);
    }

    try {
      const response = await fetch("http://localhost:5000/api/cart", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const responseData = await response.json();

      if (!response.ok) {
        throw new Error(`Failed to add item: ${responseData.error}`);
      }

      toast.success(`${product.name} added to the cart!`);

      // Refresh the cart
      const updatedCart = await axios.get("http://localhost:5000/api/cart", {
        headers: { Authorization: `Bearer ${token}` },
      });

      setCartItems(updatedCart.data.items);
    } catch (error) {
      console.error("Error adding to cart:", error);
      toast.error(error.message);
    }
  };

  const handleUpdateQuantity = async (productId, currentQuantity, increment) => {
    const newQuantity = increment ? currentQuantity + 1 : currentQuantity - 1;
  
    if (newQuantity <= 0) return;
  
    try {
      const token = localStorage.getItem("token");
  
      const response = await axios.put(
        `http://localhost:5000/api/cart/${productId}`,
        { quantity: newQuantity },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
  
      if (response.status === 200) {
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
        Recommended for you
      </h4>
      <div id="rec" className="nav-deals-main">
        {deals.map((deal) => {
          const cartItem = cartItems.find((item) => item.productId._id === deal._id);
          const quantity = cartItem ? cartItem.quantity : 0;

          return (
            <div key={deal._id} className="nav-rec-cards">
              <div className="card-img" onClick={() => handleProductClick(deal)}>
                <img src={`http://localhost:5000/uploads/${deal.image}`} alt={deal.name} />
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
                    onClick={() => handleUpdateQuantity(deal._id, quantity, false)}
                  >
                    -
                  </button>
                  <span className="counter-value">{quantity}</span>
                  <button
                    className="counter-btn"
                    onClick={() => handleUpdateQuantity(deal._id, quantity, true)}
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

export default RecommendedDeals;
