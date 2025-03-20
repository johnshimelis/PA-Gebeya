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

  // Helper function to format the sold count
  const formatSoldCount = (sold) => {
    if (sold < 10) {
      return `${sold} sold`;
    } else if (sold >= 10 && sold < 20) {
      return "10+ sold";
    } else if (sold === 20) {
      return "20 sold";
    } else if (sold > 20 && sold < 30) {
      return "20+ sold";
    } else {
      // Handle cases where sold is 30 or more
      return `${Math.floor(sold / 10) * 10}+ sold`;
    }
  };

  const handleProductClick = (deal) => {
    const productWithStatus = {
      ...deal,
      status: "Recommended",
      category: deal.category ? deal.category.name : "Uncategorized", // Handle null/undefined category
    };

    localStorage.setItem("Stored Product", JSON.stringify(productWithStatus));
    console.log("Product stored in localStorage:", productWithStatus);

    navigate("/product_detail", { state: { product: productWithStatus } });
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
      img: product.photo, // Use the `photo` field for the image URL
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
              {/* Use the `photo` field for the image URL */}
              <img src={deal.photo} alt={deal.name} />
            </div>
            <div className="card-content">
              <div className="card-header">
                <span className="best-seller-tags">Recommended</span>
                <span className="product-name">{deal.name}</span>
              </div>
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
                <span className="sold-count">| {formatSoldCount(deal.sold)}</span>
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