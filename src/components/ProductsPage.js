import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import { useCart } from "../components/CartContext";
import { toast } from "react-toastify";
import { useAuth } from "../components/AuthContext";
import "../styles/product.css";

const ProductsPage = () => {
  const { category: categoryId } = useParams(); // Rename to categoryId for clarity
  const navigate = useNavigate();
  const { addToCart, updateQuantity, cartItems = [], setCartItems } = useCart();
  const { user } = useAuth();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [categoryName, setCategoryName] = useState(""); // State to store the category name

  // Helper function to format the sold count
  const formatSoldCount = (sold) => {
    // Ensure sold is a valid number, default to 0 if not
    const soldCount = Number(sold) || 0;

    if (soldCount === 0) {
      return "0 sold"; // If sold is 0, return "0 sold"
    } else if (soldCount >= 1 && soldCount <= 10) {
      return `${soldCount} sold`; // If sold is between 1 and 10, return the exact number
    } else if (soldCount >= 11 && soldCount < 20) {
      return "10+ sold"; // If sold is between 11 and 19, return "10+ sold"
    } else if (soldCount === 20) {
      return "20 sold"; // If sold is exactly 20, return "20 sold"
    } else if (soldCount >= 21 && soldCount < 30) {
      return "20+ sold"; // If sold is between 21 and 29, return "20+ sold"
    } else {
      // For numbers 30 and above, return the nearest lower multiple of 10 followed by "+"
      const base = Math.floor(soldCount / 10) * 10;
      return `${base}+ sold`;
    }
  };

  useEffect(() => {
    const fetchProductsByCategory = async () => {
      setLoading(true);
      setError(null);

      try {
        // Fetch products by category ID
        const response = await axios.get(
          `https://pa-gebeya-backend.onrender.com/api/products/category/${categoryId}`
        );
        if (response.status === 200) {
          setProducts(response.data);

          // Extract the category name from the first product (if available)
          if (response.data.length > 0) {
            setCategoryName(response.data[0].category); // Assuming the category name is in the product object
          }
        } else {
          throw new Error("Failed to fetch products");
        }
      } catch (error) {
        console.error("Error fetching products:", error);
        setError(error.response?.data?.message || "Failed to fetch products. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchProductsByCategory();
  }, [categoryId]);

  const handleProductClick = (product) => {
    const productWithStatus = {
      ...product,
      status: `${categoryName} Product`, // Use the category name in the status
    };
    localStorage.setItem("Stored Product", JSON.stringify(productWithStatus));
    navigate("/product_detail", { state: { product } });
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

  if (loading) {
    return <p>Loading products...</p>;
  }

  if (error) {
    return <p style={{ color: "red", textAlign: "center" }}>{error}</p>;
  }

  return (
    <section>
      <h4 style={{ margin: "60px 20px", textAlign: "left", fontSize: "35px", fontWeight: 1000 }}>
        {categoryName || "Products"} {/* Display the category name */}
      </h4>
      <div className="product-grid">
        {products.map((product) => {
          console.log("Image URL:", product.photo); // Log the image URL
          return (
            <div key={product._id} className="product-card" onClick={() => handleProductClick(product)}>
              <div className="card-img">
                {/* Use the `photo` field for the image URL */}
                <img src={product.photo} alt={product.name} />
              </div>
              <div className="card-content">
                <div className="card-header">
                  <span className="best-seller-tags">{categoryName} Product</span> {/* Tag before product name */}
                  <span className="product-name">{product.name}</span> {/* Product name with ellipsis */}
                </div>
                {product.shortDescription ? (
                  <p className="short-description">{product.shortDescription}</p>
                ) : (
                  <p className="short-description">No description available.</p>
                )}
                <div className="card-rating">
                  <div className="stars">
                    {Array.from({ length: 5 }, (_, index) => (
                      <span key={index} className={`star ${index < 5 ? "filled" : ""}`}>★</span>
                    ))}
                  </div>
                  <span className="rating-number">| 5</span>
                  <span className="sold-count">| {formatSoldCount(product.sold)}</span>
                </div>
                <div className="card-price">ETB {product.price.toFixed(2)}</div>
                <button
                  className="add-to-cart"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleAddToCart(product);
                  }}
                >
                  Add to Cart
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default ProductsPage;