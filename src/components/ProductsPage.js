import React, { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useCart } from "../components/CartContext"; // Ensure you have access to the cart context
import { toast } from "react-toastify"; // Import toast
import "../styles/product.css";
import recCard1 from "../images/assets/rec-card-1.avif";
import recCard2 from "../images/assets/rec-card-2.avif";
import recCard3 from "../images/assets/rec-card-3.avif";
import recCard4 from "../images/assets/rec-card-4.avif";
import recCard5 from "../images/assets/rec-card-5.avif";

const allProducts = {
  electronics: [
    { id: 1, img: recCard1, title: "iPhone 14 Pro Max", price: "4399.00", originalPrice: "5099", discount: "13% off" },
    { id: 2, img: recCard2, title: "Samsung Galaxy S23", price: "3599.00", originalPrice: "4299", discount: "16% off" },
    { id: 3, img: recCard3, title: "Sony Headphones", price: "499.00", originalPrice: "699", discount: "28% off" },
  ],
  men: [
    { id: 4, img: recCard4, title: "Men's Leather Jacket", price: "1299.00", originalPrice: "1599", discount: "19% off" },
    { id: 5, img: recCard5, title: "Nike Running Shoes", price: "899.00", originalPrice: "1099", discount: "18% off" },
  ],
};

const ProductsPage = () => {
  const { category } = useParams();
  const navigate = useNavigate();
  const { addToCart, updateQuantity, cartItems = [] } = useCart(); // Default cartItems to an empty array
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

  const handleAddToCart = (product) => {
    const existingCartItem = cartItems.find((item) => item.id === product.id);

    if (existingCartItem) {
      // If the product already exists in the cart, update its quantity
      updateQuantity(existingCartItem.uniqueId, existingCartItem.quantity + 1);
      toast.success(`${existingCartItem.quantity + 1} ${product.title} added to the cart`, {
        position: "top-center",
      });
    } else {
      // If it's a new product, add it to the cart with quantity 1
      addToCart({ ...product, quantity: 1, uniqueId: `${product.id}-${Date.now()}` });
      toast.success(`1 ${product.title} added to the cart`, {
        position: "top-center",
      });
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
            const cartItem = cartItems.find((item) => item.id === product.id) || { quantity: 0 };
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
