import React, { useState, useEffect } from "react";
import "../styles/discount.css";
import { useNavigate } from "react-router-dom";
import { useCart } from "../components/CartContext";
import { toast } from "react-toastify";
import axios from "axios";

const Discount = () => {
  const { addToCart, updateQuantity, cartItems, setCartItems } = useCart();
  const navigate = useNavigate();

  const [deals, setDeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDiscountedProducts = async () => {
      try {
        const response = await axios.get("http://localhost:5000/api/products/discounted");
        if (response.status !== 200) throw new Error("Failed to fetch products");
        const filteredDeals = response.data.filter(product => product.hasDiscount && product.discount > 0);
        setDeals(filteredDeals);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchDiscountedProducts();
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
  
    const formData = new FormData();
    formData.append("userId", userId);
    formData.append("productId", productId);
    formData.append("productName", product.name);
    formData.append("price", product.calculatedPrice);
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
  
      const existingItem = cartItems.find((item) => item._id === product._id);
      const updatedQuantity = existingItem ? existingItem.quantity + 1 : 1;
  
      toast.success(`${updatedQuantity} ${product.name} Added to The Cart!`);
  
      addToCart(responseData);
    } catch (error) {
      console.error("Error adding to cart:", error);
      toast.error(error.message);
    }
  };
  
  const handleUpdateQuantity = async (productId, newQuantity) => {
    if (newQuantity < 1) return;
  
    try {
      const token = localStorage.getItem("token");
  
      await axios.put(
        `http://localhost:5000/api/cart/${productId}`,
        { quantity: newQuantity },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
  
      setCartItems((prevCart) =>
        prevCart.map((item) =>
          item.productId === productId ? { ...item, quantity: newQuantity } : item
        )
      );
  
      toast.success(`Quantity updated to ${newQuantity}`);
    } catch (error) {
      console.error("Error updating quantity:", error);
      toast.error("Failed to update quantity");
    }
  };

  if (loading) return <p>Loading discounted products...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <section>
      <h4 style={{ margin: "60px 20px", textAlign: "left", fontSize: "35px", fontWeight: 1000 }}>
        Discount
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
              <div className="calculated-price">ETB {deal.calculatedPrice}</div>
              <div className="card-pricing">
                <span className="original-price">ETB {deal.originalPrice}</span>
                <span className="discount" style={{ marginLeft: "10px" }}>{deal.discount}% OFF</span>
              </div>
              <div className="card-bottom">
                <div className="card-counter">
                  <button
                    className="counter-btn"
                    disabled={quantity <= 0}
                    onClick={() => handleUpdateQuantity(deal._id, quantity - 1)}
                  >
                    -
                  </button>
                  <span className="counter-value">{quantity}</span>
                  <button
                    className="counter-btn"
                    onClick={() => handleUpdateQuantity(deal._id, quantity + 1)}
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

export default Discount;
