  import React, { useState, useEffect } from "react";
  import "../styles/discount.css";
  import { useNavigate } from "react-router-dom";
  import { useCart } from "../components/CartContext";
  import { toast } from "react-toastify";
  import axios from "axios";

  const Discount = () => {
    const { addToCart, cartItems, setCartItems } = useCart();
    const navigate = useNavigate();

    const [deals, setDeals] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
      const fetchDiscountedProducts = async () => {
        try {
          const response = await axios.get("https://pa-gebeya-backend.onrender.com/api/products/discounted");
          if (response.status !== 200) throw new Error("Failed to fetch products");
          const filteredDeals = response.data.filter(product => product.hasDiscount && product.discount > 0);
          setDeals(filteredDeals);
        } catch (err) {
          setError(err.message);
        } finally {
          setLoading(false);
        }
      };

      fetchDiscountedProducts();
    }, []);

    const handleProductClick = (deal) => {
      const productDetails = {
        _id: deal._id,
        name: deal.name,
        category: deal.category,
        createdAt: deal.createdAt,
        discount: deal.discount,
        fullDescription: deal.fullDescription,
        hasDiscount: deal.hasDiscount,
        image: deal.image,
        photo: deal.photo,
        price: deal.price,
        shortDescription: deal.shortDescription,
        sold: deal.sold || 0, // Fallback to 0 if sold is not provided
        stockQuantity: deal.stockQuantity,
        updatedAt: deal.updatedAt,
        __v: deal.__v,
      };

      // Store calculated price, original price, and discount in localStorage
      const calculatedPrice = (deal.price - (deal.price * deal.discount) / 100).toFixed(2);
      localStorage.setItem("calculatedPrice", calculatedPrice);
      localStorage.setItem("originalPrice", deal.price);
      localStorage.setItem("discount", deal.discount);

      // Store product details in localStorage
      localStorage.setItem("productDetail", JSON.stringify(productDetails));
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
        quantity: 1,
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

          setCartItems(updatedCart.data.items);
        } else {
          throw new Error("Failed to add item to cart");
        }
      } catch (error) {
        console.error("Error adding to cart:", error);
        toast.error(error.message);
      }
    };

    if (loading) return <p>Loading discounted products...</p>;
    if (error) return <p>Error: {error}</p>;

    return (
      <section>
        <h4 style={{ margin: "60px 20px", textAlign: "left", fontSize: "35px", fontWeight: 1000 }}>
          Discount
        </h4>
        <div id="rec" className="nav-deals-main">
          {deals.map((deal) => (
            <div key={deal._id} className="nav-rec-cards" onClick={() => handleProductClick(deal)}>
              <div className="card-img">
                <img
                  src={deal.image.replace(
                    "https://pa-gebeya-backend.onrender.com",
                    "https://pa-gebeya-backend.onrender.com"
                  )}
                  alt={deal.name}
                />
              </div>
              <div className="card-content">
  <div className="card-header">
    {/* Display "Discount" tag before the product name */}
    <span className="discount-tag">Discount</span>
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
    <span className="sold-count">| {deal.sold || 0}{deal.sold > 0 ? "+" : ""} sold</span>
  </div>
  <div className="card-pricing">
    <span className="calculated-price">ETB {(deal.price - (deal.price * deal.discount) / 100).toFixed(2)}</span>
    <span className="original-price">ETB {deal.price}</span>
    <span className="discount">{deal.discount}% OFF</span>
  </div>
</div>
            </div>
          ))}
        </div>
      </section>
    );
  };

  export default Discount;