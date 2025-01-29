import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import "../styles/product.css";
import recCard1 from "../images/assets/rec-card-1.avif";
import recCard2 from "../images/assets/rec-card-2.avif";
import recCard3 from "../images/assets/rec-card-3.avif";
import recCard4 from "../images/assets/rec-card-4.avif";
import recCard5 from "../images/assets/rec-card-5.avif";

const allProducts = {
  electronics: [
    { img: recCard1, title: "iPhone 14 Pro Max", price: "4399.00", originalPrice: "5099", discount: "13% off" },
    { img: recCard2, title: "Samsung Galaxy S23", price: "3599.00", originalPrice: "4299", discount: "16% off" },
    { img: recCard3, title: "Sony Headphones", price: "499.00", originalPrice: "699", discount: "28% off" },
  ],
  clothing: [
    { img: recCard4, title: "Men's Leather Jacket", price: "1299.00", originalPrice: "1599", discount: "19% off" },
    { img: recCard5, title: "Nike Running Shoes", price: "899.00", originalPrice: "1099", discount: "18% off" },
  ],
  home: [
    { img: recCard1, title: "Sofa Set", price: "1499.00", originalPrice: "1799", discount: "16% off" },
    { img: recCard2, title: "Table Lamp", price: "99.00", originalPrice: "129", discount: "23% off" },
  ],
  beauty: [
    { img: recCard3, title: "Perfume", price: "199.00", originalPrice: "249", discount: "20% off" },
    { img: recCard4, title: "Lipstick", price: "59.00", originalPrice: "79", discount: "25% off" },
  ],
  baby: [
    { img: recCard5, title: "Baby Stroller", price: "799.00", originalPrice: "899", discount: "11% off" },
    { img: recCard1, title: "Diaper Pack", price: "120.00", originalPrice: "150", discount: "20% off" },
  ],
  toys: [
    { img: recCard2, title: "Lego Set", price: "350.00", originalPrice: "399", discount: "12% off" },
    { img: recCard3, title: "Toy Car", price: "50.00", originalPrice: "80", discount: "38% off" },
  ],
};

const ProductsPage = () => {
  const { category } = useParams();
  const navigate = useNavigate();
  const products = allProducts[category] || [];

  const handleProductClick = (product) => {
    navigate("/product_detail", { state: { product } });
  };

  return (
    <section>
      <h2 style={{ margin: "40px 20px", textAlign: "left", fontSize: "28px", fontWeight: 900 }}>
        {category.toUpperCase()} Products
      </h2>
      <div className="nav-deals-main">
        {products.length > 0 ? (
          products.map((product, index) => (
            <div key={index} className="nav-rec-cards" onClick={() => handleProductClick(product)}>
              <div className="card-img"><img src={product.img} alt={product.title} /></div>
              <div className="card-title">{product.title}</div>
              <div className="card-price">AED {product.price}</div>
              <div className="card-pricing">
                <span className="original-price">AED {product.originalPrice}</span>
                <span className="discount">{product.discount}</span>
              </div>
              <button className="add-to-cart">Add to Cart</button>
            </div>
          ))
        ) : (
          <p style={{ textAlign: "center", fontSize: "18px" }}>No products available for this category.</p>
        )}
      </div>
    </section>
  );
};

export default ProductsPage;
