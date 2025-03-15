import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import { useCart } from "../components/CartContext"; // Ensure you have access to the cart context
import { toast } from "react-toastify"; // Import toast
import { useAuth } from "../components/AuthContext"; // Import useAuth to access the user
import "../styles/product.css";

const ProductsPage = () => {
  const { category } = useParams(); // Get the category ID from the URL
  const navigate = useNavigate();
  const { addToCart, updateQuantity, cartItems = [], setCartItems } = useCart(); // Default cartItems to an empty array
  const { user } = useAuth(); // Access the user from AuthContext
  const [products, setProducts] = useState([]); // State to store fetched products
  const [loading, setLoading] = useState(true); // Loading state
  const [error, setError] = useState(null); // Error state

  // Fetch products by category whenever the category changes
  useEffect(() => {
    const fetchProductsByCategory = async () => {
      setLoading(true);
      setError(null);

      try {
        console.log("Fetching products for category ID:", category); // Log the category ID
        const response = await axios.get(
          `https://pa-gebeya-backend.onrender.com/api/products/category/${category}`
        );
        if (response.status === 200) {
          setProducts(response.data);
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
  }, [category]);

  // Debugging: Check if cartItems are being passed correctly
  useEffect(() => {
    console.log("Cart Items in ProductsPage:", cartItems);
  }, [cartItems]);

  const handleProductClick = (product) => {
    navigate("/product_detail", { state: { product } });
  };

  const handleQuantityUpdate = (uniqueId, quantity) => {
    if (quantity > 0) {
      updateQuantity(uniqueId, quantity);
    }
  };

  const handleAddToCart = async (product) => {
    const userId = localStorage.getItem("userId");
    const token = localStorage.getItem("token");

    console.log("Retrieved userId:", userId);
    console.log("Retrieved Token:", token);
    console.log("Product Data:", product);

    if (!userId || !token) {
      toast.error("Please log in to add items to the cart");
      return;
    }

    let productId = product._id || product.id;
    if (!productId) {
      console.error("Error: Product ID is undefined");
      toast.error("Error adding item to cart: Product ID missing");
      return;
    }

    // Create the cart item payload
    const cartItem = {
      userId,
      productId,
      productName: product.title || product.name || "Unnamed Product",
      price: product.price,
      quantity: 1,
      img: product.image, // Use the image URL directly
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

  if (loading) {
    return <p>Loading products...</p>;
  }

  if (error) {
    return <p style={{ color: "red", textAlign: "center" }}>{error}</p>;
  }

  return (
    <section>
      <h2 style={{ margin: "40px 20px", textAlign: "left", fontSize: "28px", fontWeight: 900 }}>
        {products.length > 0 ? products[0].category : "Products"}
      </h2>
      <div className="product-grid">
        {products.map((product) => {
          const cartItem = cartItems.find((item) => item.productId === product._id) || { quantity: 0 };
          const uniqueId = `${product._id}-${cartItem.id}`;

          return (
            <div key={product._id} className="product-card">
              <div className="card-img" onClick={() => handleProductClick(product)}>
                <img src={product.image} alt={product.name} />
              </div>
              <div className="card-title" onClick={() => handleProductClick(product)}>
                {product.name}
              </div>
              <div className="card-price">AED {product.price}</div>
              {product.hasDiscount && (
                <div className="card-pricing">
                  <span className="original-price">AED {product.price + (product.price * product.discount) / 100}</span>
                  <span className="discount">{product.discount}% off</span>
                </div>
              )}
              <div className="quantity-control">
                <button
                  onClick={() => handleQuantityUpdate(uniqueId, cartItem.quantity - 1)}
                  disabled={cartItem.quantity <= 1}
                >
                  -
                </button>
                <span>{cartItem.quantity}</span>
                <button onClick={() => handleQuantityUpdate(uniqueId, cartItem.quantity + 1)}>
                  +
                </button>
              </div>
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
          );
        })}
      </div>
    </section>
  );
};

export default ProductsPage;