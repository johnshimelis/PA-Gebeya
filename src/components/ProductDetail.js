import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useCart } from "../components/CartContext"; // Import Cart Context
import { toast } from "react-toastify"; // Import toast for notifications
import axios from "axios"; // Import axios for API requests
import "../styles/ProductDetails.css";

const ProductDetails = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { addToCart, cartItems, setCartItems } = useCart(); // Use the cart context function

  const [product, setProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    const storedProduct = localStorage.getItem("productDetail");
    if (storedProduct) {
      const parsedProduct = JSON.parse(storedProduct);
      console.log("Stored Product:", parsedProduct); // Debugging
      setProduct(parsedProduct);
    }
  }, []);

  useEffect(() => {
    // Retrieve product data from local storage if not in location.state
    const storedProduct = localStorage.getItem("selectedProduct");
    if (location.state?.product) {
      setProduct(location.state.product);
      localStorage.setItem("selectedProduct", JSON.stringify(location.state.product));
    } else if (storedProduct) {
      setProduct(JSON.parse(storedProduct));
    }
  }, [location.state]);

  const handleAddToCart = async () => {
    const userId = localStorage.getItem("userId");
    const token = localStorage.getItem("token");

    if (!userId || !token) {
      toast.error("Please log in to add items to the cart");
      return;
    }

    if (!product) {
      toast.error("Error: No product data available.");
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
      quantity: quantity, // Use the selected quantity
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

        setCartItems(updatedCart.data.items); // Update the cart in the state
      } else {
        throw new Error("Failed to add item to cart");
      }
    } catch (error) {
      console.error("Error adding to cart:", error);
      toast.error(error.message);
    }
  };

  const handleQuantityChange = (delta) => {
    setQuantity((prevQuantity) => Math.max(1, prevQuantity + delta));
  };

  if (!product) {
    return <p>Loading product details...</p>;
  }

  // Function to get the correct image URL
  const getImageUrl = (imagePath) => {
    if (imagePath.startsWith("http")) {
      return imagePath;
    } else {
      return `https://pa-gebeya-backend.onrender.com/uploads/${imagePath}`;
    }
  };

  return (
    <div className="product-details">
      <div className="left-section">
        <div className="main-image-container">
          <img
            className="main-image"
            src={getImageUrl(product.photo || product.image)}
            alt={product.name}
          />
          <img
            className="small-image"
            src={getImageUrl(product.photo || product.image)}
            alt="Thumbnail"
          />
        </div>
      </div>

      <div className="right-section">
        <h1 className="product-title">{product.name}</h1>
        <p className="short-description">{product.shortDescription}</p>
        <p className="full-description">{product.fullDescription}</p>

        <div className="info-section">
          <div className="price-counter-row">
            <p className="price">{product.price} ETB</p>
            <div className="quantity-selector">
              <button onClick={() => handleQuantityChange(-1)}>-</button>
              <span>{quantity}</span>
              <button onClick={() => handleQuantityChange(1)}>+</button>
            </div>
          </div>

          <div className="button-row">
            <button className="add-to-cart" onClick={handleAddToCart}>
              🛒 Add to Cart
            </button>
            <button className="favorite">❤️</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;