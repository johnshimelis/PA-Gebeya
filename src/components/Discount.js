import React, { useState, useEffect } from "react";
import "../styles/discount.css";
import { useNavigate } from "react-router-dom";
import { useCart } from "../components/CartContext";
import { toast } from "react-toastify";

const Discount = () => {
  const { addToCart, updateQuantity, cartItems } = useCart();
  const navigate = useNavigate();

  const [deals, setDeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDiscountedProducts = async () => {
      try {
        const response = await fetch("http://localhost:5000/api/products/discounted");
        if (!response.ok) throw new Error("Failed to fetch products");
        const data = await response.json();
        const filteredDeals = data.filter(product => product.hasDiscount && product.discount > 0);
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
    navigate("/product_detail", { state: { product: deal } });
  };

  const handleAddToCart = (deal) => {
    const existingCartItem = cartItems.find((item) => item._id === deal._id);

    if (existingCartItem) {
      updateQuantity(existingCartItem.uniqueId, existingCartItem.quantity + 1);
      toast.success(`${existingCartItem.quantity + 1} ${deal.name} added to the cart`, {
        position: "top-center",
      });
    } else {
      addToCart({ ...deal, quantity: 1, uniqueId: `${deal._id}-${Date.now()}` });
      toast.success(`1 ${deal.name} added to the cart`, {
        position: "top-center",
      });
    }
  };

  const handleQuantityChange = (productId, action) => {
    const productInCart = cartItems.find((item) => item._id === productId);

    if (productInCart) {
      const newQuantity = action === "increment" ? productInCart.quantity + 1 : productInCart.quantity - 1;
      updateQuantity(productInCart.uniqueId, newQuantity);
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
        {deals.map((deal) => {
          const cartItem = cartItems.find((item) => item._id === deal._id);
          const quantity = cartItem ? cartItem.quantity : 0;

          return (
            <div key={deal._id} className="nav-rec-cards">
              <div className="card-img" onClick={() => handleProductClick(deal)}>
                <img src={deal.image} alt={deal.name} />
              </div>
              
              {/* Product name */}
              <div className="card-title" onClick={() => handleProductClick(deal)}>
                {deal.name}
              </div>

              {/* Moved calculated price below product name */}
              <div className="calculated-price">ETB {deal.calculatedPrice}</div>

              {/* Original price and discount */}
              <div className="card-pricing">
  <span className="original-price">ETB {deal.originalPrice}</span>
  <span className="discount" style={{ marginLeft: "10px" }}>{deal.discount}%</span>
</div>


              <div className="card-bottom">
                <div className="card-counter">
                  <button
                    className="counter-btn"
                    disabled={quantity <= 0}
                    onClick={() => handleQuantityChange(deal._id, "decrement")}
                  >
                    -
                  </button>
                  <span className="counter-value">{quantity}</span>
                  <button
                    className="counter-btn"
                    onClick={() => handleQuantityChange(deal._id, "increment")}
                  >
                    +
                  </button>
                </div>
                <i
                  className="cart-icon fa fa-shopping-cart"
                  onClick={() => handleAddToCart(deal)}
                  style={{ cursor: "pointer" }}
                ></i>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default Discount;
