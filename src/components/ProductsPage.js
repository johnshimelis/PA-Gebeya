import React, { useEffect } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import { useCart } from "../components/CartContext"; // Ensure you have access to the cart context
import { toast } from "react-toastify"; // Import toast
import { useAuth } from "../components/AuthContext"; // Import useAuth to access the user
import "../styles/product.css";
import recCard1 from "../images/assets/babys.png";
import recCard2 from "../images/assets/e-1.png";
import recCard3 from "../images/assets/e-2.png";
import recCard4 from "../images/assets/e-3.png";
import recCard5 from "../images/assets/e-5.png";

// Simulate products for categories
const allProducts = {
  electronics: [
    { id: 1, img: recCard1, title: "iPhone 14 Pro Max", price: 4399.00, originalPrice: 5099, discount: "13% off" },
    { id: 2, img: recCard2, title: "Samsung Galaxy S23", price: 3599.00, originalPrice: 4299, discount: "16% off" },
    { id: 3, img: recCard3, title: "Sony Headphones", price: 499.00, originalPrice: 699, discount: "28% off" },
  ],
  men: [
    { id: 4, img: recCard4, title: "Men's Leather Jacket", price: 1299.00, originalPrice: 1599, discount: "19% off" },
    { id: 5, img: recCard5, title: "Nike Running Shoes", price: 899.00, originalPrice: 1099, discount: "18% off" },
  ],
};

const ProductsPage = () => {
  const { category } = useParams();
  const navigate = useNavigate();
  const { addToCart, updateQuantity, cartItems = [] } = useCart(); // Default cartItems to an empty array
  const { user } = useAuth(); // Access the user from AuthContext
  const products = allProducts[category] || [];

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
    if (typeof productId === "number") {
        productId = `67b91922c5d356b58cffb658`;
    }

    // Create FormData
    const formData = new FormData();
    formData.append("userId", userId);
    formData.append("productId", String(productId));
    formData.append("productName", product.title || product.name || "Unnamed Product");
    formData.append("price", product.price);
    formData.append("quantity", 1);

    // Handle Image Upload
    if (product.file instanceof File && product.file.size > 0) {
        formData.append("image", product.file);
        console.log("✅ Image sent as file:", product.file);
    } else if (typeof product.img === "string" && product.img.trim() !== "") {
        try {
            const response = await fetch(product.img);
            const blob = await response.blob();
            if (blob.size > 0) {
                const file = new File([blob], "product_image.jpg", { type: blob.type });
                formData.append("image", file);
                console.log("✅ Image sent as downloaded file:", file);
            } else {
                console.warn("⚠️ Downloaded image is empty, skipping upload.");
            }
        } catch (error) {
            console.error("❌ Error converting image URL to file:", error);
        }
    } else {
        console.warn("⚠️ No valid image provided. Skipping image upload.");
    }

    // **LOG FORM DATA PROPERLY**
    console.log("🔹 Final Request Payload:");
    for (const [key, value] of formData.entries()) {
        console.log(`   ${key}:`, value);
    }

    try {
        const response = await fetch("http://localhost:5000/api/cart", {
            method: "POST",
            headers: {
                Authorization: `Bearer ${token}`, // NO "Content-Type", let browser set it
            },
            body: formData, // Send as FormData
        });

        const responseData = await response.json();
        console.log("🔹 Server Response:", responseData);

        if (!response.ok) {
            console.error("❌ Server Response Error:", responseData);
            throw new Error(`Failed to add item: ${responseData.error}`);
        }

        toast.success("Item added to cart!");
        addToCart(responseData);
    } catch (error) {
        console.error("❌ Error adding to cart:", error);
        toast.error(error.message);
    }
};



  
  
  return (
    <section>
      <h2 style={{ margin: "40px 20px", textAlign: "left", fontSize: "28px", fontWeight: 900 }}>
        {category.toUpperCase()} Products
      </h2>
      <div className="nav-deals-main">
        {products.length > 0 ? (
          products.map((product) => {
            const cartItem = cartItems.find((item) => item.productId === product.id) || { quantity: 0 };
            const uniqueId = `${product.id}-${cartItem.id}`;

            return (
              <div key={product.id} className="nav-rec-cards">
                <div className="card-img" onClick={() => handleProductClick(product)}>
                  <img src={product.img} alt={product.title} />
                </div>
                <div className="card-title" onClick={() => handleProductClick(product)}>
                  {product.title}
                </div>
                <div className="card-price">AED {product.price}</div>
                <div className="card-pricing">
                  <span className="original-price">AED {product.originalPrice}</span>
                  <span className="discount">{product.discount}</span>
                </div>
                <div className="quantity-control">
                  <button
                    onClick={() => handleQuantityUpdate(cartItem.uniqueId, cartItem.quantity - 1)}
                    disabled={cartItem.quantity <= 1}
                  >
                    -
                  </button>
                  <span>{cartItem.quantity}</span>
                  <button onClick={() => handleQuantityUpdate(cartItem.uniqueId, cartItem.quantity + 1)}>
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
          })
        ) : (
          <p style={{ textAlign: "center", fontSize: "18px" }}>No products available for this category.</p>
        )}
      </div>
    </section>
  );
};

export default ProductsPage;
