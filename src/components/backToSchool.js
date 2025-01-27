import React from "react";
import "../styles/backToSchool.css";
import bag1 from "../images/assets/bag-1.avif";
import bag2 from "../images/assets/bag-2.avif";
import bag3 from "../images/assets/bag-3.avif";
import bag4 from "../images/assets/bag-4.avif";
import bag5 from "../images/assets/bag-5.avif";
import expressIcon from "../images/assets/express.svg";

const BackToSchool = () => {
  const items = [
    { img: bag1, price: 43990.0, oldPrice: 5099, discount: "13% off" },
    { img: bag2, price: 43990.0, oldPrice: 5099, discount: "13% off" },
    { img: bag3, price: 43990.0, oldPrice: 5099, discount: "13% off" },
    { img: bag4, price: 43990.0, oldPrice: 5099, discount: "13% off" },
    { img: bag5, price: 43990.0, oldPrice: 5099, discount: "13% off" },
  ];

  return (
    <section>
      <div className="nav-view-all d-flex justify-content-between align-items-center">
        <h4
          style={{
            margin: "20px 0 0 25px",
            fontWeight: 700,
            padding: 0,
            color: "#404553",
          }}
        >
          Back To School: 30 - 70% off backpacks
        </h4>
        <div className="view-all-button">VIEW ALL</div>
      </div>

      <div className="nav-deals-main">
        {items.map((item, index) => (
          <div className="nav-rec-cards" style={{ backgroundColor: "#fafafa" }} key={index}>
            <div className="card-img">
              <img src={item.img} alt={`Bag ${index + 1}`} />
            </div>
            <div className="card-info">
              <div className="card-text">Apple iPhone 14 Pro Max 256GB Deep</div>
              <div className="card-price">
                <span style={{ fontSize: "10px", marginRight: "5px" }}>AED</span>
                <span style={{ fontSize: "18px", fontWeight: 700 }}>{item.price.toFixed(2)}</span>
              </div>
              <div className="card-off">
                <span
                  style={{
                    textDecoration: "line-through solid black",
                    fontSize: "10px",
                    marginRight: "5px",
                  }}
                >
                  {item.oldPrice}
                </span>
                <span style={{ fontWeight: 700, color: "green" }}>{item.discount}</span>
              </div>
              <div className="card-footer d-flex justify-content-between align-items-center mt-lg-5">
                <div className="card-express">
                  <img src={expressIcon} alt="Express Delivery" />
                </div>
                <div className="card-rating">
                  4.5 <i className="fa-solid fa-star"></i>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default BackToSchool;
