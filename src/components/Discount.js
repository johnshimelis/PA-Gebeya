import React from "react";
import "../styles/recommended.css";
import recCard1 from "../images/assets/rec-card-1.avif";
import recCard2 from "../images/assets/rec-card-2.avif";
import recCard3 from "../images/assets/rec-card-3.avif";
import recCard4 from "../images/assets/rec-card-4.avif";
import recCard5 from "../images/assets/rec-card-5.avif";
import { ShoppingCart } from "lucide-react";

const Discount = () => {
  const deals = [
    {
      img: recCard1,
      title: "Apple iPhone 14 Pro Max 256GB Deep",
      price: "43990.00",
      originalPrice: "5099",
      discount: "13% off",
    },
    {
      img: recCard2,
      title: "Apple iPhone 14 Pro Max 256GB Deep",
      price: "43990.00",
      originalPrice: "5099",
      discount: "13% off",
    },
    {
      img: recCard3,
      title: "Apple iPhone 14 Pro Max 256GB Deep",
      price: "43990.00",
      originalPrice: "5099",
      discount: "13% off",
    },
    {
      img: recCard4,
      title: "Apple iPhone 14 Pro Max 256GB Deep",
      price: "43990.00",
      originalPrice: "5099",
      discount: "13% off",
    },
    {
      img: recCard5,
      title: "Apple iPhone 14 Pro Max 256GB Deep",
      price: "43990.00",
      originalPrice: "5099",
      discount: "13% off",
    },
  ];

  return (
    <section>
      <h4 style={{ margin: "60px 20px", textAlign: "left", fontSize : "35px", fontWeight: 1000 }}>Discount</h4>
      <div id="rec" className="nav-deals-main">
  {deals.map((deal, index) => (
    <div key={index} className="nav-rec-cards">
      <div className="card-img">
        <img src={deal.img} alt={deal.title} />
      </div>
      <div className="card-title">{deal.title}</div>
      <div className="card-price">AED {deal.price}</div>
      <div className="card-pricing">
        <span className="original-price">AED {deal.originalPrice}</span>
        <span className="discount">{deal.discount}</span>
      </div>
      <div className="card-bottom">
        <div className="card-counter">
          <button className="counter-btn">-</button>
          <span className="counter-value">1</span>
          <button className="counter-btn">+</button>
        </div>
        <i className="cart-icon fa fa-shopping-cart"></i>
      </div>
    </div>
  ))}
</div>

    </section>
  );
};

export default Discount;
