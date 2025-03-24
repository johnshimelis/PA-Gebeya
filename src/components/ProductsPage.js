import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import { useCart } from "../components/CartContext";
import { toast } from "react-toastify";
import { useAuth } from "../components/AuthContext";
import "react-responsive-carousel/lib/styles/carousel.min.css";
import { Carousel } from "react-responsive-carousel";
import "../styles/product.css";
import tiktokIcon from "../images/assets/tiktok.png";

const ProductsPage = () => {
  const { category: categoryId } = useParams();
  const navigate = useNavigate();
  const { addToCart, cartItems = [], setCartItems } = useCart();
  const { user } = useAuth();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [categoryName, setCategoryName] = useState("");

  const formatSoldCount = (sold) => {
    const soldCount = Number(sold) || 0;
    if (soldCount === 0) return "0 sold";
    if (soldCount < 10) return `${soldCount} sold`;
    if (soldCount < 20) return "10+ sold";
    if (soldCount === 20) return "20 sold";
    if (soldCount < 30) return "20+ sold";
    return `${Math.floor(soldCount / 10) * 10}+ sold`;
  };

  const renderRatingStars = (rating) => {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    const stars = [];

    for (let i = 0; i < fullStars; i++) {
      stars.push(<span key={i} className="products-page-star filled">&#9733;</span>);
    }

    if (hasHalfStar) {
      stars.push(<span key="half" className="products-page-star half">&#9733;</span>);
    }

    const remainingStars = 5 - stars.length;
    for (let i = 0; i < remainingStars; i++) {
      stars.push(<span key={`empty-${i}`} className="products-page-star">&#9733;</span>);
    }

    return stars;
  };

  useEffect(() => {
    const fetchProductsByCategory = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await axios.get(
          `https://pa-gebeya-backend.onrender.com/api/products/category/${categoryId}`
        );
        
        if (response.status === 200) {
          // Updated to match backend response structure
          setProducts(response.data.products || []);
          setCategoryName(response.data.categoryName || "");
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
      status: `${categoryName} Product`,
    };
    localStorage.setItem("Stored Product", JSON.stringify(productWithStatus));
    navigate("/product_detail", { state: { product: productWithStatus } });
  };

  const handleAddToCart = async (product) => {
    const userId = localStorage.getItem("userId");
    const token = localStorage.getItem("token");

    if (!userId || !token) {
      toast.error("Please log in to add items to the cart");
      return;
    }

    const productId = product._id;
    if (!productId) {
      toast.error("Error adding item to cart: Product ID missing");
      return;
    }

    const cartItem = {
      userId,
      productId,
      productName: product.name,
      price: product.price,
      quantity: 1,
      img: product.imageUrls?.[0] || product.photo || '/default-product-image.jpg',
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
        const updatedCart = await axios.get(
          "https://pa-gebeya-backend.onrender.com/api/cart",
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setCartItems(updatedCart.data.items);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
    }
  };

  if (loading) return <p>Loading products...</p>;
  if (error) return <p style={{ color: "red", textAlign: "center" }}>{error}</p>;

  return (
    <section>
      <h4 style={{ margin: "60px 20px", textAlign: "left", fontSize: "35px", fontWeight: 1000 }}>
        {categoryName || "Products"}
      </h4>
      <div className="products-page-product-grid">
        {products.length > 0 ? (
          products.map((product) => (
            <div key={product._id} className="products-page-product-card" onClick={() => handleProductClick(product)}>
              <div className="products-page-card-img">
                {product.videoLink && (
                  <div
                    className="products-page-tiktok-icon"
                    onClick={(e) => {
                      e.stopPropagation();
                      window.open(product.videoLink, "_blank");
                    }}
                  >
                    <img src={tiktokIcon} alt="TikTok" className="products-page-tiktok-img" />
                  </div>
                )}
                <Carousel
                  showThumbs={false}
                  showStatus={false}
                  infiniteLoop={true}
                  autoPlay={true}
                  interval={3000}
                  stopOnHover={true}
                >
                  {product.imageUrls?.length > 0 ? (
                    product.imageUrls.map((imageUrl, index) => (
                      <div key={index} className="products-page-carousel-image-container">
                        <img 
                          src={imageUrl} 
                          alt={`Product ${index}`} 
                          className="products-page-carousel-image"
                          onError={(e) => {
                            e.target.src = '/default-product-image.jpg';
                          }}
                        />
                      </div>
                    ))
                  ) : (
                    <div className="products-page-carousel-image-container">
                      <img 
                        src="/default-product-image.jpg" 
                        alt={product.name} 
                        className="products-page-carousel-image" 
                      />
                    </div>
                  )}
                </Carousel>
              </div>
              <div className="products-page-card-content">
                <div className="products-page-card-header">
                  <span className="products-page-best-seller-tags">{categoryName} Product</span>
                  <span className="products-page-product-name">{product.name}</span>
                </div>
                <p className="products-page-short-description">
                  {product.shortDescription || "No description available."}
                </p>
                <div className="products-page-card-rating">
                  <div className="products-page-stars">
                    {renderRatingStars(product.rating || 0)}
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
          ))
        ) : (
          <p style={{ textAlign: "center", width: "100%" }}>No products found in this category.</p>
        )}
      </div>
    </section>
  );
};

export default ProductsPage;