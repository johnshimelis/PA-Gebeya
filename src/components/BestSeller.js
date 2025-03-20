import React, { useState, useEffect } from "react";
import "../styles/recommended.css";
import { useNavigate } from "react-router-dom";

const BestSeller = () => {
  const navigate = useNavigate();
  const [deals, setDeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchBestSellers = async () => {
      try {
        const response = await fetch("https://pa-gebeya-backend.onrender.com/api/products/bestsellers");
        if (!response.ok) {
          throw new Error("Failed to fetch best-selling products");
        }
        const data = await response.json();
        setDeals(data);
        console.log("Fetched Product Details:", data); // Log fetched data to the console
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchBestSellers();
  }, []);

  const handleProductClick = (deal) => {
    // Store all product details, including rating and sold count, in localStorage
    const productDetails = {
      _id: deal._id,
      name: deal.name,
      category: deal.category,
      createdAt: deal.createdAt,
      fullDescription: deal.fullDescription,
      image: deal.image,
      photo: deal.photo,
      price: deal.price,
      shortDescription: deal.shortDescription,
      sold: deal.sold || 0, // Fallback to 0 if sold is not provided
      stockQuantity: deal.stockQuantity,
      updatedAt: deal.updatedAt,
      __v: deal.__v,
      rating: 5, // Assuming a fixed rating of 5 (as per your code)
    };

    localStorage.setItem("productDetail", JSON.stringify(productDetails));
    navigate("/product_detail", { state: { product: deal } });
  };

  const formatSoldCount = (sold) => {
    return `${Math.floor(sold / 10) * 10}+`;
  };

  if (loading) return <p>Loading best-selling products...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <section>
      <h4 style={{ margin: "60px 20px", textAlign: "left", fontSize: "35px", fontWeight: 1000 }}>
        Best Seller
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
                <span className="best-seller-tags">Best Seller</span>
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
                <span className="sold-count">| {formatSoldCount(deal.sold)} sold</span>
              </div>
              {/* Format the price to 2 decimal places */}
              <div className="card-price">ETB {deal.price.toFixed(2)}</div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default BestSeller;