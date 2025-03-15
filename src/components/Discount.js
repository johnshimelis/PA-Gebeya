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
        const response = await axios.get("https://pa-gebeya-backend.onrender.com/api/products/discounted");
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
    const productDetails = {
      _id: deal._id,
      name: deal.name,
      category: deal.category,
      createdAt: deal.createdAt,
      discount: deal.discount,
      fullDescription: deal.fullDescription,
      hasDiscount: deal.hasDiscount,
      image: deal.image,
      photo: deal.photo,
      price: deal.price,
      shortDescription: deal.shortDescription,
      sold: deal.sold,
      stockQuantity: deal.stockQuantity,
      updatedAt: deal.updatedAt,
      __v: deal.__v,
    };
    localStorage.setItem("productDetail", JSON.stringify(productDetails));
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

        setCartItems(updatedCart.data.items);
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
    if (newQuantity <= 0) return;

    try {
      const token = localStorage.getItem("token");
      const response = await axios.put(
        `https://pa-gebeya-backend.onrender.com/api/cart/${productId}`,
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

  if (loading) return <p>Loading discounted products...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <section>
      <h4 style={{ margin: "60px 20px", textAlign: "left", fontSize: "35px", fontWeight: 1000 }}>
        Discount
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
              <div className="calculated-price">ETB {deal.calculatedPrice}</div>
              <div className="card-pricing">
                <span className="original-price">ETB {deal.originalPrice}</span>
                <span className="discount" style={{ marginLeft: "10px" }}>
                  {deal.discount}% OFF
                </span>
              </div>
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

export default Discount;