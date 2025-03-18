import React, { useState, useEffect } from "react";
import "../styles/recommended.css";
import { useNavigate } from "react-router-dom";
import { useCart } from "../components/CartContext";
import { toast } from "react-toastify";
import axios from "axios";

const RecommendedDeals = () => {
  const { addToCart, cartItems, setCartItems } = useCart();
  const navigate = useNavigate();
  const [deals, setDeals] = useState([]);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await axios.get("https://pa-gebeya-backend.onrender.com/api/products");
        const nonDiscountedProducts = response.data.filter(product => !product.discount);
        setDeals(nonDiscountedProducts);
      } catch (error) {
        console.error("Error fetching products:", error);
      }
    };
    fetchProducts();
  }, []);

  const handleProductClick = (deal) => {
    // Add a status property to the product object
    const productWithStatus = {
      ...deal, // Spread the existing product properties
      status: "Recommended", // Add the status property
    };

    // Store the product details in localStorage under the key "Stored Product"
    localStorage.setItem("Stored Product", JSON.stringify(productWithStatus));

    // Log the stored product details to the console
    console.log("Product stored in localStorage:", productWithStatus);

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

    const cartItem = {
      userId,
      productId,
      productName: product.name,
      price: product.price,
      quantity: 1,
      img: `https://pa-gebeya-backend.onrender.com/uploads/${product.image}`, // Send the image URL directly
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

  return (
    <section>
      <h4 style={{ margin: "60px 20px", textAlign: "left", fontSize: "35px", fontWeight: 1000 }}>
        Recommended for you
      </h4>
      <div id="rec" className="nav-deals-main">
        {deals.map((deal) => (
          <div key={deal._id} className="nav-rec-cards" onClick={() => handleProductClick(deal)}>
            <div className="card-img">
              <img src={`https://pa-gebeya-backend.onrender.com/uploads/${deal.image}`} alt={deal.name} />
            </div>
            <div className="card-content">
              <div className="card-header">
                <span className="best-seller-tags">Recommended</span>
                <span className="product-name">{deal.name}</span>
              </div>
              {/* Add shortDescription with a fallback */}
              {deal.shortDescription ? (
                <p className="short-description">{deal.shortDescription}</p>
              ) : (
                <p className="short-description">No description available.</p>
              )}
              <div className="card-rating">
                <div className="stars">
                  {Array.from({ length: 5 }, (_, index) => (
                    <span
                      key={index}
                      className={`star ${index < 5 ? "filled" : ""}`}
                    >
                      ★
                    </span>
                  ))}
                </div>
                <span className="rating-number">| 5</span>
                <span className="sold-count">| {deal.sold}+ sold</span>
              </div>
              <div className="card-price">ETB {deal.price}</div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default RecommendedDeals;