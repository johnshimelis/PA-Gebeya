import React from 'react';
import "../styles/recommended.css"; // Assuming you have a CSS file for styling
import recCard1 from '../images/assets/rec-card-1.avif'; // Importing the images
import recCard2 from '../images/assets/rec-card-2.avif';
import recCard3 from '../images/assets/rec-card-3.avif';
import recCard4 from '../images/assets/rec-card-4.avif';
import recCard5 from '../images/assets/rec-card-5.avif';
import expressIcon from '../images/assets/express.svg';  // Importing the express icon

// Import other images similarly

const RecommendedDeals = () => {
  const deals = [
    {
      img: recCard1, // Using the imported image
      title: "Apple iPhone 14 Pro Max 256GB Deep",
      price: "43990.00",
      originalPrice: "5099",
      discount: "13% off",
      rating: 4.5,
    },
    {
      img: recCard2, // Using the imported image
      title: "Apple iPhone 14 Pro Max 256GB Deep",
      price: "43990.00",
      originalPrice: "5099",
      discount: "13% off",
      rating: 4.5,
    },
    {
      img: recCard3, // Using the imported image
      title: "Apple iPhone 14 Pro Max 256GB Deep",
      price: "43990.00",
      originalPrice: "5099",
      discount: "13% off",
      rating: 4.5,
    },
    {
        img:  recCard4,
        title: "Apple iPhone 14 Pro Max 256GB Deep",
        price: "43990.00",
        originalPrice: "5099",
        discount: "13% off",
        rating: 4.5,
      },
      {
        img:  recCard5,
        title: "Apple iPhone 14 Pro Max 256GB Deep",
        price: "43990.00",
        originalPrice: "5099",
        discount: "13% off",
        rating: 4.5,
      },
  ];

  return (
    <section>
      <h4 style={{ margin: "70px 1000px 20px 0px", fontWeight: 700, padding: "0%" }}>
        Recommended for you
      </h4>
      <div id="rec" className="nav-deals-main" style={{ backgroundColor: "#f1f4fd", padding: "10px" }}>
        {deals.map((deal, index) => (
          <div key={index} className="nav-rec-cards">
            <div className="card-img">
              <img src={deal.img} alt={deal.title} />
            </div>
            <div className="card-info">
              <div className="card-text">{deal.title}</div>
              <div className="card-price">
                <span style={{ fontSize: "10px", marginRight: "5px" }}>AED </span>
                <span style={{ fontSize: "18px", fontWeight: 700 }}>{deal.price}</span>
              </div>
              <div className="card-off">
                <span
                  style={{
                    textDecoration: "line-through solid black",
                    fontSize: "10px",
                    marginRight: "5px",
                  }}
                >
                  {deal.originalPrice}
                </span>
                <span style={{ fontWeight: 700, color: "green" }}> {deal.discount}</span>
              </div>
              <div className="card-footer d-flex justify-content-between align-items-center mt-lg-5">
                <div className="card-express">
                  <img src={expressIcon} alt="Express" />
                </div>
                <div className="card-ratting">
                  {deal.rating} <i className="fa-solid fa-star"></i>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default RecommendedDeals;
