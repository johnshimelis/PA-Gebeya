import React, { useState, useEffect } from "react";
import "../styles/recommended.css";
import recCard1 from "../images/assets/rec-card-1.avif";
import recCard2 from "../images/assets/rec-card-2.avif";
import recCard3 from "../images/assets/rec-card-3.avif";
import recCard4 from "../images/assets/rec-card-4.avif";
import recCard5 from "../images/assets/rec-card-5.avif";
import { useNavigate } from "react-router-dom";
import { useCart } from "../components/CartContext"; // Ensure you have access to the cart context
import { toast } from "react-toastify"; // Import toast

const Trending = () => {
  const { addToCart, updateQuantity, cartItems } = useCart(); // Cart context to add items
  const navigate = useNavigate(); // Used for page redirection

  const deals = [
    {
      id: 1,
      img: recCard1,
      title: "Apple iPhone 14 Pro Max 256GB Deep",
      price: "43990.00",
      originalPrice: "5099",
      discount: "13% off",
    },
    {
      id: 2,
      img: recCard2,
      title: "Apple iPhone 14 Pro Max 256GB Deep",
      price: "43990.00",
      originalPrice: "5099",
      discount: "13% off",
    },
    {
      id: 3,
      img: recCard3,
      title: "Apple iPhone 14 Pro Max 256GB Deep",
      price: "43990.00",
      originalPrice: "5099",
      discount: "13% off",
    },
    {
      id: 4,
      img: recCard4,
      title: "Apple iPhone 14 Pro Max 256GB Deep",
      price: "43990.00",
      originalPrice: "5099",
      discount: "13% off",
    },
    {
      id: 5,
      img: recCard5,
      title: "Apple iPhone 14 Pro Max 256GB Deep",
      price: "43990.00",
      originalPrice: "5099",
      discount: "13% off",
    },
  ];

  const handleProductClick = (deal) => {
    navigate("/product_detail", { state: { product: deal } });
  };

  const handleAddToCart = (deal) => {
    const existingCartItem = cartItems.find((item) => item.id === deal.id);

    if (existingCartItem) {
      // If the product already exists in the cart, update its quantity
      updateQuantity(existingCartItem.uniqueId, existingCartItem.quantity + 1);
      toast.success(`${existingCartItem.quantity + 1} ${deal.title} added to the cart`, {
        position: "top-center",
      });
    } else {
      // If it's a new product, add it to the cart with quantity 1
      addToCart({ ...deal, quantity: 1, uniqueId: `${deal.id}-${Date.now()}` });
      toast.success(`1 ${deal.title} added to the cart`, {
        position: "top-center",
      });
    }
  };

  const handleQuantityChange = (productId, action) => {
    const productInCart = cartItems.find((item) => item.id === productId);

    if (productInCart) {
      const newQuantity = action === "increment" ? productInCart.quantity + 1 : productInCart.quantity - 1;
      updateQuantity(productInCart.uniqueId, newQuantity);
    }
  };

  return (
    <section>
      <h4 style={{ margin: "60px 20px", textAlign: "left", fontSize: "35px", fontWeight: 1000 }}>
      Trending
      </h4>
      <div id="rec" className="nav-deals-main">
        {deals.map((deal) => {
          const cartItem = cartItems.find((item) => item.id === deal.id);
          const quantity = cartItem ? cartItem.quantity : 0;

          return (
            <div key={deal.id} className="nav-rec-cards">
              <div
                className="card-img"
                onClick={() => handleProductClick(deal)} // Redirect to ProductDetail on image click
              >
                <img src={deal.img} alt={deal.title} />
              </div>
              <div
                className="card-title"
                onClick={() => handleProductClick(deal)} // Redirect to ProductDetail on title click
              >
                {deal.title}
              </div>
              <div className="card-price">AED {deal.price}</div>
              <div className="card-pricing">
                <span className="original-price">AED {deal.originalPrice}</span>
                <span className="discount">{deal.discount}</span>
              </div>
              <div className="card-bottom">
                <div className="card-counter">
                  <button
                    className="counter-btn"
                    disabled={quantity <= 0}
                    onClick={() => handleQuantityChange(deal.id, "decrement")}
                  >
                    -
                  </button>
                  <span className="counter-value">{quantity}</span>
                  <button
                    className="counter-btn"
                    onClick={() => handleQuantityChange(deal.id, "increment")}
                  >
                    +
                  </button>
                </div>
                <i
                  className="cart-icon fa fa-shopping-cart"
                  onClick={() => handleAddToCart(deal)} // Add to cart on cart icon click
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

export default Trending;
