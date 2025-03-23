import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import { useCart } from "../components/CartContext";
import { toast } from "react-toastify";
import { useAuth } from "../components/AuthContext";
import "react-responsive-carousel/lib/styles/carousel.min.css"; // Import carousel styles
import { Carousel } from "react-responsive-carousel"; // Import Carousel component
import "../styles/product.css";
import tiktokIcon from "../images/assets/tiktok.png"; // Import TikTok icon

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
    const soldCount = Number(sold) || 0;

    if (soldCount === 0) {
      return "0 sold";
    } else if (soldCount >= 1 && soldCount <= 10) {
      return `${soldCount} sold`;
    } else if (soldCount >= 11 && soldCount < 20) {
      return "10+ sold";
    } else if (soldCount === 20) {
      return "20 sold";
    } else if (soldCount >= 21 && soldCount < 30) {
      return "20+ sold";
    } else {
      const base = Math.floor(soldCount / 10) * 10;
      return `${base}+ sold`;
    }
  };

  // Helper function to render rating stars
  const renderRatingStars = (rating) => {
    const fullStars = Math.floor(rating);
    const decimal = rating % 1;
    const stars = [];

    // Add full stars
    for (let i = 0; i < fullStars; i++) {
      stars.push(<span key={i} className="products-page-star filled">&#9733;</span>); // Full star
    }

    // Add half star if decimal is between 0.1 and 0.9
    if (decimal >= 0.1 && decimal <= 0.9) {
      stars.push(<span key="half" className="products-page-star half">&#9733;</span>); // Half star
    }

    // Fill the remaining stars with empty stars
    const remainingStars = 5 - stars.length;
    for (let i = 0; i < remainingStars; i++) {
      stars.push(<span key={`empty-${i}`} className="products-page-star">&#9733;</span>); // Empty star
    }

    return stars;
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

    // Use the first image as the thumbnail (or fallback to product.photo)
    const thumbnailImage = product.images && product.images.length > 0
      ? product.images[0] // Use the first image in the array
      : product.photo; // Fallback to the product's photo field

    const cartItem = {
      userId,
      productId,
      productName: product.name,
      price: product.price,
      quantity: 1,
      img: thumbnailImage, // Pass only one image URL as the thumbnail
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
      <div className="products-page-product-grid">
        {products.map((product) => (
          <div key={product._id} className="products-page-product-card" onClick={() => handleProductClick(product)}>
            <div className="products-page-card-img">
              {/* TikTok Icon for Video Link */}
              {product.videoLink && (
                <div
                  className="products-page-tiktok-icon"
                  onClick={(e) => {
                    e.stopPropagation(); // Prevent card click event
                    window.open(product.videoLink, "_blank"); // Open link in new tab
                  }}
                >
                  <img
                    src={tiktokIcon}
                    alt="TikTok"
                    className="products-page-tiktok-img"
                  />
                </div>
              )}
              {/* Auto-Scrolling Carousel for Images */}
              <Carousel
                showThumbs={false}
                showStatus={false}
                infiniteLoop={true}
                autoPlay={true}
                interval={3000}
                stopOnHover={true}
              >
                {product.images && product.images.length > 0 ? (
                  product.images.map((image, index) => (
                    <div key={index} className="products-page-carousel-image-container">
                      <img src={image} alt={`Product ${index}`} className="products-page-carousel-image" />
                    </div>
                  ))
                ) : (
                  <div className="products-page-carousel-image-container">
                    <img src={product.photo} alt={product.name} className="products-page-carousel-image" />
                  </div>
                )}
              </Carousel>
            </div>
            <div className="products-page-card-content">
              <div className="products-page-card-header">
                <span className="products-page-best-seller-tags">{categoryName} Product</span>
                <span className="products-page-product-name">{product.name}</span>
              </div>
              {product.shortDescription ? (
                <p className="products-page-short-description">{product.shortDescription}</p>
              ) : (
                <p className="products-page-short-description">No description available.</p>
              )}
              <div className="products-page-card-rating">
                <div className="products-page-stars">
                  {renderRatingStars(product.rating || 0)} {/* Default to 0 if rating is undefined */}
                </div>
                <span className="products-page-rating-number">| {product.rating || 0}</span>
                <span className="products-page-sold-count">| {formatSoldCount(product.sold)}</span>
              </div>
              <div className="products-page-card-price">ETB {product.price.toFixed(2)}</div>
              <button
                className="products-page-add-to-cart"
                onClick={(e) => {
                  e.stopPropagation();
                  handleAddToCart(product);
                }}
              >
                Add to Cart
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default ProductsPage;